<template>
  <div class="h-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
        <button @click="fetchReportData" class="px-6 py-2 bg-citebots-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          Retry Loading
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="reportData && client" class="h-full">
      <FullScreenDashboard
        :data="reportData"
        :client="client"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullScreenDashboard from '~/components/reports/FullScreenDashboard.vue'

// Initialize dark mode support
const { isDark } = useDarkMode()

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const analysisRun = ref(null)
const reportData = ref(null)
const client = ref(null)
const competitors = ref([])
const loading = ref(true)
const error = ref(null)

// Computed
const clientName = computed(() => client.value?.name || 'Loading...')

// Format analysis run title
const formatAnalysisRunTitle = (run) => {
  if (!run) return ''
  return `Analysis Run from ${new Date(run.created_at).toLocaleDateString()}`
}

// Status class helper
const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Handle close - go back to reports index
const handleClose = () => {
  router.push('/dashboard/reports')
}

// Fetch report data
const fetchReportData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const analysisRunId = route.params.id
    
    // Get analysis run details
    const { data: analysisRunData, error: runError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', analysisRunId)
      .single()
    
    if (runError) throw runError
    if (!analysisRunData) throw new Error('Analysis run not found')
    
    analysisRun.value = analysisRunData
    
    // Check if user owns this analysis run through client ownership
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', analysisRunData.client_id)
      .single()
    
    if (clientError) throw clientError
    if (!clientData) throw new Error('Client not found')
    
    // Check ownership - support both created_by and user_id columns
    const isOwner = clientData.created_by === user.value?.id || clientData.user_id === user.value?.id
    if (!isOwner) {
      throw new Error('Access denied: You do not have permission to view this report')
    }
    
    client.value = clientData
    
    // Get competitors for this client
    const { data: competitorData, error: competitorError } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', clientData.id)
    
    if (competitorError) {
      console.warn('Error fetching competitors:', competitorError)
      competitors.value = []
    } else {
      competitors.value = competitorData || []
    }
    
    // Get analysis queries first
    const { data: queriesData, error: queriesError } = await supabase
      .from('analysis_queries')
      .select('*')
      .eq('analysis_run_id', analysisRunId)

    if (queriesError) {
      console.warn('Error fetching queries:', queriesError)
    }

    // Get page analyses using the query IDs (correct relationship)
    let pagesData = []
    if (queriesData && queriesData.length > 0) {
      const queryIds = queriesData.map(q => q.id)
      const { data: pageAnalyses, error: pagesError } = await supabase
        .from('page_analyses')
        .select('*')
        .in('query_id', queryIds)

      if (pagesError) {
        console.warn('Error fetching pages:', pagesError)
      } else {
        pagesData = pageAnalyses || []
      }
    }

    const queriesResult = { data: queriesData, error: queriesError }
    const pagesResult = { data: pagesData, error: null }
    
    if (queriesResult.error) {
      console.warn('Error fetching queries:', queriesResult.error)
    }
    
    if (pagesResult.error) {
      console.warn('Error fetching pages:', pagesResult.error)
    }
    
    // Compile report data
    reportData.value = {
      analysis_run: analysisRunData,
      analysis_queries: queriesResult.data || [],
      page_analyses: pagesResult.data || [],
      client: clientData,
      competitors: competitors.value
    }
    
  } catch (err) {
    console.error('Error fetching report data:', err)
    error.value = err.message || 'Failed to load report data'
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchReportData()
})
</script>