<template>
  <div class="min-h-screen p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Test Auth Provision</h1>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-2">Create Test Account</h2>
        <form @submit.prevent="testProvision" class="space-y-4">
          <div>
            <label class="block mb-1">First Name</label>
            <input v-model="form.firstName" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1">Last Name</label>
            <input v-model="form.lastName" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1">Email</label>
            <input v-model="form.email" type="email" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1">Company</label>
            <input v-model="form.company" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1">Role</label>
            <select v-model="form.role" class="input-field">
              <option value="super_admin">Super Admin</option>
              <option value="partner">Partner</option>
              <option value="client">Client</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>
      </div>
      
      <div v-if="result" class="card">
        <h2 class="text-lg font-semibold mb-2">Result</h2>
        <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="card bg-red-50">
        <h2 class="text-lg font-semibold mb-2 text-red-800">Error</h2>
        <pre class="text-red-600">{{ error }}</pre>
      </div>
      
      <div class="card mt-4">
        <h2 class="text-lg font-semibold mb-2">Check Password in Database</h2>
        <form @submit.prevent="checkPassword" class="space-y-4">
          <div>
            <label class="block mb-1">Email to Check</label>
            <input v-model="checkEmail" type="email" class="input-field" required />
          </div>
          <button type="submit" class="btn-primary" :disabled="isChecking">
            {{ isChecking ? 'Checking...' : 'Check Password' }}
          </button>
        </form>
        
        <div v-if="passwordResult" class="mt-4">
          <h3 class="font-semibold mb-2">Password Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(passwordResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const isLoading = ref(false)
const isChecking = ref(false)
const result = ref(null)
const error = ref('')
const passwordResult = ref(null)
const checkEmail = ref('')

const form = ref({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  company: 'Test Company',
  role: 'client'
})

const testProvision = async () => {
  isLoading.value = true
  result.value = null
  error.value = ''
  
  try {
    const response = await $fetch('/.netlify/functions/auth-provision', {
      method: 'POST',
      body: form.value
    })
    
    result.value = response
  } catch (err) {
    error.value = err.message || 'An error occurred'
    if (err.data) {
      error.value += '\n' + JSON.stringify(err.data, null, 2)
    }
  } finally {
    isLoading.value = false
  }
}

const checkPassword = async () => {
  isChecking.value = true
  passwordResult.value = null
  
  const supabase = useSupabase()
  
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('email', checkEmail.value)
      .single()
    
    if (error) throw error
    
    passwordResult.value = data
  } catch (err) {
    passwordResult.value = { error: err.message }
  } finally {
    isChecking.value = false
  }
}
</script>