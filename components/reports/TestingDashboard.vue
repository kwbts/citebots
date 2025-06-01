<template>
  <div class="testing-dashboard">
    <div class="mb-6 flex flex-wrap justify-between items-center gap-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Testing Dashboard</h2>
      <div class="flex space-x-4 items-center">
        <!-- Platform filter -->
        <div class="relative">
          <select
            v-model="platformFilter"
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

        <!-- Dashboard type selector -->
        <div class="relative">
          <select
            v-model="dashboardType"
            class="block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none text-sm"
          >
            <option value="brand">Brand Performance</option>
            <option value="technical">Technical SEO</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Brand Performance Dashboard -->
    <div v-if="dashboardType === 'brand'">
      <!-- Primary Metrics Section - Full Width -->
      <div class="mb-6">
        <BrandQueryPerformanceCard
          :data="{
            queries: filteredQueries,
            competitors: reportData?.competitors || []
          }"
          :loading="false"
          :percentDisplay="true"
        />
      </div>

      <!-- Secondary Metrics Section - Two Column Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SentimentAnalysis
          :data="sentimentData"
          :loading="false"
        />
        <BrandMentionBreakdown
          :data="brandMentionData"
          :loading="false"
        />
      </div>

      <!-- Query Data Table Section -->
      <div class="data-table-section">
        <QueryPerformanceTable
          :queries="filteredQueries"
        />
      </div>
    </div>

    <!-- Technical SEO Dashboard -->
    <div v-else-if="dashboardType === 'technical'">
      <!-- Key Metrics Section -->
      <div class="metrics-grid">
        <TechnicalSeoScoreCard
          :score="averageTechnicalSeoScore"
          :totalPages="totalAnalyzedPages"
          :metricBreakdown="technicalMetricsBreakdown"
          :loading="false"
        />
      </div>

      <!-- Data Table Section -->
      <div class="data-table-section">
        <div class="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700/50 rounded-2xl p-6 overflow-hidden flex flex-col shadow-sm dark:shadow-none">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Technical SEO Data
            </h2>
            <div class="flex items-center gap-4">
              <div class="relative">
                <select
                  v-model="scoreFilter"
                  class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="all">All Scores</option>
                  <option value="high">High (8-10)</option>
                  <option value="medium">Medium (6-7)</option>
                  <option value="low">Low (0-5)</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Showing {{ filteredPages.length }} of {{ pageAnalyses.length }} results
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto flex-1">
            <table class="min-w-full border-collapse table-auto">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schema</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meta Desc</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ARIA</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="(page, index) in filteredPages" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="p-3 text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                    <a :href="page.citation_url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                      {{ truncateUrl(page.citation_url) }}
                    </a>
                  </td>
                  <td class="p-3 text-sm">
                    <span :class="getScoreClass(page.technical_seo?.html_structure_score || 0)">
                      {{ page.technical_seo?.html_structure_score || 'N/A' }}/10
                    </span>
                  </td>
                  <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                    <span v-if="page.technical_seo?.schema_markup_present" class="text-green-600 dark:text-green-400">✓</span>
                    <span v-else class="text-red-600 dark:text-red-400">✗</span>
                  </td>
                  <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                    <span v-if="page.technical_seo?.mobile_friendly" class="text-green-600 dark:text-green-400">✓</span>
                    <span v-else class="text-red-600 dark:text-red-400">✗</span>
                  </td>
                  <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                    <span v-if="page.technical_seo?.meta_description_present" class="text-green-600 dark:text-green-400">✓</span>
                    <span v-else class="text-red-600 dark:text-red-400">✗</span>
                  </td>
                  <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                    <span v-if="page.technical_seo?.aria_labels_present" class="text-green-600 dark:text-green-400">✓</span>
                    <span v-else class="text-red-600 dark:text-red-400">✗</span>
                  </td>
                </tr>
                <tr v-if="filteredPages.length === 0">
                  <td colspan="6" class="p-3 text-center text-gray-500 dark:text-gray-400">
                    No page analysis data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TechnicalSeoScoreCard from '~/components/reports/components/TechnicalSeoScoreCard.vue'
import BrandQueryPerformanceCard from '~/components/reports/components/BrandQueryPerformanceCard.vue'
import QueryPerformanceTable from '~/components/reports/components/QueryPerformanceTable.vue'
import SentimentAnalysis from '~/components/reports/components/SentimentAnalysis.vue'
import BrandMentionBreakdown from '~/components/reports/components/BrandMentionBreakdown.vue'

