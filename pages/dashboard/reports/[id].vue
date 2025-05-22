<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Include TopNavigation directly -->
    <TopNavigation />
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Breadcrumb -->
        <div class="mb-6">
          <NuxtLink to="/dashboard/reports" class="text-citebots-orange hover:text-citebots-orange/80 text-sm font-medium">
            ← Back to Reports
          </NuxtLink>
        </div>
        
        <!-- Page Title and Meta -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-citebots-dark">{{ clientName }}</h1>
            <p class="text-lg text-gray-600 mt-2">{{ formatAnalysisRunTitle(analysisRun) }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <span class="text-blue-700 font-semibold">{{ reportData?.queries?.length || 0 }}</span>
              <span class="text-blue-600 text-sm ml-1">Queries</span>
            </div>
            <div :class="getStatusClass(analysisRun?.status)" class="px-4 py-2 rounded-lg font-medium">
              {{ analysisRun?.status || 'Loading' }}
            </div>
          </div>
        </div>
        
        <!-- Filter Controls -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <!-- View Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">View Type</label>
              <select v-model="filters.viewType" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-citebots-orange focus:border-transparent">
                <option value="all">All Data</option>
                <option value="brand">Brand Only</option>
                <option value="competitor">Competitor Only</option>
              </select>
            </div>
            
            <!-- Platform Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div class="space-y-2">
                <label class="flex items-center text-sm">
                  <input type="checkbox" v-model="filters.platforms" value="chatgpt" class="rounded border-gray-300 text-citebots-orange focus:ring-citebots-orange mr-2">
                  ChatGPT
                </label>
                <label class="flex items-center text-sm">
                  <input type="checkbox" v-model="filters.platforms" value="perplexity" class="rounded border-gray-300 text-citebots-orange focus:ring-citebots-orange mr-2">
                  Perplexity
                </label>
              </div>
            </div>
            
            <!-- Query Intent Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Query Intent</label>
              <select v-model="filters.queryIntent" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-citebots-orange focus:border-transparent">
                <option value="">All Intents</option>
                <option v-for="intent in availableIntents" :key="intent" :value="intent">
                  {{ intent }}
                </option>
              </select>
            </div>
            
            <!-- Funnel Stage Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Funnel Stage</label>
              <select v-model="filters.funnelStage" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-citebots-orange focus:border-transparent">
                <option value="">All Stages</option>
                <option v-for="stage in availableFunnelStages" :key="stage" :value="stage">
                  {{ stage }}
                </option>
              </select>
            </div>
            
            <!-- Reset Filters -->
            <div>
              <button @click="resetFilters" class="w-full px-4 py-2 text-sm font-medium text-citebots-orange bg-white border border-citebots-orange rounded-lg hover:bg-citebots-orange hover:text-white transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Dashboard Area - Full control of layout -->
    <div class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-8">
          <!-- Professional Sidebar Navigation -->
          <div class="w-60 flex-shrink-0">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
              <!-- Sidebar Header -->
              <div class="bg-citebots-dark px-6 py-4">
                <h3 class="text-white font-semibold">Analytics Dashboard</h3>
              </div>

              <!-- Navigation Sections -->
              <nav class="p-2">
                <!-- Performance Section -->
                <div class="mb-6">
                  <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </div>
                  <div class="space-y-1">
                    <button
                      @click="activeTab = 'brand-performance'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'brand-performance'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Brand Performance
                    </button>
                    <button
                      @click="activeTab = 'competitor-comparison'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'competitor-comparison'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Competitor Analysis
                    </button>
                  </div>
                </div>

                <!-- Technical Section -->
                <div class="mb-6">
                  <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-100 pt-4">
                    Technical
                  </div>
                  <div class="space-y-1">
                    <button
                      @click="activeTab = 'onpage-seo'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'onpage-seo'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      On-page SEO
                    </button>
                    <button
                      @click="activeTab = 'page-analytics'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'page-analytics'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Page Analytics
                    </button>
                  </div>
                </div>

                <!-- Insights Section -->
                <div class="mb-6">
                  <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-100 pt-4">
                    Insights
                  </div>
                  <div class="space-y-1">
                    <button
                      @click="activeTab = 'query-analysis'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'query-analysis'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Query Analysis
                    </button>
                    <button
                      @click="activeTab = 'content-gaps'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'content-gaps'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Content Gaps
                    </button>
                    <button
                      @click="activeTab = 'recommendations'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'recommendations'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Recommendations
                    </button>
                  </div>
                </div>

                <!-- Data Section -->
                <div>
                  <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-100 pt-4">
                    Data
                  </div>
                  <div class="space-y-1">
                    <button
                      @click="activeTab = 'raw-data'"
                      :class="[
                        'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        activeTab === 'raw-data'
                          ? 'bg-citebots-orange text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-citebots-orange'
                      ]"
                    >
                      Raw Data
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          <!-- Main Dashboard Content -->
          <div class="flex-1 min-w-0">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center h-96">
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
                <p class="mt-4 text-gray-600">Loading dashboard data...</p>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="flex items-center justify-center h-96">
              <div class="text-center bg-white rounded-xl border border-red-200 p-8">
                <div class="text-red-500 mb-4">
                  <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-red-600 mb-4 font-medium">{{ error }}</p>
                <button @click="fetchReportData" class="px-6 py-2 bg-citebots-orange text-white rounded-lg hover:bg-citebots-orange/90 transition-colors">
                  Retry Loading
                </button>
              </div>
            </div>

            <!-- Dashboard Content -->
            <div v-else>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandPerformanceDashboard from '~/components/reports/BrandPerformanceDashboard.vue'
import CompetitorComparisonDashboard from '~/components/reports/CompetitorComparisonDashboard.vue'
import OnPageSEODashboard from '~/components/reports/OnPageSEODashboard.vue'
import QueryAnalysisDashboard from '~/components/reports/QueryAnalysisDashboard.vue'
import PageAnalyticsDashboard from '~/components/reports/PageAnalyticsDashboard.vue'
import ContentGapsDashboard from '~/components/reports/ContentGapsDashboard.vue'
import RecommendationsDashboard from '~/components/reports/RecommendationsDashboard.vue'
import RawDataView from '~/components/reports/RawDataView.vue'
import TopNavigation from '~/components/layout/TopNavigation.vue'

definePageMeta({
  middleware: 'auth',
  layout: false
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
    'completed': 'bg-green-50 border border-green-200 text-green-700',
    'running': 'bg-blue-50 border border-blue-200 text-blue-700',
    'failed': 'bg-red-50 border border-red-200 text-red-700',
    'pending': 'bg-gray-50 border border-gray-200 text-gray-700'
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