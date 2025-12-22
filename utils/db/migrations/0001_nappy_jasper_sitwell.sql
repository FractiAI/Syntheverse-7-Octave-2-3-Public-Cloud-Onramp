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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "epoch_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"epoch" text NOT NULL,
	"balance" numeric(20, 0) NOT NULL,
	"threshold" numeric(20, 0) NOT NULL,
	"distribution_amount" numeric(20, 0) NOT NULL,
	"distribution_percent" numeric(5, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokenomics" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"total_supply" numeric(20, 0) DEFAULT '90000000000000' NOT NULL,
	"total_distributed" numeric(20, 0) DEFAULT '0' NOT NULL,
	"current_epoch" text DEFAULT 'founder' NOT NULL,
	"founder_halving_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
