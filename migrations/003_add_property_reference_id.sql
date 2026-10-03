-- Migration 003: Professional Property ID & Reference ID System
-- Separate public human-shareable reference_id (6-8 digits) from internal DB id

-- 1. Create or update listings table
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    reference_id VARCHAR(16) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    property_type VARCHAR(100) NOT NULL DEFAULT 'House',
    purpose VARCHAR(50) NOT NULL DEFAULT 'for-sale',
    price NUMERIC(15, 2) NOT NULL,
    area_sqft NUMERIC(10, 2),
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'draft', 'pending_approval', 'active', 'sold', 'deleted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure reference_id column exists if table was pre-existing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'listings' AND column_name = 'reference_id'
    ) THEN 
        ALTER TABLE listings ADD COLUMN reference_id VARCHAR(16) UNIQUE;
    END IF;
END $$;

-- 2. Performance & Unique Index for Reference ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_reference_id ON listings(reference_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);

-- 3. Dedicated Registry for Immutability & Anti-Reuse
-- Guarantees reference_id is NEVER reused even if a listing is deleted or archived
CREATE TABLE IF NOT EXISTS reserved_reference_ids (
    reference_id VARCHAR(16) PRIMARY KEY,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    listing_id VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_reserved_reference_ids_ref ON reserved_reference_ids(reference_id);
