<template>
  <div>
    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-6">2. Queries</h4>
    
    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Explanation Column (1/3) -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalQueries }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            We submitted <span class="font-medium">{{ totalQueries }} queries</span> to AI platforms to analyze responses.
          </p>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          To ensure comprehensive analysis, we test different query intents and types to simulate various ways users might ask questions about your industry.
        </p>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          All queries were sent to multiple platforms (ChatGPT, Perplexity, etc.) to analyze how different AI systems respond to the same questions.
        </p>

        <div class="mt-6 space-y-6">
          <!-- Query Intent Pie Chart -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Query Intent Breakdown</h5>
            <div class="h-40 flex items-center justify-center">
              <!-- Simple pie chart visualization -->
              <div class="relative w-32 h-32">
                <div v-for="(segment, index) in pieChartSegments(queryIntentBreakdown)" :key="index"
                     class="absolute inset-0"
                     :style="{
                       clipPath: `polygon(50% 50%, 50% 0%, ${getCoordinates(segment.startAngle, 50, 50)}, ${getCoordinates(segment.endAngle, 50, 50)})`,
                       backgroundColor: getIntentColor(segment.name)
                     }">
                </div>
                <div class="absolute inset-0 rounded-full flex items-center justify-center bg-white dark:bg-gray-800" style="width: 60%; height: 60%; left: 20%; top: 20%;">
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ totalQueries }}</span>
                </div>
              </div>
            </div>
            <!-- Legend -->
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div v-for="intent in queryIntentBreakdown" :key="intent.name" class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm" :style="{ backgroundColor: getIntentColor(intent.name) }"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ intent.name }} ({{ intent.percentage }}%)</span>
              </div>
            </div>
          </div>

          <!-- Query Type Pie Chart -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Query Type Breakdown</h5>
            <div class="h-40 flex items-center justify-center">
              <!-- Simple pie chart visualization -->
              <div class="relative w-32 h-32">
                <div v-for="(segment, index) in pieChartSegments(queryTypeBreakdown)" :key="index"
                     class="absolute inset-0"
                     :style="{
                       clipPath: `polygon(50% 50%, 50% 0%, ${getCoordinates(segment.startAngle, 50, 50)}, ${getCoordinates(segment.endAngle, 50, 50)})`,
                       backgroundColor: getTypeColor(segment.name)
                     }">
                </div>
                <div class="absolute inset-0 rounded-full flex items-center justify-center bg-white dark:bg-gray-800" style="width: 60%; height: 60%; left: 20%; top: 20%;">
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">{{ totalQueries }}</span>
                </div>
              </div>
            </div>
            <!-- Legend -->
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div v-for="type in queryTypeBreakdown" :key="type.name" class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm" :style="{ backgroundColor: getTypeColor(type.name) }"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ type.name }} ({{ type.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Data Column (2/3) -->
      <div class="md:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 h-full">
          <div class="flex items-center justify-between mb-4">
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Query Analysis</h5>
            <div class="flex items-center gap-2">
              <select v-model="queryFilter" class="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                <option value="all">All Queries</option>
                <option value="brand-mentioned">Brand Mentioned</option>
                <option value="no-mentions">No Mentions</option>
              </select>
              <select v-model="platformFilter" class="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                <option value="all">All Platforms</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Perplexity">Perplexity</option>
                <option value="Claude">Claude</option>
              </select>
            </div>
          </div>

          <!-- Query Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Query
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Intent
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Brand Mentioned
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in filteredQueryData" :key="`${item.query}-${item.platform}`" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                    {{ item.query }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span class="px-2 py-1 text-xs rounded-full" :class="getIntentBadgeClass(item.intent)">
                      {{ item.intent }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span class="px-2 py-1 text-xs rounded-full" :class="getTypeBadgeClass(item.type)">
                      {{ item.type }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {{ item.platform }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span v-if="item.brandMentioned" class="text-green-600 dark:text-green-400 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Yes
                    </span>
                    <span v-else class="text-gray-500 dark:text-gray-400 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      No
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredQueryData.length === 0" class="py-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">No queries match the current filters</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { dataModelStructure } from './types'

const props = defineProps({
  totalQueries: {
    type: Number,
    required: true
  },
  queryIntentBreakdown: {
    type: Array,
    required: true
  },
  queryTypeBreakdown: {
    type: Array,
    required: true
  },
  queryData: {
    type: Array,
    required: true
  }
})

const queryFilter = ref('all')
const platformFilter = ref('all')

const filteredQueryData = computed(() => {
  let filtered = props.queryData

  // Apply brand mention filter
  if (queryFilter.value === 'brand-mentioned') {
    filtered = filtered.filter(item => item.brandMentioned)
  } else if (queryFilter.value === 'no-mentions') {
    filtered = filtered.filter(item => !item.brandMentioned)
  }

  // Apply platform filter
  if (platformFilter.value !== 'all') {
    filtered = filtered.filter(item => item.platform === platformFilter.value)
  }

  return filtered
})

// Helpers for pie chart visualization
const pieChartSegments = (data) => {
  let total = data.reduce((sum, item) => sum + item.count, 0)
  let currentAngle = 0
  
  return data.map(item => {
    const startAngle = currentAngle
    const sliceAngle = (item.count / total) * 360
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle
    
    return {
      name: item.name,
      startAngle,
      endAngle
    }
  })
}

const getCoordinates = (angle, centerX, centerY) => {
  const radians = (angle - 90) * (Math.PI / 180)
  const x = centerX + centerX * Math.cos(radians)
  const y = centerY + centerY * Math.sin(radians)
  return `${x}% ${y}%`
}

// Colors and styles
const intentColors = {
  'Informational': '#3B82F6', // blue
  'Transactional': '#10B981', // green
  'Navigational': '#F97316', // orange
  'Commercial': '#8B5CF6', // purple
  'Other': '#6B7280'  // gray
}

const typeColors = {
  'Question': '#EC4899', // pink
  'Comparison': '#8B5CF6', // purple
  'How-to': '#14B8A6', // teal
  'Definition': '#F59E0B', // amber
  'List': '#3B82F6', // blue
  'Other': '#6B7280'  // gray
}

const getIntentColor = (intent) => {
  return intentColors[intent] || intentColors['Other']
}

const getTypeColor = (type) => {
  return typeColors[type] || typeColors['Other']
}

const getIntentBadgeClass = (intent) => {
  switch (intent) {
    case 'Informational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Transactional': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'Navigational': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'Commercial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'Question': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    case 'Comparison': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'How-to': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    case 'Definition': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'List': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>