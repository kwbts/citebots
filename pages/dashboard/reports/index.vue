<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Reports</h1>
    
    <!-- Client and Report Selection -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Select Report</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Client Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <select v-model="selectedClientId" 
                  @change="onClientChange"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a client...</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>
        
        <!-- Analysis Run Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Analysis Run</label>
          <select v-model="selectedAnalysisRunId" 
                  @change="onAnalysisRunChange"
                  :disabled="!selectedClientId || loadingAnalysisRuns"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">
              {{ loadingAnalysisRuns ? 'Loading...' : (selectedClientId ? 'Select an analysis run...' : 'Select a client first') }}
            </option>
            <option v-for="run in analysisRuns" :key="run.id" :value="run.id">
              {{ formatAnalysisRunOption(run) }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Open Dashboard Button -->
      <button v-if="selectedClientId && selectedAnalysisRunId"
              @click="viewReport"
              class="bg-citebots-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 font-medium">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span>Open Analytics Dashboard</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedClientId || !selectedAnalysisRunId" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div class="max-w-sm mx-auto">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Select Client and Analysis Run</h2>
        <p class="text-gray-600">
          Choose a client and one of their analysis runs to open the full-screen analytics dashboard with comprehensive insights and visualizations.
        </p>
      </div>
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
          
          <!-- Modal content matches the existing analysis/[id] page structure -->
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
            
            <!-- Analysis Metrics -->
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
                  <p class="font-medium">{{ formatSentiment(selectedQuery.brand_sentiment) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Response -->
            <div>
              <h4 class="font-medium mb-2">Response</h4>
              <div class="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p class="whitespace-pre-wrap text-sm">{{ selectedQuery.model_response }}</p>
              </div>
            </div>
            
            <!-- Raw Data -->
            <div>
              <h4 class="font-medium mb-2">Raw Query Data</h4>
              <div class="bg-gray-50 p-4 rounded overflow-x-auto">
                <pre class="text-xs">{{ JSON.stringify(selectedQuery, null, 2) }}</pre>
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

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const clients = ref([])
const analysisRuns = ref([])
const selectedClientId = ref('')
const selectedAnalysisRunId = ref('')
const reportData = ref(null)
const selectedQuery = ref(null)
const loadingAnalysisRuns = ref(false)

// Computed
const selectedClient = computed(() => {
  return clients.value.find(c => c.id === selectedClientId.value)
})

const selectedAnalysisRun = computed(() => {
  return analysisRuns.value.find(r => r.id === selectedAnalysisRunId.value)
})

// Methods
const fetchClients = async () => {
  try {
    console.log('Fetching clients for user:', user.value?.id)
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('created_by', user.value.id)
      .order('name')

    if (error) throw error
    console.log('Fetched clients:', data)
    clients.value = data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const onClientChange = async () => {
  selectedAnalysisRunId.value = ''
  analysisRuns.value = []
  reportData.value = null
  
  if (!selectedClientId.value) return
  
  loadingAnalysisRuns.value = true
  
  try {
    const { data, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('client_id', selectedClientId.value)
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    analysisRuns.value = data || []
  } catch (error) {
    console.error('Error fetching analysis runs:', error)
  } finally {
    loadingAnalysisRuns.value = false
  }
}

const onAnalysisRunChange = () => {
  reportData.value = null
}

const viewReport = () => {
  if (!selectedAnalysisRunId.value) return

  // Navigate to the report page with the analysis run ID
  navigateTo(`/dashboard/reports/${selectedAnalysisRunId.value}`)
}

const formatAnalysisRunOption = (run) => {
  const date = new Date(run.created_at).toLocaleDateString()
  const status = run.status || 'unknown'
  const platform = run.platform || 'unknown'
  const queries = run.queries_total || 0
  
  return `${platform.toUpperCase()} - ${date} (${queries} queries, ${status})`
}

const formatAnalysisRunTitle = (run) => {
  const date = new Date(run.created_at).toLocaleDateString()
  return `${run.platform?.toUpperCase() || 'Analysis'} - ${date}`
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

const formatSentiment = (score) => {
  if (score === undefined || score === null) return 'N/A'
  
  const numScore = parseFloat(score)
  if (isNaN(numScore)) return 'N/A'
  
  return numScore > 0 ? `+${numScore.toFixed(2)}` : numScore.toFixed(2)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchClients()
})
</script>