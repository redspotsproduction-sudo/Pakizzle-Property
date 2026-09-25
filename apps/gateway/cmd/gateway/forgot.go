package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/auth"
	gwlog "github.com/redspotsproduction-sudo/pakizzle/gateway/internal/logger"
	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/ratelimit"
)

// ── POST /api/auth/forgot/start ─────────────────────────────────────────────
// Sends a 6-digit reset code via SES. Always returns 200 to prevent account
// enumeration — the body shape is identical whether the account exists or not.

type forgotStartReq struct {
	Email string `json:"email"`
}

func (s *server) forgotStart(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	ip := ratelimit.ClientIP(r)
	if allowed, _, retrySec := s.limiter.Allow("forgot:start:ip:"+ip, 5, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many reset requests from this IP; please wait")
		return
	}

	var in forgotStartReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || !isValidEmail(in.Email) {
		writeError(w, http.StatusBadRequest, "validation", "valid email required")
		return
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	emailRedacted := redactEmail(email)

	// Same rate-limit policy as email verification OTP.
	var recent, hourly int
	if err := s.pool.QueryRow(r.Context(), `
		SELECT
		  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '60 seconds'),
		  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour')
		FROM otp_codes WHERE purpose='password_reset' AND target=$1`,
		email).Scan(&recent, &hourly); err != nil {
		log.Warn("forgot.rate_check failed", "email", emailRedacted, "err", err)
	} else if recent > 0 || hourly >= 5 {
		w.Header().Set("Retry-After", "60")
		writeError(w, http.StatusTooManyRequests, "rate_limited",
			"please wait a minute before requesting another code")
		return
	}

	// Look up the user, but always return 200 so callers can't enumerate.
	u, err := s.users.GetByEmail(r.Context(), email)
	if err != nil {
		log.Error("forgot.lookup failed", "email", emailRedacted, "err", err)
		// Still pretend success so we don't leak DB issues either.
		writeJSON(w, http.StatusOK, map[string]any{"success": true})
		return
	}
	if u == nil {
		log.Info("forgot.no_account", "email", emailRedacted)
		writeJSON(w, http.StatusOK, map[string]any{"success": true})
		return
	}

	code, err := randomCode6()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "rng", "could not generate code")
		return
	}
	codeHash := sha256Hex(code)
	expires := time.Now().Add(15 * time.Minute)

	if _, err := s.pool.Exec(r.Context(),
		`UPDATE otp_codes SET consumed_at = NOW() WHERE purpose='password_reset' AND target=$1 AND consumed_at IS NULL`,
		email); err != nil {
		log.Warn("forgot.invalidate_prior failed", "email", emailRedacted, "err", err)
	}
	if _, err := s.pool.Exec(r.Context(),
		`INSERT INTO otp_codes (purpose, target, code_hash, expires_at) VALUES ('password_reset', $1, $2, $3)`,
		email, codeHash, expires); err != nil {
		log.Error("forgot.insert failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not store reset code")
		return
	}
	log.Info("forgot.created", "email", emailRedacted, "ttl_minutes", 15)

	// Fire mail off the request path. Failures bubble up only in dev.
	reqID := gwlog.RequestIDFrom(r.Context())
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		mailLog := slog.Default().With("request_id", reqID, "user_id", u.ID, "purpose", "password_reset")
		t0 := time.Now()
		if err := s.mail.Send(ctx, email, "Reset your Pakizzle password",
			passwordResetEmailHTML(code), passwordResetEmailText(code)); err != nil {
			mailLog.Warn("ses.send failed",
				"err", err,
				"duration_ms", time.Since(t0).Milliseconds(),
				"to", emailRedacted,
			)
			return
		}
		mailLog.Info("ses.send ok",
			"duration_ms", time.Since(t0).Milliseconds(),
			"to", emailRedacted,
		)
	}()
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── POST /api/auth/forgot/reset ─────────────────────────────────────────────
// Verifies the OTP and replaces the password atomically. Returns a fresh JWT
// so the caller can log in immediately without a round trip to /login.

type forgotResetReq struct {
	Email       string `json:"email"`
	Code        string `json:"code"`
	NewPassword string `json:"newPassword"`
}

