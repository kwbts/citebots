<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <button 
              @click="navigateTo('/dashboard/clients')"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ client?.name || 'Loading...' }}</h1>
            <div v-if="client?.ai_enhancement_status" class="flex items-center">
              <span v-if="client.ai_enhancement_status === 'processing'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                <svg class="animate-spin -ml-0.5 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Competitors...
              </span>
              <span v-else-if="client.ai_enhancement_status === 'completed'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                ✓ Research Complete
              </span>
            </div>
          </div>
          <p class="text-gray-600 dark:text-gray-300">{{ client?.domain }}</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="navigateTo(`/dashboard/analysis?client_id=${client?.id}`)"
            class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-2 font-semibold text-sm hover:bg-citebots-orange/20 transition-all"
          >
            Run Analysis
          </button>
          <button
            @click="refreshCompetitors"
            :disabled="isRefreshing"
            class="bg-purple-600/15 text-purple-600 border border-purple-600/30 rounded-lg px-4 py-2 font-semibold text-sm hover:bg-purple-600/20 transition-all disabled:opacity-50"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- AI Enhancement Progress (if in progress) -->
        <div v-if="client?.ai_enhancement_status === 'processing'" class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50 p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                AI Research in Progress
              </h3>
              <p class="text-purple-700 dark:text-purple-200 text-sm mb-3">
                We're researching {{ client.name }}'s industry, competitors, and business details. This usually takes 30-60 seconds.
              </p>
              <div class="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full animate-pulse" :style="{ width: progressWidth + '%' }"></div>
              </div>
              <p class="text-xs text-purple-600 dark:text-purple-300 mt-2">
                {{ progressText }}
              </p>
            </div>
          </div>
        </div>

        <!-- Client Details -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Client Details</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
              <input
                v-model="editableClient.name"
                @change="updateClient"
                type="text"
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain</label>
              <input
                v-model="editableClient.domain"
                @change="updateClient"
                type="text"
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Industry</label>
              <input
                v-model="editableClient.industry_primary"
                @change="updateClient"
                type="text"
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                :placeholder="client?.ai_enhancement_status === 'processing' ? 'AI will populate this...' : 'e.g., Technology'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Model</label>
              <input
                v-model="editableClient.business_model"
                @change="updateClient"
                type="text"
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                :placeholder="client?.ai_enhancement_status === 'processing' ? 'AI will populate this...' : 'e.g., B2B SaaS'"
              />
            </div>
          </div>
        </div>

        <!-- Competitors Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Competitors</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Manage your client's competitive landscape for analysis
              </p>
            </div>
            <button
              @click="addCompetitor"
              class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-2 font-semibold text-sm hover:bg-citebots-orange/20 transition-all"
            >
              + Add Competitor
            </button>
          </div>

          <!-- AI Research Progress for Competitors -->
          <div v-if="client?.ai_enhancement_status === 'processing'" class="text-center py-8 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            <p class="mt-4 text-purple-700 dark:text-purple-300 font-medium">AI is finding competitors...</p>
            <p class="mt-2 text-sm text-purple-600 dark:text-purple-400">This usually takes 30-60 seconds</p>
          </div>

          <!-- Loading State for Competitors (initial load) -->
          <div v-else-if="isLoadingCompetitors" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-citebots-orange"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-300">Loading competitors...</p>
          </div>

          <!-- Competitors List -->
          <div v-else-if="competitors.length > 0" class="space-y-3">
            <div
              v-for="(competitor, index) in competitors"
              :key="competitor.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div class="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company Name</label>
                  <input
                    v-model="competitor.name"
                    @change="updateCompetitor(competitor)"
                    type="text"
                    class="block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                    placeholder="Competitor name"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domain</label>
                  <input
                    v-model="competitor.domain"
                    @change="updateCompetitor(competitor)"
                    type="text"
                    class="block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm"
                    placeholder="competitor.com"
                  />
                </div>
              </div>
              <div class="ml-4 flex items-center space-x-2">
                <span v-if="competitor.source === 'ai'" class="text-purple-600 text-xs" title="Added by AI">✨</span>
                <button
                  @click="removeCompetitor(competitor.id)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State for Competitors -->
          <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400 mb-3">
              {{ client?.ai_enhancement_status === 'processing' ? 'AI is finding competitors...' : 'No competitors added yet' }}
            </p>
            <button
              @click="addCompetitor"
              class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-2 font-semibold text-sm hover:bg-citebots-orange/20 transition-all"
            >
              Add First Competitor
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar - Quick Stats & Actions -->
      <div class="space-y-6">
        <!-- Quick Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-300">Competitors</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ competitors.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-300">AI Enhanced</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ client?.ai_enhanced_at ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-300">Created</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatDate(client?.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
          <div class="space-y-3">
            <button
              @click="navigateTo(`/dashboard/analysis?client_id=${client?.id}`)"
              class="w-full bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-3 font-semibold text-sm hover:bg-citebots-orange/20 transition-all"
            >
              Run Citation Analysis
            </button>
            <button
              @click="navigateTo(`/dashboard/clients/edit-client-${client?.id}`)"
              class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Advanced Edit
            </button>
          </div>
        </div>

        <!-- Enhanced Data Preview (if available) -->
        <div v-if="client?.target_audience?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Audience</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="audience in client.target_audience.slice(0, 3)"
              :key="audience"
              class="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded"
            >
              {{ audience }}
            </span>
            <span v-if="client.target_audience.length > 3" class="text-xs text-gray-500 dark:text-gray-400">
              +{{ client.target_audience.length - 3 }} more
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { navigateTo } from '#app'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const route = useRoute()
const supabase = useSupabaseClient()

