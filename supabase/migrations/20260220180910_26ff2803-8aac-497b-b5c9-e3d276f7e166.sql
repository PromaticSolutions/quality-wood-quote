
-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) DEFAULT '',
  architect_name VARCHAR(255) DEFAULT '',
  delivery_days INTEGER DEFAULT 30,
  payment_terms TEXT DEFAULT '',
  custom_total DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  measurements VARCHAR(255),
  observations TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_created_at ON public.budgets(created_at);
CREATE INDEX idx_rooms_budget_id ON public.rooms(budget_id);
CREATE INDEX idx_items_room_id ON public.items(room_id);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Budgets RLS policies
CREATE POLICY "Users can view their own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Rooms RLS: user owns the parent budget
CREATE POLICY "Users can view rooms of their budgets" ON public.rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = rooms.budget_id AND budgets.user_id = auth.uid())
  );
CREATE POLICY "Users can create rooms in their budgets" ON public.rooms
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = rooms.budget_id AND budgets.user_id = auth.uid())
  );
CREATE POLICY "Users can update rooms in their budgets" ON public.rooms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = rooms.budget_id AND budgets.user_id = auth.uid())
  );
CREATE POLICY "Users can delete rooms in their budgets" ON public.rooms
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.budgets WHERE budgets.id = rooms.budget_id AND budgets.user_id = auth.uid())
  );

-- Items RLS: user owns the parent budget via room
CREATE POLICY "Users can view items of their budgets" ON public.items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      JOIN public.budgets ON budgets.id = rooms.budget_id 
      WHERE rooms.id = items.room_id AND budgets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create items in their budgets" ON public.items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms 
      JOIN public.budgets ON budgets.id = rooms.budget_id 
      WHERE rooms.id = items.room_id AND budgets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update items in their budgets" ON public.items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      JOIN public.budgets ON budgets.id = rooms.budget_id 
      WHERE rooms.id = items.room_id AND budgets.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete items in their budgets" ON public.items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      JOIN public.budgets ON budgets.id = rooms.budget_id 
      WHERE rooms.id = items.room_id AND budgets.user_id = auth.uid()
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
