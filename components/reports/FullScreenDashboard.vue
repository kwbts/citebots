<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Main Dashboard Content -->
    <div class="h-full flex flex-col">
      <!-- Top Header Bar -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ getCurrentTabName() }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ getFilterSummary() }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Quick Stats -->
            <div class="flex items-center space-x-6">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">{{ totalQueries }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Queries</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ brandMentionRate }}%</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Brand Rate</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ avgCitations }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Avg Citations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
        <!-- Key Metrics Overview -->
        <div v-if="activeTab === 'overview'" class="space-y-8">
          <!-- Top Metrics Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard
              title="Total Queries"
              :value="totalQueries"
              icon="chart-bar"
              color="blue"
            />
            <MetricCard
              title="Brand Mention Rate"
              :value="`${brandMentionRate}%`"
              icon="trending-up"
              color="green"
            />
            <MetricCard
              title="Avg Citations"
              :value="avgCitations"
              icon="document-text"
              color="purple"
            />
            <MetricCard
              title="Content Quality"
              :value="`${contentQualityScore}/10`"
              icon="star"
              color="orange"
            />
          </div>

          <!-- Competitor Performance -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Top Competitors</h3>
            </div>
            <div class="space-y-4" v-if="topCompetitors.length > 0">
              <div v-for="competitor in topCompetitors" :key="competitor.name" class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-600/30 transition-colors duration-200">
                <span class="font-medium text-gray-900 dark:text-white">{{ competitor.name }}</span>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ competitor.count }} mentions</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/20">{{ competitor.percentage }}%</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <div class="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Competitor Data</h3>
              <p class="text-gray-600 dark:text-gray-400">Competitor mentions will appear here once analysis is complete</p>
            </div>
          </div>
        </div>

        <!-- Brand Performance Dashboard -->
        <BrandPerformanceDashboard v-else-if="activeTab === 'brand-performance'" :data="filteredData" :client="client" :competitors="competitors" />

        <!-- Query Analysis Dashboard -->
        <QueryAnalysisDashboard v-else-if="activeTab === 'query-analysis'" :data="filteredData" :client="client" />

        <!-- Technical SEO Dashboard -->
        <OnPageSEODashboard v-else-if="activeTab === 'technical-seo'" :data="filteredData" :client="client" />

        <!-- Page Analytics Dashboard -->
        <PageAnalyticsDashboard v-else-if="activeTab === 'page-analytics'" :data="filteredData" :client="client" />

        <!-- Competitor Comparison Dashboard -->
        <CompetitorComparisonDashboard v-else-if="activeTab === 'competitors'" :data="filteredData" :client="client" :competitors="competitors" />

        <!-- Raw Data View -->
        <RawDataView v-else-if="activeTab === 'raw-data'" :data="filteredData" :client="client" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import MetricCard from './MetricCard.vue'
import BrandPerformanceDashboard from './BrandPerformanceDashboard.vue'
import QueryAnalysisDashboard from './QueryAnalysisDashboard.vue'
import OnPageSEODashboard from './OnPageSEODashboard.vue'
import PageAnalyticsDashboard from './PageAnalyticsDashboard.vue'
import CompetitorComparisonDashboard from './CompetitorComparisonDashboard.vue'
import RawDataView from './RawDataView.vue'

const props = defineProps({
  data: { type: Object, required: true },
  client: { type: Object, required: true },
  activeTab: { type: String, default: 'overview' }
})

// Extract competitors from data prop
const competitors = computed(() => props.data?.competitors || [])

defineEmits(['close'])

// Dashboard state - initialize from props if provided
const activeTab = ref(props.activeTab || 'overview')
const activePlatforms = ref(['all', 'chatgpt', 'perplexity'])

// Watch for prop changes
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// Listen for navigation events from SidebarContextPanel
onMounted(() => {
  window.addEventListener('dashboard-tab-changed', (event) => {
    const newTab = event.detail.tab
    if (newTab !== activeTab.value) {
      activeTab.value = newTab
    }
  })
  
  window.addEventListener('platform-filter-changed', (event) => {
    activePlatforms.value = event.detail.platforms
  })
  
  window.addEventListener('export-report', () => {
    exportReport()
  })
  
  window.addEventListener('refresh-data', () => {
    refreshData()
  })
})

// Platform filter options
const platforms = [
  { label: 'All', value: 'all' },
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Perplexity', value: 'perplexity' }
]

// Initialize component
onMounted(() => {
  // Perform any necessary initialization
})

// Data filtering
const filteredData = computed(() => {
  if (!props.data) {
    return null
  }

  if (activePlatforms.value.includes('all')) {
    return props.data
  }

  const filteredQueries = props.data.analysis_queries?.filter(query =>
    activePlatforms.value.includes(query.data_source)
  ) || []

  console.log('FullScreenDashboard - Filtered queries:', filteredQueries.length)

  return {
    ...props.data,
    analysis_queries: filteredQueries
  }
})

// Helper functions
const getCurrentTabName = () => {
  const tabNames = {
    'overview': 'Overview',
    'brand-performance': 'Brand Performance',
    'query-analysis': 'Query Analysis',
    'technical-seo': 'Technical SEO',
    'page-analytics': 'Page Analytics',
    'competitors': 'Competitors',
    'raw-data': 'Raw Data'
  }
  return tabNames[activeTab.value] || 'Dashboard'
}

const getFilterSummary = () => {
  if (activePlatforms.value.includes('all')) {
    return `All platforms • ${totalQueries.value} queries`
  }
  const platformNames = activePlatforms.value.map(p => 
    platforms.find(platform => platform.value === p)?.label
  ).filter(Boolean).join(', ')
  return `${platformNames} • ${totalQueries.value} queries`
}

// Computed metrics
const totalQueries = computed(() => {
  return filteredData.value?.analysis_queries?.length || 0
})

const brandMentionRate = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  if (queries.length === 0) return 0
  const brandMentions = queries.filter(q => q.brand_mentioned === true).length
  return Math.round((brandMentions / queries.length) * 100)
})

const avgCitations = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  if (queries.length === 0) return 0
  const totalCitations = queries.reduce((sum, q) => sum + (q.total_citations || 0), 0)
  return Math.round((totalCitations / queries.length) * 10) / 10
})

const contentQualityScore = computed(() => {
  const pages = filteredData.value?.page_analyses || []
  if (pages.length === 0) return 0
  
  let totalScore = 0
  let scoreCount = 0
  
  pages.forEach(page => {
    if (page.content_quality_score) {
      totalScore += parseFloat(page.content_quality_score)
      scoreCount++
    }
  })
  
  return scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0
})

const topCompetitors = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  const competitorMentions = {}

  // Count mentions for each competitor
  queries.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(competitor => {
        if (!competitorMentions[competitor]) competitorMentions[competitor] = 0
        competitorMentions[competitor]++
      })
    }
  })

  // Convert to array and sort by mentions
  const competitors = Object.entries(competitorMentions)
    .map(([name, count]) => ({
      name,
      count,
      percentage: queries.length > 0 ? Math.round((count / queries.length) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4) // Top 4 competitors

  return competitors
})

// Action handlers
const exportReport = () => {
  // Implementation for export functionality
  console.log('Exporting report...')
}

const refreshData = () => {
  // Implementation for refresh functionality
  console.log('Refreshing data...')
}
</script>