const client = ref(null)
const editableClient = ref({})
const competitors = ref([])
const isLoadingCompetitors = ref(true)
const isRefreshing = ref(false)

// Progress tracking
const progressWidth = ref(0)
const progressText = ref('')
const pollInterval = ref(null)
const startTime = ref(null)

// Load client data
const loadClient = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    
    client.value = data
    editableClient.value = { ...data }
  } catch (error) {
    console.error('Error loading client:', error)
    navigateTo('/dashboard/clients')
  }
}

// Load competitors
const loadCompetitors = async () => {
  isLoadingCompetitors.value = true
  try {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', route.params.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    competitors.value = data || []
  } catch (error) {
    console.error('Error loading competitors:', error)
  } finally {
    isLoadingCompetitors.value = false
  }
}

// Progress tracking functions
const updateProgress = () => {
  if (!startTime.value) {
    startTime.value = Date.now()
  }

  const elapsed = Date.now() - startTime.value
  const estimatedDuration = 60000 // 60 seconds
  const progress = Math.min((elapsed / estimatedDuration) * 100, 95) // Cap at 95% until complete

  progressWidth.value = progress

  if (progress < 30) {
    progressText.value = 'Analyzing website and industry...'
  } else if (progress < 60) {
    progressText.value = 'Researching competitors...'
  } else if (progress < 85) {
    progressText.value = 'Gathering business intelligence...'
  } else {
    progressText.value = 'Finalizing data...'
  }
}

const startPolling = () => {
  if (pollInterval.value) return

  startTime.value = Date.now()
  progressWidth.value = 10
  progressText.value = 'Starting AI research...'

  pollInterval.value = setInterval(() => {
    updateProgress()
    loadClient() // Check for status updates
  }, 2000) // Poll every 2 seconds
}

const stopPolling = () => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
  progressWidth.value = 100
  progressText.value = 'Research complete!'
}

// Auto-refresh when AI enhancement completes
watch(() => client.value?.ai_enhancement_status, (newStatus, oldStatus) => {
  // Start polling when processing begins
  if (newStatus === 'processing' && oldStatus !== 'processing') {
    startPolling()
  }

  // Stop polling and reload data when complete
  if (oldStatus === 'processing' && newStatus === 'completed') {
    stopPolling()
    setTimeout(() => {
      loadClient()
      loadCompetitors()
    }, 1000)
  }

  // Handle failure
  if (oldStatus === 'processing' && newStatus === 'failed') {
    stopPolling()
    progressText.value = 'Research failed - you can add competitors manually'
  }
}, { immediate: true })

// Add competitor
const addCompetitor = async () => {
  try {
    const { data, error } = await supabase
      .from('competitors')
      .insert({
        client_id: route.params.id,
        name: '',
        domain: '',
        source: 'manual'
      })
      .select()
      .single()

    if (error) throw error
    
    competitors.value.push(data)
  } catch (error) {
    console.error('Error adding competitor:', error)
  }
}

// Update competitor
const updateCompetitor = async (competitor) => {
  try {
    const { error } = await supabase
      .from('competitors')
      .update({
        name: competitor.name,
        domain: competitor.domain
      })
      .eq('id', competitor.id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating competitor:', error)
  }
}

// Remove competitor
const removeCompetitor = async (competitorId) => {
  try {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', competitorId)

    if (error) throw error
    
    competitors.value = competitors.value.filter(c => c.id !== competitorId)
  } catch (error) {
    console.error('Error removing competitor:', error)
  }
}

// Update client
const updateClient = async () => {
  try {
    const { error } = await supabase
      .from('clients')
      .update({
        name: editableClient.value.name,
        domain: editableClient.value.domain,
        industry_primary: editableClient.value.industry_primary,
        business_model: editableClient.value.business_model
      })
      .eq('id', route.params.id)

    if (error) throw error
    
    client.value = { ...client.value, ...editableClient.value }
  } catch (error) {
    console.error('Error updating client:', error)
  }
}

// Refresh competitors using AI
const refreshCompetitors = async () => {
  if (!client.value) return
  
  isRefreshing.value = true
  try {
    // This would call the AI enhancement again to refresh competitor data
    // For now, just reload the current data
    await loadCompetitors()
  } catch (error) {
    console.error('Error refreshing competitors:', error)
  } finally {
    isRefreshing.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Cleanup polling on unmount
onUnmounted(() => {
  stopPolling()
})

onMounted(() => {
  loadClient()
  loadCompetitors()
})
</script>