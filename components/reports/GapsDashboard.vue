<template>
  <div class="gaps-dashboard" data-dashboard-version="v2-query-only">
    <!-- Top Section: Gap Severity Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Opportunity -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Opportunity</h3>
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ opportunity }}</div>
        <p class="text-sm text-gray-600 dark:text-gray-400">You're cited, no competitors</p>
      </div>

      <!-- Competitor Advantage -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Competitor Advantage</h3>
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ competitorAdvantage }}</div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Competitors have the advantage</p>
      </div>

      <!-- Competitive -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Competitive</h3>
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ competitive }}</div>
        <p class="text-sm text-gray-600 dark:text-gray-400">You and competitors both mentioned</p>
      </div>

      <!-- Defending -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Defending</h3>
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ defending }}</div>
        <p class="text-sm text-gray-600 dark:text-gray-400">You're cited, maintain position</p>
      </div>
    </div>

    <!-- Visual Intelligence Layer -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Visualization 1: Competitor Mentions -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Competitor Mentions</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">How often do our competitors show up in queries?</p>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="competitor in competitiveLandscape"
            :key="competitor.name"
            class="relative cursor-pointer group"
            @click="filterByCompetitor(competitor.name, competitor.isClient)"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" :class="competitor.isClient ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'">
                {{ competitor.name }}
              </span>
              <span class="text-sm font-bold tabular-nums" :class="competitor.isClient ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'">
                {{ competitor.count }}
              </span>
            </div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700/30 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
              <div
                :class="competitor.isClient ? 'bg-orange-500' : 'bg-blue-500'"
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

      <!-- Visualization 2: Topic Cluster Opportunities -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Topic Cluster Opportunities</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Where do our competitors have an advantage?</p>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="topic in priorityTopics"
            :key="topic.name"
            class="relative cursor-pointer group"
            @click="scrollToTopic(topic.name)"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {{ topic.name }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  ({{ topic.queryCount }} queries)
                </span>
              </div>
              <span class="text-sm font-bold tabular-nums" :class="getSeverityTextClass(topic.competitorOwnedPercentage)">
                {{ topic.competitorOwnedPercentage }}%
              </span>
            </div>
            <div class="h-8 bg-gray-100 dark:bg-gray-700/30 rounded-lg overflow-hidden mb-1">
              <div
                :class="getSeverityBarClass(topic.severity)"
                class="h-full transition-all duration-500 ease-out flex items-center justify-center"
                :style="{ width: topic.competitorOwnedPercentage + '%' }"
              >
                <span v-if="topic.competitorOwnedPercentage > 20" class="text-xs font-medium text-white">
                  {{ topic.competitorAdvantageQueries }} of {{ topic.queryCount }}
                </span>
              </div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              competitor-owned
            </div>
          </div>

          <div v-if="priorityTopics.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No gap topics identified
          </div>
        </div>
      </div>
    </div>

    <!-- Gap Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 mb-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gap Analysis</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <span v-if="viewMode === 'topic'">{{ filteredTopicClusters.length }} topics with {{ totalGapQueriesInClusters }} gap queries</span>
              <span v-else-if="selectedCompetitor">Queries owned by {{ selectedCompetitor }}</span>
              <span v-else>{{ competitorClusters.length }} competitors with gap queries</span>
            </p>
          </div>
        </div>

        <!-- View Toggle & Filters -->
        <div class="flex items-center gap-3">
          <!-- View Mode Toggle -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded-lg p-1">
            <button
              @click="viewMode = 'topic'; selectedCompetitor = null"
              class="px-3 py-1.5 text-xs font-medium rounded transition-all duration-150"
              :class="[
                viewMode === 'topic' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              ]"
            >
              By Topic
            </button>
            <button
              @click="viewMode = 'competitor'; selectedCompetitor = null"
              class="px-3 py-1.5 text-xs font-medium rounded transition-all duration-150"
              :class="[
                viewMode === 'competitor' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              ]"
            >
              By Competitor
            </button>
          </div>

          <!-- Filters -->
          <div v-if="viewMode === 'topic'" class="flex items-center gap-3">
          <select
            v-model="gapTypeFilter"
            class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Queries</option>
            <option value="opportunity">Opportunity</option>
            <option value="competitor_advantage">Competitor Advantage</option>
            <option value="competitive">Competitive</option>
            <option value="defending">Defending</option>
          </select>

          <select
            v-model="sortBy"
            class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="severity">Gap Severity</option>
            <option value="competitors">Competitor Count</option>
            <option value="topic">Topic Name</option>
          </select>
          </div>
        </div>
      </div>

      <!-- Topic View -->
      <div v-if="viewMode === 'topic'" class="space-y-3">
        <div
          v-for="cluster in sortedClusters"
          :key="cluster.topic"
          :id="`topic-${cluster.topic}`"
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 scroll-mt-4"
        >
          <!-- Cluster Header -->
          <div
            @click="toggleCluster(cluster.topic)"
            class="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center gap-4 flex-1">
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
                :class="{ 'rotate-90': expandedClusters.includes(cluster.topic) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ cluster.topic }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ cluster.brandMentions }} of {{ cluster.totalQueries }} queries mention you
                  <span v-if="cluster.topCompetitor" class="ml-2">
                    | <span class="text-orange-600 dark:text-orange-400 font-medium">{{ cluster.topCompetitor.name }}</span> mentioned in {{ cluster.topCompetitor.count }}
                  </span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ cluster.totalQueries }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">queries</div>
              </div>
            </div>
          </div>

          <!-- Expanded Cluster Details -->
          <div v-if="expandedClusters.includes(cluster.topic)" class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-3">
              <div
                v-for="query in cluster.queries"
                :key="query.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <!-- Query Header -->
                <div
                  @click="toggleExpandQuery(query.id)"
                  class="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div class="flex items-start gap-2 flex-1 min-w-0">
                    <svg
                      class="w-4 h-4 mt-0.5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                      :class="{ 'rotate-90': expandedQueryIds.includes(query.id) }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-gray-900 dark:text-white mb-1">{{ query.query_text }}</p>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                              :class="getPlatformClass(query.data_source)">
                          {{ formatPlatform(query.data_source) }}
                        </span>
                        <span
                          v-if="!query.brand_mentioned || query.brand_mention_type === 'implicit'"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        >
                          Not Mentioned
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        >
                          Mentioned
                        </span>
                        <span
                          v-if="query.competitor_count > 0"
                          class="text-xs text-gray-600 dark:text-gray-400"
                        >
                          {{ query.competitor_count }} competitor{{ query.competitor_count > 1 ? 's' : '' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Expanded Query Details: 2/3 Response + 1/3 Citations -->
                <div v-if="expandedQueryIds.includes(query.id)" class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div class="grid grid-cols-3 gap-4">
                    <!-- Left 2/3: Model Response -->
                    <div class="col-span-2">
                      <h5 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Model Response</h5>
                      <div class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-h-96 overflow-y-auto">
                        <p v-if="query.model_response">{{ query.model_response }}</p>
                        <p v-else class="text-gray-400 dark:text-gray-500 italic">No response available</p>
                      </div>
                    </div>

                    <!-- Right 1/3: Citations -->
                    <div class="col-span-1">
                      <h5 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Citations ({{ query.citation_count || 0 }})
                      </h5>
                      <div v-if="query.citation_count > 0" class="space-y-2 max-h-96 overflow-y-auto">
                        <div
                          v-for="(citation, idx) in getCitationsForQuery(query)"
                          :key="idx"
                          class="p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <div class="text-xs font-medium text-gray-900 dark:text-white mb-1">[{{ idx + 1 }}]</div>
                          <a
                            v-if="citation.url"
                            :href="citation.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-xs text-blue-600 dark:text-blue-400 hover:underline break-words"
                          >
                            {{ citation.domain || citation.url }}
                          </a>
                          <div v-if="citation.isClient || citation.isCompetitor" class="flex gap-1 mt-1">
                            <span
                              v-if="citation.isClient"
                              class="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              You
                            </span>
                            <span
                              v-if="citation.isCompetitor"
                              class="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            >
                              Competitor
                            </span>
                          </div>
                        </div>
                      </div>
                      <p v-else class="text-xs text-gray-400 dark:text-gray-500 italic">No citations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Competitor View -->
      <div v-else class="space-y-3">
        <!-- Clear Filter Button (if specific competitor selected) -->
        <div v-if="selectedCompetitor" class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
              Showing queries owned by <strong>{{ selectedCompetitor }}</strong>
            </span>
          </div>
          <button
            @click="selectedCompetitor = null"
            class="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium"
          >
            Clear filter
          </button>
        </div>

        <!-- Competitor Clusters -->
        <div
          v-for="competitor in displayedCompetitorClusters"
          :key="competitor.name"
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 scroll-mt-4"
        >
          <!-- Competitor Header -->
          <div
            @click="toggleCluster(competitor.name)"
            class="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex items-center gap-4 flex-1">
              <svg
                class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
                :class="{ 'rotate-90': expandedClusters.includes(competitor.name) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ competitor.name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ competitor.totalQueries }} queries where they're mentioned (but you're not)
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ competitor.topicCount }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">topics</div>
              </div>
            </div>
          </div>

          <!-- Expanded: Topics within Competitor -->
          <div v-if="expandedClusters.includes(competitor.name)" class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-4">
              <div
                v-for="topic in competitor.topics"
                :key="topic.name"
                class="border-l-2 border-blue-500 pl-4"
              >
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ topic.name }} ({{ topic.queries.length }} queries)</h5>
                <div class="space-y-2">
                  <div
                    v-for="query in topic.queries"
                    :key="query.id"
                    class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors"
                    @click="toggleExpandQuery(query.id)"
                  >
                    <div class="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                      <svg
                        class="w-3 h-3 mt-0.5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                        :class="{ 'rotate-90': expandedQueryIds.includes(query.id) }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{{ query.query_text }}</span>
                    </div>

                    <!-- Expanded Query Details -->
                    <div v-if="expandedQueryIds.includes(query.id)" class="mt-2 ml-5 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                      <div class="grid grid-cols-3 gap-4">
                        <div class="col-span-2">
                          <h6 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Model Response</h6>
                          <div class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-h-48 overflow-y-auto">
                            <p v-if="query.model_response">{{ query.model_response }}</p>
                            <p v-else class="text-gray-400 dark:text-gray-500 italic">No response available</p>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <h6 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Citations ({{ query.citation_count || 0 }})</h6>
                          <div v-if="query.citation_count > 0" class="space-y-2 max-h-48 overflow-y-auto">
                            <div
                              v-for="(citation, idx) in getCitationsForQuery(query)"
                              :key="idx"
                              class="p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-200 dark:border-gray-600"
                            >
                              <div class="text-xs font-medium text-gray-900 dark:text-white mb-1">[{{ idx + 1 }}]</div>
                              <a
                                v-if="citation.url"
                                :href="citation.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-blue-600 dark:text-blue-400 hover:underline break-words"
                              >
                                {{ citation.domain || citation.url }}
                              </a>
                            </div>
                          </div>
                          <p v-else class="text-xs text-gray-400 dark:text-gray-500 italic">No citations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- What We're Learning Section -->
    <div class="mt-8 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div
        @click="showInsights = !showInsights"
        class="flex items-center justify-between p-6 cursor-pointer bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">What We're Learning</h3>
        </div>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': showInsights }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div v-if="showInsights" class="p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Competitor Dominance -->
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Competitor Dominance by Topic</h4>
            <div class="space-y-2">
              <div v-for="insight in competitorDominance" :key="insight.competitor" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ insight.competitor }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ insight.topic }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-orange-600 dark:text-orange-400">{{ insight.mentions }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">mentions</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Platform Differences -->
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Platform Differences</h4>
            <div class="space-y-3">
              <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ChatGPT
                  </span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">vs</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Perplexity
                  </span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ platformDifference }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// State
