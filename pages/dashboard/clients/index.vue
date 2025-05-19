<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Client Management</h1>
      <p class="page-subtitle">Create, manage, and analyze your client profiles</p>
    </div>

    <!-- Main Grid -->
    <div class="grid-dashboard">
      <!-- Provision New Client -->
      <div
        @click="navigateTo('/dashboard/clients/provision')"
        class="card group cursor-pointer"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="bg-citebots-orange/10 p-3 rounded-lg group-hover:bg-citebots-orange/20 transition-colors">
            <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <svg class="w-5 h-5 text-citebots-gray-400 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Add New Client</h3>
        <p class="text-citebots-gray-600">Create a new client profile with brand and competitor information</p>
      </div>

      <!-- Manage Existing Clients -->
      <div
        @click="navigateTo('/dashboard/clients/manage')"
        class="card group cursor-pointer"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="bg-citebots-orange/10 p-3 rounded-lg group-hover:bg-citebots-orange/20 transition-colors">
            <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </div>
          <svg class="w-5 h-5 text-citebots-gray-400 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Manage Clients</h3>
        <p class="text-citebots-gray-600">View and edit existing client profiles</p>
      </div>

      <!-- View Analysis -->
      <div
        @click="navigateTo('/dashboard/analysis')"
        class="card group cursor-pointer"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="bg-citebots-orange/10 p-3 rounded-lg group-hover:bg-citebots-orange/20 transition-colors">
            <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <svg class="w-5 h-5 text-citebots-gray-400 group-hover:text-citebots-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Run Analysis</h3>
        <p class="text-citebots-gray-600">Execute citation analysis for your clients</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})
</script>