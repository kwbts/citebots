<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Mentions</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Queries featuring your brand</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ brandMentionCount }}<span class="text-base font-normal text-gray-500 dark:text-gray-400"> / {{ totalQueries }}</span></p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ brandMentionRate }}% of queries</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  brandMentionCount: {
    type: Number,
    required: true
  },
  brandMentionRate: {
    type: Number,
    required: true
  },
  totalQueries: {
    type: Number,
    required: true
  }
})
</script>
