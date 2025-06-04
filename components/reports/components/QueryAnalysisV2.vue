<template>
  <div class="mb-6">
    <!-- Component Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ removeControls ? 'Query Analysis' : 'Query Analysis V2' }}</h2>
    </div>

    <!-- Key Metrics Section -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h3>
      </div>

      <!-- Key Metrics Grid - 4 cards in a grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Queries Card -->
      <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Queries</span>
        </div>

        <div class="px-5 pb-5">
          <!-- Total Query Counter -->
          <div class="text-center mb-4">
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalQueries }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">total queries</div>
          </div>

          <!-- Horizontal Bar Chart -->
          <div class="space-y-3">
            <div
              v-for="(platform, index) in platformBreakdown"
              :key="index"
              class="transition-colors duration-150"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getPlatformColorHex(platform.name) }"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ platform.name }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ platform.count }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ platform.percentage }}%)</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${platform.percentage}%`,
                    backgroundColor: getPlatformColorHex(platform.name)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Brand Mention Rate Card -->
      <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex items-center gap-3">
          <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Brand Mention Rate</span>
        </div>

        <div class="px-5 pb-5">
          <!-- Brand Mention Rate Counter -->
          <div class="text-center mb-4">
            <div class="flex items-center justify-center gap-1">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ brandMentionRate }}%</div>
              <div class="text-sm text-gray-500 dark:text-gray-400 pt-2">({{ brandMentions }} mentions)</div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">of queries mention your brand</div>
          </div>

          <!-- Horizontal Bar Chart -->
          <div class="space-y-3">
            <!-- Overall mention rate -->
            <div class="transition-colors duration-150">
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" style="background-color: #f97316;"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Overall</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ brandMentionRate }}%</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ width: `${brandMentionRate}%`, backgroundColor: '#f97316' }"
                ></div>
              </div>
            </div>

            <!-- Platform breakdown -->
            <div
              v-for="(platform, index) in platformMentionRates"
              :key="index"
              class="transition-colors duration-150"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getPlatformColorHex(platform.name) }"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ platform.name }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ platform.rate }}%</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ platform.count }})</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${platform.rate}%`,
                    backgroundColor: getPlatformColorHex(platform.name)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Queries by Intent Card -->
      <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Queries by Intent</span>
        </div>

        <div class="px-5 pb-5">
          <!-- Total Query Counter -->
          <div class="text-center mb-4">
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalQueries }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">total queries</div>
          </div>

          <!-- Horizontal Bar Chart -->
          <div class="space-y-3">
            <div
              v-for="(intent, index) in queryIntentBreakdown.slice(0, 6)"
              :key="index"
              class="transition-colors duration-150"
              :class="{ 'bg-white/50 dark:bg-white/5 rounded-lg': highlightedIntent === intent.name }"
              @mouseenter="highlightedIntent = intent.name"
              @mouseleave="highlightedIntent = null"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getIntentColor(intent.name) }"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatIntentName(intent.name) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ intent.count }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ intent.percentage }}%)</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${intent.percentage}%`,
                    backgroundColor: getIntentColor(intent.name)
                  }"
                ></div>
              </div>
            </div>

            <!-- Show more if there are more intents -->
            <div v-if="queryIntentBreakdown.length > 6" class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              +{{ queryIntentBreakdown.length - 6 }} more intents
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Responses by Outcome Card -->
      <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Responses by Outcome</span>
        </div>

        <div class="px-5 pb-5">
          <!-- Total Responses Counter -->
          <div class="text-center mb-4">
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalQueries }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">total responses</div>
          </div>

          <!-- Horizontal Bar Chart -->
          <div class="space-y-3">
            <div
              v-for="(outcome, index) in responseOutcomeBreakdown.slice(0, 6)"
              :key="index"
              class="transition-colors duration-150"
              :class="{ 'bg-white/50 dark:bg-white/5 rounded-lg': highlightedOutcome === outcome.name }"
              @mouseenter="highlightedOutcome = outcome.name"
              @mouseleave="highlightedOutcome = null"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getOutcomeColor(outcome.name) }"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatText(outcome.name) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ outcome.count }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ outcome.percentage }}%)</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${outcome.percentage}%`,
                    backgroundColor: getOutcomeColor(outcome.name)
                  }"
                ></div>
              </div>
            </div>

            <!-- Show more if there are more outcomes -->
            <div v-if="responseOutcomeBreakdown.length > 6" class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              +{{ responseOutcomeBreakdown.length - 6 }} more outcomes
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Query Analysis Section -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Query Analysis</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Intent Breakdown -->
      <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Query Intent Breakdown</span>
          </div>
        </div>

        <div class="px-5 pb-5">
          <!-- Total Query Counter -->
          <div class="text-center mb-4">
            <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalQueries }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">total queries</div>
          </div>

          <!-- Horizontal Bar Chart -->
          <div class="space-y-3">
            <div
              v-for="(intent, index) in queryIntentBreakdown"
              :key="index"
              class="transition-colors duration-150"
              :class="{ 'bg-white/50 dark:bg-white/5 rounded-lg': highlightedIntent === intent.name }"
              @mouseenter="highlightedIntent = intent.name"
              @mouseleave="highlightedIntent = null"
            >
              <div class="flex justify-between items-center mb-1">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getIntentColor(intent.name) }"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatIntentName(intent.name) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ intent.count }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ intent.percentage }}%)</span>
                </div>
              </div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{
                    width: `${intent.percentage}%`,
                    backgroundColor: getIntentColor(intent.name)
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Query Details Table (spans 2 columns) -->
      <div class="lg:col-span-2 bg-gray-900/5 dark:bg-white/5 rounded-2xl">
        <div class="p-5 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Query Details</span>
          </div>

          <!-- Filter Dropdown -->
          <div class="relative">
            <select
              v-model="tableFilterIntent"
              class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Intents</option>
              <option v-for="intent in queryIntentBreakdown" :key="intent.name" :value="intent.name">{{ formatIntentName(intent.name) }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Expandable Table -->
        <div class="px-5 pb-5">
          <div class="overflow-x-auto max-h-[500px] bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">Query</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intent</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand Mentioned</th>
                  <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <template v-for="(query, index) in filteredTableQueries" :key="query.id || index">
                  <!-- Query Row -->
                  <tr
                    @click="toggleExpandQuery(query.id || index)"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors cursor-pointer"
                  >
                    <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                      <div class="flex items-start">
                        <svg
                          class="w-4 h-4 mr-2 text-gray-400 transition-transform duration-200 flex-shrink-0 mt-0.5"
                          :class="{ 'rotate-90': expandedQueryIds.includes(query.id || index) }"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div class="break-words line-clamp-2 hover:line-clamp-none">
                          {{ query.query_text }}
                        </div>
                      </div>
                    </td>
                    <td class="p-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :style="{ backgroundColor: getIntentBgColor(query.query_intent), color: getIntentTextColor(query.query_intent) }">
                        {{ formatIntentName(query.query_intent) }}
                      </span>
                    </td>
                    <td class="p-3 text-sm">
                      <span v-if="query.brand_mentioned" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        Yes
                      </span>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        No
                      </span>
                    </td>
                    <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                      {{ formatPlatformName(query.data_source) }}
                    </td>
                  </tr>

                  <!-- Expanded Content Row -->
                  <tr v-if="expandedQueryIds.includes(query.id || index)" class="bg-gray-50 dark:bg-gray-800/50">
                    <td colspan="4" class="p-0">
                      <div class="p-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
                        <div class="space-y-4">
                          <!-- Query Details -->
                          <div class="space-y-4">
                            <!-- Full Query Text -->
                            <div>
                              <span class="font-medium text-gray-700 dark:text-gray-300">Query:</span>
                              <p class="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                                {{ query.query_text }}
                              </p>
                            </div>

                            <!-- Additional Query Details -->
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                              <div v-if="query.data_source">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Platform:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                  <span
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    :class="getPlatformBadgeClass(query.data_source)"
                                  >
                                    {{ formatPlatformName(query.data_source) }}
                                  </span>
                                </p>
                              </div>
                              <div v-if="query.query_keyword">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Keyword:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {{ formatText(query.query_keyword) }}
                                  </span>
                                </p>
                              </div>
                              <div v-if="query.funnel_stage">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Funnel Stage:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                                    {{ formatText(query.funnel_stage) }}
                                  </span>
                                </p>
                              </div>
                              <div v-if="query.citation_count !== undefined">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Citations:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                    {{ query.citation_count }}
                                  </span>
                                </p>
                              </div>
                              <div v-if="query.brand_mention_type">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Mention Type:</span>
                                <p class="text-gray-600 dark:text-gray-400">
                                  <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                                    {{ formatText(query.brand_mention_type) }}
                                  </span>
                                </p>
                              </div>
                              <div v-if="query.competitor_mentioned_names && query.competitor_mentioned_names.length > 0">
                                <span class="font-medium text-gray-700 dark:text-gray-300">Competitors:</span>
                                <p class="text-gray-600 dark:text-gray-400 flex flex-wrap gap-1 mt-1">
                                  <span v-for="(comp, idx) in query.competitor_mentioned_names" :key="idx"
                                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                                    {{ comp }}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Empty State -->
                <tr v-if="filteredTableQueries.length === 0">
                  <td colspan="4" class="p-4 text-center text-gray-500 dark:text-gray-400">
                    No queries match the current filter.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Content Opportunity Analysis Section -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Content Opportunity Analysis</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Identify content gaps where competitors are cited but your brand isn't</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Content Gap Score Card -->
        <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
          <div class="p-5 flex items-center gap-3">
            <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Content Gap Score</span>
          </div>

          <div class="px-5 pb-5">
            <div class="flex items-end gap-2 mb-1">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ contentGapScore }}%</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">opportunity</span>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ contentGapQueryCount }} queries with competitor citations only</div>

            <!-- Content gap visualization -->
            <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
              <div class="absolute top-0 left-0 h-full bg-emerald-500 dark:bg-emerald-600 rounded-full"
                  :style="`width: ${contentGapScore}%`"></div>
            </div>

            <!-- Competitor breakdown -->
            <div class="space-y-2">
              <div v-for="(competitor, index) in topCompetitorsInGaps" :key="index">
                <div class="flex justify-between items-center text-xs mb-1">
                  <span class="text-gray-600 dark:text-gray-400">{{ competitor.name }}</span>
                  <span class="text-gray-700 dark:text-gray-300 font-medium">{{ competitor.gapCount }}</span>
                </div>
                <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full"
                      :style="`width: ${competitor.percentage}%`"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Venn Diagram Visualization -->
        <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
          <div class="p-5 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Citation Overlap</span>
            </div>
          </div>

          <div class="px-5 pb-5">
            <CitationOverlapBar
              :brandOnlyCitations="brandOnlyCitations"
              :overlappingCitations="overlappingCitations"
              :competitorOnlyCitations="competitorOnlyCitations"
            />
          </div>
        </div>

        <!-- Content Gap Topics -->
        <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
          <div class="p-5 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Top Gap Topics</span>
            </div>
          </div>

          <div class="px-5 pb-5">
            <ul class="space-y-3">
              <li v-for="(topic, index) in topGapTopics" :key="index" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium mt-0.5">{{ index + 1 }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ topic.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ topic.query_count }} queries</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                    <div class="h-full bg-indigo-500 dark:bg-indigo-600 rounded-full" :style="`width: ${topic.opportunity_score}%`"></div>
                  </div>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ topic.opportunity_score }}%</span>
                </div>
              </li>
              <li v-if="topGapTopics.length === 0" class="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                No content gap topics found.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Content Gap Table -->
      <div class="mt-6">
        <div class="bg-gray-900/5 dark:bg-white/5 rounded-2xl">
          <div class="p-5 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Content Gap Queries</span>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400">
              Showing {{ opportunityQueries.length }} opportunity queries
            </div>
          </div>

          <!-- Gap Queries Table -->
          <div class="px-5 pb-5">
            <div class="overflow-x-auto max-h-[400px] bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">Query</th>
                    <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intent</th>
                    <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response Match</th>
                    <th class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response Outcome</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <template v-for="(query, index) in filteredGapQueries" :key="index">
                    <!-- Query Row -->
                    <tr
                      @click="toggleExpandGapQuery(query.id || index)"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors cursor-pointer"
                    >
                      <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                        <div class="flex items-start">
                          <svg
                            class="w-4 h-4 mr-2 text-gray-400 transition-transform duration-200 flex-shrink-0 mt-0.5"
                            :class="{ 'rotate-90': expandedGapQueryIds.includes(query.id || index) }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                          <div class="break-words line-clamp-2 hover:line-clamp-none">
                            {{ query.query_text }}
                          </div>
                        </div>
                      </td>
                      <td class="p-3 text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              :style="{ backgroundColor: getIntentBgColor(query.query_intent), color: getIntentTextColor(query.query_intent) }">
                          {{ formatIntentName(query.query_intent) }}
                        </span>
                      </td>
                      <td class="p-3 text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              :class="getResponseMatchClass(query.response_match)">
                          {{ formatText(query.response_match || 'Unknown') }}
                        </span>
                      </td>
                      <td class="p-3 text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              :class="getResponseOutcomeClass(query.response_outcome)">
                          {{ formatText(query.response_outcome || 'Unknown') }}
                        </span>
                      </td>
                    </tr>

                    <!-- Expanded Content Row -->
                    <tr v-if="expandedGapQueryIds.includes(query.id || index)" class="bg-gray-50 dark:bg-gray-800/50">
                      <td colspan="4" class="p-0">
                        <div class="p-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
                          <div class="space-y-4">
                            <!-- Page Analysis Notes -->
                            <div v-if="query.analysis_notes" class="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis Notes</h4>
                              <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ query.analysis_notes }}</p>
                            </div>

                            <!-- Associated Pages (if any) -->
                            <div v-if="getPageAnalysesForQuery(query).length > 0" class="mt-3">
                              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Referenced Pages</h4>
                              <ul class="space-y-2">
                                <li v-for="(page, pageIdx) in getPageAnalysesForQuery(query)" :key="pageIdx"
                                    class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <div class="flex justify-between items-start">
                                    <div>
                                      <a :href="page.citation_url" target="_blank"
                                         class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                        {{ formatUrl(page.citation_url) }}
                                      </a>
                                      <div v-if="getDetailedAnalysisNotes(page)" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <!-- Show icon for crawl errors -->
                                        <div v-if="page.crawl_error" class="flex items-start gap-2">
                                          <div class="mt-0.5 flex-shrink-0 w-4 h-4 text-gray-500">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </div>
                                          <p class="whitespace-pre-line">{{ getDetailedAnalysisNotes(page) }}</p>
                                        </div>
                                        <!-- Regular analysis notes -->
                                        <p v-else class="whitespace-pre-line">{{ getDetailedAnalysisNotes(page) }}</p>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>

                            <!-- No Associated Pages Message -->
                            <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                              The AI agent wasn't able to crawl the pages for more in-depth analysis. Some pages may have been inaccessible or behind login walls.
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <!-- Empty State -->
                  <tr v-if="filteredGapQueries.length === 0">
                    <td colspan="4" class="p-4 text-center text-gray-500 dark:text-gray-400">
                      No content opportunity queries found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topic Analysis Section -->
    <div class="mb-6">
      <QueryTopicAnalysis
        :data="props.data"
      />
    </div>

    <!-- Query Competitiveness Analysis Section moved to Brand Performance tab -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QueryTopicAnalysis from './QueryTopicAnalysis.vue'
