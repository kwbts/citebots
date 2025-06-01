<template>
  <div class="brand-mention-breakdown bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Mention Breakdown</h3>
    </div>

    <!-- Chart Tabs -->
    <div class="mb-6">
      <div class="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="tab in chartTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200',
            activeTab === tab.key
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Chart Content -->
    <div class="space-y-4">
      <!-- Intent Breakdown -->
      <div v-if="activeTab === 'intent'" class="space-y-3">
        <div 
          v-for="item in data.byIntent" 
          :key="item.intent"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors cursor-pointer"
          @click="$emit('filter-change', 'intent', item.intent)"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ item.label }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.mentioned }}/{{ item.total }} queries
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ formatPercentage(item.mentionRate) }}
            </p>
            <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
              <div
                class="h-2 bg-purple-500 rounded-full transition-all duration-700"
                :style="`width: ${item.mentionRate}%`"
              ></div>
            </div>
          </div>
        </div>
        <div v-if="data.byIntent.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No intent data available
        </div>
      </div>

      <!-- Category Breakdown -->
      <div v-if="activeTab === 'category'" class="space-y-3">
        <div
          v-for="item in data.byCategory"
          :key="item.category"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors cursor-pointer"
          @click="$emit('filter-change', 'category', item.category)"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ item.label }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.mentioned }}/{{ item.total }} queries
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ formatPercentage(item.mentionRate) }}
            </p>
            <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
              <div
                class="h-2 bg-blue-500 rounded-full transition-all duration-700"
                :style="`width: ${item.mentionRate}%`"
              ></div>
            </div>
          </div>
        </div>
        <div v-if="data.byCategory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No category data available
        </div>
      </div>

      <!-- Funnel Stage Breakdown -->
      <div v-if="activeTab === 'funnel'" class="space-y-3">
        <div 
          v-for="item in data.byFunnelStage" 
          :key="item.stage"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors cursor-pointer"
          @click="$emit('filter-change', 'funnelStage', item.stage)"
        >
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ item.label }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.mentioned }}/{{ item.total }} queries
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ formatPercentage(item.mentionRate) }}
            </p>
            <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-1">
              <div
                class="h-2 bg-green-500 rounded-full transition-all duration-700"
                :style="`width: ${item.mentionRate}%`"
              ></div>
            </div>
          </div>
        </div>
        <div v-if="data.byFunnelStage.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No funnel stage data available
        </div>
      </div>
    </div>


    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading breakdown...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      byIntent: [],
      byType: [],
      byFunnelStage: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter-change'])

const activeTab = ref('intent')

const chartTabs = [
  { key: 'intent', label: 'By Intent' },
  { key: 'category', label: 'By Category' },
  { key: 'funnel', label: 'By Funnel Stage' }
]

// Function removed as insight box is no longer displayed

const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}
</script>

<style scoped>
.brand-mention-breakdown {
  position: relative;
  min-height: 400px;
}

.brand-mention-breakdown:hover {
  transform: translateY(-2px);
}
</style>