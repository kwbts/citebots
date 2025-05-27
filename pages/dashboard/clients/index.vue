<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Client Management</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Create, manage, and analyze your client profiles</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Provision New Client -->
      <div 
        @click="navigateTo('/dashboard/clients/provision')"
        class="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
        tabindex="0"
        @keydown.enter="navigateTo('/dashboard/clients/provision')"
        @keydown.space.prevent="navigateTo('/dashboard/clients/provision')"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">CREATE</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Add New Client</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Create a new client profile with brand and competitor information</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800/50">
              Start setup
            </span>
          </div>
        </div>
      </div>

      <!-- Manage Existing Clients -->
      <div 
        @click="navigateTo('/dashboard/clients/manage')"
        class="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
        tabindex="0"
        @keydown.enter="navigateTo('/dashboard/clients/manage')"
        @keydown.space.prevent="navigateTo('/dashboard/clients/manage')"
      >
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
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">MANAGE</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Manage Clients</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">View, edit, and update existing client profiles and competitor data</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium">
              <span class="tabular-nums font-semibold">{{ clientsCount }}</span> clients to manage
            </span>
          </div>
        </div>
      </div>

      <!-- Run Analysis -->
      <div 
        @click="navigateTo('/dashboard/analysis')"
        class="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
        tabindex="0"
        @keydown.enter="navigateTo('/dashboard/analysis')"
        @keydown.space.prevent="navigateTo('/dashboard/analysis')"
      >
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
            <span class="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/50">
              Ready to analyze
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Clients -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Clients</h2>
          <p class="text-gray-600 dark:text-gray-400 text-base mt-1">Your latest client profiles</p>
        </div>
        <button
          @click="navigateTo('/dashboard/clients/manage')"
          class="text-sm text-citebots-orange hover:text-citebots-orange/80 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-lg px-2 py-1"
        >
          View all →
        </button>
      </div>

      <div v-if="recentClients.length > 0" class="space-y-6">
        <!-- Recent client items -->
        <div 
          v-for="client in recentClients" 
          :key="client.id"
          class="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
        >
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white mb-1">{{ client.name }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ client.industry || 'No industry specified' }} • {{ client.description || 'No description' }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-2 py-1 rounded-lg">
              {{ formatTimeAgo(client.created_at) }}
            </span>
            <button
              @click="navigateTo(`/dashboard/clients/${client.id}`)"
              class="text-citebots-orange hover:text-citebots-orange/80 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-citebots-orange/50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clients yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first client profile</p>
        <button
          @click="navigateTo('/dashboard/clients/provision')"
          class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2"
        >
          Add Your First Client
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from '#app'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const clientsCount = ref(0)
const recentClients = ref([])

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

// Fetch clients data
const fetchClientsData = async () => {
  try {
    if (!user.value) return

    // Get clients count
    const { count: clientCount } = await client
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.value.id)

    clientsCount.value = clientCount || 0

    // Get recent clients
    const { data: clientsData } = await client
      .from('clients')
      .select('*')
      .eq('created_by', user.value.id)
      .order('created_at', { ascending: false })
      .limit(5)

    recentClients.value = clientsData || []

  } catch (error) {
    console.error('Error fetching clients data:', error)
  }
}

onMounted(() => {
  fetchClientsData()
})
</script>