import QueryCompetitivenessAnalysis from './QueryCompetitivenessAnalysis.vue'
import CitationOverlapBar from './CitationOverlapBar.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  },
  removeControls: {
    type: Boolean,
    default: false
  }
})

// Access the queries data from the props
const queries = computed(() => {
  return props.data?.analysis_queries || []
})

// 1. Total Queries Metric
const totalQueries = computed(() => {
  return queries.value.length
})

// Platform breakdown for total queries
const platformBreakdown = computed(() => {
  if (totalQueries.value === 0) return []

  const platforms = {}
  queries.value.forEach(query => {
    const platform = query.data_source || 'unknown'
    platforms[platform] = (platforms[platform] || 0) + 1
  })

  return Object.entries(platforms).map(([name, count]) => {
    return {
      name: formatPlatformName(name),
      count,
      percentage: Math.round((count / totalQueries.value) * 100)
    }
  }).sort((a, b) => b.count - a.count)
})

// 2. Brand Mention Rate Metric
const brandMentions = computed(() => {
  return queries.value.filter(q => q.brand_mentioned === true).length
})

const brandMentionRate = computed(() => {
  if (totalQueries.value === 0) return 0
  return Math.round((brandMentions.value / totalQueries.value) * 100)
})

// Platform-specific mention rates
const platformMentionRates = computed(() => {
  if (totalQueries.value === 0) return []

  // Group by platform and calculate mention rates
  const platforms = {}
  const platformCounts = {}

  queries.value.forEach(query => {
    const platform = query.data_source || 'unknown'
    platformCounts[platform] = (platformCounts[platform] || 0) + 1

    if (query.brand_mentioned) {
      platforms[platform] = (platforms[platform] || 0) + 1
    }
  })

  return Object.entries(platforms).map(([name, count]) => {
    const totalForPlatform = platformCounts[name] || 0
    return {
      name: formatPlatformName(name),
      count,
      total: totalForPlatform,
      rate: Math.round((count / totalForPlatform) * 100)
    }
  }).sort((a, b) => b.rate - a.rate)
})

