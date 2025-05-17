<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Client Management</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Provision New Client -->
      <div 
        @click="navigateTo('/dashboard/clients/provision')"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center mb-4">
          <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900">Provision New Client</h2>
        </div>
        <p class="text-gray-600">Add a new client with their brand and competitor information</p>
      </div>

      <!-- Manage Existing Clients -->
      <div 
        @click="navigateTo('/dashboard/clients/manage')"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center mb-4">
          <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900">Manage Clients</h2>
        </div>
        <p class="text-gray-600">View and manage existing client profiles</p>
      </div>

      <!-- Run Analysis -->
      <div 
        @click="navigateTo('/dashboard/clients/analysis')"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center mb-4">
          <svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900">Run Analysis</h2>
        </div>
        <p class="text-gray-600">Execute citation analysis for your clients</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'

definePageMeta({
  middleware: 'auth'
})
</script>