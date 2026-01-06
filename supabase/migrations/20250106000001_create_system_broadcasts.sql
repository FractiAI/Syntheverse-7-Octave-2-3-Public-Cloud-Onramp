-- Migration: Create System Broadcasts Table
-- Run this in Supabase Dashboard → SQL Editor
-- This table stores system broadcast messages that appear in contributor dashboards

CREATE TABLE IF NOT EXISTS public.system_broadcasts (
    id text PRIMARY KEY NOT NULL,
    message text NOT NULL,
    nature text NOT NULL DEFAULT 'info', -- announcement, warning, info, success, milestone, alert, update
    is_active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL, -- email of creator/operator
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    expires_at timestamp -- Optional expiration date
);

CREATE INDEX IF NOT EXISTS idx_system_broadcasts_is_active ON public.system_broadcasts(is_active);
CREATE INDEX IF NOT EXISTS idx_system_broadcasts_expires_at ON public.system_broadcasts(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_broadcasts_created_at ON public.system_broadcasts(created_at);

COMMENT ON TABLE public.system_broadcasts IS 'System broadcast messages displayed as dismissible banners in contributor dashboards';

