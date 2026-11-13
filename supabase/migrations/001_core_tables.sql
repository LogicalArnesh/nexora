-- =============================================================================
-- NEXORA Initial Database Schema — Part 1: Core Tables
-- Run in Supabase SQL Editor or via supabase db push
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE public.shortened_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  custom_alias TEXT UNIQUE,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  click_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shortened_urls_user ON public.shortened_urls(user_id);
CREATE INDEX idx_shortened_urls_code ON public.shortened_urls(short_code);

CREATE TABLE public.url_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID NOT NULL REFERENCES public.shortened_urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  country TEXT,
  city TEXT
);

CREATE INDEX idx_url_analytics_url ON public.url_analytics(url_id, clicked_at DESC);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT,
  content_html TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON public.notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_tags ON public.notes USING GIN (tags);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON public.tasks(project_id, status, position);

CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  model TEXT DEFAULT 'gpt-4o-mini',
  tool_context TEXT,
  document_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at);

CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  page_count INT,
  extracted_text TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template TEXT NOT NULL DEFAULT 'modern',
  data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
