<template>
  <div class="dashboard-filters bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 mb-8">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Filters</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Platform Filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Platforms</label>
        <div class="relative">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="platform in availablePlatforms"
              :key="platform.value"
              @click="togglePlatform(platform.value)"
              :class="[
                'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                localFilters.platforms.includes(platform.value)
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              <component :is="platform.icon" class="w-3 h-3 mr-1" />
              {{ platform.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Branded Queries Filter -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Query Type</label>
        <div class="relative">
          <select
            v-model="localFilters.brandedQueries"
            @change="updateFilters"
            class="w-full border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">All Queries</option>
            <option value="branded">Branded Only</option>
            <option value="unbranded">Unbranded Only</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium">Active filters:</span>
        <div class="flex flex-wrap gap-2">
          <span v-if="localFilters.platforms.length !== availablePlatforms.length" class="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs">
            {{ localFilters.platforms.length }} platform{{ localFilters.platforms.length !== 1 ? 's' : '' }}
            <button @click="resetPlatforms" class="ml-1 hover:text-blue-900 dark:hover:text-blue-100">×</button>
          </span>
          <span v-if="localFilters.brandedQueries !== 'all'" class="inline-flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs">
            {{ localFilters.brandedQueries }} queries
            <button @click="resetBrandedFilter" class="ml-1 hover:text-blue-900 dark:hover:text-blue-100">×</button>
          </span>
        </div>
        <button @click="clearAllFilters" class="text-xs text-red-600 dark:text-red-400 hover:underline ml-2">
          Clear all
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:filters'])

// Local reactive copy of filters
const localFilters = ref({
  platforms: ['chatgpt', 'perplexity'],
  brandedQueries: 'all',
  ...props.filters
})

// Available platforms with icons
const availablePlatforms = [
  {
    value: 'chatgpt',
    label: 'ChatGPT',
    icon: 'ChatGPTIcon'
  },
  {
    value: 'perplexity',
    label: 'Perplexity',
    icon: 'PerplexityIcon'
  }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return localFilters.value.platforms.length !== availablePlatforms.length ||
         localFilters.value.brandedQueries !== 'all'
})

// Methods
const updateFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

const togglePlatform = (platform) => {
  const index = localFilters.value.platforms.indexOf(platform)
  if (index > -1) {
    localFilters.value.platforms.splice(index, 1)
  } else {
    localFilters.value.platforms.push(platform)
  }
  updateFilters()
}

// Reset methods
const resetPlatforms = () => {
  localFilters.value.platforms = [...availablePlatforms.map(p => p.value)]
  updateFilters()
}

const resetBrandedFilter = () => {
  localFilters.value.brandedQueries = 'all'
  updateFilters()
}

const clearAllFilters = () => {
  localFilters.value = {
    platforms: [...availablePlatforms.map(p => p.value)],
    brandedQueries: 'all'
  }
  updateFilters()
}

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...localFilters.value, ...newFilters }
}, { deep: true })

// Placeholder icon components - replace with actual icons
const ChatGPTIcon = { template: '<div class="w-3 h-3 bg-green-500 rounded"></div>' }
const ClaudeIcon = { template: '<div class="w-3 h-3 bg-orange-500 rounded"></div>' }
const PerplexityIcon = { template: '<div class="w-3 h-3 bg-blue-500 rounded"></div>' }
const BardIcon = { template: '<div class="w-3 h-3 bg-purple-500 rounded"></div>' }
</script>

<style scoped>
.dashboard-filters {
  transition: all 0.2s ease-in-out;
}

.dashboard-filters:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>