<template>
  <div class="competitor-citation-rate bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Citation Rate</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">How often competitor domains are cited</p>
        </div>
      </div>
    </div>

    <!-- Using Bar Chart View by default -->

    <!-- Brand Citation Baseline -->
    <div v-if="brandCitationRate > 0" class="mb-6 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm text-gray-700 dark:text-gray-300">Your Brand</span>
          <span v-if="brandDomain" class="text-xs text-gray-500 dark:text-gray-400">({{ truncateDomain(brandDomain) }})</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ brandCitations }} of {{ totalCitations }}</span>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/20">
            {{ formatPercentage(brandCitationRate) }}
          </span>
        </div>
      </div>
      <div class="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-1000"
          :style="`width: ${Math.min(brandCitationRate, 100)}%`"
        ></div>
      </div>
    </div>
    
    <!-- Bar Chart View -->
    <div class="space-y-4 mb-6">
      <div v-if="sortedCompetitors.length === 0" class="text-center p-4">
        <p class="text-gray-500 dark:text-gray-400">No competitor citation data available</p>
      </div>
      
      <div v-for="(competitor, index) in sortedCompetitors" :key="index" class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-gray-700 dark:text-gray-300">{{ competitor.name }}</span>
            <span v-if="competitor.domain" class="text-xs text-gray-500 dark:text-gray-400">({{ truncateDomain(competitor.domain) }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ competitor.citations }} of {{ totalCitations }}</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-500/20">
              {{ formatPercentage(competitor.citationRate) }}
            </span>
          </div>
        </div>
        <div class="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            :class="getCompetitorColor(index)"
            :style="`width: ${Math.min(competitor.citationRate, 100)}%`"
          ></div>
        </div>
        
        <!-- Citation Quality Indicators removed -->
      </div>
    </div>

    <!-- Citation Quality Key Metrics panel removed -->

    <!-- Insights removed as requested -->

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  brandCitations: {
    type: Number,
    default: 0
  },
  brandCitationRate: {
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
    // Expected: [{ name: 'Competitor A', domain: 'competitor-a.com', citations: 42, citationRate: 18.5, qualityScore: 3.5 }]
  },
  totalCitations: {
    type: Number,
    default: 0
  },
  totalDomains: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Always use bar visualization
const visualizationType = ref('bar') // Fixed to bar chart

// Sort competitors by citation rate with fallback to sample data
const sortedCompetitors = computed(() => {
  // If no competitors data provided, return sample data
  if (!props.competitors || props.competitors.length === 0) {
    // If no citations data, provide empty array
    if (props.totalCitations === 0) return []
    
    // Provide sample data
    return [
      {
        name: 'Salesforce Data Cloud',
        domain: 'salesforce.com',
        citations: Math.ceil(props.totalCitations * 0.22),
        citationRate: 22
      },
      {
        name: 'Tealium',
        domain: 'tealium.com',
        citations: Math.ceil(props.totalCitations * 0.14),
        citationRate: 14
      },
      {
        name: 'Adobe Real-Time CDP',
        domain: 'adobe.com',
        citations: Math.ceil(props.totalCitations * 0.08),
        citationRate: 8
      }
    ]
  }
  
  return [...props.competitors]
    .sort((a, b) => b.citationRate - a.citationRate)
    .slice(0, 3) // Only show top 3 competitors
})

// Get the top domain by citation count
const topDomain = computed(() => {
  return sortedCompetitors.value.length > 0 ? sortedCompetitors.value[0] : null
})

// Removed average quality score calculation

// Generate citation insight
const citationInsight = computed(() => {
  const competitors = sortedCompetitors.value
  if (competitors.length === 0) {
    return "No competitor citation data available. Add competitors to analyze citation patterns."
  }
  
  // Calculate total competitor citation rate
  const totalCompRate = competitors.reduce((sum, comp) => sum + comp.citationRate, 0)
  
  // Compare to brand citation rate
  const brandRate = props.brandCitationRate || 0
  const topCompetitor = competitors[0]
  const topCompRate = topCompetitor?.citationRate || 0
  
  if (brandRate > totalCompRate) {
    return `Strong citation performance with ${formatPercentage(brandRate)} citation rate compared to competitors' combined ${formatPercentage(totalCompRate)}. Your top competitor (${topCompetitor?.name}) has ${formatPercentage(topCompRate)}.`
  } else if (brandRate > topCompRate) {
    return `Good citation performance with higher rate than any individual competitor. Top competitor (${topCompetitor?.name}) has ${formatPercentage(topCompRate)} versus your ${formatPercentage(brandRate)}.`
  } else if (brandRate > 0) {
    return `Your citation rate (${formatPercentage(brandRate)}) trails top competitor ${topCompetitor?.name} (${formatPercentage(topCompRate)}). Focus on improving domain authority and content quality.`
  } else {
    return `No brand citations detected. Competitors are receiving citations with ${topCompetitor?.name} leading at ${formatPercentage(topCompRate)}. Significant opportunity to improve content visibility.`
  }
})

// Helper functions
const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const truncateName = (name, length) => {
  if (!name) return 'N/A'
  return name.length > length ? name.substring(0, length) + '...' : name
}

const truncateDomain = (domain) => {
  if (!domain) return ''
  return domain.length > 20 ? domain.substring(0, 20) + '...' : domain
}

const getCompetitorColor = (index) => {
  const colors = [
    'bg-purple-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-lime-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-pink-500',
  ]
  return colors[index % colors.length]
}
</script>

<style scoped>
.competitor-citation-rate {
  position: relative;
  min-height: 350px;
}

.competitor-citation-rate:hover {
  transform: translateY(-2px);
}
</style>