const expandedClusters = ref([])
const expandedQueryIds = ref([]) // For query expansion within clusters
const showInsights = ref(false)
const gapTypeFilter = ref('all')
const sortBy = ref('severity')
const currentGapPage = ref(1)
const pageSize = ref(25)
const viewMode = ref('topic') // 'topic' or 'competitor'
const selectedCompetitor = ref(null) // For filtering by specific competitor

// Get queries
const queries = computed(() => props.data?.analysis_queries || [])

// Top Section Metrics (aligned with brand-performance terminology)
const opportunity = computed(() => {
  // Opportunity: You're cited, no competitors
  return queries.value.filter(q => {
    const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
    return isBrandMentioned && (!q.competitor_count || q.competitor_count === 0)
  }).length
})

const competitorAdvantage = computed(() => {
  // Competitor Advantage: Competitors have the advantage (excluding implicit mentions)
  return queries.value.filter(q => {
    const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
    const hasCompetitors = q.competitor_count > 0
    // Either not mentioned at all, or mentioned but competitors have advantage
    return (!isBrandMentioned && hasCompetitors) ||
           (isBrandMentioned && hasCompetitors && q.query_competition === 'competitor_advantage')
  }).length
})

const competitive = computed(() => {
  // Competitive: You and competitors both mentioned
  return queries.value.filter(q => {
    const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
    const hasCompetitors = q.competitor_count > 0
    return isBrandMentioned && hasCompetitors && q.query_competition === 'competitive'
  }).length
})

