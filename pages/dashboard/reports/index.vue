<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title text-gray-900 dark:text-white">Reports</h1>
      <p class="page-subtitle text-gray-600 dark:text-gray-300">View and analyze your client reports and insights</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="loadingClients" class="card">
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div class="space-y-3">
          <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div class="h-12 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>

    <!-- Report Selection -->
    <div v-else class="card">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Report</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Choose a client and analysis run to view detailed reports</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Client Selection -->
        <div class="space-y-2">
          <label class="form-label">
            Client
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select 
              v-model="selectedClientId" 
              @change="onClientChange"
              class="input-field pr-10 appearance-none"
              :class="{ 'border-red-300 dark:border-red-600': !selectedClientId && attempted }"
            >
              <option value="">Choose a client...</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <p v-if="clients.length === 0" class="text-sm text-amber-600 dark:text-amber-400">
            No clients found. <NuxtLink to="/dashboard/clients" class="underline hover:no-underline">Create your first client</NuxtLink>
          </p>
        </div>
        
        <!-- Analysis Run Selection -->
        <div class="space-y-2">
          <label class="form-label">
            Analysis Run
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select 
              v-model="selectedAnalysisRunId" 
              @change="onAnalysisRunChange"
              :disabled="!selectedClientId || loadingAnalysisRuns"
              class="input-field pr-10 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'border-red-300 dark:border-red-600': !selectedAnalysisRunId && selectedClientId && attempted }"
            >
              <option value="">
                {{ getAnalysisRunPlaceholder() }}
              </option>
              <option v-for="run in analysisRuns" :key="run.id" :value="run.id">
                {{ formatAnalysisRunOption(run) }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg v-if="loadingAnalysisRuns" class="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <p v-if="selectedClientId && analysisRuns.length === 0 && !loadingAnalysisRuns" class="text-sm text-amber-600 dark:text-amber-400">
            No analysis runs found for this client. <NuxtLink to="/dashboard/analysis" class="underline hover:no-underline">Run your first analysis</NuxtLink>
          </p>
        </div>
      </div>

      <!-- Selected Analysis Info -->
      <div v-if="selectedAnalysisRun" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-medium text-blue-900 dark:text-blue-200 mb-1">
              {{ formatAnalysisRunTitle(selectedAnalysisRun) }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-blue-700 dark:text-blue-300">Status:</span>
                <span :class="getStatusClass(selectedAnalysisRun.status)" class="ml-1 px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ selectedAnalysisRun.status || 'unknown' }}
                </span>
              </div>
              <div class="text-blue-700 dark:text-blue-300">
                <span>Queries:</span> <span class="font-medium">{{ selectedAnalysisRun.queries_total || 0 }}</span>
              </div>
              <div class="text-blue-700 dark:text-blue-300">
                <span>Platform:</span> <span class="font-medium uppercase">{{ selectedAnalysisRun.platform || 'N/A' }}</span>
              </div>
              <div class="text-blue-700 dark:text-blue-300">
                <span>Created:</span> <span class="font-medium">{{ formatDate(selectedAnalysisRun.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button 
          v-if="selectedClientId && selectedAnalysisRunId"
          @click="viewReport"
          class="btn-primary flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Open Analytics Dashboard
        </button>
        
        <button 
          v-else
          @click="attempted = true"
          class="btn bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed opacity-50"
          disabled
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          Select Client & Analysis Run
        </button>

        <NuxtLink
          to="/dashboard/analysis"
          class="btn-outline flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Run New Analysis
        </NuxtLink>
      </div>
    </div>

    <!-- Empty States -->
    <div v-if="!loadingClients" class="space-y-8">
      <!-- No Clients -->
      <div v-if="clients.length === 0" class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Clients Found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You need to create at least one client before you can view reports. Clients help organize your analysis runs and data.
        </p>
        <NuxtLink to="/dashboard/clients" class="btn-primary inline-flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Create Your First Client
        </NuxtLink>
      </div>

      <!-- No Selection Made -->
      <div v-else-if="!selectedClientId || !selectedAnalysisRunId" class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to View Reports</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
          Select a client and one of their analysis runs above to open the comprehensive analytics dashboard with detailed insights, visualizations, and performance metrics.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            @click="focusClientSelect"
            class="btn-secondary"
          >
            Select Client & Analysis
          </button>
          <NuxtLink to="/dashboard/analysis" class="btn-outline inline-flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Run New Analysis
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Recent Reports Quick Access -->
    <div v-if="recentReports.length > 0 && !selectedAnalysisRunId" class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">Click to view details</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="report in recentReports"
          :key="report.id"
          @click="selectReport(report)"
          @keydown.enter="selectReport(report)"
          @keydown.space.prevent="selectReport(report)"
          tabindex="0"
          role="link"
          :aria-label="`View report for ${report.client_name} - ${formatAnalysisRunTitle(report)}`"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md dark:hover:shadow-lg cursor-pointer transition-all duration-200 group bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                {{ report.client_name }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ formatAnalysisRunTitle(report) }}
              </p>
            </div>
            <span :class="getStatusClass(report.status)" class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-3">
              {{ report.status }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ formatDate(report.created_at) }}
            </div>

            <div class="flex items-center text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="mr-1">View Report</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const clients = ref([])
const analysisRuns = ref([])
const recentReports = ref([])
const selectedClientId = ref('')
const selectedAnalysisRunId = ref('')
const loadingClients = ref(true)
const loadingAnalysisRuns = ref(false)
const attempted = ref(false)

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
    loadingClients.value = true
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('created_by', user.value.id)
      .order('name')

    if (error) throw error
    clients.value = data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loadingClients.value = false
  }
}

const fetchRecentReports = async () => {
  try {
    const { data, error } = await supabase
      .from('analysis_runs')
      .select(`
        *,
        clients!inner(name)
      `)
      .eq('created_by', user.value.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error
    
    recentReports.value = (data || []).map(report => ({
      ...report,
      client_name: report.clients.name
    }))
  } catch (error) {
    console.error('Error fetching recent reports:', error)
  }
}

const onClientChange = async () => {
  selectedAnalysisRunId.value = ''
  analysisRuns.value = []
  attempted.value = false
  
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
  attempted.value = false
}

const viewReport = () => {
  if (!selectedAnalysisRunId.value) return
  navigateTo(`/dashboard/reports/${selectedAnalysisRunId.value}`)
}

const selectReport = (report) => {
  // Navigate directly to the report page
  navigateTo(`/dashboard/reports/${report.id}`)
}

const focusClientSelect = () => {
  const select = document.querySelector('select')
  if (select) {
    select.focus()
  }
}

const getAnalysisRunPlaceholder = () => {
  if (loadingAnalysisRuns.value) return 'Loading analysis runs...'
  if (!selectedClientId.value) return 'Select a client first'
  if (analysisRuns.value.length === 0) return 'No analysis runs found'
  return 'Choose an analysis run...'
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
    'completed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'running': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'failed': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'pending': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
  return classes[status] || classes.pending
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

onMounted(async () => {
  await fetchClients()
  await fetchRecentReports()
})
</script>