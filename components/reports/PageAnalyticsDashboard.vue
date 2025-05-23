<template>
  <div class="space-y-6">
    <!-- Platform Filter -->
    <div v-if="availablePlatforms.length > 1" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by Platform</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="platform in availablePlatforms"
          :key="platform.value"
          @click="togglePlatform(platform.value)"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            selectedPlatforms.includes(platform.value)
              ? 'bg-citebots-orange text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ platform.label }}
        </button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pages Analyzed</h3>
            <div class="flex items-center gap-3">
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalPages }}</p>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ totalBrandPages }} brand pages</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Quality Score (Brand)</h3>
            <div class="flex items-center gap-3">
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ avgBrandQuality }}%</p>
              <div class="flex items-center gap-1 text-xs" :class="getComparisonIndicator(avgBrandQuality, avgCompetitorQuality).color">
                <span>{{ getComparisonIndicator(avgBrandQuality, avgCompetitorQuality).icon }}</span>
                <span>competitors: {{ avgCompetitorQuality }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Top Citation Position</h3>
            <div class="flex items-center gap-3">
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">#{{ topBrandPosition }}</p>
              <div class="text-xs text-gray-500 dark:text-gray-400">best brand page position</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Brand Citation Rate</h3>
            <div class="flex items-center gap-3">
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ brandCitationRate }}%</p>
              <div class="text-xs text-gray-500 dark:text-gray-400">of total citations</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Cited Pages Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Top Cited Pages by Domain</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pages with highest citation frequency across queries</p>
      </div>
      <div class="p-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Citations</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Position</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quality Score</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="page in topCitedPages" :key="page.url" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ page.domain }}</div>
                    <span v-if="page.isBrand" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      Brand
                    </span>
                    <span v-else-if="page.isCompetitor" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      Competitor
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ page.title }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ page.url }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ page.citationCount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{{ page.avgPosition }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="page.qualityScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                               page.qualityScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'">
                    {{ page.qualityScore }}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ page.contentType }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Content Quality Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quality Score Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Content Quality Distribution</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Distribution of quality scores across all pages</p>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="range in qualityDistribution" :key="range.range" class="flex items-center">
              <div class="w-20 text-sm text-gray-600 dark:text-gray-400">{{ range.range }}</div>
              <div class="flex-1 mx-3">
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                  <div class="bg-blue-500 dark:bg-blue-400 h-3 rounded-full" :style="{ width: `${range.percentage}%` }"></div>
                  <div v-if="range.brandPercentage > 0"
                       class="bg-orange-500 dark:bg-orange-400 h-3 rounded-full absolute top-0"
                       :style="{ width: `${range.brandPercentage}%` }"></div>
                </div>
              </div>
              <div class="w-16 text-sm text-gray-900 dark:text-white text-right">{{ range.count }}</div>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded"></div>
                <span>All Pages</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded"></div>
                <span>Brand Pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Intent Alignment -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Page Intent Alignment</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">How well pages match query intent</p>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="intent in intentAlignment" :key="intent.intent" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="text-sm text-gray-600 dark:text-gray-400 w-32">{{ intent.intent }}</div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-900 dark:text-white">{{ intent.avgScore }}%</div>
                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="h-2 rounded-full"
                       :class="intent.avgScore >= 80 ? 'bg-green-500 dark:bg-green-400' : intent.avgScore >= 60 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'"
                       :style="{ width: `${intent.avgScore}%` }"></div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 w-12">{{ intent.count }} pages</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Citation Position Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Citation Position Analysis</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Where your brand pages appear in citation lists</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Position Distribution -->
          <div class="col-span-2">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Position Distribution</h4>
            <div class="space-y-3">
              <div v-for="position in positionDistribution" :key="position.position" class="flex items-center">
                <div class="w-16 text-sm text-gray-600 dark:text-gray-400">{{ position.position }}</div>
                <div class="flex-1 mx-3">
                  <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                    <div class="bg-gradient-to-r from-green-500 to-yellow-500 dark:from-green-400 dark:to-yellow-400 h-3 rounded-full"
                         :style="{ width: `${position.percentage}%` }"></div>
                  </div>
                </div>
                <div class="w-12 text-sm text-gray-900 dark:text-white text-right">{{ position.count }}</div>
              </div>
            </div>
          </div>

          <!-- Position Stats -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Position Statistics</h4>
            <div class="space-y-4">
              <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">#{{ bestPosition }}</div>
                <div class="text-sm text-green-600 dark:text-green-400">Best Position</div>
              </div>
              <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">#{{ avgPosition }}</div>
                <div class="text-sm text-blue-600 dark:text-blue-400">Average Position</div>
              </div>
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ topThreeCount }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Top 3 Citations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Format Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Content Format Performance</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Which content formats get cited most frequently</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="format in contentFormats" :key="format.type" class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 mb-3">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none" class="text-gray-200 dark:text-gray-700"/>
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"
                        :class="format.percentage >= 25 ? 'text-green-500 dark:text-green-400' : format.percentage >= 15 ? 'text-yellow-500 dark:text-yellow-400' : 'text-blue-500 dark:text-blue-400'"
                        :stroke-dasharray="`${format.percentage * 2.51327} 251.327`"
                        stroke-linecap="round"/>
              </svg>
              <span class="absolute text-sm font-semibold text-gray-900 dark:text-white">{{ format.percentage }}%</span>
            </div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ format.type }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ format.count }} pages</div>
            <div class="text-xs mt-1" :class="getComparisonIndicator(format.brandPercentage, format.percentage).color">
              {{ getComparisonIndicator(format.brandPercentage, format.percentage).icon }} brand: {{ format.brandPercentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="!hasData" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No page analysis data available</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ filteredData.length === 0 ? 'No queries match the current filters.' : 'Page analysis data is not available for the selected queries.' }}
      </p>
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
  },
  competitors: {
    type: Array,
    default: () => []
  }
})

