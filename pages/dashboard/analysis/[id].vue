<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/dashboard/analysis" class="text-blue-600 hover:text-blue-800">
        ← Back to Analysis
      </NuxtLink>
    </div>
    
    <h1 class="text-2xl font-bold mb-6">Analysis Results</h1>
    
    <!-- Analysis Run Info -->
    <div v-if="analysisRun" class="mb-8 bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Analysis Overview</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-gray-600">Client</p>
          <p class="font-medium">{{ clientName }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Platform</p>
          <p class="font-medium">{{ analysisRun.platform }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Status</p>
          <p class="font-medium capitalize">{{ analysisRun.status }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Progress</p>
          <p class="font-medium">{{ analysisRun.queries_completed }}/{{ analysisRun.queries_total }}</p>
        </div>
      </div>

      <!-- Queue Progress Display -->
      <div v-if="isQueueProcessing" class="mt-6">
        <QueueProgress
          :analysis-run-id="route.params.id"
          @complete="refreshAnalysisData"
        />
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading analysis results...</p>
    </div>
    
    <!-- Queries List -->
    <div v-else-if="queries.length > 0" class="space-y-4">
      <h3 class="text-lg font-semibold mb-4">Query Results</h3>
      
      <div v-for="query in queries" :key="query.id"
           class="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
           @click="selectedQuery = query">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium text-lg">{{ query.query_text }}</h4>
          <span :class="getStatusClass(query.status)" class="px-2 py-1 text-xs rounded-full">
            {{ query.status }}
          </span>
        </div>

        <div class="text-sm text-gray-600 mb-2">
          <span>Keyword: {{ query.query_keyword }}</span>
          <span class="mx-2">•</span>
          <span>Intent: {{ query.query_intent }}</span>
          <span class="mx-2">•</span>
          <span>Platform: {{ query.data_source }}</span>
        </div>

        <!-- Brand and Competitor Metrics -->
        <div class="mt-3 flex flex-wrap gap-2">
          <span v-if="query.brand_mentioned" class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
            Brand Mentioned
          </span>
          <span v-if="query.competitor_count > 0" class="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {{ query.competitor_count }} Competitors
          </span>
          <span v-if="query.brand_mention_count" class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {{ query.brand_mention_count }} Brand Mentions
          </span>
          <span v-if="query.sentiment_score" class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
            Sentiment: {{ formatSentiment(query.sentiment_score) }}
          </span>
        </div>

        <!-- Analysis Metrics -->
        <div class="mt-3 space-y-1">
          <p v-if="query.citation_count > 0" class="text-sm text-gray-600">
            {{ query.citation_count }} citations analyzed
          </p>
          <p v-if="query.query_category" class="text-sm text-gray-600">
            Category: {{ query.query_category }} | Type: {{ query.query_type }}
          </p>
          <p v-if="query.funnel_stage" class="text-sm text-gray-600">
            Funnel: {{ query.funnel_stage }} | Competition: {{ query.query_competition }}
          </p>
          <p v-if="query.brand_mention_type && query.brand_mention_type !== 'none'" class="text-sm font-medium text-green-700">
            Brand Mention Type: {{ query.brand_mention_type }}
          </p>
        </div>

        <!-- Page Analysis Summary -->
        <div v-if="query.page_analyses && query.page_analyses.length > 0" class="mt-4 border-t pt-3">
          <p class="text-sm font-medium text-gray-700 mb-2">Top Citations ({{ query.page_analyses.length }}):</p>
          <div class="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
            <div v-for="page in query.page_analyses.slice(0, 3)" :key="page.id" class="flex items-start">
              <span v-if="page.brand_mentioned" class="text-green-600 mr-1">✓</span>
              <span v-else class="text-gray-400 mr-1">○</span>
              <span class="truncate" :title="page.page_title || page.citation_url">
                {{ truncateText(page.page_title || page.citation_url, 60) }}
              </span>
            </div>
            <div v-if="query.page_analyses.length > 3" class="text-blue-600">
              + {{ query.page_analyses.length - 3 }} more citations
            </div>
          </div>
        </div>

        <!-- Analysis Metadata -->
        <div class="mt-3 border-t pt-2 text-xs text-gray-500 flex justify-between">
          <div>ID: {{ truncateText(query.id, 8) }}</div>
          <div>Created: {{ formatDate(query.created_at) }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <p class="text-gray-600">No queries found for this analysis run.</p>
    </div>
    
    <!-- Query Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedQuery" 
           class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
           @click="selectedQuery = null">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
             @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">Query Details</h3>
            <button @click="selectedQuery = null" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-medium mb-2">Query</h4>
              <p class="text-gray-700">{{ selectedQuery.query_text }}</p>

              <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Keyword</p>
                  <p class="font-medium">{{ selectedQuery.query_keyword || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Intent</p>
                  <p class="font-medium">{{ selectedQuery.query_intent || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Platform</p>
                  <p class="font-medium">{{ selectedQuery.data_source || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Status</p>
                  <p class="font-medium capitalize">{{ selectedQuery.status || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Query Analysis Metrics -->
            <div>
              <h4 class="font-medium mb-2">Analysis Metrics</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Citations</p>
                  <p class="font-medium">{{ selectedQuery.citation_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Brand Mentions</p>
                  <p class="font-medium">{{ selectedQuery.brand_mention_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Competitors</p>
                  <p class="font-medium">{{ selectedQuery.competitor_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Sentiment</p>
                  <p class="font-medium">{{ formatSentiment(selectedQuery.sentiment_score) }}</p>
                </div>

                <div v-if="selectedQuery.query_category" class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Category</p>
                  <p class="font-medium">{{ selectedQuery.query_category }}</p>
                </div>
                <div v-if="selectedQuery.query_type" class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Type</p>
                  <p class="font-medium">{{ selectedQuery.query_type }}</p>
                </div>
                <div v-if="selectedQuery.funnel_stage" class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Funnel</p>
                  <p class="font-medium">{{ selectedQuery.funnel_stage }}</p>
                </div>
                <div v-if="selectedQuery.query_competition" class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Competition</p>
                  <p class="font-medium">{{ selectedQuery.query_competition }}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium mb-2">Response</h4>
              <div class="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p class="whitespace-pre-wrap text-sm">{{ selectedQuery.model_response }}</p>
              </div>
            </div>

            <!-- Processing Data -->
            <div>
              <h4 class="font-medium mb-2">Processing Details</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Created</p>
                  <p class="font-medium">{{ formatDate(selectedQuery.created_at) }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Processing Time</p>
                  <p class="font-medium">
                    {{ selectedQuery.processing_time ? (selectedQuery.processing_time + 'ms') : 'N/A' }}
                  </p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Query ID</p>
                  <p class="font-medium text-xs truncate" :title="selectedQuery.id">{{ selectedQuery.id }}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium mb-2">Raw Query Data</h4>
              <div class="bg-gray-50 p-4 rounded overflow-x-auto">
                <pre class="text-xs">{{ JSON.stringify(selectedQuery, null, 2) }}</pre>
              </div>
            </div>
            
            <div v-if="(selectedQuery.page_analyses && selectedQuery.page_analyses.length > 0) || selectedQuery.associated_pages">
              <h4 class="font-medium mb-2">Analyzed Pages</h4>

              <!-- From page_analyses table -->
              <div v-if="selectedQuery.page_analyses && selectedQuery.page_analyses.length > 0" class="space-y-2 mb-4">
                <p class="text-sm text-gray-600">From page_analyses table:</p>
                <div v-for="page in selectedQuery.page_analyses"
                     :key="page.id"
                     class="bg-gray-50 p-3 rounded">
                  <a :href="page.citation_url" target="_blank" class="text-blue-600 hover:text-blue-800">
                    {{ page.page_title || page.citation_url }}
                  </a>
                  <div class="text-sm text-gray-600 mt-1">
                    <span v-if="page.brand_mentioned" class="mr-3">✓ Brand mentioned</span>
                    <span v-if="page.relevance_score">Relevance: {{ (page.relevance_score * 100).toFixed(0) }}%</span>
                  </div>
                  <details class="mt-2">
                    <summary class="cursor-pointer text-sm text-gray-500">View raw data</summary>
                    <pre class="text-xs mt-2 bg-white p-2 rounded">{{ JSON.stringify(page, null, 2) }}</pre>
                  </details>
                </div>
              </div>

              <!-- From associated_pages column -->
              <div v-if="selectedQuery.associated_pages" class="space-y-2">
                <p class="text-sm text-gray-600">From associated_pages column:</p>
                <div v-for="(page, index) in selectedQuery.associated_pages"
                     :key="`ap-${index}`"
                     class="bg-blue-50 p-3 rounded">
                  <a :href="page.citation_url || page.url" target="_blank" class="text-blue-600 hover:text-blue-800">
                    {{ page.page_title || page.title || page.citation_url || page.url }}
                  </a>
                  <div class="text-sm text-gray-600 mt-1">
                    <span v-if="page.brand_mentioned" class="mr-3">✓ Brand mentioned</span>
                    <span v-if="page.relevance_score">Relevance: {{ (page.relevance_score * 100).toFixed(0) }}%</span>
                  </div>
                  <details class="mt-2">
                    <summary class="cursor-pointer text-sm text-gray-500">View raw data</summary>
                    <pre class="text-xs mt-2 bg-white p-2 rounded">{{ JSON.stringify(page, null, 2) }}</pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import QueueProgress from '~/components/analysis/QueueProgress.vue'

// Ensure dashboard layout is used
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const supabase = useSupabaseClient()

// Data
const analysisRun = ref(null)
const queries = ref([])
const loading = ref(true)
const selectedQuery = ref(null)
const client = ref(null)

// Computed
const clientName = computed(() => {
  return client.value?.name || 'Loading...'
})

const isQueueProcessing = computed(() => {
  // Check if analysis is using queue and is still processing
  return (
    analysisRun.value?.processing_method === 'queue' &&
    (analysisRun.value?.status === 'running' || analysisRun.value?.status === 'pending')
  )
})

// Methods
const fetchAnalysisData = async () => {
  try {
    // Fetch analysis run
    const { data: runData, error: runError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (runError) throw runError
    analysisRun.value = runData
    
    // Fetch client info
    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', runData.client_id)
      .single()
    
    client.value = clientData
    
    // EMERGENCY: Skip page_analyses JOIN due to resource exhaustion
    // TODO: Re-enable once RLS is properly fixed
    const { data: queryData, error: queryError } = await supabase
      .from('analysis_queries')
      .select(`
        *,
        associated_pages
      `)
      .eq('analysis_run_id', route.params.id)
      .order('created_at')
    
    if (queryError) throw queryError
    queries.value = queryData || []
    
  } catch (error) {
    console.error('Error fetching analysis data:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    'completed': 'bg-green-100 text-green-800',
    'running': 'bg-blue-100 text-blue-800',
    'failed': 'bg-red-100 text-red-800',
    'pending': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

// Format sentiment score
const formatSentiment = (score) => {
  if (score === undefined || score === null) return 'N/A'

  const numScore = parseFloat(score)
  if (isNaN(numScore)) return 'N/A'

  // Format to two decimal places with + sign for positive values
  return numScore > 0 ? `+${numScore.toFixed(2)}` : numScore.toFixed(2)
}

// Truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Refresh analysis data after queue completion
const refreshAnalysisData = () => {
  console.log('Refreshing analysis data after queue completion')
  // Allow a small delay before fetching to ensure all database writes have completed
  setTimeout(() => {
    fetchAnalysisData()
  }, 1000)
}

onMounted(() => {
  fetchAnalysisData()
})
</script>