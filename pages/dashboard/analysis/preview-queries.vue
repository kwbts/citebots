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
    
    <!-- Query Preview -->
    <div v-else>
      <div v-if="queries && queries.length > 0">
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Review and select the queries you want to analyze. We've generated natural language queries based on your keywords and client profile.
          </p>
          
          <div class="flex justify-between items-center mb-4">
            <div>
              <span class="text-sm text-gray-500">
                {{ selectedCount }} of {{ queries.length }} queries selected
              </span>
            </div>
            <div class="space-x-2">
              <button
                @click="selectAll"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Select All
              </button>
              <button
                @click="deselectAll"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
        
        <!-- Query List -->
        <div class="space-y-3">
          <div
            v-for="(query, index) in queries"
            :key="index"
            class="flex items-start gap-3 p-3 bg-white rounded-lg border"
            :class="[
              query.selected 
                ? 'border-citebots-orange bg-citebots-orange/5' 
                : 'border-gray-200'
            ]"
          >
            <input
              type="checkbox"
              :checked="query.selected"
              @change="toggleQuery(index)"
              class="mt-1 h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange"
            />
            <div class="flex-1">
              <p class="text-gray-800">{{ query.query_text }}</p>
              <div class="mt-1 flex gap-3 text-xs text-gray-500">
                <span>Keyword: {{ query.keyword }}</span>
                <span>Intent: {{ formatIntent(query.intent) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-8 flex justify-between items-center">
          <button
            @click="$router.back()"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
          
          <div class="space-x-4">
            <button
              @click="regenerateQueries"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Regenerate Queries
            </button>
            <button
              @click="runAnalysis"
              :disabled="selectedCount === 0"
              class="px-6 py-2 bg-citebots-orange text-white rounded hover:bg-citebots-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Analysis ({{ selectedCount }} queries)
            </button>
          </div>
        </div>
      </div>
      
      <!-- No Queries State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">No queries generated yet.</p>
        <button
          @click="generateQueries"
          class="mt-4 px-4 py-2 bg-citebots-orange text-white rounded hover:bg-citebots-orange/90"
        >
          Generate Queries
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Ensure this page uses the dashboard layout
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

// Query parameters
const clientId = ref('')
const selectedPlatform = ref('both')
const keywords = ref([])

// State
const loading = ref(false)
const error = ref('')
const queries = ref([])

// Computed
const selectedCount = computed(() => {
  return queries.value.filter(q => q.selected).length
})

// Methods
const formatIntent = (intent) => {
  const intentMap = {
    'direct_experience': 'Direct Experience',
    'recommendation_request': 'Recommendation',
    'comparison_question': 'Comparison'
  }
  return intentMap[intent] || intent
}

const selectAll = () => {
  queries.value.forEach(query => {
    query.selected = true
  })
}

const deselectAll = () => {
  queries.value.forEach(query => {
    query.selected = false
  })
}

const toggleQuery = (index) => {
  queries.value[index].selected = !queries.value[index].selected
}

const generateQueries = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: generateError } = await client.functions.invoke('generate-queries', {
      body: {
        client_id: clientId.value,
        keywords: keywords.value,
        count: 5 // Generate 5 queries per keyword/intent combination
      }
    })
    
    if (generateError) throw generateError
    
    if (data?.success && data.queries) {
      queries.value = data.queries.map(q => ({
        ...q,
        selected: true // Select all by default
      }))
    } else {
      throw new Error(data?.error || 'Failed to generate queries')
    }
  } catch (err) {
    console.error('Error generating queries:', err)
    error.value = err.message || 'Failed to generate queries'
  } finally {
    loading.value = false
  }
}

const regenerateQueries = async () => {
  await generateQueries()
}

const runAnalysis = async () => {
  const selectedQueries = queries.value.filter(q => q.selected)
  
  if (selectedQueries.length === 0) {
    error.value = 'Please select at least one query'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Call run-custom-analysis with selected queries
    const { data, error: analysisError } = await client.functions.invoke('run-custom-analysis', {
      body: {
        client_id: clientId.value,
        platform: selectedPlatform.value,
        queries: selectedQueries
      }
    })
    
    if (analysisError) throw analysisError
    
    if (data?.success) {
      // Redirect to analysis results page
      await router.push(`/dashboard/analysis/${data.analysis_run_id}`)
    } else {
      throw new Error(data?.error || 'Failed to start analysis')
    }
  } catch (err) {
    console.error('Error running analysis:', err)
    error.value = err.message || 'Failed to run analysis'
    loading.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  // Get query parameters
  clientId.value = route.query.client_id || ''
  selectedPlatform.value = route.query.platform || 'both'
  
  // Parse keywords
  if (route.query.keywords) {
    keywords.value = route.query.keywords.split(',').filter(k => k.trim())
  }
  
  // Validate parameters
  if (!clientId.value || keywords.value.length === 0) {
    error.value = 'Missing required parameters'
    return
  }
  
  // Generate queries automatically
  await generateQueries()
})
</script>