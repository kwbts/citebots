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
          <p :class="getStatusClass(analysisRun.status)">
            {{ analysisRun.status }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Progress</p>
          <p class="font-medium">
            {{ analysisRun.queries_completed }} / {{ analysisRun.queries_total }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Keywords -->
    <div v-if="analysisRun" class="mb-8 bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Keywords</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="keyword in analysisRun.keywords" :key="keyword" 
              class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {{ keyword }}
        </span>
      </div>
    </div>
    
    <!-- Query Results -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Query Results</h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading queries...</p>
      </div>
      
      <div v-else-if="queries.length > 0" class="space-y-4">
        <div v-for="query in queries" :key="query.id" 
             class="border rounded-lg p-4" 
             :class="query.status === 'completed' ? 'border-green-200' : 'border-gray-200'">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="font-medium text-lg">{{ query.query_text }}</h3>
              <p class="text-sm text-gray-600">
                Keyword: {{ query.query_keyword }} | Intent: {{ query.query_intent }}
              </p>
            </div>
            <span :class="getQueryStatusClass(query.status)" 
                  class="px-2 py-1 text-xs rounded-full">
              {{ query.status }}
            </span>
          </div>
          
          <div v-if="query.status === 'completed'" class="mt-4">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Citations:</span>
                <span class="font-medium ml-1">{{ query.citation_count || 0 }}</span>
              </div>
              <div>
                <span class="text-gray-600">Brand Mentioned:</span>
                <span class="font-medium ml-1">{{ query.brand_mentioned ? 'Yes' : 'No' }}</span>
              </div>
              <div>
                <span class="text-gray-600">Pages Analyzed:</span>
                <span class="font-medium ml-1">{{ query.associated_pages_count || 0 }}</span>
              </div>
            </div>
            
            <!-- Show response preview -->
            <div v-if="query.model_response" class="mt-4">
              <p class="text-sm text-gray-600 mb-1">Response Preview:</p>
              <p class="text-sm bg-gray-50 p-3 rounded">
                {{ query.model_response.substring(0, 200) }}...
              </p>
            </div>
            
            <!-- View Details Button -->
            <button @click="selectedQuery = query" 
                    class="mt-4 text-sm text-blue-600 hover:text-blue-800">
              View Details →
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        No queries found
      </div>
    </div>
    
    <!-- Query Details Modal -->
    <div v-if="selectedQuery" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
         @click="selectedQuery = null">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6"
           @click.stop>
        <h3 class="text-xl font-semibold mb-4">Query Details</h3>
        
        <div class="mb-4">
          <p class="font-medium">{{ selectedQuery.query_text }}</p>
          <p class="text-sm text-gray-600">
            Keyword: {{ selectedQuery.query_keyword }} | Intent: {{ selectedQuery.query_intent }}
          </p>
        </div>
        
        <div class="mb-6">
          <h4 class="font-medium mb-2">Response</h4>
          <div class="bg-gray-50 p-4 rounded whitespace-pre-wrap">{{ selectedQuery.model_response }}</div>
        </div>
        
        <div v-if="selectedQuery.page_analyses && selectedQuery.page_analyses.length > 0">
          <h4 class="font-medium mb-2">Page Analyses</h4>
          <div class="space-y-2">
            <div v-for="page in selectedQuery.page_analyses" :key="page.id"
                 class="border rounded p-3">
              <p class="font-medium text-sm">{{ page.domain_name }}</p>
              <p class="text-xs text-gray-600">{{ page.citation_url }}</p>
              <div class="mt-2 text-xs">
                <span v-if="page.is_client_domain" class="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Client Domain
                </span>
                <span v-if="page.is_competitor_domain" class="bg-red-100 text-red-800 px-2 py-1 rounded ml-2">
                  Competitor
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="selectedQuery = null" 
                class="mt-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

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
  switch (status) {
    case 'completed':
      return 'text-green-600 font-medium'
    case 'running':
      return 'text-blue-600 font-medium'
    case 'failed':
      return 'text-red-600 font-medium'
    default:
      return 'text-gray-600'
  }
}

const getQueryStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'running':
      return 'bg-blue-100 text-blue-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Lifecycle
onMounted(() => {
  fetchAnalysisData()
  
  // Poll for updates if still running
  const interval = setInterval(async () => {
    if (analysisRun.value?.status === 'running') {
      await fetchAnalysisData()
    } else {
      clearInterval(interval)
    }
  }, 5000)
})
</script>