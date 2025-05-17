<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Test Dynamic Route with Underscore</h1>
    
    <div class="p-4 bg-gray-100 rounded mb-4">
      <p>Route params: {{ JSON.stringify($route.params) }}</p>
      <p>Client ID: {{ $route.params.id }}</p>
      <p>Full path: {{ $route.fullPath }}</p>
    </div>
    
    <div class="bg-white p-4 rounded shadow">
      <label class="block mb-2">Test Input:</label>
      <input 
        v-model="testValue"
        type="text"
        class="w-full px-3 py-2 border rounded"
      />
      <p class="mt-2">Value: {{ testValue }}</p>
    </div>
    
    <NuxtLink to="/dashboard/clients/manage" class="mt-4 inline-block text-blue-600 underline">
      Back to Clients
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const testValue = ref('')
</script>