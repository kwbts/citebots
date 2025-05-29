<template>
  <div class="response-outcome-analysis bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Response Outcome Analysis</h3>
    </div>

    <!-- Outcome Performance Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div 
        v-for="outcome in outcomeData.outcomes" 
        :key="outcome.outcome"
        class="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors cursor-pointer"
        @click="selectedOutcome = outcome.outcome"
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900 dark:text-white">{{ outcome.label }}</h4>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ outcome.total }} queries</span>
        </div>
        
        <!-- Brand vs Competitor Bars -->
        <div class="space-y-2">
          <!-- Brand Performance -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-600 dark:text-gray-400 w-16">Your Brand</span>
            <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                class="h-2 bg-orange-500 rounded-full transition-all duration-700"
                :style="`width: ${outcome.brandRate}%`"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
              {{ formatPercentage(outcome.brandRate) }}
            </span>
          </div>
          
          <!-- Competitor Performance -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-600 dark:text-gray-400 w-16">Competitors</span>
            <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                class="h-2 bg-gray-400 rounded-full transition-all duration-700"
                :style="`width: ${outcome.competitorRate}%`"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
              {{ formatPercentage(outcome.competitorRate) }}
            </span>
          </div>
        </div>
        
        <!-- Performance Indicator -->
        <div class="mt-3 flex items-center gap-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="getPerformanceIndicator(outcome.brandRate, outcome.competitorRate)"
          ></div>
          <span class="text-xs font-medium" :class="getPerformanceTextColor(outcome.brandRate, outcome.competitorRate)">
            {{ getPerformanceLabel(outcome.brandRate, outcome.competitorRate) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Detailed Analysis for Selected Outcome -->
    <div v-if="selectedOutcomeData" class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">
        Deep Dive: {{ selectedOutcomeData.label }}
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {{ selectedOutcomeData.brandMentioned }}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Brand Mentions</p>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
            {{ selectedOutcomeData.competitorMentioned }}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Competitor Mentions</p>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {{ selectedOutcomeData.total }}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Queries</p>
        </div>
      </div>
      
      <!-- Outcome-Specific Insights -->
      <div class="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 class="font-medium text-indigo-800 dark:text-indigo-300 mb-1">Outcome Insight</h5>
            <p class="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
              {{ getOutcomeInsight() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Overall Summary -->
    <div class="mt-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
      <h4 class="font-medium text-gray-900 dark:text-white mb-3">Summary</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ getOverallSummary() }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Analyzing outcomes...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  outcomeData: {
    type: Object,
    required: true,
    default: () => ({
      outcomes: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const selectedOutcome = ref(null)

const selectedOutcomeData = computed(() => {
  if (!selectedOutcome.value) return null
  return props.outcomeData.outcomes.find(o => o.outcome === selectedOutcome.value)
})

const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const getPerformanceIndicator = (brandRate, competitorRate) => {
  if (brandRate > competitorRate + 10) return 'bg-green-500'
  if (brandRate > competitorRate) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getPerformanceTextColor = (brandRate, competitorRate) => {
  if (brandRate > competitorRate + 10) return 'text-green-600 dark:text-green-400'
  if (brandRate > competitorRate) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getPerformanceLabel = (brandRate, competitorRate) => {
  if (brandRate > competitorRate + 10) return 'Strong'
  if (brandRate > competitorRate) return 'Competitive'
  return 'Opportunity'
}

const getOutcomeInsight = () => {
  if (!selectedOutcomeData.value) return ''
  
  const data = selectedOutcomeData.value
  const brandRate = data.brandRate
  const competitorRate = data.competitorRate
  const diff = brandRate - competitorRate
  
  if (diff > 15) {
    return `Excellent performance in ${data.label} queries! Your brand dominates this outcome type with ${formatPercentage(brandRate)} vs competitors' ${formatPercentage(competitorRate)}. This is a key strength to maintain.`
  } else if (diff > 5) {
    return `Good positioning in ${data.label} queries. You outperform competitors by ${formatPercentage(Math.abs(diff))}. Consider amplifying content that drives this outcome type.`
  } else if (diff > -5) {
    return `Competitive performance in ${data.label} queries. Small gap with competitors suggests opportunities for incremental improvements in content strategy.`
  } else {
    return `Significant opportunity in ${data.label} queries. Competitors outperform by ${formatPercentage(Math.abs(diff))}. Focus on creating content that drives this specific outcome.`
  }
}

const getOverallSummary = () => {
  const outcomes = props.outcomeData.outcomes
  if (outcomes.length === 0) {
    return 'No outcome data available for analysis.'
  }
  
  const strongOutcomes = outcomes.filter(o => o.brandRate > o.competitorRate + 10)
  const competitiveOutcomes = outcomes.filter(o => o.brandRate > o.competitorRate && o.brandRate <= o.competitorRate + 10)
  const opportunityOutcomes = outcomes.filter(o => o.brandRate <= o.competitorRate)
  
  let summary = `Analysis of ${outcomes.length} outcome types shows: `
  
  if (strongOutcomes.length > 0) {
    summary += `${strongOutcomes.length} strong performance areas, `
  }
  if (competitiveOutcomes.length > 0) {
    summary += `${competitiveOutcomes.length} competitive areas, `
  }
  if (opportunityOutcomes.length > 0) {
    summary += `${opportunityOutcomes.length} improvement opportunities. `
  }
  
  // Add specific recommendation
  if (strongOutcomes.length >= outcomes.length / 2) {
    summary += 'Focus on maintaining strong positions while addressing weaker areas.'
  } else if (opportunityOutcomes.length >= outcomes.length / 2) {
    summary += 'Significant content strategy optimization needed across multiple outcome types.'
  } else {
    summary += 'Balanced performance with targeted improvement opportunities.'
  }
  
  return summary
}
</script>

<style scoped>
.response-outcome-analysis {
  position: relative;
  min-height: 400px;
}

.response-outcome-analysis:hover {
  transform: translateY(-2px);
}
</style>