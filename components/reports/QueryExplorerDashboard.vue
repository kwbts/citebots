<template>
  <div class="query-explorer-dashboard">
    <!-- Top Section: Header and Filters -->
    <div class="mb-4">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Query Explorer</h2>
        
        <!-- Filter Controls -->
        <div class="flex flex-wrap gap-3">
          <!-- Platform Filter -->
          <div class="relative">
            <select
              v-model="filters.platform"
              class="block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="perplexity">Perplexity</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Query Intent Filter -->
          <div class="relative">
            <select
              v-model="filters.intent"
              class="block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none text-sm"
            >
              <option value="all">All Intents</option>
              <option v-for="intent in availableIntents" :key="intent" :value="intent">
                {{ formatIntentName(intent) }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Query Type Filter -->
          <div class="relative">
            <select
              v-model="filters.queryType"
              class="block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none text-sm"
            >
              <option value="all">All Query Types</option>
              <option value="content_gap">Content Gaps</option>
              <option value="defensive">Defensive</option>
              <option value="opportunity">Opportunities</option>
              <option value="brand_mentioned">Brand Mentioned</option>
              <option value="competitor_mentioned">Competitor Mentioned</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Reset Filters Button -->
          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Query Metrics - Individual Components -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <TotalQueriesMetric
        :total-queries="filteredQueries.length"
      />
      <BrandMentionsMetric
        :brand-mention-count="brandMentionCount"
        :brand-mention-rate="brandMentionRate"
      />
      <ContentGapsMetric
        :content-gap-count="contentGapCount"
        :content-gap-rate="contentGapRate"
      />
      <DefensiveQueriesMetric
        :defensive-count="defensiveCount"
        :defensive-rate="defensiveRate"
      />
    </div>

    <!-- Query Analysis Table -->
    <QueryAnalysisTable
      :filtered-queries="filteredQueries"
      :total-queries="totalQueries"
      :page-analyses="pageAnalyses"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      @sort="sortBy"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TotalQueriesMetric from './components/TotalQueriesMetric.vue'
import BrandMentionsMetric from './components/BrandMentionsMetric.vue'
import ContentGapsMetric from './components/ContentGapsMetric.vue'
import DefensiveQueriesMetric from './components/DefensiveQueriesMetric.vue'
import QueryAnalysisTable from './components/QueryAnalysisTable.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  }
})

// State
const filters = ref({
  platform: 'all',
  intent: 'all',
  queryType: 'all'
})

const sortField = ref('query_text')
const sortDirection = ref('asc')

// Get all queries
const queries = computed(() => props.data?.analysis_queries || [])
const pageAnalyses = computed(() => props.data?.page_analyses || [])
const totalQueries = computed(() => queries.value.length)

// Get available intents
const availableIntents = computed(() => {
  const intents = new Set()
  queries.value.forEach(q => {
    if (q.query_intent) intents.add(q.query_intent)
  })
  return Array.from(intents).sort()
})

// Filter queries
const filteredQueries = computed(() => {
  let result = queries.value

  // Platform filter
  if (filters.value.platform !== 'all') {
    result = result.filter(q => q.data_source === filters.value.platform)
  }

  // Intent filter
  if (filters.value.intent !== 'all') {
    result = result.filter(q => q.query_intent === filters.value.intent)
  }

  // Query type filter
  if (filters.value.queryType !== 'all') {
    switch (filters.value.queryType) {
      case 'content_gap':
        result = result.filter(q => !(q.brand_mentioned && q.brand_mention_type !== 'implicit') && q.competitor_count > 0)
        break
      case 'defensive':
        result = result.filter(q => q.query_competition === 'defending')
        break
      case 'opportunity':
        result = result.filter(q => q.query_competition === 'opportunity')
        break
      case 'brand_mentioned':
        result = result.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit')
        break
      case 'competitor_mentioned':
        result = result.filter(q => q.competitor_count > 0)
        break
    }
  }

  // Sort
  result = [...result].sort((a, b) => {
    const aVal = a[sortField.value] || ''
    const bVal = b[sortField.value] || ''
    const comparison = aVal.localeCompare(bVal)
    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Stats
const brandMentionCount = computed(() => filteredQueries.value.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit').length)
const brandMentionRate = computed(() => {
  if (filteredQueries.value.length === 0) return 0
  return Math.round((brandMentionCount.value / filteredQueries.value.length) * 100)
})

const contentGapCount = computed(() => filteredQueries.value.filter(q => !(q.brand_mentioned && q.brand_mention_type !== 'implicit') && q.competitor_count > 0).length)
const contentGapRate = computed(() => {
  if (filteredQueries.value.length === 0) return 0
  return Math.round((contentGapCount.value / filteredQueries.value.length) * 100)
})

const defensiveCount = computed(() => filteredQueries.value.filter(q => q.query_competition === 'defending').length)
const defensiveRate = computed(() => {
  if (filteredQueries.value.length === 0) return 0
  return Math.round((defensiveCount.value / filteredQueries.value.length) * 100)
})

const hasActiveFilters = computed(() => {
  return filters.value.platform !== 'all' || 
         filters.value.intent !== 'all' || 
         filters.value.queryType !== 'all'
})

// Methods
const resetFilters = () => {
  filters.value = {
    platform: 'all',
    intent: 'all',
    queryType: 'all'
  }
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const formatIntentName = (intent) => {
  if (!intent) return 'Unknown'
  const intentMap = {
    'informational': 'Informational',
    'commercial': 'Commercial',
    'navigational': 'Navigational',
    'transactional': 'Transactional',
    'comparison': 'Comparison',
    'local': 'Local'
  }
  const formatText = (text) => text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  return intentMap[intent] || formatText(intent)
}
</script>

<style scoped>
.query-explorer-dashboard {
  @apply space-y-4;
}
</style>