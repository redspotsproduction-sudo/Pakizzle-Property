-- Migration 002: Modern Layered Authentication Architecture
-- Extends the existing users table without breaking JWT issuance or bcrypt password hashes.
-- Adds: OAuth Linkage, HttpOnly Refresh Token Sessions, WebAuthn Passkeys, and Security Audit Logs.

-- 1. Extend Users Table for Social OAuth, Biometrics & Secondary Recovery Methods
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'apple'
    ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS passkey_registered BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Prevent duplicate social links while allowing NULLs for local accounts
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_unique 
    ON users(oauth_provider, oauth_id) 
    WHERE oauth_provider != 'local' AND oauth_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_secondary_email ON users(secondary_email);

-- 2. Sessions & Refresh Tokens Table (Short-lived Access Token + Secure HttpOnly Refresh Token)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL, -- SHA-256 hash of the cryptographically random refresh token
    device_info VARCHAR(255) NOT NULL, -- e.g. "Safari on iPhone 15 Pro", "Chrome 124 on macOS"
    device_type VARCHAR(50) DEFAULT 'desktop', -- 'mobile', 'tablet', 'desktop'
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

-- 3. WebAuthn / FIDO2 Passkeys Table (Biometric Face ID / Touch ID / Fingerprint credentials)
CREATE TABLE IF NOT EXISTS passkey_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id VARCHAR(512) UNIQUE NOT NULL, -- Base64URL-encoded WebAuthn credential ID
    public_key TEXT NOT NULL, -- Base64URL-encoded public key or PEM SPKI format
    counter BIGINT NOT NULL DEFAULT 0, -- Counter to detect replay attacks
    device_name VARCHAR(120) NOT NULL, -- e.g. "iPhone 15 Pro (Face ID)", "MacBook Pro (Touch ID)"
    transports TEXT[] DEFAULT ARRAY['internal']::TEXT[], -- 'internal', 'hybrid', 'usb', 'nfc', 'ble'
    aaguid VARCHAR(64), -- Authenticator Attestation GUID for hardware brand detection
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkey_credentials(credential_id);

-- 4. Auth Security & Step-Up Verification Logs
CREATE TABLE IF NOT EXISTS auth_security_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(60) NOT NULL, -- 'login_success', 'step_up_triggered', 'step_up_verified', 'session_revoked', 'passkey_used', 'passwordless_otp'
    auth_method VARCHAR(40) NOT NULL, -- 'password', 'passkey', 'google', 'apple', 'email_otp', 'phone_otp'
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_summary VARCHAR(150),
    is_suspicious BOOLEAN DEFAULT FALSE,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_security_logs(created_at);
