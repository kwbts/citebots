<template>
  <div class="query-performance-table bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 relative">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
      <div class="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="w-7 h-7 border-3 border-citebots-orange border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Loading data...</span>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Query Performance</h3>
      <!-- Filters -->
      <div class="flex items-center space-x-3">
        <!-- Platform filter -->
        <div class="relative">
          <select
            v-model="platformFilter"
            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Platforms</option>
            <option v-for="platform in availablePlatforms" :key="platform.value" :value="platform.value">
              {{ platform.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        <!-- Brand mention filter -->
        <div class="relative">
          <select
            v-model="filterType"
            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Queries</option>
            <option value="mentioned">Brand Mentioned</option>
            <option value="not-mentioned">Not Mentioned</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <div class="overflow-x-auto max-h-[500px]">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              @click="sortTable('query_text')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Query
                <svg v-if="sortColumn === 'query_text'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortTable('data_source')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Platform
                <svg v-if="sortColumn === 'data_source'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortTable('brand_mentioned')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Brand Mention
                <svg v-if="sortColumn === 'brand_mentioned'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortTable('competitor')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Competitor
                <svg v-if="sortColumn === 'competitor'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortTable('response_outcome')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Response Outcome
                <svg v-if="sortColumn === 'response_outcome'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortTable('action_orientation')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Action Orientation
                <svg v-if="sortColumn === 'action_orientation'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <template v-for="(query, index) in filteredQueries" :key="index">
            <!-- Query Row -->
            <tr
              @click="toggleQueryExpand(query.id)"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors cursor-pointer"
            >
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex items-start">
                  <svg
                    class="w-4 h-4 mr-2 text-gray-400 transition-transform duration-200 flex-shrink-0 mt-0.5"
                    :class="{ 'rotate-90': expandedQueryIds.includes(query.id) }"
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
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getPlatformBadgeClass(query.data_source)"
                >
                  {{ getPlatformLabel(query.data_source) }}
                </span>
              </td>
              <td class="p-3 text-sm">
                <div class="flex items-center gap-2">
                  <span v-if="query.brand_mentioned" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400">
                    {{ getBrandMentionTypeLabel(query.brand_mention_type) }}
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400">
                    Not Mentioned
                  </span>
                </div>
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                <template v-if="getCompetitorNames(query)?.length">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(competitor, idx) in getCompetitorNames(query)"
                      :key="idx"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    >
                      {{ competitor }}
                    </span>
                  </div>
                </template>
                <span v-else class="text-gray-500 dark:text-gray-500">None</span>
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                {{ getResponseOutcomeLabel(query.response_outcome) }}
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                {{ getActionOrientationLabel(query.action_orientation) }}
              </td>
            </tr>

            <!-- Expanded Content Row -->
            <tr v-if="expandedQueryIds.includes(query.id)" class="bg-gray-50 dark:bg-gray-800/50">
              <td colspan="6" class="p-0">
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
                              {{ getPlatformLabel(query.data_source) }}
                            </span>
                          </p>
                        </div>
                        <div v-if="query.query_keyword">
                          <span class="font-medium text-gray-700 dark:text-gray-300">Keyword:</span>
                          <p class="text-gray-600 dark:text-gray-400">
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {{ toSentenceCase(query.query_keyword) }}
                            </span>
                          </p>
                        </div>
                        <div v-if="query.query_intent">
                          <span class="font-medium text-gray-700 dark:text-gray-300">Query Intent:</span>
                          <p class="text-gray-600 dark:text-gray-400">
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                              {{ toSentenceCase(query.query_intent) }}
                            </span>
                          </p>
                        </div>
                        <div v-if="query.query_topic">
                          <span class="font-medium text-gray-700 dark:text-gray-300">Query Topic:</span>
                          <p class="text-gray-600 dark:text-gray-400">
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300">
                              {{ toSentenceCase(query.query_topic) }}
                            </span>
                          </p>
                        </div>
                        <div v-if="query.funnel_stage">
                          <span class="font-medium text-gray-700 dark:text-gray-300">Funnel Stage:</span>
                          <p class="text-gray-600 dark:text-gray-400">
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                              {{ toSentenceCase(query.funnel_stage) }}
                            </span>
                          </p>
                        </div>
                        <div v-if="query.query_competition">
                          <span class="font-medium text-gray-700 dark:text-gray-300">Query Competition:</span>
                          <p class="text-gray-600 dark:text-gray-400">
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300">
                              {{ toSentenceCase(query.query_competition) }}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Model Response -->
                    <div v-if="query.model_response" class="space-y-2">
                      <h5 class="font-medium text-gray-700 dark:text-gray-300">Response</h5>
                      <div class="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                        <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                          {{ query.model_response }}
                        </p>
                      </div>
                    </div>

                    <!-- No Response Message -->
                    <div v-else class="p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                        No response text available for this query.
                      </p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-if="filteredQueries.length === 0">
            <td colspan="6" class="p-4 text-center text-gray-500 dark:text-gray-400">
              No queries match the current filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  queries: {
    type: Array,
    default: () => []
  }
})

// Filter, sort, expand, and loading state
const filterType = ref('all')
const platformFilter = ref('all')
const expandedQueryIds = ref([])
const sortColumn = ref('query_text')
const sortDirection = ref('asc')
const loading = ref(false) // Add loading state for consistency

// Initialize component
onMounted(() => {
  // No initialization needed - component relies on reactive props
})

