package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"

	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/auth"
	gwlog "github.com/redspotsproduction-sudo/pakizzle/gateway/internal/logger"
)

// ── role guard ──────────────────────────────────────────────────────────────

func (s *server) requireAdmin(next http.Handler) http.Handler {
	return s.requireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims)
		if !ok || c == nil {
			writeError(w, http.StatusUnauthorized, "auth", "missing auth")
			return
		}
		if c.Role != "admin" {
			writeError(w, http.StatusForbidden, "forbidden", "admin only")
			return
		}
		next.ServeHTTP(w, r)
	}))
}

// bootstrapAdmin promotes the configured ADMIN_EMAIL to role='admin' on boot.
// Cheap, idempotent, and avoids needing a separate CLI to seed the first admin.
func (s *server) bootstrapAdmin(ctx context.Context) {
	if s.pool == nil || s.cfg.AdminEmail == "" {
		return
	}
	email := strings.ToLower(strings.TrimSpace(s.cfg.AdminEmail))
	tag, err := s.pool.Exec(ctx,
		`UPDATE users SET role='admin', updated_at=NOW()
		 WHERE email=$1 AND role <> 'admin'`, email)
	if err != nil {
		s.log.Warn("admin.bootstrap update failed", "email", redactEmail(email), "err", err)
		return
	}
	if tag.RowsAffected() > 0 {
		s.log.Info("admin.bootstrap promoted", "email", redactEmail(email))
	}
}

// audit writes a single row to audit_logs. Best-effort — never fails a request.
func (s *server) audit(ctx context.Context, c *auth.Claims, action, targetType, targetID string, meta map[string]any) {
	if s.pool == nil {
		return
	}
	if meta == nil {
		meta = map[string]any{}
	}
	mb, _ := json.Marshal(meta)
	_, err := s.pool.Exec(ctx, `
		INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, meta)
		VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''), $6::jsonb)`,
		c.UserID, c.Email, action, targetType, targetID, string(mb))
	if err != nil {
		s.log.Warn("audit.write failed", "action", action, "err", err)
	}
}

// ── /api/admin/stats ────────────────────────────────────────────────────────

