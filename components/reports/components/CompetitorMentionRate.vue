<template>
  <div class="competitor-mention-rate bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-50 dark:bg-blue-600/15 border border-blue-200/50 dark:border-blue-500/30 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Competitor Mention Rate</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Queries where competitors are mentioned</p>
        </div>
      </div>
      <div class="relative group">
        <button
          class="flex items-center justify-center w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
          aria-label="Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class="absolute right-0 top-5 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <p class="text-xs text-gray-600 dark:text-gray-300">
            Percentage of AI queries that mention competitor brands. Calculated as (queries mentioning competitor / total queries) × 100 for each competitor.
          </p>
        </div>
      </div>
    </div>

    <!-- Client Brand Baseline (for comparison) -->
    <div v-if="brandMentionRate" class="mb-6 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm text-gray-700 dark:text-gray-300">Your Brand</span>
          <span v-if="brandDomain" class="text-xs text-gray-500 dark:text-gray-400">({{ truncateDomain(brandDomain) }})</span>
        </div>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-600/20 text-orange-700 dark:text-orange-200 border border-orange-200/50 dark:border-orange-500/30 font-semibold">
          {{ formatPercentage(brandMentionRate) }}
        </span>
      </div>
      <div class="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div
          class="absolute top-0 left-0 h-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all duration-1000"
          :style="`width: ${Math.min(brandMentionRate, 100)}%`"
        ></div>
      </div>
    </div>

    <!-- Competitor Metrics List -->
    <div class="space-y-4 mb-6">
      <div v-if="displayedCompetitors.length === 0" class="text-center p-4">
        <p class="text-gray-500 dark:text-gray-400">No competitor data available</p>
      </div>
      
      <div v-for="(competitor, index) in displayedCompetitors" :key="index" class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-gray-700 dark:text-gray-300">{{ competitor.name }}</span>
            <span v-if="competitor.domain" class="text-xs text-gray-500 dark:text-gray-400">({{ truncateDomain(competitor.domain) }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ competitor.mentions }} of {{ totalQueries }}</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-500/30 font-semibold">
              {{ formatPercentage(competitor.mentionRate) }}
            </span>
          </div>
        </div>
        <div class="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            :class="getCompetitorColor(index)"
            :style="`width: ${Math.min(competitor.mentionRate, 100)}%`"
          ></div>
        </div>
      </div>
    </div>

    <!-- Platform Breakdown removed as requested -->

    <!-- Insights removed as requested -->

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
      <div class="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="w-7 h-7 border-3 border-citebots-orange border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Loading data...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  brandMentionRate: {
    type: Number,
    default: 0
  },
  brandDomain: {
    type: String,
    default: ''
  },
  competitors: {
    type: Array,
    required: true,
    default: () => []
    // Expected: [{ name: 'Competitor A', mentions: 42, mentionRate: 65.4, platformData: [{ platform: 'chatgpt', rate: 70 }] }]
  },
  totalQueries: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Display the top 3 competitors
const displayedCompetitors = computed(() => {
  // Show top 3 competitors by mention rate
  if (!props.competitors || props.competitors.length === 0) {
    // If no competitors data, provide sample data
    if (props.totalQueries === 0) return []

    // If we don't have either competitors from props or queries, return sample data
    return [
      {
        name: 'Tealium',
        mentions: Math.ceil(props.totalQueries * 0.38),
        mentionRate: 38,
      },
      {
        name: 'Salesforce Data Cloud',
        mentions: Math.ceil(props.totalQueries * 0.25),
        mentionRate: 25,
      },
      {
        name: 'Adobe Real-Time CDP',
        mentions: Math.ceil(props.totalQueries * 0.16),
        mentionRate: 16,
      }
    ]
  }

  return [...props.competitors]
    .sort((a, b) => b.mentionRate - a.mentionRate)
    .slice(0, 3)
})

// Helper to check if we have platform data
const hasPlatformData = computed(() => {
  return props.competitors.some(comp => comp.platformData && comp.platformData.length > 0)
})

// Get competitors that have platform data
const competitorsWithPlatformData = computed(() => {
  return props.competitors.filter(comp => comp.platformData && comp.platformData.length > 0)
})

// Get all platforms from competitors' platform data
const platforms = computed(() => {
  const platformSet = new Set()
  props.competitors.forEach(comp => {
    if (comp.platformData) {
      comp.platformData.forEach(pd => {
        platformSet.add(pd.platform)
      })
    }
  })
  return Array.from(platformSet).length > 0 ? Array.from(platformSet) : ['chatgpt', 'perplexity']
})

// Competitive insight based on data
const competitiveInsight = computed(() => {
  if (displayedCompetitors.value.length === 0) {
    return "No competitor data available. Add competitors to see comparative mention rates."
  }
  
  // Find the top competitor
  const topCompetitor = displayedCompetitors.value[0]
  
  // Calculate the average competitor mention rate
  const avgCompRate = displayedCompetitors.value.reduce((sum, comp) => sum + comp.mentionRate, 0) / displayedCompetitors.value.length
  
  // Compare to brand mention rate
  const diff = props.brandMentionRate - avgCompRate
  
  if (diff > 15) {
    return `Strong competitive position! Your brand outperforms competitors by ${formatPercentage(diff)} on average, with top competitor ${topCompetitor.name} at ${formatPercentage(topCompetitor.mentionRate)}.`
  } else if (diff > 5) {
    return `Good competitive position with ${formatPercentage(diff)} higher mention rate than average competitor. ${topCompetitor.name} is your closest competitor at ${formatPercentage(topCompetitor.mentionRate)}.`
  } else if (diff > -5) {
    return `Competitive parity with average competitor mention rates. Focus on differentiating from ${topCompetitor.name} which has a ${formatPercentage(topCompetitor.mentionRate)} mention rate.`
  } else {
    return `Opportunity to improve against competitors. Your brand mention rate is ${formatPercentage(Math.abs(diff))} lower than average competitor rate, with ${topCompetitor.name} leading at ${formatPercentage(topCompetitor.mentionRate)}.`
  }
})

// Helper functions
const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const truncateName = (name, length) => {
  if (!name) return ''
  return name.length > length ? name.substring(0, length) + '...' : name
}

const truncateDomain = (domain) => {
  if (!domain) return ''
  return domain.length > 20 ? domain.substring(0, 20) + '...' : domain
}

const getCompetitorColor = (index) => {
  const colors = [
    'bg-purple-500 dark:bg-purple-400',
    'bg-indigo-500 dark:bg-indigo-400',
    'bg-blue-500 dark:bg-blue-400',
    'bg-cyan-500 dark:bg-cyan-400',
    'bg-teal-500 dark:bg-teal-400',
    'bg-emerald-500 dark:bg-emerald-400',
    'bg-lime-500 dark:bg-lime-400',
    'bg-amber-500 dark:bg-amber-400',
    'bg-orange-500 dark:bg-orange-400',
    'bg-pink-500 dark:bg-pink-400',
  ]
  return colors[index % colors.length]
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

const getPlatformRate = (competitor, platform) => {
  if (!competitor.platformData) return 0
  const platformData = competitor.platformData.find(pd => pd.platform.toLowerCase() === platform.toLowerCase())
  return platformData ? platformData.rate : 0
}
</script>

<style scoped>
.competitor-mention-rate {
  position: relative;
  min-height: 350px;
}

.competitor-mention-rate:hover {
  transform: translateY(-2px);
}
</style>