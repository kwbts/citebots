<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Query Analysis</h2>
      
      <TextBox>
        Analyze query performance across different types, intents, and competitive contexts. Track brand mention success rates and identify optimization opportunities.
      </TextBox>
      
      <!-- Platform Selector -->
      <div class="flex mb-6">
        <button 
          v-for="platform in platforms" 
          :key="platform.value"
          @click="activePlatform = platform.value" 
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="getPlatformButtonClass(platform.value)"
        >
          {{ platform.label }}
        </button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Queries</p>
            <div class="flex items-center space-x-2">
              <AnimatedNumber :value="totalQueries" class="text-2xl font-bold text-gray-900 dark:text-white" />
            </div>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Brand Mention Rate</p>
            <div class="flex items-center space-x-2">
              <AnimatedNumber :value="brandMentionRate" suffix="%" class="text-2xl font-bold text-green-600 dark:text-green-400" />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                ({{ brandMentionCount }}/{{ totalQueries }})
              </span>
            </div>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Citations per Query</p>
            <div class="flex items-center space-x-2">
              <AnimatedNumber :value="avgCitationCount" :decimals="1" class="text-2xl font-bold text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Competitive Advantage</p>
            <div class="flex items-center space-x-2">
              <AnimatedNumber :value="competitiveAdvantageRate" suffix="%" class="text-2xl font-bold text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div class="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Query Type vs Brand Mention Success -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Brand Mention Success by Query Type</h3>
      <div class="h-64">
        <canvas ref="queryTypeChart"></canvas>
      </div>
    </div>

    <!-- Query Intent Performance Breakdown -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Performance by Query Intent</h3>
      <div class="h-64">
        <canvas ref="queryIntentChart"></canvas>
      </div>
    </div>

    <!-- Citation Count Distribution -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Citation Count Distribution</h3>
      <div class="h-64">
        <canvas ref="citationDistributionChart"></canvas>
      </div>
    </div>

    <!-- Funnel Stage Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Brand Performance by Funnel Stage</h3>
      <div class="h-64">
        <canvas ref="funnelStageChart"></canvas>
      </div>
    </div>

    <!-- Competitive Context Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Competitive Context Analysis</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 class="text-md font-medium text-gray-600 dark:text-gray-400 mb-3">Query Competition Distribution</h4>
          <div class="h-48">
            <canvas ref="competitionChart"></canvas>
          </div>
        </div>
        <div>
          <h4 class="text-md font-medium text-gray-600 dark:text-gray-400 mb-3">Competitor Context</h4>
          <div class="h-48">
            <canvas ref="competitorContextChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Match Quality -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Response Match Quality</h3>
      <div class="space-y-4">
        <div v-for="match in responseMatchData" :key="match.type" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ match.type }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ match.count }} queries)</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" :style="`width: ${match.percentage}%`"></div>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ match.percentage }}%</span>
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
    ? 'bg-citebots-orange text-white border-citebots-orange border'
    : 'bg-white text-gray-700 border-gray-300 border hover:bg-gray-50'
}

// Chart creation functions
const createQueryTypeChart = () => {
  if (!queryTypeChart.value) return
  
  const ctx = queryTypeChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: queryTypeData.value.map(d => d.type),
      datasets: [
        {
          label: 'Total Queries',
          data: queryTypeData.value.map(d => d.total),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Brand Mentioned',
          data: queryTypeData.value.map(d => d.brandMentioned),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const createQueryIntentChart = () => {
  if (!queryIntentChart.value) return
  
  const ctx = queryIntentChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: queryIntentData.value.map(d => `${d.intent} (${d.mentionRate}%)`),
      datasets: [{
        data: queryIntentData.value.map(d => d.total),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

const createCitationDistributionChart = () => {
  if (!citationDistributionChart.value) return
  
  const ctx = citationDistributionChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: citationDistributionData.value.map(d => d.bucket),
      datasets: [{
        label: 'Number of Queries',
        data: citationDistributionData.value.map(d => d.count),
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const createFunnelStageChart = () => {
  if (!funnelStageChart.value) return
  
  const ctx = funnelStageChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: funnelStageData.value.map(d => d.stage),
      datasets: [
        {
          label: 'Total Queries',
          data: funnelStageData.value.map(d => d.total),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Brand Mention Rate (%)',
          data: funnelStageData.value.map(d => d.mentionRate),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          max: 100
        }
      }
    }
  })
}

const createCompetitionChart = () => {
  if (!competitionChart.value) return
  
  const ctx = competitionChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: competitionData.value.map(d => d.competition),
      datasets: [{
        data: competitionData.value.map(d => d.count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

const createCompetitorContextChart = () => {
  if (!competitorContextChart.value) return
  
  const ctx = competitorContextChart.value.getContext('2d')
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: competitorContextData.value.map(d => d.context),
      datasets: [{
        label: 'Queries',
        data: competitorContextData.value.map(d => d.count),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y'
    }
  })
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
</script>