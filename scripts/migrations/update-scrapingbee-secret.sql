-- Update ScrapingBee API key in Supabase secrets
-- This should be run in the Supabase SQL editor or via CLI

-- Check current secrets (this will show secret names only, not values)
SELECT name FROM vault.secrets WHERE name = 'SCRAPINGBEE_API_KEY';

-- Update the ScrapingBee API key secret
-- Note: Replace 'your_new_api_key_here' with the actual new API key
SELECT vault.update_secret(
  'SCRAPINGBEE_API_KEY',
  'I5GWQ62ATDGWQ9OMZ5BBSGL9AERW9AE29VSZD9FL6JGSPTXY0JH69M0JTEZSQVYXMUL5HZN694M98MJ5'
);

-- Verify the secret was updated (this will only show that it exists, not the value)
SELECT name, created_at, updated_at FROM vault.secrets WHERE name = 'SCRAPINGBEE_API_KEY';