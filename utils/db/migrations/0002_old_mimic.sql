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