// 3. Average Citations Per Query Metric
const avgCitationsPerQuery = computed(() => {
  if (totalQueries.value === 0) return 0

  const totalCitations = queries.value.reduce((sum, query) => {
    return sum + (query.citation_count || 0)
  }, 0)

  return (totalCitations / totalQueries.value).toFixed(1)
})

// Average brand citations per query
const avgBrandCitationsPerQuery = computed(() => {
  if (totalQueries.value === 0) return 0

  // Look at page_analyses associated with each query to count brand citations
  let brandCitationCount = 0

  queries.value.forEach(query => {
    // Check associated_pages for brand citations
    if (query.associated_pages && Array.isArray(query.associated_pages)) {
      brandCitationCount += query.associated_pages.filter(page =>
        page.is_client_domain === true ||
        page.brand_mentioned === true
      ).length
    }
  })

  return (brandCitationCount / totalQueries.value).toFixed(1)
})

// 4. Top Performing Query Intent Metric
const topQueryIntent = computed(() => {
  if (totalQueries.value === 0) return 'N/A'

  // Group queries by intent and count brand mentions for each intent
  const intentMap = new Map()

  queries.value.forEach(query => {
    if (query.brand_mentioned && query.query_intent) {
      const intent = query.query_intent
      intentMap.set(intent, (intentMap.get(intent) || 0) + 1)
    }
  })

  // Find the intent with the highest brand mention count
  let topIntent = 'N/A'
  let maxCount = 0

  intentMap.forEach((count, intent) => {
    if (count > maxCount) {
      maxCount = count
      topIntent = intent
    }
  })

  // Format the intent for display (capitalize first letter)
  return topIntent.charAt(0).toUpperCase() + topIntent.slice(1).toLowerCase()
})

