<template>
  <div class="h-screen flex flex-col">
    <!-- Header with Title and Filters -->
    <div class="bg-white border-b border-gray-200 p-6">
      <!-- Breadcrumb -->
      <div class="mb-4">
        <NuxtLink to="/dashboard/reports" class="text-blue-600 hover:text-blue-800">
          ← Back to Reports
        </NuxtLink>
      </div>
      
      <!-- Title -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ clientName }} - Analysis Dashboard</h1>
          <p class="text-gray-600 mt-1">{{ formatAnalysisRunTitle(analysisRun) }}</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {{ reportData?.queries?.length || 0 }} Queries
          </span>
          <span :class="getStatusClass(analysisRun?.status)" class="px-3 py-1 text-sm rounded-full">
            {{ analysisRun?.status || 'Loading' }}
          </span>
        </div>
      </div>
      
      <!-- Top Filters -->
      <div class="flex flex-wrap gap-4 items-center">
        <!-- View Type Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">View:</label>
          <select v-model="filters.viewType" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option value="all">All</option>
            <option value="brand">Brand Only</option>
            <option value="competitor">Competitor Only</option>
          </select>
        </div>
        
        <!-- Platform Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Platform:</label>
          <div class="flex gap-2">
            <label class="flex items-center">
              <input type="checkbox" v-model="filters.platforms" value="chatgpt" class="mr-1">
              <span class="text-sm">ChatGPT</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="filters.platforms" value="perplexity" class="mr-1">
              <span class="text-sm">Perplexity</span>
            </label>
          </div>
        </div>
        
        <!-- Query Intent Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Intent:</label>
          <select v-model="filters.queryIntent" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option value="">All Intents</option>
            <option v-for="intent in availableIntents" :key="intent" :value="intent">
              {{ intent }}
            </option>
          </select>
        </div>
        
        <!-- Funnel Stage Filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Funnel:</label>
          <select v-model="filters.funnelStage" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option value="">All Stages</option>
            <option v-for="stage in availableFunnelStages" :key="stage" :value="stage">
              {{ stage }}
            </option>
          </select>
        </div>
        
        <!-- Reset Filters -->
        <button @click="resetFilters" class="text-sm text-blue-600 hover:text-blue-800">
          Reset Filters
        </button>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex">
      <!-- Left Sidebar Navigation -->
      <div class="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <nav class="space-y-1">
          <button 
            v-for="tab in dashboardTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
      
      <!-- Main Dashboard Content -->
      <div class="flex-1 overflow-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center h-full">
          <div class="text-center">
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button @click="fetchReportData" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
        
        <!-- Dashboard Content -->
        <div v-else class="p-6">
          <!-- Brand Performance Tab -->
          <BrandPerformanceDashboard 
            v-if="activeTab === 'brand-performance'"
            :data="filteredReportData"
            :client="client"
            :competitors="competitors"
          />
          
          <!-- Competitor Comparison Tab -->
          <CompetitorComparisonDashboard 
            v-else-if="activeTab === 'competitor-comparison'"
            :data="filteredReportData"
            :client="client"
            :competitors="competitors"
          />
          
          <!-- On-page SEO Tab -->
          <OnPageSEODashboard 
            v-else-if="activeTab === 'onpage-seo'"
            :data="filteredReportData"
            :client="client"
          />
          
          <!-- Query Analysis Tab -->
          <QueryAnalysisDashboard 
            v-else-if="activeTab === 'query-analysis'"
            :data="filteredReportData"
            :client="client"
          />
          
          <!-- Page Analytics Tab -->
          <PageAnalyticsDashboard 
            v-else-if="activeTab === 'page-analytics'"
            :data="filteredReportData"
            :client="client"
          />
          
          <!-- Content Gaps Tab -->
          <ContentGapsDashboard 
            v-else-if="activeTab === 'content-gaps'"
            :data="filteredReportData"
            :client="client"
            :competitors="competitors"
          />
          
          <!-- Recommendations Tab -->
          <RecommendationsDashboard 
            v-else-if="activeTab === 'recommendations'"
            :data="filteredReportData"
            :client="client"
            :competitors="competitors"
          />
          
          <!-- Raw Data Tab (Original View) -->
          <RawDataView 
            v-else-if="activeTab === 'raw-data'"
            :data="filteredReportData"
            :analysis-run="analysisRun"
            :client="client"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const analysisRun = ref(null)
