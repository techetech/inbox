-- Secure Email Platform Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mailboxes table
CREATE TABLE IF NOT EXISTS mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
    from_email VARCHAR(255),
    to_emails TEXT[], -- Array of email addresses
    cc_emails TEXT[], -- Array of email addresses
    bcc_emails TEXT[], -- Array of email addresses
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    message_id TEXT, -- RFC2822 Message-ID header
    received_at TIMESTAMPTZ DEFAULT NOW(),
    direction SMALLINT NOT NULL, -- 0: inbound, 1: outbound
    status VARCHAR(50) DEFAULT 'pending', -- pending, delivered, quarantined, blocked, deleted
    priority INTEGER DEFAULT 3, -- 1: high, 3: normal, 5: low
    
    -- Authentication results
    spf_result VARCHAR(50), -- pass, fail, softfail, neutral, none, temperror, permerror
    dkim_result VARCHAR(50), -- pass, fail, neutral, policy, temperror, permerror
    dmarc_result VARCHAR(50), -- pass, fail, temperror, permerror
    dmarc_policy VARCHAR(50), -- none, quarantine, reject
    
    -- Security scanning results
    scan_status VARCHAR(50) DEFAULT 'pending', -- pending, clean, suspicious, malicious
    threat_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_key TEXT NOT NULL, -- S3 key or file path
    size BIGINT NOT NULL,
    mime_type VARCHAR(255),
    content_id VARCHAR(255), -- For inline attachments
    
    -- Antivirus scan results
    scan_status VARCHAR(50) DEFAULT 'pending', -- pending, clean, infected, error
    virus_name TEXT,
    scan_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- URL scans table
CREATE TABLE IF NOT EXISTS url_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain VARCHAR(255),
    normalized_url TEXT, -- After following redirects
    
    -- Reputation results
    verdict VARCHAR(50) DEFAULT 'unknown', -- safe, suspicious, malicious, unknown
    reputation_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    
    -- Detection details
    is_phishing BOOLEAN DEFAULT FALSE,
    is_malware BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    is_suspicious_tld BOOLEAN DEFAULT FALSE,
    is_url_shortener BOOLEAN DEFAULT FALSE,
    is_punycode BOOLEAN DEFAULT FALSE,
    
    -- External service results (JSON)
    google_safe_browsing JSONB,
    virus_total JSONB,
    phishtank JSONB,
    
    scan_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sender reputation table
CREATE TABLE IF NOT EXISTS sender_reputation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_domain VARCHAR(255) NOT NULL,
    sender_ip INET,
    
    -- Reputation metrics
    reputation_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    message_count INTEGER DEFAULT 0,
    spam_count INTEGER DEFAULT 0,
    phishing_count INTEGER DEFAULT 0,
    
    -- Domain analysis
    domain_age_days INTEGER,
    has_spf BOOLEAN DEFAULT FALSE,
    has_dkim BOOLEAN DEFAULT FALSE,
    has_dmarc BOOLEAN DEFAULT FALSE,
    
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quarantine log table
CREATE TABLE IF NOT EXISTS quarantine_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- quarantined, released, blocked
    reason TEXT,
    admin_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email rules table (for custom filtering)
CREATE TABLE IF NOT EXISTS email_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL, -- Rule conditions in JSON format
    actions JSONB NOT NULL, -- Actions to take in JSON format
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_mailbox_id ON messages(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages(received_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_url_scans_message_id ON url_scans(message_id);
CREATE INDEX IF NOT EXISTS idx_url_scans_domain ON url_scans(domain);
CREATE INDEX IF NOT EXISTS idx_sender_reputation_domain ON sender_reputation(email_domain);
CREATE INDEX IF NOT EXISTS idx_sender_reputation_ip ON sender_reputation(sender_ip);

-- Create a default admin user (password: admin123 - change in production!)
INSERT INTO users (id, email, password_hash, name, role, created_at)
VALUES (
    uuid_generate_v4(),
    'admin@localhost',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewTdl78OlT6.Gzv6', -- admin123
    'System Administrator',
    'admin',
    NOW()
) ON CONFLICT (email) DO NOTHING;
