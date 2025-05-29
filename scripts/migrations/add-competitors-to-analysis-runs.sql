-- Add competitors column to analysis_runs table
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;

-- Add constraint to ensure it's always an array
ALTER TABLE public.analysis_runs
ADD CONSTRAINT check_competitors_array
CHECK (jsonb_typeof(competitors) = 'array');

-- Update any existing null values to empty array
UPDATE public.analysis_runs
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Also add created_by column which is referenced in the edge function
ALTER TABLE public.analysis_runs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_by ON public.analysis_runs(created_by);