<template>
  <div class="h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex">
    <!-- Left Sidebar -->
    <div class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg">
      <!-- Sidebar Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-citebots-orange rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 dark:text-white">{{ client.name }}</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">Analytics Dashboard</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Dashboard Controls -->
        <div class="space-y-4">
          <!-- LLM Platform Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Filter</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="platform in platforms" 
                :key="platform.value"
                @click="togglePlatform(platform.value)" 
                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="activePlatforms.includes(platform.value)
                  ? 'bg-citebots-orange text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              >
                {{ platform.label }}
              </button>
            </div>
          </div>
          
          
          <!-- View Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Focus</label>
            <select v-model="viewType" class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-citebots-orange focus:border-transparent">
              <option value="all">Complete Analysis</option>
              <option value="brand">Brand Performance</option>
              <option value="competitor">Competitive Analysis</option>
              <option value="technical">Technical SEO</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="flex-1 p-4 overflow-y-auto">
        <nav class="space-y-2">
          <button
            v-for="tab in dashboardTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3',
              activeTab === tab.id
                ? 'bg-citebots-orange text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            <span>{{ tab.name }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Quick Actions -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="space-y-2">
          <button class="w-full bg-citebots-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Export Report</span>
          </button>
          <button class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header Bar -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div class="flex items-center justify-between">
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
        <!-- Key Metrics Overview -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Top Metrics Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Queries"
              :value="totalQueries"
              icon="chart-bar"
              color="blue"
              suffix=" analyzed"
            />
            <MetricCard
              title="Brand Mention Rate"
              :value="brandMentionRate"
              suffix="%"
              icon="trending-up"
              color="green"
              :subtitle="`${totalBrandMentions} mentions`"
            />
            <MetricCard
              title="Citation Rate"
              :value="citationMentionRate"
              suffix="%"
              icon="link"
              color="purple"
              :subtitle="`${totalPagesAnalyzed} pages`"
            />
            <MetricCard
              title="Competitive Win Rate"
              :value="competitiveWinRate"
              suffix="%"
              icon="star"
              color="orange"
              subtitle="vs competitors"
            />
          </div>

          <!-- Main Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Primary Trend Chart -->
            <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Mention Trends</h3>
                <div class="flex space-x-2">
                  <button 
                    v-for="metric in trendMetrics"
                    :key="metric.value"
                    @click="activeTrendMetric = metric.value"
                    :class="[
                      'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                      activeTrendMetric === metric.value 
                        ? 'bg-citebots-orange text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    ]"
                  >
                    {{ metric.label }}
                  </button>
                </div>
              </div>
              <div class="h-80">
                <canvas ref="mainTrendChart"></canvas>
              </div>
            </div>

            <!-- Side Analytics -->
            <div class="space-y-6">
              <!-- Platform Performance -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">Platform Performance</h4>
                <div class="space-y-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ chatgptScore }}%</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">ChatGPT</div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" :style="`width: ${chatgptScore}%`"></div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ perplexityScore }}%</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Perplexity</div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div class="bg-purple-600 h-2 rounded-full transition-all duration-500" :style="`width: ${perplexityScore}%`"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Query Types -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">Query Distribution</h4>
                <div class="h-48">
                  <canvas ref="queryTypeChart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Competitive Analysis -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">vs Top Competitors</h4>
              <div class="space-y-3">
                <div v-for="competitor in topCompetitors" :key="competitor.name" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ competitor.name }}</span>
                  <div class="flex items-center space-x-3">
                    <div class="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div class="bg-citebots-orange h-2 rounded-full transition-all duration-500" :style="`width: ${competitor.percentage}%`"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">{{ competitor.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h4>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-citebots-orange rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 dark:text-white">{{ activity.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ activity.time }}</p>
                  </div>
                  <span 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    :class="getActivityClass(activity.type)"
                  >
                    {{ activity.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Individual Dashboard Components -->
        <BrandPerformanceDashboard
          v-else-if="activeTab === 'brand-performance'"
          :data="filteredData"
          :client="client"
        />

        <QueryAnalysisDashboard
          v-else-if="activeTab === 'query-analysis'"
          :data="filteredData"
          :client="client"
        />

        <OnPageSEODashboard
          v-else-if="activeTab === 'onpage-seo'"
          :data="filteredData"
          :client="client"
        />

        <PageAnalyticsDashboard
          v-else-if="activeTab === 'page-analytics'"
          :data="filteredData"
          :client="client"
        />

        <CompetitorComparisonDashboard
          v-else-if="activeTab === 'competitor-comparison'"
          :data="filteredData"
          :client="client"
        />

        <RawDataView
          v-else-if="activeTab === 'raw-data'"
          :data="filteredData"
          :analysis-run="filteredData?.analysis_run"
          :client="client"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch, h } from 'vue'
import Chart from 'chart.js/auto'
import AnimatedNumber from './utils/AnimatedNumber.vue'
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

// Dashboard State
const activeTab = ref('overview')
const activePlatforms = ref(['chatgpt', 'perplexity'])
const viewType = ref('all')
const activeTrendMetric = ref('mentions')

// Chart references
const mainTrendChart = ref(null)
const queryTypeChart = ref(null)

// Platform configuration
const platforms = ref([
  { label: 'All', value: 'all' },
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Perplexity', value: 'perplexity' }
])

// Dashboard tabs configuration
const dashboardTabs = ref([
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
    ])
  },
  { 
    id: 'brand-performance', 
    name: 'Brand Performance',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })
    ])
  },
  { 
    id: 'query-analysis', 
    name: 'Query Analysis',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
    ])
  },
  { 
    id: 'onpage-seo', 
    name: 'Technical SEO',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  },
  { 
    id: 'page-analytics', 
    name: 'Page Analytics',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
    ])
  },
  {
    id: 'competitor-comparison',
    name: 'Competitors',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ])
  },
  {
    id: 'raw-data',
    name: 'Raw Data',
    icon: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 13h6' })
    ])
  }
])

