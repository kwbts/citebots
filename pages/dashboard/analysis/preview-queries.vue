<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title text-gray-900 dark:text-white">Review Generated Queries</h1>
          <p class="page-subtitle text-gray-600 dark:text-gray-300">
            Review and select queries for analysis based on your keywords and client profile
          </p>
        </div>
        <button
          @click="$router.back()"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="card">
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ loadingMessage }}</p>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="card text-center py-12">
      <svg class="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Query Generation Failed</h3>
      <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <button @click="generateQueries" class="btn-primary">
        Try Again
      </button>
    </div>
    
    <!-- Query Preview -->
    <div v-else>
      <!-- Analysis Parameters -->
      <div v-if="clientId && keywords.length > 0" class="card mb-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Analysis Parameters</h2>

        <!-- Platform Selection -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Analysis Platforms <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="selectedPlatforms"
                value="chatgpt"
                class="h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                :disabled="loading"
              />
              <div class="ml-3 flex items-center">
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-gray-900 dark:text-white font-medium">ChatGPT</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">OpenAI's conversational AI platform</p>
                  </div>
                </div>
              </div>
            </label>

            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="selectedPlatforms"
                value="perplexity"
                class="h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                :disabled="loading"
              />
              <div class="ml-3 flex items-center">
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <div>
                    <span class="text-gray-900 dark:text-white font-medium">Perplexity</span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">AI-powered search and answer engine</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Select one or more AI platforms to analyze for brand mentions and citations
          </p>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
          <div>
            <span class="text-gray-600 dark:text-gray-400">Client:</span>
            <span class="font-medium text-gray-900 dark:text-white ml-2">{{ clientName }}</span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Platforms:</span>
            <span class="font-medium text-gray-900 dark:text-white ml-2">
              {{ selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'None selected' }}
            </span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Keywords:</span>
            <span class="font-medium text-gray-900 dark:text-white ml-2">{{ keywords.length }}</span>
          </div>
        </div>

        <!-- Run Analysis Button -->
        <div class="flex justify-center">
          <button
            @click="runAnalysis"
            :disabled="!canRunAnalysis || loading"
            class="bg-citebots-orange text-white border border-citebots-orange rounded-lg px-8 py-3 font-semibold text-sm hover:bg-citebots-orange/90 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            {{ loading ? 'Starting Analysis...' : 'Run Analysis' }}
          </button>
        </div>
      </div>

      <!-- Query Selection Interface -->
      <div v-if="queries && queries.length > 0" class="space-y-6">
        <!-- Selection Summary -->
        <div class="card">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Generated Queries</h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ selectedCount }} of {{ queries.length }} queries selected for analysis
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="selectAll"
                class="btn-secondary text-sm"
              >
                Select All
              </button>
              <button
                @click="deselectAll"
                class="btn-secondary text-sm"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
        
        <!-- Query List -->
        <div class="space-y-4">
          <div
            v-for="(query, index) in queries"
            :key="index"
            class="card transition-all duration-200"
            :class="[
              query.selected 
                ? 'ring-2 ring-citebots-orange bg-orange-50 dark:bg-orange-900/20 border-citebots-orange' 
                : 'hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <label class="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                :checked="query.selected"
                @change="toggleQuery(index)"
                class="mt-1 h-5 w-5 text-citebots-orange rounded focus:ring-citebots-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              />
              <div class="flex-1">
                <p class="text-gray-900 dark:text-white font-medium leading-relaxed">
                  {{ query.query_text }}
                </p>
                <div class="mt-3 flex flex-wrap gap-4 text-sm">
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {{ query.keyword }}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">Keyword</span>
                  </div>
                  <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {{ formatIntent(query.intent) }}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">Intent</span>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- Analysis Options -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Options</h3>
          
          <!-- Queue Processing Toggle -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Queue Processing</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Process queries in the background for better performance with large datasets
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="useQueueProcessing"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-citebots-orange/20 dark:peer-focus:ring-citebots-orange/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-citebots-orange"></div>
            </label>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <div class="flex gap-3">
            <button
              @click="$router.back()"
              class="btn-secondary"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            
            <button
              @click="regenerateQueries"
              class="btn-outline"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Regenerate Queries
            </button>
          </div>

          <button
            @click="runAnalysis"
            :disabled="selectedCount === 0 || loading"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ loading ? 'Starting Analysis...' : `Run Analysis (${selectedCount} queries)` }}
          </button>
        </div>
      </div>
      
      <!-- No Queries State -->
      <div v-else class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Queries Generated</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't generate queries with the provided parameters. Please try again or check your keywords.
        </p>
        <button
          @click="generateQueries"
          class="btn-primary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Generate Queries
        </button>
      </div>
    </div>

    <!-- Queue Progress UI -->
    <QueueProgress
      v-if="showProgressUI && analysisRunId"
      :analysis-run-id="analysisRunId"
      @complete="handleQueueComplete"
      class="card"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQueueAnalysis } from '~/composables/useQueueAnalysis'
import QueueProgress from '~/components/analysis/QueueProgress.vue'

// Ensure this page uses the dashboard layout
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Get queue analysis composable
const {
  useQueue,
  queueEnabled,
  toggleQueue,
  runAnalysisWithQueue,
  initializeQueueFeature
} = useQueueAnalysis()

