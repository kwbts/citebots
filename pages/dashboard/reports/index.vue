<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">All Reports</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">View and manage all your analysis reports</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg px-4 py-3 border border-citebots-orange/20 dark:border-citebots-orange/30">
              <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Reports</div>
              <div class="flex items-center text-sm font-semibold text-citebots-orange mt-1">
                <div class="w-2 h-2 bg-citebots-orange rounded-full mr-2"></div>
                <span class="tabular-nums">{{ filteredReports.length }}</span> reports
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex flex-col sm:flex-row gap-4 flex-1">
            <!-- Client Filter -->
            <div class="min-w-0 flex-1 sm:max-w-xs">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Client
              </label>
              <div class="relative">
                <select 
                  v-model="selectedClientFilter" 
                  class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
                >
                  <option value="">All Clients</option>
                  <option v-for="client in uniqueClients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="min-w-0 flex-1 sm:max-w-xs">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <div class="relative">
                <select 
                  v-model="selectedStatusFilter" 
                  class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Clear Filters & Actions -->
          <div class="flex gap-3">
            <button 
              v-if="selectedClientFilter || selectedStatusFilter"
              @click="clearFilters"
              class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-150 ease-out"
            >
              Clear Filters
            </button>
            
            <NuxtLink
              to="/dashboard/analysis"
              class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-3 font-medium text-sm hover:bg-citebots-orange/20 transition-all duration-150 ease-out inline-flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              New Analysis
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8">
      <div class="animate-pulse space-y-6">
        <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div class="space-y-4">
          <div class="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Reports List -->
    <div v-else-if="filteredReports.length > 0" class="space-y-4">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        @click="viewReport(report.id)"
        class="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-4 mb-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-citebots-orange transition-colors tracking-tight">
                {{ report.client_name }}
              </h3>
              <span :class="getStatusClass(report.status)" class="px-3 py-1 rounded-lg text-xs font-semibold">
                {{ report.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="font-medium">{{ report.platform?.toUpperCase() || 'N/A' }}</span>
              </div>
              
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span class="tabular-nums">{{ report.queries_total || 0 }} queries</span>
              </div>

              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ formatDate(report.created_at) }}
              </div>

              <div v-if="report.completed_at" class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Completed {{ formatDate(report.completed_at) }}
              </div>

              <div v-if="report.queries_completed" class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="tabular-nums">{{ report.queries_completed }}/{{ report.queries_total }} completed</span>
              </div>

              <div class="flex items-center text-citebots-orange opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="mr-2 font-medium">View Report</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty States -->
    <div v-else-if="!loading">
      <!-- No Reports (Filtered) -->
      <div v-if="reports.length > 0 && filteredReports.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No Reports Match Your Filters</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base">
          Try adjusting your filter criteria to see more reports.
        </p>
        <button 
          @click="clearFilters"
          class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 transition-all duration-150 ease-out"
        >
          Clear All Filters
        </button>
      </div>

      <!-- No Reports at All -->
      <div v-else class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No Reports Yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base">
          You haven't created any analysis reports yet. Run your first analysis to get started.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/dashboard/clients" 
            class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-150 ease-out inline-flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Manage Clients
          </NuxtLink>
          <NuxtLink 
            to="/dashboard/analysis" 
            class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 transition-all duration-150 ease-out inline-flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Run First Analysis
          </NuxtLink>
        </div>
      </div>
    </div>
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
const reports = ref([])
const loading = ref(true)
const selectedClientFilter = ref('')
const selectedStatusFilter = ref('')

// Computed
const uniqueClients = computed(() => {
  const clientMap = new Map()
  reports.value.forEach(report => {
    if (report.client_id && report.client_name) {
      clientMap.set(report.client_id, {
        id: report.client_id,
        name: report.client_name
      })
    }
  })
  return Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredReports = computed(() => {
  let filtered = [...reports.value]
  
  if (selectedClientFilter.value) {
    filtered = filtered.filter(report => report.client_id === selectedClientFilter.value)
  }
  
  if (selectedStatusFilter.value) {
    filtered = filtered.filter(report => report.status === selectedStatusFilter.value)
  }
  
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Methods
const fetchAllReports = async () => {
  try {
    loading.value = true

    // First, let's try fetching analysis_runs and clients separately to debug
    const { data: analysisRuns, error: runsError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })

    if (runsError) {
      console.error('Error fetching analysis runs:', runsError)
      throw runsError
    }

    console.log('Analysis runs fetched:', analysisRuns?.length || 0)

    if (!analysisRuns || analysisRuns.length === 0) {
      reports.value = []
      return
    }

    // Get unique client IDs
    const clientIds = [...new Set(analysisRuns.map(run => run.client_id).filter(Boolean))]

    console.log('Client IDs found:', clientIds.length)

    // Fetch client names
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .in('id', clientIds)

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      throw clientsError
    }

    console.log('Clients fetched:', clients?.length || 0)

    // Create client lookup map
    const clientMap = new Map()
    clients?.forEach(client => {
      clientMap.set(client.id, client.name)
    })

    // Combine the data
    reports.value = analysisRuns.map(report => ({
      ...report,
      client_name: clientMap.get(report.client_id) || 'Unknown Client'
    }))

    console.log('Final reports count:', reports.value.length)

  } catch (error) {
    console.error('Error fetching reports:', error)
    reports.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  selectedClientFilter.value = ''
  selectedStatusFilter.value = ''
}

const viewReport = (reportId) => {
  navigateTo(`/dashboard/reports/${reportId}`)
}

const getStatusClass = (status) => {
  const classes = {
    'completed': 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700/50',
    'running': 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50',
    'failed': 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700/50',
    'pending': 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600/50'
  }
  return classes[status] || classes.pending
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await fetchAllReports()
})
</script>