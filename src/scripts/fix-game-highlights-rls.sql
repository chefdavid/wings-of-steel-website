-- Fix RLS Policies for Game Highlights
-- This makes the table accessible for admin operations

-- First, drop existing policies
DROP POLICY IF EXISTS "Public can view published game highlights" ON game_highlights;
DROP POLICY IF EXISTS "Authenticated users can view all game highlights" ON game_highlights;
DROP POLICY IF EXISTS "Authenticated users can insert game highlights" ON game_highlights;
DROP POLICY IF EXISTS "Authenticated users can update game highlights" ON game_highlights;
DROP POLICY IF EXISTS "Authenticated users can delete game highlights" ON game_highlights;

-- Temporarily disable RLS for easier admin access
-- IMPORTANT: Re-enable this for production with proper auth
ALTER TABLE game_highlights DISABLE ROW LEVEL SECURITY;

-- Also fix storage policies - make them more permissive
DROP POLICY IF EXISTS "Public can view game photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload game photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update game photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete game photos" ON storage.objects;

-- Allow anyone to view game photos (they're public anyway)
CREATE POLICY "Anyone can view game photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-photos');

-- Allow anyone to upload/update/delete (for now - tighten this later with auth)
CREATE POLICY "Anyone can upload game photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-photos');

CREATE POLICY "Anyone can update game photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'game-photos');

CREATE POLICY "Anyone can delete game photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'game-photos');

-- Add a comment
COMMENT ON TABLE game_highlights IS 'Game highlights table - RLS temporarily disabled for admin access. Enable and add auth later.';