// Top Intent performance data
const topIntentData = computed(() => {
  if (totalQueries.value === 0 || topQueryIntent.value === 'N/A') return null

  // Count total queries and brand mentions for this intent
  const intent = topQueryIntent.value.toLowerCase()
  const queriesWithIntent = queries.value.filter(q =>
    q.query_intent && q.query_intent.toLowerCase() === intent
  )

  const mentionedWithIntent = queriesWithIntent.filter(q => q.brand_mentioned).length
  const totalWithIntent = queriesWithIntent.length

  return {
    intent,
    mentioned: mentionedWithIntent,
    total: totalWithIntent,
    mentionRate: totalWithIntent > 0 ? Math.round((mentionedWithIntent / totalWithIntent) * 100) : 0
  }
})

// Query Intent Analysis - Pie Chart Data
const queryIntentBreakdown = computed(() => {
  if (totalQueries.value === 0) return []

  // Group queries by intent
  const intentCounts = {}

  queries.value.forEach(query => {
    const intent = query.query_intent || 'unknown'
    intentCounts[intent] = (intentCounts[intent] || 0) + 1
  })

  // Convert to array with percentages
  return Object.entries(intentCounts).map(([name, count]) => {
    return {
      name,
      count,
      percentage: Math.round((count / totalQueries.value) * 100)
    }
  }).sort((a, b) => b.count - a.count)
})

// Donut chart segments for SVG rendering
const intentPieSegments = computed(() => {
  if (queryIntentBreakdown.value.length === 0) return []

  // Create a single SVG path for the entire donut chart to avoid gaps
  // This approach ensures perfect segment connections

  // First, calculate total percentage to normalize the values
  const totalPercentage = queryIntentBreakdown.value.reduce((sum, intent) => sum + intent.percentage, 0)
  const normalizeFactor = totalPercentage > 0 ? 100 / totalPercentage : 1

  const segments = []
  let startAngle = -Math.PI / 2 // Start from the top (12 o'clock position)
  const centerX = 50
  const centerY = 50
  const outerRadius = 40
  const innerRadius = 25

  queryIntentBreakdown.value.forEach((intent, index) => {
    // Calculate normalized angle
    const normalizedPercentage = intent.percentage * normalizeFactor
    const angle = (normalizedPercentage / 100) * 2 * Math.PI
    const endAngle = startAngle + angle

    // Calculate precise outer arc coordinates with 5 decimal places
    const outerX1 = +(centerX + outerRadius * Math.cos(startAngle)).toFixed(5)
    const outerY1 = +(centerY + outerRadius * Math.sin(startAngle)).toFixed(5)
    const outerX2 = +(centerX + outerRadius * Math.cos(endAngle)).toFixed(5)
    const outerY2 = +(centerY + outerRadius * Math.sin(endAngle)).toFixed(5)

    // Calculate precise inner arc coordinates with 5 decimal places
    const innerX1 = +(centerX + innerRadius * Math.cos(endAngle)).toFixed(5)
    const innerY1 = +(centerY + innerRadius * Math.sin(endAngle)).toFixed(5)
    const innerX2 = +(centerX + innerRadius * Math.cos(startAngle)).toFixed(5)
    const innerY2 = +(centerY + innerRadius * Math.sin(startAngle)).toFixed(5)

    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = angle > Math.PI ? 1 : 0

    // Create SVG path for donut segment with explicit precision
    const path = [
      `M ${outerX1} ${outerY1}`, // Start at outer start point
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`, // Outer arc
      `L ${innerX1} ${innerY1}`, // Line to inner end point
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2}`, // Inner arc (opposite direction)
      'Z' // Close path
    ].join(' ')

    segments.push({
      intent: intent.name,
      count: intent.count,
      path,
      color: getIntentColor(intent.name)
    })

    startAngle = endAngle
  })

  return segments
})

