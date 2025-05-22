<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Competitor Analysis Overview</h2>
      
      <TextBox>
        Analyze how your brand performs against competitors in LLM responses. Track mention frequency, 
        co-occurrence patterns, and competitive positioning across different query types.
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

    <!-- Key Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Competitors -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Competitors</p>
            <p class="text-2xl font-semibold text-gray-900">{{ metrics.totalCompetitors }}</p>
          </div>
        </div>
      </div>

      <!-- Queries w/ Competitors -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Queries w/ Competitors</p>
            <p class="text-2xl font-semibold text-gray-900">{{ metrics.queriesWithCompetitors }}</p>
            <p class="text-sm text-gray-500">{{ formatPercentage(metrics.competitorMentionRate) }}</p>
          </div>
        </div>
      </div>

      <!-- Avg Competitor Mentions -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Avg Mentions</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(metrics.avgCompetitorMentions) }}</p>
            <p class="text-sm text-gray-500">per query</p>
          </div>
        </div>
      </div>

      <!-- Brand vs Competitor Win Rate -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-citebots-orange bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Brand Win Rate</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatPercentage(metrics.brandWinRate) }}</p>
            <p class="text-sm text-gray-500">vs competitors</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Head-to-Head Comparison -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Competitors by Mention Frequency -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Top Competitors by Mentions</h3>
        
        <div v-if="topCompetitors.length > 0" class="space-y-4">
          <div v-for="competitor in topCompetitors" :key="competitor.name" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700">{{ competitor.name }}</span>
              <span class="text-gray-500">{{ competitor.mentions }} mentions</span>
            </div>
            <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                :style="`width: ${competitor.percentage}%`"
              ></div>
            </div>
            <div class="text-xs text-gray-500">
              {{ formatPercentage(competitor.percentage) }} of all competitor mentions
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-center py-8">
          No competitor mentions found in the current data set.
        </div>
      </div>

      <!-- Competitive Positioning Matrix -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Competitive Positioning</h3>
        
        <div class="space-y-4">
          <!-- Brand Dominant -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-medium text-green-800">Brand Dominant</h4>
                <p class="text-sm text-green-600">Brand mentioned more than competitors</p>
              </div>
              <div class="text-2xl font-bold text-green-800">{{ positioningMetrics.brandDominant }}</div>
            </div>
          </div>

          <!-- Competitive -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-medium text-yellow-800">Competitive</h4>
                <p class="text-sm text-yellow-600">Equal mentions with competitors</p>
              </div>
              <div class="text-2xl font-bold text-yellow-800">{{ positioningMetrics.competitive }}</div>
            </div>
          </div>

          <!-- Competitor Advantage -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-medium text-red-800">Competitor Advantage</h4>
                <p class="text-sm text-red-600">Competitors mentioned more than brand</p>
              </div>
              <div class="text-2xl font-bold text-red-800">{{ positioningMetrics.competitorAdvantage }}</div>
            </div>
          </div>

          <!-- Opportunity -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-medium text-blue-800">Opportunity</h4>
                <p class="text-sm text-blue-600">Only competitors mentioned</p>
              </div>
              <div class="text-2xl font-bold text-blue-800">{{ positioningMetrics.opportunity }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Co-occurrence Analysis -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Brand-Competitor Co-occurrence</h3>
      
      <div v-if="cooccurrenceData.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competitor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Co-occurrences
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand Win Rate
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Brand Sentiment
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Context
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="competitor in cooccurrenceData" :key="competitor.name">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ competitor.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ competitor.cooccurrences }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">{{ formatPercentage(competitor.brandWinRate) }}</div>
                  <div class="ml-2">
                    <span v-if="competitor.brandWinRate > 60" class="text-green-500">▲</span>
                    <span v-else-if="competitor.brandWinRate < 40" class="text-red-500">▼</span>
                    <span v-else class="text-yellow-500">●</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatNumber(competitor.avgBrandSentiment) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 max-w-xs truncate">{{ competitor.commonContext }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-gray-500 text-center py-8">
        No brand-competitor co-occurrences found in the current data set.
      </div>
    </div>

    <!-- Query Type Performance -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Performance by Query Type</h3>
      
      <div v-if="queryTypePerformance.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="queryType in queryTypePerformance" :key="queryType.type" class="space-y-4">
          <h4 class="font-medium text-gray-700">{{ queryType.type }}</h4>
          
          <!-- Brand vs Competitor Chart -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-citebots-orange">Brand</span>
              <span>{{ formatPercentage(queryType.brandRate) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-citebots-orange rounded-full"
                :style="`width: ${queryType.brandRate}%`"
              ></div>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-blue-600">Competitors</span>
              <span>{{ formatPercentage(queryType.competitorRate) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                :style="`width: ${queryType.competitorRate}%`"
              ></div>
            </div>
          </div>
          
          <div class="text-xs text-gray-500">
            {{ queryType.totalQueries }} queries analyzed
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center py-8">
        No query type data available for performance analysis.
      </div>
    </div>

    <!-- Key Insights -->
    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h5 class="text-sm font-medium text-indigo-800">Key Competitive Insights</h5>
          <div class="text-sm text-indigo-700 mt-2 space-y-1">
            <p v-if="insights.length > 0" v-for="insight in insights" :key="insight">{{ insight }}</p>
            <p v-else>No specific competitive insights available yet. Run more analysis to get detailed insights.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TextBox from './TextBox.vue'

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
    required: true
  }
})

// Platform selection
const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'perplexity', label: 'Perplexity' }
]

