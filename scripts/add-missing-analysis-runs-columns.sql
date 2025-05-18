-- Add missing columns to analysis_runs table

-- Add competitors column
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;

-- Add test_mode column
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS test_mode boolean DEFAULT false;

-- Add created_by column
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_by ON public.analysis_runs(created_by);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_test_mode ON public.analysis_runs(test_mode);