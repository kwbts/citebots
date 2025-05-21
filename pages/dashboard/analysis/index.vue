<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Run Analysis</h1>
      <p class="page-subtitle">Analyze citations and track your brand presence in AI responses</p>
    </div>

    <!-- Main Content -->
    <div class="card section-spacing">
      <!-- Step 1 Header -->
      <h2 class="text-lg font-semibold mb-4">Step 1 - Set up seed keywords</h2>

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
        <label for="platform-select" class="form-label">Platform</label>
        <select
          id="platform-select"
          v-model="platform"
          class="input-field"
          :disabled="loading"
        >
          <option value="both">Both (ChatGPT & Perplexity)</option>
          <option value="chatgpt">ChatGPT</option>
          <option value="perplexity">Perplexity</option>
        </select>
      </div>

      <!-- Keywords Section -->
      <div class="mb-6" v-if="selectedClient">
        <h3 class="text-lg font-semibold mb-3">Keywords</h3>

        <!-- Client Keywords Display -->
        <div v-if="selectedClient.keywords && selectedClient.keywords.length > 0" class="mb-4">
          <p class="text-sm text-citebots-gray-600 mb-2">Client Keywords:</p>
          <div class="bg-citebots-gray-50 p-4 rounded-lg border border-citebots-gray-200">
            <span v-for="(keyword, index) in selectedClient.keywords" :key="index"
                  class="inline-block bg-citebots-orange/10 text-citebots-orange px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
              {{ keyword }}
            </span>
          </div>
        </div>
        <p v-else class="text-citebots-gray-500 italic mb-4">No keywords defined for this client</p>

        <!-- Custom Keywords Input -->
        <div class="mt-4">
          <label class="form-label">Custom Keywords (one per line)</label>
          <textarea
            v-model="customKeywords"
            class="input-field"
            rows="3"
            placeholder="Enter your own keywords, one per line"
          ></textarea>
          <p class="text-xs text-citebots-gray-500 mt-1">
            Enter custom keywords here to generate queries for specific terms
          </p>
        </div>
      </div>

      <!-- Generate Queries Button -->
      <div class="mt-8">
        <button
          @click="generateQueries"
          :disabled="!selectedClientId || !platform || loading"
          class="btn-primary w-full py-3 text-lg"
        >
        <span v-if="!loading">Generate Queries</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating queries...
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

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const clients = ref([])
const selectedClientId = ref('')
const platform = ref('both') // Default to both platforms
const loading = ref(false)
const statusMessage = ref('')
const statusClass = ref('')
const analysisResults = ref(null)
const customKeywords = ref('') // New field for custom keywords

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

async function generateQueries() {
  if (!selectedClientId.value || !platform.value) {
    statusMessage.value = 'Please select a client and platform'
    statusClass.value = 'bg-yellow-100 text-yellow-800'
    return
  }

  // Prepare the keywords
  const allKeywords = []

  // Add client keywords if available
  if (selectedClient.value?.keywords && selectedClient.value.keywords.length > 0) {
    allKeywords.push(...selectedClient.value.keywords)
  }

  // Add custom keywords if provided
  if (customKeywords.value) {
    const customKeywordsList = customKeywords.value
      .split('\n')
      .map(k => k.trim())
      .filter(k => k) // Filter out empty strings

    allKeywords.push(...customKeywordsList)
  }

  // Check if we have any keywords
  if (allKeywords.length === 0) {
    statusMessage.value = 'Please provide at least one keyword'
    statusClass.value = 'bg-yellow-100 text-yellow-800'
    return
  }

  // Navigate to preview page with all keywords
  router.push({
    path: '/dashboard/analysis/preview-queries',
    query: {
      client_id: selectedClientId.value,
      platform: platform.value,
      keywords: allKeywords.join(',')
    }
  })
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

// Define page metadata
definePageMeta({
  layout: 'dashboard'
})
</script>