const defending = computed(() => {
  // Defending: You're cited, maintain position
  return queries.value.filter(q => {
    const isBrandMentioned = q.brand_mentioned && q.brand_mention_type !== 'implicit'
    const hasCompetitors = q.competitor_count > 0
    return isBrandMentioned && hasCompetitors && q.query_competition === 'defending'
  }).length
})

// Topic Clusters
const topicClusters = computed(() => {
  const clusters = {}

  queries.value.forEach(query => {
    const topic = query.query_topic || 'Uncategorized'
    if (!clusters[topic]) {
      clusters[topic] = {
        topic,
        queries: [],
        totalQueries: 0,
        brandMentions: 0,
        competitorCounts: {}
      }
    }

    clusters[topic].queries.push(query)
    clusters[topic].totalQueries++

    if (query.brand_mentioned && query.brand_mention_type !== 'implicit') {
      clusters[topic].brandMentions++
    }

    // Track competitor mentions
    if (query.competitor_mentioned_names) {
      query.competitor_mentioned_names.forEach(comp => {
        clusters[topic].competitorCounts[comp] = (clusters[topic].competitorCounts[comp] || 0) + 1
      })
    }
  })

  return Object.values(clusters).map(cluster => {
    // Calculate severity
    const gapRatio = 1 - (cluster.brandMentions / cluster.totalQueries)
    const competitorPresence = Object.keys(cluster.competitorCounts).length
    let severity = 'low'

    if (gapRatio > 0.7 && competitorPresence > 2) severity = 'high'
    else if (gapRatio > 0.4 || competitorPresence > 1) severity = 'medium'

    // Get top competitor
    const topCompetitorEntry = Object.entries(cluster.competitorCounts)
      .sort((a, b) => b[1] - a[1])[0]

    return {
      ...cluster,
      severity,
      topCompetitor: topCompetitorEntry ? {
        name: topCompetitorEntry[0],
        count: topCompetitorEntry[1]
      } : null
    }
  })
})

