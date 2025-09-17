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
      <!-- Show different dashboard components based on activeTab -->
      <div v-if="activeTab === 'overview'" class="h-full">
        <FullScreenDashboard
          :data="reportData"
          :client="client"
          @close="handleClose"
        />
      </div>

      <!-- Brand Performance Dashboard -->
      <div v-else-if="activeTab === 'brand-performance'" class="h-full px-6 pt-2 pb-6">
        <BrandPerformanceDashboard
          :data="reportData"
          :client="client"
          :competitors="reportData?.competitors || []"
        />
      </div>

      <!-- Testing Dashboard -->
      <div v-else-if="activeTab === 'testing'" class="h-full p-6">
        <TestingDashboard :reportData="reportData" />
      </div>

      <!-- Other dashboard tabs use FullScreenDashboard with the activeTab prop -->
      <div v-else class="h-full">
        <FullScreenDashboard
          :data="reportData"
          :client="client"
          :activeTab="activeTab"
          @close="handleClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullScreenDashboard from '~/components/reports/FullScreenDashboard.vue'
import TestingDashboard from '~/components/reports/TestingDashboard.vue'
import BrandPerformanceDashboard from '~/components/reports/BrandPerformanceDashboard.vue'

// Initialize dark mode support
const { isDark } = useDarkMode()

definePageMeta({
  middleware: ['auth'],
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
const activeTab = ref('overview') // Default tab is overview

// Watch for tab changes in URL
onMounted(() => {
  // Check for tab parameter in URL
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})

// Update active tab when route changes
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
})

// Computed
const clientName = computed(() => client.value?.name || 'Loading...')

// Check if we have a dedicated component for this tab
const hasCustomComponent = computed(() => {
  return ['overview', 'brand-performance', 'testing'].includes(activeTab.value)
})

// Format analysis run title
const formatAnalysisRunTitle = (run) => {
  if (!run) return ''
  if (run.name) return run.name
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
    
    // Check ownership - support super admin, client creator, and client user assigned to client
    const userProfile = await supabase
      .from('profiles')
      .select('role, account_type, client_account_id')
      .eq('id', user.value?.id)
      .single()

    // Check if user is super admin
    const isSuperAdmin = userProfile.data?.role === 'super_admin' || userProfile.data?.account_type === 'super_admin'

    // Check if user created the client
    const isOwner = clientData.created_by === user.value?.id || clientData.user_id === user.value?.id

    // Check if user is a client user assigned to this client
    const isAssignedClient = (userProfile.data?.role === 'client' || userProfile.data?.account_type === 'client') &&
                             userProfile.data?.client_account_id === clientData.id

    if (!isSuperAdmin && !isOwner && !isAssignedClient) {
      throw new Error('Access denied: You do not have permission to view this report')
    }
    
    client.value = clientData
    
    // Get competitors for this client
    const { data: competitorData, error: competitorError } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', clientData.id)
    
    // Handle competitor data
    competitors.value = competitorError ? [] : (competitorData || [])
    
    // Get analysis queries
    const { data: queriesData, error: queriesError } = await supabase
      .from('analysis_queries')
      .select('*')
      .eq('analysis_run_id', analysisRunId)

    // Get page analyses for this run
    const { data: pagesData, error: pagesError } = await supabase
      .from('page_analyses')
      .select('*')
      .in('query_id', queriesData.map(q => q.id))

    // Compile report data
    reportData.value = {
      analysis_run: analysisRunData,
      analysis_queries: queriesData || [],
      page_analyses: pagesData || [],
      client: clientData,
      competitors: competitors.value
    }
    
  } catch (err) {
    // Set error message for user display
    error.value = err.message || 'Failed to load report data'
  } finally {
    loading.value = false
  }
}

// Handle tab change events from SidebarContextPanel
const handleDashboardTabChange = (e) => {
  const tab = e.detail.tab
  activeTab.value = tab

  // Update URL with tab parameter
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      tab
    }
  })
}

// Initialize
onMounted(() => {
  fetchReportData()

  // Listen for dashboard tab changes
  window.addEventListener('dashboard-tab-changed', handleDashboardTabChange)
})

// Update page title when analysisRun changes
watch(analysisRun, (newRun) => {
  if (newRun) {
    const title = formatAnalysisRunTitle(newRun)
    useHead({
      title: `${title} - Citebots`
    })
  }
}, { immediate: true })

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('dashboard-tab-changed', handleDashboardTabChange)
})
</script>