const props = defineProps({
  reportData: {
    type: Object,
    required: true
  }
})

// Dashboard type selector
const dashboardType = ref('brand') // Default to brand performance
const platformFilter = ref('all') // Default to all platforms

// Data
const scoreFilter = ref('all') // all, high, medium, low

// Get available data sources from queries
const availableDataSources = computed(() => {
  const sources = new Set()
  const queries = props.reportData?.analysis_queries || []

  queries.forEach(query => {
    if (query.data_source) {
      sources.add(query.data_source)
    }
  })

  return Array.from(sources).sort()
})

// Prepare sentiment data
const sentimentData = computed(() => {
  const queries = filteredQueries.value

  // Calculate sentiment distribution
  // Use brand_sentiment instead of sentiment_score
  const positive = queries.filter(q => (q.brand_sentiment || 0) > 0.2).length
  const neutral = queries.filter(q => (q.brand_sentiment || 0) >= -0.2 && (q.brand_sentiment || 0) <= 0.2).length
  const negative = queries.filter(q => (q.brand_sentiment || 0) < -0.2).length

  // Calculate average sentiment
  let totalSentiment = 0
  let validSentimentCount = 0

  queries.forEach(query => {
    if (query.brand_sentiment !== undefined && query.brand_sentiment !== null) {
      totalSentiment += query.brand_sentiment
      validSentimentCount++
    }
  })

  const avgSentiment = validSentimentCount > 0 ? totalSentiment / validSentimentCount : 0

  return {
    distribution: [
      { label: 'Positive', count: positive, color: 'green' },
      { label: 'Neutral', count: neutral, color: 'gray' },
      { label: 'Negative', count: negative, color: 'red' }
    ],
    averageSentiment: avgSentiment,
    totalQueries: queries.length
  }
})

