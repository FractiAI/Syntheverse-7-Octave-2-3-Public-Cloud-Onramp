-- Create blog-images storage bucket for blog post images
-- This should be run in Supabase Dashboard → Storage → Create Bucket
-- Or use the Supabase CLI

-- Note: This SQL cannot create buckets directly. Use Supabase Dashboard or CLI:
-- supabase storage create blog-images --public

-- Bucket configuration:
-- Name: blog-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- After creating the bucket, set up RLS policies:
-- Allow authenticated users with creator/operator role to upload
-- Allow public read access

