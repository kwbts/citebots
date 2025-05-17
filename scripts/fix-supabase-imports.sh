#!/bin/bash

# List of files that need updating
files=(
  "pages/dashboard/clients/edit-client-[id].vue"
  "pages/dashboard/clients/provision.vue"
  "pages/dashboard/clients/[id].vue"
  "pages/dashboard/user/index.vue"
  "composables/useAIEnhancement.ts"
)

# Update imports
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    # Remove the import
    sed -i '' "s/import { useSupabase } from '~\/composables\/useSupabase'/\/\/ Using built-in Supabase composable/g" "$file"
    # Replace useSupabase() with useSupabaseClient()
    sed -i '' "s/const supabase = useSupabase()/const supabase = useSupabaseClient()/g" "$file"
  fi
done

echo "Done updating files"