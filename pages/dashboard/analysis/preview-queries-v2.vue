<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Review Generated Queries</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
      <p class="mt-4 text-gray-600">Generating natural language queries...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4 mb-6">
      <p class="text-red-700">{{ error }}</p>
      <button @click="generateQueries" class="mt-2 text-red-600 underline">
        Try Again
      </button>
    </div>
    
    <!-- Debug Info -->
    <div v-if="showDebug" class="mb-6 p-4 bg-gray-100 rounded">
      <h3 class="font-bold mb-2">Debug Info:</h3>
      <p>Client ID: {{ clientId }}</p>
      <p>Keywords: {{ keywords.join(', ') }}</p>
      <p>Platform: {{ selectedPlatform }}</p>
      <p>Query Count: {{ localQueries.length }}</p>
      <details class="mt-2">
        <summary class="cursor-pointer text-blue-600">Raw Data</summary>
        <pre class="mt-2 text-xs">{{ JSON.stringify(localQueries, null, 2) }}</pre>
      </details>
    </div>
    
    <!-- Query List (Simple) -->
    <div v-if="!loading && localQueries.length > 0" class="space-y-4">
      <div class="mb-4">
        <p class="text-gray-600">
          Select the queries you want to analyze:
        </p>
        <p class="text-sm text-gray-500 mt-2">
          {{ selectedCount }} of {{ localQueries.length }} queries selected
        </p>
      </div>
      
      <div v-for="(query, index) in localQueries" :key="index" 
           class="p-4 bg-white rounded-lg border"
           :class="query.selected ? 'border-citebots-orange' : 'border-gray-200'">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            v-model="query.selected"
            class="mt-1 h-4 w-4 text-citebots-orange rounded"
          />
          <div class="flex-1">
            <p class="text-gray-800">{{ query.query_text }}</p>
            <div class="mt-1 text-xs text-gray-500">
              Keyword: {{ query.keyword }} | Intent: {{ query.intent }}
            </div>
          </div>
        </label>
      </div>
      
      <!-- Actions -->
      <div class="mt-8 flex justify-between">
        <button
          @click="$router.back()"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        
        <div class="space-x-4">
          <button
            @click="runAnalysis"
            :disabled="selectedCount === 0"
            class="px-6 py-2 bg-citebots-orange text-white rounded hover:bg-citebots-orange/90 disabled:opacity-50"
          >
            Run Analysis ({{ selectedCount }} queries)
          </button>
        </div>
      </div>
    </div>
    
    <!-- No Queries State -->
    <div v-else-if="!loading && localQueries.length === 0" class="text-center py-12">
      <p class="text-gray-600">No queries generated yet.</p>
      <button
        @click="generateQueries"
        class="mt-4 px-4 py-2 bg-citebots-orange text-white rounded"
      >
        Generate Queries
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

// Route parameters
const clientId = route.query.client_id
const selectedPlatform = route.query.platform || 'chatgpt'
const keywords = route.query.keywords ? route.query.keywords.split(',') : []

// State
const localQueries = ref([])
const loading = ref(false)
const error = ref(null)
const showDebug = ref(true) // Show debug info for troubleshooting

// Computed
const selectedCount = computed(() => {
  return localQueries.value.filter(q => q.selected).length
})

// Generate queries
const generateQueries = async () => {
  loading.value = true
  error.value = null
  localQueries.value = []
  
  try {
    console.log('Generating queries for:', { clientId, keywords, platform: selectedPlatform })
    
    const { data, error: genError } = await supabase.functions.invoke('generate-queries', {
      body: {
        client_id: clientId,
        keywords: keywords,
        count: 5
      }
    })
    
    console.log('Response:', { data, error: genError })
    
    if (genError) throw genError
    
    if (!data?.queries) {
      throw new Error('No queries in response')
    }
    
    // Process queries
    const processedQueries = data.queries.map((query, index) => ({
      ...query,
      id: `${index}_${Date.now()}`,
      selected: true
    }))
    
    console.log('Processed queries:', processedQueries)
    localQueries.value = processedQueries
    
  } catch (err) {
    console.error('Error:', err)
    error.value = err.message || 'Failed to generate queries'
  } finally {
    loading.value = false
  }
}

// Run analysis with selected queries
const runAnalysis = async () => {
  const selectedQueries = localQueries.value.filter(q => q.selected)
  
  if (selectedQueries.length === 0) {
    error.value = 'Please select at least one query'
    return
  }
  
  loading.value = true
  
  try {
    const { data, error: runError } = await supabase.functions.invoke('run-custom-analysis', {
      body: {
        client_id: clientId,
        platform: selectedPlatform,
        queries: selectedQueries
      }
    })
    
    if (runError) throw runError
    
    // Navigate to results
    router.push(`/dashboard/analysis/${data.analysis_run.id}`)
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

onMounted(() => {
  console.log('Component mounted with:', { clientId, keywords, selectedPlatform })
  
  if (!clientId || keywords.length === 0) {
    error.value = 'Missing required parameters'
    return
  }
  
  generateQueries()
})
</script>