// Available platforms for filtering
const availablePlatforms = computed(() => {
  const platforms = new Set()
  if (props.data?.analysis_queries) {
    props.data.analysis_queries.forEach(query => {
      const platform = (query.platform || query.data_source || '').toLowerCase()
      if (platform) platforms.add(platform)
    })
  }
  return Array.from(platforms).map(platform => ({
    value: platform,
    label: platform.charAt(0).toUpperCase() + platform.slice(1)
  }))
})

// Selected platforms for filtering
const selectedPlatforms = ref([])

// Platform toggle function
const togglePlatform = (platform) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
}

// Filter data based on selected platforms
const filteredData = computed(() => {
  if (!props.data?.analysis_queries) return []
  if (selectedPlatforms.value.length === 0) return props.data.analysis_queries
  return props.data.analysis_queries.filter(item => {
    const platform = (item.platform || item.data_source || '').toLowerCase()
    return platform && selectedPlatforms.value.includes(platform)
  })
})

// Extract all page analyses
const pageAnalyses = computed(() => {
  // First try direct page_analyses from the data structure
  let analyses = props.data?.page_analyses || []

  // If no direct page_analyses, extract from associated_pages in queries
  if (analyses.length === 0 && props.data?.analysis_queries) {
    analyses = []
    filteredData.value.forEach(query => {
      if (query.associated_pages && Array.isArray(query.associated_pages)) {
        const processedAnalyses = query.associated_pages.map(analysis => ({
          ...analysis,
          url: analysis.url || analysis.citation_url,
          query_text: query.query_text,
          query_intent: query.query_intent,
          query_id: query.id
        }))
        analyses.push(...processedAnalyses)
      }
    })
  } else if (analyses.length > 0) {
    // Filter existing page_analyses by selected platforms if any
    if (selectedPlatforms.value.length > 0) {
      const filteredQueryIds = new Set(filteredData.value.map(q => q.id))
      analyses = analyses.filter(analysis => filteredQueryIds.has(analysis.query_id))
    }

    // Add query context to page analyses
    analyses = analyses.map(analysis => {
      const query = props.data.analysis_queries?.find(q => q.id === analysis.query_id)
      return {
        ...analysis,
        url: analysis.url || analysis.citation_url,
        query_text: query?.query_text || analysis.query_text,
        query_intent: query?.query_intent || analysis.query_intent
      }
    })
  }

  return analyses
})

