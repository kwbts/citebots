<template>
  <div class="space-y-8">

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Total Queries</p>
          <AnimatedNumber :value="totalQueries" class="text-4xl font-bold text-gray-900 dark:text-white" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Brand Mention Rate</p>
          <div class="flex items-baseline gap-4">
            <AnimatedNumber :value="brandMentionRate" suffix="%" class="text-4xl font-bold text-green-600 dark:text-green-400" />
            <span class="text-lg text-gray-500 dark:text-gray-400">
              ({{ brandMentionCount }}/{{ totalQueries }})
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Avg Citations per Query</p>
          <AnimatedNumber :value="avgCitationCount" :decimals="1" class="text-4xl font-bold text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Competitive Advantage</p>
          <AnimatedNumber :value="competitiveAdvantageRate" suffix="%" class="text-4xl font-bold text-orange-600 dark:text-orange-400" />
        </div>
      </div>
    </div>

    <!-- Query Type vs Brand Mention Success -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Mention Success by Query Type</h3>
      </div>
      <div class="h-80">
        <canvas ref="queryTypeChart"></canvas>
      </div>
    </div>

    <!-- Query Intent Performance Breakdown -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Performance by Query Intent</h3>
      </div>
      <div class="h-80">
        <canvas ref="queryIntentChart"></canvas>
      </div>
    </div>

    <!-- Citation Count Distribution -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Citation Count Distribution</h3>
      </div>
      <div class="h-80">
        <canvas ref="citationDistributionChart"></canvas>
      </div>
    </div>

    <!-- Funnel Stage Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Performance by Funnel Stage</h3>
      </div>
      <div class="h-80">
        <canvas ref="funnelStageChart"></canvas>
      </div>
    </div>

    <!-- Competitive Context Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Competitive Context Analysis</h3>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6">
          <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Query Competition Distribution</h4>
          <div class="h-64">
            <canvas ref="competitionChart"></canvas>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6">
          <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Competitor Context</h4>
          <div class="h-64">
            <canvas ref="competitorContextChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Match Quality -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Response Match Quality</h3>
      </div>
      <div class="space-y-6">
        <div v-for="match in responseMatchData" :key="match.type" class="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
          <div>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ match.type }}</span>
            <span class="text-base text-gray-500 dark:text-gray-400 ml-3">({{ match.count }} queries)</span>
          </div>
          <div class="flex items-center space-x-6">
            <div class="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" :style="`width: ${match.percentage}%`"></div>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white min-w-[60px] text-right">{{ match.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import Chart from 'chart.js/auto'
import TextBox from './TextBox.vue'
import AnimatedNumber from './utils/AnimatedNumber.vue'

const props = defineProps({
  data: { type: Object, required: true },
  client: { type: Object, required: true }
})

// Platform management
const platforms = ref([
  { label: 'All Platforms', value: 'all' },
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Perplexity', value: 'perplexity' }
])
const activePlatform = ref('all')

// Chart references
const queryTypeChart = ref(null)
const queryIntentChart = ref(null)
const citationDistributionChart = ref(null)
const funnelStageChart = ref(null)
const competitionChart = ref(null)
const competitorContextChart = ref(null)

// Filter data by active platform
const filteredQueries = computed(() => {
  if (!props.data?.analysis_queries) return []
  
  const queries = props.data.analysis_queries
  if (activePlatform.value === 'all') return queries
  
  return queries.filter(query => query.data_source === activePlatform.value)
})

// Key metrics computations
const totalQueries = computed(() => filteredQueries.value.length)

const brandMentionCount = computed(() => 
  filteredQueries.value.filter(q => q.brand_mentioned === true).length
)

const brandMentionRate = computed(() => 
  totalQueries.value > 0 ? Math.round((brandMentionCount.value / totalQueries.value) * 100) : 0
)

const avgCitationCount = computed(() => {
  if (totalQueries.value === 0) return 0
  const totalCitations = filteredQueries.value.reduce((sum, q) => sum + (q.citation_count || 0), 0)
  return Math.round((totalCitations / totalQueries.value) * 10) / 10
})

const competitiveAdvantageRate = computed(() => {
  const advantageQueries = filteredQueries.value.filter(q => 
    q.query_competition === 'defending' || q.query_competition === 'opportunity'
  ).length
  return totalQueries.value > 0 ? Math.round((advantageQueries / totalQueries.value) * 100) : 0
})

// Query type analysis
const queryTypeData = computed(() => {
  const typeGroups = {}
  filteredQueries.value.forEach(query => {
    const type = query.query_type || 'unknown'
    if (!typeGroups[type]) {
      typeGroups[type] = { total: 0, brandMentioned: 0 }
    }
    typeGroups[type].total++
    if (query.brand_mentioned) {
      typeGroups[type].brandMentioned++
    }
  })
  
  return Object.entries(typeGroups).map(([type, data]) => ({
    type,
    total: data.total,
    brandMentioned: data.brandMentioned,
    mentionRate: data.total > 0 ? Math.round((data.brandMentioned / data.total) * 100) : 0
  }))
})

