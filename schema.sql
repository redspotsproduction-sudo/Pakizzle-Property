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