func (s *server) adminStats(w http.ResponseWriter, r *http.Request) {
	type counts struct {
		Users            int64 `json:"users"`
		ActiveListings   int64 `json:"activeListings"`
		PendingListings  int64 `json:"pendingListings"`
		BannedListings   int64 `json:"bannedListings"`
		BannedUsers      int64 `json:"bannedUsers"`
		Dealers          int64 `json:"dealers"`
		PendingDealers   int64 `json:"pendingDealers"`
		Inspections      int64 `json:"pendingInspections"`
		Insurance        int64 `json:"pendingInsurance"`
		Financing        int64 `json:"pendingFinancing"`
		OpenReports      int64 `json:"openReports"`
		PaymentsThisMo   int64 `json:"paymentsThisMonth"`
		RevenuePKRThisMo int64 `json:"revenueThisMonth"`
	}
	var out counts
	row := s.pool.QueryRow(r.Context(), `
		SELECT
		  (SELECT COUNT(*) FROM users),
		  (SELECT COUNT(*) FROM listings WHERE status='active'),
		  (SELECT COUNT(*) FROM listings WHERE status='pending'),
		  (SELECT COUNT(*) FROM listings WHERE status='banned'),
		  (SELECT COUNT(*) FROM users WHERE banned_at IS NOT NULL),
		  (SELECT COUNT(*) FROM dealers),
		  (SELECT COUNT(*) FROM dealers WHERE status='pending'),
		  (SELECT COUNT(*) FROM inspection_requests WHERE status='pending'),
		  (SELECT COUNT(*) FROM insurance_requests  WHERE status='pending'),
		  (SELECT COUNT(*) FROM financing_requests  WHERE status='pending'),
		  (SELECT COUNT(*) FROM reports WHERE status='open'),
		  (SELECT COUNT(*) FROM payments WHERE status='completed' AND created_at > date_trunc('month', NOW())),
		  COALESCE((SELECT SUM(amount) FROM payments WHERE status='completed' AND created_at > date_trunc('month', NOW())), 0)
	`)
	if err := row.Scan(
		&out.Users, &out.ActiveListings, &out.PendingListings, &out.BannedListings,
		&out.BannedUsers, &out.Dealers, &out.PendingDealers,
		&out.Inspections, &out.Insurance, &out.Financing,
		&out.OpenReports, &out.PaymentsThisMo, &out.RevenuePKRThisMo,
	); err != nil {
		gwlog.FromContext(r.Context()).Error("admin.stats failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load stats")
		return
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/users ────────────────────────────────────────────────────────

func (s *server) adminListUsers(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit := clampInt(atoi(q.Get("limit"), 50), 1, 200)
	offset := clampInt(atoi(q.Get("offset"), 0), 0, 1_000_000)
	search := strings.TrimSpace(q.Get("q"))
	role := strings.TrimSpace(q.Get("role"))

	args := []any{}
	where := []string{"TRUE"}
	if search != "" {
		args = append(args, "%"+search+"%")
		args = append(args, "%"+search+"%")
		where = append(where, fmt.Sprintf("(email ILIKE $%d OR full_name ILIKE $%d)", len(args)-1, len(args)))
	}
	if role != "" {
		args = append(args, role)
		where = append(where, fmt.Sprintf("role = $%d", len(args)))
	}
	whereSQL := strings.Join(where, " AND ")

	var total int64
	if err := s.pool.QueryRow(r.Context(),
		"SELECT COUNT(*) FROM users WHERE "+whereSQL, args...).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	args = append(args, limit, offset)
	lp, op := len(args)-1, len(args)
	rows, err := s.pool.Query(r.Context(), fmt.Sprintf(`
		SELECT id, full_name, email, role, email_verified, phone_verified,
		       identity_status, business_status, badge, banned_at, created_at
		  FROM users WHERE %s
		 ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, whereSQL, lp, op), args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id int64
		var name, email, role, ident, biz, badge string
		var emailV, phoneV bool
		var bannedAt sql.NullTime
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &role, &emailV, &phoneV, &ident, &biz, &badge, &bannedAt, &createdAt); err != nil {
			continue
		}
		var ba any
		if bannedAt.Valid {
			ba = bannedAt.Time
		}
		items = append(items, map[string]any{
			"id": id, "fullName": name, "email": email, "role": role,
			"emailVerified": emailV, "phoneVerified": phoneV,
			"identityStatus": ident, "businessStatus": biz, "badge": badge,
			"bannedAt": ba, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": total})
}

type adminUpdateUserReq struct {
	Role           *string `json:"role"`
	Badge          *string `json:"badge"`
	IdentityStatus *string `json:"identityStatus"`
	BusinessStatus *string `json:"businessStatus"`
	Banned         *bool   `json:"banned"`
	BanReason      *string `json:"banReason"`
}

func (s *server) adminUpdateUser(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminUpdateUserReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	sets := []string{}
	args := []any{}
	add := func(col string, v any) {
		args = append(args, v)
		sets = append(sets, fmt.Sprintf("%s = $%d", col, len(args)))
	}
	if in.Role != nil && (*in.Role == "user" || *in.Role == "admin" || *in.Role == "moderator") {
		add("role", *in.Role)
	}
	if in.Badge != nil {
		add("badge", *in.Badge)
	}
	if in.IdentityStatus != nil {
		add("identity_status", *in.IdentityStatus)
	}
	if in.BusinessStatus != nil {
		add("business_status", *in.BusinessStatus)
	}
	if in.Banned != nil {
		if *in.Banned {
			add("banned_at", time.Now())
			reason := ""
			if in.BanReason != nil {
				reason = *in.BanReason
			}
			add("ban_reason", reason)
		} else {
			sets = append(sets, "banned_at = NULL", "ban_reason = NULL")
		}
	}
	if len(sets) == 0 {
		writeError(w, http.StatusBadRequest, "validation", "no fields to update")
		return
	}
	sets = append(sets, "updated_at = NOW()")
	args = append(args, id)
	idPos := len(args)
	sql := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d", strings.Join(sets, ", "), idPos)
	if _, err := s.pool.Exec(r.Context(), sql, args...); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims); ok {
		s.audit(r.Context(), c, "user.update", "user", strconv.FormatInt(id, 10), nil)
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/listings ─────────────────────────────────────────────────────

func (s *server) adminListListings(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit := clampInt(atoi(q.Get("limit"), 50), 1, 200)
	offset := clampInt(atoi(q.Get("offset"), 0), 0, 1_000_000)
	status := strings.TrimSpace(q.Get("status"))
	search := strings.TrimSpace(q.Get("q"))

	args := []any{}
	where := []string{"TRUE"}
	if status != "" {
		args = append(args, status)
		where = append(where, fmt.Sprintf("status = $%d", len(args)))
	}
	if search != "" {
		args = append(args, "%"+search+"%")
		args = append(args, "%"+search+"%")
		where = append(where, fmt.Sprintf("(title ILIKE $%d OR city ILIKE $%d)", len(args)-1, len(args)))
	}
	whereSQL := strings.Join(where, " AND ")

	var total int64
	if err := s.pool.QueryRow(r.Context(),
		"SELECT COUNT(*) FROM listings WHERE "+whereSQL, args...).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	args = append(args, limit, offset)
	lp, op := len(args)-1, len(args)
	rows, err := s.pool.Query(r.Context(), fmt.Sprintf(`
		SELECT l.id, l.seller_id, COALESCE(u.email,''), l.title, l.price, l.year, l.city,
		       l.status, l.reject_reason, l.created_at
		  FROM listings l LEFT JOIN users u ON u.id = l.seller_id
		 WHERE %s
		 ORDER BY l.created_at DESC LIMIT $%d OFFSET $%d`, whereSQL, lp, op), args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, sellerID int64
		var email, title, status string
		var rej *string
		var city *string
		var price int64
		var year int
		var createdAt time.Time
		if err := rows.Scan(&id, &sellerID, &email, &title, &price, &year, &city, &status, &rej, &createdAt); err != nil {
			continue
		}
		items = append(items, map[string]any{
			"id": id, "sellerId": sellerID, "sellerEmail": email,
			"title": title, "price": price, "year": year, "city": city,
			"status": status, "rejectReason": rej, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": total})
}

type adminListingStatusReq struct {
	Status string `json:"status"`
	Reason string `json:"reason"`
}

func (s *server) adminListingStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminListingStatusReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	allowed := map[string]bool{
		"active": true, "pending": true, "rejected": true,
		"banned": true, "sold": true, "draft": true, "expired": true,
	}
	if !allowed[in.Status] {
		writeError(w, http.StatusBadRequest, "validation", "invalid status")
		return
	}
	c, _ := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	var actorID int64
	if c != nil {
		actorID = c.UserID
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE listings SET status=$1, reject_reason=NULLIF($2,''),
		                    approved_at = CASE WHEN $1='active' THEN NOW() ELSE approved_at END,
		                    approved_by = CASE WHEN $1='active' THEN $3 ELSE approved_by END,
		                    updated_at = NOW()
		 WHERE id=$4`, in.Status, in.Reason, actorID, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c != nil {
		s.audit(r.Context(), c, "listing."+in.Status, "listing", strconv.FormatInt(id, 10), map[string]any{"reason": in.Reason})
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteListing(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM listings WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims); ok {
		s.audit(r.Context(), c, "listing.delete", "listing", strconv.FormatInt(id, 10), nil)
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/banners (CRUD) ───────────────────────────────────────────────

type adminBannerReq struct {
	Slug         string  `json:"slug"`
	Name         string  `json:"name"`
	Image        string  `json:"image"`
	Type         string  `json:"type"`
	TargetID     *string `json:"targetId"`
	ExternalLink *string `json:"externalLink"`
	Status       string  `json:"status"`
	DisplayOrder int     `json:"displayOrder"`
}

func (s *server) adminListBanners(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, name, image_url, type, target_id, external_link, status,
		       display_order, created_at, updated_at
		  FROM banners ORDER BY display_order ASC, id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var slug, name, img, t, status string
		var target, ext *string
		var order int
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &slug, &name, &img, &t, &target, &ext, &status, &order, &createdAt, &updatedAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": strconv.FormatInt(id, 10), "slug": slug, "name": name, "image": img,
			"type": t, "targetId": target, "externalLink": ext, "status": status,
			"displayOrder": order, "createdAt": createdAt, "updatedAt": updatedAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminCreateBanner(w http.ResponseWriter, r *http.Request) {
	var in adminBannerReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	if in.Slug == "" || in.Name == "" || in.Image == "" {
		writeError(w, http.StatusBadRequest, "validation", "slug, name, image required")
		return
	}
	if in.Type == "" {
		in.Type = "external"
	}
	if in.Status == "" {
		in.Status = "active"
	}
	var id int64
	err := s.pool.QueryRow(r.Context(), `
		INSERT INTO banners (slug, name, image_url, type, target_id, external_link, status, display_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
		in.Slug, in.Name, in.Image, in.Type, in.TargetID, in.ExternalLink, in.Status, in.DisplayOrder).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims); ok {
		s.audit(r.Context(), c, "banner.create", "banner", strconv.FormatInt(id, 10), nil)
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *server) adminUpdateBanner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminBannerReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE banners SET slug=COALESCE(NULLIF($1,''),slug),
		                   name=COALESCE(NULLIF($2,''),name),
		                   image_url=COALESCE(NULLIF($3,''),image_url),
		                   type=COALESCE(NULLIF($4,''),type),
		                   target_id=$5,
		                   external_link=$6,
		                   status=COALESCE(NULLIF($7,''),status),
		                   display_order=$8,
		                   updated_at=NOW()
		 WHERE id=$9`,
		in.Slug, in.Name, in.Image, in.Type, in.TargetID, in.ExternalLink, in.Status, in.DisplayOrder, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims); ok {
		s.audit(r.Context(), c, "banner.update", "banner", strconv.FormatInt(id, 10), nil)
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteBanner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM banners WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	if c, ok := r.Context().Value(ctxClaimsKey).(*auth.Claims); ok {
		s.audit(r.Context(), c, "banner.delete", "banner", strconv.FormatInt(id, 10), nil)
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/showcase-categories (CRUD) ───────────────────────────────────

type adminShowcaseReq struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Gradient    string `json:"gradient"`
	Image       string `json:"image"`
	FilterKey   string `json:"filterKey"`
	FilterValue string `json:"filterValue"`
	Size        string `json:"size"`
	SortOrder   int    `json:"sortOrder"`
	IsActive    *bool  `json:"isActive"`
}

func (s *server) adminListShowcase(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, title, subtitle, icon, color, gradient, image_url,
		       filter_key, filter_value, tile_size, sort_order, is_active
		  FROM showcase_categories ORDER BY sort_order ASC, id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var slug, title, sub, icon, color, grad, img, fk, fv, size string
		var order int
		var active bool
		if err := rows.Scan(&id, &slug, &title, &sub, &icon, &color, &grad, &img, &fk, &fv, &size, &order, &active); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": strconv.FormatInt(id, 10), "slug": slug, "title": title, "subtitle": sub,
			"icon": icon, "color": color, "gradient": grad, "image": img,
			"filterKey": fk, "filterValue": fv, "size": size, "sortOrder": order, "isActive": active,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminCreateShowcase(w http.ResponseWriter, r *http.Request) {
	var in adminShowcaseReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	if in.Slug == "" || in.Title == "" || in.Image == "" {
		writeError(w, http.StatusBadRequest, "validation", "slug, title, image required")
		return
	}
	if in.Icon == "" {
		in.Icon = "Sparkles"
	}
	if in.Color == "" {
		in.Color = "text-apple-blue"
	}
	if in.Gradient == "" {
		in.Gradient = "from-apple-blue/20 to-indigo-500/10"
	}
	if in.Size == "" {
		in.Size = "small"
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	var id int64
	err := s.pool.QueryRow(r.Context(), `
		INSERT INTO showcase_categories
		  (slug, title, subtitle, icon, color, gradient, image_url, filter_key, filter_value, tile_size, sort_order, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
		in.Slug, in.Title, in.Subtitle, in.Icon, in.Color, in.Gradient, in.Image,
		in.FilterKey, in.FilterValue, in.Size, in.SortOrder, active).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *server) adminUpdateShowcase(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminShowcaseReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE showcase_categories SET
		  slug         = COALESCE(NULLIF($1,''), slug),
		  title        = COALESCE(NULLIF($2,''), title),
		  subtitle     = $3,
		  icon         = COALESCE(NULLIF($4,''), icon),
		  color        = COALESCE(NULLIF($5,''), color),
		  gradient     = COALESCE(NULLIF($6,''), gradient),
		  image_url    = COALESCE(NULLIF($7,''), image_url),
		  filter_key   = $8,
		  filter_value = $9,
		  tile_size    = COALESCE(NULLIF($10,''), tile_size),
		  sort_order   = $11,
		  is_active    = $12,
		  updated_at   = NOW()
		 WHERE id=$13`,
		in.Slug, in.Title, in.Subtitle, in.Icon, in.Color, in.Gradient, in.Image,
		in.FilterKey, in.FilterValue, in.Size, in.SortOrder, active, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteShowcase(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM showcase_categories WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/makes /models /variants ──────────────────────────────────────

type adminMakeReq struct {
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	LogoURL   string `json:"logoUrl"`
	SortOrder int    `json:"sortOrder"`
	IsActive  *bool  `json:"isActive"`
}

func (s *server) adminListMakes(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, name, slug, logo_url, sort_order, is_active FROM car_makes ORDER BY sort_order ASC, name ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, order int
		var name, slug string
		var logo *string
		var active bool
		_ = rows.Scan(&id, &name, &slug, &logo, &order, &active)
		out = append(out, map[string]any{
			"id": id, "name": name, "slug": slug, "logoUrl": logo, "sortOrder": order, "isActive": active,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminCreateMake(w http.ResponseWriter, r *http.Request) {
	var in adminMakeReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Name == "" || in.Slug == "" {
		writeError(w, http.StatusBadRequest, "validation", "name + slug required")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	var id int
	err := s.pool.QueryRow(r.Context(), `
		INSERT INTO car_makes (name, slug, logo_url, sort_order, is_active)
		VALUES ($1,$2,NULLIF($3,''),$4,$5) RETURNING id`,
		in.Name, in.Slug, in.LogoURL, in.SortOrder, active).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *server) adminUpdateMake(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminMakeReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE car_makes SET name=COALESCE(NULLIF($1,''),name),
		                    slug=COALESCE(NULLIF($2,''),slug),
		                    logo_url=$3,
		                    sort_order=$4,
		                    is_active=$5
		 WHERE id=$6`, in.Name, in.Slug, nilIfEmpty(in.LogoURL), in.SortOrder, active, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteMake(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM car_makes WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

type adminModelReq struct {
	MakeID    int    `json:"makeId"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	SortOrder int    `json:"sortOrder"`
	IsActive  *bool  `json:"isActive"`
}

func (s *server) adminListModels(w http.ResponseWriter, r *http.Request) {
	makeID, _ := strconv.Atoi(r.URL.Query().Get("makeId"))
	args := []any{}
	where := "TRUE"
	if makeID > 0 {
		args = append(args, makeID)
		where = "make_id = $1"
	}
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, make_id, name, slug, sort_order, is_active FROM car_models WHERE `+where+` ORDER BY sort_order ASC, name ASC`, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, mid, order int
		var name, slug string
		var active bool
		_ = rows.Scan(&id, &mid, &name, &slug, &order, &active)
		out = append(out, map[string]any{
			"id": id, "makeId": mid, "name": name, "slug": slug, "sortOrder": order, "isActive": active,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminCreateModel(w http.ResponseWriter, r *http.Request) {
	var in adminModelReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.MakeID == 0 || in.Name == "" || in.Slug == "" {
		writeError(w, http.StatusBadRequest, "validation", "makeId, name, slug required")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	var id int
	err := s.pool.QueryRow(r.Context(), `
		INSERT INTO car_models (make_id, name, slug, sort_order, is_active)
		VALUES ($1,$2,$3,$4,$5) RETURNING id`, in.MakeID, in.Name, in.Slug, in.SortOrder, active).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *server) adminUpdateModel(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminModelReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE car_models SET name=COALESCE(NULLIF($1,''),name),
		                     slug=COALESCE(NULLIF($2,''),slug),
		                     make_id=COALESCE(NULLIF($3,0)::int, make_id),
		                     sort_order=$4,
		                     is_active=$5
		 WHERE id=$6`, in.Name, in.Slug, in.MakeID, in.SortOrder, active, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteModel(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM car_models WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

type adminVariantReq struct {
	ModelID      int    `json:"modelId"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	EngineCc     string `json:"engineCc"`
	FuelType     string `json:"fuelType"`
	Transmission string `json:"transmission"`
	BodyType     string `json:"bodyType"`
	IsActive     *bool  `json:"isActive"`
}

func (s *server) adminListVariants(w http.ResponseWriter, r *http.Request) {
	modelID, _ := strconv.Atoi(r.URL.Query().Get("modelId"))
	args := []any{}
	where := "TRUE"
	if modelID > 0 {
		args = append(args, modelID)
		where = "model_id = $1"
	}
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, model_id, name, slug, engine_cc, fuel_type, transmission, body_type, is_active
		   FROM car_variants WHERE `+where+` ORDER BY name ASC`, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, mid int
		var name, slug string
		var engine, fuel, trans, body *string
		var active bool
		_ = rows.Scan(&id, &mid, &name, &slug, &engine, &fuel, &trans, &body, &active)
		out = append(out, map[string]any{
			"id": id, "modelId": mid, "name": name, "slug": slug,
			"engineCc": engine, "fuelType": fuel, "transmission": trans, "bodyType": body, "isActive": active,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminCreateVariant(w http.ResponseWriter, r *http.Request) {
	var in adminVariantReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.ModelID == 0 || in.Name == "" || in.Slug == "" {
		writeError(w, http.StatusBadRequest, "validation", "modelId, name, slug required")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	var id int
	err := s.pool.QueryRow(r.Context(), `
		INSERT INTO car_variants (model_id, name, slug, engine_cc, fuel_type, transmission, body_type, is_active)
		VALUES ($1,$2,$3,NULLIF($4,''),NULLIF($5,''),NULLIF($6,''),NULLIF($7,''),$8) RETURNING id`,
		in.ModelID, in.Name, in.Slug, in.EngineCc, in.FuelType, in.Transmission, in.BodyType, active).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (s *server) adminUpdateVariant(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	var in adminVariantReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_body", "invalid json")
		return
	}
	active := true
	if in.IsActive != nil {
		active = *in.IsActive
	}
	_, err = s.pool.Exec(r.Context(), `
		UPDATE car_variants SET name=COALESCE(NULLIF($1,''),name),
		                        slug=COALESCE(NULLIF($2,''),slug),
		                        engine_cc=NULLIF($3,''),
		                        fuel_type=NULLIF($4,''),
		                        transmission=NULLIF($5,''),
		                        body_type=NULLIF($6,''),
		                        is_active=$7
		 WHERE id=$8`,
		in.Name, in.Slug, in.EngineCc, in.FuelType, in.Transmission, in.BodyType, active, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) adminDeleteVariant(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `DELETE FROM car_variants WHERE id=$1`, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/audit ────────────────────────────────────────────────────────

func (s *server) adminListAudit(w http.ResponseWriter, r *http.Request) {
	limit := clampInt(atoi(r.URL.Query().Get("limit"), 100), 1, 500)
	offset := clampInt(atoi(r.URL.Query().Get("offset"), 0), 0, 1_000_000)
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, actor_id, COALESCE(actor_email,''), action,
		       COALESCE(target_type,''), COALESCE(target_id,''), meta, created_at
		  FROM audit_logs ORDER BY id DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var actorID sql.NullInt64
		var actorEmail, action, tt, ti string
		var meta map[string]any
		var createdAt time.Time
		if err := rows.Scan(&id, &actorID, &actorEmail, &action, &tt, &ti, &meta, &createdAt); err != nil {
			continue
		}
		var aid any
		if actorID.Valid {
			aid = actorID.Int64
		}
		out = append(out, map[string]any{
			"id": id, "actorId": aid, "actorEmail": actorEmail, "action": action,
			"targetType": tt, "targetId": ti, "meta": meta, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/settings (key/value JSON) ────────────────────────────────────

func (s *server) adminListSettings(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(),
		`SELECT key, value, updated_at FROM admin_settings ORDER BY key ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var key string
		var value map[string]any
		var updatedAt time.Time
		if err := rows.Scan(&key, &value, &updatedAt); err != nil {
			continue
		}
		out = append(out, map[string]any{"key": key, "value": value, "updatedAt": updatedAt})
	}
	writeJSON(w, http.StatusOK, out)
}

type adminSettingReq struct {
	Key   string         `json:"key"`
	Value map[string]any `json:"value"`
}

func (s *server) adminUpsertSetting(w http.ResponseWriter, r *http.Request) {
	var in adminSettingReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Key == "" {
		writeError(w, http.StatusBadRequest, "validation", "key required")
		return
	}
	if in.Value == nil {
		in.Value = map[string]any{}
	}
	vb, _ := json.Marshal(in.Value)
	c, _ := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	var actorID any
	if c != nil {
		actorID = c.UserID
	}
	_, err := s.pool.Exec(r.Context(), `
		INSERT INTO admin_settings (key, value, updated_at, updated_by)
		VALUES ($1, $2::jsonb, NOW(), $3)
		ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW(), updated_by=EXCLUDED.updated_by`,
		in.Key, string(vb), actorID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/dealers ──────────────────────────────────────────────────────

func (s *server) adminListDealers(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, COALESCE(owner_id,0), name, slug, COALESCE(city,''), COALESCE(phone,''),
		       COALESCE(logo_url,''), status, is_verified, listings_count, created_at
		  FROM dealers ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, owner int64
		var name, slug, city, phone, logo, status string
		var verified bool
		var count int
		var createdAt time.Time
		if err := rows.Scan(&id, &owner, &name, &slug, &city, &phone, &logo, &status, &verified, &count, &createdAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "ownerId": owner, "name": name, "slug": slug, "city": city, "phone": phone,
			"logoUrl": logo, "status": status, "isVerified": verified,
			"listingsCount": count, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/requests (insurance / financing / inspections) ───────────────

func (s *server) adminListRequests(table string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		status := strings.TrimSpace(r.URL.Query().Get("status"))
		args := []any{}
		where := "TRUE"
		if status != "" {
			args = append(args, status)
			where = "status = $1"
		}
		// table is hard-coded by route, not user input — safe to interpolate.
		q := fmt.Sprintf(`SELECT id, COALESCE(customer_name,''), COALESCE(customer_email,''),
		                          COALESCE(customer_phone,''), COALESCE(vehicle_make,''),
		                          COALESCE(vehicle_model,''), COALESCE(vehicle_year,0),
		                          status, created_at
		                     FROM %s WHERE %s
		                    ORDER BY created_at DESC LIMIT 500`, table, where)
		rows, err := s.pool.Query(r.Context(), q, args...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "db", err.Error())
			return
		}
		defer rows.Close()
		out := []map[string]any{}
		for rows.Next() {
			var id int64
			var cname, cemail, cphone, vmake, vmodel, status string
			var vyear int
			var createdAt time.Time
			if err := rows.Scan(&id, &cname, &cemail, &cphone, &vmake, &vmodel, &vyear, &status, &createdAt); err != nil {
				continue
			}
			out = append(out, map[string]any{
				"id": id, "customerName": cname, "customerEmail": cemail, "customerPhone": cphone,
				"vehicleMake": vmake, "vehicleModel": vmodel, "vehicleYear": vyear,
				"status": status, "createdAt": createdAt,
			})
		}
		writeJSON(w, http.StatusOK, out)
	}
}

func (s *server) adminUpdateRequestStatus(table string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
		if err != nil || id <= 0 {
			writeError(w, http.StatusBadRequest, "validation", "bad id")
			return
		}
		var in struct {
			Status string `json:"status"`
			Notes  string `json:"notes"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Status == "" {
			writeError(w, http.StatusBadRequest, "validation", "status required")
			return
		}
		q := fmt.Sprintf(`UPDATE %s SET status=$1, notes=COALESCE(NULLIF($2,''),notes), updated_at=NOW() WHERE id=$3`, table)
		if _, err := s.pool.Exec(r.Context(), q, in.Status, in.Notes, id); err != nil {
			writeError(w, http.StatusInternalServerError, "db", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true})
	}
}

// ── /api/admin/pricing-plans ───────────────────────────────────────────────

func (s *server) adminListPricing(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, name, category, COALESCE(description,''), price, duration_days,
		       features, is_active, sort_order, created_at
		  FROM pricing_plans ORDER BY sort_order ASC, id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, order int
		var slug, name, cat, desc string
		var price int64
		var days int
		var features []any
		var active bool
		var createdAt time.Time
		if err := rows.Scan(&id, &slug, &name, &cat, &desc, &price, &days, &features, &active, &order, &createdAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "slug": slug, "name": name, "category": cat, "description": desc,
			"price": price, "durationDays": days, "features": features,
			"isActive": active, "sortOrder": order, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/content-pages ───────────────────────────────────────────────

func (s *server) adminListPages(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(),
		`SELECT id, slug, title, COALESCE(body,''), is_published, updated_at FROM content_pages ORDER BY slug ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int
		var slug, title, body string
		var published bool
		var updatedAt time.Time
		if err := rows.Scan(&id, &slug, &title, &body, &published, &updatedAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "slug": slug, "title": title, "body": body,
			"isPublished": published, "updatedAt": updatedAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) adminUpsertPage(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Slug        string `json:"slug"`
		Title       string `json:"title"`
		Body        string `json:"body"`
		IsPublished *bool  `json:"isPublished"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.Slug == "" || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation", "slug + title required")
		return
	}
	published := true
	if in.IsPublished != nil {
		published = *in.IsPublished
	}
	c, _ := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	var actorID any
	if c != nil {
		actorID = c.UserID
	}
	_, err := s.pool.Exec(r.Context(), `
		INSERT INTO content_pages (slug, title, body, is_published, updated_by, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body,
		                                 is_published=EXCLUDED.is_published,
		                                 updated_by=EXCLUDED.updated_by, updated_at=NOW()`,
		in.Slug, in.Title, in.Body, published, actorID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── /api/admin/reports ─────────────────────────────────────────────────────

func (s *server) adminListReports(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, COALESCE(reporter_id,0), target_type, target_id, reason,
		       COALESCE(description,''), status, COALESCE(resolution_note,''), created_at
		  FROM reports ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, reporter int64
		var tt, ti, reason, desc, status, note string
		var createdAt time.Time
		if err := rows.Scan(&id, &reporter, &tt, &ti, &reason, &desc, &status, &note, &createdAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "reporterId": reporter, "targetType": tt, "targetId": ti,
			"reason": reason, "description": desc, "status": status,
			"resolutionNote": note, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/payments ────────────────────────────────────────────────────

func (s *server) adminListPayments(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT p.id, COALESCE(p.user_id,0), COALESCE(u.email,''), COALESCE(p.listing_id,0),
		       p.amount, p.currency, COALESCE(p.method,''), p.status,
		       COALESCE(p.purpose,''), COALESCE(p.reference,''), p.created_at
		  FROM payments p LEFT JOIN users u ON u.id = p.user_id
		 ORDER BY p.created_at DESC LIMIT 500`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, uid, lid int64
		var email, currency, method, status, purpose, ref string
		var amount int64
		var createdAt time.Time
		if err := rows.Scan(&id, &uid, &email, &lid, &amount, &currency, &method, &status, &purpose, &ref, &createdAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "userId": uid, "userEmail": email, "listingId": lid,
			"amount": amount, "currency": currency, "method": method, "status": status,
			"purpose": purpose, "reference": ref, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/custom-fields ───────────────────────────────────────────────

func (s *server) adminListCustomFields(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, label, field_type, options, required, applies_to, sort_order, is_active
		  FROM custom_fields ORDER BY sort_order ASC, id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, order int
		var slug, label, ftype, applies string
		var options []any
		var required, active bool
		if err := rows.Scan(&id, &slug, &label, &ftype, &options, &required, &applies, &order, &active); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "slug": slug, "label": label, "fieldType": ftype,
			"options": options, "required": required, "appliesTo": applies,
			"sortOrder": order, "isActive": active,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── /api/admin/auction-verifications ───────────────────────────────────────

func (s *server) adminListAuctionVerifications(w http.ResponseWriter, r *http.Request) {
	rows, err := s.pool.Query(r.Context(), `
		SELECT av.id, av.listing_id, COALESCE(av.seller_id,0), COALESCE(av.sheet_url,''),
		       COALESCE(av.grade,''), COALESCE(av.notes,''), av.status, av.created_at,
		       COALESCE(l.title,'')
		  FROM auction_verifications av
		  LEFT JOIN listings l ON l.id = av.listing_id
		 ORDER BY av.created_at DESC LIMIT 500`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, lid, sid int64
		var sheet, grade, notes, status, title string
		var createdAt time.Time
		if err := rows.Scan(&id, &lid, &sid, &sheet, &grade, &notes, &status, &createdAt, &title); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "listingId": lid, "sellerId": sid, "sheetUrl": sheet,
			"grade": grade, "notes": notes, "status": status,
			"createdAt": createdAt, "listingTitle": title,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── helpers ────────────────────────────────────────────────────────────────

func atoi(s string, fallback int) int {
	if s == "" {
		return fallback
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return fallback
	}
	return n
}

func clampInt(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// pgx.ErrNoRows alias to keep imports tidy when admin handlers grow.
var _ = pgx.ErrNoRows
var _ = errors.New
