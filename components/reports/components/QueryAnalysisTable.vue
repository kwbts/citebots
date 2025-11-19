<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Query Analysis</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Showing {{ filteredQueries.length }} of {{ totalQueries }} queries</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <!-- Table -->
      <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th @click="handleSort('query_text')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600/50" style="min-width: 300px; width: 45%;">
                <div class="flex items-center">
                  Query
                  <svg v-if="sortField === 'query_text'" class="ml-1 w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="sortDirection === 'asc'" fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    <path v-else fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Platform
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Brand
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Competition
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <template v-for="(query, index) in paginatedQueries" :key="query.id || index">
              <tr
                @click="toggleExpandQuery(query.id || index)"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors cursor-pointer"
              >
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
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
                    <div class="min-w-0 flex-1">
                      <p class="text-sm break-words leading-5">{{ query.query_text }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getPlatformClass(query.data_source)">
                    {{ formatPlatform(query.data_source) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span v-if="query.query_type" class="text-gray-700 dark:text-gray-300">
                    {{ formatText(query.query_type) }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div v-if="query.brand_mentioned && query.brand_mention_type !== 'implicit'" class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span v-if="query.brand_mention_type" class="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {{ formatText(query.brand_mention_type) }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span v-if="query.query_competition"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getCompetitionClass(query.query_competition)">
                    {{ formatText(query.query_competition) }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
                </td>
              </tr>

              <!-- Expanded Row -->
              <tr v-if="expandedQueryIds.includes(query.id || index)" class="bg-gray-50 dark:bg-gray-800/50">
                <td colspan="5" class="px-6 py-4">
                  <div class="space-y-4">
                    <!-- Query Details -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Details</h4>
                        <dl class="space-y-1 text-sm">
                          <div v-if="query.query_intent" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Intent:</dt>
                            <dd>
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :style="{ backgroundColor: getIntentBgColor(query.query_intent), color: getIntentTextColor(query.query_intent) }">
                                {{ formatIntentName(query.query_intent) }}
                              </span>
                            </dd>
                          </div>
                          <div v-if="query.query_category" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Category:</dt>
                            <dd class="text-gray-700 dark:text-gray-300">{{ query.query_category }}</dd>
                          </div>
                          <div v-if="query.funnel_stage" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Funnel Stage:</dt>
                            <dd class="text-gray-700 dark:text-gray-300">{{ formatText(query.funnel_stage) }}</dd>
                          </div>
                          <div v-if="query.action_orientation" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Action:</dt>
                            <dd class="text-gray-700 dark:text-gray-300">{{ formatText(query.action_orientation) }}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Analysis</h4>
                        <dl class="space-y-1 text-sm">
                          <div v-if="query.response_match" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Response Match:</dt>
                            <dd>
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="getResponseMatchClass(query.response_match)">
                                {{ formatText(query.response_match) }}
                              </span>
                            </dd>
                          </div>
                          <div v-if="query.response_outcome" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Outcome:</dt>
                            <dd>
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="getResponseOutcomeClass(query.response_outcome)">
                                {{ formatText(query.response_outcome) }}
                              </span>
                            </dd>
                          </div>
                          <div v-if="query.competitor_count !== undefined" class="flex">
                            <dt class="text-gray-500 dark:text-gray-400 w-32">Competitors:</dt>
                            <dd class="text-gray-700 dark:text-gray-300">
                              {{ query.competitor_count }} mentioned
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <!-- Competitors Mentioned Section -->
                    <div v-if="query.competitor_mentioned_names?.length > 0" class="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Competitors Mentioned</h4>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="comp in query.competitor_mentioned_names" :key="comp"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                          {{ comp }}
                        </span>
                      </div>
                    </div>

                    <!-- Full Query Text -->
                    <div class="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Query</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ query.query_text }}</p>
                    </div>

                    <!-- Model Response -->
                    <div v-if="query.model_response" class="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model Response</h4>
                      <div
                        class="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none dark:prose-invert prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-table:text-sm model-response-content overflow-x-auto"
                        v-html="formatModelResponse(query.model_response)"
                      ></div>
                    </div>

                    <!-- Citations -->
                    <div v-if="getPageAnalysesForQuery(query).length > 0">
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Citations ({{ query.citation_count || 0 }})</h4>
                      <div class="grid gap-3">
                        <div v-for="(page, pageIdx) in getPageAnalysesForQuery(query)" :key="pageIdx"
                             @click="toggleExpandCitation(page.id || pageIdx)"
                             class="group cursor-pointer bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md">

                          <!-- Main Citation Row -->
                          <div class="flex items-start gap-3 p-3">
                            <!-- Position Badge -->
                            <div class="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {{ page.citation_position || '?' }}
                              </span>
                            </div>

                            <!-- Citation Details -->
                            <div class="flex-1 min-w-0">
                              <div class="flex items-start justify-between gap-2">
                                <div class="flex-1">
                                  <a :href="page.citation_url"
                                     target="_blank"
                                     rel="noopener noreferrer nofollow"
                                     @click.stop
                                     class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors break-all">
                                    {{ formatUrl(page.citation_url) }}
                                  </a>

                                  <!-- Domain and Quick Info -->
                                  <div class="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span v-if="page.domain_name">{{ page.domain_name }}</span>
                                    <span v-if="getEEATScore(page)" class="flex items-center gap-1">
                                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      EEAT: {{ getEEATScore(page) }}
                                    </span>
                                    <span v-if="getContentFormat(page)">{{ getContentFormat(page) }}</span>
                                  </div>
                                </div>

                                <!-- Domain Type Badges & Expand Indicator -->
                                <div class="flex items-center gap-2 flex-shrink-0">
                                  <div class="flex gap-1">
                                    <span v-if="page.is_client_domain"
                                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      Client
                                    </span>
                                    <span v-if="page.is_competitor_domain"
                                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                      Competitor
                                    </span>
                                  </div>
                                  <svg
                                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                                    :class="{ 'rotate-90': expandedCitationIds.includes(page.id || pageIdx) }"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Expanded Details -->
                          <div v-if="expandedCitationIds.includes(page.id || pageIdx)"
                               class="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800/50">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <!-- Left Column -->
                              <div class="space-y-3">
                                <!-- EEAT Analysis -->
                                <div v-if="page.content_quality?.e_e_a_t_signals">
                                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">EEAT Analysis</h5>
                                  <div class="space-y-1 text-xs">
                                    <div v-for="(value, key) in page.content_quality.e_e_a_t_signals" :key="key" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">{{ formatText(key) }}:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300">{{ value }}</span>
                                    </div>
                                  </div>
                                </div>

                                <!-- Content Analysis -->
                                <div v-if="page.content_quality">
                                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">Content Analysis</h5>
                                  <div class="space-y-1 text-xs">
                                    <div v-if="page.content_quality.word_count" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Word Count:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300">{{ page.content_quality.word_count.toLocaleString() }}</span>
                                    </div>
                                    <div v-if="page.content_quality.readability_score" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Readability:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300">{{ page.content_quality.readability_score }}</span>
                                    </div>
                                    <div v-if="page.content_quality.content_type" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Content Type:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300">{{ formatText(page.content_quality.content_type) }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- Right Column -->
                              <div class="space-y-3">
                                <!-- Technical SEO -->
                                <div v-if="page.technical_seo">
                                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">Technical SEO</h5>
                                  <div class="space-y-1 text-xs">
                                    <div v-if="page.technical_seo.meta_title" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Meta Title:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]" :title="page.technical_seo.meta_title">
                                        {{ page.technical_seo.meta_title.substring(0, 30) }}{{ page.technical_seo.meta_title.length > 30 ? '...' : '' }}
                                      </span>
                                    </div>
                                    <div v-if="page.technical_seo.structured_data !== undefined" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Structured Data:</span>
                                      <span class="font-medium" :class="page.technical_seo.structured_data ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                        {{ page.technical_seo.structured_data ? 'Yes' : 'No' }}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <!-- Page Performance -->
                                <div v-if="page.page_performance">
                                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">Performance</h5>
                                  <div class="space-y-1 text-xs">
                                    <div v-if="page.page_performance.load_time" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Load Time:</span>
                                      <span class="font-medium text-gray-700 dark:text-gray-300">{{ page.page_performance.load_time }}s</span>
                                    </div>
                                    <div v-if="page.page_performance.mobile_friendly !== undefined" class="flex justify-between">
                                      <span class="text-gray-600 dark:text-gray-400">Mobile Friendly:</span>
                                      <span class="font-medium" :class="page.page_performance.mobile_friendly ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                        {{ page.page_performance.mobile_friendly ? 'Yes' : 'No' }}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Analysis Notes -->
                            <div v-if="page.analysis_notes" class="mt-4">
                              <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-1">Analysis Notes</h5>
                              <p class="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ page.analysis_notes }}</p>
                            </div>

                            <!-- Metadata -->
                            <div class="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                              <span v-if="query.query_keyword" class="flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Keyword: {{ query.query_keyword }}
                              </span>
                              <span v-if="page.created_at" class="flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Analyzed: {{ formatDate(page.created_at) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredQueries.length) }} of {{ filteredQueries.length }} results
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
  filteredQueries: {
    type: Array,
    required: true
  },
  totalQueries: {
    type: Number,
    required: true
  },
  pageAnalyses: {
    type: Array,
    default: () => []
  },
  sortField: {
    type: String,
    default: 'query_text'
  },
  sortDirection: {
    type: String,
    default: 'asc'
  }
})

const emit = defineEmits(['sort'])

// Local state
const currentPage = ref(1)
const pageSize = ref(25)
const expandedQueryIds = ref([])
const expandedCitationIds = ref([])

// Pagination
const totalPages = computed(() => Math.ceil(props.filteredQueries.length / pageSize.value))
const paginatedQueries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.filteredQueries.slice(start, end)
})

