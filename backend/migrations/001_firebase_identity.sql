CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    display_name VARCHAR(255),
    photo_url VARCHAR(512),
    hashed_password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_version VARCHAR(50),
    terms_accepted_at TIMESTAMP,
    last_login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ALTER COLUMN firebase_uid TYPE VARCHAR(128);
ALTER TABLE users ALTER COLUMN firebase_uid SET NOT NULL;
UPDATE users SET email = LOWER(email);

CREATE INDEX IF NOT EXISTS ix_users_firebase_uid ON users (firebase_uid);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_case_insensitive ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_version VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS ix_user_consents_user_id ON user_consents (user_id);
