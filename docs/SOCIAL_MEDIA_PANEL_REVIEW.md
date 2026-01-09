# Collapsible Social Media Panel Implementation Review

**Review Date:** January 2025  
**Reviewer Role:** Senior Full Stack & Social Media Platform Developer  
**Target:** Collapsible Social Media Panel for Contributor Dashboard  
**Core Requirement:** Sandbox-linked community feed (posts, images, engagement) within a single collapsible panel component

---

## Executive Summary

This review outlines the requirements for implementing a **single collapsible social media panel** in the Contributor Dashboard. The panel will enable users to post content, view community feeds, and upload images—all organized by sandbox to create distinct communities. This follows the same architectural pattern as WorkChat (sandbox-based collaborative rooms) and uses the same collapsible `<details>` pattern as other dashboard panels.

**Key Design Principle:** Each sandbox has its own social feed, creating isolated communities while maintaining the Syntheverse ecosystem structure. The panel is collapsible to save screen space and follows the cockpit aesthetic of other dashboard panels.

---

## 1. Database Schema Requirements

### 1.1 Core Tables

#### `social_posts` Table
```sql
CREATE TABLE IF NOT EXISTS public.social_posts (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT, -- null = syntheverse (default), otherwise enterprise_sandboxes.id
  author_email TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('contributor', 'operator', 'creator')),
  content TEXT NOT NULL, -- Post text content
  image_url TEXT, -- URL to uploaded image (stored in Supabase Storage)
  image_path TEXT, -- Storage path for image
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE, -- For sandbox operators/creators to pin posts
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_social_posts_sandbox_id ON public.social_posts(sandbox_id);
CREATE INDEX idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX idx_social_posts_author_email ON public.social_posts(author_email);
CREATE INDEX idx_social_posts_sandbox_created ON public.social_posts(sandbox_id, created_at DESC);
```

#### `social_post_likes` Table
```sql
CREATE TABLE IF NOT EXISTS public.social_post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_email) -- Prevent duplicate likes
);

-- Indexes
CREATE INDEX idx_social_post_likes_post_id ON public.social_post_likes(post_id);
CREATE INDEX idx_social_post_likes_user_email ON public.social_post_likes(user_email);
```

#### `social_post_comments` Table
```sql
CREATE TABLE IF NOT EXISTS public.social_post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('contributor', 'operator', 'creator')),
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_social_post_comments_post_id ON public.social_post_comments(post_id);
CREATE INDEX idx_social_post_comments_created_at ON public.social_post_comments(created_at DESC);
```

### 1.2 Row Level Security (RLS) Policies

**Pattern:** Follow WorkChat RLS pattern - users can read posts in sandboxes they have access to, can post to sandboxes they're part of.

```sql
-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;

-- Posts: Read access for all authenticated users (sandbox-based filtering in API)
CREATE POLICY "Users can view posts in accessible sandboxes"
  ON public.social_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Posts: Insert for authenticated users
CREATE POLICY "Users can create posts"
  ON public.social_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = author_email);

-- Posts: Update/Delete only for post author or sandbox operator/creator
CREATE POLICY "Users can update own posts or operators can moderate"
  ON public.social_posts FOR UPDATE
  USING (
    auth.email() = author_email OR
    EXISTS (
      SELECT 1 FROM public.enterprise_sandboxes 
      WHERE id = sandbox_id 
      AND operator = auth.email()
    )
  );

-- Likes: Authenticated users can like/unlike
CREATE POLICY "Users can like posts"
  ON public.social_post_likes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = user_email);

-- Comments: Read for authenticated, insert for authenticated, update/delete for author
CREATE POLICY "Users can view comments"
  ON public.social_post_comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create comments"
  ON public.social_post_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = author_email);

CREATE POLICY "Users can update own comments"
  ON public.social_post_comments FOR UPDATE
  USING (auth.email() = author_email);
```

---

## 2. Storage Requirements

