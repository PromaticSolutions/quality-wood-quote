
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  budget_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_projects_budget ON public.projects(budget_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', false);

CREATE POLICY "Users view own project files" ON storage.objects FOR SELECT
  USING (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own project files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own project files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own project files" ON storage.objects FOR DELETE
  USING (bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]);
