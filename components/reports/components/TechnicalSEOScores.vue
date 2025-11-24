<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">SEO Performance Scores</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Overall technical and content scores</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Technical SEO Score -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 border border-blue-200/50 dark:border-blue-500/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Technical SEO</h4>
          <SeoScoreGauge :score="techSeoScore / 10" />
          <div class="flex items-center justify-center gap-2 text-xs mt-2" :class="getComparisonIndicator(techSeoScore, benchmarkAvgTechSeo).color">
            <span>{{ getComparisonIndicator(techSeoScore, benchmarkAvgTechSeo).icon }}</span>
            <span>others: {{ benchmarkAvgTechSeo }}%</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ totalBrandPages }}/{{ totalPages }} brand pages</p>
        </div>

        <!-- Content Quality Score -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-500/20 border border-green-200/50 dark:border-green-500/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Content Quality</h4>
          <SeoScoreGauge :score="contentQualityScore / 10" />
          <div class="flex items-center justify-center gap-2 text-xs mt-2" :class="getComparisonIndicator(contentQualityScore, benchmarkAvgContent).color">
            <span>{{ getComparisonIndicator(contentQualityScore, benchmarkAvgContent).icon }}</span>
            <span>others: {{ benchmarkAvgContent }}%</span>
          </div>
        </div>

        <!-- Page Performance Score -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-200/50 dark:border-yellow-500/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Performance</h4>
          <SeoScoreGauge :score="pagePerformanceScore / 10" />
          <div class="flex items-center justify-center gap-2 text-xs mt-2" :class="getComparisonIndicator(pagePerformanceScore, benchmarkAvgPerformance).color">
            <span>{{ getComparisonIndicator(pagePerformanceScore, benchmarkAvgPerformance).icon }}</span>
            <span>others: {{ benchmarkAvgPerformance }}%</span>
          </div>
        </div>

        <!-- Brand Pages Count -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 border border-purple-200/50 dark:border-purple-500/30 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Brand Pages</h4>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ totalBrandPages }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">of {{ totalPages }} total pages</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SeoScoreGauge from '../SeoScoreGauge.vue'

const props = defineProps({
  techSeoScore: {
    type: Number,
    default: 0
  },
  contentQualityScore: {
    type: Number,
    default: 0
  },
  pagePerformanceScore: {
    type: Number,
    default: 0
  },
  totalBrandPages: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 0
  },
  benchmarkAvgTechSeo: {
    type: Number,
    default: 0
  },
  benchmarkAvgContent: {
    type: Number,
    default: 0
  },
  benchmarkAvgPerformance: {
    type: Number,
    default: 0
  }
})

const getComparisonIndicator = (current, average) => {
  if (current > average) {
    return {
      color: 'text-green-600 dark:text-green-400',
      icon: '↗️'
    }
  } else if (current < average) {
    return {
      color: 'text-red-600 dark:text-red-400',
      icon: '↘️'
    }
  } else {
    return {
      color: 'text-gray-600 dark:text-gray-400',
      icon: '→'
    }
  }
}
</script>
