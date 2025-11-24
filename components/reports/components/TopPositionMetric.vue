<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Top Position</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Best citation rank</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">#{{ topBrandPosition }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Best brand page position</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  topBrandPosition: {
    type: [Number, String],
    required: true
  }
})
</script>
