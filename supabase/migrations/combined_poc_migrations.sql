-- Combined PoC Database Migrations
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- Migration 1: Create PoC tables (contributions, tokenomics, epoch_balances, allocations)
CREATE TABLE IF NOT EXISTS "allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_hash" text NOT NULL,
	"contributor" text NOT NULL,
	"metal" text NOT NULL,
	"epoch" text NOT NULL,
	"tier" text,
	"reward" numeric(20, 0) NOT NULL,
	"tier_multiplier" numeric(10, 4) DEFAULT '1.0' NOT NULL,
	"epoch_balance_before" numeric(20, 0) NOT NULL,
	"epoch_balance_after" numeric(20, 0) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "contributions" (
	"submission_hash" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"contributor" text NOT NULL,
	"content_hash" text NOT NULL,
	"text_content" text,
	"pdf_path" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"category" text,
	"metals" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "epoch_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"epoch" text NOT NULL,
	"balance" numeric(20, 0) NOT NULL,
	"threshold" numeric(20, 0) NOT NULL,
	"distribution_amount" numeric(20, 0) NOT NULL,
	"distribution_percent" numeric(5, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tokenomics" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"total_supply" numeric(20, 0) DEFAULT '90000000000000' NOT NULL,
	"total_distributed" numeric(20, 0) DEFAULT '0' NOT NULL,
	"current_epoch" text DEFAULT 'founder' NOT NULL,
	"founder_halving_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Migration 2: Create PoC log table for audit trail
CREATE TABLE IF NOT EXISTS "poc_log" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_hash" text NOT NULL,
	"contributor" text NOT NULL,
	"event_type" text NOT NULL,
	"event_status" text,
	"title" text,
	"category" text,
	"request_data" jsonb,
	"response_data" jsonb,
	"evaluation_result" jsonb,
	"grok_api_request" jsonb,
	"grok_api_response" jsonb,
	"error_message" text,
	"error_stack" text,
	"processing_time_ms" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_contributions_contributor" ON "contributions" ("contributor");
CREATE INDEX IF NOT EXISTS "idx_contributions_status" ON "contributions" ("status");
CREATE INDEX IF NOT EXISTS "idx_contributions_content_hash" ON "contributions" ("content_hash");
CREATE INDEX IF NOT EXISTS "idx_poc_log_submission_hash" ON "poc_log" ("submission_hash");
CREATE INDEX IF NOT EXISTS "idx_poc_log_contributor" ON "poc_log" ("contributor");
CREATE INDEX IF NOT EXISTS "idx_poc_log_event_type" ON "poc_log" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_poc_log_created_at" ON "poc_log" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_allocations_submission_hash" ON "allocations" ("submission_hash");
CREATE INDEX IF NOT EXISTS "idx_allocations_contributor" ON "allocations" ("contributor");
CREATE INDEX IF NOT EXISTS "idx_epoch_balances_epoch" ON "epoch_balances" ("epoch");

-- Initialize default tokenomics state if not exists
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO NOTHING;

-- Initialize default epoch balances if not exists
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '0', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '0', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '0', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '0', 12.5)
ON CONFLICT ("id") DO NOTHING;


