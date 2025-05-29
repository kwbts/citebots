<template>
  <div class="brand-vs-competitors bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand vs Competitors</h3>
      </div>
      
      <!-- Competitor Selector -->
      <select
        :value="selectedCompetitor?.id || 'all'"
        @change="handleCompetitorChange"
        class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
      >
        <option value="all">All Competitors</option>
        <option v-for="competitor in competitorData" :key="competitor.id" :value="competitor.id">
          {{ competitor.name }}
        </option>
      </select>
    </div>

    <!-- Comparison Chart -->
    <div class="space-y-4">
      <!-- Client Brand Performance -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-900 dark:text-white">{{ clientData?.name || 'Your Brand' }}</span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/20">
            {{ formatPercentage(clientMentionRate) }}
          </span>
        </div>
        <div class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
          <div
            class="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-1000"
            :style="`width: ${Math.min(clientMentionRate, 100)}%`"
          ></div>
        </div>
      </div>

      <!-- Competitor Performance -->
      <div v-for="comp in displayedCompetitors" :key="comp.id" class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-900 dark:text-white">{{ comp.name }}</span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-500/20">
            {{ formatPercentage(comp.mentionRate || 0) }}
          </span>
        </div>
        <div class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
          <div
            class="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-1000"
            :style="`width: ${Math.min(comp.mentionRate || 0, 100)}%`"
          ></div>
        </div>
      </div>
    </div>

    <!-- Competitive Insights -->
    <div class="mt-6 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 bg-orange-100 dark:bg-orange-500/20 border border-orange-200/50 dark:border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h5 class="font-medium text-orange-800 dark:text-orange-300 mb-1">Competitive Position</h5>
          <p class="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
            {{ getCompetitiveInsight() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading competitors...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  clientData: {
    type: Object,
    default: null
  },
  competitorData: {
    type: Array,
    default: () => []
  },
  selectedCompetitor: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['competitor-select'])

// Mock data for demonstration
const clientMentionRate = computed(() => {
  // This would come from actual data
  return 65.4
})

const displayedCompetitors = computed(() => {
  if (props.selectedCompetitor) {
    return [{
      ...props.selectedCompetitor,
      mentionRate: 45.2 // Mock data
    }]
  }
  
  // Show top 5 competitors with mock data
  return props.competitorData.slice(0, 5).map((comp, index) => ({
    ...comp,
    mentionRate: [58.3, 42.1, 39.7, 33.2, 28.9][index] || 25.0
  }))
})

const handleCompetitorChange = (event) => {
  const competitorId = event.target.value
  if (competitorId === 'all') {
    emit('competitor-select', null)
  } else {
    const competitor = props.competitorData.find(c => c.id === competitorId)
    emit('competitor-select', competitor)
  }
}

const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const getCompetitiveInsight = () => {
  const clientRate = clientMentionRate.value
  const competitors = displayedCompetitors.value
  
  if (competitors.length === 0) {
    return `Your brand has a ${formatPercentage(clientRate)} mention rate across analyzed queries.`
  }
  
  const avgCompetitorRate = competitors.reduce((sum, c) => sum + (c.mentionRate || 0), 0) / competitors.length
  const difference = clientRate - avgCompetitorRate
  
  if (difference > 10) {
    return `Excellent! Your brand significantly outperforms competitors by ${formatPercentage(Math.abs(difference))}, showing strong market dominance in LLM responses.`
  } else if (difference > 5) {
    return `Good performance! Your brand outperforms competitors by ${formatPercentage(Math.abs(difference))}, indicating strong market presence.`
  } else if (difference > -5) {
    return `Your brand performs competitively with similar mention rates to key competitors. Focus on content optimization for growth.`
  } else {
    return `Competitors are mentioned ${formatPercentage(Math.abs(difference))} more often, indicating significant opportunity for content strategy improvements.`
  }
}
</script>

<style scoped>
.brand-vs-competitors {
  position: relative;
  min-height: 350px;
}

.brand-vs-competitors:hover {
  transform: translateY(-2px);
}
</style>