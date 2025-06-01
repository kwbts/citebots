<template>
  <div class="brand-query-performance-card bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Query Performance</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Mentions across queries and platforms</p>
        </div>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Left Column: Main Metrics -->
      <div class="flex flex-col">
        <!-- Main Metric -->
        <div class="text-center mb-6">
          <div class="flex justify-center mb-4">
            <SeoScoreGauge :score="mentionRate / 100" :percentDisplay="true" />
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            {{ brandMentions }} of {{ totalQueries }} queries
          </p>
        </div>


      </div>

      <!-- Right Column: Breakdown Analysis -->
      <div class="flex flex-col">
        <!-- Query Competition Breakdown -->
        <div v-if="queryCompetitionBreakdown?.length" class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Query Competition</h4>
          <div class="space-y-3">
            <div
              v-for="level in queryCompetitionBreakdown"
              :key="level.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getCompetitionColor(level.name)"
                ></div>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ level.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {{ level.count }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ totalQueries }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ level.percentage }}%)</span>
                </span>
                <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-2 rounded-full transition-all duration-700"
                    :class="getCompetitionBgColor(level.name)"
                    :style="{ width: `${level.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Competitor Breakdown -->
        <div v-if="competitorBreakdown?.length" class="space-y-3">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Competitor Performance</h4>
          <div class="space-y-3">
            <div
              v-for="competitor in competitorBreakdown"
              :key="competitor.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getCompetitorColor(competitor.mentionRate)"
                ></div>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ competitor.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {{ competitor.mentions }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ totalQueries }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ competitor.mentionRate }}%)</span>
                </span>
                <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-2 rounded-full transition-all duration-700"
                    :class="getCompetitorBgColor(competitor.mentionRate)"
                    :style="{ width: `${Math.min((competitor.mentions / totalQueries) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
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
import SeoScoreGauge from '../SeoScoreGauge.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      queries: [],
      competitors: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  percentDisplay: {
    type: Boolean,
    default: false
  }
})

// Calculate brand mention data
const totalQueries = computed(() => {
  const count = props.data.queries?.length || 0
  console.log('BrandQueryPerformanceCard totalQueries:', count)
  return count
})

const brandMentions = computed(() => {
  const count = props.data.queries?.filter(q => q.brand_mentioned === true)?.length || 0
  console.log('BrandQueryPerformanceCard brandMentions:', count)
  return count
})

const mentionRate = computed(() => {
  if (!totalQueries.value) return 0
  const rate = Math.round((brandMentions.value / totalQueries.value) * 100)
  console.log('BrandQueryPerformanceCard mentionRate:', rate)
  return rate
})

// Calculate query competition breakdown
const queryCompetitionBreakdown = computed(() => {
  if (!props.data.queries || props.data.queries.length === 0) return []

  const competitionLevels = {}
  const total = props.data.queries.length

  props.data.queries.forEach(query => {
    const level = query.query_competition || 'unknown'
    competitionLevels[level] = (competitionLevels[level] || 0) + 1
  })

  // Log for debugging
  console.log('Competition levels:', competitionLevels)
  console.log('Total queries:', total)

  const result = Object.entries(competitionLevels)
    .map(([name, count]) => ({
      name,
      label: getCompetitionLabel(name),
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  console.log('Competition breakdown with percentages:', result)
  return result
})

// Calculate competitor breakdown
const competitorBreakdown = computed(() => {
  if (!props.data.queries || props.data.queries.length === 0 || !props.data.competitors) return []
  
  // Create a map of competitor names to count
  const competitorMentionMap = {}
  
  props.data.queries.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(competitor => {
        competitorMentionMap[competitor] = (competitorMentionMap[competitor] || 0) + 1
      })
    }
  })
  
  const result = props.data.competitors
    .map(competitor => {
      const name = competitor.name
      const mentions = competitorMentionMap[name] || 0
      return {
        name,
        mentions,
        mentionRate: totalQueries.value ? Math.round((mentions / totalQueries.value) * 100) : 0
      }
    })
    .filter(comp => comp.mentions > 0)
    .sort((a, b) => b.mentionRate - a.mentionRate)

  console.log('Competitor breakdown with percentages:', result)
  return result
})



// Helper functions
const getCompetitionLabel = (level) => {
  // Return the original value since it's already in a good format
  return level.charAt(0).toUpperCase() + level.slice(1).replace(/_/g, ' ')
}

const getCompetitionColor = (level) => {
  const levelLower = String(level).toLowerCase();

  // Map colors based on the actual values seen in the data
  if (levelLower.includes('defending')) {
    return 'bg-blue-500 dark:bg-blue-500'
  } else if (levelLower.includes('opportunity')) {
    return 'bg-green-500 dark:bg-green-500'
  } else if (levelLower.includes('competitive')) {
    return 'bg-amber-500 dark:bg-amber-500'
  } else if (levelLower.includes('advantage') || levelLower.includes('competitor')) {
    return 'bg-red-500 dark:bg-red-500'
  } else if (levelLower.includes('high')) {
    return 'bg-red-500 dark:bg-red-500'
  } else if (levelLower.includes('medium')) {
    return 'bg-amber-500 dark:bg-amber-500'
  } else if (levelLower.includes('low')) {
    return 'bg-green-500 dark:bg-green-500'
  }

  return 'bg-gray-500 dark:bg-gray-500'
}

const getCompetitionBgColor = (level) => {
  return getCompetitionColor(level)
}

const getCompetitorColor = (rate) => {
  if (rate >= mentionRate.value) return 'bg-red-500'
  return 'bg-blue-500'
}

const getCompetitorBgColor = (rate) => {
  if (rate >= mentionRate.value) return 'bg-red-500'
  return 'bg-blue-500'
}
</script>

<style scoped>
.brand-query-performance-card {
  position: relative;
  min-height: 300px;
}

.brand-query-performance-card:hover {
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

.brand-query-performance-card > * {
  animation: slideIn 0.3s ease-out;
}
</style>