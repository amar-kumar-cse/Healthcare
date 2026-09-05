-- ==========================================================
-- MediCompare - Supabase PostgreSQL Schema
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==========================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'hospital_admin')),
    phone TEXT DEFAULT '',
    favorites UUID[] DEFAULT '{}',
    medical_reports TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address JSONB DEFAULT '{}'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    distance TEXT DEFAULT '',
    verified BOOLEAN DEFAULT false,
    logo TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    website TEXT DEFAULT '',
    description TEXT DEFAULT '',
    amenities TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_price NUMERIC(10, 2) NOT NULL,
    patient_name TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON public.hospitals(name);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals(location);
CREATE INDEX IF NOT EXISTS idx_hospitals_rating ON public.hospitals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_hospitals_specializations ON public.hospitals USING GIN (specializations);
CREATE INDEX IF NOT EXISTS idx_services_hospital_id ON public.services(hospital_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hospital_id ON public.bookings(hospital_id);

-- Function and trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_hospitals_updated_at ON public.hospitals;
CREATE TRIGGER trg_hospitals_updated_at
    BEFORE UPDATE ON public.hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- MediCompare backend manages JWT authentication and access control.
-- We enable RLS and grant full permissions to both anon and service_role
-- so the Express backend can execute queries smoothly with any key.
-- ==========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for backend api users" ON public.users;
CREATE POLICY "Allow all for backend api users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for backend api hospitals" ON public.hospitals;
CREATE POLICY "Allow all for backend api hospitals" ON public.hospitals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for backend api services" ON public.services;
CREATE POLICY "Allow all for backend api services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for backend api bookings" ON public.bookings;
CREATE POLICY "Allow all for backend api bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
