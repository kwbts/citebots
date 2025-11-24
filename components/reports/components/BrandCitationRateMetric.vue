<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Citation Rate</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Brand citation frequency</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ brandCitationRate }}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Of total citations</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  brandCitationRate: {
    type: Number,
    required: true
  }
})
</script>
