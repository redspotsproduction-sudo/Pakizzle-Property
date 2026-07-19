-- Pakizzle v2 — homepage content tables.
-- Idempotent. Backs the Hero / CategoryShowcase / FeaturedNews surfaces so
-- images and copy are editable in the DB instead of hard-coded in React.

-- ── banners (homepage hero rotator) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
    id            BIGSERIAL PRIMARY KEY,
    slug          TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    image_url     TEXT NOT NULL,
    type          TEXT NOT NULL DEFAULT 'external',  -- 'category' | 'advertisement' | 'external'
    target_id     TEXT,                              -- listing id / category id when type != external
    external_link TEXT,                              -- only when type = 'external'
    country       TEXT,                              -- optional location targeting
    state         TEXT,
    city          TEXT,
    status        TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'inactive'
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_banners_active_order
    ON banners(status, display_order) WHERE status = 'active';

-- ── showcase_categories (CategoryShowcase tiles) ──────────────────────────
CREATE TABLE IF NOT EXISTS showcase_categories (
    id           BIGSERIAL PRIMARY KEY,
    slug         TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    subtitle     TEXT NOT NULL DEFAULT '',
    icon         TEXT NOT NULL DEFAULT 'Sparkles',     -- lucide-react icon name
    color        TEXT NOT NULL DEFAULT 'text-apple-blue',
    gradient     TEXT NOT NULL DEFAULT 'from-apple-blue/20 to-indigo-500/10',
    image_url    TEXT NOT NULL,
    filter_key   TEXT NOT NULL DEFAULT '',            -- marketplace query param key
    filter_value TEXT NOT NULL DEFAULT '',            -- ... and its value
    tile_size    TEXT NOT NULL DEFAULT 'small',       -- 'small' | 'medium' | 'large'
    sort_order   INT NOT NULL DEFAULT 0,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_showcase_active_order
    ON showcase_categories(is_active, sort_order) WHERE is_active = TRUE;

-- ── news_articles (FeaturedNews) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
    id           BIGSERIAL PRIMARY KEY,
    slug         TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    category     TEXT NOT NULL DEFAULT 'Industry News',
    image_url    TEXT NOT NULL,
    excerpt      TEXT,
    body         TEXT,
    external_url TEXT,                                -- if article lives off-site
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_active_published
    ON news_articles(is_active, published_at DESC) WHERE is_active = TRUE;

-- ── seeds (idempotent; DB edits survive redeploy) ─────────────────────────
INSERT INTO banners (slug, name, image_url, type, display_order) VALUES
  ('hero-mercedes-s-class',  'Mercedes-Benz S-Class',     'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&q=80&w=2000', 'external', 0),
  ('hero-porsche-911',       'Porsche 911 Carrera',       'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000', 'external', 1),
  ('hero-range-rover',       'Range Rover Autobiography', 'https://images.unsplash.com/photo-1605897472359-85e4b9482223?auto=format&fit=crop&q=80&w=2000', 'external', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO showcase_categories
  (slug, title, subtitle, icon, color, gradient, image_url, filter_key, filter_value, tile_size, sort_order) VALUES
  ('electric-hybrid',  'Electric & Hybrid', 'The Future of Mobility',   'Zap',        'text-apple-green',  'from-apple-green/20 to-emerald-500/10', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800', 'fuelType',  'Hybrid',    'large',  0),
  ('luxury-sedans',    'Luxury Sedans',     'Unmatched Comfort',        'Gem',        'text-apple-blue',   'from-apple-blue/20 to-indigo-500/10',   'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800', 'bodyType',  'Sedan',     'medium', 1),
  ('suv-adventure',    'SUV & 4x4',         'Explore Any Terrain',      'Mountain',   'text-apple-orange', 'from-apple-orange/20 to-amber-500/10',  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', 'bodyType',  'SUV',       'medium', 2),
  ('city-hatchbacks',  'City Hatchbacks',   'Compact & Efficient',      'Car',        'text-rose-500',     'from-rose-500/20 to-pink-500/10',       'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800', 'bodyType',  'Hatchback', 'small',  3),
  ('verified-sellers', 'Verified Listings', '100% Trust Guaranteed',    'Shield',     'text-apple-blue',   'from-apple-blue/20 to-sky-500/10',      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800', 'verified',  'true',      'small',  4),
  ('budget-friendly',  'Under 3M PKR',      'Great Value Deals',        'TrendingUp', 'text-apple-green',  'from-apple-green/20 to-teal-500/10',    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800', 'priceMax',  '3000000',   'small',  5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news_articles (slug, title, category, image_url, published_at) VALUES
  ('rise-of-evs-pakistan-2026',   'The Rise of EVs in Pakistan: What to Expect in 2026', 'Industry News', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800', '2025-10-12T00:00:00Z'),
  ('top-5-luxury-suvs-northern',  'Top 5 Luxury SUVs for the Northern Areas',            'Guides',        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', '2025-10-10T00:00:00Z'),
  ('audi-etron-gt-masterclass',   'Audi e-tron GT: A Masterclass in Electric Performance', 'Reviews',     'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=800', '2025-10-08T00:00:00Z')
ON CONFLICT (slug) DO NOTHING;
