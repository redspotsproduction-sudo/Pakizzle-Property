-- Pakizzle v2 — admin / operations schema.
-- Idempotent. Adds tables and columns needed by the v1 Admin Panel features
-- (audit log, settings KV, dealers, payments, reports, request CRMs for
-- inspections/insurance/financing, pricing plans, content pages, custom
-- fields, banlist) plus listing-status transitions for the approval flow.

-- ── extend users with ban/suspend tracking ────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at  TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- ── extend listings with admin status + reject reason ─────────────────────
-- status set may now include: draft|active|pending|rejected|banned|sold|expired
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reject_reason TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_at   TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_by   BIGINT REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id, created_at DESC);

-- ── audit_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    actor_email TEXT,
    action      TEXT NOT NULL,            -- 'user.ban' | 'listing.approve' | ...
    target_type TEXT,                     -- 'user' | 'listing' | 'banner' | ...
    target_id   TEXT,
    meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_recent ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_logs(actor_id, created_at DESC);

-- ── admin_settings (generic key/value) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
    key        TEXT PRIMARY KEY,
    value      JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id)
);

-- ── dealers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dealers (
    id            BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    slug          TEXT UNIQUE NOT NULL,
    city          TEXT,
    phone         TEXT,
    whatsapp      TEXT,
    address       TEXT,
    logo_url      TEXT,
    cover_url     TEXT,
    status        TEXT NOT NULL DEFAULT 'pending',  -- pending|active|suspended|rejected
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    listings_count INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);

-- ── payments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    listing_id   BIGINT REFERENCES listings(id) ON DELETE SET NULL,
    amount       BIGINT NOT NULL,                 -- PKR
    currency     TEXT NOT NULL DEFAULT 'PKR',
    method       TEXT,                             -- 'card'|'bank'|'easypaisa'|...
    status       TEXT NOT NULL DEFAULT 'pending',  -- pending|completed|failed|refunded
    purpose      TEXT,                             -- 'featured_listing'|'subscription'|...
    reference    TEXT,
    meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_user   ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, created_at DESC);

-- ── reports (user-submitted reports about listings / users) ───────────────
CREATE TABLE IF NOT EXISTS reports (
    id              BIGSERIAL PRIMARY KEY,
    reporter_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    target_type     TEXT NOT NULL,                 -- 'listing' | 'user' | 'chat'
    target_id       TEXT NOT NULL,
    reason          TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'open',  -- open|resolved|dismissed
    resolution_note TEXT,
    resolved_at     TIMESTAMPTZ,
    resolved_by     BIGINT REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- ── inspection_requests ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inspection_requests (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name     TEXT,
    customer_email    TEXT,
    customer_phone    TEXT,
    vehicle_make      TEXT,
    vehicle_model     TEXT,
    vehicle_year      INT,
    vehicle_city      TEXT,
    address           TEXT,
    package           TEXT,                          -- 'basic'|'standard'|'premium'
    preferred_date    TIMESTAMPTZ,
    status            TEXT NOT NULL DEFAULT 'pending', -- pending|scheduled|completed|cancelled
    inspector_id      BIGINT REFERENCES users(id),
    report_url        TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspection_status ON inspection_requests(status, created_at DESC);

-- ── insurance_requests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_requests (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name   TEXT,
    customer_email  TEXT,
    customer_phone  TEXT,
    vehicle_make    TEXT,
    vehicle_model   TEXT,
    vehicle_year    INT,
    vehicle_value   BIGINT,
    plan            TEXT,                             -- 'comprehensive'|'third-party'|...
    provider        TEXT,
    quoted_premium  BIGINT,
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending|quoted|bound|cancelled
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_requests(status, created_at DESC);

-- ── financing_requests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financing_requests (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name   TEXT,
    customer_email  TEXT,
    customer_phone  TEXT,
    vehicle_make    TEXT,
    vehicle_model   TEXT,
    vehicle_year    INT,
    vehicle_price   BIGINT,
    down_payment    BIGINT,
    tenure_months   INT,
    employment      TEXT,
    monthly_income  BIGINT,
    bank            TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',  -- pending|reviewing|approved|rejected|disbursed
    approved_amount BIGINT,
    rate_apr        NUMERIC(5,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_financing_status ON financing_requests(status, created_at DESC);

-- ── pricing_plans (featured-listing & dealer subscription tiers) ──────────
CREATE TABLE IF NOT EXISTS pricing_plans (
    id              SERIAL PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'featured', -- 'featured'|'dealer'|'inspection'|'insurance'
    description     TEXT,
    price           BIGINT NOT NULL,                  -- PKR
    duration_days   INT NOT NULL DEFAULT 30,
    features        JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── content pages (Privacy / Terms / About / etc.) ────────────────────────
CREATE TABLE IF NOT EXISTS content_pages (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by  BIGINT REFERENCES users(id),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── custom_fields (admin-defined listing extras) ──────────────────────────
CREATE TABLE IF NOT EXISTS custom_fields (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    label       TEXT NOT NULL,
    field_type  TEXT NOT NULL DEFAULT 'text',   -- 'text'|'number'|'select'|'boolean'
    options     JSONB NOT NULL DEFAULT '[]'::jsonb,
    required    BOOLEAN NOT NULL DEFAULT FALSE,
    applies_to  TEXT NOT NULL DEFAULT 'listing',
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── auction_verifications ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auction_verifications (
    id          BIGSERIAL PRIMARY KEY,
    listing_id  BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    sheet_url   TEXT,
    grade       TEXT,
    notes       TEXT,
    status      TEXT NOT NULL DEFAULT 'pending',   -- pending|verified|rejected
    reviewer_id BIGINT REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auction_verif_status ON auction_verifications(status, created_at DESC);

-- ── seed: a couple of pricing plans + content pages so admin has data ─────
INSERT INTO pricing_plans (slug, name, category, description, price, duration_days, features, sort_order) VALUES
  ('featured-7',  'Featured 7 Days',   'featured', 'Top of search for 7 days',  1500,  7,  '["Top placement","Highlight badge"]'::jsonb, 1),
  ('featured-30', 'Featured 30 Days',  'featured', 'Top of search for 30 days', 4500,  30, '["Top placement","Highlight badge","Social share"]'::jsonb, 2),
  ('dealer-pro',  'Dealer Pro',        'dealer',   'Up to 50 active listings + storefront', 25000, 30, '["50 listings","Storefront","Verified badge"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_pages (slug, title, body) VALUES
  ('about',         'About Pakizzle',  'Pakistan''s trusted vehicle marketplace.'),
  ('privacy',       'Privacy Policy',  'We respect your privacy.'),
  ('terms',         'Terms of Service','By using Pakizzle you agree to these terms.')
ON CONFLICT (slug) DO NOTHING;
