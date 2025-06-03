<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Main Dashboard Content -->
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Dashboard Content -->
      <div class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
        <!-- Key Metrics Overview -->
        <div v-if="activeTab === 'overview'" class="brand-dashboard">
          <!-- Top Section: Title Only -->
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Overview</h2>
          </div>

          <!-- Primary Analysis Component - Full Width -->
          <div class="mb-6">
            <QueryAnalysisComponent
              :data="{
                queries: filteredData?.analysis_queries || [],
                competitors: competitors || [],
                page_analyses: filteredData?.page_analyses || []
              }"
              :filter="'all'"
              :loading="false"
            />
          </div>

          <!-- Competitor Analysis Components - Two Column Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CompetitorMentionRate
              :brand-mention-rate="brandMentionRate"
              :brand-domain="client?.domain || ''"
              :competitors="competitorsWithMentionData"
              :total-queries="totalQueries"
              :loading="false"
            />
            <CompetitorCitationRate
              :brand-citations="brandCitations"
              :brand-citation-rate="brandCitationRate"
              :brand-domain="client?.domain || ''"
              :competitors="competitorsWithCitationData"
              :total-citations="totalCitations"
              :total-domains="totalDomains"
              :loading="false"
            />
          </div>

          <!-- Query Performance Table Section with Advanced Expandable Functionality -->
          <div class="mb-6">
            <QueryPerformanceTable
              :queries="filteredQueryRows"
            />
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
import QueryAnalysisComponent from './components/QueryAnalysisComponent.vue'
import CompetitorMentionRate from './components/CompetitorMentionRate.vue'
import CompetitorCitationRate from './components/CompetitorCitationRate.vue'
import QueryPerformanceTable from './components/QueryPerformanceTable.vue'

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
const activePlatformFilter = ref('all')
const queryFilterType = ref('all')