// Methods
const handleSort = (field) => {
  emit('sort', field)
}

const toggleExpandQuery = (queryId) => {
  const index = expandedQueryIds.value.indexOf(queryId)
  if (index > -1) {
    expandedQueryIds.value.splice(index, 1)
  } else {
    expandedQueryIds.value.push(queryId)
  }
}

const toggleExpandCitation = (citationId) => {
  const index = expandedCitationIds.value.indexOf(citationId)
  if (index > -1) {
    expandedCitationIds.value.splice(index, 1)
  } else {
    expandedCitationIds.value.push(citationId)
  }
}

const getPageAnalysesForQuery = (query) => {
  return props.pageAnalyses.filter(page => page.query_id === query.id)
}

// Helper methods for citation data extraction
const getEEATScore = (page) => {
  if (!page.content_quality?.e_e_a_t_signals) return null
  const signals = page.content_quality.e_e_a_t_signals
  const values = Object.values(signals).filter(v => typeof v === 'number')
  if (values.length > 0) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return avg.toFixed(1)
  }
  const hasSignals = Object.values(signals).filter(v => v).length
  if (hasSignals > 0) return `${hasSignals}/${Object.keys(signals).length}`
  return null
}

const getContentFormat = (page) => {
  return page.content_quality?.content_type || page.page_analysis?.content_format || null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Formatting helpers
const formatText = (text) => {
  if (!text) return ''
  return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatIntentName = (intent) => {
  if (!intent) return 'Unknown'
  const intentMap = {
    'informational': 'Informational',
    'commercial': 'Commercial',
    'navigational': 'Navigational',
    'transactional': 'Transactional',
    'comparison': 'Comparison',
    'local': 'Local'
  }
  return intentMap[intent] || formatText(intent)
}

const formatPlatform = (platform) => {
  if (!platform) return 'Unknown'
  return platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity'
}

const formatUrl = (url) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname
  } catch {
    return url
  }
}

