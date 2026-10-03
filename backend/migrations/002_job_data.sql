CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    logo_url VARCHAR(512),
    logo_source VARCHAR(50) DEFAULT 'official',
    website_url VARCHAR(255),
    domain VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    headquarters VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_normalized_name ON companies (LOWER(normalized_name));

CREATE TABLE IF NOT EXISTS job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    source_type VARCHAR(50),
    website VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    source_id UUID REFERENCES job_sources(id),
    external_job_id VARCHAR(255),
    source_name VARCHAR(100),
    source_url VARCHAR(512),
    application_url VARCHAR(512),
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    remote_type VARCHAR(50),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'INR',
    salary_formatted VARCHAR(100),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    experience_years_required VARCHAR(50),
    description TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    external_url VARCHAR(512),
    duplicate_of_id UUID REFERENCES jobs(id),
    source_count INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified_source BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_jobs_title ON jobs (title);
CREATE INDEX IF NOT EXISTS ix_jobs_company_id ON jobs (company_id);
CREATE INDEX IF NOT EXISTS ix_jobs_location ON jobs (location);
CREATE INDEX IF NOT EXISTS ix_jobs_remote_type ON jobs (remote_type);
CREATE INDEX IF NOT EXISTS ix_jobs_employment_type ON jobs (employment_type);
CREATE INDEX IF NOT EXISTS ix_jobs_experience_level ON jobs (experience_level);
CREATE INDEX IF NOT EXISTS ix_jobs_posted_at ON jobs (posted_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_jobs_source_external_id
    ON jobs (source_id, external_job_id)
    WHERE source_id IS NOT NULL AND external_job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_saved_jobs_user_job UNIQUE (user_id, job_id)
);
CREATE INDEX IF NOT EXISTS ix_saved_jobs_user_id ON saved_jobs (user_id);
CREATE INDEX IF NOT EXISTS ix_saved_jobs_job_id ON saved_jobs (job_id);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'started',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interview_date TIMESTAMP,
    notes TEXT,
    salary_offer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_applications_user_job UNIQUE (user_id, job_id)
);
CREATE INDEX IF NOT EXISTS ix_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS ix_applications_job_id ON applications (job_id);
CREATE INDEX IF NOT EXISTS ix_applications_status ON applications (status);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id);

CREATE TABLE IF NOT EXISTS connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255),
    provider_username VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    scopes JSONB DEFAULT '[]'::jsonb,
    profile_url VARCHAR(512),
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'connected',
    summary_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);
CREATE INDEX IF NOT EXISTS ix_connected_accounts_user_id ON connected_accounts (user_id);
