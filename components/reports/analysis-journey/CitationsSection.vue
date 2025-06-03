<template>
  <div>
    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-6">4. Citations</h4>
    
    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Explanation Column (1/3) -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <span class="text-2xl font-bold text-green-600 dark:text-green-400">{{ totalCitations }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            We tracked <span class="font-medium">{{ totalCitations }} citations</span> across all AI responses.
          </p>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Citations are links or references to specific web pages that AI systems use to support their responses. These represent opportunities for your content to be surfaced to users.
        </p>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Your brand received <span class="font-medium">{{ brandCitations }} citations</span>, representing <span class="font-medium">{{ brandCitationRate }}%</span> of all citations in AI responses.
        </p>

        <div class="mt-6 space-y-6">
          <!-- Brand vs Competitor Citation Comparison -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Brand vs Top Competitor</h5>
            
            <!-- Competitor Selector -->
            <div class="mb-3">
              <select v-model="selectedCompetitor" class="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5">
                <option value="top">Top Competitor</option>
                <option v-for="competitor in competitors" :key="competitor.name" :value="competitor.name">
                  {{ competitor.name }}
                </option>
              </select>
            </div>
            
            <!-- Horizontal Bar Chart -->
            <div class="space-y-4">
              <!-- Your Brand -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600 dark:text-gray-400">Your Brand</span>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ brandCitations }} citations</span>
                </div>
                <div class="w-full h-5 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <div
                    class="h-full bg-green-500 dark:bg-green-500 rounded-md"
                    :style="{ width: `${(brandCitations / maxCitations) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Selected Competitor -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600 dark:text-gray-400">{{ competitorDisplayName }}</span>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ competitorCitationCount }} citations</span>
                </div>
                <div class="w-full h-5 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  <div
                    class="h-full bg-blue-500 dark:bg-blue-500 rounded-md"
                    :style="{ width: `${(competitorCitationCount / maxCitations) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Citation Metrics -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Citation Quality</h5>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">Relevance Score</span>
                <div class="flex items-center">
                  <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                    <div
                      class="h-full bg-green-500 dark:bg-green-500 rounded-full"
                      :style="{ width: `${(brandRelevanceScore / 10) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ brandRelevanceScore.toFixed(1) }}/10</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">Unique Pages</span>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ uniqueBrandPages }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">Query Coverage</span>
                <div class="flex items-center">
                  <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                    <div
                      class="h-full bg-green-500 dark:bg-green-500 rounded-full"
                      :style="{ width: `${queryCoveragePercentage}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ queryCoveragePercentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Data Column (2/3) -->
      <div class="md:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 h-full">
          <div class="flex items-center justify-between mb-4">
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Citation Analysis</h5>
            <div class="flex items-center gap-2">
              <select v-model="citationFilter" class="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                <option value="all">All Citations</option>
                <option value="brand">Your Brand</option>
                <option value="competitors">Competitors</option>
                <option value="other">Other Domains</option>
              </select>
            </div>
          </div>

          <!-- Citation Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Relevance
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Queries
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in filteredCitationData" :key="item.url" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white max-w-xs truncate">
                    <a :href="item.url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline truncate block">
                      {{ formatUrl(item.url) }}
                    </a>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {{ item.domain }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span v-if="item.isBrand" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Your Brand
                    </span>
                    <span v-else-if="item.isCompetitor" class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {{ item.competitorName || 'Competitor' }}
                    </span>
                    <span v-else class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Other
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :class="getRelevanceColor(item.relevance)"
                          :style="{ width: `${(item.relevance / 10) * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ item.relevance.toFixed(1) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {{ item.queries }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredCitationData.length === 0" class="py-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">No citations match the current filters</p>
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
  totalCitations: {
    type: Number,
    required: true
  },
  brandCitations: {
    type: Number,
    required: true
  },
  competitorCitations: {
    type: Number,
    required: true
  },
  citationData: {
    type: Array,
    required: true
  }
})

const citationFilter = ref('all')
const selectedCompetitor = ref('top')

// Derived metrics
const brandCitationRate = computed(() => {
  return Math.round((props.brandCitations / props.totalCitations) * 100) || 0
})

// Extract competitors from citation data
const competitors = computed(() => {
  const competitorMap = {}
  
  props.citationData.forEach(item => {
    if (item.isCompetitor && item.competitorName) {
      competitorMap[item.competitorName] = competitorMap[item.competitorName] || {
        name: item.competitorName,
        citations: 0
      }
      competitorMap[item.competitorName].citations += item.queries
    }
  })
  
  return Object.values(competitorMap).sort((a, b) => b.citations - a.citations)
})

// Top competitor citations count
const topCompetitor = computed(() => {
  return competitors.value.length > 0 ? competitors.value[0] : { name: 'No competitor', citations: 0 }
})

const competitorDisplayName = computed(() => {
  if (selectedCompetitor.value === 'top') {
    return topCompetitor.value.name
  }
  return selectedCompetitor.value
})

const competitorCitationCount = computed(() => {
  if (selectedCompetitor.value === 'top') {
    return topCompetitor.value.citations
  }
  const competitor = competitors.value.find(c => c.name === selectedCompetitor.value)
  return competitor ? competitor.citations : 0
})

const maxCitations = computed(() => {
  return Math.max(props.brandCitations, competitorCitationCount.value)
})

// Quality metrics
const brandRelevanceScore = computed(() => {
  const brandCitations = props.citationData.filter(item => item.isBrand)
  if (brandCitations.length === 0) return 0
  
  const totalRelevance = brandCitations.reduce((sum, item) => sum + item.relevance, 0)
  return totalRelevance / brandCitations.length
})

const uniqueBrandPages = computed(() => {
  return new Set(props.citationData.filter(item => item.isBrand).map(item => item.url)).size
})

const queryCoveragePercentage = computed(() => {
  // Calculate percentage of total queries where brand was cited
  const uniqueQueriesWithBrand = new Set()
  const brandCitations = props.citationData.filter(item => item.isBrand)
  
  // This is a simplification - in reality we would need more data about unique queries
  // For now, using a formula based on total citations and brand citations
  return Math.round((props.brandCitations / (props.totalCitations * 0.5)) * 100) || 0
})

// Filtered data for the table
const filteredCitationData = computed(() => {
  if (citationFilter.value === 'all') {
    return props.citationData
  } else if (citationFilter.value === 'brand') {
    return props.citationData.filter(item => item.isBrand)
  } else if (citationFilter.value === 'competitors') {
    return props.citationData.filter(item => item.isCompetitor)
  } else if (citationFilter.value === 'other') {
    return props.citationData.filter(item => !item.isBrand && !item.isCompetitor)
  }
  return props.citationData
})

// Helper functions
const formatUrl = (url) => {
  try {
    const urlObj = new URL(url)
    let path = urlObj.pathname
    if (path.length > 40) {
      path = path.substring(0, 37) + '...'
    }
    return urlObj.hostname + path
  } catch (e) {
    return url
  }
}

const getRelevanceColor = (score) => {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-blue-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>