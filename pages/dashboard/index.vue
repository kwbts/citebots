<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welcome back! Here's what you can do today.</p>
    </div>

    <!-- Main Grid -->
    <div class="grid-dashboard section-spacing">
      <!-- Clients Card -->
      <NuxtLink to="/dashboard/clients" class="card group">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-citebots-orange/10 p-3 rounded-lg group-hover:bg-citebots-orange/20 transition-colors">
            <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <svg class="w-5 h-5 text-citebots-gray-400 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Clients</h3>
        <p class="text-citebots-gray-600">Manage your client accounts and profiles</p>
      </NuxtLink>

      <!-- Analysis Card -->
      <NuxtLink to="/dashboard/analysis" class="card group">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-citebots-orange/10 p-3 rounded-lg group-hover:bg-citebots-orange/20 transition-colors">
            <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <svg class="w-5 h-5 text-citebots-gray-400 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Analysis</h3>
        <p class="text-citebots-gray-600">Run citation analysis on LLM responses</p>
      </NuxtLink>

      <!-- Reports Card -->
      <NuxtLink to="/dashboard/reports" class="card group opacity-75">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-gray-100 p-3 rounded-lg">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm text-gray-400">Coming Soon</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Reports</h3>
        <p class="text-citebots-gray-600">View and share analysis reports</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>