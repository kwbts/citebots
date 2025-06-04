<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Run Analysis</h1>
      <p class="page-subtitle">Analyze citations and track your brand presence in AI responses</p>
    </div>
    
    <!-- Main Content -->
    <div class="card section-spacing">
      <!-- Client Selection -->
      <div class="mb-6">
        <label for="client-select" class="form-label">
          Select Client
        </label>
        <select
          id="client-select"
          v-model="selectedClientId"
          class="input-field"
          :disabled="loading"
        >
        <option value="">Choose a client...</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.name }} ({{ client.domain }})
        </option>
      </select>
    </div>

      <!-- Platform Selection -->
      <div class="mb-6" v-if="selectedClientId">
        <label class="form-label">Platform</label>
        <div class="space-y-3">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="platform"
              value="chatgpt"
              class="mr-3 text-citebots-orange focus:ring-citebots-orange"
            />
            <span class="text-citebots-gray-700">ChatGPT</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="platform"
              value="perplexity"
              class="mr-3 text-citebots-orange focus:ring-citebots-orange"
            />
            <span class="text-citebots-gray-700">Perplexity</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="platform"
              value="both"
              class="mr-3 text-citebots-orange focus:ring-citebots-orange"
            />
            <span class="text-citebots-gray-700">Both</span>
          </label>
      </div>
    </div>

      <!-- Keywords Display -->
      <div class="mb-6" v-if="selectedClient">
        <h3 class="text-lg font-semibold mb-3">Keywords</h3>
        <div class="bg-citebots-gray-50 p-4 rounded-lg border border-citebots-gray-200">
        <div v-if="selectedClient.keywords && selectedClient.keywords.length > 0">
            <span v-for="(keyword, index) in selectedClient.keywords" :key="index"
                  class="inline-block bg-citebots-orange/10 text-citebots-orange px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
              {{ keyword }}
            </span>
        </div>
          <p v-else class="text-citebots-gray-500 italic">No keywords defined for this client</p>
      </div>
    </div>

      <!-- Test Mode -->
      <div class="mb-6" v-if="selectedClientId">
        <label class="flex items-center cursor-pointer mb-3">
          <input
            type="checkbox"
            v-model="testMode"
            class="mr-3 h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange"
          />
          <span class="text-sm font-medium text-citebots-gray-700">Test Mode (Manual Keywords)</span>
        </label>

        <div v-if="testMode" class="mt-2">
          <label class="form-label">Test Keywords</label>
          <textarea
            v-model="testKeywords"
            class="input-field"
            rows="3"
            placeholder="Enter test keywords, one per line"
          ></textarea>
        </div>
      </div>

      <!-- Analysis Options -->
      <div class="mb-6" v-if="selectedClientId">
        <div class="flex items-center mb-3">
          <input
            type="checkbox"
            id="preview-queries"
            v-model="previewQueries"
            class="h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange"
          />
          <label for="preview-queries" class="ml-3 text-sm text-citebots-gray-700 cursor-pointer">
            Preview and customize queries before running analysis
          </label>
        </div>
        
        <!-- Queue Processing Option -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="use-queue"
            v-model="useQueueProcessing"
            class="h-4 w-4 text-citebots-orange rounded focus:ring-citebots-orange"
          />
          <label for="use-queue" class="ml-3 text-sm text-citebots-gray-700 cursor-pointer">
            Use queue processing (recommended for large batches)
          </label>
        </div>
      </div>

      <!-- Run Analysis Button -->
      <div class="mt-8">
        <button
          @click="runAnalysis"
          :disabled="!selectedClientId || !platform || loading"
          class="btn-primary w-full py-3 text-lg"
        >
        <span v-if="!loading">{{ previewQueries ? 'Preview Queries' : 'Run Analysis' }}</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ previewQueries ? 'Generating queries...' : 'Running analysis...' }}
        </span>
      </button>
    </div>
  </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="mt-6 p-4 rounded-lg" :class="statusClass">
      {{ statusMessage }}
    </div>

    <!-- Queue Progress Component -->
    <div v-if="currentAnalysisRunId && processingMethod === 'queue'" class="mt-6">
      <QueueProgress 
        :analysis-run-id="currentAnalysisRunId" 
        @complete="onAnalysisComplete"
      />
    </div>

    <!-- Results Preview (for sync processing) -->
    <div v-if="analysisResults && processingMethod !== 'queue'" class="card section-spacing">
      <h3 class="text-lg font-semibold mb-4">Analysis Results</h3>
      <div class="bg-citebots-gray-50 p-4 rounded-lg">
        <p><strong>Analysis Run ID:</strong> {{ analysisResults.analysis_run.id }}</p>
        <p><strong>Status:</strong> {{ analysisResults.analysis_run.status }}</p>
        <p><strong>Queries Completed:</strong> {{ analysisResults.analysis_run.queries_completed }} / {{ analysisResults.analysis_run.queries_total }}</p>
        <p v-if="analysisResults.analysis_run.completed_at">
          <strong>Completed:</strong> {{ new Date(analysisResults.analysis_run.completed_at).toLocaleString() }}
        </p>
        <button 
          v-if="analysisResults.analysis_run.status === 'completed'"
          @click="viewResults"
          class="btn-primary mt-4"
        >
          View Detailed Results
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useQueueAnalysis } from '~/composables/useQueueAnalysis'
import QueueProgress from '~/components/analysis/QueueProgress.vue'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { useQueue, toggleQueue, runAnalysisWithQueue } = useQueueAnalysis()

