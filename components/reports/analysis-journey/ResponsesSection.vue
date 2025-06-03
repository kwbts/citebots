<template>
  <div>
    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-6">3. Responses</h4>
    
    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Explanation Column (1/3) -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ totalResponses }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            We analyzed <span class="font-medium">{{ totalResponses }} responses</span> from AI platforms.
          </p>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Each AI response was analyzed for brand mentions, citation quality, and relevance to the query. We track various metrics to evaluate your brand's visibility in AI-generated content.
        </p>

        <!-- Key Metrics -->
        <div class="mt-5 space-y-6">
          <!-- Brand Mention Rate -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Mention Rate</h5>
            <div class="flex items-end gap-3">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ brandMentionRate }}%
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 pb-1">
                of responses mentioned your brand
              </p>
            </div>
            <div class="mt-2 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-purple-500 dark:bg-purple-500 rounded-full"
                :style="{ width: `${brandMentionRate}%` }"
              ></div>
            </div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ brandMentions }} of {{ totalResponses }} responses
            </div>
          </div>
          
          <!-- Brand Pages Cited -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Pages Cited</h5>
            <div class="flex items-end gap-3">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ brandPagesCited }}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 pb-1">
                unique pages from your domain
              </p>
            </div>
          </div>
          
          <!-- Response Outcomes -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Response Outcomes</h5>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-sm bg-green-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Direct Answer</span>
                </div>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ directAnswerPercentage }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Elaborated Answer</span>
                </div>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ elaboratedAnswerPercentage }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-sm bg-yellow-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Partial Answer</span>
                </div>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ partialAnswerPercentage }}%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-sm bg-red-500"></div>
                  <span class="text-xs text-gray-600 dark:text-gray-400">Incorrect/Off-topic</span>
                </div>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ incorrectAnswerPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Data Column (2/3) -->
      <div class="md:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 h-full">
          <div class="flex items-center justify-between mb-4">
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Brand Mention Analysis</h5>
            <div class="flex items-center gap-2">
              <select v-model="responseFilter" class="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                <option value="all">All Responses</option>
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

          <!-- Response Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Query
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Response Outcome
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Brand Mention
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Citations
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in filteredResponseData" :key="`${item.query}-${item.platform}`" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white max-w-xs truncate">
                    {{ item.query }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {{ item.platform }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs rounded-full" :class="getResponseOutcomeClass(item.responseOutcome)">
                      {{ item.responseOutcome }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span v-if="item.brandMentionType" class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {{ item.brandMentionType }}
                    </span>
                    <span v-else class="text-gray-500 dark:text-gray-400">None</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span v-if="item.sentiment" class="px-2 py-1 text-xs rounded-full" :class="getSentimentClass(item.sentiment)">
                      {{ item.sentiment }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div class="flex items-center gap-1">
                      <span>{{ item.citationCount }}</span>
                      <svg v-if="item.citationCount > 0" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredResponseData.length === 0" class="py-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">No responses match the current filters</p>
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
  totalResponses: {
    type: Number,
    required: true
  },
  brandMentions: {
    type: Number,
    required: true
  },
  brandPagesCited: {
    type: Number,
    required: true
  },
  responseData: {
    type: Array,
    required: true
  }
})

const responseFilter = ref('all')
const platformFilter = ref('all')

// Computed percentages
const brandMentionRate = computed(() => {
  return Math.round((props.brandMentions / props.totalResponses) * 100) || 0
})

// Outcome percentages based on responseData
const responseOutcomes = computed(() => {
  const outcomes = {}
  props.responseData.forEach(item => {
    outcomes[item.responseOutcome] = (outcomes[item.responseOutcome] || 0) + 1
  })
  return outcomes
})

const directAnswerPercentage = computed(() => {
  return Math.round(((responseOutcomes.value['Direct Answer'] || 0) / props.totalResponses) * 100) || 0
})

const elaboratedAnswerPercentage = computed(() => {
  return Math.round(((responseOutcomes.value['Elaborated Answer'] || 0) / props.totalResponses) * 100) || 0
})

const partialAnswerPercentage = computed(() => {
  return Math.round(((responseOutcomes.value['Partial Answer'] || 0) / props.totalResponses) * 100) || 0
})

const incorrectAnswerPercentage = computed(() => {
  return Math.round(((responseOutcomes.value['Incorrect/Off-topic'] || 0) / props.totalResponses) * 100) || 0
})

const filteredResponseData = computed(() => {
  let filtered = props.responseData

  // Apply brand mention filter
  if (responseFilter.value === 'brand-mentioned') {
    filtered = filtered.filter(item => item.brandMentionType && item.brandMentionType !== 'None')
  } else if (responseFilter.value === 'no-mentions') {
    filtered = filtered.filter(item => !item.brandMentionType || item.brandMentionType === 'None')
  }

  // Apply platform filter
  if (platformFilter.value !== 'all') {
    filtered = filtered.filter(item => item.platform === platformFilter.value)
  }

  return filtered
})

// Helper functions for styling
const getResponseOutcomeClass = (outcome) => {
  switch (outcome) {
    case 'Direct Answer':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'Elaborated Answer':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Partial Answer':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'Incorrect/Off-topic':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const getSentimentClass = (sentiment) => {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'Neutral':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Negative':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>