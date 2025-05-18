-- This script helps set up the ScrapingBee API key as a Supabase secret
-- Run this with the Supabase CLI:
-- npx supabase secrets set SCRAPINGBEE_API_KEY=your_actual_api_key --project-ref trmaeodthlywcjwfzdka

-- To verify the secret is set, run:
-- npx supabase secrets list --project-ref trmaeodthlywcjwfzdka

-- After setting the secret, redeploy the analyze-citation function:
-- npx supabase functions deploy analyze-citation --project-ref trmaeodthlywcjwfzdka --no-verify-jwt

-- Note: The environment variable name must be exactly: SCRAPINGBEE_API_KEY
-- This is case-sensitive!

-- To test if ScrapingBee is working, you can create a test function
-- or check the edge function logs in the Supabase dashboard