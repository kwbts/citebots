-- Emergency fix: Add missing columns to analysis_runs table
-- These columns were lost during aggressive cleanup in Session 005

-- Add missing columns that the application expects
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS report_name TEXT;

ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS queries_queued INTEGER DEFAULT 0;

ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS queries_processing INTEGER DEFAULT 0;

ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS queries_failed INTEGER DEFAULT 0;

ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS processing_method TEXT DEFAULT 'direct';

-- Add competitors column (used by queue functions)
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;

-- Add test_mode column
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS test_mode boolean DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_by ON public.analysis_runs(created_by);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_processing_method ON public.analysis_runs(processing_method);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_report_name ON public.analysis_runs(report_name);

-- Add constraint to ensure competitors is always an array
ALTER TABLE public.analysis_runs
DROP CONSTRAINT IF EXISTS check_competitors_array;

ALTER TABLE public.analysis_runs
ADD CONSTRAINT check_competitors_array
CHECK (competitors IS NULL OR jsonb_typeof(competitors) = 'array');

-- Update any existing null values to empty array
UPDATE public.analysis_runs
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Update any existing null values for counters
UPDATE public.analysis_runs
SET
  queries_queued = COALESCE(queries_queued, 0),
  queries_processing = COALESCE(queries_processing, 0),
  queries_failed = COALESCE(queries_failed, 0)
WHERE queries_queued IS NULL OR queries_processing IS NULL OR queries_failed IS NULL;