const reportData = ref(null)
const client = ref(null)
const competitors = ref([])
const loading = ref(true)
const error = ref(null)

// Dashboard State
const activeTab = ref('brand-performance')
const filters = ref({
  viewType: 'all',
  platforms: ['chatgpt', 'perplexity'],
  queryIntent: '',
  funnelStage: ''
})

// Dashboard Tabs Configuration
const dashboardTabs = [
  { id: 'brand-performance', name: 'Brand Performance' },
  { id: 'competitor-comparison', name: 'Competitor Comparison' },
  { id: 'onpage-seo', name: 'On-page SEO' },
  { id: 'query-analysis', name: 'Query Analysis' },
  { id: 'page-analytics', name: 'Page Analytics' },
  { id: 'content-gaps', name: 'Content Gaps' },
  { id: 'recommendations', name: 'Recommendations' },
  { id: 'raw-data', name: 'Raw Data' }
]

// Computed
const clientName = computed(() => {
  return client.value?.name || 'Loading...'
})

const availableIntents = computed(() => {
  if (!reportData.value?.queries) return []
  const intents = new Set()
  reportData.value.queries.forEach(query => {
    if (query.query_intent) intents.add(query.query_intent)
  })
  return Array.from(intents).sort()
})

const availableFunnelStages = computed(() => {
  if (!reportData.value?.queries) return []
  const stages = new Set()
  reportData.value.queries.forEach(query => {
    if (query.funnel_stage) stages.add(query.funnel_stage)
  })
  return Array.from(stages).sort()
})

const filteredReportData = computed(() => {
  if (!reportData.value?.queries) return { queries: [] }
  
  let filteredQueries = reportData.value.queries
  
  // Apply View Type Filter
  if (filters.value.viewType === 'brand') {
    filteredQueries = filteredQueries.filter(q => q.brand_mentioned)
  } else if (filters.value.viewType === 'competitor') {
    filteredQueries = filteredQueries.filter(q => q.competitor_count > 0)
  }
  
  // Apply Platform Filter
  if (filters.value.platforms.length > 0) {
    filteredQueries = filteredQueries.filter(q => 
      filters.value.platforms.includes(q.data_source?.toLowerCase())
    )
  }
  
  // Apply Query Intent Filter
  if (filters.value.queryIntent) {
    filteredQueries = filteredQueries.filter(q => 
      q.query_intent === filters.value.queryIntent
    )
  }
  
  // Apply Funnel Stage Filter
  if (filters.value.funnelStage) {
    filteredQueries = filteredQueries.filter(q => 
      q.funnel_stage === filters.value.funnelStage
    )
  }
  
  return {
    ...reportData.value,
    queries: filteredQueries
  }
})

// Methods
const fetchReportData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const analysisRunId = route.params.id
    
    // Fetch analysis run
    const { data: runData, error: runError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', analysisRunId)
      .eq('created_by', user.value.id)
      .single()
    
    if (runError) throw runError
    if (!runData) throw new Error('Analysis run not found')
    
    analysisRun.value = runData
    
    // Fetch client info
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', runData.client_id)
      .eq('created_by', user.value.id)
      .single()
    
    client.value = clientData
    
    // Fetch competitors
    const { data: competitorData } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', runData.client_id)
    
    competitors.value = competitorData || []
    
    // Fetch queries with page analyses
    const { data: queryData, error: queryError } = await supabase
      .from('analysis_queries')
      .select(`
        *,
        page_analyses(*),
        associated_pages
      `)
      .eq('analysis_run_id', analysisRunId)
      .order('created_at')
    
    if (queryError) throw queryError
    
    reportData.value = {
      queries: queryData || []
    }
    
  } catch (err) {
    console.error('Error fetching report data:', err)
    error.value = err.message || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

const formatAnalysisRunTitle = (run) => {
  if (!run) return 'Loading...'
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

const resetFilters = () => {
  filters.value = {
    viewType: 'all',
    platforms: ['chatgpt', 'perplexity'],
    queryIntent: '',
    funnelStage: ''
  }
}

// Watch for filter changes and update URL params
watch(filters, (newFilters) => {
  // Optional: Update URL params to persist filter state
  // This allows bookmarking of filtered views
}, { deep: true })

onMounted(() => {
  fetchReportData()
})
</script>

<style scoped>
/* Custom scrollbar for the main content area */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>