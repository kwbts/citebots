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
        
        <div v-if="query.brand_mentioned || query.competitor_count > 0" class="mt-3 flex gap-3">
          <span v-if="query.brand_mentioned" class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
            Brand Mentioned
          </span>
          <span v-if="query.competitor_count > 0" class="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {{ query.competitor_count }} Competitors
          </span>
        </div>
        
        <div v-if="query.citation_count > 0" class="mt-3">
          <p class="text-sm text-gray-600">{{ query.citation_count }} citations analyzed</p>
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
            </div>
            
            <div>
              <h4 class="font-medium mb-2">Response</h4>
              <div class="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                <p class="whitespace-pre-wrap">{{ selectedQuery.model_response }}</p>
              </div>
            </div>
            
            <div v-if="selectedQuery.page_analyses && selectedQuery.page_analyses.length > 0">
              <h4 class="font-medium mb-2">Analyzed Pages</h4>
              <div class="space-y-2">
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
    
    // Fetch queries with page analyses
    const { data: queryData, error: queryError } = await supabase
      .from('analysis_queries')
      .select(`
        *,
        page_analyses(*)
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

onMounted(() => {
  fetchAnalysisData()
})
</script>