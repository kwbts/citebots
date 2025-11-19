<template>
  <div class="overview-dashboard">
    <!-- Section 1: Brand Query Performance (Donut Chart) -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Query Performance</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Mentions across queries and platforms</p>
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Column: Donut Chart (vertically centered) -->
          <div class="flex flex-col justify-center items-center">
            <div class="flex justify-center mb-4">
              <SeoScoreGauge :score="brandVisibilityRate / 100" :percentDisplay="true" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-center">
              {{ brandMentionCount }} of {{ totalQueries }} queries
            </p>
          </div>

          <!-- Right Column: Two Breakdowns -->
          <div class="flex flex-col justify-center">
            <!-- Query Competition Breakdown -->
            <div v-if="queryCompetitionBreakdown?.length" class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Query Competition</h4>
              <div class="space-y-3">
                <div
                  v-for="level in queryCompetitionBreakdown"
                  :key="level.name"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :class="getCompetitionColor(level.name)"
                    ></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ level.label }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {{ level.count }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ totalQueries }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ level.percentage }}%)</span>
                    </span>
                    <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-2 rounded-full transition-all duration-700"
                        :class="getCompetitionBgColor(level.name)"
                        :style="{ width: `${level.percentage}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competitor Performance Breakdown (Top 4 only, gray bars) -->
            <div v-if="topCompetitorBreakdown?.length" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Competitor Performance</h4>
              <div class="space-y-3">
                <div
                  v-for="competitor in topCompetitorBreakdown"
                  :key="competitor.name"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ competitor.name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {{ competitor.mentions }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ totalQueries }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ competitor.mentionRate }}%)</span>
                    </span>
                    <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-2 rounded-full transition-all duration-700 bg-gray-400 dark:bg-gray-500"
                        :style="{ width: `${Math.min((competitor.mentions / totalQueries) * 100, 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Two Side-by-Side Visualizations -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Left: Competitive Citation Landscape -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Competitor Mentions</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total mentions across all queries</p>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="competitor in competitiveLandscape"
            :key="competitor.name"
            class="relative"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium" :class="competitor.isClient ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'">
                {{ competitor.name }}
              </span>
              <span class="text-sm font-bold tabular-nums" :class="competitor.isClient ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'">
                {{ competitor.count }}
              </span>
            </div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700/30 rounded-lg overflow-hidden">
              <div
                :class="competitor.isClient ? 'bg-orange-500' : 'bg-purple-500'"
                class="h-full transition-all duration-500 ease-out"
                :style="{ width: competitor.percentage + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="competitiveLandscape.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No competitor data available
          </div>
        </div>
      </div>

      <!-- Right: Competitor Mentions by Cluster -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Competitor Mentions by Cluster</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Top topic clusters with competitor presence</p>
          </div>
        </div>

        <!-- Topic Cluster Bars -->
        <div class="space-y-3">
          <div
            v-for="cluster in topCompetitorClusters"
            :key="cluster.topic"
            class="relative"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ cluster.topic }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ cluster.queryCount }} queries</span>
            </div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700/30 rounded-lg overflow-hidden">
              <div
                class="h-full bg-indigo-500 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                :style="{ width: cluster.percentage + '%' }"
              >
                <span v-if="cluster.percentage > 15" class="text-xs font-medium text-white">
                  {{ cluster.competitorMentions }} mentions
                </span>
              </div>
            </div>
          </div>

          <div v-if="topCompetitorClusters.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No competitor mentions found
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Response Analysis (Full Width) -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <!-- Header with Filter Tabs -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-teal-50 dark:bg-teal-500/10 border border-teal-200/50 dark:border-teal-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Response Analysis</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Query distribution by {{ getFilterLabel(selectedResponseFilter) }}</p>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex items-center gap-2">
            <button
              v-for="filter in responseFilterOptions"
              :key="filter.value"
              @click="selectedResponseFilter = filter.value"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150',
                selectedResponseFilter === filter.value
                  ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-500/50'
                  : 'bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-teal-200 dark:hover:border-teal-500/30'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Horizontal Bar Chart -->
        <div class="space-y-3">
          <div
            v-for="item in responseDistribution"
            :key="item.name"
            class="relative"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.name }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">({{ item.percentage }}%)</span>
              </div>
            </div>
            <div class="h-10 bg-gray-100 dark:bg-gray-700/30 rounded-lg overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500 ease-out flex items-center justify-between px-3"
                :style="{ width: item.percentage + '%' }"
              >
                <span v-if="item.percentage > 20" class="text-xs font-medium text-white">
                  {{ item.name }}
                </span>
                <span v-if="item.percentage > 10" class="text-xs font-semibold text-white">
                  {{ item.count }} queries
                </span>
              </div>
            </div>
          </div>

          <div v-if="responseDistribution.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No data available for {{ getFilterLabel(selectedResponseFilter) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Action Items -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Column 1: Top Content Opportunities -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Priority Content Gaps</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="gap in topContentGaps"
            :key="gap.topic"
            class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-2 border-red-500"
          >
            <div class="flex items-start justify-between mb-1">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white flex-1">{{ gap.topic }}</h4>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ml-2">
                {{ gap.gapSeverity }}
              </span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {{ gap.queryCount }} queries
            </p>
            <p v-if="gap.topCompetitor" class="text-xs text-gray-500 dark:text-gray-500">
              Dominated by <span class="font-medium text-orange-600 dark:text-orange-400">{{ gap.topCompetitor }}</span>
            </p>
          </div>

          <div v-if="topContentGaps.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No content gaps identified
          </div>
        </div>
      </div>

      <!-- Column 2: Defensive Priorities -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Protect These Positions</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="defend in defensivePriorities"
            :key="defend.id"
            class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-2 border-purple-500"
          >
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
              {{ defend.queryText }}
            </p>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600 dark:text-gray-400">
                {{ defend.competitorCount }} competitor{{ defend.competitorCount > 1 ? 's' : '' }} also cited
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                Defend
              </span>
            </div>
          </div>

          <div v-if="defensivePriorities.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No defensive positions identified
          </div>
        </div>
      </div>

      <!-- Column 3: Quick Wins -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Quick Wins</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="win in quickWins"
            :key="win.id"
            class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-l-2 border-green-500"
          >
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
              {{ win.queryText }}
            </p>
            <div class="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Already mentioned, no competitor citations
            </div>
          </div>

          <div v-if="quickWins.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No quick wins identified
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SeoScoreGauge from './SeoScoreGauge.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  }
})