// Filter brand and competitor pages
const brandPages = computed(() => {
  return pageAnalyses.value.filter(page => 
    page.brand_mentioned === true || 
    page.is_client_domain === true ||
    (page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain))
  )
})

const competitorPages = computed(() => {
  return pageAnalyses.value.filter(page => 
    page.competitor_mentioned === true || 
    page.is_competitor_domain === true
  )
})

const hasData = computed(() => filteredData.value.length > 0 && pageAnalyses.value.length > 0)

// Basic metrics
const totalPages = computed(() => pageAnalyses.value.length)
const totalBrandPages = computed(() => brandPages.value.length)

// Helper function for comparisons
const getComparisonIndicator = (current, average) => {
  if (current > average) {
    return { trend: 'up', color: 'text-green-600', icon: '↗️' }
  } else if (current < average) {
    return { trend: 'down', color: 'text-red-600', icon: '↘️' }
  } else {
    return { trend: 'equal', color: 'text-gray-600', icon: '→' }
  }
}

// Quality score calculations
const avgBrandQuality = computed(() => {
  if (!brandPages.value.length) return 0
  const scores = brandPages.value
    .map(page => Number(page.content_quality_score || page.relevance_score || 0))
    .filter(score => score > 0)
  
  if (!scores.length) return 0
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 20) // Scale to 100
})

const avgCompetitorQuality = computed(() => {
  if (!competitorPages.value.length) return 0
  const scores = competitorPages.value
    .map(page => Number(page.content_quality_score || page.relevance_score || 0))
    .filter(score => score > 0)
  
  if (!scores.length) return 0
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 20) // Scale to 100
})

// Citation position analysis
const topBrandPosition = computed(() => {
  if (!brandPages.value.length) return '-'
  const positions = brandPages.value
    .map(page => page.citation_position)
    .filter(pos => pos && pos > 0)
  
  return positions.length ? Math.min(...positions) : '-'
})

const brandCitationRate = computed(() => {
  if (!pageAnalyses.value.length) return 0
  return Math.round((brandPages.value.length / pageAnalyses.value.length) * 100)
})

// Top cited pages
const topCitedPages = computed(() => {
  const pageMap = new Map()
  
  pageAnalyses.value.forEach(page => {
    const url = page.citation_url
    if (!pageMap.has(url)) {
      pageMap.set(url, {
        url,
        domain: page.domain_name || new URL(url).hostname,
        title: page.page_title || 'Untitled',
        citationCount: 0,
        positions: [],
        qualityScore: Number(page.content_quality_score || page.relevance_score || 0) * 20,
        contentType: page.on_page_seo?.content_type || 'Unknown',
        isBrand: page.brand_mentioned || page.is_client_domain,
        isCompetitor: page.competitor_mentioned || page.is_competitor_domain
      })
    }
    
    const pageData = pageMap.get(url)
    pageData.citationCount++
    if (page.citation_position) {
      pageData.positions.push(page.citation_position)
    }
  })
  
  return Array.from(pageMap.values())
    .map(page => ({
      ...page,
      avgPosition: page.positions.length ? Math.round(page.positions.reduce((sum, pos) => sum + pos, 0) / page.positions.length) : '-'
    }))
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 10)
})

