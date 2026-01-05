-- ============================================================================
-- Enterprise Dashboard Tables Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Creates tables for Enterprise Frontier Sandbox functionality
-- ============================================================================

-- Enterprise Sandbox Table
CREATE TABLE IF NOT EXISTS "enterprise_sandboxes" (
    "id" text PRIMARY KEY NOT NULL,
    "operator" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "vault_status" text NOT NULL DEFAULT 'paused',
    "tokenized" boolean DEFAULT false,
    "token_address" text,
    "token_name" text,
    "token_symbol" text,
    "token_supply" numeric(20, 0),
    "current_epoch" text NOT NULL DEFAULT 'founder',
    "scoring_config" jsonb,
    "subscription_tier" text,
    "node_count" integer DEFAULT 0,
    "stripe_subscription_id" text,
    "stripe_customer_id" text,
    "metadata" jsonb,
    "created_at" timestamp without time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT now() NOT NULL
);

-- Enterprise Sandbox Contributions Table
CREATE TABLE IF NOT EXISTS "enterprise_contributions" (
    "submission_hash" text PRIMARY KEY NOT NULL,
    "sandbox_id" text NOT NULL,
    "title" text NOT NULL,
    "contributor" text NOT NULL,
    "content_hash" text NOT NULL,
    "text_content" text,
    "pdf_path" text,
    "status" text NOT NULL DEFAULT 'evaluating',
    "category" text,
    "metals" jsonb,
    "metadata" jsonb,
    "embedding" jsonb,
    "vector_x" numeric(20, 10),
    "vector_y" numeric(20, 10),
    "vector_z" numeric(20, 10),
    "embedding_model" text,
    "vector_generated_at" timestamp without time zone,
    "registered" boolean DEFAULT false,
    "registration_date" timestamp without time zone,
    "registration_tx_hash" text,
    "stripe_payment_id" text,
    "created_at" timestamp without time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT now() NOT NULL
);

-- Enterprise Sandbox Allocations Table
CREATE TABLE IF NOT EXISTS "enterprise_allocations" (
    "id" text PRIMARY KEY NOT NULL,
    "sandbox_id" text NOT NULL,
    "submission_hash" text NOT NULL,
    "contributor" text NOT NULL,
    "metal" text NOT NULL,
    "epoch" text NOT NULL,
    "tier" text,
    "reward" numeric(20, 0) NOT NULL,
    "tier_multiplier" numeric(10, 4) DEFAULT '1.0' NOT NULL,
    "epoch_balance_before" numeric(20, 0) NOT NULL,
    "epoch_balance_after" numeric(20, 0) NOT NULL,
    "created_at" timestamp without time zone DEFAULT now() NOT NULL
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS "idx_enterprise_sandboxes_operator" ON "enterprise_sandboxes" ("operator");
CREATE INDEX IF NOT EXISTS "idx_enterprise_sandboxes_vault_status" ON "enterprise_sandboxes" ("vault_status");
CREATE INDEX IF NOT EXISTS "idx_enterprise_sandboxes_subscription_tier" ON "enterprise_sandboxes" ("subscription_tier");

CREATE INDEX IF NOT EXISTS "idx_enterprise_contributions_sandbox_id" ON "enterprise_contributions" ("sandbox_id");
CREATE INDEX IF NOT EXISTS "idx_enterprise_contributions_contributor" ON "enterprise_contributions" ("contributor");
CREATE INDEX IF NOT EXISTS "idx_enterprise_contributions_status" ON "enterprise_contributions" ("status");
CREATE INDEX IF NOT EXISTS "idx_enterprise_contributions_created_at" ON "enterprise_contributions" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_enterprise_allocations_sandbox_id" ON "enterprise_allocations" ("sandbox_id");
CREATE INDEX IF NOT EXISTS "idx_enterprise_allocations_submission_hash" ON "enterprise_allocations" ("submission_hash");
CREATE INDEX IF NOT EXISTS "idx_enterprise_allocations_contributor" ON "enterprise_allocations" ("contributor");

-- Add Foreign Key Constraints (optional, for referential integrity)
-- Note: These will fail if sandbox_id references don't exist yet
-- ALTER TABLE "enterprise_contributions" 
--     ADD CONSTRAINT "fk_enterprise_contributions_sandbox" 
--     FOREIGN KEY ("sandbox_id") REFERENCES "enterprise_sandboxes"("id") ON DELETE CASCADE;

-- ALTER TABLE "enterprise_allocations" 
--     ADD CONSTRAINT "fk_enterprise_allocations_sandbox" 
--     FOREIGN KEY ("sandbox_id") REFERENCES "enterprise_sandboxes"("id") ON DELETE CASCADE;

-- Add Comments for Documentation
COMMENT ON TABLE "enterprise_sandboxes" IS 'Enterprise Frontier Sandbox instances - nested PoC environments within Syntheverse';
COMMENT ON TABLE "enterprise_contributions" IS 'Contributions submitted to enterprise sandboxes - evaluated by SynthScan MRI';
COMMENT ON TABLE "enterprise_allocations" IS 'Token allocations for qualified contributions within enterprise sandboxes';

COMMENT ON COLUMN "enterprise_sandboxes"."vault_status" IS 'Status: active or paused';
COMMENT ON COLUMN "enterprise_sandboxes"."subscription_tier" IS 'Pricing tier: Pioneer, Trading Post, Settlement, or Metropolis';
COMMENT ON COLUMN "enterprise_sandboxes"."node_count" IS 'Number of nodes purchased in subscription';
COMMENT ON COLUMN "enterprise_sandboxes"."scoring_config" IS 'JSON config for custom scoring weights and thresholds';

