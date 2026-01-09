# WorkChat Setup - Storage Bucket RLS Policies

## Overview

The new WhatsApp-style WorkChat interface requires a Supabase storage bucket for image uploads.

## Required Setup

### Complete SQL Setup (ONE STEP!)

Go to Supabase Dashboard → **SQL Editor** and run the complete setup script:

**Location:** `supabase/migrations/20260109000002_workchat_setup.sql`

This single SQL file creates:
- ✅ All 3 chat tables (chat_rooms, chat_messages, chat_participants)
- ✅ All 12 RLS policies
- ✅ Storage bucket (workchat-images) with policies
- ✅ Indexes for performance
- ✅ Unique constraints

**Or copy/paste this SQL:**

```sql
-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workchat-images', 
  'workchat-images', 
  true,
  5242880, -- 5MB limit for images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Remove any existing policies
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workchat-images'
);

-- Policy 2: Allow public read access
CREATE POLICY "Public read access for chat images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'workchat-images'
);

-- Policy 3: Allow users to update their own images
CREATE POLICY "Users can update their own chat images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workchat-images' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'workchat-images' AND
  auth.uid() = owner
);

-- Policy 4: Allow users to delete their own images
CREATE POLICY "Users can delete their own chat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'workchat-images' AND
  auth.uid() = owner
);
```

### Step 3: Verify

1. Go to **Storage** → **Policies**
2. Filter by `workchat-images`
3. You should see 4 policies:
   - ✅ Authenticated users can upload chat images
   - ✅ Public read access for chat images
   - ✅ Users can update their own chat images
   - ✅ Users can delete their own chat images

## Features

### Chat Interface

- **WhatsApp/iPhone-style UI** with message bubbles
- **Real-time updates** (polls every 3 seconds)
- **Responsive design** (mobile-first)
- **Back navigation** to dashboard

### Message Search

- Search by message content
- Search by sender name
- Search by sender email
- Case-insensitive matching
- Results count display
- Clear search button

### File Uploads

#### Images:
- **Formats:** JPEG, PNG, GIF, WebP
- **Max size:** 5MB
- **Preview** before sending
- **Click to view** full-size in new tab

#### PDFs:
- **Format:** PDF only
- **Max size:** 10MB
- **Download link** in messages
- **File name** display

### Message Display

- **Sent messages:** Green bubbles (right-aligned)
- **Received messages:** White bubbles (left-aligned)
- **Timestamps:** Smart formatting
  - Today: "3:45 PM"
  - Older: "Jan 8, 3:45 PM"
- **Sender names** on received messages
- **Attachment preview** in messages

## Usage

### Navigating to Chat

1. Go to any dashboard
2. Find **WorkChat Navigator** section
3. Click on any chat room row
4. Automatically navigates to `/workchat/[roomId]`
5. If not connected, auto-joins room first

### Sending Messages

1. Type message in input field
2. Or click 📷 icon to upload image
3. Or click 📄 icon to upload PDF
4. Preview appears above input
5. Click send button (green circle with arrow)
6. Message appears in chat immediately

### Searching Messages

1. Click 🔍 icon in header
2. Search bar appears
3. Type search term
4. Results filter in real-time
5. Shows count of matching messages
6. Click ❌ to clear search

## API Endpoints

All endpoints require authentication:

1. **GET /api/workchat/rooms/[roomId]**
   - Returns room details & participants

2. **GET /api/workchat/rooms/[roomId]/messages**
   - Returns messages for room (500 most recent)

3. **POST /api/workchat/upload-image**
   - Uploads image to storage
   - Returns public URL

4. **POST /api/workchat/upload-file** (existing)
   - Uploads PDF file
   - Returns public URL

## Security

- ✅ Authentication required for all chat actions
- ✅ Must be room participant to view messages
- ✅ File size limits enforced (images 5MB, PDFs 10MB)
- ✅ File type validation (images only, PDFs only)
- ✅ Users can only modify/delete their own uploads
- ✅ Public read access for message display

## Troubleshooting

**Issue:** Image upload fails with 403 error

**Solution:** Run the SQL above to create RLS policies

---

**Issue:** Can't see messages in chat

**Solution:** Ensure you're a participant of the room (check chat_participants table)

---

**Issue:** Chat doesn't update

**Solution:** Messages poll every 3 seconds - wait or refresh page

---

## Next Steps

Once the SQL is run and bucket is set up:

1. ✅ Navigate to a chat room from WorkChatNavigator
2. ✅ Try sending a text message
3. ✅ Try uploading an image
4. ✅ Try uploading a PDF
5. ✅ Try searching messages
6. ✅ Verify on mobile devices

All features should work immediately! 🚀

