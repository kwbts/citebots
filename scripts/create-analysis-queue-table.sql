-- Emergency fix: Create missing analysis_queue table
-- This table was lost during aggressive cleanup in Session 005

CREATE TABLE IF NOT EXISTS public.analysis_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  analysis_run_id uuid,
  query_data jsonb NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  processor_id text,
  priority integer DEFAULT 1,
  updated_at timestamp with time zone DEFAULT now(),
  error text,
  result jsonb,
  query_text text,
  platform text,
  client_id uuid,
  client_name text,
  client_domain text,
  competitors jsonb,
  CONSTRAINT analysis_queue_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_queue_analysis_run_id_fkey FOREIGN KEY (analysis_run_id) REFERENCES public.analysis_runs(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON public.analysis_queue(status);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_created_at ON public.analysis_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_analysis_run_id ON public.analysis_queue(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_priority ON public.analysis_queue(priority);

-- Enable RLS
ALTER TABLE public.analysis_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for analysis_queue
CREATE POLICY "Users can view their analysis queue items"
  ON public.analysis_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_runs ar
      JOIN clients c ON c.id = ar.client_id
      WHERE ar.id = analysis_queue.analysis_run_id
      AND (c.user_id = auth.uid() OR c.created_by = auth.uid())
    )
  );

CREATE POLICY "Service role can manage all analysis queue items"
  ON public.analysis_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_analysis_queue_updated_at
  BEFORE UPDATE ON public.analysis_queue
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();