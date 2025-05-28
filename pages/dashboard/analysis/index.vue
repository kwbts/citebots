<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Run Analysis</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Analyze citations and track your brand presence in AI responses</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Setup Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Analysis Setup</h2>
        <p class="text-gray-600 dark:text-gray-400 text-base">
          Configure your analysis parameters and generate queries based on your keywords
        </p>
      </div>

      <!-- Client Selection -->
      <div class="mb-8">
        <label for="client-select" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
          Select Client <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <select
            id="client-select"
            v-model="selectedClientId"
            class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
            :disabled="loading"
            :class="{ 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-800': !selectedClientId && attempted }"
          >
            <option value="">Choose a client...</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }} ({{ client.domain }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p v-if="clients.length === 0" class="text-sm text-amber-600 dark:text-amber-400 mt-3">
          No clients found. <NuxtLink to="/dashboard/clients" class="text-citebots-orange hover:text-citebots-orange/80 font-semibold transition-colors">Create your first client</NuxtLink>
        </p>
      </div>


      <!-- Keywords Section -->
      <div v-if="selectedClient" class="mb-8">
        <div class="mb-4">
          <label for="custom-keywords" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Keywords <span class="text-red-500">*</span>
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter keywords for this analysis (one per line)
          </p>
        </div>
        <textarea
          id="custom-keywords"
          v-model="customKeywords"
          class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
          rows="4"
          placeholder="Enter keywords, one per line&#10;e.g.:&#10;email marketing&#10;automation software&#10;lead generation"
          :class="{ 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-800': !customKeywords && attempted }"
        ></textarea>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          These keywords will be used to generate analysis queries
        </p>
      </div>

      <!-- Action Section -->
      <div class="border-t border-gray-200 dark:border-gray-700/60 pt-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="totalKeywords > 0" class="font-semibold">
              {{ totalKeywords }} keywords ready for analysis
            </span>
            <span v-else>
              Select a client to begin
            </span>
          </div>

          <button
            @click="generateQueries"
            :disabled="!canGenerateQueries || loading"
            class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ loading ? 'Generating Queries...' : 'Generate Queries' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-8" :class="getStatusClasses()">
      <div class="flex items-start">
        <svg v-if="statusClass.includes('red')" class="w-6 h-6 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <svg v-else-if="statusClass.includes('yellow')" class="w-6 h-6 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <svg v-else class="w-6 h-6 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-base">{{ statusMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Results Preview -->
    <div v-if="analysisResults" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Analysis Results</h3>
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Analysis ID:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 font-mono">
              {{ analysisResults.analysis_run.id }}
            </span>
          </div>
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Status:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 capitalize">
              {{ analysisResults.analysis_run.status }}
            </span>
          </div>
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Progress:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 tabular-nums">
              {{ analysisResults.analysis_run.queries_completed }} / {{ analysisResults.analysis_run.queries_total }} queries
            </span>
          </div>
          <div v-if="analysisResults.analysis_run.completed_at">
            <span class="text-green-700 dark:text-green-300 font-semibold">Completed:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2">
              {{ formatDate(analysisResults.analysis_run.completed_at) }}
            </span>
          </div>
        </div>
        
        <button 
          v-if="analysisResults.analysis_run.status === 'completed'"
          @click="viewResults"
          class="bg-green-600 text-white border border-green-600 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-green-700 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 inline-flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
          </svg>
          View Detailed Results
        </button>
      </div>
    </div>

    <!-- No Clients State -->
    <div v-if="!loading && clients.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No Clients Found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base leading-relaxed">
        You need to create at least one client before running analysis. Clients help organize your keywords and analysis data.
      </p>
      <NuxtLink 
        to="/dashboard/clients" 
        class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Create Your First Client
      </NuxtLink>
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
const platform = ref('chatgpt') // Default to ChatGPT
const loading = ref(false)
const statusMessage = ref('')
const statusClass = ref('')
const analysisResults = ref(null)
const customKeywords = ref('')
const attempted = ref(false)

// Computed
const selectedClient = computed(() => 
  clients.value.find(c => c.id === selectedClientId.value)
)

const totalKeywords = computed(() => {
  if (!customKeywords.value) return 0

  const customKeywordsList = customKeywords.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k)

  return customKeywordsList.length
})

const canGenerateQueries = computed(() => {
  return selectedClientId.value && totalKeywords.value > 0
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const getStatusClasses = () => {
  if (statusClass.value.includes('red')) {
    return 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20'
  }
  if (statusClass.value.includes('yellow')) {
    return 'border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20'
  }
  return 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20'
}

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
    statusMessage.value = 'Error loading clients. Please refresh the page.'
    statusClass.value = 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
  }
}

async function generateQueries() {
  attempted.value = true

  if (!selectedClientId.value) {
    statusMessage.value = 'Please select a client'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Prepare the keywords from custom input only
  if (!customKeywords.value) {
    statusMessage.value = 'Please provide at least one keyword'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  const allKeywords = customKeywords.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k) // Filter out empty strings

  // Check if we have any keywords
  if (allKeywords.length === 0) {
    statusMessage.value = 'Please provide at least one keyword'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Clear any previous status messages
  statusMessage.value = ''
  statusClass.value = ''

  // Navigate to preview page with all keywords (no platform selected yet)
  router.push({
    path: '/dashboard/analysis/preview-queries',
    query: {
      client_id: selectedClientId.value,
      keywords: allKeywords.join(',')
    }
  })
}

function viewResults() {
  if (analysisResults.value?.analysis_run?.id) {
    router.push(`/dashboard/analysis/${analysisResults.value.analysis_run.id}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchClients()
})

// Define page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'client-access']
})
</script>