// Get competitor names from a query - handles various data structures
const getCompetitorNames = (query) => {
  // First check the competitor_mentioned_names array
  if (query.competitor_mentioned_names && Array.isArray(query.competitor_mentioned_names) && query.competitor_mentioned_names.length > 0) {
    return query.competitor_mentioned_names
  }

  // Then check for competitor_mentioned_name string field (singular)
  if (query.competitor_mentioned_name) {
    return [query.competitor_mentioned_name]
  }

  // Check competitor_analysis JSON structure if present
  if (query.competitor_analysis && typeof query.competitor_analysis === 'object') {
    const names = []
    for (const key in query.competitor_analysis) {
      if (query.competitor_analysis[key]?.mentioned) {
        names.push(key)
      }
    }
    if (names.length > 0) {
      return names
    }
  }

  // No competitor names found
  return []
}

// Compute the available platforms from the dataset
const availablePlatforms = computed(() => {
  const platforms = new Set()

  props.queries.forEach(query => {
    if (query.data_source) {
      platforms.add(query.data_source.toLowerCase())
    }
  })

  return Array.from(platforms).map(platform => ({
    value: platform,
    label: getPlatformLabel(platform)
  })).sort((a, b) => a.label.localeCompare(b.label))
})

// Filtered and sorted queries based on selection
const filteredQueries = computed(() => {
  let filtered = [...props.queries]

  // Apply brand mention filter
  if (filterType.value === 'mentioned') {
    filtered = filtered.filter(q => q.brand_mentioned === true)
  } else if (filterType.value === 'not-mentioned') {
    filtered = filtered.filter(q => q.brand_mentioned !== true)
  }

  // Apply platform filter
  if (platformFilter.value !== 'all') {
    filtered = filtered.filter(q => {
      return q.data_source && q.data_source.toLowerCase() === platformFilter.value.toLowerCase()
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue, bValue;

    // Special handling for competitor column
    if (sortColumn.value === 'competitor') {
      // Get first competitor name for each query or empty string
      const aCompetitors = getCompetitorNames(a);
      const bCompetitors = getCompetitorNames(b);

      aValue = aCompetitors.length > 0 ? aCompetitors[0] : '';
      bValue = bCompetitors.length > 0 ? bCompetitors[0] : '';
    }
    // Special case for brand_mention_type
    else if (sortColumn.value === 'brand_mentioned' && a.brand_mentioned && b.brand_mentioned) {
      aValue = a.brand_mention_type || '';
      bValue = b.brand_mention_type || '';
    }
    // Default case for other columns
    else {
      aValue = a[sortColumn.value];
      bValue = b[sortColumn.value];
    }

    // Handle undefined/null values
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    // Convert to string for comparison if not already
    if (typeof aValue !== 'string') aValue = String(aValue);
    if (typeof bValue !== 'string') bValue = String(bValue);

    // Compare based on sort direction
    return sortDirection.value === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return filtered;
})

// Helper functions for labels
const getBrandMentionTypeLabel = (type) => {
  if (!type) return 'Unknown'
  
  const labels = {
    'primary': 'Primary Topic',
    'secondary': 'Secondary',
    'implicit': 'Implicit',
    'direct': 'Direct',
    'recommendation': 'Recommendation',
    'comparison': 'Comparison',
    'example': 'Example'
  }
  
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const getResponseOutcomeLabel = (outcome) => {
  if (!outcome) return 'Unknown'
  
  const labels = {
    'answer': 'Answer',
    'recommendation': 'Recommendation',
    'comparison': 'Comparison',
    'explanation': 'Explanation',
    'tutorial': 'Tutorial',
    'analysis': 'Analysis'
  }
  
  return labels[outcome] || outcome.charAt(0).toUpperCase() + outcome.slice(1)
}

const getActionOrientationLabel = (orientation) => {
  if (!orientation) return 'Unknown'

  const labels = {
    'passive': 'Passive',
    'educational': 'Educational',
    'actionable': 'Actionable',
    'promotional': 'Promotional',
    'conversion': 'Conversion'
  }

  return labels[orientation] || orientation.charAt(0).toUpperCase() + orientation.slice(1)
}

// Table sorting function
const sortTable = (column) => {
  // If clicking the same column, toggle direction
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New column, set to asc by default
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Toggle expanded state for a query
const toggleQueryExpand = (queryId) => {
  const index = expandedQueryIds.value.indexOf(queryId)
  if (index === -1) {
    // Not expanded, so expand it
    expandedQueryIds.value.push(queryId)
  } else {
    // Already expanded, so collapse it
    expandedQueryIds.value.splice(index, 1)
  }
}

// Utility to convert text to sentence case
const toSentenceCase = (text) => {
  if (!text) return '';
  // Handle strings, numbers, etc.
  const str = String(text);
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Get platform display label
const getPlatformLabel = (platform) => {
  const labels = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    perplexity: 'Perplexity',
    bard: 'Bard',
    gemini: 'Gemini'
  }
  return labels[platform?.toLowerCase()] || platform || 'Unknown'
}

// Get platform badge styling
const getPlatformBadgeClass = (platform) => {
  const classes = {
    chatgpt: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
    claude: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
    perplexity: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    bard: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
    gemini: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
  }
  return classes[platform?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300'
}
</script>

<style scoped>
.query-performance-table {
  position: relative;
  max-width: 100%;
  overflow-x: auto;
}

.query-performance-table:hover {
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

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.3);
  border-radius: 8px;
}

.dark .overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.2);
  border-radius: 8px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
  border-radius: 8px;
}

.dark .overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
  border-radius: 8px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

.dark .overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

/* Line clamp utilities */
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