-- Create chat-images and chat-files storage buckets for SynthChat file uploads
-- This should be done in Supabase Dashboard → Storage → Create Bucket
-- Or use the Supabase CLI

-- Note: This SQL cannot create buckets directly. Use Supabase Dashboard or CLI:
-- supabase storage create chat-images --public
-- supabase storage create chat-files --public

-- Bucket 1: chat-images
-- Name: chat-images
-- Public: true
-- File size limit: 10MB (10485760 bytes)
-- Allowed MIME types: image/*

-- Bucket 2: chat-files
-- Name: chat-files
-- Public: true
-- File size limit: 20MB (20971520 bytes)
-- Allowed MIME types: application/pdf

-- After creating the buckets, set up RLS policies:
-- Allow authenticated users to upload
-- Allow public read access

-- Instructions:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Create "chat-images" bucket:
--    - Name: chat-images
--    - Public: Yes
--    - File size limit: 10MB
--    - Allowed MIME types: image/*
-- 4. Create "chat-files" bucket:
--    - Name: chat-files
--    - Public: Yes
--    - File size limit: 20MB
--    - Allowed MIME types: application/pdf

