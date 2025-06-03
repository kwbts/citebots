<template>
  <div class="seo-score-widget bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none transition-all duration-200 hover:shadow-md">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="showTrend && trend" class="flex items-center gap-1 text-sm" :class="getTrendColor()">
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
        <SeoScoreGauge :score="score" />
      </div>
      <p v-if="totalItems" class="text-gray-500 dark:text-gray-400">
        Based on {{ totalItems }} {{ itemsLabel }}
      </p>
    </div>

    <!-- Metric Breakdown -->
    <div v-if="metricBreakdown?.length" class="space-y-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Key Metrics</h4>
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
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ metric.label }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">
              {{ metric.score.toFixed(1) }}/10
            </span>
            <div class="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
    <div v-if="insights" class="mt-6 rounded-xl p-4 bg-gray-100/80 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600/30">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-blue-50 dark:bg-blue-500/20 border border-blue-200/50 dark:border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 class="font-medium text-gray-800 dark:text-blue-300 mb-1">Insight</h5>
          <p class="text-sm text-gray-600 dark:text-gray-200 leading-relaxed opacity-90">
            {{ insights }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SeoScoreGauge from './SeoScoreGauge.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'SEO Score'
  },
  subtitle: {
    type: String,
    default: 'Overall performance score'
  },
  score: {
    type: Number,
    required: true,
    default: 0,
    validator: (value) => value >= 0 && value <= 10
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemsLabel: {
    type: String,
    default: 'analyzed pages'
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
  showTrend: {
    type: Boolean,
    default: false
  },
  insights: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Helper functions
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

const getMetricColor = (score) => {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getMetricBgColor = (score) => {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<style scoped>
.seo-score-widget {
  position: relative;
  min-height: 350px;
  transition: transform 0.2s ease-out;
}

.seo-score-widget:hover {
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

.seo-score-widget > * {
  animation: slideIn 0.3s ease-out;
}
</style>