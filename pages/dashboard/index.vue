<template>
  <div class="max-w-6xl mx-auto">
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
            <p class="text-gray-600 dark:text-gray-300">Here's your citation analysis dashboard</p>
          </div>
          <div v-if="recentReportsCount > 0" class="flex items-center space-x-3">
            <div class="text-right">
              <div class="text-sm text-gray-500 dark:text-gray-400">Last 24 hours</div>
              <div class="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {{ recentReportsCount }} reports generated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Clients Card -->
      <NuxtLink to="/dashboard/clients" class="group">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-citebots-orange/30 transition-all duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-citebots-orange/10 p-3 rounded-xl group-hover:bg-citebots-orange/20 transition-colors">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manage Clients</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">Add, edit, and manage your client accounts and competitor profiles</p>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{{ clientsCount }} active clients</span>
          </div>
        </div>
      </NuxtLink>

      <!-- Analysis Card -->
      <NuxtLink to="/dashboard/analysis" class="group">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-citebots-orange/30 transition-all duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-citebots-orange/10 p-3 rounded-xl group-hover:bg-citebots-orange/20 transition-colors">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Run Analysis</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">Execute citation analysis across LLM platforms for your clients</p>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">Ready to analyze</span>
          </div>
        </div>
      </NuxtLink>

      <!-- Reports Card -->
      <NuxtLink to="/dashboard/reports" class="group">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-citebots-orange/30 transition-all duration-200">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-citebots-orange/10 p-3 rounded-xl group-hover:bg-citebots-orange/20 transition-colors">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">View Reports</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">Access detailed analysis reports and share insights with clients</p>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span class="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-md">{{ totalReportsCount }} reports available</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <button class="text-sm text-citebots-orange hover:text-citebots-orange/80 font-medium">View all</button>
      </div>
      <div class="space-y-3">
        <!-- Last report generated -->
        <div v-if="lastReport" class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Analysis completed for {{ lastReport.client_name || 'Client' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ lastReport.queries_total }} queries analyzed on {{ lastReport.platform }}</p>
            </div>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatTimeAgo(lastReport.completed_at) }}</span>
        </div>

        <!-- Newest client -->
        <div v-if="newestClient" class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">New client added: {{ newestClient.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Client profile created</p>
            </div>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatTimeAgo(newestClient.created_at) }}</span>
        </div>

        <!-- Reports this month -->
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Reports generated this month</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ monthlyReportsCount }} analysis runs completed</p>
            </div>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ currentMonth }}</span>
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

const client = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const clientsCount = ref(0)
const totalReportsCount = ref(0)
const recentReportsCount = ref(0)
const monthlyReportsCount = ref(0)
const lastReport = ref(null)
const newestClient = ref(null)

// Computed values
const currentMonth = computed(() => {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
})

// Utility function for time formatting
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Less than an hour ago'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} days ago`
  return time.toLocaleDateString()
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    if (!user.value) return

    // Get clients count
    const { count: clientCount } = await client
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)

    clientsCount.value = clientCount || 0

    // Get total reports count
    const { count: reportCount } = await client
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)

    totalReportsCount.value = reportCount || 0

    // Get reports in last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: recentCount } = await client
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
      .gte('completed_at', yesterday.toISOString())

    recentReportsCount.value = recentCount || 0

    // Get reports this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyCount } = await client
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)
      .gte('completed_at', startOfMonth.toISOString())

    monthlyReportsCount.value = monthlyCount || 0

    // Get last completed report
    const { data: lastReportData } = await client
      .from('analysis_runs')
      .select('*')
      .eq('created_by', user.value.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)

    if (lastReportData && lastReportData.length > 0) {
      lastReport.value = lastReportData[0]
    }

    // Get newest client
    const { data: newestClientData } = await client
      .from('clients')
      .select('*')
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (newestClientData && newestClientData.length > 0) {
      newestClient.value = newestClientData[0]
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>