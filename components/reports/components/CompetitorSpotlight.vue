<template>
  <div class="competitor-spotlight bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Competitor Spotlight</h3>
    </div>

    <!-- Competitor Selection or Display -->
    <div v-if="!competitor" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Competitor</h4>
      <p class="text-gray-600 dark:text-gray-400">Choose a competitor from the Brand vs Competitors section to view detailed analysis</p>
    </div>

    <!-- Competitor Details -->
    <div v-else class="space-y-6">
      <!-- Competitor Header -->
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-lg">{{ getInitials(competitor.name) }}</span>
        </div>
        <div>
          <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ competitor.name }}</h4>
          <p class="text-gray-600 dark:text-gray-400">{{ competitor.domain || 'No domain available' }}</p>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {{ formatPercentage(competitorMetrics.mentionRate || 0) }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Mention Rate</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {{ competitorMetrics.totalMentions || 0 }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Mentions</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p class="text-2xl font-bold mb-1" :class="getSentimentColor(competitorMetrics.avgSentiment)">
            {{ formatSentiment(competitorMetrics.avgSentiment || 0) }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Avg Sentiment</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {{ competitorMetrics.citationRate || 0 }}%
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Citation Rate</p>
        </div>
      </div>

      <!-- Performance Comparison -->
      <div class="space-y-4">
        <h5 class="font-medium text-gray-700 dark:text-gray-300">vs Your Brand</h5>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Mention Rate</span>
            <div class="flex items-center gap-2">
              <div class="text-sm font-medium" :class="getComparisonColor(getComparisonValue('mentionRate'))">
                {{ getComparisonValue('mentionRate') > 0 ? '+' : '' }}{{ formatPercentage(Math.abs(getComparisonValue('mentionRate'))) }}
              </div>
              <svg v-if="getComparisonValue('mentionRate') > 0" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6" />
              </svg>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Total Mentions</span>
            <div class="flex items-center gap-2">
              <div class="text-sm font-medium" :class="getComparisonColor(getComparisonValue('totalMentions'))">
                {{ getComparisonValue('totalMentions') > 0 ? '+' : '' }}{{ Math.abs(getComparisonValue('totalMentions')) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategic Insights -->
      <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-blue-100 dark:bg-blue-500/20 border border-blue-200/50 dark:border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h5 class="font-medium text-blue-800 dark:text-blue-300 mb-1">Strategic Insight</h5>
            <p class="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
              {{ getStrategicInsight() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading competitor data...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  competitor: {
    type: Object,
    default: null
  },
  competitorMetrics: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Mock client metrics for comparison
const clientMetrics = {
  mentionRate: 65.4,
  totalMentions: 42,
  avgSentiment: 0.3,
  citationRate: 78
}

// Mock competitor metrics if not provided
const mockCompetitorMetrics = computed(() => ({
  mentionRate: 45.2,
  totalMentions: 28,
  avgSentiment: 0.1,
  citationRate: 65,
  ...props.competitorMetrics
}))

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
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

const getComparisonValue = (metric) => {
  const competitor = mockCompetitorMetrics.value[metric] || 0
  const client = clientMetrics[metric] || 0
  return competitor - client
}

const getComparisonColor = (value) => {
  // For competitors, positive comparison means they're ahead (bad for us)
  return value > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
}

const getStrategicInsight = () => {
  if (!props.competitor) return ''
  
  const compMetrics = mockCompetitorMetrics.value
  const mentionDiff = getComparisonValue('mentionRate')
  
  if (mentionDiff > 10) {
    return `${props.competitor.name} significantly outperforms your brand in LLM mentions. Consider analyzing their content strategy and identifying knowledge gaps to address.`
  } else if (mentionDiff > 0) {
    return `${props.competitor.name} has a slight advantage in mention rate. Focus on creating more authoritative content in areas where they excel.`
  } else if (mentionDiff > -10) {
    return `You're performing competitively against ${props.competitor.name}. Look for opportunities to differentiate and capture more mindshare.`
  } else {
    return `Excellent! You significantly outperform ${props.competitor.name} in LLM mentions. Maintain this advantage while monitoring their content strategy.`
  }
}
</script>

<style scoped>
.competitor-spotlight {
  position: relative;
  min-height: 400px;
}

.competitor-spotlight:hover {
  transform: translateY(-2px);
}
</style>