const activePlatform = ref('all')

// Helper methods
const getPlatformButtonClass = (platform) => {
  if (activePlatform.value === platform) {
    switch(platform) {
      case 'all':
        return 'bg-gradient-to-r from-citebots-orange to-amber-500 text-white'
      case 'chatgpt':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      case 'perplexity':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      default:
        return 'bg-gray-300 text-gray-800'
    }
  }
  return 'bg-gray-200 hover:bg-gray-300 text-gray-700'
}

const formatPercentage = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0%'
  return Math.round(value) + '%'
}

const formatNumber = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0'
  return Math.round(value * 10) / 10
}

// Filter queries by platform
const filteredQueries = computed(() => {
  if (!props.data.queries) return []
  
  return props.data.queries.filter(query => {
    if (activePlatform.value === 'all') return true
    return query.data_source?.toLowerCase() === activePlatform.value
  })
})

// Calculate main metrics
const metrics = computed(() => {
  const queries = filteredQueries.value
  const totalQueries = queries.length
  
  if (totalQueries === 0) {
    return {
      totalCompetitors: 0,
      queriesWithCompetitors: 0,
      competitorMentionRate: 0,
      avgCompetitorMentions: 0,
      brandWinRate: 0
    }
  }
  
  // Get unique competitors mentioned
  const allCompetitors = new Set()
  queries.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(name => allCompetitors.add(name))
    }
  })
  
  // Count queries with competitors
  const queriesWithCompetitors = queries.filter(q => q.competitor_count > 0).length
  
  // Calculate average competitor mentions
  const totalCompetitorMentions = queries.reduce((sum, q) => sum + (q.competitor_count || 0), 0)
  const avgCompetitorMentions = totalCompetitorMentions / totalQueries
  
  // Calculate brand win rate (brand mentioned but competitors have lower count)
  const brandWins = queries.filter(q => 
    q.brand_mentioned && 
    (q.brand_mention_count || 0) > (q.competitor_count || 0)
  ).length
  
  const competitiveQueries = queries.filter(q => 
    q.brand_mentioned && q.competitor_count > 0
  ).length
  
  const brandWinRate = competitiveQueries > 0 ? (brandWins / competitiveQueries) * 100 : 0
  
  return {
    totalCompetitors: allCompetitors.size,
    queriesWithCompetitors,
    competitorMentionRate: (queriesWithCompetitors / totalQueries) * 100,
    avgCompetitorMentions,
    brandWinRate
  }
})

// Top competitors by mention frequency
const topCompetitors = computed(() => {
  const competitorCounts = {}
  const queries = filteredQueries.value
  
  queries.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(name => {
        competitorCounts[name] = (competitorCounts[name] || 0) + 1
      })
    }
  })
  
  const totalMentions = Object.values(competitorCounts).reduce((sum, count) => sum + count, 0)
  
  return Object.entries(competitorCounts)
    .map(([name, mentions]) => ({
      name,
      mentions,
      percentage: totalMentions > 0 ? (mentions / totalMentions) * 100 : 0
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5)
})