const sortedClusters = computed(() => {
  const clusters = [...filteredTopicClusters.value]

  if (sortBy.value === 'severity') {
    return clusters.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  } else if (sortBy.value === 'competitors') {
    return clusters.sort((a, b) => {
      const aCompCount = Object.values(a.competitorCounts).reduce((sum, count) => sum + count, 0)
      const bCompCount = Object.values(b.competitorCounts).reduce((sum, count) => sum + count, 0)
      return bCompCount - aCompCount
    })
  } else if (sortBy.value === 'topic') {
    return clusters.sort((a, b) => a.topic.localeCompare(b.topic))
  }

  return clusters
})

// Gap Queries with type classification (using brand-performance terminology)
const gapQueries = computed(() => {
  return queries.value.map(query => {
    const gapType = getQueryGapType(query)

    return {
      ...query,
      gapType
    }
  }).filter(q => q.gapType !== null)
})

const filteredGapQueries = computed(() => {
  if (gapTypeFilter.value === 'all') {
    return gapQueries.value
  }
  return gapQueries.value.filter(q => q.gapType === gapTypeFilter.value)
})

const sortedGapQueries = computed(() => {
  const sorted = [...filteredGapQueries.value]

  if (sortBy.value === 'severity') {
    return sorted.sort((a, b) => {
      const severityOrder = { competitor_advantage: 3, competitive: 2, defending: 1, opportunity: 0 }
      return (severityOrder[b.gapType] || 0) - (severityOrder[a.gapType] || 0)
    })
  } else if (sortBy.value === 'competitors') {
    return sorted.sort((a, b) => (b.competitor_count || 0) - (a.competitor_count || 0))
  } else if (sortBy.value === 'platform') {
    return sorted.sort((a, b) => (a.data_source || '').localeCompare(b.data_source || ''))
  } else if (sortBy.value === 'topic') {
    return sorted.sort((a, b) => (a.query_topic || '').localeCompare(b.query_topic || ''))
  }

  return sorted
})

