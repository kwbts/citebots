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
        <div class="flex items-center">
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

        <!-- Debug Button (temporary) -->
        <button
          @click="debugConnection"
          class="btn-secondary w-full mt-3"
        >
          Debug Connection
        </button>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="mt-6 p-4 rounded-lg" :class="statusClass">
      {{ statusMessage }}
    </div>

    <!-- Results Preview -->
    <div v-if="analysisResults" class="card section-spacing">
      <h3 class="text-lg font-semibold mb-4">Analysis Results</h3>
      <div class="bg-citebots-gray-50 p-4 rounded-lg">
        <p><strong>Analysis Run ID:</strong> {{ analysisResults.analysis_run.id }}</p>
        <p><strong>Status:</strong> {{ analysisResults.analysis_run.status }}</p>
        <p><strong>Queries Completed:</strong> {{ analysisResults.analysis_run.queries_completed }} / {{ analysisResults.analysis_run.queries_total }}</p>
        <p v-if="analysisResults.analysis_run.completed_at">
          <strong>Completed:</strong> {{ new Date(analysisResults.analysis_run.completed_at).toLocaleString() }}
        </p>
        <NuxtLink :to="`/dashboard/analysis/${analysisResults.analysis_run.id}`"
                  class="inline-block mt-4 text-blue-600 hover:text-blue-800">
          View Full Results →
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Analysis Runs -->
    <div v-if="recentRuns.length > 0" class="card">
      <h3 class="text-lg font-semibold mb-4">Recent Analysis Runs</h3>
      <div class="space-y-3">
        <div v-for="run in recentRuns" :key="run.id"
             class="p-4 rounded-lg border border-citebots-gray-200 hover:border-citebots-gray-300 transition-colors">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-citebots-dark">{{ getClientName(run.client_id) }}</p>
              <p class="text-sm text-citebots-gray-600">
                {{ run.platform }} • {{ run.queries_completed }}/{{ run.queries_total }} queries
              </p>
              <p class="text-xs text-citebots-gray-500">
                {{ new Date(run.created_at).toLocaleString() }}
              </p>
            </div>
            <span :class="getStatusClass(run.status)" class="px-3 py-1 text-xs font-medium rounded-full">
              {{ run.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const clients = ref([])
const selectedClientId = ref('')
const platform = ref('both')
const loading = ref(false)
const statusMessage = ref('')
const statusType = ref('info')
const analysisResults = ref(null)
const recentRuns = ref([])
const testMode = ref(false)
const testKeywords = ref('')
const previewQueries = ref(true) // Default to preview mode

// Computed properties
const selectedClient = computed(() => {
  return clients.value.find(c => c.id === selectedClientId.value)
})

const statusClass = computed(() => {
  return {
    'bg-citebots-orange/10 text-citebots-orange': statusType.value === 'info',
    'bg-green-100 text-green-800': statusType.value === 'success',
    'bg-red-100 text-red-800': statusType.value === 'error'
  }
})

// Methods
const fetchClients = async () => {
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
    showStatus('Failed to load clients', 'error')
  }
}

const fetchRecentRuns = async () => {
  try {
    const { data, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    recentRuns.value = data || []
  } catch (error) {
    console.error('Error fetching recent runs:', error)
  }
}

const runAnalysis = async () => {
  if (!selectedClientId.value || !platform.value) {
    showStatus('Please select a client and platform', 'error')
    return
  }

  if (testMode.value && !testKeywords.value.trim()) {
    showStatus('Please enter test keywords', 'error')
    return
  }

  let keywords = null
  if (testMode.value) {
    // Parse test keywords (one per line)
    keywords = testKeywords.value.split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0)
  }

  // If preview mode, redirect to query preview page
  if (previewQueries.value) {
    const effectiveKeywords = keywords || selectedClient.value?.keywords || []
    if (effectiveKeywords.length === 0) {
      showStatus('No keywords defined for this client', 'error')
      return
    }

    await navigateTo({
      path: '/dashboard/analysis/preview-queries',
      query: {
        client_id: selectedClientId.value,
        platform: platform.value,
        keywords: effectiveKeywords.join(',')
      }
    })
    return
  }

  // Otherwise run analysis directly (old behavior)
  loading.value = true
  showStatus('Starting analysis...', 'info')

  try {
    // Call the edge function to run analysis
    const { data, error } = await supabase.functions.invoke('run-analysis', {
      body: {
        client_id: selectedClientId.value,
        platform: platform.value,
        test_mode: testMode.value,
        keywords: keywords
      }
    })

    if (error) throw error

    analysisResults.value = data
    showStatus('Analysis started successfully!', 'success')

    // Refresh recent runs
    await fetchRecentRuns()
  } catch (error) {
    console.error('Error running analysis:', error)
    showStatus(`Failed to start analysis: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  
  // Clear message after 5 seconds
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}

const getClientName = (clientId) => {
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.name : 'Unknown Client'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'running':
      return 'bg-citebots-orange/10 text-citebots-orange'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-citebots-gray-100 text-citebots-gray-800'
  }
}

const debugConnection = async () => {
  try {
    console.log('Testing edge function connection...')

    const { data, error } = await supabase.functions.invoke('debug-analysis', {
      body: {
        test: true,
        client_id: selectedClientId.value,
        platform: platform.value
      }
    })

    console.log('Debug response:', data)
    console.log('Debug error:', error)

    if (error) {
      showStatus(`Debug error: ${error.message}`, 'error')
    } else {
      showStatus(`Debug success: ${JSON.stringify(data)}`, 'success')
    }
  } catch (err) {
    console.error('Debug error:', err)
    showStatus(`Debug exception: ${err.message}`, 'error')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchClients()
  await fetchRecentRuns()
})
</script>