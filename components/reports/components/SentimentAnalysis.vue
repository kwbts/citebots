<template>
  <div class="sentiment-analysis bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-8V3a1 1 0 011-1h2a1 1 0 011 1v3M7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Sentiment Analysis</h3>
    </div>

    <!-- Average Sentiment Score -->
    <div class="text-center mb-6">
      <div class="text-4xl font-bold mb-2" :class="getSentimentColor(data.averageSentiment)">
        {{ formatSentiment(data.averageSentiment) }}
      </div>
      <p class="text-gray-600 dark:text-gray-400">Average Sentiment Score</p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Based on {{ data.totalQueries || 0 }} analyzed queries
      </p>
    </div>

    <!-- Sentiment Distribution -->
    <div class="space-y-4">
      <h4 class="font-medium text-gray-700 dark:text-gray-300">Sentiment Distribution</h4>
      <div class="space-y-3">
        <div 
          v-for="sentiment in data.distribution" 
          :key="sentiment.label"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-4 h-4 rounded-full"
              :class="getSentimentBgColor(sentiment.color)"
            ></div>
            <span class="font-medium text-gray-900 dark:text-white">{{ sentiment.label }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ sentiment.count }} ({{ formatPercentage(getPercentage(sentiment.count)) }})
            </span>
            <div class="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :class="getSentimentBgColor(sentiment.color)"
                :style="`width: ${getPercentage(sentiment.count)}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Analyzing sentiment...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      distribution: [],
      averageSentiment: 0,
      totalQueries: 0
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const totalCount = computed(() => {
  return props.data.distribution.reduce((sum, item) => sum + item.count, 0)
})

const getPercentage = (count) => {
  if (totalCount.value === 0) return 0
  return (count / totalCount.value) * 100
}

const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const formatSentiment = (value) => {
  if (!value) return '0.0'
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}

const getSentimentColor = (sentiment) => {
  if (sentiment > 0.2) return 'text-green-600 dark:text-green-400'
  if (sentiment < -0.2) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}

const getSentimentBgColor = (color) => {
  const colorMap = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  }
  return colorMap[color] || 'bg-gray-500'
}

// Function removed as insight box is no longer displayed
</script>

<style scoped>
.sentiment-analysis {
  position: relative;
  min-height: 300px;
}

.sentiment-analysis:hover {
  transform: translateY(-2px);
}
</style>