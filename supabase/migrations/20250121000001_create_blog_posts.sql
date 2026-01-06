-- Create blog_posts table for blog functionality
-- Supports both main Syntheverse blog and sandbox-specific blogs

CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "excerpt" text,
  "author" text NOT NULL, -- Email of the author
  "author_name" text, -- Display name of the author
  "sandbox_id" text, -- NULL for main Syntheverse blog, sandbox ID for sandbox-specific blogs
  "status" text NOT NULL DEFAULT 'draft', -- draft, published, archived
  "published_at" timestamp,
  "featured" boolean DEFAULT false,
  "tags" jsonb, -- Array of tag strings
  "metadata" jsonb, -- Additional metadata
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "blog_posts_sandbox_id_fkey" FOREIGN KEY ("sandbox_id") REFERENCES "enterprise_sandboxes"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_blog_posts_sandbox_id" ON "blog_posts" ("sandbox_id");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_status" ON "blog_posts" ("status");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_published_at" ON "blog_posts" ("published_at");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_author" ON "blog_posts" ("author");

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

