<template>
  <div class="brand-metric-card bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
          <svg v-if="type === 'mention'" class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <svg v-else-if="type === 'citation'" class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ formatMetric(value) }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ detailText }}</p>
      </div>
      <div class="w-20 h-20">
        <!-- Circle gauge -->
        <svg viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent" 
            stroke="#e5e7eb" 
            stroke-width="8" 
            class="dark:stroke-gray-700"
          ></circle>
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent" 
            :stroke="getGaugeColor(value)" 
            stroke-width="8" 
            :stroke-dasharray="`${value * 2.51} 251`" 
            stroke-dashoffset="0" 
            class="transition-all duration-1000"
          ></circle>
          <text 
            x="50" 
            y="50" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            class="text-xs font-medium fill-gray-900 dark:fill-white"
          >{{ formatMetric(value) }}</text>
        </svg>
      </div>
    </div>
    
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">Performance</span>
        <span class="text-sm font-medium" :class="getPerformanceTextColor(value)">{{ getPerformanceLabel(value) }}</span>
      </div>
      <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-2 rounded-full transition-all duration-1000" 
          :class="getGaugeColorClass(value)"
          :style="`width: ${Math.min(value, 100)}%`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  value: {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'mention',
    validator: (value) => ['mention', 'citation'].includes(value)
  }
})

const detailText = computed(() => {
  if (props.count && props.total) {
    return `${props.count} of ${props.total} ${props.type === 'mention' ? 'queries' : 'citations'}`
  }
  return ''
})

const formatMetric = (value) => {
  return `${Math.round(value)}%`
}

const getGaugeColor = (value) => {
  if (value >= 80) return '#10b981' // green-500
  if (value >= 60) return '#3b82f6' // blue-500
  if (value >= 40) return '#f59e0b' // amber-500
  if (value >= 20) return '#f97316' // orange-500
  return '#ef4444' // red-500
}

const getGaugeColorClass = (value) => {
  if (value >= 80) return 'bg-green-500'
  if (value >= 60) return 'bg-blue-500'
  if (value >= 40) return 'bg-amber-500'
  if (value >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const getPerformanceTextColor = (value) => {
  if (value >= 80) return 'text-green-600 dark:text-green-400'
  if (value >= 60) return 'text-blue-600 dark:text-blue-400'
  if (value >= 40) return 'text-amber-600 dark:text-amber-400'
  if (value >= 20) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const getPerformanceLabel = (value) => {
  if (value >= 80) return 'Excellent'
  if (value >= 60) return 'Good'
  if (value >= 40) return 'Moderate'
  if (value >= 20) return 'Needs improvement'
  return 'Poor'
}
</script>