// Get queries
const queries = computed(() => props.data?.analysis_queries || [])

// Section 1: Hero Metric - Brand Visibility Rate
const brandVisibilityRate = computed(() => {
  if (queries.value.length === 0) return 0

  const visibleQueries = queries.value.filter(q =>
    q.brand_mentioned && q.brand_mention_type !== 'implicit'
  ).length

  return Math.round((visibleQueries / queries.value.length) * 100)
})

// Brand mention count
const brandMentionCount = computed(() => {
  return queries.value.filter(q =>
    q.brand_mentioned && q.brand_mention_type !== 'implicit'
  ).length
})

// Query Competition Breakdown (filter out "Unknown")
const queryCompetitionBreakdown = computed(() => {
  if (!queries.value || queries.value.length === 0) return []

  const competitionLevels = {}
  const total = queries.value.length

  queries.value.forEach(query => {
    const level = query.query_competition || 'unknown'
    competitionLevels[level] = (competitionLevels[level] || 0) + 1
  })

  return Object.entries(competitionLevels)
    .filter(([name]) => name.toLowerCase() !== 'unknown') // Filter out Unknown
    .map(([name, count]) => ({
      name,
      label: getCompetitionLabel(name),
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
})

// Top Competitor Breakdown (Top 4 only)
const topCompetitorBreakdown = computed(() => {
  if (!queries.value || queries.value.length === 0 || !props.competitors) return []

  const competitorMentionMap = {}

  queries.value.forEach(query => {
    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      query.competitor_mentioned_names.forEach(competitor => {
        competitorMentionMap[competitor] = (competitorMentionMap[competitor] || 0) + 1
      })
    }
  })

  return props.competitors
    .map(competitor => {
      const name = competitor.name
      const mentions = competitorMentionMap[name] || 0
      return {
        name,
        mentions,
        mentionRate: totalQueries.value ? Math.round((mentions / totalQueries.value) * 100) : 0
      }
    })
    .filter(comp => comp.mentions > 0)
    .sort((a, b) => b.mentionRate - a.mentionRate)
    .slice(0, 4) // Top 4 only
})

// Trend data (placeholder - would come from historical comparison)
const trendData = ref(null) // null means no historical data yet

const getTrendClass = (trend) => {
  if (trend > 0) return 'text-green-600 dark:text-green-400'
  if (trend < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}

// Helper functions for competition breakdown
const getCompetitionLabel = (level) => {
  return level.charAt(0).toUpperCase() + level.slice(1).replace(/_/g, ' ')
}

const getCompetitionColor = (level) => {
  const levelLower = String(level).toLowerCase()

  if (levelLower.includes('defending')) {
    return 'bg-blue-500 dark:bg-blue-500'
  } else if (levelLower.includes('opportunity')) {
    return 'bg-green-500 dark:bg-green-500'
  } else if (levelLower.includes('competitive')) {
    return 'bg-amber-500 dark:bg-amber-500'
  } else if (levelLower.includes('advantage') || levelLower.includes('competitor')) {
    return 'bg-red-500 dark:bg-red-500'
  }

  return 'bg-gray-500 dark:bg-gray-500'
}

const getCompetitionBgColor = (level) => {
  return getCompetitionColor(level)
}

// Section 2: Competitor Mentions by Cluster
const topCompetitorClusters = computed(() => {
  const topicClusters = new Map()

  queries.value.forEach(query => {
    const topic = query.query_topic || 'Uncategorized'

    if (!topicClusters.has(topic)) {
      topicClusters.set(topic, {
        topic,
        queryCount: 0,
        competitorMentions: 0
      })
    }

    const cluster = topicClusters.get(topic)
    cluster.queryCount++

    if (query.competitor_count > 0) {
      cluster.competitorMentions += query.competitor_count
    }
  })

  const clusters = Array.from(topicClusters.values())
    .filter(c => c.competitorMentions > 0)
    .sort((a, b) => b.competitorMentions - a.competitorMentions)
    .slice(0, 6)

  const maxMentions = clusters.length > 0 ? clusters[0].competitorMentions : 1
  clusters.forEach(cluster => {
    cluster.percentage = (cluster.competitorMentions / maxMentions) * 100
  })

  return clusters
})

// Section 3: Response Analysis
const selectedResponseFilter = ref('category')

const responseFilterOptions = [
  { value: 'category', label: 'Category' },
  { value: 'funnel_stage', label: 'Funnel Stage' },
  { value: 'outcome', label: 'Outcome' },
  { value: 'action', label: 'Action Orientation' }
]

const getFilterLabel = (filterValue) => {
  const option = responseFilterOptions.find(opt => opt.value === filterValue)
  return option ? option.label : filterValue
}

const responseDistribution = computed(() => {
  const distribution = new Map()
  const total = queries.value.length

  queries.value.forEach(query => {
    let key = ''

    switch (selectedResponseFilter.value) {
      case 'category':
        key = query.query_category || 'Uncategorized'
        break
      case 'funnel_stage':
        key = query.funnel_stage || 'Unknown'
        break
      case 'outcome':
        key = query.response_outcome || 'Unknown'
        break
      case 'action':
        key = query.action_orientation || 'Unknown'
        break
    }

    distribution.set(key, (distribution.get(key) || 0) + 1)
  })

  return Array.from(distribution.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
})

// Competitive Citation Landscape (reused from Gaps)
const competitiveLandscape = computed(() => {
  const competitorMentions = new Map()
  let brandMentionCount = 0

  queries.value.forEach(query => {
    if (query.brand_mentioned && query.brand_mention_type !== 'implicit') {
      brandMentionCount++
    }

    if (query.competitor_mentioned_names && query.competitor_mentioned_names.length > 0) {
      query.competitor_mentioned_names.forEach(competitor => {
        competitorMentions.set(competitor, (competitorMentions.get(competitor) || 0) + 1)
      })
    }
  })

  const landscape = []

  if (props.client?.name) {
    landscape.push({
      name: props.client.name,
      count: brandMentionCount,
      isClient: true
    })
  }

  competitorMentions.forEach((count, name) => {
    landscape.push({
      name,
      count,
      isClient: false
    })
  })

  landscape.sort((a, b) => b.count - a.count)
  const topLandscape = landscape.slice(0, 6)

  const maxCount = topLandscape.length > 0 ? topLandscape[0].count : 1
  topLandscape.forEach(item => {
    item.percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
  })

  return topLandscape
})

// Section 3: Action Items

// Top Content Gaps
const topContentGaps = computed(() => {
  const topicClusters = new Map()

  queries.value.forEach(query => {
    const isBrandMentioned = query.brand_mentioned && query.brand_mention_type !== 'implicit'
    const hasCompetitors = query.competitor_count > 0

    // Only count queries where competitors have advantage
    if (!isBrandMentioned && hasCompetitors) {
      const topic = query.query_topic || 'Uncategorized'

      if (!topicClusters.has(topic)) {
        topicClusters.set(topic, {
          topic,
          queryCount: 0,
          competitorMentions: 0,
          competitorNames: new Map()
        })
      }

      const cluster = topicClusters.get(topic)
      cluster.queryCount++
      cluster.competitorMentions += query.competitor_count

      if (query.competitor_mentioned_names) {
        query.competitor_mentioned_names.forEach(name => {
          cluster.competitorNames.set(name, (cluster.competitorNames.get(name) || 0) + 1)
        })
      }
    }
  })

  // Convert to array and add severity
  return Array.from(topicClusters.values())
    .map(cluster => {
      const score = cluster.queryCount * cluster.competitorMentions

      let gapSeverity = 'Low'
      if (score > 30) gapSeverity = 'High'
      else if (score > 10) gapSeverity = 'Medium'

      const topCompetitorEntry = Array.from(cluster.competitorNames.entries())
        .sort((a, b) => b[1] - a[1])[0]

      return {
        topic: cluster.topic,
        queryCount: cluster.queryCount,
        gapSeverity,
        topCompetitor: topCompetitorEntry ? topCompetitorEntry[0] : null
      }
    })
    .sort((a, b) => {
      const severityOrder = { High: 3, Medium: 2, Low: 1 }
      return severityOrder[b.gapSeverity] - severityOrder[a.gapSeverity]
    })
    .slice(0, 5)
})

// Defensive Priorities
const defensivePriorities = computed(() => {
  return queries.value
    .filter(q => {
      const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
      const hasCompetitors = q.competitor_count > 0
      return isBrandMentioned && hasCompetitors
    })
    .sort((a, b) => (b.competitor_count || 0) - (a.competitor_count || 0))
    .slice(0, 5)
    .map(q => ({
      id: q.id,
      queryText: q.query_text,
      competitorCount: q.competitor_count || 0
    }))
})

// Quick Wins
const quickWins = computed(() => {
  return queries.value
    .filter(q => {
      const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
      const hasCompetitors = q.competitor_count > 0
      // Brand mentioned but no competitors
      return isBrandMentioned && !hasCompetitors
    })
    .slice(0, 5)
    .map(q => ({
      id: q.id,
      queryText: q.query_text
    }))
})
</script>

<style scoped>
.overview-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
