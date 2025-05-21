#!/bin/bash

# Create archive directory if it doesn't exist
mkdir -p /Users/jontaylor/Documents/kb-citebots/supabase/functions-archive

# List of non-essential functions to archive
NON_ESSENTIAL_FUNCTIONS=(
  "run-analysis-simple"
  "run-analysis"
  "enhance-client-with-ai"
)

# Move functions to archive
for func in "${NON_ESSENTIAL_FUNCTIONS[@]}"; do
  echo "Archiving $func..."
  if [ -d "/Users/jontaylor/Documents/kb-citebots/supabase/functions/$func" ]; then
    mv "/Users/jontaylor/Documents/kb-citebots/supabase/functions/$func" "/Users/jontaylor/Documents/kb-citebots/supabase/functions-archive/"
    echo "✅ $func archived successfully"
  else
    echo "⚠️ $func not found, skipping"
  fi
done

echo ""
echo "Archived non-essential functions. If you need to restore them later, they are in /Users/jontaylor/Documents/kb-citebots/supabase/functions-archive/"
echo ""

echo "Remaining essential functions:"
ls -la /Users/jontaylor/Documents/kb-citebots/supabase/functions | grep -v "total" | grep -v "^\." | grep -v "functions-archive"