-- =============================================================================
-- NEXORA Initial Database Schema
-- Run in Supabase SQL Editor or via supabase db push
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- USERS & PROFILES (extends Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- -----------------------------------------------------------------------------
-- TOOLS REGISTRY (App Marketplace)
-- -----------------------------------------------------------------------------
CREATE TABLE public.tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_id)
);

CREATE TABLE public.recent_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT REFERENCES public.tools(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recent_activity_user ON public.recent_activity(user_id, created_at DESC);

-- URL SHORTENER, NOTES, PROJECTS, AI, EXPENSES, RESUMES, NOTIFICATIONS
-- Full schema continued in local workspace; run the complete file from
-- supabase/migrations/001_initial_schema.sql for production.
-- This commit seeds the tools registry and core ownership tables.

INSERT INTO public.tools (id, name, slug, description, short_description, category, icon, sort_order) VALUES
  ('url-shortener', 'URL Shortener', 'url-shortener', 'Create short links, custom aliases, QR codes and track clicks.', 'Shorten & track links', 'Utilities', 'Link', 10),
  ('weather', 'Weather Dashboard', 'weather', 'Live weather, hourly and 7-day forecasts for any city.', 'Live weather & forecasts', 'Utilities', 'CloudSun', 20),
  ('ai-pdf', 'AI PDF Assistant', 'ai-pdf', 'Upload PDFs, summarize, ask questions and extract insights.', 'Chat with your PDFs', 'Artificial Intelligence', 'FileText', 30),
  ('projects', 'Project Management', 'projects', 'Kanban boards, tasks, deadlines and progress tracking.', 'Kanban & task boards', 'Management', 'Kanban', 40),
  ('ai-chat', 'AI Chatbot', 'ai-chat', 'Intelligent conversations with streaming responses and history.', 'Chat with AI', 'Artificial Intelligence', 'MessageSquare', 50),
  ('notes', 'Notes & Productivity', 'notes', 'Rich notes, tags, pins, search and autosave.', 'Rich notes & tags', 'Productivity', 'Notebook', 60),
  ('expenses', 'Expense Tracker', 'expenses', 'Track income, expenses, budgets and insights.', 'Budgets & spending', 'Finance', 'Wallet', 70),
  ('resume', 'Resume Builder', 'resume', 'Professional resumes with live preview and PDF export.', 'Build & export resumes', 'Productivity', 'FileUser', 80)
ON CONFLICT (id) DO NOTHING;
