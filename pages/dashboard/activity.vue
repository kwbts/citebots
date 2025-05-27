<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Recent Activity</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">View your recent reports, clients, and system activity</p>
    </div>

    <!-- Activity Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card text-center">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.reportsToday }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Reports Today</div>
      </div>

      <div class="card text-center">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.clientsThisWeek }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Clients This Week</div>
      </div>

      <div class="card text-center">
        <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.queriesProcessed }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Queries Processed</div>
      </div>

      <div class="card text-center">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.avgCompletionTime }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Avg Completion</div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Reports -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
        </div>
        
        <div v-if="loadingReports" class="p-6">
          <div class="animate-pulse space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="recentReports.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-sm">No reports found</p>
        </div>

        <div v-else class="p-6 space-y-4">
          <div v-for="report in recentReports" :key="report.id" class="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="getStatusBadgeClass(report.status)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="report.status === 'completed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                <path v-else-if="report.status === 'processing'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <NuxtLink 
                  :to="`/dashboard/reports/${report.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white hover:text-citebots-orange truncate"
                >
                  {{ report.client_name || 'Unknown Client' }}
                </NuxtLink>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {{ formatTimeAgo(report.created_at) }}
                </span>
              </div>
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span class="capitalize">{{ report.platform }}</span>
                <span class="mx-2">•</span>
                <span>{{ report.queries_total || 0 }} queries</span>
                <span v-if="report.queries_completed" class="mx-2">•</span>
                <span v-if="report.queries_completed">{{ report.queries_completed }}/{{ report.queries_total }} complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Clients -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Clients</h2>
        </div>
        
        <div v-if="loadingClients" class="p-6">
          <div class="animate-pulse space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="recentClients.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <p class="text-sm">No clients found</p>
        </div>

        <div v-else class="p-6 space-y-4">
          <div v-for="client in recentClients" :key="client.id" class="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {{ getClientInitials(client.name) }}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <NuxtLink 
                  :to="`/dashboard/clients/${client.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white hover:text-citebots-orange truncate"
                >
                  {{ client.name }}
                </NuxtLink>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {{ formatTimeAgo(client.created_at) }}
                </span>
              </div>
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{{ client.domain }}</span>
                <span v-if="client.industry_primary" class="mx-2">•</span>
                <span v-if="client.industry_primary" class="truncate">{{ client.industry_primary }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Queue Status -->
    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Analysis Queue Status</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Current processing status across all platforms</p>
      </div>
      
      <div v-if="loadingQueue" class="p-6">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      <div v-else class="p-6">
        <div v-if="queueStatus.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4m4-4l-4-4M7 5l4 4M7 5l4-4"></path>
          </svg>
          <p class="text-sm">No active queue processing</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="status in queueStatus" :key="`${status.analysis_run_id}-${status.platform}`" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ status.platform }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ Math.round(status.progress_percentage || 0) }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
              <div class="bg-citebots-orange h-2 rounded-full transition-all duration-300" 
                :style="{ width: `${status.progress_percentage || 0}%` }"></div>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ status.completed_count || 0 }} / {{ status.queries_total || 0 }} completed
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const loadingReports = ref(true)
const loadingClients = ref(true)
const loadingQueue = ref(true)
const recentReports = ref([])
const recentClients = ref([])
const queueStatus = ref([])
const stats = ref({
  reportsToday: 0,
  clientsThisWeek: 0,
  queriesProcessed: 0,
  avgCompletionTime: '0m'
})

// Load recent reports
const loadRecentReports = async () => {
  try {
    loadingReports.value = true
    const { data, error } = await supabase
      .from('analysis_runs')
      .select(`
        id,
        client_id,
        platform,
        status,
        queries_total,
        queries_completed,
        created_at,
        completed_at,
        clients!inner(name)
      `)
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    
    // Flatten the client name for easier access
    recentReports.value = (data || []).map(report => ({
      ...report,
      client_name: report.clients?.name || 'Unknown Client'
    }))
  } catch (error) {
    console.error('Error loading recent reports:', error)
  } finally {
    loadingReports.value = false
  }
}

// Load recent clients
const loadRecentClients = async () => {
  try {
    loadingClients.value = true
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, domain, industry_primary, created_at')
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    recentClients.value = data || []
  } catch (error) {
    console.error('Error loading recent clients:', error)
  } finally {
    loadingClients.value = false
  }
}

// Load queue status
const loadQueueStatus = async () => {
  try {
    loadingQueue.value = true
    const { data, error } = await supabase
      .from('queue_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    queueStatus.value = data || []
  } catch (error) {
    console.error('Error loading queue status:', error)
  } finally {
    loadingQueue.value = false
  }
}

// Load activity stats
const loadStats = async () => {
  try {
    // Reports today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: reportsToday } = await supabase
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
      .gte('created_at', today.toISOString())

    // Clients this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: clientsThisWeek } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
      .gte('created_at', weekAgo.toISOString())

    // Queries processed (total completed)
    const { count: queriesProcessed } = await supabase
      .from('analysis_queries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Calculate average completion time
    const { data: completedRuns } = await supabase
      .from('analysis_runs')
      .select('created_at, completed_at')
      .eq('created_by', user.value.id)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .limit(10)

    let avgCompletionTime = '0m'
    if (completedRuns && completedRuns.length > 0) {
      const totalMinutes = completedRuns.reduce((sum, run) => {
        const start = new Date(run.created_at)
        const end = new Date(run.completed_at)
        return sum + (end - start) / (1000 * 60) // Convert to minutes
      }, 0)
      const avgMinutes = Math.round(totalMinutes / completedRuns.length)
      avgCompletionTime = avgMinutes >= 60 ? `${Math.round(avgMinutes / 60)}h` : `${avgMinutes}m`
    }

    stats.value = {
      reportsToday: reportsToday || 0,
      clientsThisWeek: clientsThisWeek || 0,
      queriesProcessed: queriesProcessed || 0,
      avgCompletionTime
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Utility functions
const getClientInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase()
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
    case 'processing':
    case 'queued':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
}

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return time.toLocaleDateString()
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadRecentReports(),
    loadRecentClients(),
    loadQueueStatus(),
    loadStats()
  ])
})
</script>