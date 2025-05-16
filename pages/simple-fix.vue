<template>
  <div class="min-h-screen p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Simple Profile Fix</h1>
      
      <div class="card">
        <p class="mb-4">This will create or update your profile directly using the service key.</p>
        
        <button @click="fixProfile" class="btn-primary mb-4" :disabled="isFixing">
          {{ isFixing ? 'Fixing...' : 'Fix Profile' }}
        </button>
        
        <div v-if="result" class="mt-4">
          <h3 class="font-semibold mb-2">Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
        
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 class="font-semibold mb-2">Alternative: Manual SQL Fix</h3>
          <p class="mb-2">If the automatic fix doesn't work, you can run this SQL directly in Supabase:</p>
          <pre class="bg-white p-4 rounded text-xs overflow-auto">
-- Run in Supabase SQL Editor
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

INSERT INTO profiles (id, email, first_name, last_name, company, role, is_active)
VALUES (
  '492541a8-daf0-42a3-885a-8a3788718d0b', -- Your user ID
  'jon@knowbots.ca',
  'Jon',
  'Taylor',
  'Knowbots',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Create simple policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;

CREATE POLICY "Allow authenticated to read own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow service role all" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isFixing = ref(false)
const result = ref(null)

const fixProfile = async () => {
  isFixing.value = true
  result.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/simple-fix', {
      method: 'POST'
    })
    
    result.value = response
  } catch (err) {
    console.error('Fix error:', err)
    result.value = { 
      error: err.message,
      data: err.data
    }
  } finally {
    isFixing.value = false
  }
}
</script>