<template>
  <div class="flex items-center justify-center py-32">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Redirecting to brief viewer...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Get the ID from either route param or query
  const id = route.params.id || route.query.id
  
  if (id) {
    // Redirect to the dynamic route with the ID as a path parameter
    router.replace(`/dashboard/actions/content-brief/view/${id}`)
  } else {
    // Redirect to debug page if no ID
    router.replace('/dashboard/actions/content-brief/debug')
  }
})
</script>