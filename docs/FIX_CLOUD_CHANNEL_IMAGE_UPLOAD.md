# Fix Cloud Channel Image Upload - RLS Policy Error

## Problem

Cloud Channel image uploads are failing with error:
```
StorageApiError: new row violates row-level security policy
status: 400, statusCode: '403'
```

## Root Cause

The `social-media-images` Supabase Storage bucket doesn't have the correct Row Level Security (RLS) policies configured to allow authenticated users to upload images.

## Solution

Run the SQL migration in Supabase to fix the RLS policies.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration SQL

Copy and paste the contents of:
```
supabase/migrations/20260109000000_fix_social_media_images_rls.sql
```

Or copy this SQL directly:

```sql
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
```

### Step 3: Execute the Query

Click **Run** button in the SQL Editor.

### Step 4: Verify

1. Ensure all policies were created successfully
2. Check **Storage** → **Policies** in Supabase dashboard
3. You should see 4 new policies for `social-media-images` bucket

## What These Policies Do

1. **Authenticated users can upload images**: Any logged-in user can upload images to the bucket
2. **Public read access**: Anyone can view/download images (needed for posts to display publicly)
3. **Users can update their own images**: Users can only update images they uploaded
4. **Users can delete their own images**: Users can only delete images they uploaded

## Testing

After applying the migration:

1. Log in to the app
2. Go to any dashboard with Cloud Channel
3. Click **New Transmission**
4. Try uploading an image
5. Upload should succeed and image should display in the post

## Verification in Supabase Dashboard

To verify the policies are working:

1. Go to **Storage** in Supabase dashboard
2. Click on **social-media-images** bucket
3. Click **Policies** tab
4. You should see all 4 policies listed and enabled

## Security Notes

- ✅ Only authenticated users can upload
- ✅ Public read access allows posts to be visible to everyone
- ✅ Users can only modify/delete their own uploads
- ✅ Bucket is organized by sandbox for better organization
- ✅ File size limited to 5MB in API route
- ✅ Only image types allowed in API route

## Troubleshooting

If uploads still fail after applying the migration:

1. **Check if bucket exists**: Go to Storage → Buckets, ensure `social-media-images` exists
2. **Check if bucket is public**: Bucket should have `public` flag set to `true`
3. **Verify policies are active**: All 4 policies should show as "Enabled" in dashboard
4. **Check API logs**: Look for specific error messages in Vercel logs
5. **Test authentication**: Ensure user is properly authenticated when uploading

## Related Files

- API Route: `app/api/social/upload-image/route.ts`
- Migration: `supabase/migrations/20260109000000_fix_social_media_images_rls.sql`
- Component: `components/CreatePostForm.tsx`

