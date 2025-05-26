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
          <div class="flex items-center space-x-4">
            <div class="text-right bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg px-4 py-3 border border-citebots-orange/20 dark:border-citebots-orange/30">
              <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Keywords Ready</div>
              <div class="flex items-center text-sm font-semibold text-citebots-orange mt-1">
                <div class="w-2 h-2 bg-citebots-orange rounded-full mr-2"></div>
                <span class="tabular-nums">{{ totalKeywords }}</span> keywords
              </div>
            </div>
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

      <!-- Platform Selection -->
      <div class="mb-8" v-if="selectedClientId">
        <label for="platform-select" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
          Analysis Platform <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <select
            id="platform-select"
            v-model="platform"
            class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
            :disabled="loading"
          >
            <option value="chatgpt">ChatGPT</option>
            <option value="perplexity">Perplexity</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Choose which AI platform to analyze for brand mentions and citations
        </p>
      </div>

      <!-- Keywords Section -->
      <div v-if="selectedClient" class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Keywords</h3>

        <!-- Client Keywords Display -->
        <div v-if="selectedClient.keywords && selectedClient.keywords.length > 0" class="mb-8">
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">Client Keywords</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Keywords from {{ selectedClient.name }}'s profile
            </p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-6">
            <div class="flex flex-wrap gap-3">
              <span 
                v-for="(keyword, index) in selectedClient.keywords" 
                :key="index"
                class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="mb-8">
          <div class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No keywords defined for this client</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Add keywords to the client profile to improve analysis accuracy</p>
            <NuxtLink 
              :to="`/dashboard/clients/edit-client-${selectedClientId}`" 
              class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 inline-flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add keywords to client profile
            </NuxtLink>
          </div>
        </div>

        <!-- Custom Keywords Input -->
        <div>
          <div class="mb-4">
            <label for="custom-keywords" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              Additional Keywords
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Add custom keywords for this analysis (one per line)
            </p>
          </div>
          <textarea
            id="custom-keywords"
            v-model="customKeywords"
            class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
            rows="4"
            placeholder="Enter additional keywords, one per line&#10;e.g.:&#10;email marketing&#10;automation software&#10;lead generation"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
            These keywords will be combined with your client's profile keywords to generate analysis queries
          </p>
        </div>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
  let count = 0
  
  // Count client keywords
  if (selectedClient.value?.keywords?.length) {
    count += selectedClient.value.keywords.length
  }
  
  // Count custom keywords
  if (customKeywords.value) {
    const customKeywordsList = customKeywords.value
      .split('\n')
      .map(k => k.trim())
      .filter(k => k)
    count += customKeywordsList.length
  }
  
  return count
})

const canGenerateQueries = computed(() => {
  return selectedClientId.value && platform.value && totalKeywords.value > 0
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
  
  if (!selectedClientId.value || !platform.value) {
    statusMessage.value = 'Please select a client and platform'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
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
    statusMessage.value = 'Please provide at least one keyword (either in client profile or custom keywords)'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Clear any previous status messages
  statusMessage.value = ''
  statusClass.value = ''

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

// Lifecycle
onMounted(() => {
  fetchClients()
})

// Define page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>