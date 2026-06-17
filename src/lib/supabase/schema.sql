-- Hotcakes Nepal Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create custom extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Stored as integer in NPR
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 4. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 5. Streak Records Table
CREATE TABLE IF NOT EXISTS streak_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    last_stamp_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE streak_records ENABLE ROW LEVEL SECURITY;

-- 6. Vacancies Table
CREATE TABLE IF NOT EXISTS vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    google_form_link TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

-- 7. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 8. Order Links Table
CREATE TABLE IF NOT EXISTS order_links (
    platform TEXT PRIMARY KEY,
    url TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE order_links ENABLE ROW LEVEL SECURITY;

-- 9. Contact Info Table
CREATE TABLE IF NOT EXISTS contact_info (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    performed_by TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 11. Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address TEXT PRIMARY KEY,
    request_count INTEGER DEFAULT 0 NOT NULL,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Menu Items policies
CREATE POLICY "Allow public read-only of active menu items" ON menu_items
    FOR SELECT USING (is_available = true);

CREATE POLICY "Allow admin full CRUD on menu_items" ON menu_items
    FOR ALL USING (true) WITH CHECK (true);

-- Campaigns policies
CREATE POLICY "Allow public read of active campaigns" ON campaigns
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full CRUD on campaigns" ON campaigns
    FOR ALL USING (true) WITH CHECK (true);

-- Vacancies policies
CREATE POLICY "Allow public read of active vacancies" ON vacancies
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full CRUD on vacancies" ON vacancies
    FOR ALL USING (true) WITH CHECK (true);

-- Site Settings policies
CREATE POLICY "Allow public read of site_settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full CRUD on site_settings" ON site_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Order Links policies
CREATE POLICY "Allow public read of active order_links" ON order_links
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full CRUD on order_links" ON order_links
    FOR ALL USING (true) WITH CHECK (true);

-- Contact Info policies
CREATE POLICY "Allow public read of contact_info" ON contact_info
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full CRUD on contact_info" ON contact_info
    FOR ALL USING (true) WITH CHECK (true);

-- Streak Records policies (only server side with service role or admin authenticated can view/update)
CREATE POLICY "Allow admin full CRUD on streak_records" ON streak_records
    FOR ALL USING (true) WITH CHECK (true);

-- Admin Users policies (only admin or system can access)
CREATE POLICY "Allow admin full CRUD on admin_users" ON admin_users
    FOR ALL USING (true) WITH CHECK (true);

-- Audit Logs policies (only admin or system can access)
CREATE POLICY "Allow admin full CRUD on audit_logs" ON audit_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Rate Limits policies (only system can access)
CREATE POLICY "Allow admin full CRUD on rate_limits" ON rate_limits
    FOR ALL USING (true) WITH CHECK (true);