### 2.1 Supabase Storage Bucket

**Bucket Name:** `social-media-images`

**Configuration:**
- **Public:** Yes (for easy image display)
- **File Size Limit:** 5MB (same as blog images)
- **Allowed MIME Types:** `image/*` (jpeg, png, gif, webp)
- **Path Structure:** `social-media-images/{sandbox_id}/{post_id}/{filename}`

**RLS Policies for Storage:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'social-media-images' AND
    auth.role() = 'authenticated'
  );

-- Allow public read access
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-media-images');
```

### 2.2 Image Upload API Endpoint

**Pattern:** Follow `/api/blog/upload-image/route.ts` and `/api/workchat/upload-file/route.ts`

**Endpoint:** `POST /api/social/upload-image`

**Requirements:**
- Authenticate user
- Validate file type (images only)
- Validate file size (max 5MB)
- Generate unique filename with UUID
- Upload to `social-media-images` bucket
- Return public URL
- Link to sandbox context (optional sandbox_id parameter)

---

## 3. API Endpoints Required

### 3.1 Posts API

#### `GET /api/social/posts`
**Query Parameters:**
- `sandbox_id` (optional): Filter by sandbox (null = Syntheverse default)
- `limit` (optional): Pagination limit (default: 20)
- `offset` (optional): Pagination offset
- `author_email` (optional): Filter by author

**Response:**
```json
{
  "posts": [
    {
      "id": "post-id",
      "sandbox_id": "sandbox-id",
      "author_email": "user@example.com",
      "author_role": "contributor",
      "content": "Post content...",
      "image_url": "https://...",
      "likes_count": 5,
      "comments_count": 2,
      "is_pinned": false,
      "created_at": "2025-01-06T...",
      "author_liked": false, // Whether current user liked this post
      "author_name": "Display Name"
    }
  ],
  "total": 50,
  "has_more": true
}
```

#### `POST /api/social/posts`
**Body:**
```json
{
  "sandbox_id": "sandbox-id-or-null",
  "content": "Post content...",
  "image_url": "https://..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "post": { /* post object */ }
}
```

#### `DELETE /api/social/posts/[postId]`
**Response:**
```json
{
  "success": true
}
```

#### `POST /api/social/posts/[postId]/pin` (Operator/Creator only)
**Response:**
```json
{
  "success": true,
  "pinned": true
}
```

### 3.2 Likes API

#### `POST /api/social/posts/[postId]/like`
**Response:**
```json
{
  "success": true,
  "liked": true,
  "likes_count": 6
}
```

#### `DELETE /api/social/posts/[postId]/like`
**Response:**
```json
{
  "success": true,
  "liked": false,
  "likes_count": 5
}
```

### 3.3 Comments API

#### `GET /api/social/posts/[postId]/comments`
**Query Parameters:**
- `limit` (optional): Default 50
- `offset` (optional)

**Response:**
```json
{
  "comments": [
    {
      "id": "comment-id",
      "post_id": "post-id",
      "author_email": "user@example.com",
      "author_role": "contributor",
      "content": "Comment text...",
      "created_at": "2025-01-06T...",
      "author_name": "Display Name"
    }
  ],
  "total": 10
}
```

#### `POST /api/social/posts/[postId]/comments`
**Body:**
```json
{
  "content": "Comment text..."
}
```

**Response:**
```json
{
  "success": true,
  "comment": { /* comment object */ }
}
```

#### `DELETE /api/social/posts/[postId]/comments/[commentId]`
**Response:**
```json
{
  "success": true
}
```

---

## 4. Frontend Components

### 4.1 Main Component: `SocialMediaPanel.tsx`

**Location:** `components/SocialMediaPanel.tsx`

**Features:**
- **Collapsible panel** (using `<details>` pattern like other dashboard panels - WorkChat Navigator, Broadcast Archive, etc.)
- Self-contained component that handles its own collapse/expand state
- Sandbox selector (inherits from dashboard sandbox selection)
- Post feed (infinite scroll or pagination)
- Create post form (text + image upload)
- Post cards with:
  - Author info (name, role badge, avatar)
  - Post content (text + optional image)
  - Like button (with count)
  - Comments button (with count)
  - Timestamp
  - Delete button (for own posts)
  - Pin indicator (for pinned posts)

**State Management:**
- `posts`: Array of post objects
- `loading`: Loading state
- `selectedSandbox`: Current sandbox (from localStorage or props)
- `showCreatePost`: Boolean for create post form
- `imagePreview`: Preview of uploaded image before posting

**Key Functions:**
- `fetchPosts(sandboxId, limit, offset)`: Load posts for sandbox
- `handleCreatePost(content, imageUrl)`: Create new post
- `handleLike(postId)`: Toggle like on post
- `handleDeletePost(postId)`: Delete own post
- `handleUploadImage(file)`: Upload image and get URL

### 4.2 Sub-Components

#### `PostCard.tsx`
- Displays individual post
- Like button with animation
- Image display (if present)
- Author info with role badge
- Timestamp formatting
- Delete button (conditional)

#### `CreatePostForm.tsx`
- Textarea for post content
- Image upload button
- Image preview
- Character counter (optional limit, e.g., 2000 chars)
- Submit button
- Cancel button

#### `PostComments.tsx`
- Expandable comments section
- Comment list
- Add comment form
- Delete own comments

#### `ImageUploadButton.tsx`
- File input (hidden)
- Upload button with icon
- Progress indicator (optional)
- Preview thumbnail

### 4.3 Integration with Dashboard

**Location in Dashboard:** Add after `BroadcastArchiveNavigator` in the left column navigation modules section

**Implementation:**
```tsx
{/* Social Media Panel - Collapsible */}
<details className="cockpit-panel" open>
  <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
    <div className="flex items-center justify-between">
      <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
        SOCIAL FEED
      </div>
      <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
    </div>
  </summary>
  <div className="px-4 md:px-5 pb-4 md:pb-5">
    <SocialMediaPanel />
  </div>
