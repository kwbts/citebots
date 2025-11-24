<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Content Quality Distribution</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Word count, readability, and content structure analysis</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Word Count Distribution -->
        <div>
          <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Word Count Distribution</h4>
          <div class="space-y-3">
            <div v-for="range in wordCountDistribution" :key="range.range" class="flex items-center">
              <div class="w-20 text-sm text-gray-600 dark:text-gray-400">{{ range.range }}</div>
              <div class="flex-1 mx-3">
                <div class="bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div class="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${range.percentage}%` }"></div>
                </div>
              </div>
              <div class="w-12 text-sm font-semibold text-gray-900 dark:text-white text-right">{{ range.count }}</div>
            </div>
          </div>
        </div>

        <!-- Content Structure Elements -->
        <div>
          <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Content Structure Elements</h4>
          <div class="space-y-3">
            <div v-for="element in contentStructure" :key="element.element" class="flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ element.element }}</div>
              <div class="flex items-center space-x-3">
                <div class="flex flex-col items-end">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ element.percentage }}%</div>
                  <div class="text-xs" :class="getComparisonIndicator(element.percentage, element.avgPercentage).color">
                    {{ getComparisonIndicator(element.percentage, element.avgPercentage).icon }} {{ element.avgPercentage }}%
                  </div>
                </div>
                <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div class="h-2.5 rounded-full transition-all duration-500"
                       :class="element.percentage >= element.avgPercentage ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'"
                       :style="{ width: `${element.percentage}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  wordCountDistribution: {
    type: Array,
    required: true
  },
  contentStructure: {
    type: Array,
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