// Positioning metrics
const positioningMetrics = computed(() => {
  const queries = filteredQueries.value
  
  let brandDominant = 0
  let competitive = 0
  let competitorAdvantage = 0
  let opportunity = 0
  
  queries.forEach(query => {
    const brandMentions = query.brand_mention_count || 0
    const competitorMentions = query.competitor_count || 0
    const brandMentioned = query.brand_mentioned || false
    
    if (brandMentioned && competitorMentions === 0) {
      brandDominant++
    } else if (brandMentioned && competitorMentions > 0) {
      if (brandMentions > competitorMentions) {
        brandDominant++
      } else if (brandMentions === competitorMentions) {
        competitive++
      } else {
        competitorAdvantage++
      }
    } else if (!brandMentioned && competitorMentions > 0) {
      opportunity++
    }
  })
  
  return {
    brandDominant,
    competitive,
    competitorAdvantage,
    opportunity
  }
})

// Co-occurrence analysis
const cooccurrenceData = computed(() => {
  const competitorStats = {}
  const queries = filteredQueries.value
  
  queries.forEach(query => {
    if (query.brand_mentioned && query.competitor_mentioned_names) {
      query.competitor_mentioned_names.forEach(competitorName => {
        if (!competitorStats[competitorName]) {
          competitorStats[competitorName] = {
            name: competitorName,
            cooccurrences: 0,
            brandWins: 0,
            totalSentiment: 0,
            sentimentCount: 0,
            contexts: []
          }
        }
        
        const stats = competitorStats[competitorName]
        stats.cooccurrences++
        
        // Brand wins when brand mention count > competitor count
        if ((query.brand_mention_count || 0) > (query.competitor_count || 0)) {
          stats.brandWins++
        }
        
        // Track brand sentiment when co-occurring
        if (query.brand_sentiment !== null && query.brand_sentiment !== undefined) {
          stats.totalSentiment += query.brand_sentiment
          stats.sentimentCount++
        }
        
        // Track common contexts
        if (query.competitor_context) {
          stats.contexts.push(query.competitor_context)
        }
      })
    }
  })
  
  return Object.values(competitorStats)
    .map(stats => ({
      name: stats.name,
      cooccurrences: stats.cooccurrences,
      brandWinRate: stats.cooccurrences > 0 ? (stats.brandWins / stats.cooccurrences) * 100 : 0,
      avgBrandSentiment: stats.sentimentCount > 0 ? stats.totalSentiment / stats.sentimentCount : 0,
      commonContext: stats.contexts.length > 0 ? stats.contexts[0] : 'No context available'
    }))
    .sort((a, b) => b.cooccurrences - a.cooccurrences)
    .slice(0, 10)
})

// Query type performance
const queryTypePerformance = computed(() => {
  const queries = filteredQueries.value
  const typeStats = {}
  
  queries.forEach(query => {
    const type = query.query_intent || query.query_type || 'Unknown'
    
    if (!typeStats[type]) {
      typeStats[type] = {
        type,
        totalQueries: 0,
        brandMentions: 0,
        competitorMentions: 0
      }
    }
    
    const stats = typeStats[type]
    stats.totalQueries++
    
    if (query.brand_mentioned) {
      stats.brandMentions++
    }
    
    if (query.competitor_count > 0) {
      stats.competitorMentions++
    }
  })
  
  return Object.values(typeStats)
    .map(stats => ({
      type: stats.type,
      totalQueries: stats.totalQueries,
      brandRate: stats.totalQueries > 0 ? (stats.brandMentions / stats.totalQueries) * 100 : 0,
      competitorRate: stats.totalQueries > 0 ? (stats.competitorMentions / stats.totalQueries) * 100 : 0
    }))
    .sort((a, b) => b.totalQueries - a.totalQueries)
    .slice(0, 3)
})

// Generate insights
const insights = computed(() => {
  const insights = []
  const m = metrics.value
  const top = topCompetitors.value
  
  if (m.brandWinRate > 70) {
    insights.push(`Strong competitive position with ${formatPercentage(m.brandWinRate)} win rate against competitors.`)
  } else if (m.brandWinRate < 30) {
    insights.push(`Opportunity to improve competitive positioning - currently winning only ${formatPercentage(m.brandWinRate)} of head-to-head mentions.`)
  }
  
  if (top.length > 0) {
    insights.push(`${top[0].name} is your primary competitor, appearing in ${top[0].mentions} queries.`)
  }
  
  if (m.competitorMentionRate > 60) {
    insights.push(`High competitive landscape - competitors mentioned in ${formatPercentage(m.competitorMentionRate)} of queries.`)
  }
  
  if (positioningMetrics.value.opportunity > 0) {
    insights.push(`${positioningMetrics.value.opportunity} queries mention only competitors - potential content gaps to address.`)
  }
  
  return insights
})
</script>