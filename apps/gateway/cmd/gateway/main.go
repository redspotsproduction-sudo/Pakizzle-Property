package main

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"math/big"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/auth"
	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/config"
	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/db"
	gwlog "github.com/redspotsproduction-sudo/pakizzle/gateway/internal/logger"
	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/ratelimit"
)

// Precomputed dummy bcrypt hash (cost 12) for constant-time email enumeration defense
var dummyBcryptHash, _ = auth.BcryptHash("dummy-timing-mitigation-hash")

//go:embed migrations/*.sql
var migrationsFS embed.FS

func main() {
	logger := gwlog.New()
	slog.SetDefault(logger)

	logger.Info("boot",
		"version", os.Getenv("APP_VERSION"),
		"go_version", runtime.Version(),
	)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("config load failed", "err", err)
		os.Exit(1)
	}
	logger.Info("config loaded",
		"env", cfg.Env,
		"port", cfg.Port,
		"ai_service_url", cfg.AIServiceURL,
		"ses_region", cfg.SESRegion,
		"ses_from", cfg.SESFromEmail,
		"db_configured", cfg.DatabaseURL != "",
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("db connect", "err", err)
		os.Exit(1)
	}
	logger.Info("db connected")

	if err := applyMigrations(ctx, pool); err != nil {
		logger.Warn("migrations", "err", err)
	}

	mailer := newSESMailer(cfg.SESRegion, cfg.SESFromEmail, logger)
	signer := auth.NewSigner(cfg.JWTSecret)
	limiter := ratelimit.New()

	srv := &server{
		cfg:     cfg,
		pool:    pool,
		signer:  signer,
		log:     logger,
		users:   newUserStore(pool),
		mail:    mailer,
		limiter: limiter,
	}
	srv.bootstrapAdmin(ctx)

	r := chi.NewRouter()
	r.Use(middleware.RealIP)
	r.Use(gwlog.HTTP(logger))
	r.Use(securityHeaders)

	// Strict CORS: Allow only trusted frontend origins, forbid wildcards
	r.Use(cors.Handler(cors.Options{
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			if origin == "" {
				return true
			}
			o := strings.ToLower(origin)
			return strings.HasPrefix(o, "http://localhost:") ||
				strings.HasPrefix(o, "http://127.0.0.1:") ||
				strings.HasSuffix(o, ".amsterdamhostel.cloud") ||
				strings.HasSuffix(o, ".pakizzle.com") ||
				o == "https://pakizzle.com" ||
				strings.HasSuffix(o, ".run.app")
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Fb-Uid"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Max request body size: 10MB default
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
			next.ServeHTTP(w, r)
		})
	})

	// General rate limit: 120 req/min per IP
	r.Use(srv.generalRateLimit)

	r.Get("/healthz", srv.healthz)
	r.Get("/api/ping", srv.ping)

	// auth
	r.Post("/api/auth/register", srv.register)
	r.Post("/api/auth/login", srv.login)
	r.Post("/api/auth/forgot/start", srv.forgotStart)
	r.Post("/api/auth/forgot/reset", srv.forgotReset)
	r.With(srv.requireAuth).Get("/api/auth/me", srv.me)

	// otp
	r.Post("/api/otp/email/send", srv.sendEmailOTP)
	r.Post("/api/otp/email/verify", srv.verifyEmailOTP)

	// profile
	r.With(srv.requireAuth).Get("/api/profile", srv.getProfile)
	r.With(srv.requireAuth).Patch("/api/profile", srv.updateProfile)

	// "me" — customer dashboard endpoints
	r.With(srv.requireAuth).Get("/api/me/listings", srv.myListings)
	r.With(srv.requireAuth).Get("/api/me/analytics", srv.myAnalytics)
	r.With(srv.requireAuth).Get("/api/me/wishlist", srv.myWishlist)
	r.With(srv.requireAuth).Post("/api/me/wishlist", srv.addWishlist)
	r.With(srv.requireAuth).Delete("/api/me/wishlist/{id}", srv.removeWishlist)
	r.With(srv.requireAuth).Get("/api/me/notifications", srv.myNotifications)

	// catalogue
	r.Get("/api/makes", srv.listMakes)
	r.Get("/api/models", srv.listModels)
	r.Get("/api/variants", srv.listVariants)

	// listings
	r.Get("/api/listings", srv.listListings)
	r.With(srv.requireAuth).Post("/api/listings", srv.createListing)
	r.Get("/api/listings/{id}", srv.getListing)

	// homepage content (banners / category tiles / news)
	r.Get("/api/banners", srv.listBanners)
	r.Get("/api/showcase-categories", srv.listShowcaseCategories)
	r.Get("/api/news", srv.listNews)

	// ── admin (role='admin' required) ─────────────────────────────────────
	r.Route("/api/admin", func(ar chi.Router) {
		ar.Use(srv.requireAdmin)

		ar.Get("/stats", srv.adminStats)

		// users
		ar.Get("/users", srv.adminListUsers)
		ar.Patch("/users/{id}", srv.adminUpdateUser)

		// listings
		ar.Get("/listings", srv.adminListListings)
		ar.Patch("/listings/{id}/status", srv.adminListingStatus)
		ar.Delete("/listings/{id}", srv.adminDeleteListing)

		// homepage content
		ar.Get("/banners", srv.adminListBanners)
		ar.Post("/banners", srv.adminCreateBanner)
		ar.Patch("/banners/{id}", srv.adminUpdateBanner)
		ar.Delete("/banners/{id}", srv.adminDeleteBanner)

		ar.Get("/showcase-categories", srv.adminListShowcase)
		ar.Post("/showcase-categories", srv.adminCreateShowcase)
		ar.Patch("/showcase-categories/{id}", srv.adminUpdateShowcase)
		ar.Delete("/showcase-categories/{id}", srv.adminDeleteShowcase)

		// vehicle data
		ar.Get("/makes", srv.adminListMakes)
		ar.Post("/makes", srv.adminCreateMake)
		ar.Patch("/makes/{id}", srv.adminUpdateMake)
		ar.Delete("/makes/{id}", srv.adminDeleteMake)

		ar.Get("/models", srv.adminListModels)
		ar.Post("/models", srv.adminCreateModel)
		ar.Patch("/models/{id}", srv.adminUpdateModel)
		ar.Delete("/models/{id}", srv.adminDeleteModel)

		ar.Get("/variants", srv.adminListVariants)
		ar.Post("/variants", srv.adminCreateVariant)
		ar.Patch("/variants/{id}", srv.adminUpdateVariant)
		ar.Delete("/variants/{id}", srv.adminDeleteVariant)

		// dealers / payments / reports / pricing / pages / fields / verifications
		ar.Get("/dealers", srv.adminListDealers)
		ar.Get("/payments", srv.adminListPayments)
		ar.Get("/reports", srv.adminListReports)
		ar.Get("/pricing-plans", srv.adminListPricing)
		ar.Get("/content-pages", srv.adminListPages)
		ar.Post("/content-pages", srv.adminUpsertPage)
		ar.Get("/custom-fields", srv.adminListCustomFields)
		ar.Get("/auction-verifications", srv.adminListAuctionVerifications)

		// request CRMs
		ar.Get("/inspections", srv.adminListRequests("inspection_requests"))
		ar.Patch("/inspections/{id}", srv.adminUpdateRequestStatus("inspection_requests"))
		ar.Get("/insurance", srv.adminListRequests("insurance_requests"))
		ar.Patch("/insurance/{id}", srv.adminUpdateRequestStatus("insurance_requests"))
		ar.Get("/financing", srv.adminListRequests("financing_requests"))
		ar.Patch("/financing/{id}", srv.adminUpdateRequestStatus("financing_requests"))

		// audit + settings
		ar.Get("/audit", srv.adminListAudit)
		ar.Get("/settings", srv.adminListSettings)
		ar.Post("/settings", srv.adminUpsertSetting)
	})

	hs := &http.Server{Addr: ":" + cfg.Port, Handler: r, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		logger.Info("listening", "addr", hs.Addr, "env", cfg.Env)
		if err := hs.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("listen", "err", err)
			os.Exit(1)
		}
	}()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	<-sigs
	logger.Info("shutting down")
	shutCtx, shutCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutCancel()
	_ = hs.Shutdown(shutCtx)
	pool.Close()
}

