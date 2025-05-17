-- Update client fields to support arrays
-- Note: Keep singular fields as TEXT (industry, business model, etc.)
-- Convert descriptive fields to TEXT ARRAY

-- Add geographic regions as array
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS geographic_regions TEXT[] DEFAULT '{}';

-- Convert existing JSONB fields to TEXT ARRAY
ALTER TABLE public.clients ALTER COLUMN target_audience TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN key_products TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN unique_selling_props TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN brand_voice TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN customer_problems TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN use_cases TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN industry_terminology TYPE TEXT[] USING ARRAY[]::TEXT[];
ALTER TABLE public.clients ALTER COLUMN regulatory_considerations TYPE TEXT[] USING ARRAY[]::TEXT[];

-- Set defaults for array columns
ALTER TABLE public.clients ALTER COLUMN target_audience SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN key_products SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN unique_selling_props SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN brand_voice SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN customer_problems SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN use_cases SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN industry_terminology SET DEFAULT '{}';
ALTER TABLE public.clients ALTER COLUMN regulatory_considerations SET DEFAULT '{}';