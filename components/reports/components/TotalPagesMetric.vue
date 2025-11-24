<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Total Pages</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Pages analyzed across queries</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalPages }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ totalBrandPages }} brand pages</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  totalPages: {
    type: Number,
    required: true
  },
  totalBrandPages: {
    type: Number,
    required: true
  }
})
</script>
