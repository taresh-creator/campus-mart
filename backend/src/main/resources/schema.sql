-- Supabase PostgreSQL Schema for Campus Mart (Java Backend)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text,
  created_at timestamptz DEFAULT now()
);

-- If profiles was previously created referencing auth.users, remove that FK constraint:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Ensure password and default uuid exist if table was already created
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password text;

-- Ensure email unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_email_key' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  condition text NOT NULL,
  price numeric(10,2) NOT NULL,
  price_type text NOT NULL DEFAULT 'Fixed',
  contact text NOT NULL,
  location text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