const formatModelResponse = (response) => {
  if (!response) return ''

  let formatted = response

  // Handle markdown tables first
  const tableRegex = /\|([^\n]+)\|\n\|([^\n]+)\|\n((?:\|[^\n]+\|\n?)*)/g
  formatted = formatted.replace(tableRegex, (match, header, separator, rows) => {
    const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell)
    const rowsArray = rows.trim().split('\n').map(row =>
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    ).filter(row => row.length > 0)

    let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm border border-gray-200 dark:border-gray-700 rounded-lg">'

    if (headerCells.length > 0) {
      tableHtml += '<thead class="bg-gray-50 dark:bg-gray-700/50"><tr>'
      headerCells.forEach(cell => {
        tableHtml += `<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0">${cell}</th>`
      })
      tableHtml += '</tr></thead>'
    }

    if (rowsArray.length > 0) {
      tableHtml += '<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">'
      rowsArray.forEach((row, index) => {
        tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/25'}">`
        row.forEach((cell) => {
          tableHtml += `<td class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0">${cell}</td>`
        })
        tableHtml += '</tr>'
      })
      tableHtml += '</tbody>'
    }

    tableHtml += '</table></div>'
    return tableHtml
  })

  // Convert headers
  formatted = formatted.replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">$1</h4>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>')

  // Convert lists
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">$1</span><span class="text-gray-700 dark:text-gray-300">$2</span></div>')
  formatted = formatted.replace(/^[•\-\*]\s+(.+)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"></span><span class="text-gray-700 dark:text-gray-300">$1</span></div>')

  // Convert formatting
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')

  // Convert URLs
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 dark:text-blue-400 hover:underline break-words">$1</a>')

  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  formatted = formatted.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer nofollow" class="text-blue-600 dark:text-blue-400 hover:underline break-words">$1</a>')

  // Convert citations
  formatted = formatted.replace(/\[(\d+)\]/g, '<sup class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">[$1]</sup>')

  // Handle line breaks
  formatted = formatted.replace(/\n\n+/g, '</p><p class="mb-3">')
  formatted = formatted.replace(/\n/g, '<br>')

  if (!formatted.includes('<p>') && !formatted.includes('<div>') && !formatted.includes('<table>')) {
    formatted = `<p class="mb-3">${formatted}</p>`
  } else if (formatted.includes('</p><p')) {
    formatted = `<p class="mb-3">${formatted}</p>`
  }

  formatted = formatted.replace(/<p[^>]*><\/p>/g, '')

  return formatted
}

