<template>
  <div class="bg-gray-800 border-r border-gray-700/60 flex flex-col h-full" style="width: 288px; min-width: 288px; max-width: 288px; flex-shrink: 0;">
    <!-- Section Header -->
    <div class="h-16 flex items-center px-6 border-b border-gray-700/60 flex-shrink-0">
      <h2 class="text-lg font-bold text-white tracking-tight">{{ sectionTitle }}</h2>
    </div>

    <!-- Navigation Content -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <!-- Dashboard Section -->
      <template v-if="activeSection === 'dashboard'">
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">OVERVIEW</h3>
          <NuxtLink to="/dashboard" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Home
          </NuxtLink>
        </div>

        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">QUICK ACTIONS</h3>
          <NuxtLink to="/dashboard/clients" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/clients' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Clients
          </NuxtLink>
          <NuxtLink to="/dashboard/reports" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/reports' || $route.path.startsWith('/dashboard/analysis') }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports & Analysis
          </NuxtLink>
          <NuxtLink to="/dashboard/activity" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/activity' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Activity
          </NuxtLink>
        </div>
      </template>

      <!-- Clients Section -->
      <template v-if="activeSection === 'clients'">
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">CLIENT MANAGEMENT</h3>
          <NuxtLink to="/dashboard/clients" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/clients' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Overview
          </NuxtLink>
          <NuxtLink to="/dashboard/clients/manage" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/clients/manage' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Manage
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
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ANALYSIS</h3>
          <NuxtLink to="/dashboard/analysis" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/analysis' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="" />
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

      <!-- Admin Section -->
      <template v-if="activeSection === 'admin'">
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ADMINISTRATION</h3>
          <NuxtLink to="/dashboard/admin/profile" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/admin/profile' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NuxtLink>
          <NuxtLink to="/dashboard/admin/access-requests" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/admin/access-requests' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Access Requests
          </NuxtLink>
        </div>
      </template>

      <!-- Reports Section -->
      <template v-if="activeSection === 'reports'">
        <!-- Report Dashboard Navigation (when viewing a specific report) -->
        <template v-if="$route.path.startsWith('/dashboard/reports/') && $route.path !== '/dashboard/reports'">
          <!-- Dashboard Tabs -->
          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">DASHBOARD</h3>
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

              <NuxtLink to="/dashboard/reports" class="nav-item w-full" :class="{ 'nav-item-active': $route.path === '/dashboard/reports' }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                All Reports
              </NuxtLink>
            </div>
          </div>
        </template>

        <!-- Navigation Links (when NOT viewing a specific report) -->
        <template v-else>
          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ANALYSIS</h3>
            <NuxtLink to="/dashboard/analysis" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/analysis' }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="" />
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

          <div class="mb-6">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">REPORTS</h3>
            <NuxtLink to="/dashboard/reports" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard/reports' }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              All Reports
            </NuxtLink>
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

const sectionTitle = computed(() => {
  switch (props.activeSection) {
    case 'dashboard': return 'Dashboard'
    case 'clients': return 'Clients'
    case 'analysis': return 'Reports & Analysis'
    case 'reports': return 'Reports & Analysis'
    case 'admin': return 'Admin'
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
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-150 ease-out border border-transparent focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-800 whitespace-nowrap overflow-hidden text-ellipsis;
  width: 100%;
  max-width: 256px;
}

.nav-item svg {
  @apply mr-3 w-4 h-4;
  stroke-width: 2;
}

.nav-item-active {
  @apply bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30;
}

.nav-item-active:hover {
  @apply bg-citebots-orange/20;
}
</style>