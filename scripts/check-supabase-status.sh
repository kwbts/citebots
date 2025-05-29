#!/bin/bash

# Check Supabase project status via CLI
echo "=== Supabase Project Status Check ==="

# Check if logged in
echo "1. Checking login status..."
npx supabase status

# List projects
echo -e "\n2. Listing projects..."
npx supabase projects list

# Check current project link
echo -e "\n3. Checking project link..."
npx supabase link --project-ref trmaeodthlywcjwfzdka

# Pull current schema
echo -e "\n4. Checking remote schema..."
npx supabase db pull --schema public

# Check tables via psql if available
echo -e "\n5. Direct database check..."
npx supabase db dump --data-only --schema public | head -20

echo -e "\n=== Check complete ==="