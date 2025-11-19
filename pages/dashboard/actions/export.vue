<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Export Data</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Download analysis data in multiple formats</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Select Export Options</h2>
      
      <div class="space-y-6">
        <!-- Client Selection -->
        <div>
          <label class="form-label">Select Client</label>
          <select class="input-field">
            <option value="">Choose a client...</option>
            <option value="demo">Demo Client</option>
          </select>
        </div>

        <!-- Analysis Type -->
        <div>
          <label class="form-label">Analysis Type</label>
          <select class="input-field">
            <option value="">Choose analysis type...</option>
            <option value="all">All Analysis Data</option>
            <option value="citation">Citation Analysis</option>
            <option value="content-brief">Content Briefs</option>
            <option value="competitor">Competitor Analysis</option>
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label class="form-label">Date Range</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">From</label>
              <input type="date" class="input-field" />
            </div>
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400 block mb-1">To</label>
              <input type="date" class="input-field" />
            </div>
          </div>
        </div>

        <!-- Format Selection -->
        <div>
          <label class="form-label">Export Format</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
              <div class="flex items-center">
                <input type="radio" name="format" class="h-4 w-4 text-citebots-orange focus:ring-citebots-orange/50" checked />
                <label class="ml-3 font-medium text-gray-800 dark:text-gray-200">CSV</label>
              </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
              <div class="flex items-center">
                <input type="radio" name="format" class="h-4 w-4 text-citebots-orange focus:ring-citebots-orange/50" />
                <label class="ml-3 font-medium text-gray-800 dark:text-gray-200">JSON</label>
              </div>
            </div>

            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
              <div class="flex items-center">
                <input type="radio" name="format" class="h-4 w-4 text-citebots-orange focus:ring-citebots-orange/50" />
                <label class="ml-3 font-medium text-gray-800 dark:text-gray-200">Excel</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <div class="mt-8 flex justify-end">
        <button class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </button>
      </div>
    </div>

    <!-- Recent Exports -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Exports</h2>
      
      <div class="text-center py-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700/40 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent exports</h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your exported data files will appear here for quick access once you generate them.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

// Placeholder for future export functionality
</script>