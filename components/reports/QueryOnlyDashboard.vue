<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Main Dashboard Content -->
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Dashboard Content -->
      <div class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
        <!-- Editable Report Title -->
        <div class="mb-6">
          <!-- Editing Mode -->
          <div v-if="isEditingTitle" class="flex items-center space-x-3">
            <input
              ref="titleInput"
              v-model="editingTitle"
              @keydown.enter="saveTitle"
              @keydown.escape="cancelEditingTitle"
              @blur="saveTitle"
              class="text-xl font-bold bg-white dark:bg-gray-700 border border-citebots-orange rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 flex-1"
              maxlength="150"
            />
            <button
              @click="saveTitle"
              class="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
              title="Save"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
            <button
              @click="cancelEditingTitle"
              class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
              title="Cancel"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Display Mode -->
          <div v-else class="flex items-center space-x-3 group">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex-1">
              {{ reportTitle }}
            </h2>
            <button
              @click="startEditingTitle"
              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-citebots-orange dark:text-gray-500 dark:hover:text-citebots-orange transition-all duration-150 p-1"
              title="Edit report name"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Overview Dashboard (Executive Summary) -->
        <OverviewDashboard v-if="activeTab === 'overview'" :data="filteredData" :client="client" :competitors="competitors" />

        <!-- Query Explorer Dashboard -->
        <QueryExplorerDashboard v-else-if="activeTab === 'query-explorer'" :data="filteredData" :client="client" />

        <!-- Gaps Dashboard -->
        <GapsDashboard v-else-if="activeTab === 'gaps'" :data="filteredData" :client="client" />

        <!-- Raw Data View -->
        <RawDataView v-else-if="activeTab === 'raw-data'" :data="filteredData" :client="client" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import OverviewDashboard from './OverviewDashboard.vue'
import QueryExplorerDashboard from './QueryExplorerDashboard.vue'
import GapsDashboard from './GapsDashboard.vue'
import RawDataView from './RawDataView.vue'

const props = defineProps({
  data: { type: Object, required: true },
  client: { type: Object, required: true },
  activeTab: { type: String, default: 'overview' },
  analysisRun: { type: Object, required: true }
})

// Extract competitors from data prop
const competitors = computed(() => props.data?.competitors || [])

const emit = defineEmits(['close', 'update-report-name'])

// Title editing state
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInput = ref(null)

const reportTitle = computed(() => {
  return props.analysisRun?.name || `${props.client?.name} Analysis`
})

const startEditingTitle = () => {
  isEditingTitle.value = true
  editingTitle.value = reportTitle.value
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
      titleInput.value.select()
    }
  })
}

const cancelEditingTitle = () => {
  isEditingTitle.value = false
  editingTitle.value = ''
}

const saveTitle = async () => {
  if (!editingTitle.value.trim()) {
    cancelEditingTitle()
    return
  }

  if (editingTitle.value.trim() === reportTitle.value) {
    cancelEditingTitle()
    return
  }

  try {
    await emit('update-report-name', editingTitle.value.trim())
    isEditingTitle.value = false
    editingTitle.value = ''
  } catch (error) {
    console.error('Error saving title:', error)
    alert('Failed to update report name. Please try again.')
  }
}

// Dashboard state - initialize from props if provided
const activeTab = ref(props.activeTab || 'overview')
const activePlatforms = ref(['all', 'chatgpt', 'perplexity'])
const activePlatformFilter = ref('all')

// Watch for prop changes
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
})

// Watch for platform filter changes
watch(() => activePlatformFilter.value, (newFilter) => {
  if (newFilter === 'all') {
    activePlatforms.value = ['all', 'chatgpt', 'perplexity']
  } else {
    activePlatforms.value = [newFilter]
  }
})

// Listen for navigation events from SidebarContextPanel
onMounted(() => {
  window.addEventListener('dashboard-tab-changed', (event) => {
    const newTab = event.detail.tab
    if (newTab !== activeTab.value) {
      activeTab.value = newTab
    }
  })

  window.addEventListener('platform-filter-changed', (event) => {
    activePlatforms.value = event.detail.platforms
  })

  window.addEventListener('export-report', () => {
    exportReport()
  })

  window.addEventListener('refresh-data', () => {
    refreshData()
  })
})

// Platform filter options
const platforms = [
  { label: 'All', value: 'all' },
  { label: 'ChatGPT', value: 'chatgpt' },
  { label: 'Perplexity', value: 'perplexity' }
]

// Initialize component
onMounted(() => {
  // Perform any necessary initialization
})

// Data filtering
const filteredData = computed(() => {
  if (!props.data) {
    return null
  }

  if (activePlatforms.value.includes('all')) {
    return props.data
  }

  const filteredQueries = props.data.analysis_queries?.filter(query =>
    activePlatforms.value.includes(query.data_source)
  ) || []

  return {
    ...props.data,
    analysis_queries: filteredQueries
  }
})

// Helper functions
const getCurrentTabName = () => {
  const tabNames = {
    'overview': 'Overview',
    'brand-performance': 'Brand Performance',
    'query-analysis': 'Query Analysis',
    'query-explorer': 'Query Explorer',
    'raw-data': 'Raw Data',
    'testing': 'Testing'
  }
  return tabNames[activeTab.value] || 'Dashboard'
}

const getFilterSummary = () => {
  const totalQueries = filteredData.value?.analysis_queries?.length || 0
  if (activePlatforms.value.includes('all')) {
    return `All platforms • ${totalQueries} queries`
  }
  const platformNames = activePlatforms.value.map(p =>
    platforms.find(platform => platform.value === p)?.label
  ).filter(Boolean).join(', ')
  return `${platformNames} • ${totalQueries} queries`
}

// Action handlers
const exportReport = () => {
  // Implementation for export functionality
}

const refreshData = () => {
  // Implementation for refresh functionality
}
</script>

<style scoped>
.brand-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .brand-dashboard {
    padding: 1rem;
  }
}
</style>
