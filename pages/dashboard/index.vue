<template>
  <div class="max-w-6xl mx-auto">
    <!-- Welcome Section -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Welcome back!</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Here's your citation analysis dashboard</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Clients Card -->
      <NuxtLink to="/dashboard/clients" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">CLIENTS</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Manage Clients</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Add, edit, and manage your client accounts and competitor profiles</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium">
              <span class="tabular-nums font-semibold">{{ clientsCount }}</span> active clients
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Analysis Card -->
      <NuxtLink to="/dashboard/analysis" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">ANALYSIS</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Run Analysis</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Execute citation analysis across LLM platforms for your clients</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800/50">
              Ready to analyze
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Reports Card -->
      <NuxtLink to="/dashboard/reports" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">REPORTS</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">View Reports</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Access detailed analysis reports and share insights with clients</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium">
              <span class="tabular-nums font-semibold">{{ totalReportsCount }}</span> reports available
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Activity</h2>
          <p class="text-gray-600 dark:text-gray-400 text-base mt-1">Your latest platform activity</p>
        </div>
        <NuxtLink to="/dashboard/activity" class="text-sm text-citebots-orange hover:text-citebots-orange/80 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg px-2 py-1">
          View all →
        </NuxtLink>
      </div>

      <div class="space-y-6">
        <!-- Last report generated -->
        <div v-if="lastReport" class="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700/50">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14l4-4c-2-1.5-3.5-.5-4.5 1.5" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white mb-1">Analysis completed for {{ lastReport.client_name || 'Client' }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="tabular-nums">{{ lastReport.queries_total }}</span> queries analyzed on {{ lastReport.platform }}
              </p>
            </div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-2 py-1 rounded-lg">{{ formatTimeAgo(lastReport.completed_at) }}</span>
        </div>

        <!-- Newest client -->
        <div v-if="newestClient" class="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700/50">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white mb-1">New client added: {{ newestClient.name }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Client profile created</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-2 py-1 rounded-lg">{{ formatTimeAgo(newestClient.created_at) }}</span>
        </div>

        <!-- Reports this month -->
        <div class="flex items-start justify-between py-4">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white mb-1">Reports generated this month</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="tabular-nums">{{ monthlyReportsCount }}</span> analysis runs completed
              </p>
            </div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-2 py-1 rounded-lg">{{ currentMonth }}</span>
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

// Check user role and redirect if client
const checkUserRole = async () => {
  try {
    if (!user.value) return

    const { data: profile } = await client
      .from('profiles')
      .select('role, account_type')
      .eq('id', user.value.id)
      .single()

    // If user is client role, redirect to reports page
    if (profile && (profile.role === 'client' || profile.account_type === 'client')) {
      // Client user detected, redirecting to reports page
      await navigateTo('/dashboard/reports')
      return
    }
  } catch (error) {
    // Error handling for user role check
  }
}

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
    // Error handling for dashboard data fetch
  }
}

onMounted(async () => {
  await checkUserRole()
  fetchDashboardData()
})
</script>