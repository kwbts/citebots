-- Add crawl_error and crawl_status columns to page_analyses table if they don't exist
ALTER TABLE public.page_analyses 
ADD COLUMN IF NOT EXISTS crawl_error text,
ADD COLUMN IF NOT EXISTS crawl_status text;
EOF < /dev/null