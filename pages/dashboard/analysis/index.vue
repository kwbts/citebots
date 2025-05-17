<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Run Analysis</h1>
    
    <!-- Client Selection -->
    <div class="mb-6">
      <label for="client-select" class="block text-sm font-medium mb-2">
        Select Client
      </label>
      <select
        id="client-select"
        v-model="selectedClientId"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <label class="block text-sm font-medium mb-2">Platform</label>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            type="radio"
            v-model="platform"
            value="chatgpt"
            class="mr-2"
          />
          ChatGPT
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="platform"
            value="perplexity"
            class="mr-2"
          />
          Perplexity
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="platform"
            value="both"
            class="mr-2"
          />
          Both
        </label>
      </div>
    </div>

    <!-- Keywords Display -->
    <div class="mb-6" v-if="selectedClient">
      <h3 class="text-lg font-semibold mb-2">Keywords</h3>
      <div class="bg-gray-50 p-4 rounded-md">
        <div v-if="selectedClient.keywords && selectedClient.keywords.length > 0">
          <span v-for="(keyword, index) in selectedClient.keywords" :key="index"
                class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
            {{ keyword }}
          </span>
        </div>
        <p v-else class="text-gray-500">No keywords defined for this client</p>
      </div>
    </div>

    <!-- Test Mode -->
    <div class="mb-6" v-if="selectedClientId">
      <label class="flex items-center mb-2">
        <input
          type="checkbox"
          v-model="testMode"
          class="mr-2"
        />
        <span class="text-sm font-medium">Test Mode (Manual Keywords)</span>
      </label>

      <div v-if="testMode" class="mt-2">
        <label class="block text-sm font-medium mb-1">Test Keywords</label>
        <textarea
          v-model="testKeywords"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter test keywords, one per line"
        ></textarea>
      </div>
    </div>

    <!-- Run Analysis Button -->
    <div class="mt-8">
      <button
        @click="runAnalysis"
        :disabled="!selectedClientId || !platform || loading"
        class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="!loading">Run Analysis</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Running analysis...
        </span>
      </button>

      <!-- Debug Button (temporary) -->
      <button
        @click="debugConnection"
        class="mt-2 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
      >
        Debug Connection
      </button>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="mt-6 p-4 rounded-md" :class="statusClass">
      {{ statusMessage }}
    </div>

    <!-- Results Preview -->
    <div v-if="analysisResults" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">Analysis Results</h3>
      <div class="bg-gray-50 p-4 rounded-md">
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
    <div v-if="recentRuns.length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">Recent Analysis Runs</h3>
      <div class="space-y-2">
        <div v-for="run in recentRuns" :key="run.id" 
             class="bg-white p-4 rounded-md border border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium">{{ getClientName(run.client_id) }}</p>
              <p class="text-sm text-gray-600">
                {{ run.platform }} • {{ run.queries_completed }}/{{ run.queries_total }} queries
              </p>
              <p class="text-xs text-gray-500">
                {{ new Date(run.created_at).toLocaleString() }}
              </p>
            </div>
            <span :class="getStatusClass(run.status)" class="px-2 py-1 text-xs rounded-full">
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

// Computed properties
const selectedClient = computed(() => {
  return clients.value.find(c => c.id === selectedClientId.value)
})

const statusClass = computed(() => {
  return {
    'bg-blue-100 text-blue-800': statusType.value === 'info',
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

  loading.value = true
  showStatus('Starting analysis...', 'info')

  try {
    let keywords = null
    if (testMode.value) {
      // Parse test keywords (one per line)
      keywords = testKeywords.value.split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0)
    }

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
      return 'bg-blue-100 text-blue-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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