<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Avg Quality Score</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Brand page quality</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ avgBrandQuality }}%</p>
        <div class="flex items-center gap-2 text-xs mt-1" :class="getComparisonIndicator(avgBrandQuality, avgCompetitorQuality).color">
          <span>{{ getComparisonIndicator(avgBrandQuality, avgCompetitorQuality).icon }}</span>
          <span>competitors: {{ avgCompetitorQuality }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  avgBrandQuality: {
    type: Number,
    required: true
  },
  avgCompetitorQuality: {
    type: Number,
    required: true
  }
})

const getComparisonIndicator = (current, average) => {
  if (current > average) {
    return {
      color: 'text-green-600 dark:text-green-400',
      icon: '↗️'
    }
  } else if (current < average) {
    return {
      color: 'text-red-600 dark:text-red-400',
      icon: '↘️'
    }
  } else {
    return {
      color: 'text-gray-600 dark:text-gray-400',
      icon: '→'
    }
  }
}
</script>