// Query intent analysis
const queryIntentData = computed(() => {
  const intentGroups = {}
  filteredQueries.value.forEach(query => {
    const intent = query.query_intent || 'unknown'
    if (!intentGroups[intent]) {
      intentGroups[intent] = { total: 0, brandMentioned: 0 }
    }
    intentGroups[intent].total++
    if (query.brand_mentioned) {
      intentGroups[intent].brandMentioned++
    }
  })
  
  return Object.entries(intentGroups).map(([intent, data]) => ({
    intent,
    total: data.total,
    brandMentioned: data.brandMentioned,
    mentionRate: data.total > 0 ? Math.round((data.brandMentioned / data.total) * 100) : 0
  }))
})

// Citation distribution
const citationDistributionData = computed(() => {
  const distribution = {}
  filteredQueries.value.forEach(query => {
    const citations = query.citation_count || 0
    const bucket = citations === 0 ? '0' : 
                  citations <= 2 ? '1-2' :
                  citations <= 5 ? '3-5' :
                  citations <= 10 ? '6-10' : '10+'
    
    if (!distribution[bucket]) distribution[bucket] = 0
    distribution[bucket]++
  })
  
  return Object.entries(distribution).map(([bucket, count]) => ({
    bucket,
    count,
    percentage: totalQueries.value > 0 ? Math.round((count / totalQueries.value) * 100) : 0
  }))
})

// Funnel stage analysis
const funnelStageData = computed(() => {
  const stageGroups = {}
  filteredQueries.value.forEach(query => {
    const stage = query.funnel_stage || 'unknown'
    if (!stageGroups[stage]) {
      stageGroups[stage] = { total: 0, brandMentioned: 0 }
    }
    stageGroups[stage].total++
    if (query.brand_mentioned) {
      stageGroups[stage].brandMentioned++
    }
  })
  
  return Object.entries(stageGroups).map(([stage, data]) => ({
    stage,
    total: data.total,
    brandMentioned: data.brandMentioned,
    mentionRate: data.total > 0 ? Math.round((data.brandMentioned / data.total) * 100) : 0
  }))
})

// Competition analysis
const competitionData = computed(() => {
  const competitionGroups = {}
  filteredQueries.value.forEach(query => {
    const competition = query.query_competition || 'unknown'
    if (!competitionGroups[competition]) competitionGroups[competition] = 0
    competitionGroups[competition]++
  })
  
  return Object.entries(competitionGroups).map(([competition, count]) => ({
    competition,
    count,
    percentage: totalQueries.value > 0 ? Math.round((count / totalQueries.value) * 100) : 0
  }))
})

// Competitor context analysis
const competitorContextData = computed(() => {
  const contextGroups = {}
  filteredQueries.value.forEach(query => {
    const context = query.competitor_context || 'none'
    if (!contextGroups[context]) contextGroups[context] = 0
    contextGroups[context]++
  })
  
  return Object.entries(contextGroups).map(([context, count]) => ({
    context,
    count,
    percentage: totalQueries.value > 0 ? Math.round((count / totalQueries.value) * 100) : 0
  }))
})

// Response match analysis
const responseMatchData = computed(() => {
  const matchGroups = {}
  filteredQueries.value.forEach(query => {
    const match = query.response_match || 'unknown'
    if (!matchGroups[match]) matchGroups[match] = 0
    matchGroups[match]++
  })
  
  return Object.entries(matchGroups)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: totalQueries.value > 0 ? Math.round((count / totalQueries.value) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
})

// Platform button styling
const getPlatformButtonClass = (platform) => {
  const isActive = activePlatform.value === platform
  return isActive
    ? 'bg-orange-600 text-white border-2 border-orange-600 shadow-lg'
    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
}

// Dark mode support
const { isDark } = useDarkMode()

// Chart creation functions
const createQueryTypeChart = () => {
  if (!queryTypeChart.value) return

  // Destroy existing chart
  if (queryTypeChart.value.chart) {
    queryTypeChart.value.chart.destroy()
  }

  const ctx = queryTypeChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: queryTypeData.value.map(d => d.type),
      datasets: [
        {
          label: 'Total Queries',
          data: queryTypeData.value.map(d => d.total),
          backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.6)',
          borderColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Brand Mentioned',
          data: queryTypeData.value.map(d => d.brandMentioned),
          backgroundColor: isDarkMode ? 'rgba(52, 211, 153, 0.6)' : 'rgba(16, 185, 129, 0.6)',
          borderColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        }
      }
    }
  })

  queryTypeChart.value.chart = chart
}

