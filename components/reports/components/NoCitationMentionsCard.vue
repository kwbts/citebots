<template>
  <div class="no-citation-mentions-card bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">No Citation Mentions</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Brand mentioned without links</p>
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

    <!-- Main Metrics -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- Count -->
      <div class="text-center">
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          <AnimatedNumber 
            :value="data.count || 0" 
            :loading="loading"
          />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Queries</p>
      </div>
      
      <!-- Percentage -->
      <div class="text-center">
        <div class="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
          <AnimatedNumber 
            :value="data.percentage || 0" 
            :format-fn="formatPercentage" 
            :loading="loading"
          />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Of mentions</p>
      </div>
    </div>

    <!-- Progress Visualization -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Citation Gap</span>
        <span class="text-sm text-red-600 dark:text-red-400 font-medium">{{ formatPercentage(data.percentage || 0) }}</span>
      </div>
      <div class="w-full h-3 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
        <!-- Green portion for citations -->
        <div class="relative h-full">
          <div
            class="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
            :style="`width: ${Math.max(0, 100 - (data.percentage || 0))}%`"
          ></div>
          <!-- Red portion for no citations -->
          <div
            class="absolute top-0 right-0 h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
            :style="`width: ${Math.min(data.percentage || 0, 100)}%`"
          ></div>
        </div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>With citations</span>
        <span>Without citations</span>
      </div>
    </div>

    <!-- Opportunity Breakdown -->
    <div v-if="opportunityData?.length" class="space-y-3 mb-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Opportunity by Type</h4>
      <div class="space-y-2">
        <div 
          v-for="opportunity in opportunityData" 
          :key="opportunity.type"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-400 rounded-full"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ opportunity.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ opportunity.count }}
            </span>
            <div class="w-12 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-2 bg-red-400 rounded-full transition-all duration-700"
                :style="`width: ${(opportunity.count / (data.count || 1)) * 100}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Items -->
    <div class="bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-red-100 dark:bg-red-500/20 border border-red-200/50 dark:border-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 class="font-medium text-red-800 dark:text-red-300 mb-2">Content Opportunities</h5>
          <div class="space-y-1">
            <p class="text-sm text-red-700 dark:text-red-400">
              {{ getMainOpportunity() }}
            </p>
            <div v-if="getActionItems().length" class="mt-2">
              <ul class="text-xs text-red-600 dark:text-red-400 space-y-1">
                <li v-for="action in getActionItems()" :key="action" class="flex items-start gap-1">
                  <span class="text-red-400 mt-0.5">•</span>
                  <span>{{ action }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
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
      count: 0,
      percentage: 0,
      totalMentions: 0
    })
  },
  trend: {
    type: Object,
    default: null
    // Expected: { direction: 'up'|'down'|'stable', value: number, period: string }
  },
  opportunityData: {
    type: Array,
    default: () => []
    // Expected: [{ type: 'informational', label: 'Informational Queries', count: 5 }]
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed main opportunity message
const getMainOpportunity = () => {
  const count = props.data.count || 0
  const percentage = props.data.percentage || 0
  
  if (count === 0) {
    return "Great! All brand mentions have proper citations."
  }
  
  if (percentage >= 80) {
    return `Critical: ${percentage}% of brand mentions lack citations. This represents significant missed traffic and authority opportunities.`
  } else if (percentage >= 60) {
    return `High opportunity: ${count} queries mention your brand without citations. Focus on creating linkable content for these topics.`
  } else if (percentage >= 40) {
    return `Moderate opportunity: ${count} uncited mentions provide content creation opportunities to capture this traffic.`
  } else if (percentage >= 20) {
    return `Good performance with only ${percentage}% uncited mentions. Consider optimizing content for these remaining opportunities.`
  } else {
    return `Excellent citation rate! Only ${count} mentions lack citations, indicating strong content authority.`
  }
}

// Computed action items based on data
const getActionItems = () => {
  const count = props.data.count || 0
  const percentage = props.data.percentage || 0
  
  if (count === 0) return []
  
  const actions = []
  
  if (percentage >= 50) {
    actions.push("Create comprehensive content hubs for your key topics")
    actions.push("Develop authoritative resources that LLMs can cite")
    actions.push("Optimize existing content for better discoverability")
  }
  
  if (count >= 10) {
    actions.push("Analyze query patterns to identify content gaps")
    actions.push("Build topic clusters around frequently mentioned areas")
  }
  
  if (percentage >= 30) {
    actions.push("Improve internal linking and content structure")
    actions.push("Create linkable assets like tools, calculators, or guides")
  }
  
  return actions.slice(0, 3) // Show max 3 actions
}

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
  
  // For no-citation mentions, down is good (less uncited mentions)
  switch (props.trend.direction) {
    case 'down':
      return 'text-green-600 dark:text-green-400'
    case 'up':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}
</script>

<style scoped>
.no-citation-mentions-card {
  position: relative;
  min-height: 350px;
}

.no-citation-mentions-card:hover {
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

.no-citation-mentions-card > * {
  animation: slideIn 0.3s ease-out;
}
</style>