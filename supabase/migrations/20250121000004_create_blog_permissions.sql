-- Create blog_permissions table to control who can create blog posts
-- Creator can grant blog creation access to contributors, operators, or keep it creator-only

CREATE TABLE IF NOT EXISTS "blog_permissions" (
  "id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
  "allow_contributors" boolean DEFAULT false NOT NULL,
  "allow_operators" boolean DEFAULT true NOT NULL,
  "allow_creator" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" text -- Email of creator who last updated
);

-- Insert default permissions (only creator and operators can create)
INSERT INTO blog_permissions (id, allow_contributors, allow_operators, allow_creator, updated_by)
VALUES ('main', false, true, true, 'system')
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blog_permissions_updated_at
  BEFORE UPDATE ON blog_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_permissions_updated_at();

