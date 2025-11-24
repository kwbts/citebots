<template>
  <div class="query-explorer bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Query Explorer</h3>
      </div>
      
      <!-- Quick Filters -->
      <div class="flex items-center gap-2">
        <select 
          v-model="sortBy"
          class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="mentions">Most Mentions</option>
          <option value="sentiment">Best Sentiment</option>
          <option value="citations">Most Citations</option>
          <option value="recent">Most Recent</option>
        </select>
        
        <select 
          v-model="citationFilter"
          class="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Queries</option>
          <option value="with_citations">With Citations</option>
          <option value="no_citations">No Citations</option>
        </select>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search queries..."
          class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        <svg class="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ filteredQueries.length }} of {{ queries.length }} queries
        <span v-if="searchQuery" class="font-medium">for "{{ searchQuery }}"</span>
      </p>
      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ brandMentionCount }} with brand mentions</span>
        <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
        <span>{{ citationCount }} with citations</span>
      </div>
    </div>

    <!-- Query List -->
    <div class="space-y-3">
      <div 
        v-for="query in paginatedQueries" 
        :key="query.id"
        class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
      >
        <!-- Query Header -->
        <div 
          class="p-4 cursor-pointer select-none"
          @click="toggleQuery(query.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <!-- Platform Badge -->
                <span 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getPlatformBadgeClass(query.data_source)"
                >
                  {{ getPlatformLabel(query.data_source) }}
                </span>
                
                <!-- Intent Badge -->
                <span 
                  v-if="query.query_intent"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {{ query.query_intent }}
                </span>
                
                <!-- Brand Mention Badge -->
                <span
                  v-if="query.brand_mentioned && query.brand_mention_type !== 'implicit'"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                >
                  Brand Mentioned
                </span>
              </div>
              
              <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {{ query.query_text }}
              </h4>
              
              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span v-if="query.citation_count">
                  {{ query.citation_count }} citation{{ query.citation_count !== 1 ? 's' : '' }}
                </span>
                <span v-if="query.brand_mention_count">
                  {{ query.brand_mention_count }} mention{{ query.brand_mention_count !== 1 ? 's' : '' }}
                </span>
                <span v-if="query.brand_sentiment !== null && query.brand_sentiment !== undefined">
                  Sentiment: {{ formatSentiment(query.brand_sentiment) }}
                </span>
                <span v-if="query.created_at">
                  {{ formatDate(query.created_at) }}
                </span>
              </div>
            </div>
            
            <!-- Expand Toggle -->
            <button class="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': expandedQueries.has(query.id) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Expanded Content -->
        <div 
          v-if="expandedQueries.has(query.id)"
          class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
        >
          <div class="p-4 space-y-4">
            <!-- Query Details -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div v-if="query.query_keyword">
                <span class="font-medium text-gray-700 dark:text-gray-300">Keyword:</span>
                <p class="text-gray-600 dark:text-gray-400">{{ query.query_keyword }}</p>
              </div>
              <div v-if="query.query_type">
                <span class="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <p class="text-gray-600 dark:text-gray-400">{{ query.query_type }}</p>
              </div>
              <div v-if="query.funnel_stage">
                <span class="font-medium text-gray-700 dark:text-gray-300">Funnel Stage:</span>
                <p class="text-gray-600 dark:text-gray-400">{{ query.funnel_stage }}</p>
              </div>
              <div v-if="query.response_outcome">
                <span class="font-medium text-gray-700 dark:text-gray-300">Outcome:</span>
                <p class="text-gray-600 dark:text-gray-400">{{ query.response_outcome }}</p>
              </div>
            </div>

            <!-- Associated Pages -->
            <div v-if="query.associated_pages?.length" class="space-y-3">
              <h5 class="font-medium text-gray-700 dark:text-gray-300">
                Associated Pages ({{ query.associated_pages.length }})
              </h5>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="page in query.associated_pages.slice(0, 5)" 
                  :key="page.id"
                  class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span 
                        class="inline-block w-2 h-2 rounded-full"
                        :class="page.is_client_domain ? 'bg-green-500' : page.is_competitor_domain ? 'bg-red-500' : 'bg-gray-400'"
                      ></span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ page.page_title || page.domain_name }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ page.citation_url }}
                    </p>
                  </div>
                  <div class="ml-3 text-right">
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      #{{ page.citation_position }}
                    </div>
                    <div v-if="page.brand_mentioned && page.brand_mention_type !== 'implicit'" class="text-xs text-green-600 dark:text-green-400">
                      Brand mentioned
                    </div>
                  </div>
                </div>
              </div>
              <button 
                v-if="query.associated_pages.length > 5"
                @click="$emit('query-select', query)"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all {{ query.associated_pages.length }} pages →
              </button>
            </div>

            <!-- Model Response Preview -->
            <div v-if="query.model_response" class="space-y-2">
              <h5 class="font-medium text-gray-700 dark:text-gray-300">Response Preview</h5>
              <div class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {{ query.model_response }}
                </p>
                <button 
                  @click="$emit('query-select', query)"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                >
                  Read full response →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading queries...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  queries: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['query-select'])

// Reactive state
const searchQuery = ref('')
const sortBy = ref('relevance')
const citationFilter = ref('all')
const expandedQueries = ref(new Set())
const currentPage = ref(1)
const itemsPerPage = 10

// Computed filtered and sorted queries
const filteredQueries = computed(() => {
  let filtered = props.queries.filter(query => {
    // Search filter
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      const matchesText = query.query_text?.toLowerCase().includes(search)
      const matchesKeyword = query.query_keyword?.toLowerCase().includes(search)
      if (!matchesText && !matchesKeyword) return false
    }
    
    // Citation filter
    if (citationFilter.value === 'with_citations' && (!query.citation_count || query.citation_count === 0)) {
      return false
    }
    if (citationFilter.value === 'no_citations' && query.citation_count > 0) {
      return false
    }
    
    return true
  })

  // Sort queries
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'mentions':
        return (b.brand_mention_count || 0) - (a.brand_mention_count || 0)
      case 'sentiment':
        return (b.brand_sentiment || 0) - (a.brand_sentiment || 0)
      case 'citations':
        return (b.citation_count || 0) - (a.citation_count || 0)
      case 'recent':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      default: // relevance
        return ((b.brand_mentioned && b.brand_mention_type !== 'implicit') ? 1 : 0) - ((a.brand_mentioned && a.brand_mention_type !== 'implicit') ? 1 : 0)
    }
  })

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredQueries.value.length / itemsPerPage))
const paginatedQueries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredQueries.value.slice(start, end)
})

// Summary counts
const brandMentionCount = computed(() =>
  filteredQueries.value.filter(q => q.brand_mentioned && q.brand_mention_type !== 'implicit').length
)

const citationCount = computed(() => 
  filteredQueries.value.filter(q => q.citation_count > 0).length
)

// Methods
const toggleQuery = (queryId) => {
  if (expandedQueries.value.has(queryId)) {
    expandedQueries.value.delete(queryId)
  } else {
    expandedQueries.value.add(queryId)
  }
}

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

const formatSentiment = (sentiment) => {
  if (sentiment > 0.5) return 'Positive'
  if (sentiment < -0.5) return 'Negative'
  return 'Neutral'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Reset pagination when filters change
watch([searchQuery, sortBy, citationFilter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.query-explorer {
  position: relative;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.query-explorer .space-y-3 > div > div:last-child {
  animation: slideDown 0.3s ease-out;
}
</style>