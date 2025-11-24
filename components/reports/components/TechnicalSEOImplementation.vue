<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Technical SEO Implementation</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Analysis of technical SEO elements across your pages</p>
      </div>
    </div>

    <!-- Crawl Error Warning -->
    <div v-if="crawlErrorCount > 0" class="mb-6 p-4 bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl">
      <p class="text-sm text-yellow-800 dark:text-yellow-200">
        ⚠️ {{ crawlErrorCount }} of {{ totalBrandPages }} pages had crawl errors. Technical SEO analysis is limited for these pages, but basic metrics like HTTPS are still available.
      </p>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="metric in metrics" :key="metric.label" class="text-center">
          <div class="relative inline-flex items-center justify-center w-20 h-20 mb-3">
            <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none" class="text-gray-200 dark:text-gray-600"/>
              <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"
                      :class="metric.percentage >= 80 ? 'text-green-500 dark:text-green-400' : metric.percentage >= 60 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'"
                      :stroke-dasharray="`${metric.percentage * 2.51327} 251.327`"
                      stroke-linecap="round"/>
            </svg>
            <span class="absolute text-base font-bold text-gray-900 dark:text-white">{{ metric.percentage }}%</span>
          </div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">{{ metric.label }}</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ metric.count }}/{{ metric.totalBrandPages }} brand pages</p>
          <div class="text-xs" :class="getComparisonIndicator(metric.percentage, metric.avgPercentage).color">
            {{ getComparisonIndicator(metric.percentage, metric.avgPercentage).icon }} others: {{ metric.avgPercentage }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  metrics: {
    type: Array,
    required: true
  },
  totalBrandPages: {
    type: Number,
    default: 0
  },
  crawlErrorCount: {
    type: Number,
    default: 0
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
