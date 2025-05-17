<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Route Structure Comparison Test</h1>
    
    <!-- Test 1: Current Route Info -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-bold mb-2">Current Route Info</h2>
      <p>Path: {{ $route.path }}</p>
      <p>Params: {{ JSON.stringify($route.params) }}</p>
      <p>Query: {{ JSON.stringify($route.query) }}</p>
    </div>
    
    <!-- Test 2: Direct Edit Links -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-bold mb-4">Enter Client ID and Test Different Routes</h2>
      <input 
        v-model="testClientId"
        type="text"
        placeholder="Enter client ID"
        class="w-full px-3 py-2 border rounded mb-4"
      />
      
      <div class="space-y-2">
        <div>
          <NuxtLink 
            :to="`/dashboard/clients/${testClientId}/edit`"
            class="text-blue-600 underline mr-2"
          >
            /dashboard/clients/[id]/edit
          </NuxtLink>
          <span class="text-gray-600">(Dynamic route)</span>
        </div>
        
        <div>
          <NuxtLink 
            :to="`/dashboard/clients/edit-standalone?id=${testClientId}`"
            class="text-green-600 underline mr-2"
          >
            /dashboard/clients/edit-standalone?id=[id]
          </NuxtLink>
          <span class="text-gray-600">(Query param)</span>
        </div>
      </div>
    </div>
    
    <!-- Test 3: Same Page Input Test -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-bold mb-2">Input Test on This Page</h2>
      <input 
        v-model="testInput"
        type="text"
        placeholder="Type here to test"
        class="w-full px-3 py-2 border rounded"
      />
      <p class="mt-2">Value: {{ testInput }}</p>
    </div>
    
    <!-- Test 4: Console Debug -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-bold mb-2">Debug Actions</h2>
      <button 
        @click="checkRouteStructure"
        class="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Check Route Structure
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const testClientId = ref('')
const testInput = ref('')

const checkRouteStructure = () => {
  console.log('=== ROUTE STRUCTURE DEBUG ===')
  console.log('Current route path:', route.path)
  console.log('Route params:', route.params)
  console.log('Route query:', route.query)
  console.log('Route matched:', route.matched)
  console.log('Route full path:', route.fullPath)
  console.log('Window location:', window.location.href)
  
  // Check if we're in a dynamic route
  const isDynamicRoute = route.path.includes('[') || route.params.id !== undefined
  console.log('Is dynamic route:', isDynamicRoute)
  console.log('========================')
}
</script>