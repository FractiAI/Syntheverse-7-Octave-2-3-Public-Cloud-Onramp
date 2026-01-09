-- Fix RLS policies for social-media-images storage bucket
-- Allows authenticated users to upload, view, update, and delete their own images

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media-images', 'social-media-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to ensure clean slate)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for social media images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'social-media-images'
);

-- Policy 2: Allow public read access to all images in the bucket
CREATE POLICY "Public read access for social media images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'social-media-images'
);

-- Policy 3: Allow users to update their own uploaded images
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'social-media-images' AND
  auth.uid()::text = owner
)
WITH CHECK (
  bucket_id = 'social-media-images' AND
  auth.uid()::text = owner
);

-- Policy 4: Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'social-media-images' AND
  auth.uid()::text = owner
);

