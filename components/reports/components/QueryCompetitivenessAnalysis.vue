<template>
  <div class="query-competitiveness-analysis bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Defensive Query Analysis</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Analyzing brand defense in competitive queries</p>
        </div>
      </div>
    </div>

    <!-- Defensive Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Primary Metric: Defensive Mention Rate -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-md transition-all">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Defensive Mention Rate</h4>
        <div class="flex items-end gap-2 mb-3">
          <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ defensiveMentionRate }}%</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">of brand mentions</span>
        </div>
        
        <div class="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
          <div class="absolute top-0 left-0 h-full bg-purple-500 dark:bg-purple-600 rounded-lg" 
               :style="`width: ${defensiveMentionRate}%`"></div>
          <div class="absolute inset-0 flex items-center justify-center text-xs font-medium">
            <span class="text-gray-700 dark:text-white">{{ defensiveQueryCount }} defensive queries</span>
          </div>
        </div>
      </div>

      <!-- Secondary Metric: Competitive Context -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-md transition-all">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Competitive Context</h4>
        <div class="flex items-end gap-2 mb-3">
          <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ competitiveQueryCount }}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">competitive queries</span>
        </div>
        
        <div class="space-y-2">
          <div v-for="(context, index) in competitiveContexts" :key="index" class="flex justify-between items-center text-xs">
            <span class="text-gray-600 dark:text-gray-400">{{ formatContextName(context.name) }}</span>
            <div class="flex items-center gap-2">
              <span class="text-gray-700 dark:text-gray-300 font-medium">{{ context.count }}</span>
              <span>({{ context.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tertiary Metric: Top Competitors -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-md transition-all">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Top Competitors</h4>
        <div class="flex items-end gap-2 mb-3">
          <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ topCompetitors.length }}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">competitors mentioned</span>
        </div>
        
        <div class="space-y-2">
          <div v-for="(competitor, index) in topCompetitors.slice(0, 3)" :key="index" class="flex justify-between items-center text-xs">
            <span class="text-gray-600 dark:text-gray-400">{{ competitor.name }}</span>
            <div class="flex items-center gap-2">
              <span class="text-gray-700 dark:text-gray-300 font-medium">{{ competitor.count }}</span>
              <span>({{ competitor.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breakdown Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex -mb-px space-x-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id 
                ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300',
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- Query Type Tab -->
      <div v-if="activeTab === 'query-type'" class="space-y-4">
        <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Defensive Queries by Query Type</h4>
        
        <div class="space-y-3">
          <div v-for="(type, index) in queryTypeBreakdown" :key="index" class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatTypeName(type.name) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ type.count }} queries</span>
                <span class="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  {{ type.percentage }}%
                </span>
              </div>
            </div>
            <div class="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div class="absolute top-0 left-0 h-full bg-purple-500 dark:bg-purple-600 rounded-full" 
                  :style="`width: ${type.percentage}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Response Type Tab -->
      <div v-if="activeTab === 'response-type'" class="space-y-4">
        <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Defensive Queries by Response Type</h4>
        
        <div class="space-y-3">
          <div v-for="(type, index) in responseTypeBreakdown" :key="index" class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatTypeName(type.name) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ type.count }} responses</span>
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  {{ type.percentage }}%
                </span>
              </div>
            </div>
            <div class="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div class="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-600 rounded-full" 
                  :style="`width: ${type.percentage}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Funnel Stage Tab -->
      <div v-if="activeTab === 'funnel-stage'" class="space-y-4">
        <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Defensive Queries by Funnel Stage</h4>
        
        <div class="space-y-3">
          <div v-for="(stage, index) in funnelStageBreakdown" :key="index" class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatStageName(stage.name) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ stage.count }} queries</span>
                <span class="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  {{ stage.percentage }}%
                </span>
              </div>
            </div>
            <div class="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div class="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600 rounded-full" 
                  :style="`width: ${stage.percentage}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Defensive Pages Tab -->
      <div v-if="activeTab === 'pages'" class="space-y-4">
        <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Pages in Defensive Queries</h4>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page</th>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schema</th>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quality</th>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recency</th>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</th>
                <th class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Depth</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="(page, index) in defensivePages" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                  <a :href="page.url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                    {{ getPageTitle(page) }}
                  </a>
                </td>
                <td class="px-3 py-3 text-sm">
                  <span v-if="page.hasSchema" class="text-green-600 dark:text-green-400">✓</span>
                  <span v-else class="text-red-600 dark:text-red-400">✗</span>
                </td>
                <td class="px-3 py-3 text-sm">
                  <span :class="getQualityClass(page.contentQuality)">
                    {{ page.contentQuality }}/5
                  </span>
                </td>
                <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ page.contentRecency }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ page.contentFormat }}
                </td>
                <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ page.contentDepth }}
                </td>
              </tr>
              <tr v-if="defensivePages.length === 0">
                <td colspan="6" class="px-3 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                  No defensive pages found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// Tab navigation
const tabs = [
  { id: 'query-type', name: 'Query Type' },
  { id: 'response-type', name: 'Response Type' },
  { id: 'funnel-stage', name: 'Funnel Stage' },
  { id: 'pages', name: 'Defensive Pages' }
]
const activeTab = ref('query-type')

// Access queries data from the props
const queries = computed(() => {
  return props.data?.analysis_queries || []
})

// Filter defensive queries - those with query_competition = 'defending'
const defensiveQueries = computed(() => {
  return queries.value.filter(q => q.query_competition === 'defending')
})

