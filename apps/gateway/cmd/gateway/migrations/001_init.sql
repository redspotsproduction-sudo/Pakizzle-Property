-- Pakizzle v2 schema. Idempotent — safe to run on every gateway boot.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ── users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    full_name       TEXT NOT NULL DEFAULT '',
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    phone           TEXT,
    role            TEXT NOT NULL DEFAULT 'user',
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    identity_status TEXT NOT NULL DEFAULT 'none',
    business_status TEXT NOT NULL DEFAULT 'none',
    badge           TEXT NOT NULL DEFAULT 'none',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── profiles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    user_id      BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT,
    city         TEXT,
    avatar_url   TEXT,
    bio          TEXT,
    whatsapp     TEXT,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── otp codes (email + phone) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
    id          BIGSERIAL PRIMARY KEY,
    purpose     TEXT NOT NULL,        -- 'email' | 'phone'
    target      TEXT NOT NULL,        -- email address or phone number
    code_hash   TEXT NOT NULL,
    attempts    INT NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_codes(purpose, target, consumed_at);

-- ── catalogue: makes / models / variants ──────────────────────────────────
CREATE TABLE IF NOT EXISTS car_makes (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    slug       TEXT UNIQUE NOT NULL,
    logo_url   TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS car_models (
    id         SERIAL PRIMARY KEY,
    make_id    INT REFERENCES car_makes(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    slug       TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(make_id, slug)
);
CREATE TABLE IF NOT EXISTS car_variants (
    id           SERIAL PRIMARY KEY,
    model_id     INT REFERENCES car_models(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    slug         TEXT NOT NULL,
    engine_cc    TEXT,
    fuel_type    TEXT,
    transmission TEXT,
    body_type    TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(model_id, slug)
);

-- ── listings ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
    id           BIGSERIAL PRIMARY KEY,
    seller_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make_id      INT REFERENCES car_makes(id),
    model_id     INT REFERENCES car_models(id),
    variant_id   INT REFERENCES car_variants(id),
    title        TEXT NOT NULL,
    description  TEXT,
    price        BIGINT NOT NULL,           -- PKR
    year         INT NOT NULL,
    mileage      INT,
    city         TEXT,
    condition    TEXT,
    transmission TEXT,
    fuel_type    TEXT,
    color        TEXT,
    images       TEXT[] NOT NULL DEFAULT '{}',
    status       TEXT NOT NULL DEFAULT 'active',
    view_count   INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_makemodel ON listings(make_id, model_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- ── catalogue seed (idempotent via ON CONFLICT) ───────────────────────────
INSERT INTO car_makes (id, name, slug, logo_url, sort_order) VALUES
  (1, 'Toyota',  'toyota',  'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg', 1),
  (2, 'Honda',   'honda',   'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg', 2),
  (3, 'Suzuki',  'suzuki',  'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg', 3),
  (4, 'Kia',     'kia',     NULL, 4),
  (5, 'Hyundai', 'hyundai', NULL, 5),
  (6, 'MG',      'mg',      NULL, 6),
  (7, 'Changan', 'changan', NULL, 7),
  (8, 'Proton',  'proton',  NULL, 8)
ON CONFLICT (slug) DO NOTHING;
SELECT setval('car_makes_id_seq', GREATEST((SELECT MAX(id) FROM car_makes), 1));

INSERT INTO car_models (id, make_id, name, slug, sort_order) VALUES
  (1, 1, 'Corolla',  'corolla',  1),
  (2, 1, 'Camry',    'camry',    2),
  (3, 1, 'Yaris',    'yaris',    3),
  (4, 1, 'Fortuner', 'fortuner', 4),
  (5, 2, 'Civic',    'civic',    1),
  (6, 2, 'City',     'city',     2),
  (7, 2, 'BR-V',     'brv',      3),
  (8, 3, 'Alto',     'alto',     1),
  (9, 3, 'Cultus',   'cultus',   2),
  (10, 3, 'Swift',   'swift',    3),
  (11, 3, 'Wagon R', 'wagonr',   4),
  (12, 4, 'Sportage', 'sportage', 1),
  (13, 4, 'Picanto', 'picanto',  2),
  (14, 5, 'Tucson',  'tucson',   1),
  (15, 5, 'Elantra', 'elantra',  2),
  (16, 6, 'HS',      'hs',       1),
  (17, 7, 'Alsvin',  'alsvin',   1),
  (18, 8, 'Saga',    'saga',     1)
ON CONFLICT (make_id, slug) DO NOTHING;
SELECT setval('car_models_id_seq', GREATEST((SELECT MAX(id) FROM car_models), 1));

INSERT INTO car_variants (model_id, name, slug, engine_cc, fuel_type, transmission, body_type) VALUES
  (1, 'GLi 1.3',    'gli-1300',    '1300', 'petrol', 'manual',    'sedan'),
  (1, 'Altis 1.6',  'altis-1600',  '1600', 'petrol', 'automatic', 'sedan'),
  (1, 'XLi 1.3',    'xli-1300',    '1300', 'petrol', 'manual',    'sedan'),
  (5, 'RS Turbo',   'rs-turbo',    '1500', 'petrol', 'cvt',       'sedan'),
  (5, 'Oriel',      'oriel',       '1800', 'petrol', 'cvt',       'sedan'),
  (8, '660 VXR',    '660-vxr',     '660',  'petrol', 'manual',    'hatchback'),
  (8, '660 VXL AGS','660-vxl-ags', '660',  'petrol', 'cvt',       'hatchback'),
  (10, 'GL CVT',    'gl-cvt',      '1200', 'petrol', 'cvt',       'hatchback')
ON CONFLICT (model_id, slug) DO NOTHING;
