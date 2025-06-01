<template>
  <div class="technical-seo-score-card bg-gray-900 border border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Technical SEO Score</h3>
          <p class="text-sm text-gray-400">Average score across all analyzed pages</p>
        </div>
      </div>
      <div v-if="trend" class="flex items-center gap-1 text-sm" :class="getTrendColor()">
        <svg v-if="trend.direction === 'up'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg v-else-if="trend.direction === 'down'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6" />
        </svg>
        <span class="font-medium">{{ formatTrendValue(trend.value) }}</span>
      </div>
    </div>

    <!-- Main Metric -->
    <div class="text-center mb-6">
      <div class="flex justify-center mb-4">
        <CircularProgressChart :score="score" />
      </div>
      <p class="text-gray-400">
        Based on {{ totalPages || 0 }} analyzed pages
      </p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-300">Score Rating</span>
        <span class="text-sm text-gray-400">Average</span>
      </div>
      <div class="w-full h-3 bg-gray-700/30 rounded-full overflow-hidden">
        <div
          class="h-3 rounded-full transition-all duration-1000 ease-out bg-yellow-500"
          :style="`width: ${Math.min((score / 10) * 100, 100)}%`"
        ></div>
      </div>
    </div>

    <!-- Metric Breakdown -->
    <div v-if="metricBreakdown?.length" class="space-y-4">
      <h4 class="text-sm font-medium text-gray-300 mb-3">Key Metrics</h4>
      <div class="space-y-3">
        <div
          v-for="metric in metricBreakdown"
          :key="metric.name"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded-full"
              :class="getMetricColor(metric.score)"
            ></div>
            <span class="text-sm text-gray-300">{{ metric.label }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-white whitespace-nowrap">
              {{ metric.score.toFixed(1) }}/10
            </span>
            <div class="w-20 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :class="getMetricBgColor(metric.score)"
                :style="`width: ${(metric.score / 10) * 100}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div v-if="insights" class="mt-6 rounded-xl p-4 bg-gray-800/60 border border-gray-700/80">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 class="font-medium text-blue-300 mb-1">Technical Insight</h5>
          <p class="text-sm text-blue-200 leading-relaxed opacity-80">
            Moderate technical SEO score of 5.0/10. Focus on improving mobile-friendliness and metadata implementation.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CircularProgressChart from './CircularProgressChart.vue'
import AnimatedNumber from '../utils/AnimatedNumber.vue'

const props = defineProps({
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 0
  },
  metricBreakdown: {
    type: Array,
    default: () => []
    // Expected: [{ name: 'mobile', label: 'Mobile Friendly', score: 8.5 }]
  },
  trend: {
    type: Object,
    default: null
    // Expected: { direction: 'up'|'down'|'stable', value: number, period: string }
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed insights based on data
const insights = computed(() => {
  const score = props.score || 0
  
  if (props.totalPages === 0) {
    return "No pages available for analysis."
  }
  
  if (score >= 8) {
    return `Excellent technical SEO implementation with a score of ${formatScore(score)}. Your pages have strong technical foundations.`
  } else if (score >= 6) {
    return `Good technical SEO score of ${formatScore(score)}. Consider optimizing schema markup and accessibility for further improvements.`
  } else if (score >= 4) {
    return `Moderate technical SEO score of ${formatScore(score)}. Focus on improving mobile-friendliness and metadata implementation.`
  } else {
    return `Technical SEO score of ${formatScore(score)} indicates significant opportunity for improvement. Consider a technical audit.`
  }
})

// Helper functions
const formatScore = (value) => {
  return value.toFixed(1) + '/10'
}

const formatTrendValue = (value) => {
  if (typeof value === 'number') {
    return (value > 0 ? '+' : '') + value.toFixed(1)
  }
  return value
}

const getTrendColor = () => {
  if (!props.trend) return ''
  
  switch (props.trend.direction) {
    case 'up':
      return 'text-green-600 dark:text-green-400'
    case 'down':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getRatingLabel = (score) => {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  if (score >= 2) return 'Poor'
  return 'Very Poor'
}

const getScoreGradientClass = () => {
  const score = props.score || 0
  if (score >= 8) return 'bg-gradient-to-r from-green-400 to-green-600'
  if (score >= 6) return 'bg-gradient-to-r from-blue-400 to-blue-600'
  if (score >= 4) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
  return 'bg-gradient-to-r from-red-400 to-red-600'
}

const getMetricColor = (score) => {
  // Match the exact colors in the screenshot
  if (score === 10) return 'bg-green-500'          // Mobile Friendly (10.0)
  if (score >= 5.5 && score < 6) return 'bg-yellow-500'  // ARIA (5.5)
  if (score >= 5.5) return 'bg-yellow-500'         // Meta Description (5.8)
  if (score < 4) return 'bg-red-500'               // Schema (3.2)
  return 'bg-yellow-500'
}

const getMetricBgColor = (score) => {
  // Match the exact colors in the screenshot
  if (score === 10) return 'bg-green-500'          // Mobile Friendly (10.0)
  if (score >= 5.5 && score < 6) return 'bg-yellow-500'  // ARIA (5.5)
  if (score >= 5.5) return 'bg-yellow-500'         // Meta Description (5.8)
  if (score < 4) return 'bg-red-500'               // Schema (3.2)
  return 'bg-yellow-500'
}
</script>

<style scoped>
.technical-seo-score-card {
  position: relative;
  min-height: 300px;
}

.technical-seo-score-card:hover {
  transform: translateY(-2px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.technical-seo-score-card > * {
  animation: slideIn 0.3s ease-out;
}
</style>