// Color helpers
const getIntentBgColor = (intent) => {
  const colors = {
    'informational': '#dbeafe',
    'commercial': '#fef3c7',
    'navigational': '#d1fae5',
    'transactional': '#fee2e2',
    'comparison': '#ede9fe',
    'local': '#cffafe'
  }
  return colors[intent] || '#f3f4f6'
}

const getIntentTextColor = (intent) => {
  const colors = {
    'informational': '#1e40af',
    'commercial': '#b45309',
    'navigational': '#065f46',
    'transactional': '#b91c1c',
    'comparison': '#6d28d9',
    'local': '#0891b2'
  }
  return colors[intent] || '#374151'
}

const getPlatformClass = (platform) => {
  if (platform === 'chatgpt') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
}

const getCompetitionClass = (competition) => {
  const classes = {
    'defending': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'opportunity': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'competitive': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'competitor_advantage': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[competition] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const getResponseMatchClass = (match) => {
  const classes = {
    'exact': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'none': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[match] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const getResponseOutcomeClass = (outcome) => {
  const classes = {
    'positive': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'neutral': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    'negative': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[outcome] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}
</script>

<style scoped>
/* Enhanced prose styling for model responses */
.model-response-content {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.model-response-content p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.model-response-content p:last-child {
  margin-bottom: 0;
}

.model-response-content table {
  font-size: 0.875rem;
  border-collapse: collapse;
  max-width: 100%;
  display: block;
  overflow-x: auto;
}

.model-response-content table th:last-child,
.model-response-content table td:last-child {
  border-right: none !important;
}

.model-response-content h3,
.model-response-content h4 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.model-response-content h3:first-child,
.model-response-content h4:first-child {
  margin-top: 0;
}

.model-response-content .flex.items-start {
  margin-bottom: 0.5rem;
}

.model-response-content .flex.items-start:last-child {
  margin-bottom: 0;
}

.model-response-content > div:not(:last-child) {
  margin-bottom: 1rem;
}

/* Ensure URLs don't cause overflow */
.model-response-content a {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
