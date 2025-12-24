-- Create users_table migration
-- Run this in Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS "users_table" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	"stripe_id" text NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "idx_users_table_email" ON "users_table" ("email");

-- Add comment to table
COMMENT ON TABLE "users_table" IS 'User accounts and Stripe integration';

