
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS client_address TEXT,
  ADD COLUMN IF NOT EXISTS client_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS client_city TEXT,
  ADD COLUMN IF NOT EXISTS client_state TEXT,
  ADD COLUMN IF NOT EXISTS general_observations TEXT;