// State for pie chart interactions
const highlightedIntent = ref(null)
const highlightedIntentCount = computed(() => {
  if (!highlightedIntent.value) return null

  const intentData = queryIntentBreakdown.value.find(i => i.name === highlightedIntent.value)
  return intentData ? intentData.count : null
})

// State for response outcome pie chart
const highlightedOutcome = ref(null)
const highlightedOutcomeCount = computed(() => {
  if (!highlightedOutcome.value) return null

  const outcomeData = responseOutcomeBreakdown.value.find(o => o.name === highlightedOutcome.value)
  return outcomeData ? outcomeData.count : null
})

// Table state
const tableFilterIntent = ref('all')
const gapFilterIntent = ref('all')
const expandedQueryIds = ref([])
const expandedGapQueryIds = ref([])

// Filtered queries for the table
const filteredTableQueries = computed(() => {
  if (!queries.value || queries.value.length === 0) return []

  let filtered = [...queries.value]

  // Apply intent filter
  if (tableFilterIntent.value !== 'all') {
    filtered = filtered.filter(q => q.query_intent === tableFilterIntent.value)
  }

  // Sort by intent
  return filtered.sort((a, b) => {
    // First sort by intent
    const intentA = a.query_intent || 'unknown'
    const intentB = b.query_intent || 'unknown'

    if (intentA !== intentB) {
      return intentA.localeCompare(intentB)
    }

    // Then by brand mention (mentioned first)
    if (a.brand_mentioned !== b.brand_mentioned) {
      return a.brand_mentioned ? -1 : 1
    }

    // Finally by platform
    return (a.data_source || '').localeCompare(b.data_source || '')
  })
})

// Function to toggle query expansion
function toggleExpandQuery(queryId) {
  const index = expandedQueryIds.value.indexOf(queryId)
  if (index === -1) {
    // Not expanded, so expand it
    expandedQueryIds.value.push(queryId)
  } else {
    // Already expanded, so collapse it
    expandedQueryIds.value.splice(index, 1)
  }
}

// Function to toggle gap query expansion
function toggleExpandGapQuery(queryId) {
  const index = expandedGapQueryIds.value.indexOf(queryId)
  if (index === -1) {
    // Not expanded, so expand it
    expandedGapQueryIds.value.push(queryId)
  } else {
    // Already expanded, so collapse it
    expandedGapQueryIds.value.splice(index, 1)
  }
}

