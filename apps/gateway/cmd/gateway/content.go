package main

import (
	"net/http"
	"strconv"
	"time"

	gwlog "github.com/redspotsproduction-sudo/pakizzle/gateway/internal/logger"
)

// ── /api/banners ───────────────────────────────────────────────────────────
// Active homepage hero banners, ordered by display_order then id.
func (s *server) listBanners(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, name, image_url, type,
		       target_id, external_link, status, display_order, created_at, updated_at
		  FROM banners
		 WHERE status = 'active'
		 ORDER BY display_order ASC, id ASC
		 LIMIT 50`)
	if err != nil {
		log.Error("content.banners query failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load banners")
		return
	}
	defer rows.Close()

	out := []map[string]any{}
	for rows.Next() {
		var (
			id                                              int64
			slug, name, imageURL, btype, status             string
			targetID, externalLink                          *string
			displayOrder                                    int
			createdAt, updatedAt                            time.Time
		)
		if err := rows.Scan(&id, &slug, &name, &imageURL, &btype,
			&targetID, &externalLink, &status, &displayOrder, &createdAt, &updatedAt); err != nil {
			log.Warn("content.banners scan failed", "err", err)
			continue
		}
		out = append(out, map[string]any{
			"id":           strconv.FormatInt(id, 10),
			"slug":         slug,
			"name":         name,
			"image":        imageURL,
			"type":         btype,
			"targetId":     targetID,
			"externalLink": externalLink,
			"status":       status,
			"displayOrder": displayOrder,
			"createdAt":    createdAt,
			"updatedAt":    updatedAt,
		})
	}
	if err := rows.Err(); err != nil {
		log.Warn("content.banners rows iter failed", "err", err)
	}
	w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	writeJSON(w, http.StatusOK, out)
}

// ── /api/showcase-categories ──────────────────────────────────────────────
// Active CategoryShowcase tiles, ordered by sort_order then id.
func (s *server) listShowcaseCategories(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())
	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, title, subtitle, icon, color, gradient, image_url,
		       filter_key, filter_value, tile_size, sort_order
		  FROM showcase_categories
		 WHERE is_active = TRUE
		 ORDER BY sort_order ASC, id ASC
		 LIMIT 100`)
	if err != nil {
		log.Error("content.showcase query failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load categories")
		return
	}
	defer rows.Close()

	out := []map[string]any{}
	for rows.Next() {
		var (
			id                                                            int64
			slug, title, subtitle, icon, color, gradient, imageURL        string
			filterKey, filterValue, tileSize                              string
			sortOrder                                                     int
		)
		if err := rows.Scan(&id, &slug, &title, &subtitle, &icon, &color, &gradient,
			&imageURL, &filterKey, &filterValue, &tileSize, &sortOrder); err != nil {
			log.Warn("content.showcase scan failed", "err", err)
			continue
		}
		out = append(out, map[string]any{
			"id":          strconv.FormatInt(id, 10),
			"slug":        slug,
			"title":       title,
			"subtitle":    subtitle,
			"icon":        icon,
			"color":       color,
			"gradient":    gradient,
			"image":       imageURL,
			"filterKey":   filterKey,
			"filterValue": filterValue,
			"size":        tileSize,
			"sortOrder":   sortOrder,
		})
	}
	if err := rows.Err(); err != nil {
		log.Warn("content.showcase rows iter failed", "err", err)
	}
	w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	writeJSON(w, http.StatusOK, out)
}

// ── /api/news ──────────────────────────────────────────────────────────────
// Active news articles, newest first. Bounded offset pagination (admin-ish list).
func (s *server) listNews(w http.ResponseWriter, r *http.Request) {
	log := gwlog.FromContext(r.Context())

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 || limit > 50 {
		limit = 12
	}
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if offset < 0 {
		offset = 0
	}

	rows, err := s.pool.Query(r.Context(), `
		SELECT id, slug, title, category, image_url, excerpt, external_url, published_at
		  FROM news_articles
		 WHERE is_active = TRUE
		 ORDER BY published_at DESC, id DESC
		 LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		log.Error("content.news query failed", "err", err)
		writeError(w, http.StatusInternalServerError, "db", "could not load news")
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		var (
			id                                int64
			slug, title, category, imageURL   string
			excerpt, externalURL              *string
			publishedAt                       time.Time
		)
		if err := rows.Scan(&id, &slug, &title, &category, &imageURL, &excerpt, &externalURL, &publishedAt); err != nil {
			log.Warn("content.news scan failed", "err", err)
			continue
		}
		items = append(items, map[string]any{
			"id":          strconv.FormatInt(id, 10),
			"slug":        slug,
			"title":       title,
			"category":    category,
			"image":       imageURL,
			"excerpt":     excerpt,
			"externalUrl": externalURL,
			"publishedAt": publishedAt,
		})
	}
	if err := rows.Err(); err != nil {
		log.Warn("content.news rows iter failed", "err", err)
	}
	w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "limit": limit, "offset": offset})
}