// Data
const clients = ref([])
const selectedClientId = ref('')
const platform = ref('chatgpt')
const loading = ref(false)
const statusMessage = ref('')
const statusClass = ref('')
const analysisResults = ref(null)
const testMode = ref(false)
const testKeywords = ref('')
const previewQueries = ref(false)
const useQueueProcessing = ref(false)
const currentAnalysisRunId = ref(null)
const processingMethod = ref(null)

// Computed
const selectedClient = computed(() => 
  clients.value.find(c => c.id === selectedClientId.value)
)

// Methods
async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('created_by', user.value.id)
      .order('name')
    
    if (error) throw error
    clients.value = data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    statusMessage.value = 'Error loading clients'
    statusClass.value = 'bg-red-100 text-red-800'
  }
}

async function runAnalysis() {
  if (!selectedClientId.value || !platform.value) {
    statusMessage.value = 'Please select a client and platform'
    statusClass.value = 'bg-yellow-100 text-yellow-800'
    return
  }

  if (previewQueries.value) {
    // Navigate to preview page
    router.push({
      path: '/dashboard/analysis/preview-queries',
      query: {
        client_id: selectedClientId.value,
        platform: platform.value,
        test_mode: testMode.value,
        test_keywords: testKeywords.value
      }
    })
    return
  }

  loading.value = true
  statusMessage.value = ''
  analysisResults.value = null
  currentAnalysisRunId.value = null
  processingMethod.value = null

  try {
    // Prepare the analysis run data
    const runData = {
      client_id: selectedClientId.value,
      platform: platform.value,
      test_mode: testMode.value,
      test_keywords: testMode.value ? testKeywords.value.split('\n').filter(k => k.trim()) : []
    }

    let result
    
    if (useQueueProcessing.value) {
      // Use queue-based processing
      result = await runAnalysisWithQueue(runData)
      processingMethod.value = 'queue'
    } else {
      // Use traditional sync processing
      const response = await supabase.functions.invoke('run-analysis', {
        body: runData
      })
      
      if (response.error) throw response.error
      result = response.data
      processingMethod.value = 'sync'
    }

    if (result.success) {
      currentAnalysisRunId.value = result.analysis_run_id
      
      if (processingMethod.value === 'queue') {
        statusMessage.value = 'Analysis queued for processing. Monitor progress below.'
        statusClass.value = 'bg-blue-100 text-blue-800'
      } else {
        statusMessage.value = 'Analysis started successfully'
        statusClass.value = 'bg-green-100 text-green-800'
        analysisResults.value = result
      }
    } else {
      throw new Error(result.error || 'Analysis failed')
    }
    
  } catch (error) {
    console.error('Error running analysis:', error)
    statusMessage.value = error.message || 'Error running analysis'
    statusClass.value = 'bg-red-100 text-red-800'
  } finally {
    loading.value = false
  }
}

function onAnalysisComplete(runData) {
  statusMessage.value = 'Analysis completed!'
  statusClass.value = 'bg-green-100 text-green-800'
  
  // Navigate to results after short delay
  setTimeout(() => {
    router.push(`/dashboard/analysis/${runData.id}`)
  }, 1500)
}

function viewResults() {
  if (analysisResults.value?.analysis_run?.id) {
    router.push(`/dashboard/analysis/${analysisResults.value.analysis_run.id}`)
  }
}

async function debugConnection() {
  try {
    const { data, error } = await supabase.functions.invoke('run-analysis', {
      body: { test: true }
    })
    console.log('Debug response:', data, error)
    alert(JSON.stringify({ data, error }, null, 2))
  } catch (err) {
    console.error('Debug error:', err)
    alert(`Debug error: ${err.message}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchClients()
})
</script>