<template>
  <div class="query-competitiveness-analysis bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6">
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
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="defensiveQueryCount === 0" class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-center py-6">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Defensive Queries Found</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            There are currently no queries marked with "query_competition" = "defending" in this dataset.
          </p>
        </div>
      </div>
    </div>

    <!-- Defensive Metrics -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

    <!-- Brand Pages Table -->
    <div v-if="defensiveQueryCount > 0" class="mt-6">
      <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Brand Pages Referenced in Defensive Queries</h4>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th @click="sortBy('title')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>Page</span>
                  <svg v-if="sortColumn === 'title'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
              <th @click="sortBy('keyword')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>Keyword</span>
                  <svg v-if="sortColumn === 'keyword'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
              <th @click="sortBy('topic')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>Topic</span>
                  <svg v-if="sortColumn === 'topic'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
              <th @click="sortBy('hasSchema')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>Schema</span>
                  <svg v-if="sortColumn === 'hasSchema'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
              <th @click="sortBy('eeatScore')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>EEAT Score</span>
                  <svg v-if="sortColumn === 'eeatScore'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
              <th @click="sortBy('contentFormat')" class="px-3 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50">
                <div class="flex items-center">
                  <span>Format</span>
                  <svg v-if="sortColumn === 'contentFormat'" class="ml-1 h-4 w-4" :class="{'rotate-180': !sortAscending}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="(page, index) in sortedBrandPages" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                <a :href="page.url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                  {{ getPageTitle(page) }}
                </a>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ page.keyword || 'N/A' }}
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ page.topic || 'N/A' }}
              </td>
              <td class="px-3 py-3 text-sm">
                <span v-if="page.hasSchema" class="text-green-600 dark:text-green-400">✓</span>
                <span v-else class="text-red-600 dark:text-red-400">✗</span>
              </td>
              <td class="px-3 py-3 text-sm">
                <span :class="getQualityClass(page.eeatScore)">
                  {{ page.eeatScore || 'N/A' }}
                </span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ page.contentFormat || 'N/A' }}
              </td>
            </tr>
            <tr v-if="brandPages.length === 0">
              <td colspan="7" class="px-3 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                No brand pages found in queries marked as 'defending'.
              </td>
            </tr>
          </tbody>
        </table>
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

// Sorting state
const sortColumn = ref('title')
const sortAscending = ref(true)

// Sorting function
const sortBy = (column) => {
  if (sortColumn.value === column) {
    // If we're already sorting by this column, toggle the direction
    sortAscending.value = !sortAscending.value
  } else {
    // Otherwise, sort by the new column in ascending order
    sortColumn.value = column
    sortAscending.value = true
  }
}

// No tabs needed anymore

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

// Competitive context breakdown - only for defensive queries
const competitiveQueryCount = computed(() => {
  return defensiveQueries.value.filter(q =>
    q.competitor_mentioned_names?.length > 0 ||
    q.competitor_count > 0 ||
    q.competitor_context
  ).length
})

const competitiveContexts = computed(() => {
  const contexts = {}

  defensiveQueries.value.forEach(query => {
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

// Top competitors - only for defensive queries
const topCompetitors = computed(() => {
  const competitors = {}

  defensiveQueries.value.forEach(query => {
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

// No need for the breakdown computed properties, since we only show brand pages

// Brand pages in defensive queries
const brandPages = computed(() => {
  const pages = []
  const pageUrlMap = new Map() // To track unique pages and their data
  const clientDomain = props.client?.domain || ''

  defensiveQueries.value.forEach(query => {
    // Extract query-level data that we'll need for pages
    const queryKeyword = query.query_keyword || query.keyword || query.search_query || ''
    const queryTopic = query.query_topic || query.topic || ''

    if (query.associated_pages && Array.isArray(query.associated_pages)) {
      query.associated_pages.forEach(page => {
        // Only add brand pages (client domain) once
        if (page.citation_url &&
            (page.is_client_domain === true ||
             (page.citation_url && clientDomain && page.citation_url.includes(clientDomain)))) {

          const url = page.citation_url

          // If we've already seen this page, just update any missing data
          if (pageUrlMap.has(url)) {
            const existingPage = pageUrlMap.get(url)

            // Only update keyword/topic if they're not already set
            if (!existingPage.keyword && queryKeyword) {
              existingPage.keyword = queryKeyword
            }
            if (!existingPage.topic && queryTopic) {
              existingPage.topic = queryTopic
            }

            // Keep the higher EEAT score if available
            const newEeatScore = page.eeat_score || page.page_analysis?.eeat_score
            if (newEeatScore && (!existingPage.eeatScore || newEeatScore > existingPage.eeatScore)) {
              existingPage.eeatScore = newEeatScore
            }

            return
          }

          // Extract page data for a new entry
          const pageData = {
            url: url,
            title: page.page_title || extractDomainFromUrl(url),
            hasSchema: page.technical_seo?.schema_markup_present || false,
            contentRecency: getContentRecency(page),
            contentFormat: getContentFormat(page),
            // Add missing fields for table columns with better fallbacks
            eeatScore: page.eeat_score || page.page_analysis?.eeat_score || null,
            topic: page.topic || queryTopic || null,
            keyword: queryKeyword || null
          }

          pages.push(pageData)
          pageUrlMap.set(url, pageData)
        }
      })
    }
  })

  return pages
})

// Sorted brand pages based on current sort column and direction
const sortedBrandPages = computed(() => {
  if (!brandPages.value.length) return []

  return [...brandPages.value].sort((a, b) => {
    let valueA, valueB

    // Handle different column types
    switch (sortColumn.value) {
      case 'title':
        valueA = a.title || ''
        valueB = b.title || ''
        break
      case 'keyword':
        valueA = a.keyword || ''
        valueB = b.keyword || ''
        break
      case 'topic':
        valueA = a.topic || ''
        valueB = b.topic || ''
        break
      case 'hasSchema':
        valueA = a.hasSchema ? 1 : 0
        valueB = b.hasSchema ? 1 : 0
        break
      case 'eeatScore':
        valueA = parseFloat(a.eeatScore) || 0
        valueB = parseFloat(b.eeatScore) || 0
        break
      case 'contentFormat':
        valueA = a.contentFormat || ''
        valueB = b.contentFormat || ''
        break
      default:
        valueA = a[sortColumn.value] || ''
        valueB = b[sortColumn.value] || ''
    }

    // Sort strings alphabetically, numbers numerically
    let result
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      result = valueA.localeCompare(valueB)
    } else {
      result = valueA - valueB
    }

    // Apply sort direction
    return sortAscending.value ? result : -result
  })
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

function truncateUrl(url, maxLength) {
  if (!url) return ''
  if (url.length <= maxLength) return url

  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // If domain itself is longer than maxLength, truncate it
    if (domain.length >= maxLength - 3) {
      return domain.substring(0, maxLength - 3) + '...'
    }

    // Otherwise, show domain + truncated path
    const pathLength = maxLength - domain.length - 3
    const path = urlObj.pathname.substring(0, pathLength) + (urlObj.pathname.length > pathLength ? '...' : '')
    return domain + path
  } catch (e) {
    // Handle invalid URLs
    return url.substring(0, maxLength - 3) + '...'
  }
}
</script>

<style scoped>
.query-competitiveness-analysis {
  position: relative;
  min-height: 350px;
}

/* Removed hover effect */
</style>