<template>
  <div class="analysis-journey bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && (!data || Object.keys(data).length === 0)" class="py-20 text-center">
      <div class="mb-4">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </div>
      <h4 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Analysis Data Available</h4>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Select an analysis run or use the demo data to visualize the analysis journey.
      </p>
    </div>

    <!-- Journey Content -->
    <div v-else-if="!loading && data" class="mb-6">
      <!-- Keywords Section -->
      <div class="mb-10 pb-8 border-b border-gray-100 dark:border-gray-700">
        <KeywordsSection
          :keyword-count="data.keywordCount || 0"
          :total-queries="data.totalQueries || 0"
          :keyword-categories="data.keywordCategories || []"
          :keyword-data="data.keywordData || []"
          :query-data="data.queryData || []"
          :analysis-queries="data.rawAnalysisQueries || []"
          :analysis-run-id="analysisRunId"
        />
      </div>

      <!-- Queries Section -->
      <div class="mb-10 pb-8 border-b border-gray-100 dark:border-gray-700">
        <QueriesSection
          :total-queries="data.totalQueries || 0"
          :query-intent-breakdown="data.queryIntentBreakdown || []"
          :query-type-breakdown="data.queryTypeBreakdown || []"
          :query-data="data.queryData || []"
        />
      </div>

      <!-- Responses Section -->
      <div class="mb-10 pb-8 border-b border-gray-100 dark:border-gray-700">
        <ResponsesSection
          :total-responses="data.totalResponses || 0"
          :brand-mentions="data.brandMentions || 0"
          :brand-pages-cited="data.brandPagesCited || 0"
          :response-data="data.responseData || []"
        />
      </div>

      <!-- Citations Section -->
      <div>
        <CitationsSection
          :total-citations="data.totalCitations || 0"
          :brand-citations="data.brandCitations || 0"
          :competitor-citations="data.competitorCitations || 0"
          :citation-data="data.citationData || []"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading analysis data...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import KeywordsSection from './analysis-journey/KeywordsSection.vue'
import QueriesSection from './analysis-journey/QueriesSection.vue'
import ResponsesSection from './analysis-journey/ResponsesSection.vue'
import CitationsSection from './analysis-journey/CitationsSection.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Analysis Journey'
  },
  subtitle: {
    type: String,
    default: 'How we analyzed your brand presence in AI responses'
  },
  data: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  analysisRunId: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.analysis-journey {
  position: relative;
  min-height: 400px;
}
</style>