// Query parameters
const clientId = ref('')
const clientName = ref('')
const selectedPlatforms = ref([])
const keywords = ref([])

// State
const loading = ref(false)
const loadingMessage = ref('Generating natural language queries...')
const error = ref('')
const queries = ref([])
const useQueueProcessing = ref(false)
const analysisRunId = ref('')
const showProgressUI = ref(false)

// Computed
const selectedCount = computed(() => {
  return queries.value.filter(q => q.selected).length
})

const canRunAnalysis = computed(() => {
  return selectedPlatforms.value.length > 0 &&
         queries.value.length > 0 &&
         queries.value.some(q => q.selected)
})

// Methods
const formatIntent = (intent) => {
  const intentMap = {
    'direct_experience': 'Direct Experience',
    'recommendation_request': 'Recommendation',
    'comparison_question': 'Comparison',
    'informational': 'Informational',
    'transactional': 'Transactional',
    'navigational': 'Navigational'
  }
  return intentMap[intent] || intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
  loadingMessage.value = 'Generating natural language queries...'
  error.value = ''

  try {
    console.log('Generating queries for:', { clientId: clientId.value, keywords: keywords.value })

    const { data, error: generateError } = await supabase.functions.invoke('generate-queries', {
      body: {
        client_id: clientId.value,
        keywords: keywords.value,
        count: 5 // Generate 5 queries per keyword/intent combination
      }
    })

    if (generateError) throw generateError

    console.log('Generate queries response:', data)

    if (data?.success && data.queries) {
      queries.value = data.queries.map(q => ({
        ...q,
        selected: true // Select all by default
      }))

      // Don't automatically run analysis - let the user select and review queries
      loading.value = false;
    } else {
      throw new Error(data?.error || 'Failed to generate queries')
    }
  } catch (err) {
    console.error('Error generating queries:', err)
    error.value = err.message || 'Failed to generate queries'
    loading.value = false
  }
}

const regenerateQueries = async () => {
  await generateQueries()
}

const runAnalysis = async () => {
  if (selectedPlatforms.value.length === 0) {
    error.value = 'Please select at least one analysis platform'
    return
  }

  const selectedQueries = queries.value.filter(q => q.selected)

  if (selectedQueries.length === 0) {
    error.value = 'Please select at least one query'
    return
  }

  loading.value = true
  loadingMessage.value = 'Starting analysis...'
  error.value = ''

  try {
    console.log('Running analysis with:', {
      client_id: clientId.value,
      platforms: selectedPlatforms.value,
      queries: selectedQueries.length,
      useQueue: useQueueProcessing.value
    })

    // Save queue preference
    toggleQueue(useQueueProcessing.value)

    // Run analysis with all selected platforms in a single run
    const result = await runAnalysisWithQueue({
      client_id: clientId.value,
      platforms: selectedPlatforms.value, // Pass array of platforms
      queries: selectedQueries
    })

    console.log('Run analysis response:', result)

    if (result.success) {
      // Check if we have an analysis_run or analysis_run_id
      const runId = result.analysis_run?.id || result.analysis_run_id
      analysisRunId.value = runId

      // Determine if queued based on processing_method or explicit queued flag
      const isQueued =
        result.processing_method === 'queue' ||
        result.queued ||
        false

      if (isQueued) {
        console.log('Analysis queued for processing')
        // Show queue progress UI
        showProgressUI.value = true
        loading.value = false
      } else {
        // Redirect to analysis results page for direct processing
        console.log('Redirecting to:', `/dashboard/analysis/${runId}`)
        await router.push(`/dashboard/analysis/${runId}`)
      }
    } else {
      throw new Error(result.error || 'Failed to start analysis')
    }
  } catch (err) {
    console.error('Error running analysis:', err)
    error.value = err.message || 'Failed to run analysis'
    loading.value = false
  }
}

// Handle queue completion
const handleQueueComplete = (runData) => {
  console.log('Queue processing completed:', runData)
  showProgressUI.value = false
  loading.value = false

  // Navigate to results page
  router.push(`/dashboard/analysis/${runData.id}`)
}

// Initialize on mount
onMounted(async () => {
  // Get query parameters
  clientId.value = route.query.client_id || ''

  // Handle platform parameter (convert to array for multi-select)
  if (route.query.platform) {
    selectedPlatforms.value = [route.query.platform]
  }

  // Parse keywords
  if (route.query.keywords) {
    keywords.value = route.query.keywords.split(',').filter(k => k.trim())
  }

  // Fetch client name
  if (clientId.value) {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId.value)
        .single()

      if (client) {
        clientName.value = client.name
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  // Initialize queue feature
  initializeQueueFeature()
  useQueueProcessing.value = useQueue.value

  console.log('Page initialized with:', {
    clientId: clientId.value,
    platforms: selectedPlatforms.value,
    keywords: keywords.value,
    queueEnabled: queueEnabled.value,
    useQueue: useQueue.value
  })

  // Validate parameters
  if (!clientId.value || keywords.value.length === 0) {
    error.value = 'Missing required parameters. Please go back and ensure a client and keywords are selected.'
    return
  }

  // Generate queries automatically
  await generateQueries()
})
</script>