func (s *server) forgotReset(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	ip := ratelimit.ClientIP(r)
	if allowed, _, retrySec := s.limiter.Allow("forgot:reset:ip:"+ip, 5, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many reset attempts from this IP; please wait 15 minutes")
		return
	}

	var in forgotResetReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	code := strings.TrimSpace(in.Code)
	emailRedacted := redactEmail(email)
	if !isValidEmail(email) || len(code) != 6 || len(in.NewPassword) < 8 {
		writeError(w, http.StatusBadRequest, "validation", "email, 6-digit code, and 8+ character password required")
		return
	}

	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		log.Error("forgot.reset begin tx failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "reset temporarily unavailable")
		return
	}
	defer tx.Rollback(r.Context()) //nolint:errcheck

	var id int64
	var hash string
	var expires time.Time
	var attempts int
	err = tx.QueryRow(r.Context(),
		`SELECT id, code_hash, expires_at, attempts
		   FROM otp_codes
		  WHERE purpose='password_reset' AND target=$1 AND consumed_at IS NULL
		  ORDER BY id DESC LIMIT 1
		  FOR UPDATE`, email).
		Scan(&id, &hash, &expires, &attempts)
	if err != nil {
		log.Info("forgot.reset no_pending", "email", emailRedacted, "err", err)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if time.Now().After(expires) {
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if attempts >= 5 {
		writeError(w, http.StatusTooManyRequests, "too_many", "too many attempts; request a new code")
		return
	}
	if sha256Hex(code) != hash {
		if _, uerr := tx.Exec(r.Context(),
			`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, id); uerr != nil {
			log.Warn("forgot.reset attempts bump failed", "err", uerr)
		}
		_ = tx.Commit(r.Context())
		log.Warn("forgot.reset wrong code", "email", emailRedacted, "otp_id", id, "attempts", attempts+1)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}

	newHash, err := auth.BcryptHash(in.NewPassword)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "hash", "could not hash password")
		return
	}
	if _, err := tx.Exec(r.Context(),
		`UPDATE otp_codes SET consumed_at = NOW() WHERE id = $1`, id); err != nil {
		log.Error("forgot.reset consume failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "reset temporarily unavailable")
		return
	}
	cmd, err := tx.Exec(r.Context(),
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
		newHash, email)
	if err != nil {
		log.Error("forgot.reset user update failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "reset temporarily unavailable")
		return
	}
	if cmd.RowsAffected() == 0 {
		// Email had a pending OTP but the user is gone (deleted between issue and reset).
		log.Warn("forgot.reset user disappeared", "email", emailRedacted)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		log.Error("forgot.reset commit failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "reset temporarily unavailable")
		return
	}

	// Hand back a fresh token so the UI can drop the user straight into the app.
	u, err := s.users.GetByEmail(r.Context(), email)
	if err != nil || u == nil {
		log.Error("forgot.reset post-lookup failed", "email", emailRedacted, "err", err)
		writeJSON(w, http.StatusOK, map[string]any{"success": true})
		return
	}
	tok, _ := s.signer.Sign(u.ID, u.Email, u.Role, 24*time.Hour)
	log.Info("forgot.reset success", "user_id", u.ID, "email", emailRedacted)
	writeJSON(w, http.StatusOK, authResp{Token: tok, User: u.public()})
}

// ── templates ──────────────────────────────────────────────────────────────

func passwordResetEmailHTML(code string) string {
	return fmt.Sprintf(`<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f7;padding:24px">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden">
  <tr><td style="padding:32px 32px 0">
    <div style="font-size:24px;font-weight:700;letter-spacing:-0.02em">Pakizzle<span style="color:#007AFF">.</span></div>
  </td></tr>
  <tr><td style="padding:24px 32px 32px">
    <h1 style="font-size:24px;line-height:1.15;margin:0 0 12px;letter-spacing:-0.02em">Reset your password</h1>
    <p style="color:#6e6e73;font-size:15px;line-height:1.55;margin:0 0 20px">
      Enter this code on the password-reset page to choose a new password. It expires in 15 minutes.
    </p>
    <div style="background:#f5f5f7;border-radius:16px;padding:24px;text-align:center;font-size:36px;font-weight:700;letter-spacing:0.4em">%s</div>
    <p style="color:#6e6e73;font-size:13px;line-height:1.55;margin:24px 0 0">
      Didn't request this? Your account is fine — you can safely ignore this email.
    </p>
  </td></tr>
  <tr><td style="padding:0 32px 32px;color:#aaa;font-size:11px;border-top:1px solid #f0f0f0;margin-top:24px">
    © 2026 Pakizzle · Redspots Production
  </td></tr>
</table>
</body></html>`, code)
}

func passwordResetEmailText(code string) string {
	return fmt.Sprintf("Your Pakizzle password-reset code: %s\n\nExpires in 15 minutes. If you didn't request this, ignore the email.\n", code)
}

// keep imports tidy as this file grows
var _ = errors.New
var _ = pgx.ErrNoRows