const createQueryIntentChart = () => {
  if (!queryIntentChart.value) return

  // Destroy existing chart
  if (queryIntentChart.value.chart) {
    queryIntentChart.value.chart.destroy()
  }

  const ctx = queryIntentChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: queryIntentData.value.map(d => `${d.intent} (${d.mentionRate}%)`),
      datasets: [{
        data: queryIntentData.value.map(d => d.total),
        backgroundColor: isDarkMode ? [
          'rgba(248, 113, 113, 0.8)', // red-400
          'rgba(251, 191, 36, 0.8)',  // amber-400
          'rgba(52, 211, 153, 0.8)',  // emerald-400
          'rgba(96, 165, 250, 0.8)',  // blue-400
          'rgba(168, 85, 247, 0.8)',  // violet-400
          'rgba(244, 114, 182, 0.8)'  // pink-400
        ] : [
          'rgba(239, 68, 68, 0.8)',   // red-500
          'rgba(245, 158, 11, 0.8)',  // amber-500
          'rgba(34, 197, 94, 0.8)',   // emerald-500
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(147, 51, 234, 0.8)',  // violet-500
          'rgba(236, 72, 153, 0.8)'   // pink-500
        ],
        borderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      }
    }
  })

  queryIntentChart.value.chart = chart
}

const createCitationDistributionChart = () => {
  if (!citationDistributionChart.value) return

  // Destroy existing chart
  if (citationDistributionChart.value.chart) {
    citationDistributionChart.value.chart.destroy()
  }

  const ctx = citationDistributionChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: citationDistributionData.value.map(d => d.bucket),
      datasets: [{
        label: 'Number of Queries',
        data: citationDistributionData.value.map(d => d.count),
        backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.6)' : 'rgba(147, 51, 234, 0.6)',
        borderColor: isDarkMode ? 'rgb(168, 85, 247)' : 'rgb(147, 51, 234)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        }
      }
    }
  })

  citationDistributionChart.value.chart = chart
}

const createFunnelStageChart = () => {
  if (!funnelStageChart.value) return

  // Destroy existing chart
  if (funnelStageChart.value.chart) {
    funnelStageChart.value.chart.destroy()
  }

  const ctx = funnelStageChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: funnelStageData.value.map(d => d.stage),
      datasets: [
        {
          label: 'Total Queries',
          data: funnelStageData.value.map(d => d.total),
          borderColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
          backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointBackgroundColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
          pointBorderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pointBorderWidth: 2
        },
        {
          label: 'Brand Mention Rate (%)',
          data: funnelStageData.value.map(d => d.mentionRate),
          borderColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
          backgroundColor: isDarkMode ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
          pointBackgroundColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
          pointBorderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          max: 100,
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            drawOnChartArea: false,
            color: isDarkMode ? '#374151' : '#E5E7EB'
          }
        }
      }
    }
  })

  funnelStageChart.value.chart = chart
}

const createCompetitionChart = () => {
  if (!competitionChart.value) return

  // Destroy existing chart
  if (competitionChart.value.chart) {
    competitionChart.value.chart.destroy()
  }

  const ctx = competitionChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: competitionData.value.map(d => d.competition),
      datasets: [{
        data: competitionData.value.map(d => d.count),
        backgroundColor: isDarkMode ? [
          'rgba(52, 211, 153, 0.8)',  // emerald-400
          'rgba(251, 191, 36, 0.8)',   // amber-400
          'rgba(248, 113, 113, 0.8)',  // red-400
          'rgba(156, 163, 175, 0.8)'   // gray-400
        ] : [
          'rgba(16, 185, 129, 0.8)',   // emerald-500
          'rgba(245, 158, 11, 0.8)',   // amber-500
          'rgba(239, 68, 68, 0.8)',    // red-500
          'rgba(107, 114, 128, 0.8)'   // gray-500
        ],
        borderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      }
    }
  })

  competitionChart.value.chart = chart
}

const createCompetitorContextChart = () => {
  if (!competitorContextChart.value) return

  // Destroy existing chart
  if (competitorContextChart.value.chart) {
    competitorContextChart.value.chart.destroy()
  }

  const ctx = competitorContextChart.value.getContext('2d')
  const isDarkMode = isDark.value

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: competitorContextData.value.map(d => d.context),
      datasets: [{
        label: 'Queries',
        data: competitorContextData.value.map(d => d.count),
        backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.6)' : 'rgba(245, 158, 11, 0.6)',
        borderColor: isDarkMode ? 'rgb(251, 191, 36)' : 'rgb(245, 158, 11)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? '#E5E7EB' : '#374151'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          titleColor: isDarkMode ? '#F3F4F6' : '#111827',
          bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280'
          },
          grid: {
            color: isDarkMode ? '#374151' : '#E5E7EB',
            drawBorder: false
          }
        }
      }
    }
  })

  competitorContextChart.value.chart = chart
}

// Initialize charts on mount
onMounted(async () => {
  await nextTick()
  createQueryTypeChart()
  createQueryIntentChart()
  createCitationDistributionChart()
  createFunnelStageChart()
  createCompetitionChart()
  createCompetitorContextChart()
})

// Watch for platform changes and recreate charts
watch(activePlatform, async () => {
  await nextTick()
  createQueryTypeChart()
  createQueryIntentChart()
  createCitationDistributionChart()
  createFunnelStageChart()
  createCompetitionChart()
  createCompetitorContextChart()
})

// Watch for dark mode changes and recreate charts
watch(isDark, async () => {
  await nextTick()
  createQueryTypeChart()
  createQueryIntentChart()
  createCitationDistributionChart()
  createFunnelStageChart()
  createCompetitionChart()
  createCompetitorContextChart()
})
</script>