
-- profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  role_title TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  legal_name TEXT,
  cnpj TEXT,
  cep TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  website TEXT,
  instagram TEXT,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  theme TEXT NOT NULL DEFAULT 'light',
  default_budget_validity_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars policies
CREATE POLICY "Avatars are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Company assets policies
CREATE POLICY "Company assets are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'company-assets');
CREATE POLICY "Users upload own company assets" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own company assets" ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own company assets" ON storage.objects FOR DELETE
  USING (bucket_id = 'company-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
