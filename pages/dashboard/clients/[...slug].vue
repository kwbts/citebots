<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Catch-All Route Test</h1>
    
    <div class="p-4 bg-gray-100 rounded">
      <h2 class="font-semibold mb-2">Route Information:</h2>
      <p>Path: {{ $route.path }}</p>
      <p>Params: {{ JSON.stringify($route.params) }}</p>
      <p>Slug: {{ $route.params.slug }}</p>
    </div>
    
    <div class="mt-4 p-4 bg-white rounded shadow">
      <h2 class="font-semibold mb-2">Extracted Info:</h2>
      <p>Full path parts: {{ pathParts }}</p>
      <p>Possible ID: {{ possibleId }}</p>
      <p>Possible Action: {{ possibleAction }}</p>
    </div>
    
    <div class="mt-4">
      <NuxtLink to="/dashboard/clients/manage" class="text-blue-600 underline">
        Back to Clients
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pathParts = computed(() => {
  return route.path.split('/').filter(part => part)
})

const possibleId = computed(() => {
  // Look for a UUID-like pattern
  const parts = pathParts.value
  for (const part of parts) {
    if (part.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return part
    }
  }
  return null
})

const possibleAction = computed(() => {
  const parts = pathParts.value
  const lastPart = parts[parts.length - 1]
  if (['edit', 'delete', 'view'].includes(lastPart)) {
    return lastPart
  }
  return null
})
</script>