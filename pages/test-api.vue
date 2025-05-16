<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">API Test</h1>
    
    <button @click="testAPI" class="btn-primary">
      Test Provision API
    </button>
    
    <div v-if="result" class="mt-4 p-4 bg-gray-100 rounded">
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 rounded text-red-800">
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const result = ref(null)
const error = ref(null)

const testAPI = async () => {
  result.value = null
  error.value = null
  
  try {
    const response = await $fetch('/api/auth/provision', {
      method: 'POST',
      body: {
        firstName: 'Jon',
        lastName: 'Test',
        email: 'jon@knowbots.ca',
        company: 'Knowbots',
        role: 'super_admin'
      }
    })
    
    result.value = response
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unknown error'
    console.error('API Error:', err)
  }
}
</script>