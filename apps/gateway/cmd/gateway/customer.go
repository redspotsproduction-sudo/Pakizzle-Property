package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/redspotsproduction-sudo/pakizzle/gateway/internal/auth"
	gwlog "github.com/redspotsproduction-sudo/pakizzle/gateway/internal/logger"
)

// claimsFrom is a small accessor so handlers don't repeat the type assertion.
func claimsFrom(r *http.Request) *auth.Claims {
	c, _ := r.Context().Value(ctxClaimsKey).(*auth.Claims)
	return c
}

// ── GET /api/me/listings ───────────────────────────────────────────────────
// All listings owned by the current user, regardless of status (so they can
// see their drafts / pending / rejected items from the customer dashboard).
func (s *server) myListings(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, title, COALESCE(description,''), price, year, COALESCE(city,''),
		       COALESCE(status,'draft'), images, view_count, created_at, updated_at,
		       COALESCE(reject_reason,'')
		  FROM listings WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 200`, c.UserID)
	if err != nil {
		gwlog.FromContext(r.Context()).Error("me.listings query failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load your listings")
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var title, desc, city, status, rej string
		var price int64
		var year, views int
		var images []string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &title, &desc, &price, &year, &city, &status, &images, &views, &createdAt, &updatedAt, &rej); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "title": title, "description": desc, "price": price,
			"year": year, "city": city, "status": status, "images": images,
			"viewCount": views, "createdAt": createdAt, "updatedAt": updatedAt,
			"rejectReason": rej,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

// ── GET /api/me/analytics ──────────────────────────────────────────────────
// Snapshot of seller activity for the customer dashboard.
func (s *server) myAnalytics(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	var (
		totalListings, active, pending, sold int64
		totalViews                           int64
		wishlistSaves                        int64
	)
	row := s.pool.QueryRow(r.Context(), `
		SELECT
		  COUNT(*) FILTER (WHERE seller_id=$1),
		  COUNT(*) FILTER (WHERE seller_id=$1 AND status='active'),
		  COUNT(*) FILTER (WHERE seller_id=$1 AND status='pending'),
		  COUNT(*) FILTER (WHERE seller_id=$1 AND status='sold'),
		  COALESCE(SUM(view_count) FILTER (WHERE seller_id=$1), 0)
		FROM listings`, c.UserID)
	if err := row.Scan(&totalListings, &active, &pending, &sold, &totalViews); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	_ = s.pool.QueryRow(r.Context(),
		`SELECT COUNT(*) FROM wishlists w JOIN listings l ON l.id=w.listing_id WHERE l.seller_id=$1`,
		c.UserID).Scan(&wishlistSaves)
	writeJSON(w, http.StatusOK, map[string]any{
		"totalListings": totalListings,
		"activeListings": active,
		"pendingListings": pending,
		"soldListings": sold,
		"totalViews": totalViews,
		"wishlistSaves": wishlistSaves,
	})
}

// ── GET /api/me/wishlist ───────────────────────────────────────────────────

func (s *server) myWishlist(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	rows, err := s.pool.Query(r.Context(), `
		SELECT l.id, l.title, l.price, l.year, COALESCE(l.city,''), l.status,
		       l.images, w.created_at
		  FROM wishlists w JOIN listings l ON l.id = w.listing_id
		 WHERE w.user_id = $1 ORDER BY w.created_at DESC LIMIT 200`, c.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var title, city, status string
		var price int64
		var year int
		var images []string
		var savedAt time.Time
		if err := rows.Scan(&id, &title, &price, &year, &city, &status, &images, &savedAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "title": title, "price": price, "year": year,
			"city": city, "status": status, "images": images, "savedAt": savedAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *server) addWishlist(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	var in struct {
		ListingID int64 `json:"listingId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil || in.ListingID <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "listingId required")
		return
	}
	if _, err := s.pool.Exec(r.Context(),
		`INSERT INTO wishlists (user_id, listing_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
		c.UserID, in.ListingID); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (s *server) removeWishlist(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "validation", "bad id")
		return
	}
	if _, err := s.pool.Exec(r.Context(),
		`DELETE FROM wishlists WHERE user_id=$1 AND listing_id=$2`, c.UserID, id); err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

// ── GET /api/me/notifications ──────────────────────────────────────────────

func (s *server) myNotifications(w http.ResponseWriter, r *http.Request) {
	c := claimsFrom(r)
	if c == nil {
		writeError(w, http.StatusUnauthorized, "auth", "missing auth")
		return
	}
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, type, title, COALESCE(body,''), COALESCE(link,''),
		       read_at, created_at
		  FROM notifications WHERE user_id=$1
		 ORDER BY created_at DESC LIMIT 100`, c.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db", err.Error())
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var ntype, title, body, link string
		var readAt *time.Time
		var createdAt time.Time
		if err := rows.Scan(&id, &ntype, &title, &body, &link, &readAt, &createdAt); err != nil {
			continue
		}
		out = append(out, map[string]any{
			"id": id, "type": ntype, "title": title, "body": body,
			"link": link, "readAt": readAt, "createdAt": createdAt,
		})
	}
	writeJSON(w, http.StatusOK, out)
}