const trendMetrics = ref([
  { label: 'Mentions', value: 'mentions' },
  { label: 'Citations', value: 'citations' },
  { label: 'Quality', value: 'quality' }
])

// Computed properties for metrics
const filteredData = computed(() => {
  if (!props.data) return null
  
  let queries = props.data.analysis_queries || []
  
  // Filter by platforms
  if (!activePlatforms.value.includes('all')) {
    queries = queries.filter(q => activePlatforms.value.includes(q.data_source))
  }
  
  return {
    ...props.data,
    analysis_queries: queries
  }
})

const totalQueries = computed(() => filteredData.value?.analysis_queries?.length || 0)

const brandMentionRate = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  if (queries.length === 0) return 0
  const brandMentions = queries.filter(q => q.brand_mentioned === true).length
  return Math.round((brandMentions / queries.length) * 100)
})

const avgCitations = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  if (queries.length === 0) return 0
  const totalCitations = queries.reduce((sum, q) => sum + (q.citation_count || 0), 0)
  return Math.round((totalCitations / queries.length) * 10) / 10
})

const contentQualityScore = computed(() => {
  const pages = filteredData.value?.page_analyses || []
  if (pages.length === 0) return 0

  let totalScore = 0
  let scoreCount = 0

  pages.forEach(page => {
    if (page.content_quality?.overall_score) {
      totalScore += page.content_quality.overall_score
      scoreCount++
    }
  })

  return scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0
})

const citationMentionRate = computed(() => {
  const pages = filteredData.value?.page_analyses || []
  if (pages.length === 0) return 0

  const clientPages = pages.filter(page => page.is_client_domain === true).length
  return Math.round((clientPages / pages.length) * 100)
})

const totalBrandMentions = computed(() =>
  filteredData.value?.analysis_queries?.filter(q => q.brand_mentioned === true).length || 0
)

const avgBrandSentiment = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  const brandQueries = queries.filter(q => q.brand_mentioned === true && q.brand_sentiment !== null)

  if (brandQueries.length === 0) return 0

  const totalSentiment = brandQueries.reduce((sum, q) => sum + (q.brand_sentiment || 0), 0)
  return Math.round((totalSentiment / brandQueries.length) * 100) / 100
})

const competitiveWinRate = computed(() => {
  const queries = filteredData.value?.analysis_queries || []

  const brandOnlyQueries = queries.filter(q =>
    q.brand_mentioned === true && (q.competitor_count || 0) === 0
  ).length

  const competitorOnlyQueries = queries.filter(q =>
    q.brand_mentioned !== true && (q.competitor_count || 0) > 0
  ).length

  const totalCompetitive = brandOnlyQueries + competitorOnlyQueries

  return totalCompetitive > 0 ? Math.round((brandOnlyQueries / totalCompetitive) * 100) : 0
})

const totalPagesAnalyzed = computed(() =>
  filteredData.value?.page_analyses?.length || 0
)

const queryCompetitionDistribution = computed(() => {
  const queries = filteredData.value?.analysis_queries || []
  const distribution = {}

  queries.forEach(query => {
    const competition = query.query_competition || 'unknown'
    if (!distribution[competition]) distribution[competition] = 0
    distribution[competition]++
  })

  return distribution
})

const chatgptScore = computed(() => {
  const chatgptQueries = filteredData.value?.analysis_queries?.filter(q => q.data_source === 'chatgpt') || []
  if (chatgptQueries.length === 0) return 0
  const brandMentions = chatgptQueries.filter(q => q.brand_mentioned === true).length
  return Math.round((brandMentions / chatgptQueries.length) * 100)
})

