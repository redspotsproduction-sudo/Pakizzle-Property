-- Database Schema for Verified Badge System

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    identity_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'approved', 'rejected'
    business_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'approved', 'rejected'
    verified_badge_type VARCHAR(20) DEFAULT 'none', -- 'none', 'basic', 'identity', 'business'
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification Requests Table
CREATE TABLE verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'identity', 'business'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification Documents Table
CREATE TABLE verification_documents (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES verification_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'cnic_front', 'cnic_back', 'passport', 'business_license'
    file_url TEXT NOT NULL,
    file_key TEXT NOT NULL, -- For S3/Cloudinary deletion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Action Logs Table
CREATE TABLE admin_actions_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- 'approve_identity', 'reject_identity', etc.
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- Car Makes, Models, and Variants
CREATE TABLE car_makes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE car_models (
    id SERIAL PRIMARY KEY,
    make_id INTEGER REFERENCES car_makes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make_id, slug)
);

CREATE TABLE car_variants (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES car_models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    engine_cc VARCHAR(20),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    body_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, slug)
);

-- Listings table update (conceptually, we'll keep the Vehicle type compatible but use these IDs)
-- In a real migration, we'd add make_id, model_id, variant_id to listings
-- For this demo, we'll focus on the dropdowns and their source tables.

-- Performance Indexes
CREATE INDEX idx_car_models_make ON car_models(make_id);
CREATE INDEX idx_car_variants_model ON car_variants(model_id);
CREATE INDEX idx_car_makes_active ON car_makes(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- Modern Layered Auth Architecture (OAuth, Sessions, Passkeys, Security Logs)
-- ============================================================================

-- OAuth & Passkey additions to users
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50) DEFAULT 'local',
    ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS passkey_registered BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_unique 
    ON users(oauth_provider, oauth_id) 
    WHERE oauth_provider != 'local' AND oauth_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_secondary_email ON users(secondary_email);

-- User Sessions Table (Short-lived Access Token + HttpOnly Refresh Token)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'desktop',
    ip_address VARCHAR(45) NOT NULL,
    approx_location VARCHAR(120) DEFAULT 'Lahore, Pakistan',
    is_current BOOLEAN DEFAULT FALSE,
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_revoked ON user_sessions(expires_at, is_revoked);

-- Passkey Credentials Table (WebAuthn FIDO2 / Face ID / Touch ID)
CREATE TABLE IF NOT EXISTS passkey_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id VARCHAR(512) UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    device_name VARCHAR(120) NOT NULL,
    transports TEXT[] DEFAULT ARRAY['internal']::TEXT[],
    aaguid VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkey_credentials(credential_id);

-- Auth Security & Step-Up Verification Logs Table
CREATE TABLE IF NOT EXISTS auth_security_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(60) NOT NULL,
    auth_method VARCHAR(40) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_summary VARCHAR(150),
    is_suspicious BOOLEAN DEFAULT FALSE,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_security_logs(created_at);

-- ============================================================================
-- Professional Property Reference ID System (Zameen-pattern Public Shareable ID)
-- ============================================================================

CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY, -- Internal DB id (never exposed to browser/users)
    reference_id VARCHAR(16) UNIQUE NOT NULL, -- 7-digit public shareable ID (e.g. 3421789)
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    property_type VARCHAR(100) NOT NULL DEFAULT 'House',
    purpose VARCHAR(50) NOT NULL DEFAULT 'for-sale',
    price NUMERIC(15, 2) NOT NULL,
    area_sqft NUMERIC(10, 2),
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_reference_id ON listings(reference_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);

-- Registry ensuring immutable, non-reusable reference IDs
CREATE TABLE IF NOT EXISTS reserved_reference_ids (
    reference_id VARCHAR(16) PRIMARY KEY,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    listing_id VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_reserved_reference_ids_ref ON reserved_reference_ids(reference_id);

