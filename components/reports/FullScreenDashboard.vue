<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Main Dashboard Content -->
    <div class="h-full flex flex-col">
      <!-- Top Header Bar -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ getCurrentTabName() }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ getFilterSummary() }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <!-- Sun icon (show when in dark mode) -->
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Moon icon (show when in light mode) -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

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
        <!-- Key Metrics Overview -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Top Metrics Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Competitors</h3>
            <div class="space-y-3">
              <div v-for="competitor in topCompetitors" :key="competitor.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span class="font-medium text-gray-900 dark:text-white">{{ competitor.name }}</span>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ competitor.count }} mentions</span>
                  <span class="px-2 py-1 bg-citebots-orange text-white text-xs rounded-full">{{ competitor.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Brand Performance Dashboard -->
        <BrandPerformanceDashboard v-else-if="activeTab === 'brand-performance'" :data="filteredData" />

        <!-- Query Analysis Dashboard -->
        <QueryAnalysisDashboard v-else-if="activeTab === 'query-analysis'" :data="filteredData" />

        <!-- Technical SEO Dashboard -->
        <OnPageSEODashboard v-else-if="activeTab === 'technical-seo'" :data="filteredData" />

        <!-- Page Analytics Dashboard -->
        <PageAnalyticsDashboard v-else-if="activeTab === 'page-analytics'" :data="filteredData" />

        <!-- Competitor Comparison Dashboard -->
        <CompetitorComparisonDashboard v-else-if="activeTab === 'competitors'" :data="filteredData" />

        <!-- Raw Data View -->
        <RawDataView v-else-if="activeTab === 'raw-data'" :data="filteredData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import MetricCard from './MetricCard.vue'
import BrandPerformanceDashboard from './BrandPerformanceDashboard.vue'
import QueryAnalysisDashboard from './QueryAnalysisDashboard.vue'
import OnPageSEODashboard from './OnPageSEODashboard.vue'
import PageAnalyticsDashboard from './PageAnalyticsDashboard.vue'
import CompetitorComparisonDashboard from './CompetitorComparisonDashboard.vue'
import RawDataView from './RawDataView.vue'

const props = defineProps({
  data: { type: Object, required: true },
  client: { type: Object, required: true }
})

defineEmits(['close'])

// Dark mode functionality
const { isDark, toggle } = useDarkMode()
const toggleDarkMode = () => toggle()

// Dashboard state
const activeTab = ref('overview')
const activePlatforms = ref(['all', 'chatgpt', 'perplexity'])

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

// Data filtering
const filteredData = computed(() => {
  if (!props.data) return null
  
  if (activePlatforms.value.includes('all')) {
    return props.data
  }
  
  const filteredQueries = props.data.analysis_queries?.filter(query => 
    activePlatforms.value.includes(query.data_source)
  ) || []
  
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