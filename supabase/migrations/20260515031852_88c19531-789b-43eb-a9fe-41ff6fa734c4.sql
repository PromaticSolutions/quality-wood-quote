
-- CLIENTS
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  document TEXT,
  phone TEXT,
  email TEXT,
  cep TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MATERIALS
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'un',
  cost_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'outros',
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own materials" ON public.materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own materials" ON public.materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own materials" ON public.materials FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'reuniao',
  client_id UUID,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BUDGETS: link to client
ALTER TABLE public.budgets ADD COLUMN client_id UUID;
