-- Add crawl_error column to page_analyses table if it doesn't exist
ALTER TABLE public.page_analyses 
ADD COLUMN IF NOT EXISTS crawl_error text;
EOF < /dev/null