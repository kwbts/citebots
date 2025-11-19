<template>
  <div class="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <!-- Main Dashboard Content -->
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Dashboard Content -->
      <div class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
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