// Primary Metrics
const defensiveQueryCount = computed(() => defensiveQueries.value.length)
const totalBrandMentions = computed(() => queries.value.filter(q => q.brand_mentioned).length)
const defensiveMentionRate = computed(() => {
  if (totalBrandMentions.value === 0) return 0
  return Math.round((defensiveQueryCount.value / totalBrandMentions.value) * 100)
})

// Competitive context breakdown
const competitiveQueryCount = computed(() => {
  return queries.value.filter(q => 
    q.competitor_mentioned_names?.length > 0 || 
    q.competitor_count > 0 || 
    q.competitor_context
  ).length
})

const competitiveContexts = computed(() => {
  const contexts = {}
  
  queries.value.forEach(query => {
    if (query.competitor_context) {
      const context = query.competitor_context
      contexts[context] = (contexts[context] || 0) + 1
    }
  })
  
  return Object.entries(contexts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / competitiveQueryCount.value) * 100) || 0
  })).sort((a, b) => b.count - a.count)
})

// Top competitors
const topCompetitors = computed(() => {
  const competitors = {}
  
  queries.value.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(name => {
        competitors[name] = (competitors[name] || 0) + 1
      })
    }
  })
  
  return Object.entries(competitors).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / competitiveQueryCount.value) * 100) || 0
  })).sort((a, b) => b.count - a.count)
})

// Query type breakdown
const queryTypeBreakdown = computed(() => {
  const types = {}
  
  defensiveQueries.value.forEach(query => {
    const type = query.query_type || 'unknown'
    types[type] = (types[type] || 0) + 1
  })
  
  return Object.entries(types).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / defensiveQueryCount.value) * 100) || 0
  })).sort((a, b) => b.count - a.count)
})

// Response type breakdown
const responseTypeBreakdown = computed(() => {
  const types = {}
  
  defensiveQueries.value.forEach(query => {
    const type = query.response_outcome || 'unknown'
    types[type] = (types[type] || 0) + 1
  })
  
  return Object.entries(types).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / defensiveQueryCount.value) * 100) || 0
  })).sort((a, b) => b.count - a.count)
})

// Funnel stage breakdown
const funnelStageBreakdown = computed(() => {
  const stages = {}
  
  defensiveQueries.value.forEach(query => {
    const stage = query.funnel_stage || 'unknown'
    stages[stage] = (stages[stage] || 0) + 1
  })
  
  return Object.entries(stages).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / defensiveQueryCount.value) * 100) || 0
  })).sort((a, b) => b.count - a.count)
})

// Pages in defensive queries
const defensivePages = computed(() => {
  const pages = []
  const pageUrls = new Set() // To track unique pages
  
  defensiveQueries.value.forEach(query => {
    if (query.associated_pages && Array.isArray(query.associated_pages)) {
      query.associated_pages.forEach(page => {
        // Only add each page once
        if (page.citation_url && !pageUrls.has(page.citation_url)) {
          pageUrls.add(page.citation_url)
          
          // Extract page data
          pages.push({
            url: page.citation_url,
            title: page.page_title || extractDomainFromUrl(page.citation_url),
            hasSchema: page.technical_seo?.schema_markup_present || false,
            contentQuality: page.content_quality_score || 0,
            contentRecency: getContentRecency(page),
            contentFormat: getContentFormat(page),
            contentDepth: getContentDepth(page)
          })
        }
      })
    }
  })
  
  return pages
})

// Helper functions
function formatContextName(context) {
  if (!context) return 'Unknown'
  
  const nameMap = {
    'exclusive': 'Exclusive Mention',
    'comparative': 'Comparative Mention',
    'neutral': 'Neutral Mention',
    'favorable': 'Favorable Mention',
    'unfavorable': 'Unfavorable Mention',
    'mentioned': 'Mentioned',
    'primary': 'Primary',
    'secondary': 'Secondary'
  }
  
  return nameMap[context] || context.charAt(0).toUpperCase() + context.slice(1)
}

function formatTypeName(type) {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatStageName(stage) {
  if (!stage) return 'Unknown'
  
  const nameMap = {
    'awareness': 'Awareness',
    'consideration': 'Consideration',
    'decision': 'Decision',
    'retention': 'Retention',
    'advocacy': 'Advocacy'
  }
  
  return nameMap[stage] || stage.charAt(0).toUpperCase() + stage.slice(1)
}

function getContentRecency(page) {
  if (!page.page_analysis) return 'Unknown'
  return page.page_analysis.content_recency || 'Unknown'
}

function getContentFormat(page) {
  if (!page.page_analysis) return 'Unknown'
  return page.page_analysis.content_format || 'Unknown'
}

function getContentDepth(page) {
  if (!page.page_analysis) return 'Unknown'
  return page.page_analysis.content_depth || 'Unknown'
}

function getPageTitle(page) {
  return page.title || extractDomainFromUrl(page.url)
}

function extractDomainFromUrl(url) {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (e) {
    return url
  }
}

function getQualityClass(score) {
  const scoreNum = parseFloat(score)
  if (scoreNum >= 4) return 'text-green-600 dark:text-green-400 font-medium'
  if (scoreNum >= 3) return 'text-yellow-600 dark:text-yellow-400 font-medium'
  if (scoreNum >= 2) return 'text-orange-600 dark:text-orange-400 font-medium'
  return 'text-red-600 dark:text-red-400 font-medium'
}
</script>

<style scoped>
.query-competitiveness-analysis {
  position: relative;
  min-height: 350px;
}

.query-competitiveness-analysis:hover {
  transform: translateY(-2px);
}
</style>