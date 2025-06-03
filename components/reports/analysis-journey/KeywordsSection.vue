<template>
  <div>
    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-6">1. Keywords</h4>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Explanation Column (1/3) -->
      <div class="space-y-4">
        <!-- Keywords Count -->
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div class="flex flex-col items-center">
            <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Keywords Analyzed</div>
            <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{{ keywordCount }}</div>
          </div>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Keywords form the foundation of our analysis. We start by identifying terms that potential customers use to find information related to your products or services.
        </p>

        <!-- Queries Count -->
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
          <div class="flex flex-col items-center">
            <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Queries Generated</div>
            <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">{{ totalQueries }}</div>
          </div>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          From these keywords, we created targeted queries that were submitted to AI platforms to analyze how they respond to user questions in your industry.
        </p>
      </div>

      <!-- Interactive Data Column (2/3) -->
      <div class="md:col-span-2">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 h-full shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-medium text-gray-800 dark:text-gray-200">Keywords & Sample Queries</h5>
            <div class="flex items-center gap-2">
              <select v-model="keywordFilter" class="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <option value="all">All Keywords</option>
                <option value="brand-mentioned">Brand Mentioned</option>
                <option value="no-mentions">No Mentions</option>
              </select>
            </div>
          </div>

          <!-- Keyword Table -->
          <div class="overflow-auto rounded-lg border border-gray-100 dark:border-gray-800" style="max-height: 320px;">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sample Query
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Queries
                  </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Brand Mentions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(item, index) in displayedKeywordData" :key="item.keyword" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                    {{ item.keyword }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="max-h-20 overflow-y-auto text-xs">
                      <div v-for="(query, i) in getQueriesForKeyword(item.keyword)" :key="i" class="mb-1 pb-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        {{ query }}
                      </div>
                      <div v-if="getQueriesForKeyword(item.keyword).length === 0" class="text-gray-400 italic">
                        No queries found
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
                      {{ item.queries }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-medium">
                        {{ item.brandMentions }}
                      </span>
                      <div class="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-indigo-500 dark:bg-indigo-500 rounded-full"
                          :style="{ width: `${(item.brandMentions / item.queries) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredKeywordData.length === 0" class="py-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">No keywords match the current filter</p>
          </div>

          <!-- Pagination with page indicator -->
          <div v-if="filteredKeywordData.length > itemsPerPage" class="flex justify-between items-center mt-4">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredKeywordData.length) }} of {{ filteredKeywordData.length }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                class="px-3 py-1.5 rounded-lg border text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                :disabled="currentPage === 1"
                :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
              >
                Previous
              </button>
              <button
                @click="currentPage = Math.min(Math.ceil(filteredKeywordData.length / itemsPerPage), currentPage + 1)"
                class="px-3 py-1.5 rounded-lg border text-xs text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                :disabled="currentPage === Math.ceil(filteredKeywordData.length / itemsPerPage)"
                :class="{'opacity-50 cursor-not-allowed': currentPage === Math.ceil(filteredKeywordData.length / itemsPerPage)}"
              >
                Next
              </button>
            </div>
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
  keywordCount: {
    type: Number,
    required: true
  },
  totalQueries: {
    type: Number,
    required: true
  },
  keywordCategories: {
    type: Array,
    required: true
  },
  keywordData: {
    type: Array,
    required: true
  },
  queryData: {
    type: Array,
    default: () => []
  },
  showSource: {
    type: Boolean,
    default: false
  },
  analysisQueries: {
    type: Array,
    default: () => []
  },
  analysisRunId: {
    type: String,
    default: null
  }
})

const keywordFilter = ref('all')
const itemsPerPage = 5
const currentPage = ref(1)

// Function to get all queries for a keyword
const getQueriesForKeyword = (keyword) => {
  // Find all queries that match this keyword (from analysis_queries data)
  if (props.analysisQueries && props.analysisQueries.length > 0) {
    return props.analysisQueries.filter(q =>
      q.query_keyword?.toLowerCase() === keyword.toLowerCase() ||
      q.query_text?.toLowerCase().includes(keyword.toLowerCase())
    ).map(q => q.query_text)
  }

  // If no real data, fall back to mock data
  const queries = props.queryData.filter(q =>
    q.query.toLowerCase().includes(keyword.toLowerCase())
  ).map(q => q.query)

  return queries.length > 0 ? queries : [`What is ${keyword}?`]
}

// Function to get a sample query example for a keyword (for display in table)
const getQueryForKeyword = (keyword) => {
  const queries = getQueriesForKeyword(keyword)
  return queries[0] || `What is ${keyword}?`
}

const filteredKeywordData = computed(() => {
  if (keywordFilter.value === 'all') {
    return props.keywordData
  } else if (keywordFilter.value === 'brand-mentioned') {
    return props.keywordData.filter(item => item.brandMentions > 0)
  } else if (keywordFilter.value === 'no-mentions') {
    return props.keywordData.filter(item => item.brandMentions === 0)
  }
  return props.keywordData
})

const displayedKeywordData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filteredKeywordData.value.slice(startIndex, startIndex + itemsPerPage)
})
</script>