// Get response match class based on match type
function getResponseMatchClass(match) {
  if (!match) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'

  const matchType = match.toLowerCase()

  // Define classes for different match types
  const classMap = {
    'exact': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    'partial': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'paraphrase': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    'none': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
  }

  return classMap[matchType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

// Get response outcome class based on outcome type
function getResponseOutcomeClass(outcome) {
  if (!outcome) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'

  const outcomeType = outcome.toLowerCase()

  // Define classes for different outcome types
  const classMap = {
    'recommendation': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    'positive': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    'neutral': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'negative': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'mixed': 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
  }

  return classMap[outcomeType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

// Format URL for display
function formatUrl(url) {
  if (!url) return 'Unknown URL'
  try {
    const urlObj = new URL(url)
    // Return domain + truncated path
    return urlObj.hostname + urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '')
  } catch (e) {
    // Handle invalid URLs
    return url.substring(0, 30) + (url.length > 30 ? '...' : '')
  }
}

// Get page analyses records for a given query
function getPageAnalysesForQuery(query) {
  if (!props.data || !props.data.page_analyses) return []

  // Find page_analyses that match this query's ID (including those with crawl errors)
  const relatedPages = props.data.page_analyses.filter(page =>
    // Match query ID
    page.query_id === query.id ||
    // Also check associated_pages IDs if they exist
    (query.associated_pages &&
     Array.isArray(query.associated_pages) &&
     query.associated_pages.some(ap => ap.id === page.id))
  )

  // Sort pages - show ones without crawl errors first
  return relatedPages.sort((a, b) => {
    // If a has a crawl error but b doesn't, b comes first
    if (a.crawl_error && !b.crawl_error) return 1
    // If b has a crawl error but a doesn't, a comes first
    if (!a.crawl_error && b.crawl_error) return -1
    // If both have crawl errors or neither has crawl errors, keep original order
    return 0
  })
}

// Get detailed analysis notes from the page_analysis JSONB field
function getDetailedAnalysisNotes(page) {
  // Check for crawl errors first
  if (page.crawl_error && page.crawl_error !== '') {
    return `The AI agent couldn't analyze this page due to web scraping limitations. The page may be inaccessible, behind a login wall, or blocked by robots.txt.`
  }

  // First try to get the notes from the page_analysis.analysis_notes field
  if (page.page_analysis && typeof page.page_analysis === 'object' && page.page_analysis.analysis_notes) {
    return page.page_analysis.analysis_notes
  }

  // Fallback to top-level analysis_notes if the nested one doesn't exist
  if (page.analysis_notes && page.analysis_notes !== 'Analysis completed') {
    return page.analysis_notes
  }

  // If we have content quality data, build a synthetic analysis note
  if (page.content_quality) {
    let notes = []

    if (page.content_quality.eeat_score) {
      notes.push(`EEAT Score: ${page.content_quality.eeat_score}/5`)
    }

    if (page.content_quality.content_depth_score) {
      notes.push(`Content Depth: ${page.content_quality.content_depth_score}/5`)
    }

    if (page.content_quality.content_uniqueness) {
      notes.push(`Content Uniqueness: ${page.content_quality.content_uniqueness}/5`)
    }

    if (page.content_quality.citation_match_quality) {
      notes.push(`Citation Match: ${page.content_quality.citation_match_quality}/5`)
    }

    if (notes.length > 0) {
      return notes.join('\n')
    }
  }

  // Last resort fallback
  return 'No detailed analysis available'
}

// Helper functions
function formatPlatformName(platform) {
  if (!platform) return 'Unknown'

  const nameMap = {
    'chatgpt': 'ChatGPT',
    'perplexity': 'Perplexity',
    'claude': 'Claude',
    'bard': 'Bard',
    'gemini': 'Gemini',
    'unknown': 'Unknown'
  }
  return nameMap[platform.toLowerCase()] || platform
}

function getPlatformColor(platform) {
  const colorMap = {
    'ChatGPT': 'bg-blue-500 dark:bg-blue-600',
    'Perplexity': 'bg-purple-500 dark:bg-purple-600',
    'Claude': 'bg-green-500 dark:bg-green-600',
    'Bard': 'bg-amber-500 dark:bg-amber-600',
    'Gemini': 'bg-gray-500 dark:bg-gray-600',
    'Overall': 'bg-orange-500 dark:bg-orange-600',
    'Unknown': 'bg-gray-500 dark:bg-gray-600'
  }
  return colorMap[platform] || 'bg-gray-500 dark:bg-gray-600'
}

function getPlatformColorHex(platform) {
  const colorMap = {
    'ChatGPT': '#3b82f6', // blue-500
    'Perplexity': '#8b5cf6', // purple-500
    'Claude': '#10b981', // green-500
    'Bard': '#fbbf24', // amber-400 (yellow)
    'Gemini': '#6b7280', // gray-500
    'Unknown': '#6b7280', // gray-500
    'Overall': '#f97316' // orange-500 (main highlight color)
  }
  return colorMap[platform] || '#6b7280'
}

function getPlatformBadgeClass(platform) {
  const name = formatPlatformName(platform)
  const classMap = {
    'ChatGPT': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'Perplexity': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'Claude': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
    'Bard': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    'Gemini': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Unknown': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'Overall': 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300'
  }
  return classMap[name] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300'
}

function getIntentColor(intent) {
  if (!intent) return '#9ca3af' // gray-400

  const colorMap = {
    'informational': '#f97316', // orange-500 (primary emphasis)
    'commercial': '#3b82f6', // blue-500 (secondary emphasis)
    'navigational': '#8b5cf6', // purple-500 (tertiary emphasis)
    'transactional': '#10b981', // green-500 (quaternary emphasis)
    'consideration': '#fbbf24', // amber-400 (quinary emphasis)
    'comparison': '#9ca3af', // gray-400 (least emphasis)
    'educational': '#f97316', // orange-500 (primary - reuse)
    'opinion': '#3b82f6',    // blue-500 (secondary - reuse)
    'support': '#8b5cf6',    // purple-500 (tertiary - reuse)
    'local': '#10b981',      // green-500 (quaternary - reuse)
    'recommendation': '#fbbf24', // amber-400 (quinary - reuse)
    'unknown': '#9ca3af' // gray-400
  }

  return colorMap[intent.toLowerCase()] || '#9ca3af'
}

function getIntentBgColor(intent) {
  if (!intent) return '#f3f4f6' // gray-100

  const colorMap = {
    'informational': '#ffedd5', // orange-100 (primary)
    'commercial': '#dbeafe', // blue-100 (secondary)
    'navigational': '#ede9fe', // purple-100 (tertiary)
    'transactional': '#d1fae5', // green-100 (quaternary)
    'consideration': '#fef3c7', // amber-100 (quinary)
    'comparison': '#f3f4f6', // gray-100 (least emphasis)
    'educational': '#ffedd5', // orange-100 (reuse primary)
    'opinion': '#dbeafe',    // blue-100 (reuse secondary)
    'support': '#ede9fe',    // purple-100 (reuse tertiary)
    'local': '#d1fae5',      // green-100 (reuse quaternary)
    'recommendation': '#fef3c7', // amber-100 (reuse quinary)
    'unknown': '#f3f4f6' // gray-100
  }

  return colorMap[intent.toLowerCase()] || '#f3f4f6'
}

function getIntentTextColor(intent) {
  if (!intent) return '#374151' // gray-700

  const colorMap = {
    'informational': '#c2410c', // orange-700 (matches citebots-orange)
    'commercial': '#1d4ed8', // blue-700
    'navigational': '#047857', // emerald-700
    'transactional': '#6d28d9', // violet-700
    'consideration': '#b45309', // amber-700
    'comparison': '#4338ca', // indigo-700
    'recommendation': '#b91c1c', // red-700
    'unknown': '#374151' // gray-700
  }

  return colorMap[intent.toLowerCase()] || '#374151'
}

// Get color for response outcome
function getOutcomeColor(outcome) {
  if (!outcome) return '#9ca3af' // gray-400

  const colorMap = {
    'recommendation': '#f97316', // orange-500 (primary emphasis)
    'comparison': '#3b82f6',     // blue-500 (secondary emphasis)
    'explanation': '#8b5cf6',    // purple-500 (tertiary emphasis)
    'tutorial': '#10b981',       // green-500 (quaternary emphasis)
    'analysis': '#fbbf24',       // amber-400 (quinary emphasis)
    'answer': '#9ca3af',         // gray-400 (least emphasis)
    'opinion': '#f97316',        // orange-500 (primary - reuse)
    'unknown': '#9ca3af'         // gray-400
  }

  return colorMap[outcome.toLowerCase()] || '#9ca3af'
}

function formatIntentName(intent) {
  if (!intent) return 'Unknown'
  return intent.charAt(0).toUpperCase() + intent.slice(1).toLowerCase()
}

function formatText(text) {
  if (!text) return 'N/A'
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Get score color for text
function getScoreTextColorClass(score) {
  if (score >= 4) return 'text-green-600 dark:text-green-400'
  if (score >= 3) return 'text-blue-600 dark:text-blue-400'
  if (score >= 2) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

// Get score color for bars
function getScoreColorClass(score) {
  if (score >= 4) return 'bg-green-500 dark:bg-green-600'
  if (score >= 3) return 'bg-blue-500 dark:bg-blue-600'
  if (score >= 2) return 'bg-orange-500 dark:bg-orange-600'
  return 'bg-red-500 dark:bg-red-600'
}

// Content Opportunity Analysis Data
// Generate content gap metrics
const contentGapQueries = computed(() => {
  if (!props.data || !props.data.analysis_queries) return []

  const competitors = props.data?.competitors || []
  const queries = props.data.analysis_queries || []

  // Find queries where competitors are cited but brand isn't
  return queries.filter(query => {
    // Skip if brand is mentioned
    if (query.brand_mentioned) return false

    // Check if any competitors are mentioned
    const competitorMentioned = query.competitor_mentioned === true ||
      (query.competitor_mentioned_names && query.competitor_mentioned_names.length > 0)

    return competitorMentioned
  }).map(query => {
    // Find associated page analyses
    const associatedPages = query.associated_pages || []

    // For each competitor, check if they're cited
    const competitorCited = []
    let totalQualityScore = 0
    let citedCount = 0

    if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names)) {
      competitorCited.push(...query.competitor_mentioned_names)
    }

    // Calculate average competitor page quality
    associatedPages.forEach(page => {
      if (page.is_competitor_domain && page.content_quality) {
        totalQualityScore += (
          page.content_quality.eeat_score +
          page.content_quality.content_depth_score +
          page.content_quality.content_uniqueness +
          page.content_quality.citation_match_quality
        ) / 4
        citedCount++
      }
    })

    const avgQualityScore = citedCount > 0 ? totalQualityScore / citedCount : 0

    return {
      ...query,
      competitor_cited: competitorCited,
      citation_count: query.citation_count || associatedPages.length,
      competitor_quality_score: avgQualityScore || 3.5 // Default score if not available
    }
  })
})

// Content gap opportunity score - percentage of queries with no competitors and no brand
const contentGapScore = computed(() => {
  if (!props.data || !props.data.analysis_queries || props.data.analysis_queries.length === 0) return 0

  // Queries with neither brand nor competitor mentions - pure opportunities
  const opportunityQueries = props.data.analysis_queries.filter(query =>
    !query.brand_mentioned &&
    (!query.competitor_mentioned ||
     (query.competitor_mentioned_names && query.competitor_mentioned_names.length === 0))
  ).length

  const totalQueries = props.data.analysis_queries.length

  return Math.round((opportunityQueries / totalQueries) * 100)
})

// Count of queries with content opportunities
const contentGapQueryCount = computed(() => {
  if (!props.data || !props.data.analysis_queries) return 0

  return props.data.analysis_queries.filter(query =>
    !query.brand_mentioned &&
    (!query.competitor_mentioned ||
     (query.competitor_mentioned_names && query.competitor_mentioned_names.length === 0))
  ).length
})

// Opportunity queries for content gaps
const opportunityQueries = computed(() => {
  if (!props.data || !props.data.analysis_queries) return []

  // Find queries with competition opportunities (queries marked as opportunity)
  return props.data.analysis_queries.filter(query =>
    query.query_competition === 'opportunity' ||
    (!query.brand_mentioned && (!query.competitor_mentioned || !query.competitor_mentioned_names?.length))
  )
})

// Filtered gap queries for the table
const filteredGapQueries = computed(() => {
  if (!opportunityQueries.value || opportunityQueries.value.length === 0) return []

  // Sort by opportunity score or competition (if available) - lower competition = better opportunity
  return [...opportunityQueries.value].sort((a, b) => {
    // If competition score is available, sort by it (lower is better)
    if (a.competition_score !== undefined && b.competition_score !== undefined) {
      return a.competition_score - b.competition_score
    }
    // Otherwise sort by query intent (which might correlate with opportunity)
    return (a.query_intent || '').localeCompare(b.query_intent || '')
  })
})

// Top competitors that appear in content gaps
const topCompetitorsInGaps = computed(() => {
  if (!contentGapQueries.value || contentGapQueries.value.length === 0) return []

  const competitors = {}

  // Count occurrences of each competitor in gap queries
  contentGapQueries.value.forEach(query => {
    if (query.competitor_cited && Array.isArray(query.competitor_cited)) {
      query.competitor_cited.forEach(comp => {
        competitors[comp] = (competitors[comp] || 0) + 1
      })
    }
  })

  // Convert to array with percentages
  return Object.entries(competitors)
    .map(([name, count]) => {
      return {
        name,
        gapCount: count,
        percentage: Math.round((count / contentGapQueries.value.length) * 100)
      }
    })
    .sort((a, b) => b.gapCount - a.gapCount)
    .slice(0, 3) // Top 3 competitors
})

// Content gap topics with competition opportunity focus
const topGapTopics = computed(() => {
  if (!props.data || !props.data.analysis_queries) return []

  const topics = {}

  // Find queries with competition opportunities (queries marked as opportunity)
  const opportunityQueries = props.data.analysis_queries.filter(query =>
    query.query_competition === 'opportunity' ||
    (!query.brand_mentioned && (!query.competitor_mentioned || !query.competitor_mentioned_names?.length))
  )

  if (opportunityQueries.length === 0) return []

  // Group opportunity queries by topic
  opportunityQueries.forEach(query => {
    const topic = query.query_topic || 'Uncategorized'

    if (!topics[topic]) {
      topics[topic] = {
        name: formatText(topic.replace(/_/g, ' ')),
        query_count: 0,
        opportunity_queries: [],
        competition_level: 0
      }
    }

    topics[topic].query_count++
    topics[topic].opportunity_queries.push(query)

    // Track competition level (0-5 scale where 0 is best opportunity)
    if (query.competition_score !== undefined) {
      topics[topic].competition_level += query.competition_score || 0
    }
  })

  // Calculate opportunity score for each topic
  return Object.values(topics)
    .map(topic => {
      // Average competition level (reverse scale so higher % is better opportunity)
      const avgCompetition = topic.opportunity_queries.length > 0
        ? topic.competition_level / topic.opportunity_queries.length
        : 2.5 // Default mid-level

      // Opportunity score: higher for lower competition areas
      const opportunity_score = Math.round(100 - (avgCompetition * 20))

      return {
        ...topic,
        opportunity_score: Math.max(0, Math.min(100, opportunity_score)), // Ensure between 0-100
        query_count: topic.query_count
      }
    })
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 5) // Top 5 topics
})

// Response Outcome Analysis
// Get breakdown of response outcomes
const responseOutcomeBreakdown = computed(() => {
  if (totalQueries.value === 0) return []

  // Group queries by response outcome
  const outcomeCounts = {}

  queries.value.forEach(query => {
    const outcome = query.response_outcome || 'unknown'
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1
  })

  // Convert to array with percentages
  return Object.entries(outcomeCounts).map(([name, count]) => {
    return {
      name,
      count,
      percentage: Math.round((count / totalQueries.value) * 100)
    }
  }).sort((a, b) => b.count - a.count)
})

// Donut chart segments for outcome visualization
const outcomePieSegments = computed(() => {
  if (responseOutcomeBreakdown.value.length === 0) return []

  // Create a single SVG path for the entire donut chart to avoid gaps
  // This approach ensures perfect segment connections

  // First, calculate total percentage to normalize the values
  const totalPercentage = responseOutcomeBreakdown.value.reduce((sum, outcome) => sum + outcome.percentage, 0)
  const normalizeFactor = totalPercentage > 0 ? 100 / totalPercentage : 1

  const segments = []
  let startAngle = -Math.PI / 2 // Start from the top (12 o'clock position)
  const centerX = 50
  const centerY = 50
  const outerRadius = 40
  const innerRadius = 25

  responseOutcomeBreakdown.value.forEach((outcome, index) => {
    // Calculate normalized angle
    const normalizedPercentage = outcome.percentage * normalizeFactor
    const angle = (normalizedPercentage / 100) * 2 * Math.PI
    const endAngle = startAngle + angle

    // Calculate precise outer arc coordinates with 5 decimal places
    const outerX1 = +(centerX + outerRadius * Math.cos(startAngle)).toFixed(5)
    const outerY1 = +(centerY + outerRadius * Math.sin(startAngle)).toFixed(5)
    const outerX2 = +(centerX + outerRadius * Math.cos(endAngle)).toFixed(5)
    const outerY2 = +(centerY + outerRadius * Math.sin(endAngle)).toFixed(5)

    // Calculate precise inner arc coordinates with 5 decimal places
    const innerX1 = +(centerX + innerRadius * Math.cos(endAngle)).toFixed(5)
    const innerY1 = +(centerY + innerRadius * Math.sin(endAngle)).toFixed(5)
    const innerX2 = +(centerX + innerRadius * Math.cos(startAngle)).toFixed(5)
    const innerY2 = +(centerY + innerRadius * Math.sin(startAngle)).toFixed(5)

    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = angle > Math.PI ? 1 : 0

    // Create SVG path for donut segment with explicit precision
    const path = [
      `M ${outerX1} ${outerY1}`, // Start at outer start point
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`, // Outer arc
      `L ${innerX1} ${innerY1}`, // Line to inner end point
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2}`, // Inner arc (opposite direction)
      'Z' // Close path
    ].join(' ')

    segments.push({
      outcome: outcome.name,
      count: outcome.count,
      path,
      color: getOutcomeColor(outcome.name)
    })

    startAngle = endAngle
  })

  return segments
})

// Citation overlap metrics for Venn diagram
const brandOnlyCitations = computed(() => {
  if (!props.data || !props.data.page_analyses) return 0

  return props.data.page_analyses.filter(page =>
    page.is_client_domain &&
    !page.is_competitor_domain
  ).length
})

const competitorOnlyCitations = computed(() => {
  if (!props.data || !props.data.page_analyses) return 0

  return props.data.page_analyses.filter(page =>
    !page.is_client_domain &&
    page.is_competitor_domain
  ).length
})

const overlappingCitations = computed(() => {
  if (!props.data || !props.data.page_analyses) return 0

  return props.data.page_analyses.filter(page =>
    page.is_client_domain &&
    page.is_competitor_domain
  ).length
})

// Citation percentages
const totalCitations = computed(() => {
  return brandOnlyCitations.value + competitorOnlyCitations.value + overlappingCitations.value
})

const brandCitationPercentage = computed(() => {
  if (totalCitations.value === 0) return 0
  return Math.round(((brandOnlyCitations.value + overlappingCitations.value) / totalCitations.value) * 100)
})

const competitorCitationPercentage = computed(() => {
  if (totalCitations.value === 0) return 0
  return Math.round(((competitorOnlyCitations.value + overlappingCitations.value) / totalCitations.value) * 100)
})
</script>

<style scoped>
.query-analysis-v2 {
  position: relative;
  min-height: 350px;
}

.query-analysis-v2:hover {
  transform: translateY(-2px);
}

/* Animation for expanding rows */
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
  overflow: hidden;
}

/* Text clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover\:line-clamp-none:hover {
  -webkit-line-clamp: unset;
  display: block;
}
</style>