const perplexityScore = computed(() => {
  const perplexityQueries = filteredData.value?.analysis_queries?.filter(q => q.data_source === 'perplexity') || []
  if (perplexityQueries.length === 0) return 0
  const brandMentions = perplexityQueries.filter(q => q.brand_mentioned === true).length
  return Math.round((brandMentions / perplexityQueries.length) * 100)
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

const recentActivity = computed(() => {
  const analysisRun = filteredData.value?.analysis_run
  const queries = filteredData.value?.analysis_queries || []
  const pages = filteredData.value?.page_analyses || []

  const activities = []

  if (analysisRun) {
    activities.push({
      id: 1,
      title: `Analysis completed for ${queries.length} queries`,
      time: new Date(analysisRun.created_at).toLocaleDateString(),
      type: 'neutral',
      label: 'Done'
    })
  }

  if (brandMentionRate.value > 0) {
    activities.push({
      id: 2,
      title: `Brand mentioned in ${brandMentionRate.value}% of queries`,
      time: new Date(analysisRun?.created_at || Date.now()).toLocaleDateString(),
      type: brandMentionRate.value > 50 ? 'positive' : 'neutral',
      label: `${brandMentionRate.value}%`
    })
  }

  if (pages.length > 0) {
    activities.push({
      id: 3,
      title: `${pages.length} pages analyzed for SEO performance`,
      time: new Date(analysisRun?.created_at || Date.now()).toLocaleDateString(),
      type: 'neutral',
      label: `${pages.length}`
    })
  }

  if (competitiveWinRate.value > 0) {
    activities.push({
      id: 4,
      title: `${competitiveWinRate.value}% competitive win rate achieved`,
      time: new Date(analysisRun?.created_at || Date.now()).toLocaleDateString(),
      type: competitiveWinRate.value > 70 ? 'positive' : competitiveWinRate.value > 30 ? 'neutral' : 'negative',
      label: `${competitiveWinRate.value}%`
    })
  }

  if (topCompetitors.value.length > 0) {
    const topCompetitor = topCompetitors.value[0]
    activities.push({
      id: 5,
      title: `${topCompetitor.name} mentioned in ${topCompetitor.percentage}% of queries`,
      time: new Date(analysisRun?.created_at || Date.now()).toLocaleDateString(),
      type: 'neutral',
      label: `${topCompetitor.percentage}%`
    })
  }

  return activities.slice(0, 5)
})

// Helper functions
const togglePlatform = (platform) => {
  if (platform === 'all') {
    activePlatforms.value = ['all']
  } else {
    activePlatforms.value = activePlatforms.value.filter(p => p !== 'all')
    
    if (activePlatforms.value.includes(platform)) {
      activePlatforms.value = activePlatforms.value.filter(p => p !== platform)
    } else {
      activePlatforms.value.push(platform)
    }
    
    if (activePlatforms.value.length === 0) {
      activePlatforms.value = ['all']
    }
  }
}

const getCurrentTabName = () => {
  const tab = dashboardTabs.value.find(t => t.id === activeTab.value)
  return tab?.name || 'Dashboard'
}

const getFilterSummary = () => {
  const platformText = activePlatforms.value.includes('all') ? 'All Platforms' : activePlatforms.value.join(', ')
  return `${platformText} • ${totalQueries.value} queries analyzed`
}

const getActivityClass = (type) => {
  switch (type) {
    case 'positive':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'negative':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

// Metric Card Component
const MetricCard = (props) => {
  return h('div', {
    class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'
  }, [
    h('div', { class: 'flex items-center justify-between' }, [
      h('div', {}, [
        h('p', { class: 'text-sm font-medium text-gray-500 dark:text-gray-400' }, props.title),
        h('div', { class: 'flex items-baseline space-x-2' }, [
          h(AnimatedNumber, {
            value: props.value,
            suffix: props.suffix || '',
            decimals: props.decimals || 0,
            class: `text-2xl font-bold text-${props.color}-600 dark:text-${props.color}-400`
          }),
          props.trend && h('span', {
            class: `text-sm font-medium ${props.trend > 0 ? 'text-green-600' : 'text-red-600'}`
          }, `${props.trend > 0 ? '+' : ''}${props.trend}%`)
        ]),
        props.subtitle && h('p', {
          class: 'text-xs text-gray-400 dark:text-gray-500 mt-1'
        }, props.subtitle)
      ]),
      h('div', {
        class: `p-3 bg-${props.color}-100 dark:bg-${props.color}-900 rounded-lg`
      }, [
        // Icon placeholder - in real implementation would use proper icons
        h('div', { class: `w-6 h-6 text-${props.color}-600 dark:text-${props.color}-300` })
      ])
    ])
  ])
}

// Chart creation functions
const createMainTrendChart = () => {
  if (!mainTrendChart.value) return
  
  const ctx = mainTrendChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Brand Mentions (%)',
          data: [45, 52, 48, 61, 65, brandMentionRate.value],
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  })
}

const createQueryTypeChart = () => {
  if (!queryTypeChart.value) return
  
  const ctx = queryTypeChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Informational', 'Commercial', 'Navigational', 'Transactional'],
      datasets: [{
        data: [45, 30, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

// Initialize charts
onMounted(async () => {
  await nextTick()
  if (activeTab.value === 'overview') {
    createMainTrendChart()
    createQueryTypeChart()
  }
})

// Watch for tab changes and recreate charts
watch(activeTab, async (newTab) => {
  if (newTab === 'overview') {
    await nextTick()
    createMainTrendChart()
    createQueryTypeChart()
  }
})
</script>