<template>
  <div class="min-h-screen p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Fix Database</h1>
      
      <div class="card">
        <p class="mb-4">This will fix the infinite recursion error in the profiles table RLS policies.</p>
        
        <button @click="fixDatabase" class="btn-primary mb-4" :disabled="isFixing">
          {{ isFixing ? 'Fixing...' : 'Fix Database' }}
        </button>
        
        <div v-if="result" class="mt-4">
          <h3 class="font-semibold mb-2">Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
        
        <div class="mt-8">
          <h3 class="font-semibold mb-2">Alternative: Direct Profile Creation</h3>
          <button @click="createProfileDirectly" class="btn-secondary mb-4" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Profile Directly' }}
          </button>
          
          <div v-if="profileResult" class="mt-4">
            <h3 class="font-semibold mb-2">Profile Result</h3>
            <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(profileResult, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const isFixing = ref(false)
const isCreating = ref(false)
const result = ref(null)
const profileResult = ref(null)

const fixDatabase = async () => {
  isFixing.value = true
  result.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/fix-database', {
      method: 'POST'
    })
    
    result.value = response
  } catch (err) {
    result.value = { error: err.message }
  } finally {
    isFixing.value = false
  }
}

const createProfileDirectly = async () => {
  isCreating.value = true
  profileResult.value = null
  
  const supabase = useSupabase()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('No authenticated user')
    }
    
    // Try to create profile using service key through Netlify function
    const response = await $fetch('/.netlify/functions/debug-database', {
      method: 'POST',
      body: {
        action: 'create-profile',
        profileData: {
          id: user.id,
          email: user.email,
          first_name: 'Jon',
          last_name: 'Taylor',
          company: 'Knowbots',
          role: 'super_admin',
          is_active: true
        }
      }
    })
    
    profileResult.value = response
  } catch (err) {
    profileResult.value = { error: err.message }
  } finally {
    isCreating.value = false
  }
}
</script>