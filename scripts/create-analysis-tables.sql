-- Create analysis runs table
CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  batch_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  platform TEXT NOT NULL, -- chatgpt, perplexity, both
  intents TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  queries_total INTEGER DEFAULT 0,
  queries_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create analysis queries table
CREATE TABLE IF NOT EXISTS analysis_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE CASCADE NOT NULL,
  query_id TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  query_keyword TEXT,
  query_category TEXT,
  query_topic TEXT,
  query_type TEXT,
  query_intent TEXT,
  funnel_stage TEXT,
  query_complexity TEXT,
  data_source TEXT NOT NULL, -- chatgpt, perplexity
  model_response TEXT,
  citation_count INTEGER DEFAULT 0,
  brand_mentioned BOOLEAN DEFAULT FALSE,
  brand_sentiment FLOAT,
  competitor_mentioned_names TEXT[] DEFAULT ARRAY[]::TEXT[],
  competitor_count INTEGER DEFAULT 0,
  associated_pages_count INTEGER DEFAULT 0,
  response_match TEXT,
  response_outcome TEXT,
  brand_mention_type TEXT,
  competitor_context TEXT,
  action_orientation TEXT,
  query_competition TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create page analyses table
CREATE TABLE IF NOT EXISTS page_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID REFERENCES analysis_queries(id) ON DELETE CASCADE NOT NULL,
  page_analysis_id TEXT NOT NULL,
  citation_url TEXT NOT NULL,
  citation_position INTEGER,
  domain_name TEXT,
  is_client_domain BOOLEAN DEFAULT FALSE,
  is_competitor_domain BOOLEAN DEFAULT FALSE,
  mention_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  analysis_notes TEXT,
  
  -- Technical SEO fields
  technical_seo JSONB DEFAULT '{}'::JSONB,
  
  -- Page performance fields
  page_performance JSONB DEFAULT '{}'::JSONB,
  
  -- Domain authority fields
  domain_authority JSONB DEFAULT '{}'::JSONB,
  
  -- On-page SEO fields
  on_page_seo JSONB DEFAULT '{}'::JSONB,
  
  -- Content quality fields
  content_quality JSONB DEFAULT '{}'::JSONB,
  
  -- Page analysis fields
  page_analysis JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create benchmark data table (anonymized data for benchmarking)
CREATE TABLE IF NOT EXISTS benchmark_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_date DATE NOT NULL,
  industry_sector TEXT,
  query_keyword TEXT,
  query_category TEXT,
  query_topic TEXT,
  query_type TEXT,
  funnel_stage TEXT,
  data_source TEXT NOT NULL,
  citation_count INTEGER,
  response_match TEXT,
  response_outcome TEXT,
  action_orientation TEXT,
  query_competition TEXT,
  
  -- Aggregated metrics
  avg_citation_position FLOAT,
  domain_authority_stats JSONB,
  content_quality_metrics JSONB,
  technical_seo_metrics JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_analysis_runs_client_id ON analysis_runs(client_id);
CREATE INDEX idx_analysis_runs_status ON analysis_runs(status);
CREATE INDEX idx_analysis_queries_run_id ON analysis_queries(analysis_run_id);
CREATE INDEX idx_analysis_queries_status ON analysis_queries(status);
CREATE INDEX idx_page_analyses_query_id ON page_analyses(query_id);
CREATE INDEX idx_page_analyses_domain ON page_analyses(domain_name);

-- Enable RLS
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for analysis_runs
CREATE POLICY "Users can view their own analysis runs"
  ON analysis_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = analysis_runs.client_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis runs for their clients"
  ON analysis_runs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own analysis runs"
  ON analysis_runs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = analysis_runs.client_id
      AND c.user_id = auth.uid()
    )
  );

-- RLS policies for analysis_queries
CREATE POLICY "Users can view queries from their analysis runs"
  ON analysis_queries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_runs ar
      JOIN clients c ON c.id = ar.client_id
      WHERE ar.id = analysis_queries.analysis_run_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all analysis queries"
  ON analysis_queries
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for page_analyses
CREATE POLICY "Users can view pages from their queries"
  ON page_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      JOIN clients c ON c.id = ar.client_id
      WHERE aq.id = page_analyses.query_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all page analyses"
  ON page_analyses
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for benchmark_data (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view benchmark data"
  ON benchmark_data
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage benchmark data"
  ON benchmark_data
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_runs_updated_at
  BEFORE UPDATE ON analysis_runs
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();