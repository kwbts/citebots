<template>
  <div class="space-y-8">

    <!-- Key Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Total Competitors -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Total Competitors</p>
          <p class="text-4xl font-bold text-gray-900 dark:text-white">{{ metrics.totalCompetitors }}</p>
        </div>
      </div>

      <!-- Queries w/ Competitors -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Queries w/ Competitors</p>
          <p class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ metrics.queriesWithCompetitors }}</p>
          <p class="text-base text-gray-500 dark:text-gray-400">{{ formatPercentage(metrics.competitorMentionRate) }}</p>
        </div>
      </div>

      <!-- Avg Competitor Mentions -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Avg Mentions</p>
          <p class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ formatNumber(metrics.avgCompetitorMentions) }}</p>
          <p class="text-base text-gray-500 dark:text-gray-400">per query</p>
        </div>
      </div>

      <!-- Brand vs Competitor Win Rate -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Brand Win Rate</p>
          <p class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ formatPercentage(metrics.brandWinRate) }}</p>
          <p class="text-base text-gray-500 dark:text-gray-400">vs competitors</p>
        </div>
      </div>
    </div>

    <!-- Head-to-Head Comparison -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Top Competitors by Mention Frequency -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Top Competitors by Mentions</h3>
          </div>
        </div>
        <div class="p-8">
          <div v-if="topCompetitors.length > 0" class="space-y-6">
            <div v-for="competitor in topCompetitors" :key="competitor.name" class="space-y-3">
              <div class="flex justify-between text-base">
                <span class="font-semibold text-gray-700 dark:text-gray-300">{{ competitor.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ competitor.mentions }} mentions</span>
              </div>
              <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-700"
                  :style="`width: ${competitor.percentage}%`"
                ></div>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatPercentage(competitor.percentage) }} of all competitor mentions
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400 text-center py-12">
            No competitor mentions found in the current data set.
          </div>
        </div>
      </div>

      <!-- Competitive Positioning Matrix -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Competitive Positioning</h3>
          </div>
        </div>
        <div class="p-8">
          <div class="space-y-6">
            <!-- Brand Dominant -->
            <div class="bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-lg font-semibold text-green-800 dark:text-green-300">Brand Dominant</h4>
                  <p class="text-base text-green-600 dark:text-green-400">Brand mentioned more than competitors</p>
                </div>
                <div class="text-3xl font-bold text-green-800 dark:text-green-300">{{ positioningMetrics.brandDominant }}</div>
              </div>
            </div>

            <!-- Competitive -->
            <div class="bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-lg font-semibold text-yellow-800 dark:text-yellow-300">Competitive</h4>
                  <p class="text-base text-yellow-600 dark:text-yellow-400">Equal mentions with competitors</p>
                </div>
                <div class="text-3xl font-bold text-yellow-800 dark:text-yellow-300">{{ positioningMetrics.competitive }}</div>
              </div>
            </div>

            <!-- Competitor Advantage -->
            <div class="bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-lg font-semibold text-red-800 dark:text-red-300">Competitor Advantage</h4>
                  <p class="text-base text-red-600 dark:text-red-400">Competitors mentioned more than brand</p>
                </div>
                <div class="text-3xl font-bold text-red-800 dark:text-red-300">{{ positioningMetrics.competitorAdvantage }}</div>
              </div>
            </div>

            <!-- Opportunity -->
            <div class="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="text-lg font-semibold text-blue-800 dark:text-blue-300">Opportunity</h4>
                  <p class="text-base text-blue-600 dark:text-blue-400">Only competitors mentioned</p>
                </div>
                <div class="text-3xl font-bold text-blue-800 dark:text-blue-300">{{ positioningMetrics.opportunity }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Co-occurrence Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand-Competitor Co-occurrence</h3>
        </div>
      </div>
      <div class="p-8">
        <div v-if="cooccurrenceData.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Competitor
                </th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Co-occurrences
                </th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Brand Win Rate
                </th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Avg Brand Sentiment
                </th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Context
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <tr v-for="competitor in cooccurrenceData" :key="competitor.name" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="text-base font-semibold text-gray-900 dark:text-white">{{ competitor.name }}</div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="text-base text-gray-900 dark:text-white">{{ competitor.cooccurrences }}</div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ formatPercentage(competitor.brandWinRate) }}</div>
                    <div class="ml-3">
                      <span v-if="competitor.brandWinRate > 60" class="text-green-500 dark:text-green-400 text-lg">▲</span>
                      <span v-else-if="competitor.brandWinRate < 40" class="text-red-500 dark:text-red-400 text-lg">▼</span>
                      <span v-else class="text-yellow-500 dark:text-yellow-400 text-lg">●</span>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="text-base text-gray-900 dark:text-white">{{ formatNumber(competitor.avgBrandSentiment) }}</div>
                </td>
                <td class="px-8 py-6">
                  <div class="text-base text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ competitor.commonContext }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 dark:text-gray-400 text-center py-12">
          No brand-competitor co-occurrences found in the current data set.
        </div>
      </div>
    </div>

    <!-- Query Type Performance -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Performance by Query Type</h3>
        </div>
      </div>
      <div class="p-8">
        <div v-if="queryTypePerformance.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="queryType in queryTypePerformance" :key="queryType.type" class="space-y-6">
            <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ queryType.type }}</h4>

            <!-- Brand vs Competitor Chart -->
            <div class="space-y-4">
              <div class="flex justify-between text-base">
                <span class="text-orange-600 dark:text-orange-400 font-semibold">Brand</span>
                <span class="text-gray-900 dark:text-white font-semibold">{{ formatPercentage(queryType.brandRate) }}</span>
              </div>
              <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full transition-all duration-500"
                  :style="`width: ${queryType.brandRate}%`"
                ></div>
              </div>

              <div class="flex justify-between text-base">
                <span class="text-blue-600 dark:text-blue-400 font-semibold">Competitors</span>
                <span class="text-gray-900 dark:text-white font-semibold">{{ formatPercentage(queryType.competitorRate) }}</span>
              </div>
              <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-500"
                  :style="`width: ${queryType.competitorRate}%`"
                ></div>
              </div>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ queryType.totalQueries }} queries analyzed
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 dark:text-gray-400 text-center py-12">
          No query type data available for performance analysis.
        </div>
      </div>
    </div>

    <!-- Key Insights -->
    <div class="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl p-8">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-1">
          <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-800/50 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <h5 class="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Key Competitive Insights</h5>
          <div class="text-base text-indigo-700 dark:text-indigo-400 space-y-2">
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
        return 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white'
    }
  }
  return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors'
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
  if (!props.data.analysis_queries) return []

  return props.data.analysis_queries.filter(query => {
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
    q.brand_mentioned && q.brand_mention_type !== 'implicit' &&
    (q.brand_mention_count || 0) > (q.competitor_count || 0)
  ).length

  const competitiveQueries = queries.filter(q =>
    q.brand_mentioned && q.brand_mention_type !== 'implicit' && q.competitor_count > 0
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
    const brandMentioned = (query.brand_mentioned && query.brand_mention_type !== 'implicit') || false

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
    if (query.brand_mentioned && query.brand_mention_type !== 'implicit' && query.competitor_mentioned_names) {
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

    if (query.brand_mentioned && query.brand_mention_type !== 'implicit') {
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