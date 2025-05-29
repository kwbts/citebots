<template>
  <div class="brand-mention-rate-card bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Mention Rate</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Queries where your brand is mentioned</p>
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
      <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        <AnimatedNumber 
          :value="data.mentionRate || 0" 
          :format-fn="formatPercentage" 
          :loading="loading"
        />
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        {{ data.mentionedQueries || 0 }} of {{ data.totalQueries || 0 }} queries
      </p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Mention Progress</span>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatPercentage(data.mentionRate || 0) }}</span>
      </div>
      <div class="w-full h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
        <div
          class="h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out"
          :style="`width: ${Math.min(data.mentionRate || 0, 100)}%`"
        ></div>
      </div>
    </div>

    <!-- Platform Breakdown -->
    <div v-if="platformBreakdown?.length" class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Platform</h4>
      <div class="space-y-2">
        <div 
          v-for="platform in platformBreakdown" 
          :key="platform.name"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="getPlatformColor(platform.name)"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ platform.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatPercentage(platform.mentionRate) }}
            </span>
            <div class="w-12 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :class="getPlatformBgColor(platform.name)"
                :style="`width: ${platform.mentionRate}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div v-if="insights" class="mt-6 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-orange-100 dark:bg-orange-500/20 border border-orange-200/50 dark:border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 class="font-medium text-orange-800 dark:text-orange-300 mb-1">Performance Insight</h5>
          <p class="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
            {{ insights }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AnimatedNumber from '../utils/AnimatedNumber.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      mentionRate: 0,
      mentionedQueries: 0,
      totalQueries: 0
    })
  },
  trend: {
    type: Object,
    default: null
    // Expected: { direction: 'up'|'down'|'stable', value: number, period: string }
  },
  platformBreakdown: {
    type: Array,
    default: () => []
    // Expected: [{ name: 'chatgpt', label: 'ChatGPT', mentionRate: 75.5 }]
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed insights based on data
const insights = computed(() => {
  const rate = props.data.mentionRate || 0
  const total = props.data.totalQueries || 0
  
  if (total === 0) {
    return "No queries available for analysis."
  }
  
  if (rate >= 80) {
    return `Excellent brand visibility! Your brand is mentioned in ${formatPercentage(rate)} of queries, indicating strong market presence.`
  } else if (rate >= 60) {
    return `Good brand performance with ${formatPercentage(rate)} mention rate. Consider content optimization to reach the next level.`
  } else if (rate >= 40) {
    return `Moderate brand visibility at ${formatPercentage(rate)}. There's significant opportunity for content strategy improvements.`
  } else if (rate >= 20) {
    return `Lower mention rate of ${formatPercentage(rate)} suggests room for SEO and content marketing optimization.`
  } else {
    return `Brand mention rate of ${formatPercentage(rate)} indicates opportunity to improve content relevance and authority.`
  }
})

// Helper functions
const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const formatTrendValue = (value) => {
  if (typeof value === 'number') {
    return formatPercentage(Math.abs(value))
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

const getPlatformColor = (platform) => {
  const colors = {
    chatgpt: 'bg-green-500',
    claude: 'bg-orange-500',
    perplexity: 'bg-blue-500',
    bard: 'bg-purple-500',
    gemini: 'bg-red-500'
  }
  return colors[platform.toLowerCase()] || 'bg-gray-500'
}

const getPlatformBgColor = (platform) => {
  const colors = {
    chatgpt: 'bg-green-400',
    claude: 'bg-orange-400',
    perplexity: 'bg-blue-400',
    bard: 'bg-purple-400',
    gemini: 'bg-red-400'
  }
  return colors[platform.toLowerCase()] || 'bg-gray-400'
}
</script>

<style scoped>
.brand-mention-rate-card {
  position: relative;
  min-height: 300px;
}

.brand-mention-rate-card:hover {
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

.brand-mention-rate-card > * {
  animation: slideIn 0.3s ease-out;
}
</style>