// Prepare brand mention breakdown data
const brandMentionData = computed(() => {
  const queries = filteredQueries.value

  // Helper function to categorize and calculate mention rates
  const getMentionBreakdown = (field, labelMap) => {
    const categories = {}

    // First pass: group by category and count total
    queries.forEach(query => {
      const value = query[field] || 'unknown'
      if (!categories[value]) {
        categories[value] = {
          total: 0,
          mentioned: 0
        }
      }
      categories[value].total++
      if (query.brand_mentioned) {
        categories[value].mentioned++
      }
    })

    // Convert to array with rates
    return Object.entries(categories).map(([key, data]) => {
      const label = labelMap[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '))
      return {
        [field.includes('funnel') ? 'stage' : field.includes('type') ? 'type' : 'intent']: key,
        label,
        total: data.total,
        mentioned: data.mentioned,
        mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
      }
    }).sort((a, b) => b.mentionRate - a.mentionRate)
  }

  // Define label maps for different categories
  const intentLabels = {
    informational: 'Informational',
    transactional: 'Transactional',
    navigational: 'Navigational',
    commercial: 'Commercial',
    unknown: 'Unknown'
  }

  const typeLabels = {
    recommendation: 'Recommendation',
    comparison: 'Comparison',
    direct: 'Direct',
    implicit: 'Implicit',
    unknown: 'Unknown'
  }

  const funnelLabels = {
    awareness: 'Awareness',
    consideration: 'Consideration',
    decision: 'Decision',
    retention: 'Retention',
    unknown: 'Unknown'
  }

  // Define category labels
  const categoryLabels = {
    product: 'Product',
    service: 'Service',
    technology: 'Technology',
    feature: 'Feature',
    tool: 'Tool',
    platform: 'Platform',
    solution: 'Solution',
    review: 'Review',
    comparison: 'Comparison',
    guide: 'Guide',
    unknown: 'Unknown'
  }

  return {
    byIntent: getMentionBreakdown('query_intent', intentLabels),
    byCategory: getMentionBreakdown('query_category', categoryLabels),
    byFunnelStage: getMentionBreakdown('funnel_stage', funnelLabels)
  }
})

const pageAnalyses = computed(() => {
  // Use data from the report instead of fetching separately
  return props.reportData?.page_analyses || []
})

// Filter queries by platform
const filteredQueries = computed(() => {
  let queries = props.reportData?.analysis_queries || []
  
  if (platformFilter.value !== 'all') {
    queries = queries.filter(q => {
      // Match against data_source field
      return q.data_source?.toLowerCase() === platformFilter.value.toLowerCase()
    })
  }
  
  // Sort by brand mention first (true first), then by recommendation type
  return queries.sort((a, b) => {
    // First sort by brand mentioned (true values first)
    if (a.brand_mentioned !== b.brand_mentioned) {
      return a.brand_mentioned ? -1 : 1
    }
    
    // Then sort by recommendation status if both have brand mentions
    if (a.brand_mentioned && b.brand_mentioned) {
      const aIsRecommendation = a.brand_mention_type === 'recommendation'
      const bIsRecommendation = b.brand_mention_type === 'recommendation'
      
      if (aIsRecommendation !== bIsRecommendation) {
        return aIsRecommendation ? -1 : 1
      }
    }
    
    // Finally sort by competitor mentioned as tiebreaker
    if (a.competitor_mentioned !== b.competitor_mentioned) {
      return a.competitor_mentioned ? -1 : 1
    }
    
    return 0
  }).slice(0, 10) // Limit to 10 entries
})

// Computed properties
const averageTechnicalSeoScore = computed(() => {
  if (!pageAnalyses.value || pageAnalyses.value.length === 0) return 0

  const total = pageAnalyses.value.reduce((sum, page) => {
    const score = page.technical_seo?.html_structure_score || 0
    return sum + score
  }, 0)

  return Math.round((total / pageAnalyses.value.length) * 10) / 10
})

const totalAnalyzedPages = computed(() => {
  return pageAnalyses.value.length
})

// Technical metrics breakdown
const technicalMetricsBreakdown = computed(() => {
  if (!pageAnalyses.value || pageAnalyses.value.length === 0) return []

  // Calculate average scores for different metrics
  const metrics = {
    schema: { total: 0, count: 0 },
    mobile: { total: 0, count: 0 },
    metaDesc: { total: 0, count: 0 },
    aria: { total: 0, count: 0 }
  }

  pageAnalyses.value.forEach(page => {
    if (!page.technical_seo) return

    // Schema markup (0 or 10)
    metrics.schema.total += page.technical_seo.schema_markup_present ? 10 : 0
    metrics.schema.count++

    // Mobile friendly (0 or 10)
    metrics.mobile.total += page.technical_seo.mobile_friendly ? 10 : 0
    metrics.mobile.count++

    // Meta description (0 or 10)
    metrics.metaDesc.total += page.technical_seo.meta_description_present ? 10 : 0
    metrics.metaDesc.count++

    // ARIA labels (0 or 10)
    metrics.aria.total += page.technical_seo.aria_labels_present ? 10 : 0
    metrics.aria.count++
  })

  return [
    {
      name: 'schema',
      label: 'Schema Markup',
      score: metrics.schema.count > 0 ? metrics.schema.total / metrics.schema.count : 0
    },
    {
      name: 'mobile',
      label: 'Mobile Friendly',
      score: metrics.mobile.count > 0 ? metrics.mobile.total / metrics.mobile.count : 0
    },
    {
      name: 'metaDesc',
      label: 'Meta Description',
      score: metrics.metaDesc.count > 0 ? metrics.metaDesc.total / metrics.metaDesc.count : 0
    },
    {
      name: 'aria',
      label: 'ARIA Accessibility',
      score: metrics.aria.count > 0 ? metrics.aria.total / metrics.aria.count : 0
    }
  ]
})

// Filtered pages based on score
const filteredPages = computed(() => {
  if (scoreFilter.value === 'all') {
    return pageAnalyses.value.slice(0, 10) // Limit to 10 entries
  }

  return pageAnalyses.value.filter(page => {
    const score = page.technical_seo?.html_structure_score || 0

    if (scoreFilter.value === 'high') {
      return score >= 8
    } else if (scoreFilter.value === 'medium') {
      return score >= 6 && score < 8
    } else if (scoreFilter.value === 'low') {
      return score < 6
    }

    return true
  }).slice(0, 10) // Limit to 10 entries
})

// Helper functions
const truncateUrl = (url) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    // Get the hostname and pathname, truncate if needed
    const displayUrl = urlObj.hostname + urlObj.pathname
    return displayUrl.length > 40 ? displayUrl.substring(0, 37) + '...' : displayUrl
  } catch (e) {
    return url.length > 40 ? url.substring(0, 37) + '...' : url
  }
}

const getScoreClass = (score) => {
  // Handle light and dark mode variants
  if (score >= 8) return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium'
  if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium'
  if (score >= 4) return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium'
  return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium'
}
</script>

<style scoped>
.testing-dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.data-table-section {
  margin: 3rem 0;
}

@media (max-width: 768px) {
  .testing-dashboard {
    padding: 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>