</details>
```

**Note:** The panel itself is collapsible via the `<details>` wrapper. The `SocialMediaPanel` component is a self-contained feed component that doesn't need its own collapse logic - it's wrapped by the dashboard's collapsible panel pattern.

---

## 5. Sandbox Integration

### 5.1 Sandbox Selection

**Pattern:** Follow `SandboxNavigator` pattern - read from localStorage or use dashboard-level sandbox selector.

**Key Points:**
- Default to Syntheverse (sandbox_id = null)
- Show enterprise sandboxes user has access to
- Filter posts by selected sandbox
- Update feed when sandbox selection changes

### 5.2 Access Control

**Syntheverse (default):**
- All authenticated users can view and post

**Enterprise Sandboxes:**
- View: Users who are participants or have access to sandbox
- Post: Same as view access
- Moderate: Sandbox operator/creator can pin/delete any post

---

## 6. UI/UX Considerations

### 6.1 Cockpit Aesthetic

**Styling:**
- Use existing cockpit CSS classes (`cockpit-panel`, `cockpit-text`, `cockpit-label`, etc.)
- Match WorkChat visual style (rounded message bubbles, timestamps)
- Use hydrogen-amber accents for interactive elements
- Dark theme with keyline borders

### 6.2 Mobile Responsiveness

**Requirements:**
- Responsive image sizing (max-width: 100%)
- Touch-friendly like/comment buttons (min 44px)
- Collapsible panels work on mobile
- Horizontal scroll for image galleries (if multiple images per post)

### 6.3 Real-Time Updates (Optional - Phase 2)

**Considerations:**
- Polling: Refresh posts every 10-30 seconds
- WebSockets: Real-time updates via Supabase Realtime (more complex)
- Manual refresh button (always available)

**Recommendation:** Start with polling + manual refresh, add WebSockets later if needed.

---

## 7. Security Considerations

### 7.1 Content Moderation

**Initial Implementation:**
- No automatic content filtering (rely on community)
- Operators/Creators can delete posts in their sandboxes
- Users can delete their own posts

**Future Enhancements:**
- Report post functionality
- Auto-moderation API integration
- Content policy enforcement

### 7.2 Rate Limiting

**Requirements:**
- Limit posts per user per hour (e.g., 10 posts/hour)
- Limit image uploads per user per day (e.g., 20 images/day)
- Prevent spam comments

**Implementation:**
- Use existing rate limiting utilities (`utils/rate-limit`)
- Add rate limit checks to POST endpoints

### 7.3 Image Security

**Requirements:**
- Validate file types server-side
- Scan for malicious content (optional - Phase 2)
- Limit file sizes (5MB max)
- Generate unique filenames (prevent overwrites)
- Store in sandbox-specific paths (organization)

---

## 8. Performance Considerations

### 8.1 Pagination

**Strategy:**
- Load 20 posts initially
- Infinite scroll or "Load More" button
- Cache posts in component state
- Clear cache on sandbox change

### 8.2 Image Optimization

**Requirements:**
- Client-side image compression before upload (optional)
- Serve images via CDN (Supabase Storage URLs)
- Lazy load images in feed
- Thumbnail generation (optional - Phase 2)

### 8.3 Database Queries

**Optimization:**
- Use indexes on `sandbox_id` and `created_at`
- Join author info in single query (avoid N+1)
- Cache like counts (update on like/unlike)
- Use materialized views for popular posts (optional - Phase 2)

---

## 9. Implementation Phases

### Phase 1: Core Functionality (MVP)
- ✅ Database schema and migrations
- ✅ Basic API endpoints (posts, likes, comments)
- ✅ Image upload endpoint
- ✅ `SocialMediaPanel` component
- ✅ Post feed display
- ✅ Create post form
- ✅ Like functionality
- ✅ Basic comments

### Phase 2: Enhanced Features
- ⏳ Real-time updates (WebSockets or improved polling)
- ⏳ Image galleries (multiple images per post)
- ⏳ Post editing
- ⏳ User mentions (@username)
- ⏳ Hashtags (#tag)
- ⏳ Post sharing
- ⏳ Notifications for likes/comments

### Phase 3: Advanced Features
- ⏳ Content moderation tools
- ⏳ Analytics dashboard (for operators)
- ⏳ Post scheduling
- ⏳ Rich text formatting
- ⏳ Video uploads
- ⏳ Post reactions (beyond just likes)

---

## 10. Similar Patterns to Follow

### 10.1 WorkChat Pattern (Primary Reference)

**Why:** WorkChat already implements sandbox-based collaborative rooms with:
- Sandbox linking (`sandbox_id` field)
- Participant tracking
- Message history
- File uploads
- Real-time updates

**Reusable Patterns:**
- Sandbox selection logic
- RLS policy structure
- API endpoint organization
- Component state management
- File upload flow

### 10.2 Blog Post Pattern

**Why:** Blog system has:
- Image uploads
- Rich content editing
- Sandbox-specific blogs
- Permission management

**Reusable Patterns:**
- Image upload API structure
- Storage bucket configuration
- Content creation forms

### 10.3 Broadcast Archive Pattern

**Why:** Similar feed-like display:
- Table-based navigation
- Filtering by status/type
- Collapsible panels
- Refresh functionality

**Reusable Patterns:**
- Feed display layout
- Filtering UI
- Refresh patterns

---

## 11. Estimated Development Effort

### Backend (API + Database)
- **Database Schema:** 2-3 hours
- **API Endpoints:** 6-8 hours
- **RLS Policies:** 2-3 hours
- **Storage Setup:** 1 hour
- **Testing:** 3-4 hours
- **Total Backend:** ~14-19 hours

### Frontend (Components + UI)
- **SocialMediaPanel Component:** 8-10 hours
- **PostCard Component:** 3-4 hours
- **CreatePostForm Component:** 4-5 hours
- **Comments Component:** 3-4 hours
- **Image Upload Integration:** 2-3 hours
- **Dashboard Integration:** 1-2 hours
- **Styling & Responsive:** 4-5 hours
- **Testing:** 3-4 hours
- **Total Frontend:** ~28-35 hours

### Total Estimated Effort: **42-54 hours** (5-7 working days)

---

## 12. Dependencies

### Existing Dependencies (Already Installed)
- ✅ Next.js 14 (App Router)
- ✅ React
- ✅ TypeScript
- ✅ Drizzle ORM
- ✅ Supabase Client
- ✅ Tailwind CSS
- ✅ shadcn/ui components

### No New Dependencies Required

---

## 13. Migration Strategy

### Step 1: Database Setup
1. Create migration file: `supabase/migrations/20250106000002_create_social_media_tables.sql`
2. Run migration in Supabase SQL Editor
3. Verify tables and indexes created
4. Test RLS policies

### Step 2: Storage Setup
1. Create `social-media-images` bucket in Supabase Dashboard
2. Configure bucket settings (public, size limits, MIME types)
3. Set up RLS policies for storage
4. Test image upload manually

### Step 3: API Development
1. Create API route files in `app/api/social/`
2. Implement endpoints incrementally
3. Test with Postman/curl
4. Add error handling and validation

### Step 4: Frontend Development
1. Create `SocialMediaPanel.tsx` component
2. Build sub-components incrementally
3. Integrate with dashboard
4. Test sandbox switching
5. Add responsive styling

### Step 5: Testing & Polish
1. Test all user flows
2. Test edge cases (empty states, errors)
3. Performance testing (large feeds)
4. Mobile device testing
5. Security review

---

## 14. Risk Assessment

### Low Risk
- ✅ Database schema (straightforward)
- ✅ Image uploads (pattern exists)
- ✅ Basic CRUD operations

### Medium Risk
- ⚠️ Performance with large feeds (mitigate with pagination)
- ⚠️ Real-time updates complexity (start with polling)
- ⚠️ Content moderation (rely on community initially)

### High Risk
- 🔴 None identified for MVP

---

## 15. Recommendations

### Immediate Actions
1. **Start with MVP:** Core posting, viewing, liking, commenting
2. **Follow WorkChat pattern:** Reuse proven sandbox-based architecture
3. **Use existing storage patterns:** Leverage blog/chat image upload code
4. **Implement pagination early:** Prevent performance issues

### Best Practices
1. **Sandbox isolation:** Ensure posts are properly scoped to sandboxes
2. **Soft deletes:** Use `is_deleted` flag for data recovery
3. **Optimistic UI updates:** Update UI immediately, sync with server
4. **Error handling:** Graceful degradation for network issues
5. **Accessibility:** Keyboard navigation, screen reader support

### Future Considerations
1. **Real-time updates:** Consider Supabase Realtime for live feeds
2. **Content moderation:** Plan for reporting and moderation tools
3. **Analytics:** Track engagement metrics per sandbox
4. **Notifications:** Alert users to likes/comments on their posts

---

## 16. Conclusion

The social media panel is **feasible and well-aligned** with existing architecture. The sandbox-based approach creates natural community boundaries while maintaining ecosystem coherence. Following the WorkChat pattern provides a proven foundation, and existing image upload patterns reduce implementation complexity.

**Key Success Factors:**
- ✅ Clear sandbox isolation
- ✅ Reuse of existing patterns (WorkChat, Blog, Storage)
- ✅ Incremental development (MVP first)
- ✅ Performance considerations (pagination, indexing)
- ✅ Security best practices (RLS, rate limiting)

**Recommended Approach:** Implement Phase 1 (MVP) first, gather user feedback, then iterate with Phase 2 features based on actual usage patterns.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Implementation

