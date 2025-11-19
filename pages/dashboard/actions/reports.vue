<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">All Reports</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">View and manage all generated content briefs and reports</p>
          </div>
          <div>
            <NuxtLink to="/dashboard/actions/content-brief" class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Report
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Status Filter -->
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.status" @change="loadBriefs" class="input-field">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <!-- Client Filter -->
        <div>
          <label class="form-label">Client</label>
          <select v-model="filters.client_id" @change="loadBriefs" class="input-field">
            <option value="">All Clients</option>
            <option value="null">Generic Reports</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>

        <!-- Search -->
        <div>
          <label class="form-label">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search titles..."
            class="input-field"
            @input="debouncedSearch"
          />
        </div>

        <!-- Refresh Button -->
        <div class="flex items-end">
          <button @click="loadBriefs" class="btn-secondary w-full" :disabled="isLoading">
            <svg v-if="!isLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Reports List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60">
      <!-- Loading State -->
      <div v-if="isLoading && briefs.length === 0" class="p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700/40 rounded-full mb-4">
          <svg class="animate-spin w-8 h-8 text-citebots-orange" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading reports...</h3>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading reports</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button @click="loadBriefs" class="btn-primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBriefs.length === 0" class="p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700/40 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ briefs.length === 0 ? 'Create your first content brief to get started.' : 'No reports match your current filters.' }}
        </p>
        <NuxtLink to="/dashboard/actions/content-brief" class="btn-primary">
          Create First Report
        </NuxtLink>
      </div>

      <!-- Reports Table -->
      <div v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Keywords
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="brief in paginatedBriefs"
                :key="brief.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <!-- Title -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ brief.title }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ brief.purpose }} • {{ brief.audience }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Client -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ brief.client?.name || 'Generic' }}
                  </div>
                  <div v-if="brief.client?.domain" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ brief.client.domain }}
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusBadgeClass(brief.status)">
                    {{ getStatusLabel(brief.status) }}
                  </span>
                </td>

                <!-- Keywords -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="keyword in brief.keywords.slice(0, 2)"
                      :key="keyword"
                      class="inline-flex px-2 py-1 text-xs font-medium bg-citebots-orange/10 text-citebots-orange rounded-md"
                    >
                      {{ keyword }}
                    </span>
                    <span
                      v-if="brief.keywords.length > 2"
                      class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                    >
                      +{{ brief.keywords.length - 2 }}
                    </span>
                  </div>
                </td>

                <!-- Created -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(brief.generated_at) }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <NuxtLink
                      :to="`/dashboard/actions/content-brief/view/${brief.id}`"
                      class="text-citebots-orange hover:text-citebots-orange-dark transition-colors duration-150"
                    >
                      View
                    </NuxtLink>
                    <button
                      v-if="brief.status === 'completed'"
                      @click="handleExportBrief(brief, 'text')"
                      class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-150"
                    >
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredBriefs.length > 0" class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Showing
                <span class="font-medium">{{ startIndex + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(endIndex, filteredBriefs.length) }}</span>
                of
                <span class="font-medium">{{ filteredBriefs.length }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-citebots-orange border-citebots-orange text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBriefGenerator } from '~/composables/useBriefGenerator'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const { listBriefs, exportBrief: exportBriefFunc, error: briefError } = useBriefGenerator()

// Data
const briefs = ref([])
const clients = ref([])
const isLoading = ref(true)
const error = ref('')
const searchQuery = ref('')

// Filters
const filters = ref({
  status: '',
  client_id: '',
  created_by: ''
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Computed
const filteredBriefs = computed(() => {
  let filtered = briefs.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(brief =>
      brief.title.toLowerCase().includes(query) ||
      brief.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredBriefs.value.length / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedBriefs = computed(() => {
  return filteredBriefs.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const loadBriefs = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const result = await listBriefs({
      ...filters.value,
      limit: 100, // Load more for client-side filtering
      offset: 0
    })

    briefs.value = result || []
    // Debug log to check date fields
    if (briefs.value.length > 0) {
      console.log('Sample brief data:', briefs.value[0])
    }
  } catch (err) {
    error.value = err.message || 'Failed to load reports'
    console.error('Error loading briefs:', err)
  } finally {
    isLoading.value = false
  }
}

const loadClients = async () => {
  try {
    const { data, error: clientError } = await supabase
      .from('clients')
      .select('id, name, domain')
      .order('name')

    if (clientError) throw clientError

    clients.value = data || []
  } catch (err) {
    console.error('Error loading clients:', err)
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'processing':
      return 'Processing'
    case 'pending':
      return 'Pending'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}

const formatDate = (dateString) => {
  try {
    if (!dateString) {
      return 'No date'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    console.error('Date formatting error:', e, 'for date:', dateString)
    return 'Invalid date'
  }
}

// Pagination methods
const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Export brief handler
const handleExportBrief = async (brief, format) => {
  try {
    // The exportBriefFunc expects the currentBrief to be set, so we need to fetch it first
    const { getBrief } = useBriefGenerator()
    await getBrief(brief.id)
    exportBriefFunc(format)
  } catch (err) {
    console.error('Export failed:', err)
    alert('Failed to export brief')
  }
}

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset to first page when searching
  }, 300)
}

// Watch for filter changes to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Initialize
onMounted(async () => {
  await Promise.all([
    loadBriefs(),
    loadClients()
  ])
})
</script>