const totalGapPages = computed(() => Math.ceil(sortedGapQueries.value.length / pageSize.value))

const paginatedGapQueries = computed(() => {
  const start = (currentGapPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedGapQueries.value.slice(start, end)
})

// Insights
const competitorDominance = computed(() => {
  const dominance = []

  topicClusters.value.forEach(cluster => {
    Object.entries(cluster.competitorCounts).forEach(([competitor, count]) => {
      dominance.push({
        competitor,
        topic: cluster.topic,
        mentions: count
      })
    })
  })

  return dominance.sort((a, b) => b.mentions - a.mentions).slice(0, 5)
})

const platformDifference = computed(() => {
  const chatgptQueries = queries.value.filter(q => q.data_source === 'chatgpt')
  const perplexityQueries = queries.value.filter(q => q.data_source === 'perplexity')

  const chatgptMentionRate = chatgptQueries.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit').length / (chatgptQueries.length || 1) * 100
  const perplexityMentionRate = perplexityQueries.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit').length / (perplexityQueries.length || 1) * 100

  const diff = Math.abs(chatgptMentionRate - perplexityMentionRate).toFixed(1)

  if (chatgptMentionRate > perplexityMentionRate) {
    return `ChatGPT mentions your brand ${diff}% more often than Perplexity`
  } else {
    return `Perplexity mentions your brand ${diff}% more often than ChatGPT`
  }
})

// Filter and sort topic clusters based on gap type and sort preferences
const filteredTopicClusters = computed(() => {
  let filtered = topicClusters.value

  // Apply gap type filter to queries within each cluster
  if (gapTypeFilter.value !== 'all') {
    filtered = filtered.map(cluster => {
      const filteredQueries = cluster.queries.filter(q => {
        const gapType = getQueryGapType(q)
        return gapType === gapTypeFilter.value
      })

      return {
        ...cluster,
        queries: filteredQueries,
        totalQueries: filteredQueries.length,
        brandMentions: filteredQueries.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit').length
      }
    }).filter(cluster => cluster.totalQueries > 0)
  }

  return filtered
})

const totalGapQueriesInClusters = computed(() => {
  return filteredTopicClusters.value.reduce((sum, cluster) => sum + cluster.totalQueries, 0)
})

// Competitive Citation Landscape - Show top competitors by mention count
const competitiveLandscape = computed(() => {
  const competitorMentions = new Map()
  let brandMentionCount = 0

  // Count mentions across all queries
  queries.value.forEach(query => {
    // Count brand mentions
    if (query.brand_mentioned && query.brand_mention_type !== 'implicit') {
      brandMentionCount++
    }

    // Count competitor mentions
    if (query.competitor_mentioned_names && query.competitor_mentioned_names.length > 0) {
      query.competitor_mentioned_names.forEach(competitor => {
        competitorMentions.set(competitor, (competitorMentions.get(competitor) || 0) + 1)
      })
    }
  })

  // Convert to array and add brand
  const landscape = []

  // Add brand (client)
  if (props.client?.name) {
    landscape.push({
      name: props.client.name,
      count: brandMentionCount,
      isClient: true
    })
  }

  // Add competitors
  competitorMentions.forEach((count, name) => {
    landscape.push({
      name,
      count,
      isClient: false
    })
  })

  // Sort by count descending and take top 6
  landscape.sort((a, b) => b.count - a.count)
  const topLandscape = landscape.slice(0, 6)

  // Calculate percentages for bar widths
  const maxCount = topLandscape.length > 0 ? topLandscape[0].count : 1
  topLandscape.forEach(item => {
    item.percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
  })

  return topLandscape
})

// High-Priority Topic Clusters - Focus on competitor advantage gaps
const priorityTopics = computed(() => {
  // Calculate gap severity score for each topic cluster
  const scoredTopics = topicClusters.value.map(cluster => {
    // Count competitor advantage queries (competitors mentioned, brand not mentioned)
    let competitorAdvantageQueries = 0
    let totalCompetitorMentions = 0
    let brandMentions = 0

    cluster.queries.forEach(query => {
      const isBrandMentioned = query.brand_mentioned && query.brand_mention_type !== 'implicit'
      const hasCompetitors = query.competitor_count > 0

      // Count queries where competitors have advantage (mentioned but brand is not)
      if (hasCompetitors && !isBrandMentioned) {
        competitorAdvantageQueries++
        totalCompetitorMentions += query.competitor_count
      }

      if (isBrandMentioned) {
        brandMentions++
      }
    })

    // Calculate percentage of queries where competitors have advantage
    const competitorOwnedPercentage = cluster.totalQueries > 0
      ? Math.round((competitorAdvantageQueries / cluster.totalQueries) * 100)
      : 0

    // Determine severity category based on percentage
    let severity = 'low'
    if (competitorOwnedPercentage >= 70) severity = 'high'
    else if (competitorOwnedPercentage >= 40) severity = 'medium'

    return {
      name: cluster.topic,
      queryCount: cluster.totalQueries,
      competitorAdvantageQueries,
      competitorOwnedPercentage,
      severity,
      totalCompetitorMentions,
      brandMentions
    }
  })

  // Sort by query count descending (topics with most queries first)
  const sortedTopics = scoredTopics
    .filter(topic => topic.competitorOwnedPercentage > 0 && topic.competitorAdvantageQueries > 0) // Only show topics where competitors have advantage
    .sort((a, b) => b.queryCount - a.queryCount)
    .slice(0, 6) // Limit to top 6 topics

  return sortedTopics
})

// Competitor Clusters - Group queries by competitor, then by topic
const competitorClusters = computed(() => {
  const clusters = new Map()

  // Group queries where competitors are mentioned but brand is not
  queries.value.forEach(query => {
    const isBrandMentioned = query.brand_mentioned && query.brand_mention_type !== 'implicit'
    const hasCompetitors = query.competitor_mentioned_names && query.competitor_mentioned_names.length > 0

    // Only include queries where competitor is mentioned but brand is not
    if (hasCompetitors && !isBrandMentioned) {
      query.competitor_mentioned_names.forEach(competitorName => {
        if (!clusters.has(competitorName)) {
          clusters.set(competitorName, {
            name: competitorName,
            topics: new Map(),
            totalQueries: 0
          })
        }

        const competitor = clusters.get(competitorName)
        const topic = query.query_topic || 'Uncategorized'

        if (!competitor.topics.has(topic)) {
          competitor.topics.set(topic, {
            name: topic,
            queries: []
          })
        }

        competitor.topics.get(topic).queries.push(query)
        competitor.totalQueries++
      })
    }
  })

  // Convert to array and add topic count
  return Array.from(clusters.values()).map(competitor => ({
    ...competitor,
    topics: Array.from(competitor.topics.values()),
    topicCount: competitor.topics.size
  })).sort((a, b) => b.totalQueries - a.totalQueries)
})

// Displayed Competitor Clusters (filtered if specific competitor selected)
const displayedCompetitorClusters = computed(() => {
  if (selectedCompetitor.value) {
    return competitorClusters.value.filter(c => c.name === selectedCompetitor.value)
  }
  return competitorClusters.value
})

// Helper to determine gap type for a query (maps to brand-performance terminology)
const getQueryGapType = (query) => {
  const isBrandMentioned = query.brand_mentioned && query.brand_mention_type !== 'implicit'
  const hasCompetitors = query.competitor_count > 0

  // Opportunity: You're mentioned without competitor presence
  if (isBrandMentioned && !hasCompetitors) {
    return 'opportunity'
  }

  // Competitor Advantage: Not mentioned at all (excluding implicit), or competitors have advantage
  if ((!isBrandMentioned && hasCompetitors) ||
      (isBrandMentioned && hasCompetitors && query.query_competition === 'competitor_advantage')) {
    return 'competitor_advantage'
  }

  // Both you and competitors are mentioned - check query_competition field
  if (isBrandMentioned && hasCompetitors) {
    // Use the query_competition field which should contain: defending, competitive, or competitor_advantage
    if (query.query_competition === 'defending') {
      return 'defending'
    }
    if (query.query_competition === 'competitive') {
      return 'competitive'
    }
    // Default to competitive if query_competition not set
    return 'competitive'
  }

  return null
}

// Get citations for a specific query
const getCitationsForQuery = (query) => {
  // Parse citation numbers from model response
  if (!query.model_response) return []

  const citations = []
  const citationRegex = /\[(\d+)\]/g
  let match

  while ((match = citationRegex.exec(query.model_response)) !== null) {
    const citationNumber = parseInt(match[1])
    if (!citations.find(c => c.number === citationNumber)) {
      citations.push({
        number: citationNumber,
        url: null, // Would need to extract from response or have separate citation data
        domain: `Citation ${citationNumber}`,
        isClient: false,
        isCompetitor: false
      })
    }
  }

  return citations.sort((a, b) => a.number - b.number)
}

// Methods
const toggleCluster = (topic) => {
  const index = expandedClusters.value.indexOf(topic)
  if (index > -1) {
    expandedClusters.value.splice(index, 1)
  } else {
    expandedClusters.value.push(topic)
  }
}

const toggleExpandQuery = (queryId) => {
  const index = expandedQueryIds.value.indexOf(queryId)
  if (index > -1) {
    expandedQueryIds.value.splice(index, 1)
  } else {
    expandedQueryIds.value.push(queryId)
  }
}

const scrollToTopic = (topicName) => {
  // Make sure we're in topic view
  viewMode.value = 'topic'

  // Set filter to show competitor advantage queries (since these are the gap opportunities)
  gapTypeFilter.value = 'competitor_advantage'

  // Expand the cluster if not already expanded
  if (!expandedClusters.value.includes(topicName)) {
    expandedClusters.value.push(topicName)
  }

  // Wait for DOM update, then scroll
  setTimeout(() => {
    const element = document.getElementById(`topic-${topicName}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const filterByCompetitor = (competitorName, isClient) => {
  // Don't filter if clicking on the client brand
  if (isClient) return

  // Switch to competitor view and filter by this competitor
  viewMode.value = 'competitor'
  selectedCompetitor.value = competitorName

  // Scroll to Gap Analysis section
  setTimeout(() => {
    const element = document.querySelector('.gaps-dashboard > div:nth-child(3)')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const getSeverityBarClass = (severity) => {
  const classes = {
    high: 'bg-red-500',
    medium: 'bg-orange-500',
    low: 'bg-yellow-500'
  }
  return classes[severity] || classes.low
}

const getSeverityTextClass = (percentage) => {
  if (percentage >= 70) return 'text-red-600 dark:text-red-400'
  if (percentage >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-yellow-600 dark:text-yellow-400'
}

const getContentGapInsight = (query) => {
  const competitors = query.competitor_mentioned_names?.join(', ') || 'Competitors'
  const topic = query.query_topic || 'this topic'

  if (query.gapType === 'competitor_advantage') {
    return `${competitors} have the advantage. Consider creating content on ${topic} that demonstrates expertise in this area.`
  } else if (query.gapType === 'competitive') {
    return `Competitive query with ${competitors}. Strengthen your content on ${topic} to gain advantage.`
  } else if (query.gapType === 'defending') {
    return `You're mentioned alongside ${competitors}. Monitor and maintain your position on ${topic}.`
  } else if (query.gapType === 'opportunity') {
    return `You're cited without competition. Leverage this advantage on ${topic}.`
  } else {
    return `Review this query for optimization opportunities on ${topic}.`
  }
}

// Formatting helpers
const formatText = (text) => {
  if (!text) return 'N/A'
  return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatPlatform = (platform) => {
  if (!platform) return 'Unknown'
  return platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity'
}

const formatGapType = (type) => {
  const map = {
    opportunity: 'Opportunity',
    competitor_advantage: 'Competitor Advantage',
    competitive: 'Competitive',
    defending: 'Defending'
  }
  return map[type] || type
}

const formatSentiment = (score) => {
  if (score >= 0.5) return 'Positive'
  if (score <= -0.5) return 'Negative'
  return 'Neutral'
}

const getActionSuggestion = (gapType) => {
  const map = {
    competitor_advantage: 'Create content',
    competitive: 'Strengthen authority',
    defending: 'Maintain position',
    opportunity: 'Leverage advantage'
  }
  return map[gapType] || 'Review'
}

// Style helpers
const getSeverityClass = (severity) => {
  const map = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return map[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const getPlatformClass = (platform) => {
  if (platform === 'chatgpt') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

const getGapTypeClass = (type) => {
  const map = {
    competitor_advantage: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    competitive: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    defending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    opportunity: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return map[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const getCompetitionClass = (competition) => {
  const map = {
    defending: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    opportunity: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    competitive: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    competitor_advantage: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return map[competition] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const getSentimentClass = (score) => {
  if (score >= 0.5) return 'text-green-600 dark:text-green-400 font-medium'
  if (score <= -0.5) return 'text-red-600 dark:text-red-400 font-medium'
  return 'text-gray-600 dark:text-gray-400'
}
</script>

<style scoped>
.gaps-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
