<template>
  <div class="min-h-screen p-8">
    <div class="max-w-lg mx-auto">
      <h1 class="text-2xl font-bold mb-4">Retrieve Password</h1>
      
      <div class="card">
        <form @submit.prevent="getPassword" class="space-y-4">
          <div>
            <label class="form-label">Email</label>
            <input 
              v-model="email" 
              type="email" 
              class="input-field" 
              placeholder="jon@knowbots.ca"
              required 
            />
          </div>
          
          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Retrieving...' : 'Get Password' }}
          </button>
        </form>
        
        <div v-if="password" class="mt-6 p-4 bg-green-50 rounded-lg">
          <h2 class="font-semibold text-green-800 mb-2">Your Password</h2>
          <p class="font-mono text-lg">{{ password }}</p>
        </div>
        
        <div v-if="error" class="mt-6 p-4 bg-red-50 rounded-lg">
          <h2 class="font-semibold text-red-800 mb-2">Error</h2>
          <p class="text-red-600">{{ error }}</p>
        </div>
        
        <div v-if="userData" class="mt-6">
          <h3 class="font-semibold mb-2">User Data</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(userData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('jon@knowbots.ca')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const userData = ref(null)

const getPassword = async () => {
  isLoading.value = true
  password.value = ''
  error.value = ''
  userData.value = null
  
  try {
    // Call Netlify function to get the password
    const response = await $fetch('/.netlify/functions/get-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    if (response.password) {
      password.value = response.password
      userData.value = response.userData
    } else {
      error.value = 'No password found for this email'
    }
  } catch (err) {
    error.value = err.message || 'Failed to retrieve password'
    console.error('Error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>