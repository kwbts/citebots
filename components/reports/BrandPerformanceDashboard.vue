<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Brand Performance Overview</h2>
      
      <TextBox>
        Track how often your brand is mentioned in LLM responses and how you perform compared to competitors. 
        Higher mention rates indicate stronger brand visibility in AI-generated content.
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
      
      <!-- Key Performance Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Brand Mention Rate -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Brand Mention Rate</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            <AnimatedNumber :value="brandMetrics.mentionRate" :format-fn="formatPercentage" />
          </div>
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-2 bg-citebots-orange rounded-full transition-all duration-700"
              :style="`width: ${brandMetrics.mentionRate}%`"
            ></div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ brandMetrics.mentionedQueries }}/{{ brandMetrics.totalQueries }} queries
          </div>
        </div>
        
        <!-- Total Queries with Brand -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Queries with Brand</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            <AnimatedNumber :value="brandMetrics.mentionedQueries" />
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Out of {{ brandMetrics.totalQueries }} total queries
          </div>
        </div>
        
        <!-- Average Brand Mentions -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Brand Mentions</div>
          <div class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            <AnimatedNumber :value="brandMetrics.avgMentions" :format-fn="formatDecimal" />
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Per query when mentioned
          </div>
        </div>
        
        <!-- Brand Sentiment -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Brand Sentiment</div>
          <div class="text-3xl font-bold mb-2" :class="getSentimentColor(brandMetrics.sentiment)">
            <AnimatedNumber :value="brandMetrics.sentiment" :format-fn="formatSentiment" />
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ getSentimentLabel(brandMetrics.sentiment) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Brand vs Competitor Comparison -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Brand vs Competitors</h3>
        
        <!-- Competitor Selection -->
        <div class="mb-6">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Compare with:</label>
          <select 
            v-model="selectedCompetitor" 
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700"
          >
            <option value="all">All Competitors</option>
            <option v-for="competitor in competitors" :key="competitor.id" :value="competitor.id">
              {{ competitor.name }}
            </option>
          </select>
        </div>
        
        <!-- Comparison Chart -->
        <div class="space-y-4">
          <!-- Brand Performance -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ client?.name || 'Your Brand' }}</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(brandMetrics.mentionRate) }}</span>
            </div>
            <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full bg-citebots-orange rounded-full transition-all duration-700"
                :style="`width: ${Math.min(brandMetrics.mentionRate, 100)}%`"
              ></div>
            </div>
          </div>
          
          <!-- Competitor Performance -->
          <div v-for="comp in getCompetitorComparison()" :key="comp.name" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ comp.name }}</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(comp.mentionRate) }}</span>
            </div>
            <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-700"
                :style="`width: ${Math.min(comp.mentionRate, 100)}%`"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Competitive Insights -->
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h5 class="text-sm font-medium text-blue-800 dark:text-blue-300">Competitive Position</h5>
              <p class="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {{ getCompetitiveInsight() }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Brand Mention Type Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Brand Mention Types</h3>
        
        <div class="space-y-4">
          <!-- Mention Type Breakdown -->
          <div v-for="(type, index) in mentionTypes" :key="type.name" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ type.name }}</span>
              <span class="text-gray-500 dark:text-gray-400">{{ type.count }} ({{ formatPercentage(type.percentage) }})</span>
            </div>
            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                :class="getMentionTypeColor(index)"
                :style="`width: ${type.percentage}%`"
              ></div>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div v-for="(type, index) in mentionTypes" :key="type.name" class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2" 
                :class="getMentionTypeColor(index)"
              ></div>
              <span class="text-gray-600 dark:text-gray-400">{{ type.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Query Intent Performance -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Query Intent vs Brand Success</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="intent in intentPerformance" :key="intent.name" class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ intent.name }}</div>
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
            {{ formatPercentage(intent.successRate) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {{ intent.mentions }}/{{ intent.total }} queries
          </div>
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              :style="`width: ${intent.successRate}%`"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Intent Insights -->
      <div class="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h5 class="text-sm font-medium text-green-800 dark:text-green-300">Intent Performance</h5>
            <p class="text-sm text-green-700 dark:text-green-400 mt-1">
              {{ getIntentInsight() }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Citation Performance -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Citation Performance</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Citation Mention Rate -->
        <div class="text-center">
          <div class="relative w-32 h-32 mx-auto mb-4">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="10"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(citationMetrics.mentionRate, 100)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ formatPercentage(citationMetrics.mentionRate) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">Citation Rate</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Pages citing your brand per query
          </p>
        </div>
        
        <!-- Total Citations -->
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            <AnimatedNumber :value="citationMetrics.totalCitations" />
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Citations</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Across {{ citationMetrics.citedQueries }} queries
          </div>
        </div>
        
        <!-- Vs Competitors Citation -->
        <div class="text-center">
          <div class="text-4xl font-bold mb-2" :class="getComparisonColor(citationMetrics.vsCompetitors)">
            {{ citationMetrics.vsCompetitors > 0 ? '+' : '' }}{{ formatPercentage(Math.abs(citationMetrics.vsCompetitors)) }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">vs Competitors</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ citationMetrics.vsCompetitors > 0 ? 'Above' : 'Below' }} average
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TextBox from './TextBox.vue'
import AnimatedNumber from './utils/AnimatedNumber.vue'

// Props
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

// Platform selection options
const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'perplexity', label: 'Perplexity' }
]

// Reactive state
const activePlatform = ref('all')
const selectedCompetitor = ref('all')

// Helper method to get platform-specific styling classes for buttons
const getPlatformButtonClass = (platform) => {
  if (activePlatform.value === platform) {
    switch(platform) {
      case 'all':
        return 'bg-citebots-orange text-white'
      case 'chatgpt':
        return 'bg-green-500 text-white'
      case 'perplexity':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white'
    }
  }
  return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
}

// Calculate brand performance metrics
const brandMetrics = computed(() => {
  // Debug: Log the data structure
  console.log('Debug - props.data:', props.data)
  console.log('Debug - props.data.queries:', props.data?.queries)

  if (!props.data?.queries || !Array.isArray(props.data.queries)) {
    console.log('Debug - No queries found or not an array')
    return {
      mentionRate: 0,
      mentionedQueries: 0,
      totalQueries: 0,
      avgMentions: 0,
      sentiment: 0
    }
  }

  let filteredQueries = props.data.queries
  console.log('Debug - All queries count:', filteredQueries.length)
  console.log('Debug - Sample query:', filteredQueries[0])

  // Filter by platform if not 'all'
  if (activePlatform.value !== 'all') {
    filteredQueries = filteredQueries.filter(q =>
      q.data_source?.toLowerCase() === activePlatform.value.toLowerCase()
    )
    console.log('Debug - Filtered queries count:', filteredQueries.length)
  }

  const totalQueries = filteredQueries.length
  const mentionedQueries = filteredQueries.filter(q => {
    const mentioned = q.brand_mentioned === true || q.brand_mentioned === 1
    console.log(`Debug - Query ${q.id}: brand_mentioned =`, q.brand_mentioned, 'result:', mentioned)
    return mentioned
  }).length

  console.log('Debug - Total queries:', totalQueries, 'Mentioned queries:', mentionedQueries)

  const mentionRate = totalQueries > 0 ? (mentionedQueries / totalQueries) * 100 : 0

  // Calculate average mentions per query (when mentioned)
  const mentionedQueriesWithCount = filteredQueries.filter(q => {
    const mentioned = q.brand_mentioned === true || q.brand_mentioned === 1
    const hasCount = q.brand_mention_count && !isNaN(q.brand_mention_count)
    return mentioned && hasCount
  })

  console.log('Debug - Queries with mention count:', mentionedQueriesWithCount.length)

  const totalMentions = mentionedQueriesWithCount.reduce((sum, q) => {
    const count = parseInt(q.brand_mention_count) || 0
    console.log(`Debug - Query ${q.id}: mention_count =`, q.brand_mention_count, 'parsed:', count)
    return sum + count
  }, 0)

  const avgMentions = mentionedQueriesWithCount.length > 0 ? totalMentions / mentionedQueriesWithCount.length : 0

  // Calculate average sentiment
  const sentimentQueries = filteredQueries.filter(q => {
    const hasSentiment = q.brand_sentiment !== null && q.brand_sentiment !== undefined && !isNaN(q.brand_sentiment)
    if (hasSentiment) {
      console.log(`Debug - Query ${q.id}: sentiment =`, q.brand_sentiment)
    }
    return hasSentiment
  })

  console.log('Debug - Queries with sentiment:', sentimentQueries.length)

  const avgSentiment = sentimentQueries.length > 0
    ? sentimentQueries.reduce((sum, q) => sum + (parseFloat(q.brand_sentiment) || 0), 0) / sentimentQueries.length
    : 0

  const result = {
    mentionRate: isNaN(mentionRate) ? 0 : Math.round(mentionRate * 10) / 10,
    mentionedQueries,
    totalQueries,
    avgMentions: isNaN(avgMentions) ? 0 : Math.round(avgMentions * 10) / 10,
    sentiment: isNaN(avgSentiment) ? 0 : Math.round(avgSentiment * 100) / 100
  }

  console.log('Debug - Final metrics:', result)
  return result
})

// Calculate mention types distribution
const mentionTypes = computed(() => {
  if (!props.data?.queries) return []
  
  let filteredQueries = props.data.queries
  if (activePlatform.value !== 'all') {
    filteredQueries = filteredQueries.filter(q => 
      q.data_source?.toLowerCase() === activePlatform.value.toLowerCase()
    )
  }
  
  const brandQueries = filteredQueries.filter(q => q.brand_mentioned)
  const total = brandQueries.length
  
  if (total === 0) return []
  
  // Count mention types
  const typeCounts = {}
  brandQueries.forEach(q => {
    const type = q.brand_mention_type || 'Unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  
  return Object.entries(typeCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count)
})

// Calculate intent performance
const intentPerformance = computed(() => {
  if (!props.data?.queries) return []
  
  let filteredQueries = props.data.queries
  if (activePlatform.value !== 'all') {
    filteredQueries = filteredQueries.filter(q => 
      q.data_source?.toLowerCase() === activePlatform.value.toLowerCase()
    )
  }
  
  // Group by intent
  const intentGroups = {}
  filteredQueries.forEach(q => {
    const intent = q.query_intent || 'Unknown'
    if (!intentGroups[intent]) {
      intentGroups[intent] = { total: 0, mentions: 0 }
    }
    intentGroups[intent].total++
    if (q.brand_mentioned) {
      intentGroups[intent].mentions++
    }
  })
  
  return Object.entries(intentGroups)
    .map(([name, data]) => ({
      name,
      total: data.total,
      mentions: data.mentions,
      successRate: data.total > 0 ? (data.mentions / data.total) * 100 : 0
    }))
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 6) // Top 6 intents
})

// Calculate citation metrics
const citationMetrics = computed(() => {
  if (!props.data?.queries) return {
    mentionRate: 0,
    totalCitations: 0,
    citedQueries: 0,
    vsCompetitors: 0
  }
  
  let filteredQueries = props.data.queries
  if (activePlatform.value !== 'all') {
    filteredQueries = filteredQueries.filter(q => 
      q.data_source?.toLowerCase() === activePlatform.value.toLowerCase()
    )
  }
  
  // Count client domain citations
  const totalCitations = filteredQueries.reduce((sum, q) => {
    if (q.page_analyses) {
      return sum + q.page_analyses.filter(p => p.is_client_domain).length
    }
    return sum
  }, 0)
  
  const citedQueries = filteredQueries.filter(q => 
    q.page_analyses && q.page_analyses.some(p => p.is_client_domain)
  ).length
  
  const mentionRate = filteredQueries.length > 0 ? (citedQueries / filteredQueries.length) * 100 : 0
  
  // Calculate vs competitors (simplified)
  const competitorCitations = filteredQueries.reduce((sum, q) => {
    if (q.page_analyses) {
      return sum + q.page_analyses.filter(p => p.is_competitor_domain).length
    }
    return sum
  }, 0)
  
  const vsCompetitors = competitorCitations > 0 
    ? ((totalCitations - competitorCitations) / competitorCitations) * 100 
    : 0
  
  return {
    mentionRate: Math.round(mentionRate * 10) / 10,
    totalCitations,
    citedQueries,
    vsCompetitors: Math.round(vsCompetitors * 10) / 10
  }
})

// Get competitor comparison data
const getCompetitorComparison = () => {
  if (!props.data?.queries || !props.competitors.length) return []
  
  let filteredQueries = props.data.queries
  if (activePlatform.value !== 'all') {
    filteredQueries = filteredQueries.filter(q => 
      q.data_source?.toLowerCase() === activePlatform.value.toLowerCase()
    )
  }
  
  let competitorsToShow = props.competitors
  if (selectedCompetitor.value !== 'all') {
    competitorsToShow = props.competitors.filter(c => c.id === selectedCompetitor.value)
  }
  
  return competitorsToShow.map(competitor => {
    const mentionedQueries = filteredQueries.filter(q => 
      q.competitor_mentioned_names && 
      q.competitor_mentioned_names.includes(competitor.name)
    ).length
    
    const mentionRate = filteredQueries.length > 0 ? (mentionedQueries / filteredQueries.length) * 100 : 0
    
    return {
      name: competitor.name,
      mentionRate: Math.round(mentionRate * 10) / 10,
      mentionedQueries
    }
  }).slice(0, 5) // Top 5 competitors
}

// Helper functions
const formatPercentage = (value) => {
  return Math.round(value) + '%'
}

const formatDecimal = (value) => {
  return value.toFixed(1)
}

const formatSentiment = (value) => {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}

const getSentimentColor = (sentiment) => {
  if (sentiment > 0) return 'text-green-600 dark:text-green-400'
  if (sentiment < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}

const getSentimentLabel = (sentiment) => {
  if (sentiment > 0.5) return 'Positive'
  if (sentiment < -0.5) return 'Negative'
  return 'Neutral'
}

const getMentionTypeColor = (index) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500'
  ]
  return colors[index % colors.length]
}

const getComparisonColor = (value) => {
  return value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
}

const calculateStrokeDashOffset = (value, maxValue) => {
  const circumference = 282.7 // 2 * PI * radius (45)
  const percentage = (value / maxValue) * 100
  return circumference - (circumference * percentage / 100)
}

const getCompetitiveInsight = () => {
  const brandRate = brandMetrics.value.mentionRate
  const competitors = getCompetitorComparison()
  
  if (competitors.length === 0) {
    return `Your brand has a ${formatPercentage(brandRate)} mention rate across analyzed queries.`
  }
  
  const avgCompetitorRate = competitors.reduce((sum, c) => sum + c.mentionRate, 0) / competitors.length
  const difference = brandRate - avgCompetitorRate
  
  if (difference > 5) {
    return `Your brand outperforms competitors by ${formatPercentage(Math.abs(difference))}, showing strong market presence in LLM responses.`
  } else if (difference < -5) {
    return `Competitors are mentioned ${formatPercentage(Math.abs(difference))} more often, indicating opportunity for content optimization.`
  } else {
    return `Your brand performs competitively with similar mention rates to key competitors.`
  }
}

const getIntentInsight = () => {
  const topIntent = intentPerformance.value[0]
  if (!topIntent) return 'Insufficient data for intent analysis.'
  
  return `Your brand performs best in ${topIntent.name} queries (${formatPercentage(topIntent.successRate)} success rate), indicating strong relevance for this intent type.`
}
</script>

