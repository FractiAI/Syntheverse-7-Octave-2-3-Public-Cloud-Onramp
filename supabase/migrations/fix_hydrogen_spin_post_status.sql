-- Fix blog post status: Update "Is Hydrogen Spin the Answer to Every Question?" to published
-- Run this in Supabase SQL Editor if the post is showing as draft

UPDATE blog_posts
SET 
  status = 'published',
  published_at = COALESCE(published_at, NOW())
WHERE 
  title ILIKE '%Hydrogen Spin%'
  AND status != 'published';

-- Verify the update
SELECT id, title, status, published_at, created_at
FROM blog_posts
WHERE title ILIKE '%Hydrogen Spin%';

