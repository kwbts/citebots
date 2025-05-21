#!/bin/bash

# First, let's see the current state of execute-query
echo "Checking execute-query for duplicate variable declarations..."

# Search for all declarations of brandMentionType
grep -n "let brandMentionType" /Users/jontaylor/Documents/kb-citebots/supabase/functions/execute-query/index.ts

# Search for all declarations of brandMentionCount
grep -n "let brandMentionCount" /Users/jontaylor/Documents/kb-citebots/supabase/functions/execute-query/index.ts

# Check the actual error line
echo -e "\nChecking around line 382..."
sed -n '375,390p' /Users/jontaylor/Documents/kb-citebots/supabase/functions/execute-query/index.ts