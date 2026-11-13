-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own subscription" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own activity" ON public.recent_activity
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own urls" ON public.shortened_urls
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view analytics of own urls" ON public.url_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shortened_urls u WHERE u.id = url_id AND u.user_id = auth.uid())
  );
CREATE POLICY "Users manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage comments on own tasks" ON public.task_comments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage messages in own conversations" ON public.ai_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Users manage own documents" ON public.uploaded_documents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active tools" ON public.tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- -----------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed core tools
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
