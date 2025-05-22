<template>
  <div class="space-y-6">
    <!-- Raw Data Header -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Raw Analysis Data</h2>
      <p class="text-gray-600 mb-4">This is the original detailed view of all query results and their analysis data.</p>
      
      <!-- Summary Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Platform</p>
          <p class="font-semibold">{{ analysisRun?.platform || 'N/A' }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Status</p>
          <p class="font-semibold capitalize">{{ analysisRun?.status || 'N/A' }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Progress</p>
          <p class="font-semibold">{{ analysisRun?.queries_completed || 0 }}/{{ analysisRun?.queries_total || 0 }}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Created</p>
          <p class="font-semibold">{{ formatDate(analysisRun?.created_at) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Query Results List -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">Query Analysis Results</h3>
        <p class="text-sm text-gray-600 mt-1">{{ data.queries.length }} queries</p>
      </div>
      
      <div class="divide-y divide-gray-200">
        <div v-for="query in data.queries" :key="query.id"
             class="p-6 hover:bg-gray-50 cursor-pointer"
             @click="selectedQuery = query">
          
          <!-- Query Header -->
          <div class="flex justify-between items-start mb-3">
            <h4 class="font-medium text-lg text-gray-900">{{ query.query_text }}</h4>
            <span :class="getStatusClass(query.status)" class="px-2 py-1 text-xs rounded-full">
              {{ query.status }}
            </span>
          </div>
          
          <!-- Query Metadata -->
          <div class="text-sm text-gray-600 mb-3">
            <span>Keyword: {{ query.query_keyword || 'N/A' }}</span>
            <span class="mx-2">•</span>
            <span>Intent: {{ query.query_intent || 'N/A' }}</span>
            <span class="mx-2">•</span>
            <span>Platform: {{ query.data_source || 'N/A' }}</span>
          </div>
          
          <!-- Metrics Tags -->
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-if="query.brand_mentioned" class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Brand Mentioned
            </span>
            <span v-if="query.competitor_count > 0" class="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {{ query.competitor_count }} Competitors
            </span>
            <span v-if="query.brand_mention_count" class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ query.brand_mention_count }} Brand Mentions
            </span>
            <span v-if="query.brand_sentiment" class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Sentiment: {{ formatSentiment(query.brand_sentiment) }}
            </span>
          </div>
          
          <!-- Analysis Summary -->
          <div class="text-sm text-gray-600 space-y-1">
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
          <div v-if="query.page_analyses && query.page_analyses.length > 0" class="mt-4 pt-3 border-t border-gray-100">
            <p class="text-sm font-medium text-gray-700 mb-2">Citations ({{ query.page_analyses.length }}):</p>
            <div class="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
              <div v-for="page in query.page_analyses.slice(0, 3)" :key="page.id" class="flex items-start">
                <span v-if="page.brand_mentioned" class="text-green-600 mr-1">✓</span>
                <span v-else class="text-gray-400 mr-1">○</span>
                <span class="truncate" :title="page.page_title || page.citation_url">
                  {{ truncateText(page.page_title || page.citation_url, 80) }}
                </span>
              </div>
              <div v-if="query.page_analyses.length > 3" class="text-blue-600">
                + {{ query.page_analyses.length - 3 }} more citations
              </div>
            </div>
          </div>
          
          <!-- Query ID and Date -->
          <div class="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <div>ID: {{ truncateText(query.id, 8) }}</div>
            <div>{{ formatDate(query.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Query Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedQuery" 
           class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
           @click="selectedQuery = null">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
             @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold">Query Details</h3>
            <button @click="selectedQuery = null" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Modal content matches the existing analysis/[id] page structure -->
          <div class="space-y-4">
            <div>
              <h4 class="font-medium mb-2">Query</h4>
              <p class="text-gray-700">{{ selectedQuery.query_text }}</p>
              
              <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Keyword</p>
                  <p class="font-medium">{{ selectedQuery.query_keyword || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Intent</p>
                  <p class="font-medium">{{ selectedQuery.query_intent || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Platform</p>
                  <p class="font-medium">{{ selectedQuery.data_source || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Status</p>
                  <p class="font-medium capitalize">{{ selectedQuery.status || 'N/A' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Analysis Metrics -->
            <div>
              <h4 class="font-medium mb-2">Analysis Metrics</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Citations</p>
                  <p class="font-medium">{{ selectedQuery.citation_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Brand Mentions</p>
                  <p class="font-medium">{{ selectedQuery.brand_mention_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Competitors</p>
                  <p class="font-medium">{{ selectedQuery.competitor_count || 0 }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                  <p class="text-gray-500 text-xs">Sentiment</p>
                  <p class="font-medium">{{ formatSentiment(selectedQuery.brand_sentiment) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Response -->
            <div>
              <h4 class="font-medium mb-2">Response</h4>
              <div class="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                <p class="whitespace-pre-wrap text-sm">{{ selectedQuery.model_response }}</p>
              </div>
            </div>
            
            <!-- Raw Data -->
            <div>
              <h4 class="font-medium mb-2">Raw Query Data</h4>
              <div class="bg-gray-50 p-4 rounded overflow-x-auto">
                <pre class="text-xs">{{ JSON.stringify(selectedQuery, null, 2) }}</pre>
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