-- Script to add client_id to page_analyses and update RLS policies
-- First check if client_id column already exists
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'page_analyses' AND column_name = 'client_id'
  ) INTO column_exists;

  IF NOT column_exists THEN
    -- Add client_id column
    EXECUTE 'ALTER TABLE public.page_analyses ADD COLUMN client_id UUID REFERENCES clients(id)';
    
    -- Populate the client_id column using data from related tables
    EXECUTE '
      UPDATE public.page_analyses pa
      SET client_id = ar.client_id
      FROM public.analysis_queries aq
      JOIN public.analysis_runs ar ON ar.id = aq.analysis_run_id
      WHERE aq.id = pa.query_id
    ';
    
    -- Create index on client_id for performance
    EXECUTE 'CREATE INDEX idx_page_analyses_client_id ON public.page_analyses(client_id)';
    
    RAISE NOTICE 'Added client_id column to page_analyses and populated data';
  ELSE
    RAISE NOTICE 'client_id column already exists in page_analyses table';
  END IF;
END $$;

-- Now drop complex RLS policies
DROP POLICY IF EXISTS "Users can view page analyses for accessible clients" ON public.page_analyses;
DROP POLICY IF EXISTS "Partners can view own page analyses" ON public.page_analyses;
DROP POLICY IF EXISTS "Users can view page analyses for their runs" ON public.page_analyses;
DROP POLICY IF EXISTS "Users can view pages from their queries" ON public.page_analyses;

-- Create simple direct RLS policies
-- First drop existing policies with the same names to avoid errors
DROP POLICY IF EXISTS "Super admins can view all page analyses" ON public.page_analyses;
DROP POLICY IF EXISTS "Partners can view page analyses for their clients" ON public.page_analyses;
DROP POLICY IF EXISTS "Client users can view page analyses for their assigned client" ON public.page_analyses;

-- Create new policies
CREATE POLICY "Super admins can view all page analyses"
ON public.page_analyses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
));

CREATE POLICY "Partners can view page analyses for their clients"
ON public.page_analyses FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE partner_id = auth.uid() OR created_by = auth.uid()
  )
);

CREATE POLICY "Client users can view page analyses for their assigned client"
ON public.page_analyses FOR SELECT
USING (
  client_id IN (
    SELECT client_account_id FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'client'
  )
);

-- Ensure all policies use proper indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_partner_id') THEN
    EXECUTE 'CREATE INDEX idx_clients_partner_id ON public.clients(partner_id)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_created_by') THEN
    EXECUTE 'CREATE INDEX idx_clients_created_by ON public.clients(created_by)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
    EXECUTE 'CREATE INDEX idx_profiles_role ON public.profiles(role)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_client_account_id') THEN
    EXECUTE 'CREATE INDEX idx_profiles_client_account_id ON public.profiles(client_account_id)';
  END IF;
END $$;

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated for page_analyses table';
END $$;