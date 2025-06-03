<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analysis Journey Demo</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        A demonstration of the Analysis Journey component with sample data
      </p>
    </div>

    <!-- Analysis Journey Component -->
    <div>
      <AnalysisJourney
        title="Brand Visibility Journey"
        subtitle="How your brand appears in AI responses across the search journey"
        :data="analysisData"
        :loading="isLoading"
        analysis-run-id="demo-123"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AnalysisJourney from '~/components/reports/AnalysisJourney.vue'
import { mockAnalysisJourneyData } from '~/components/reports/analysis-journey/mockData'

const analysisData = ref({})
const isLoading = ref(true)

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    analysisData.value = mockAnalysisJourneyData
    isLoading.value = false
  }, 1000)
})
</script>