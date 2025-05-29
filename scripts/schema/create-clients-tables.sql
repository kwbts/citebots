-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraints
ALTER TABLE public.clients ADD CONSTRAINT unique_client_name UNIQUE(name);
ALTER TABLE public.clients ADD CONSTRAINT unique_client_domain UNIQUE(domain);
ALTER TABLE public.competitors ADD CONSTRAINT unique_competitor_per_client UNIQUE(client_id, domain);

-- Create indexes
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_competitors_client_id ON public.competitors(client_id);

-- Create RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all clients (super admin functionality)
CREATE POLICY "Enable read for authenticated users" ON public.clients
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only super admins can create clients
CREATE POLICY "Enable insert for super admins" ON public.clients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Only super admins can update clients
CREATE POLICY "Enable update for super admins" ON public.clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Only super admins can delete clients
CREATE POLICY "Enable delete for super admins" ON public.clients
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create RLS policies for competitors table
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all competitors
CREATE POLICY "Enable read for authenticated users" ON public.competitors
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only super admins can create competitors
CREATE POLICY "Enable insert for super admins" ON public.competitors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Only super admins can update competitors
CREATE POLICY "Enable update for super admins" ON public.competitors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Only super admins can delete competitors
CREATE POLICY "Enable delete for super admins" ON public.competitors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to clients table
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();