type server struct {
	cfg     *config.Config
	pool    *pgxpool.Pool
	signer  *auth.Signer
	log     *slog.Logger
	users   *userStore
	mail    Mailer
	limiter *ratelimit.Limiter
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'")
		next.ServeHTTP(w, r)
	})
}

func (s *server) generalRateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := ratelimit.ClientIP(r)
		allowed, _, retrySec := s.limiter.Allow("api:general:"+ip, 120, time.Minute)
		if !allowed {
			ratelimit.WriteRateLimited(w, retrySec, "too many requests; please slow down")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ── migrations ──────────────────────────────────────────────────────────────

func applyMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	entries, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)
	for _, f := range files {
		data, err := migrationsFS.ReadFile("migrations/" + f)
		if err != nil {
			return fmt.Errorf("read %s: %w", f, err)
		}
		if _, err := pool.Exec(ctx, string(data)); err != nil {
			return fmt.Errorf("apply %s: %w", f, err)
		}
	}
	return nil
}

// ── liveness ────────────────────────────────────────────────────────────────

func (s *server) healthz(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"env":  s.cfg.Env,
		"time": time.Now().UTC(),
		"db":   db.Healthy(r.Context(), s.pool),
	})
}

func (s *server) ping(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"pong": true, "time": time.Now().UTC()})
}

