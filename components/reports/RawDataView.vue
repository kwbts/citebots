<template>
  <div class="space-y-6">
    <!-- Raw Data Header -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Raw Analysis Data</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">This is the original detailed view of all query results and their analysis data for troubleshooting.</p>

      <!-- Data Structure Debug -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 p-4 rounded-lg mb-4">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Data Structure Debug</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p class="text-yellow-700 dark:text-yellow-400 font-medium">Analysis Queries</p>
            <p class="text-yellow-600 dark:text-yellow-300">{{ data.analysis_queries?.length || 0 }} queries</p>
          </div>
          <div>
            <p class="text-yellow-700 dark:text-yellow-400 font-medium">Page Analyses</p>
            <p class="text-yellow-600 dark:text-yellow-300">{{ data.page_analyses?.length || 0 }} pages</p>
          </div>
          <div>
            <p class="text-yellow-700 dark:text-yellow-400 font-medium">Client Data</p>
            <p class="text-yellow-600 dark:text-yellow-300">{{ client?.name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-yellow-700 dark:text-yellow-400 font-medium">Analysis Run</p>
            <p class="text-yellow-600 dark:text-yellow-300">{{ analysisRun?.id ? 'Present' : 'Missing' }}</p>
          </div>
        </div>
        <details class="mt-3">
          <summary class="text-yellow-700 dark:text-yellow-400 cursor-pointer hover:text-yellow-800 dark:hover:text-yellow-300">Show Complete Data Structure</summary>
          <div class="mt-2 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            <pre class="text-xs text-gray-900 dark:text-gray-100">{{ JSON.stringify({
              data_keys: Object.keys(data || {}),
              analysis_queries_sample: data.analysis_queries?.[0] || null,
              page_analyses_sample: data.page_analyses?.[0] || null,
              analysis_run: analysisRun,
              client: client
            }, null, 2) }}</pre>
          </div>
        </details>
      </div>

      <!-- Summary Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">Platform</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ analysisRun?.platform || 'N/A' }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">Status</p>
          <p class="font-semibold capitalize text-gray-900 dark:text-white">{{ analysisRun?.status || 'N/A' }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">Progress</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ analysisRun?.queries_completed || 0 }}/{{ analysisRun?.queries_total || 0 }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">Created</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(analysisRun?.created_at) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Query Results List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Query Analysis Results</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ data.analysis_queries?.length || 0 }} queries</p>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="query in data.analysis_queries" :key="query.id"
             class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
             @click="selectedQuery = query">
          
          <!-- Query Header -->
          <div class="flex justify-between items-start mb-3">
            <h4 class="font-medium text-lg text-gray-900 dark:text-white">{{ query.query_text }}</h4>
            <span :class="getStatusClass(query.status)" class="px-2 py-1 text-xs rounded-full">
              {{ query.status }}
            </span>
          </div>

          <!-- Query Metadata -->
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>Keyword: {{ query.query_keyword || 'N/A' }}</span>
            <span class="mx-2">•</span>
            <span>Intent: {{ query.query_intent || 'N/A' }}</span>
            <span class="mx-2">•</span>
            <span>Platform: {{ query.data_source || 'N/A' }}</span>
          </div>
          
          <!-- Metrics Tags -->
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-if="query.brand_mentioned" class="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
              Brand Mentioned
            </span>
            <span v-if="query.competitor_count > 0" class="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
              {{ query.competitor_count }} Competitors
            </span>
            <span v-if="query.brand_mention_count" class="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
              {{ query.brand_mention_count }} Brand Mentions
            </span>
            <span v-if="query.brand_sentiment" class="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
              Sentiment: {{ formatSentiment(query.brand_sentiment) }}
            </span>
          </div>
          
          <!-- Analysis Summary -->
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p v-if="query.citation_count > 0">
              {{ query.citation_count }} citations analyzed
            </p>
            <p v-if="query.query_category">
              Category: {{ query.query_category }} | Type: {{ query.query_type }}
            </p>
            <p v-if="query.funnel_stage">
              Funnel: {{ query.funnel_stage }} | Competition: {{ query.query_competition }}
            </p>
          </div>
          
          <!-- Page Analysis Preview -->
          <div v-if="getPageAnalysesForQuery(query.id).length > 0" class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Citations ({{ getPageAnalysesForQuery(query.id).length }}):</p>
            <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1 max-h-20 overflow-y-auto">
              <div v-for="page in getPageAnalysesForQuery(query.id).slice(0, 3)" :key="page.id" class="flex items-start">
                <span v-if="page.brand_mentioned" class="text-green-600 dark:text-green-400 mr-1">✓</span>
                <span v-else class="text-gray-400 dark:text-gray-500 mr-1">○</span>
                <span class="truncate" :title="page.page_title || page.citation_url">
                  {{ truncateText(page.page_title || page.citation_url, 80) }}
                </span>
              </div>
              <div v-if="getPageAnalysesForQuery(query.id).length > 3" class="text-blue-600 dark:text-blue-400">
                + {{ getPageAnalysesForQuery(query.id).length - 3 }} more citations
              </div>
            </div>
          </div>
          
          <!-- Query ID and Date -->
          <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <div>ID: {{ truncateText(query.id, 8) }}</div>
            <div>{{ formatDate(query.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Query Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedQuery"
           class="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex items-center justify-center p-4"
           @click="selectedQuery = null">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
             @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Query Details</h3>
            <button @click="selectedQuery = null" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Modal content matches the existing analysis/[id] page structure -->
          <div class="space-y-4">
            <div>
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Query</h4>
              <p class="text-gray-700 dark:text-gray-300">{{ selectedQuery.query_text }}</p>

              <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Keyword</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.query_keyword || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Intent</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.query_intent || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Platform</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.data_source || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Status</p>
                  <p class="font-medium capitalize text-gray-900 dark:text-white">{{ selectedQuery.status || 'N/A' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Analysis Metrics -->
            <div>
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Analysis Metrics</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Citations</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.citation_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Brand Mentions</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.brand_mention_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Competitors</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedQuery.competitor_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p class="text-gray-500 dark:text-gray-400 text-xs">Sentiment</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatSentiment(selectedQuery.brand_sentiment) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Response -->
            <div>
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Response</h4>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded max-h-96 overflow-y-auto">
                <p class="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{{ selectedQuery.model_response }}</p>
              </div>
            </div>
            
            <!-- Page Analyses -->
            <div v-if="getPageAnalysesForQuery(selectedQuery.id).length > 0">
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Page Analyses ({{ getPageAnalysesForQuery(selectedQuery.id).length }})</h4>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div v-for="page in getPageAnalysesForQuery(selectedQuery.id)" :key="page.id"
                     class="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                  <div class="flex justify-between items-start mb-2">
                    <h5 class="font-medium text-sm text-gray-900 dark:text-white">{{ page.page_title || 'Untitled Page' }}</h5>
                    <span v-if="page.brand_mentioned" class="text-green-600 dark:text-green-300 text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      Brand Mentioned
                    </span>
                  </div>
                  <p class="text-xs text-blue-600 dark:text-blue-400 mb-2">
                    <a :href="page.citation_url" target="_blank" class="hover:underline">
                      {{ page.citation_url }}
                    </a>
                  </p>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div v-if="page.content_quality_score" class="bg-white dark:bg-gray-800 p-2 rounded">
                      <p class="text-gray-500 dark:text-gray-400">Quality Score</p>
                      <p class="font-medium text-gray-900 dark:text-white">{{ page.content_quality_score }}/5</p>
                    </div>
                    <div v-if="page.relevance_score" class="bg-white dark:bg-gray-800 p-2 rounded">
                      <p class="text-gray-500 dark:text-gray-400">Relevance</p>
                      <p class="font-medium text-gray-900 dark:text-white">{{ page.relevance_score }}/5</p>
                    </div>
                    <div v-if="page.on_page_seo?.word_count" class="bg-white dark:bg-gray-800 p-2 rounded">
                      <p class="text-gray-500 dark:text-gray-400">Word Count</p>
                      <p class="font-medium text-gray-900 dark:text-white">{{ page.on_page_seo.word_count }}</p>
                    </div>
                    <div v-if="page.technical_seo?.mobile_friendly !== undefined" class="bg-white dark:bg-gray-800 p-2 rounded">
                      <p class="text-gray-500 dark:text-gray-400">Mobile Friendly</p>
                      <p class="font-medium text-gray-900 dark:text-white">{{ page.technical_seo.mobile_friendly ? 'Yes' : 'No' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw Query Data -->
            <div>
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Raw Query Data</h4>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded overflow-x-auto">
                <pre class="text-xs text-gray-900 dark:text-gray-100">{{ JSON.stringify(selectedQuery, null, 2) }}</pre>
              </div>
            </div>

            <!-- Raw Page Analyses Data -->
            <div v-if="getPageAnalysesForQuery(selectedQuery.id).length > 0">
              <h4 class="font-medium mb-2 text-gray-900 dark:text-white">Raw Page Analyses Data</h4>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <pre class="text-xs text-gray-900 dark:text-gray-100">{{ JSON.stringify(getPageAnalysesForQuery(selectedQuery.id), null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  analysisRun: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  }
})

// Data
const selectedQuery = ref(null)

// Methods
const getPageAnalysesForQuery = (queryId) => {
  if (!props.data?.page_analyses) return []
  return props.data.page_analyses.filter(page => page.query_id === queryId)
}

const getStatusClass = (status) => {
  const classes = {
    'completed': 'bg-green-100 text-green-800',
    'running': 'bg-blue-100 text-blue-800',
    'failed': 'bg-red-100 text-red-800',
    'pending': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

const formatSentiment = (score) => {
  if (score === undefined || score === null) return 'N/A'
  
  const numScore = parseFloat(score)
  if (isNaN(numScore)) return 'N/A'
  
  return numScore > 0 ? `+${numScore.toFixed(2)}` : numScore.toFixed(2)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>