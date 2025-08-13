<template>
  <div class="max-w-6xl mx-auto">
    <!-- Welcome Section -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Quick Actions</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Streamline your workflow with automated tasks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
      <!-- Content Brief Generator Card -->
      <NuxtLink to="/dashboard/actions/content-brief" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">CONTENT</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Content Brief Generator</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Create detailed content briefs powered by AI research and competitor analysis</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800/50">
              New Feature
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- View All Reports Card -->
      <NuxtLink to="/dashboard/actions/reports" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6l1.5-6H7.5L9 17zM9 17l-3-9M20 7H4m16 0a2 2 0 00-2-2H6a2 2 0 00-2 2m16 0l-1 9a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">REPORTS</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">View All Reports</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Browse, filter, and manage all your generated content briefs and reports</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/50">
              Management
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Export Card -->
      <NuxtLink to="/dashboard/actions/export" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">DATA EXPORT</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Export Results</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Download analysis data in multiple formats for further processing</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium">
              CSV, JSON, Excel
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Recent Automation History -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Actions</h2>
          <p class="text-gray-600 dark:text-gray-400 text-base mt-1">Your latest automated activities</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="text-center py-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700/40 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent activities</h3>
          <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your automated actions and batch processes will appear here once you start using these features.
          </p>
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

// Placeholder for future functionality
// When implemented, this page would track action history and display statistics
</script>