// ── auth ────────────────────────────────────────────────────────────────────

type registerReq struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResp struct {
	Token string         `json:"token"`
	User  map[string]any `json:"user"`
}

func (s *server) register(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	ip := ratelimit.ClientIP(r)
	if allowed, _, retrySec := s.limiter.Allow("auth:register:"+ip, 5, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many registration attempts; please wait 15 minutes")
		return
	}

	var in registerReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		log.Warn("auth.register decode failed", "err", err)
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	emailClean := strings.ToLower(strings.TrimSpace(in.Email))
	emailRedacted := redactEmail(emailClean)
	if !isValidEmail(emailClean) || len(in.Password) < 8 {
		log.Warn("auth.register validation failed",
			"email", emailRedacted,
			"reason", "invalid email or short password",
		)
		writeError(w, http.StatusBadRequest, "validation", "valid email + 8-char password required")
		return
	}
	hash, err := auth.BcryptHash(in.Password)
	if err != nil {
		log.Error("auth.register bcrypt failed", "err", err)
		writeError(w, http.StatusInternalServerError, "hash", "could not hash password")
		return
	}
	u, err := s.users.Create(r.Context(), strings.TrimSpace(in.FullName), emailClean, hash)
	if err != nil {
		log.Warn("auth.register create_user failed", "email", emailRedacted, "err", err)
		if errors.Is(err, ErrEmailTaken) {
			writeError(w, http.StatusConflict, "email_taken", "an account with that email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "db", "could not create user")
		return
	}
	tok, _ := s.signer.Sign(u.ID, u.Email, u.Role, 24*time.Hour)

	log.Info("auth.register success",
		"user_id", u.ID,
		"email", emailRedacted,
		"role", u.Role,
	)

	// Fire-and-forget welcome email so signup never blocks on SES.
	reqID := gwlog.RequestIDFrom(r.Context())
	go func() {
		ctx, c := context.WithTimeout(context.Background(), 10*time.Second)
		defer c()
		mailLog := slog.Default().With("request_id", reqID, "user_id", u.ID, "purpose", "welcome")
		t0 := time.Now()
		if err := s.mail.Send(ctx, u.Email, "Welcome to Pakizzle",
			welcomeEmailHTML(u.FullName), welcomeEmailText(u.FullName)); err != nil {
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

	writeJSON(w, http.StatusOK, authResp{Token: tok, User: u.public()})
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (s *server) login(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	ip := ratelimit.ClientIP(r)
	if allowed, _, retrySec := s.limiter.Allow("auth:login:ip:"+ip, 10, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many login attempts from this IP; please wait 15 minutes")
		return
	}

	var in loginReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		log.Warn("auth.login decode failed", "err", err)
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	emailClean := strings.ToLower(strings.TrimSpace(in.Email))
	emailRedacted := redactEmail(emailClean)
	if allowed, _, retrySec := s.limiter.Allow("auth:login:acct:"+emailClean, 5, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many login attempts for this account; please wait 15 minutes")
		return
	}

	if !isValidEmail(emailClean) || in.Password == "" {
		log.Info("auth.login validation failed", "email", emailRedacted)
		writeError(w, http.StatusUnauthorized, "auth", "invalid email or password")
		return
	}
	u, err := s.users.GetByEmail(r.Context(), emailClean)
	if err != nil {
		log.Error("auth.login db lookup failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "login temporarily unavailable")
		return
	}
	// Constant-time mitigation against timing oracle for user enumeration
	if u == nil {
		_ = auth.BcryptCompare(dummyBcryptHash, in.Password)
		log.Info("auth.login user not found", "email", emailRedacted)
		writeError(w, http.StatusUnauthorized, "auth", "invalid email or password")
		return
	}
	if !auth.BcryptCompare(u.PasswordHash, in.Password) {
		log.Warn("auth.login bad password", "user_id", u.ID, "email", emailRedacted)
		writeError(w, http.StatusUnauthorized, "auth", "invalid email or password")
		return
	}
	tok, _ := s.signer.Sign(u.ID, u.Email, u.Role, 24*time.Hour)
	log.Info("auth.login success", "user_id", u.ID, "email", emailRedacted, "role", u.Role)
	writeJSON(w, http.StatusOK, authResp{Token: tok, User: u.public()})
}

func (s *server) me(w http.ResponseWriter, r *http.Request) {
	c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	if !ok || c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	u, err := s.users.GetByID(r.Context(), c.UserID)
	if err != nil || u == nil {
		writeError(w, http.StatusNotFound, "not_found", "user not found")
		return
	}
	writeJSON(w, http.StatusOK, u.public())
}

// ── OTP (email) ─────────────────────────────────────────────────────────────

type sendOTPReq struct{ Email string `json:"email"` }
type verifyOTPReq struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

func (s *server) sendEmailOTP(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	ip := ratelimit.ClientIP(r)
	if allowed, _, retrySec := s.limiter.Allow("otp:email:ip:"+ip, 5, 15*time.Minute); !allowed {
		ratelimit.WriteRateLimited(w, retrySec, "too many OTP requests from this IP; please wait")
		return
	}

	var in sendOTPReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || !isValidEmail(in.Email) {
		log.Warn("otp.send_email validation failed", "email", redactEmail(in.Email), "err", err)
		writeError(w, http.StatusBadRequest, "validation", "valid email required")
		return
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	emailRedacted := redactEmail(email)

	// Rate limit: refuse if we've issued a code in the last 60s, and cap
	// at 5 sends per hour for the same address. Prevents OTP spam / SES abuse.
	var recent int
	var hourly int
	if err := s.pool.QueryRow(r.Context(), `
		SELECT
		  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '60 seconds'),
		  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour')
		FROM otp_codes WHERE purpose='email' AND target=$1`,
		email).Scan(&recent, &hourly); err != nil {
		log.Warn("otp.rate_check failed", "email", emailRedacted, "err", err)
	} else if recent > 0 || hourly >= 5 {
		log.Info("otp.rate_limited",
			"email", emailRedacted, "recent_60s", recent, "last_1h", hourly,
		)
		w.Header().Set("Retry-After", "60")
		writeError(w, http.StatusTooManyRequests, "rate_limited",
			"please wait a minute before requesting another code")
		return
	}

	code, err := randomCode6()
	if err != nil {
		log.Error("otp.send_email rng failed", "err", err)
		writeError(w, http.StatusInternalServerError, "rng", "could not generate code")
		return
	}
	codeHash := sha256Hex(code)
	expires := time.Now().Add(10 * time.Minute)

	if _, err := s.pool.Exec(r.Context(),
		`UPDATE otp_codes SET consumed_at = NOW() WHERE purpose = 'email' AND target = $1 AND consumed_at IS NULL`,
		email); err != nil {
		log.Warn("otp.invalidate_prior failed", "email", emailRedacted, "err", err)
	}
	if _, err := s.pool.Exec(r.Context(),
		`INSERT INTO otp_codes (purpose, target, code_hash, expires_at) VALUES ('email', $1, $2, $3)`,
		email, codeHash, expires); err != nil {
		log.Error("otp.insert failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not store verification code")
		return
	}
	log.Info("otp.created", "email", emailRedacted, "ttl_minutes", 10)

	t0 := time.Now()
	if err := s.mail.Send(r.Context(), email, "Your Pakizzle verification code",
		otpEmailHTML(code), otpEmailText(code)); err != nil {
		log.Warn("ses.send failed",
			"to", emailRedacted, "purpose", "otp",
			"duration_ms", time.Since(t0).Milliseconds(),
			"err", err,
		)
		if !s.cfg.IsProduction() {
			writeJSON(w, http.StatusOK, map[string]any{"success": true, "demoCode": code, "ses": "failed"})
			return
		}
		writeError(w, http.StatusBadGateway, "email_send", "could not send verification email")
		return
	}
	log.Info("ses.send ok",
		"to", emailRedacted, "purpose", "otp",
		"duration_ms", time.Since(t0).Milliseconds(),
	)
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) verifyEmailOTP(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	var in verifyOTPReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	code := strings.TrimSpace(in.Code)
	emailRedacted := redactEmail(email)
	if !isValidEmail(email) || len(code) != 6 {
		writeError(w, http.StatusBadRequest, "validation", "email + 6-digit code required")
		return
	}

	// Single transaction with row-level lock prevents two concurrent verifies
	// from both succeeding (race) or from racing attempts++ vs consume.
	// All non-success cases return one generic message so we don't leak whether
	// the email is registered, the OTP exists, or the code is wrong.
	tx, err := s.pool.Begin(r.Context())
	if err != nil {
		log.Error("otp.verify begin tx failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "verification temporarily unavailable")
		return
	}
	defer tx.Rollback(r.Context()) //nolint:errcheck // best-effort on early returns

	var id int64
	var hash string
	var expires time.Time
	var attempts int
	err = tx.QueryRow(r.Context(),
		`SELECT id, code_hash, expires_at, attempts
		   FROM otp_codes
		  WHERE purpose='email' AND target=$1 AND consumed_at IS NULL
		  ORDER BY id DESC LIMIT 1
		  FOR UPDATE`, email).
		Scan(&id, &hash, &expires, &attempts)
	if err != nil {
		log.Info("otp.verify no_pending", "email", emailRedacted, "err", err)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if time.Now().After(expires) {
		log.Info("otp.verify expired", "email", emailRedacted, "otp_id", id)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if attempts >= 5 {
		log.Warn("otp.verify too_many", "email", emailRedacted, "otp_id", id)
		writeError(w, http.StatusTooManyRequests, "too_many", "too many attempts; request a new code")
		return
	}
	if sha256Hex(code) != hash {
		if _, uerr := tx.Exec(r.Context(),
			`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, id); uerr != nil {
			log.Warn("otp.verify attempts bump failed", "err", uerr)
		}
		if cerr := tx.Commit(r.Context()); cerr != nil {
			log.Warn("otp.verify attempts commit failed", "err", cerr)
		}
		log.Warn("otp.verify wrong code",
			"email", emailRedacted, "otp_id", id, "attempts", attempts+1,
		)
		writeError(w, http.StatusBadRequest, "invalid_code", "invalid or expired code")
		return
	}
	if _, err := tx.Exec(r.Context(),
		`UPDATE otp_codes SET consumed_at = NOW() WHERE id = $1`, id); err != nil {
		log.Error("otp.verify consume failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "verification temporarily unavailable")
		return
	}
	if _, err := tx.Exec(r.Context(),
		`UPDATE users SET email_verified = TRUE,
		                  badge = CASE WHEN phone_verified THEN 'basic' ELSE badge END,
		                  updated_at = NOW()
		  WHERE email = $1`, email); err != nil {
		log.Error("otp.verify user update failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "verification temporarily unavailable")
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		log.Error("otp.verify commit failed", "email", emailRedacted, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "verification temporarily unavailable")
		return
	}
	log.Info("otp.verify success", "email", emailRedacted)
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "emailVerified": true})
}

// ── profile ─────────────────────────────────────────────────────────────────

func (s *server) getProfile(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	if !ok || c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	var p struct {
		DisplayName *string `json:"displayName"`
		City        *string `json:"city"`
		AvatarURL   *string `json:"avatarUrl"`
		Bio         *string `json:"bio"`
		WhatsApp    *string `json:"whatsapp"`
	}
	err := s.pool.QueryRow(r.Context(),
		`SELECT display_name, city, avatar_url, bio, whatsapp FROM profiles WHERE user_id = $1`,
		c.UserID).Scan(&p.DisplayName, &p.City, &p.AvatarURL, &p.Bio, &p.WhatsApp)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusOK, map[string]any{})
		return
	}
	if err != nil {
		log.Error("profile.get failed", "user_id", c.UserID, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load profile")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

type profileUpdate struct {
	DisplayName *string `json:"displayName"`
	City        *string `json:"city"`
	AvatarURL   *string `json:"avatarUrl"`
	Bio         *string `json:"bio"`
	WhatsApp    *string `json:"whatsapp"`
}

func (s *server) updateProfile(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	if !ok || c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	var in profileUpdate
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	_, err := s.pool.Exec(r.Context(), `
INSERT INTO profiles (user_id, display_name, city, avatar_url, bio, whatsapp, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
ON CONFLICT (user_id) DO UPDATE SET
  display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
  city         = COALESCE(EXCLUDED.city,         profiles.city),
  avatar_url   = COALESCE(EXCLUDED.avatar_url,   profiles.avatar_url),
  bio          = COALESCE(EXCLUDED.bio,          profiles.bio),
  whatsapp     = COALESCE(EXCLUDED.whatsapp,     profiles.whatsapp),
  updated_at   = NOW()
`, c.UserID, in.DisplayName, in.City, in.AvatarURL, in.Bio, in.WhatsApp)
	if err != nil {
		log.Error("profile.update failed", "user_id", c.UserID, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not update profile")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── catalogue ───────────────────────────────────────────────────────────────

func (s *server) listMakes(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, name, slug, logo_url, sort_order, is_active
		   FROM car_makes WHERE is_active = TRUE
		  ORDER BY sort_order ASC, name ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int
		var name, slug string
		var logo *string
		var sortOrder int
		var isActive bool
		if err := rows.Scan(&id, &name, &slug, &logo, &sortOrder, &isActive); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "name": name, "slug": slug, "logoUrl": logo,
			"sortOrder": sortOrder, "isActive": isActive,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) listModels(w http.ResponseWriter, r *http.Request) {
	makeID, _ := strconv.Atoi(r.URL.Query().Get("makeId"))
	if makeID == 0 {
		writeError(w, http.StatusBadRequest, "validation", "makeId required")
		return
	}
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, make_id, name, slug, sort_order, is_active
		   FROM car_models WHERE make_id = $1 AND is_active = TRUE
		  ORDER BY sort_order ASC, name ASC`, makeID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, mid, sortOrder int
		var name, slug string
		var isActive bool
		_ = rows.Scan(&id, &mid, &name, &slug, &sortOrder, &isActive)
		out = append(out, map[string]any{
			"id": id, "makeId": mid, "name": name, "slug": slug,
			"sortOrder": sortOrder, "isActive": isActive,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) listVariants(w http.ResponseWriter, r *http.Request) {
	modelID, _ := strconv.Atoi(r.URL.Query().Get("modelId"))
	if modelID == 0 {
		writeError(w, http.StatusBadRequest, "validation", "modelId required")
		return
	}
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, model_id, name, slug, engine_cc, fuel_type, transmission, body_type, is_active
		   FROM car_variants WHERE model_id = $1 AND is_active = TRUE
		  ORDER BY name ASC`, modelID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, mid int
		var name, slug string
		var engineCc, fuelType, transmission, bodyType *string
		var isActive bool
		_ = rows.Scan(&id, &mid, &name, &slug, &engineCc, &fuelType, &transmission, &bodyType, &isActive)
		out = append(out, map[string]any{
			"id": id, "modelId": mid, "name": name, "slug": slug,
			"engineCc": engineCc, "fuelType": fuelType,
			"transmission": transmission, "bodyType": bodyType,
			"isActive": isActive,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── listings ────────────────────────────────────────────────────────────────

func (s *server) listListings(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset, _ := strconv.Atoi(q.Get("offset"))
	if offset < 0 {
		offset = 0
	}
	makeID, _ := strconv.Atoi(q.Get("makeId"))
	modelID, _ := strconv.Atoi(q.Get("modelId"))
	minPrice, _ := strconv.ParseInt(q.Get("minPrice"), 10, 64)
	maxPrice, _ := strconv.ParseInt(q.Get("maxPrice"), 10, 64)
	city := strings.TrimSpace(q.Get("city"))
	search := strings.TrimSpace(q.Get("q"))

	// Build the WHERE clause defensively — parameters only, never concat.
	where := []string{"status = 'active'"}
	args := []any{}
	add := func(clause string, val any) {
		args = append(args, val)
		where = append(where, fmt.Sprintf(clause, len(args)))
	}
	if makeID > 0 {
		add("make_id = $%d", makeID)
	}
	if modelID > 0 {
		add("model_id = $%d", modelID)
	}
	if minPrice > 0 {
		add("price >= $%d", minPrice)
	}
	if maxPrice > 0 {
		add("price <= $%d", maxPrice)
	}
	if city != "" {
		add("city ILIKE $%d", city)
	}
	if search != "" {
		args = append(args, "%"+search+"%")
		p1 := len(args)
		args = append(args, "%"+search+"%")
		p2 := len(args)
		where = append(where, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", p1, p2))
	}

	whereSQL := "WHERE " + strings.Join(where, " AND ")

	var total int64
	if err := s.pool.QueryRow(r.Context(),
		"SELECT COUNT(*) FROM listings "+whereSQL, args...).Scan(&total); err != nil {
		log.Error("listings.count failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not list listings")
		return
	}

	args = append(args, limit, offset)
	limitPlaceholder := len(args) - 1
	offsetPlaceholder := len(args)

	rows, err := s.pool.Query(r.Context(),
		fmt.Sprintf(`SELECT id, seller_id, make_id, model_id, title, price, year, city, status, created_at
		   FROM listings %s
		  ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, whereSQL, limitPlaceholder, offsetPlaceholder),
		args...)
	if err != nil {
		log.Error("listings.query failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not list listings")
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, sellerID int64
		var mid, mdid *int
		var title, status string
		var price int64
		var year int
		var cityCol *string
		var createdAt time.Time
		if err := rows.Scan(&id, &sellerID, &mid, &mdid, &title, &price, &year, &cityCol, &status, &createdAt); err != nil {
			log.Warn("listings.scan failed", "err", err)
			continue
		}
		items = append(items, map[string]any{
			"id": id, "sellerId": sellerID, "makeId": mid, "modelId": mdid,
			"title": title, "price": price, "year": year, "city": cityCol,
			"status": status, "createdAt": createdAt,
		})
	}
	if err := rows.Err(); err != nil {
		log.Warn("listings.rows iter failed", "err", err)
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": total})
}

type createListingReq struct {
	MakeID       *int     `json:"makeId"`
	ModelID      *int     `json:"modelId"`
	VariantID    *int     `json:"variantId"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Price        int64    `json:"price"`
	Year         int      `json:"year"`
	Mileage      *int     `json:"mileage"`
	City         string   `json:"city"`
	Condition    string   `json:"condition"`
	Transmission string   `json:"transmission"`
	FuelType     string   `json:"fuelType"`
	Color        string   `json:"color"`
	Images       []string `json:"images"`
}

var allowedConditions = map[string]bool{
	"":          true, // optional
	"excellent": true, "good": true, "fair": true, "poor": true,
}
var allowedTransmissions = map[string]bool{
	"":     true, // optional
	"manual": true, "automatic": true, "cvt": true,
}

func (s *server) createListing(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	claims, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	if !ok || claims == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	var in createListingReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	in.City = strings.TrimSpace(in.City)
	currentYear := time.Now().Year()
	switch {
	case in.MakeID == nil || *in.MakeID <= 0:
		writeError(w, http.StatusBadRequest, "validation", "makeId required")
		return
	case in.ModelID == nil || *in.ModelID <= 0:
		writeError(w, http.StatusBadRequest, "validation", "modelId required")
		return
	case len(in.Title) < 3 || len(in.Title) > 255:
		writeError(w, http.StatusBadRequest, "validation", "title must be 3–255 characters")
		return
	case len(in.Description) > 10000:
		writeError(w, http.StatusBadRequest, "validation", "description must be ≤ 10000 characters")
		return
	case in.Price <= 0:
		writeError(w, http.StatusBadRequest, "validation", "price must be greater than 0 PKR")
		return
	case in.Year < 1900 || in.Year > currentYear+1:
		writeError(w, http.StatusBadRequest, "validation", "year out of range")
		return
	case in.Mileage != nil && *in.Mileage < 0:
		writeError(w, http.StatusBadRequest, "validation", "mileage cannot be negative")
		return
	case len(in.City) < 2 || len(in.City) > 100:
		writeError(w, http.StatusBadRequest, "validation", "city required (2–100 chars)")
		return
	case !allowedConditions[in.Condition]:
		writeError(w, http.StatusBadRequest, "validation", "condition must be excellent|good|fair|poor")
		return
	case !allowedTransmissions[in.Transmission]:
		writeError(w, http.StatusBadRequest, "validation", "transmission must be manual|automatic|cvt")
		return
	case len(in.Images) > 20:
		writeError(w, http.StatusBadRequest, "validation", "max 20 images")
		return
	}
	if in.Images == nil {
		in.Images = []string{}
	}

	var (
		id           int64
		sellerID     int64
		makeID       *int
		modelID      *int
		variantID    *int
		title        string
		desc         *string
		price        int64
		year         int
		mileage      *int
		city         *string
		cond         *string
		trans        *string
		fuel         *string
		color        *string
		images       []string
		status       string
		createdAt    time.Time
	)
	err := s.pool.QueryRow(r.Context(), `
INSERT INTO listings (seller_id, make_id, model_id, variant_id, title, description, price,
                      year, mileage, city, condition, transmission, fuel_type, color, images)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
RETURNING id, seller_id, make_id, model_id, variant_id, title, description, price, year,
          mileage, city, condition, transmission, fuel_type, color, images, status, created_at`,
		claims.UserID, in.MakeID, in.ModelID, in.VariantID, in.Title,
		nilIfEmpty(in.Description), in.Price, in.Year, in.Mileage,
		nilIfEmpty(in.City), nilIfEmpty(in.Condition), nilIfEmpty(in.Transmission),
		nilIfEmpty(in.FuelType), nilIfEmpty(in.Color), in.Images,
	).Scan(&id, &sellerID, &makeID, &modelID, &variantID, &title, &desc, &price, &year,
		&mileage, &city, &cond, &trans, &fuel, &color, &images, &status, &createdAt)
	if err != nil {
		log.Error("listings.create failed", "user_id", claims.UserID, "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not create listing")
		return
	}
	log.Info("listings.create ok", "listing_id", id, "user_id", claims.UserID)
	writeJSON(w, http.StatusCreated, map[string]any{
		"id": id, "sellerId": sellerID, "makeId": makeID, "modelId": modelID, "variantId": variantID,
		"title": title, "description": desc, "price": price, "year": year, "mileage": mileage,
		"city": city, "condition": cond, "transmission": trans, "fuelType": fuel, "color": color,
		"images": images, "status": status, "createdAt": createdAt,
	})
}

func nilIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func (s *server) getListing(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusNotFound, "not_found", "listing not found")
		return
	}
	// Best-effort auth: if a valid token is present we'll let the seller view
	// their own non-active listing too. Anonymous + other users only see active.
	var viewerID int64
	if hdr := r.Header.Get("Authorization"); strings.HasPrefix(hdr, "Bearer ") {
		if c, perr := s.signer.Parse(strings.TrimPrefix(hdr, "Bearer ")); perr == nil && c != nil {
			viewerID = c.UserID
		}
	}
	row := s.pool.QueryRow(r.Context(),
		`SELECT id, seller_id, make_id, model_id, title, description, price, year, mileage,
		        city, condition, transmission, fuel_type, color, images, status, created_at
		   FROM listings WHERE id = $1 AND (status = 'active' OR seller_id = $2)`, id, viewerID)
	var (
		lid, sellerID                 int64
		makeID, modelID               *int
		title, status                 string
		desc, city, cond, trans, fuel *string
		color                         *string
		price                         int64
		year                          int
		mileage                       *int
		images                        []string
		createdAt                     time.Time
	)
	if err := row.Scan(&lid, &sellerID, &makeID, &modelID, &title, &desc, &price, &year,
		&mileage, &city, &cond, &trans, &fuel, &color, &images, &status, &createdAt); err != nil {
		writeError(w, http.StatusNotFound, "not_found", "listing not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id": lid, "sellerId": sellerID, "makeId": makeID, "modelId": modelID,
		"title": title, "description": desc, "price": price, "year": year, "mileage": mileage,
		"city": city, "condition": cond, "transmission": trans, "fuelType": fuel, "color": color,
		"images": images, "status": status, "createdAt": createdAt,
	})
}

// ── middleware / helpers ────────────────────────────────────────────────────

type ctxKey int

const ctxClaimsKey ctxKey = 1

func (s *server) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := gwlog.FromContext(r.Context())
		hdr := r.Header.Get("Authorization")
		if !strings.HasPrefix(hdr, "Bearer ") {
			log.Info("auth.middleware no bearer token")
			writeError(w, http.StatusUnauthorized, "auth", "missing bearer token")
			return
		}
		claims, err := s.signer.Parse(strings.TrimPrefix(hdr, "Bearer "))
		if err != nil {
			log.Warn("auth.middleware invalid jwt", "err", err)
			writeError(w, http.StatusUnauthorized, "auth", "invalid token: "+err.Error())
			return
		}
		// Re-bind the request-scoped logger with the user_id so every downstream
		// log line in this handler carries it automatically.
		log = log.With("user_id", claims.UserID, "user_role", claims.Role)
		ctx := gwlog.WithLogger(r.Context(), log)
		ctx = context.WithValue(ctx, ctxClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}


func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code int, slug, msg string) {
	writeJSON(w, code, map[string]any{"error": msg, "code": slug})
}

// redactEmail returns "a***@b***.com" so logs are debuggable without exposing PII.
func redactEmail(e string) string {
	e = strings.ToLower(strings.TrimSpace(e))
	at := strings.IndexByte(e, '@')
	if at <= 0 {
		return "?"
	}
	user, dom := e[:at], e[at+1:]
	mask := func(s string) string {
		switch n := len(s); {
		case n <= 1:
			return s
		case n <= 3:
			return s[:1] + "***"
		default:
			return s[:2] + "***"
		}
	}
	return mask(user) + "@" + mask(dom)
}

func isValidEmail(e string) bool {
	e = strings.TrimSpace(e)
	if len(e) < 3 || len(e) > 254 {
		return false
	}
	at := strings.Index(e, "@")
	return at > 0 && at < len(e)-3 && strings.Contains(e[at+1:], ".")
}

func randomCode6() (string, error) {
	max := big.NewInt(1_000_000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func sha256Hex(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}
