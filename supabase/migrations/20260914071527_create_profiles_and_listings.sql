/*
# Create profiles and listings tables for Campus Mart

1. New Tables
   - `profiles`
     - `id` (uuid, PK, references auth.users) — the user's auth ID
     - `full_name` (text, not null) — student's full name
     - `email` (text, not null) — student email
     - `created_at` (timestamptz, default now())
   - `listings`
     - `id` (uuid, PK, default gen_random_uuid())
     - `seller_id` (uuid, NOT NULL, default auth.uid(), references profiles) — owner
     - `title` (text, not null)
     - `description` (text, not null)
     - `category` (text, not null) — Books, Electronics, Stationery, Calculators, Lab Equipment, Other
     - `condition` (text, not null) — New, Like New, Good, Used
     - `price` (numeric, not null)
     - `price_type` (text, not null) — Fixed or Negotiable
     - `contact` (text, not null) — phone number
     - `location` (text, not null) — college/location
     - `image_url` (text) — URL to uploaded image in Supabase Storage
     - `status` (text, not null, default 'active') — active or sold
     - `created_at` (timestamptz, default now())

2. Security
   - RLS enabled on both `profiles` and `listings`.
   - profiles: users can view/update only their own profile row.
   - listings: all authenticated users can view active listings; users can insert/update/delete only their own listings.

3. Storage
   - Creates a public bucket `listing-images` for storing item images.
   - Storage policies allow authenticated users to upload, and public read access for viewing.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
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

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active listings
DROP POLICY IF EXISTS "select_active_listings" ON listings;
CREATE POLICY "select_active_listings" ON listings
  FOR SELECT TO authenticated
  USING (true);

-- Users can only create listings for themselves
DROP POLICY IF EXISTS "insert_own_listings" ON listings;
CREATE POLICY "insert_own_listings" ON listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Users can only update their own listings
DROP POLICY IF EXISTS "update_own_listings" ON listings;
CREATE POLICY "update_own_listings" ON listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Users can only delete their own listings
DROP POLICY IF EXISTS "delete_own_listings" ON listings;
CREATE POLICY "delete_own_listings" ON listings
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

-- INDEX for common queries
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- STORAGE BUCKET for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload, anyone can read
DROP POLICY IF EXISTS "Allow public read of listing images" ON storage.objects;
CREATE POLICY "Allow public read of listing images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Allow authenticated upload to listing-images" ON storage.objects;
CREATE POLICY "Allow authenticated upload to listing-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Allow authenticated update to listing-images" ON storage.objects;
CREATE POLICY "Allow authenticated update to listing-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Allow authenticated delete from listing-images" ON storage.objects;
CREATE POLICY "Allow authenticated delete from listing-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images');