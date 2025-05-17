-- Add AI enhancement fields to the clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS industry_primary TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS industry_secondary TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sub_industry TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS target_audience JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS key_products JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS unique_selling_props JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS geographic_focus TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS brand_voice JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS customer_problems JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS use_cases JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS industry_terminology JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS regulatory_considerations JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ai_enhanced_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ai_enhancement_count INTEGER DEFAULT 0;

-- Add source tracking to competitors table
ALTER TABLE public.competitors ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai'));
ALTER TABLE public.competitors ADD COLUMN IF NOT EXISTS ai_data JSONB;
ALTER TABLE public.competitors ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index for AI-enhanced clients
CREATE INDEX IF NOT EXISTS idx_clients_ai_enhanced ON public.clients(ai_enhanced_at);

-- Create an index for competitor source
CREATE INDEX IF NOT EXISTS idx_competitors_source ON public.competitors(source);