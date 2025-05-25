<template>
  <div class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
    <!-- Section Header -->
    <div class="h-16 flex items-center px-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-white">{{ sectionTitle }}</h2>
    </div>

    <!-- Navigation Content -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <!-- Dashboard Section -->
      <template v-if="activeSection === 'dashboard'">
        <div class="mb-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">OVERVIEW</h3>
          <NuxtLink to="/dashboard" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Home
          </NuxtLink>
          <NuxtLink to="/dashboard/user" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/user' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NuxtLink>
        </div>
      </template>

      <!-- Clients Section -->
      <template v-if="activeSection === 'clients'">
        <div class="mb-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MANAGE</h3>
          <NuxtLink to="/dashboard/clients" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/clients' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Clients
          </NuxtLink>
          <NuxtLink to="/dashboard/clients/provision" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/clients/provision' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Client
          </NuxtLink>
        </div>
      </template>

      <!-- Analysis Section -->
      <template v-if="activeSection === 'analysis'">
        <div class="mb-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ANALYSIS</h3>
          <NuxtLink to="/dashboard/analysis" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/analysis' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Analysis
          </NuxtLink>
          <NuxtLink to="/dashboard/analysis/preview-queries" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/analysis/preview-queries' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Queries
          </NuxtLink>
        </div>
      </template>

      <!-- Reports Section -->
      <template v-if="activeSection === 'reports'">
        <!-- Navigation Links -->
        <div class="mb-4">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">REPORTS</h3>
          <NuxtLink to="/dashboard/reports" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/reports' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All Reports
          </NuxtLink>
        </div>

        <!-- Report Dashboard Navigation (when viewing a specific report) -->
        <template v-if="$route.path.startsWith('/dashboard/reports/') && $route.path !== '/dashboard/reports'">
          <!-- Platform Filters -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">PLATFORM FILTER</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="platform in platforms"
                :key="platform.value"
                @click="togglePlatform(platform.value)"
                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="activePlatforms.includes(platform.value)
                  ? 'bg-citebots-orange text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              >
                {{ platform.label }}
              </button>
            </div>
          </div>

          <!-- Dashboard Tabs -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">DASHBOARD</h3>
            <div class="space-y-1">
              <button
                @click="setActiveTab('overview')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'overview' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Overview
              </button>

              <button
                @click="setActiveTab('brand-performance')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'brand-performance' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Brand Performance
              </button>

              <button
                @click="setActiveTab('query-analysis')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'query-analysis' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Query Analysis
              </button>

              <button
                @click="setActiveTab('technical-seo')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'technical-seo' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Technical SEO
              </button>

              <button
                @click="setActiveTab('page-analytics')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'page-analytics' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Page Analytics
              </button>

              <button
                @click="setActiveTab('competitors')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'competitors' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Competitors
              </button>

              <button
                @click="setActiveTab('raw-data')"
                class="nav-item w-full"
                :class="{ 'nav-item-active': activeTab === 'raw-data' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Raw Data
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2">
            <button
              @click="exportReport"
              class="w-full flex items-center justify-center px-4 py-2 bg-citebots-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
            <button
              @click="refreshData"
              class="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </template>
      </template>
    </nav>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  activeSection: {
    type: String,
    default: 'dashboard'
  }
})

const route = useRoute()

// Dashboard navigation state (for reports pages)
const activeTab = ref('overview')
const activePlatforms = ref(['all', 'chatgpt', 'perplexity'])

// Platform filter options
const platforms = [
  { label: 'All', value: 'all' },
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Perplexity', value: 'perplexity' }
]

const sectionTitle = computed(() => {
  switch (props.activeSection) {
    case 'dashboard': return 'Dashboard'
    case 'clients': return 'Clients'
    case 'analysis': return 'Analysis'
    case 'reports': return 'Reports'
    default: return 'Dashboard'
  }
})

// Dashboard tab navigation
const setActiveTab = (tab) => {
  activeTab.value = tab
  // Emit event to parent components (will be handled by the reports page)
  const event = new CustomEvent('dashboard-tab-changed', {
    detail: { tab }
  })
  window.dispatchEvent(event)
}

// Platform filter toggle
const togglePlatform = (platform) => {
  if (platform === 'all') {
    if (activePlatforms.value.includes('all')) {
      activePlatforms.value = []
    } else {
      activePlatforms.value = ['all', 'chatgpt', 'perplexity']
    }
  } else {
    if (activePlatforms.value.includes(platform)) {
      activePlatforms.value = activePlatforms.value.filter(p => p !== platform && p !== 'all')
    } else {
      activePlatforms.value.push(platform)
      if (activePlatforms.value.includes('chatgpt') && activePlatforms.value.includes('perplexity')) {
        activePlatforms.value.push('all')
      }
    }
  }

  // Emit event for platform filter changes
  const event = new CustomEvent('platform-filter-changed', {
    detail: { platforms: activePlatforms.value }
  })
  window.dispatchEvent(event)
}

// Action handlers
const exportReport = () => {
  const event = new CustomEvent('export-report')
  window.dispatchEvent(event)
}

const refreshData = () => {
  const event = new CustomEvent('refresh-data')
  window.dispatchEvent(event)
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors;
}

.nav-item svg {
  @apply mr-3;
}

.nav-item-active {
  @apply bg-citebots-orange text-white;
}

.nav-item-active:hover {
  @apply bg-citebots-orange/90;
}
</style>