// Watch for prop changes
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// Watch for platform filter changes
watch(() => activePlatformFilter.value, (newFilter) => {
  if (newFilter === 'all') {
    activePlatforms.value = ['all', 'chatgpt', 'perplexity']
  } else {
    activePlatforms.value = [newFilter]
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

// Access to filtered queries
const filteredQueries = computed(() => {
  return filteredData.value?.analysis_queries || []
})

// Computed metrics
const totalQueries = computed(() => {
  return filteredQueries.value?.length || 0
})

const brandMentions = computed(() => {
  return filteredQueries.value.filter(q => q.brand_mentioned === true).length
})

const brandMentionRate = computed(() => {
  if (filteredQueries.value.length === 0) return 0
  return Math.round((brandMentions.value / filteredQueries.value.length) * 100)
})

const avgCitations = computed(() => {
  if (filteredQueries.value.length === 0) return 0
  const totalCitations = filteredQueries.value.reduce((sum, q) => sum + (q.total_citations || 0), 0)
  return Math.round((totalCitations / filteredQueries.value.length) * 10) / 10
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
  const competitorMentions = {}

  // Count mentions for each competitor
  filteredQueries.value.forEach(query => {
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
      percentage: filteredQueries.value.length > 0 ? Math.round((count / filteredQueries.value.length) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4) // Top 4 competitors

  return competitors
})

// Total unique domains count
const totalDomains = computed(() => {
  const domains = new Set()
  const pageAnalyses = filteredData.value?.page_analyses || []

  pageAnalyses.forEach(page => {
    if (page.domain_name) {
      domains.add(page.domain_name)
    }
  })

  return domains.size || 0
})

// Citation metrics
const totalCitations = computed(() => {
  return filteredData.value?.page_analyses?.length || 0
})

const brandCitations = computed(() => {
  return filteredData.value?.page_analyses?.filter(page => page.is_client_domain)?.length || 0
})

const brandCitationRate = computed(() => {
  if (!totalCitations.value) return 0
  return Math.round((brandCitations.value / totalCitations.value) * 100)
})

// Filtered query rows for the table
const filteredQueryRows = computed(() => {
  const queries = filteredData.value?.analysis_queries || []

  if (queryFilterType.value === 'all') {
    return queries
  } else if (queryFilterType.value === 'mentioned') {
    return queries.filter(q => q.brand_mentioned === true)
  } else if (queryFilterType.value === 'not-mentioned') {
    return queries.filter(q => q.brand_mentioned === false || q.brand_mentioned === undefined)
  }

  return queries
})

// Competitor mention data for CompetitorMentionRate component
const competitorsWithMentionData = computed(() => {
  const competitors = props.data?.competitors || []

  if (competitors.length === 0 || filteredQueries.value.length === 0) {
    return []
  }

  return competitors.map(comp => {
    // Calculate how many queries mention this competitor
    const mentions = filteredQueries.value.filter(q => {
      // Check if query mentions this competitor using the competitor_mentioned_names field
      if (q.competitor_mentioned_names && Array.isArray(q.competitor_mentioned_names)) {
        return q.competitor_mentioned_names.some(name => name.toLowerCase() === comp.name.toLowerCase())
      }
      return false
    }).length

    // Calculate mention rate
    const mentionRate = (mentions / filteredQueries.value.length) * 100

    // Add platform breakdown if available
    const platformData = []
    const platforms = ['chatgpt', 'perplexity']

    platforms.forEach(platform => {
      const platformQueries = filteredQueries.value.filter(q => q.data_source?.toLowerCase() === platform.toLowerCase())
      if (platformQueries.length > 0) {
        const platformMentions = platformQueries.filter(q => {
          if (q.competitor_mentioned_names && Array.isArray(q.competitor_mentioned_names)) {
            return q.competitor_mentioned_names.some(name => name.toLowerCase() === comp.name.toLowerCase())
          }
          return false
        }).length

        platformData.push({
          platform,
          rate: (platformMentions / platformQueries.length) * 100
        })
      }
    })

    return {
      id: comp.id,
      name: comp.name,
      domain: comp.domain,
      mentions,
      mentionRate,
      platformData
    }
  })
})

// Competitor citation data for CompetitorCitationRate component
const competitorsWithCitationData = computed(() => {
  const competitors = props.data?.competitors || []
  const pageAnalyses = filteredData.value?.page_analyses || []

  if (competitors.length === 0 || pageAnalyses.length === 0) {
    return []
  }

  return competitors.map(comp => {
    // Calculate how many citations reference this competitor
    const citations = pageAnalyses.filter(page => {
      // Method 1: Check if the domain matches the competitor domain
      if (page.is_competitor_domain && page.domain_name) {
        const pageDomain = page.domain_name.toLowerCase()
        const compDomain = comp.domain?.toLowerCase() || ''

        // Try to match domains (with or without www prefix)
        if (pageDomain === compDomain ||
            pageDomain === `www.${compDomain}` ||
            `www.${pageDomain}` === compDomain ||
            pageDomain.includes(compDomain) ||
            compDomain.includes(pageDomain)) {
          return true
        }
      }

      // Method 2: Check if competitor name appears in competitor_names array
      if (page.competitor_names && Array.isArray(page.competitor_names)) {
        return page.competitor_names.some(name =>
          name && comp.name && name.toLowerCase() === comp.name.toLowerCase()
        )
      }

      return false
    }).length

    // Calculate citation rate
    const citationRate = (citations / totalCitations.value) * 100

    // Add quality score (example - adjust based on your data)
    const qualityScore = Math.random() * 2 + 3 // Random score between 3-5 for demo

    return {
      id: comp.id,
      name: comp.name,
      domain: comp.domain,
      citations,
      citationRate,
      qualityScore
    }
  })
})

// Helper function for platform colors
const getPlatformColor = (platform) => {
  const platformMap = {
    chatgpt: 'bg-green-500 dark:bg-green-500',
    perplexity: 'bg-blue-500 dark:bg-blue-500',
    claude: 'bg-orange-500 dark:bg-orange-500',
    bard: 'bg-purple-500 dark:bg-purple-500',
    gemini: 'bg-red-500 dark:bg-red-500'
  }
  return platformMap[platform?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

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

<style scoped>
.brand-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .brand-dashboard {
    padding: 1rem;
  }
}
</style>