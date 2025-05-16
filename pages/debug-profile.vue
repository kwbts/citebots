<template>
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Profile Debug</h1>
      
      <div class="card mb-4">
        <button @click="checkAuth" class="btn-primary mb-4">Check Auth Status</button>
        
        <div v-if="authUser" class="mb-4">
          <h2 class="font-semibold mb-2">Auth User</h2>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(authUser, null, 2) }}</pre>
        </div>
        
        <div v-if="profile" class="mb-4">
          <h2 class="font-semibold mb-2">Profile</h2>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(profile, null, 2) }}</pre>
        </div>
        
        <div v-if="error" class="mb-4">
          <h2 class="font-semibold mb-2 text-red-600">Error</h2>
          <pre class="bg-red-50 p-4 rounded overflow-auto text-sm text-red-600">{{ error }}</pre>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Create/Update Profile</h2>
        <form @submit.prevent="createProfile" class="space-y-4">
          <div>
            <label class="form-label">User ID (from auth)</label>
            <input v-model="profileForm.id" class="input-field" readonly />
          </div>
          <div>
            <label class="form-label">Email</label>
            <input v-model="profileForm.email" type="email" class="input-field" required />
          </div>
          <div>
            <label class="form-label">First Name</label>
            <input v-model="profileForm.first_name" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Last Name</label>
            <input v-model="profileForm.last_name" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Company</label>
            <input v-model="profileForm.company" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Role</label>
            <select v-model="profileForm.role" class="input-field">
              <option value="super_admin">Super Admin</option>
              <option value="partner">Partner</option>
              <option value="client">Client</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
          <button type="submit" class="btn-primary" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create/Update Profile' }}
          </button>
        </form>
        
        <div v-if="createResult" class="mt-4">
          <h3 class="font-semibold mb-2">Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(createResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const authUser = ref(null)
const profile = ref(null)
const error = ref('')
const isCreating = ref(false)
const createResult = ref(null)

const profileForm = ref({
  id: '',
  email: 'jon@knowbots.ca',
  first_name: 'Jon',
  last_name: 'Taylor',
  company: 'Knowbots',
  role: 'super_admin'
})

const checkAuth = async () => {
  error.value = ''
  
  try {
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) throw authError
    
    authUser.value = user
    
    if (user) {
      // Set the user ID in the form
      profileForm.value.id = user.id
      
      // Try to get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('Profile error:', profileError)
        error.value = `Profile not found: ${profileError.message}`
      } else {
        profile.value = profileData
        
        // Update form with existing data
        profileForm.value = {
          ...profileForm.value,
          ...profileData
        }
      }
    }
  } catch (err) {
    error.value = err.message
    console.error('Error:', err)
  }
}

const createProfile = async () => {
  isCreating.value = true
  createResult.value = null
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileForm.value)
      .select()
      .single()
    
    if (error) throw error
    
    createResult.value = { success: true, data }
    
    // Refresh the profile
    await checkAuth()
  } catch (err) {
    createResult.value = { success: false, error: err.message }
    console.error('Error creating profile:', err)
  } finally {
    isCreating.value = false
  }
}

// Check on mount
onMounted(() => {
  checkAuth()
})
</script>