// Quality distribution
const qualityDistribution = computed(() => {
  const ranges = [
    { range: '90-100%', min: 90, max: 100 },
    { range: '80-89%', min: 80, max: 89 },
    { range: '70-79%', min: 70, max: 79 },
    { range: '60-69%', min: 60, max: 69 },
    { range: 'Below 60%', min: 0, max: 59 }
  ]
  
  return ranges.map(range => {
    const allPages = pageAnalyses.value.filter(page => {
      const score = Number(page.content_quality_score || page.relevance_score || 0) * 20
      return score >= range.min && score <= range.max
    })
    
    const brandPagesInRange = brandPages.value.filter(page => {
      const score = Number(page.content_quality_score || page.relevance_score || 0) * 20
      return score >= range.min && score <= range.max
    })
    
    return {
      range: range.range,
      count: allPages.length,
      percentage: totalPages.value > 0 ? Math.round((allPages.length / totalPages.value) * 100) : 0,
      brandPercentage: totalPages.value > 0 ? Math.round((brandPagesInRange.length / totalPages.value) * 100) : 0
    }
  })
})

// Intent alignment
const intentAlignment = computed(() => {
  const intentMap = new Map()
  
  pageAnalyses.value.forEach(page => {
    // Get intent from query data, falling back to page data or 'Unknown'
    const query = props.data?.analysis_queries?.find(q => q.id === page.query_id)
    const intent = query?.query_intent || page.query_intent || 'Unknown'
    if (!intentMap.has(intent)) {
      intentMap.set(intent, { scores: [], count: 0 })
    }
    
    const data = intentMap.get(intent)
    data.count++
    const score = Number(page.content_quality_score || page.relevance_score || 0) * 20
    if (score > 0) {
      data.scores.push(score)
    }
  })
  
  return Array.from(intentMap.entries()).map(([intent, data]) => ({
    intent,
    count: data.count,
    avgScore: data.scores.length ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length) : 0
  })).sort((a, b) => b.count - a.count)
})

// Position distribution for brand pages
const positionDistribution = computed(() => {
  const positions = brandPages.value
    .map(page => page.citation_position)
    .filter(pos => pos && pos > 0)
  
  if (!positions.length) return []
  
  const ranges = [
    { position: '1st', values: [1] },
    { position: '2nd-3rd', values: [2, 3] },
    { position: '4th-5th', values: [4, 5] },
    { position: '6th+', values: Array.from({length: 15}, (_, i) => i + 6) }
  ]
  
  return ranges.map(range => {
    const count = positions.filter(pos => range.values.includes(pos)).length
    return {
      position: range.position,
      count,
      percentage: positions.length > 0 ? Math.round((count / positions.length) * 100) : 0
    }
  })
})

// Position statistics
const bestPosition = computed(() => {
  const positions = brandPages.value
    .map(page => page.citation_position)
    .filter(pos => pos && pos > 0)
  
  return positions.length ? Math.min(...positions) : '-'
})

const avgPosition = computed(() => {
  const positions = brandPages.value
    .map(page => page.citation_position)
    .filter(pos => pos && pos > 0)
  
  return positions.length ? Math.round(positions.reduce((sum, pos) => sum + pos, 0) / positions.length) : '-'
})

const topThreeCount = computed(() => {
  return brandPages.value.filter(page => page.citation_position && page.citation_position <= 3).length
})

// Content format analysis
const contentFormats = computed(() => {
  const formatMap = new Map()
  
  pageAnalyses.value.forEach(page => {
    const format = page.on_page_seo?.content_type || 'Unknown'
    if (!formatMap.has(format)) {
      formatMap.set(format, { total: 0, brand: 0 })
    }
    
    const data = formatMap.get(format)
    data.total++
    if (page.brand_mentioned || page.is_client_domain) {
      data.brand++
    }
  })
  
  return Array.from(formatMap.entries()).map(([type, data]) => ({
    type,
    count: data.total,
    percentage: totalPages.value > 0 ? Math.round((data.total / totalPages.value) * 100) : 0,
    brandPercentage: data.total > 0 ? Math.round((data.brand / data.total) * 100) : 0
  })).sort((a, b) => b.count - a.count)
})
</script>