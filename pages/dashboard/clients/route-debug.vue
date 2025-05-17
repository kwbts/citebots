<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Route Debug Page</h1>
    
    <div class="space-y-4">
      <!-- Test different route patterns -->
      <div class="p-4 border rounded">
        <h2 class="font-bold mb-2">Route Pattern Tests</h2>
        <input 
          v-model="testId"
          type="text"
          placeholder="Enter a test ID"
          class="w-full px-3 py-2 border rounded mb-4"
        />
        
        <div class="space-y-2">
          <div>
            <NuxtLink :to="`/dashboard/clients/${testId}/edit`" class="text-blue-600 underline">
              /dashboard/clients/[ID]/edit (bracket notation)
            </NuxtLink>
          </div>
          <div>
            <NuxtLink :to="`/dashboard/clients/_${testId}`" class="text-green-600 underline">
              /dashboard/clients/_[ID] (underscore notation)
            </NuxtLink>
          </div>
          <div>
            <NuxtLink :to="`/dashboard/clients/edit?id=${testId}`" class="text-purple-600 underline">
              /dashboard/clients/edit?id=[ID] (query param)
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Current route info -->
      <div class="p-4 border rounded">
        <h2 class="font-bold mb-2">Current Route Info</h2>
        <pre class="text-sm bg-gray-100 p-2 rounded">{{ JSON.stringify({
          path: $route.path,
          params: $route.params,
          query: $route.query,
          name: $route.name,
          matched: $route.matched.map(r => r.path)
        }, null, 2) }}</pre>
      </div>
      
      <!-- Console debug -->
      <div class="p-4 border rounded">
        <button 
          @click="debugRoute"
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Log Full Route Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const testId = ref('test-123')

const debugRoute = () => {
  console.log('=== FULL ROUTE DEBUG ===')
  console.log('Route object:', route)
  console.log('Path:', route.path)
  console.log('Params:', route.params)
  console.log('Query:', route.query)
  console.log('Name:', route.name)
  console.log('Matched:', route.matched)
  console.log('Meta:', route.meta)
  console.log('Hash:', route.hash)
  console.log('FullPath:', route.fullPath)
  console.log('Redirected from:', route.redirectedFrom)
}
</script>