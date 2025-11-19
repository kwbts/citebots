<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-32">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading brief...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center py-32">
      <div class="text-center bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-8 max-w-md mx-4">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-red-600 dark:text-red-400 mb-4 font-medium">{{ error }}</p>
        <button @click="fetchBrief" class="px-6 py-2 bg-citebots-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          Retry Loading
        </button>
      </div>
    </div>

    <!-- Brief Content -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/dashboard/actions/content-brief" 
            class="text-gray-600 dark:text-gray-400 hover:text-citebots-orange dark:hover:text-citebots-orange mr-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </NuxtLink>
          <h1 class="text-2xl font-bold">{{ brief.title }}</h1>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <span 
            v-for="(keyword, idx) in brief.keywords" 
            :key="idx"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-citebots-orange/10 text-citebots-orange"
          >
            {{ keyword }}
          </span>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-xl font-bold mb-3">Summary</h2>
        <div class="prose dark:prose-invert max-w-none">
          <p>{{ brief.content?.summary || 'No summary available' }}</p>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-xl font-bold mb-3">Content Suggestions</h2>
        <div v-if="brief.content?.content_suggestions?.length" class="space-y-4">
          <div 
            v-for="(suggestion, idx) in brief.content.content_suggestions" 
            :key="idx"
            class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p class="font-medium">{{ suggestion.suggestion }}</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ suggestion.rationale }}</p>
          </div>
        </div>
        <p v-else class="text-gray-500">No content suggestions available</p>
      </div>

      <div class="mb-6">
        <h2 class="text-xl font-bold mb-3">Table of Contents</h2>
        <div v-if="brief.content?.table_of_contents?.length" class="space-y-4">
          <div 
            v-for="(section, idx) in brief.content.table_of_contents" 
            :key="idx"
            class="border-l-4 border-citebots-orange/70 pl-4 py-1"
          >
            <h3 class="font-bold mb-2">{{ section.title }}</h3>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="(point, pidx) in section.points" :key="pidx">
                {{ point }}
              </li>
            </ul>
          </div>
        </div>
        <p v-else class="text-gray-500">No table of contents available</p>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-3">Debug Information</h2>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm overflow-auto">
          <div><strong>Brief ID:</strong> {{ brief.id }}</div>
          <div><strong>Status:</strong> {{ brief.status }}</div>
          <div><strong>Created:</strong> {{ formatDate(brief.created_at) }}</div>
          <div><strong>Client ID:</strong> {{ brief.client_id || 'None' }}</div>
          <div><strong>Has Content:</strong> {{ brief.content ? 'Yes' : 'No' }}</div>
          <div v-if="brief.content">
            <strong>Content Keys:</strong> {{ Object.keys(brief.content).join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const route = useRoute()
const supabase = useSupabaseClient()
const isLoading = ref(true)
const error = ref(null)
const brief = ref({})

// Fetch brief data directly from Supabase
const fetchBrief = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const briefId = route.params.id
    console.log('Fetching brief with ID:', briefId)
    
    if (!briefId) {
      throw new Error('Brief ID is required')
    }
    
    const { data, error: fetchError } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', briefId)
      .single()
    
    if (fetchError) throw fetchError
    if (!data) throw new Error('Brief not found')
    
    brief.value = data
    console.log('Brief data:', data)
  } catch (err) {
    console.error('Error fetching brief:', err)
    error.value = err.message || 'Error fetching brief'
  } finally {
    isLoading.value = false
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch brief on mount
onMounted(() => {
  fetchBrief()
})
</script>