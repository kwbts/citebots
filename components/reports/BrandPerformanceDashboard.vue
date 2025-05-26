<template>
  <div class="space-y-8">
    <!-- Key Performance Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Brand Mention Rate -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">Brand Mention Rate</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber :value="brandMetrics.mentionRate" :format-fn="formatPercentage" />
            </p>
          </div>
          <div class="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl flex items-center justify-center ml-6">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div class="w-full h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden mb-2">
          <div
            class="h-3 bg-orange-500 rounded-full transition-all duration-700"
            :style="`width: ${brandMetrics.mentionRate}%`"
          ></div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ brandMetrics.mentionedQueries }}/{{ brandMetrics.totalQueries }} queries
        </p>
      </div>

      <!-- Total Queries with Brand -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">Queries with Brand</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber :value="brandMetrics.mentionedQueries" />
            </p>
          </div>
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl flex items-center justify-center ml-6">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Out of {{ brandMetrics.totalQueries }} total queries
        </p>
      </div>

      <!-- Average Brand Mentions -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">Avg Brand Mentions</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber :value="brandMetrics.avgMentions" :format-fn="formatDecimal" />
            </p>
          </div>
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-2xl flex items-center justify-center ml-6">
            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Per query when mentioned
        </p>
      </div>

      <!-- Brand Sentiment -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">Brand Sentiment</p>
            <p class="text-3xl font-bold mb-2" :class="getSentimentColor(brandMetrics.sentiment)">
              <AnimatedNumber :value="brandMetrics.sentiment" :format-fn="formatSentiment" />
            </p>
          </div>
          <div class="w-16 h-16 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center justify-center ml-6">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-8V3a1 1 0 011-1h2a1 1 0 011 1v3M7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ getSentimentLabel(brandMetrics.sentiment) }}
        </p>
      </div>
    </div>
    
    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Brand vs Competitor Comparison -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand vs Competitors</h3>
        </div>
        
        <!-- Competitor Selection -->
        <div class="mb-8">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Compare with:</label>
          <select
            v-model="selectedCompetitor"
            class="w-full border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-300 dark:focus:border-orange-500/50 transition-all duration-200"
          >
            <option value="all">All Competitors</option>
            <option v-for="competitor in competitors" :key="competitor.id" :value="competitor.id">
              {{ competitor.name }}
            </option>
          </select>
        </div>
        
        <!-- Comparison Chart -->
        <div class="space-y-6">
          <!-- Brand Performance -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-900 dark:text-white">{{ client?.name || 'Your Brand' }}</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/20">{{ formatPercentage(brandMetrics.mentionRate) }}</span>
            </div>
            <div class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-700"
                :style="`width: ${Math.min(brandMetrics.mentionRate, 100)}%`"
              ></div>
            </div>
          </div>

          <!-- Competitor Performance -->
          <div v-for="comp in getCompetitorComparison()" :key="comp.name" class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-900 dark:text-white">{{ comp.name }}</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-500/20">{{ formatPercentage(comp.mentionRate) }}</span>
            </div>
            <div class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-700"
                :style="`width: ${Math.min(comp.mentionRate, 100)}%`"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Competitive Insights -->
        <div class="mt-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 border border-blue-200/50 dark:border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 class="font-medium text-blue-800 dark:text-blue-300 mb-2">Competitive Position</h5>
              <p class="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                {{ getCompetitiveInsight() }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Brand Mention Type Distribution -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Mention Types</h3>
        </div>
        
        <div class="space-y-6">
          <!-- Mention Type Breakdown -->
          <div v-for="(type, index) in mentionTypes" :key="type.name" class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-900 dark:text-white">{{ type.name }}</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-500/20">{{ type.count }} ({{ formatPercentage(type.percentage) }})</span>
            </div>
            <div class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                :class="getMentionTypeColor(index)"
                :style="`width: ${type.percentage}%`"
              ></div>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-8 grid grid-cols-2 gap-3">
            <div v-for="(type, index) in mentionTypes" :key="type.name" class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded-full border border-gray-200/50 dark:border-gray-600/50"
                :class="getMentionTypeColor(index)"
              ></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ type.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Query Intent Performance -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Query Intent vs Brand Success</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="intent in intentPerformance" :key="intent.name" class="bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50 rounded-xl p-6 hover:bg-gray-100/50 dark:hover:bg-gray-600/30 transition-colors duration-200">
          <p class="text-gray-600 dark:text-gray-400 font-medium mb-3">{{ intent.name }}</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ formatPercentage(intent.successRate) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {{ intent.mentions }}/{{ intent.total }} queries
          </p>
          <div class="w-full h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div
              class="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              :style="`width: ${intent.successRate}%`"
            ></div>
          </div>
        </div>
      </div>

      <!-- Intent Insights -->
      <div class="mt-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-500/20 border border-green-200/50 dark:border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 class="font-medium text-green-800 dark:text-green-300 mb-2">Intent Performance</h5>
            <p class="text-sm text-green-700 dark:text-green-400 leading-relaxed">
              {{ getIntentInsight() }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Citation Performance -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Citation Performance</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Citation Mention Rate -->
        <div class="text-center">
          <div class="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="8"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(citationMetrics.mentionRate, 100)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out text-orange-500"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatPercentage(citationMetrics.mentionRate) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">Citation Rate</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Pages citing your brand per query
          </p>
        </div>

        <!-- Total Citations -->
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <AnimatedNumber :value="citationMetrics.totalCitations" />
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">Total Citations</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Across {{ citationMetrics.citedQueries }} queries
          </p>
        </div>

        <!-- Vs Competitors Citation -->
        <div class="text-center">
          <div class="text-4xl font-bold mb-4" :class="getComparisonColor(citationMetrics.vsCompetitors)">
            {{ citationMetrics.vsCompetitors > 0 ? '+' : '' }}{{ formatPercentage(Math.abs(citationMetrics.vsCompetitors)) }}
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium mb-2">vs Competitors</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ citationMetrics.vsCompetitors > 0 ? 'Above' : 'Below' }} average
          </p>
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

// Reactive state
const selectedCompetitor = ref('all')

// Calculate brand performance metrics
const brandMetrics = computed(() => {
  // Debug: Log the data structure
  console.log('Debug - props.data:', props.data)
  console.log('Debug - props.data.analysis_queries:', props.data?.analysis_queries)

  if (!props.data?.analysis_queries || !Array.isArray(props.data.analysis_queries)) {
    console.log('Debug - No analysis_queries found or not an array')
    return {
      mentionRate: 0,
      mentionedQueries: 0,
      totalQueries: 0,
      avgMentions: 0,
      sentiment: 0
    }
  }

  // Use the pre-filtered data from parent component (already filtered by platform)
  const filteredQueries = props.data.analysis_queries
  console.log('Debug - All queries count:', filteredQueries.length)
  console.log('Debug - Sample query:', filteredQueries[0])

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
  if (!props.data?.analysis_queries) return []

  // Use the pre-filtered data from parent component (already filtered by platform)
  const filteredQueries = props.data.analysis_queries

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
  if (!props.data?.analysis_queries) return []

  // Use the pre-filtered data from parent component (already filtered by platform)
  const filteredQueries = props.data.analysis_queries

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

// Calculate citation metrics using real page analysis data
const citationMetrics = computed(() => {
  if (!props.data?.analysis_queries) return {
    mentionRate: 0,
    totalCitations: 0,
    citedQueries: 0,
    vsCompetitors: 0
  }

  // Use the pre-filtered data from parent component (already filtered by platform)
  const filteredQueries = props.data.analysis_queries
  console.log('DEBUG Citation - Filtered queries count:', filteredQueries.length)
  console.log('DEBUG Citation - Sample query keys:', filteredQueries[0] ? Object.keys(filteredQueries[0]) : 'no queries')
  console.log('DEBUG Citation - Sample query has associated_pages:', !!filteredQueries[0]?.associated_pages)
  console.log('DEBUG Citation - Sample associated_pages count:', filteredQueries[0]?.associated_pages?.length || 0)

  // Extract all page analyses from queries (using associated_pages) or from separate page_analyses array
  let allPageAnalyses = []

  // Extract from associated_pages within each query (this is the correct data structure)
  console.log('DEBUG Citation - Extracting from associated_pages in queries')
  filteredQueries.forEach(query => {
    if (query.associated_pages && Array.isArray(query.associated_pages)) {
      console.log(`DEBUG Citation - Query ${query.id} has ${query.associated_pages.length} associated pages`)
      allPageAnalyses.push(...query.associated_pages)
    } else {
      console.log(`DEBUG Citation - Query ${query.id} has no associated_pages`)
    }
  })

  // Fallback: try separate page_analyses array if associated_pages didn't work
  if (allPageAnalyses.length === 0 && props.data.page_analyses && Array.isArray(props.data.page_analyses)) {
    console.log('DEBUG Citation - Fallback: Using separate page_analyses array, count:', props.data.page_analyses.length)
    const filteredQueryIds = new Set(filteredQueries.map(q => q.id))
    allPageAnalyses = props.data.page_analyses.filter(page =>
      filteredQueryIds.has(page.query_id)
    )
  }

  console.log('DEBUG Citation - Total page analyses found:', allPageAnalyses.length)
  console.log('DEBUG Citation - Sample page analysis:', allPageAnalyses[0])
  console.log('DEBUG Citation - Client domain:', props.client?.domain)

  // Count brand/client citations
  const brandCitations = allPageAnalyses.filter(page => {
    const isBrandMentioned = page.brand_mentioned === true
    const isClientDomain = page.is_client_domain === true
    const isDomainMatch = page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain)
    const isBrandCitation = isBrandMentioned || isClientDomain || isDomainMatch

    if (isBrandCitation) {
      console.log(`DEBUG Citation - Found brand citation:`, {
        url: page.citation_url,
        domain: page.domain_name,
        brand_mentioned: page.brand_mentioned,
        is_client_domain: page.is_client_domain,
        client_domain: props.client?.domain
      })
    }

    return isBrandCitation
  })

  console.log('DEBUG Citation - Brand citations found:', brandCitations.length)

  // Count competitor citations
  const competitorCitations = allPageAnalyses.filter(page =>
    page.competitor_mentioned === true ||
    page.is_competitor_domain === true
  )

  // Count queries that have brand citations
  const queriesWithBrandCitations = new Set()
  brandCitations.forEach(page => {
    const query = filteredQueries.find(q => q.id === page.query_id)
    if (query) queriesWithBrandCitations.add(query.id)
  })

  const totalCitations = brandCitations.length
  const citedQueries = queriesWithBrandCitations.size
  const mentionRate = filteredQueries.length > 0 ? (citedQueries / filteredQueries.length) * 100 : 0

  // Calculate brand vs competitor citation performance
  const totalCompetitorCitations = competitorCitations.length
  const vsCompetitors = totalCompetitorCitations > 0
    ? ((totalCitations / totalCompetitorCitations) * 100) - 100  // % difference from competitors
    : (totalCitations > 0 ? 100 : 0) // If no competitor citations but we have citations, we're 100% ahead

  const result = {
    mentionRate: Math.round(mentionRate * 10) / 10,
    totalCitations,
    citedQueries,
    vsCompetitors: Math.round(vsCompetitors * 10) / 10
  }

  console.log('DEBUG Citation - Final citation metrics:', result)
  return result
})

// Get competitor comparison data
const getCompetitorComparison = () => {
  if (!props.data?.analysis_queries || !props.competitors.length) return []

  // Use the pre-filtered data from parent component (already filtered by platform)
  const filteredQueries = props.data.analysis_queries

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

