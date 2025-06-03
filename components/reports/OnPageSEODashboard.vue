<template>
  <div class="space-y-8">

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Technical SEO Score</h3>
          <div class="flex justify-center mb-2">
            <SeoScoreGauge :score="techSeoScore / 10" />
          </div>
          <div class="flex items-center gap-2 text-sm justify-center" :class="getComparisonIndicator(techSeoScore, benchmarkAverages.avgTechSeoScore).color">
            <span>{{ getComparisonIndicator(techSeoScore, benchmarkAverages.avgTechSeoScore).icon }}</span>
            <span>other pages: {{ benchmarkAverages.avgTechSeoScore }}%</span>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">{{ totalBrandPages }}/{{ totalPages }} brand pages</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Content Quality Score</h3>
          <div class="flex justify-center mb-2">
            <SeoScoreGauge :score="contentQualityScore / 10" />
          </div>
          <div class="flex items-center gap-2 text-sm justify-center" :class="getComparisonIndicator(contentQualityScore, benchmarkAverages.avgContentQualityScore).color">
            <span>{{ getComparisonIndicator(contentQualityScore, benchmarkAverages.avgContentQualityScore).icon }}</span>
            <span>other pages: {{ benchmarkAverages.avgContentQualityScore }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Page Performance Score</h3>
          <div class="flex justify-center mb-2">
            <SeoScoreGauge :score="pagePerformanceScore / 10" />
          </div>
          <div class="flex items-center gap-2 text-sm justify-center" :class="getComparisonIndicator(pagePerformanceScore, benchmarkAverages.avgPagePerformanceScore).color">
            <span>{{ getComparisonIndicator(pagePerformanceScore, benchmarkAverages.avgPagePerformanceScore).icon }}</span>
            <span>other pages: {{ benchmarkAverages.avgPagePerformanceScore }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
        <div class="flex items-center justify-between mb-6">
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Brand Pages Found</h3>
          <p class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ totalBrandPages }}</p>
          <div class="text-sm text-gray-500 dark:text-gray-400">out of {{ totalPages }} total pages</div>
        </div>
      </div>
    </div>

    <!-- Technical SEO Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Technical SEO Implementation</h3>
        </div>
        <p class="text-base text-gray-600 dark:text-gray-400">Analysis of technical SEO elements across your pages</p>
        <div v-if="crawlErrorCount > 0" class="mt-4 p-4 bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {{ crawlErrorCount }} of {{ totalBrandPages }} pages had crawl errors. Technical SEO analysis is limited for these pages, but basic metrics like HTTPS are still available.
          </p>
        </div>
      </div>
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="metric in technicalSeoMetrics" :key="metric.label" class="text-center">
            <div class="relative inline-flex items-center justify-center w-24 h-24 mb-4">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none" class="text-gray-200 dark:text-gray-700"/>
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"
                        :class="metric.percentage >= 80 ? 'text-green-500 dark:text-green-400' : metric.percentage >= 60 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'"
                        :stroke-dasharray="`${metric.percentage * 2.51327} 251.327`"
                        stroke-linecap="round"/>
              </svg>
              <span class="absolute text-lg font-bold text-gray-900 dark:text-white">{{ metric.percentage }}%</span>
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ metric.label }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ metric.count }}/{{ metric.totalBrandPages }} brand pages</div>
            <div class="text-sm" :class="getComparisonIndicator(metric.percentage, metric.avgPercentage).color">
              {{ getComparisonIndicator(metric.percentage, metric.avgPercentage).icon }} other pages: {{ metric.avgPercentage }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Quality Analysis -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Content Quality Distribution</h3>
        </div>
        <p class="text-base text-gray-600 dark:text-gray-400">Word count, readability, and content structure analysis</p>
      </div>
      <div class="p-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Word Count Distribution -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Word Count Distribution</h4>
            <div class="space-y-4">
              <div v-for="range in wordCountDistribution" :key="range.range" class="flex items-center">
                <div class="w-24 text-base text-gray-600 dark:text-gray-400">{{ range.range }}</div>
                <div class="flex-1 mx-4">
                  <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" :style="{ width: `${range.percentage}%` }"></div>
                  </div>
                </div>
                <div class="w-16 text-base font-semibold text-gray-900 dark:text-white text-right">{{ range.count }}</div>
              </div>
            </div>
          </div>

          <!-- Content Structure -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Content Structure Elements</h4>
            <div class="space-y-4">
              <div v-for="element in contentStructure" :key="element.element" class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-base text-gray-600 dark:text-gray-400">{{ element.element }}</div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="flex flex-col items-end">
                    <div class="text-base font-semibold text-gray-900 dark:text-white">{{ element.percentage }}%</div>
                    <div class="text-sm" :class="getComparisonIndicator(element.percentage, element.avgPercentage).color">
                      {{ getComparisonIndicator(element.percentage, element.avgPercentage).icon }} {{ element.avgPercentage }}%
                    </div>
                  </div>
                  <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div class="h-3 rounded-full transition-all duration-500"
                         :class="element.percentage >= element.avgPercentage ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'"
                         :style="{ width: `${element.percentage}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Performance vs Citation Success -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Performance vs Citation Success</h3>
        </div>
        <p class="text-base text-gray-600 dark:text-gray-400">Correlation between technical metrics and citation frequency</p>
      </div>
      <div class="p-8">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Metric Range</th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pages</th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Citations</th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Citation Rate</th>
                <th class="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Avg Quality Score</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <tr v-for="range in performanceRanges" :key="range.range" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <td class="px-8 py-6 whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">{{ range.range }}</td>
                <td class="px-8 py-6 whitespace-nowrap text-base text-gray-600 dark:text-gray-400">{{ range.pages }}</td>
                <td class="px-8 py-6 whitespace-nowrap text-base text-gray-600 dark:text-gray-400">{{ range.citations }}</td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold"
                        :class="range.citationRate >= 20 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200/50 dark:border-green-700/50' :
                               range.citationRate >= 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200/50 dark:border-red-700/50'">
                    {{ range.citationRate }}%
                  </span>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-base text-gray-600 dark:text-gray-400">{{ range.avgQualityScore }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Top Issues and Recommendations -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
      <div class="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Brand Page Issues & Recommendations</h3>
        </div>
        <p class="text-base text-gray-600 dark:text-gray-400">Priority fixes for improving your brand page SEO performance</p>
      </div>
      <div class="p-8">
        <div class="space-y-6">
          <div v-for="issue in topIssues" :key="issue.issue"
               class="rounded-2xl border transition-all duration-200 hover:shadow-md"
               :class="issue.priority === 'High' ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30' : issue.priority === 'Medium' ? 'bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/30' : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30'">
            <div class="flex items-start p-6">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                     :class="issue.priority === 'High' ? 'bg-red-200/50 dark:bg-red-800/50' : issue.priority === 'Medium' ? 'bg-yellow-200/50 dark:bg-yellow-800/50' : 'bg-blue-200/50 dark:bg-blue-800/50'">
                  <svg class="w-5 h-5" :class="issue.priority === 'High' ? 'text-red-600 dark:text-red-400' : issue.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'"
                       fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              <div class="ml-6 flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ issue.issue }}</h4>
                  <button
                    @click="selectedIssue = selectedIssue === issue.issue ? null : issue.issue"
                    class="text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
                    {{ selectedIssue === issue.issue ? 'Hide Details' : 'View Pages' }}
                  </button>
                </div>
                <p class="text-base text-gray-600 dark:text-gray-400 mt-2">{{ issue.description }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">Affects {{ issue.affectedPages }} brand pages • Priority: {{ issue.priority }}</p>
              </div>
            </div>

            <!-- Dropdown with affected pages -->
            <div v-if="selectedIssue === issue.issue && issue.pages" class="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
              <div class="p-6">
                <h5 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Affected Brand Pages:</h5>
                <div class="space-y-3">
                  <div v-for="page in issue.pages" :key="page.id"
                       class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-600/50">
                    <div class="flex-1 min-w-0">
                      <div class="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {{ page.page_title || 'Untitled Page' }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {{ page.citation_url }}
                      </div>
                      <div class="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Query ID: {{ page.query_id }}
                      </div>
                    </div>
                    <a :href="page.citation_url" target="_blank"
                       class="ml-4 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all">
                      View Page →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="!hasData" class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No brand pages found</h3>
      <p class="text-base text-gray-500 dark:text-gray-400 mb-4">
        {{ filteredData.length === 0 ? 'No queries match the current filters.' : 'No pages mentioning your brand were found in the analysis results.' }}
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500">
        Total queries: {{ props.data?.analysis_queries?.length || 0 }} |
        Filtered queries: {{ filteredData.length }} |
        Total pages: {{ pageAnalyses.length }} |
        Brand pages: {{ brandPages.length }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SeoScoreGauge from './SeoScoreGauge.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  }
})

// Available platforms for filtering
const availablePlatforms = computed(() => {
  const platforms = new Set()
  if (props.data?.analysis_queries) {
    props.data.analysis_queries.forEach(query => {
      // Check both platform and data_source fields from schema
      const platform = query.platform || query.data_source
      if (platform) platforms.add(platform.toLowerCase())
    })
  }
  return Array.from(platforms).map(platform => ({
    value: platform,
    label: platform.charAt(0).toUpperCase() + platform.slice(1)
  }))
})

// Selected platforms for filtering
const selectedPlatforms = ref([])

// Platform toggle function
const togglePlatform = (platform) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
}

// Filter data based on selected platforms
const filteredData = computed(() => {
  if (!props.data?.analysis_queries) return []
  if (selectedPlatforms.value.length === 0) return props.data.analysis_queries
  return props.data.analysis_queries.filter(item => {
    const platform = (item.platform || item.data_source || '').toLowerCase()
    return platform && selectedPlatforms.value.includes(platform)
  })
})

const hasData = computed(() => {
  return filteredData.value.length > 0 && brandPages.value.length > 0
})

// Extract page analyses data
const pageAnalyses = computed(() => {
  // First try direct page_analyses from the data structure
  let analyses = props.data?.page_analyses || []

  // If no direct page_analyses, extract from associated_pages in queries
  if (analyses.length === 0 && props.data?.analysis_queries) {
    analyses = []
    props.data.analysis_queries.forEach(query => {
      if (query.associated_pages && Array.isArray(query.associated_pages)) {
        // Add query_id to each page analysis if not present
        query.associated_pages.forEach(page => {
          if (!page.query_id) {
            page.query_id = query.id
          }
          analyses.push(page)
        })
      }
    })
  }

  // Filter by selected platforms if any are selected
  if (selectedPlatforms.value.length > 0) {
    // Get query IDs for filtered queries
    const filteredQueryIds = new Set(filteredData.value.map(q => q.id))

    // Filter page analyses to only include those from filtered queries
    return analyses.filter(analysis => filteredQueryIds.has(analysis.query_id))
  }

  return analyses
})

// Filter brand pages only (pages that mention the client's brand)
const brandPages = computed(() => {
  return pageAnalyses.value.filter(page =>
    page.brand_mentioned === true ||
    page.is_client_domain === true ||
    (page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain))
  )
})

// Filter non-brand pages for benchmarking
const nonBrandPages = computed(() => {
  return pageAnalyses.value.filter(page =>
    !(page.brand_mentioned === true ||
      page.is_client_domain === true ||
      (page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain)))
  )
})

const totalPages = computed(() => pageAnalyses.value.length)
const totalBrandPages = computed(() => brandPages.value.length)
const totalNonBrandPages = computed(() => nonBrandPages.value.length)

// Count pages with crawl errors
const crawlErrorCount = computed(() => {
  return brandPages.value.filter(page =>
    page.analysis_notes?.includes('Default analysis used due to crawl or AI error')
  ).length
})

// Calculate benchmark averages across all pages
const benchmarkAverages = computed(() => {
  if (!nonBrandPages.value.length) return {}

  const pages = nonBrandPages.value
  const total = pages.length

  return {
    // Technical SEO benchmarks
    httpsPercentage: Math.round((pages.filter(page =>
      page.citation_url?.startsWith('https://') || page.technical_seo?.http_response_code === 200
    ).length / total) * 100),

    schemaPercentage: Math.round((pages.filter(page =>
      page.technical_seo?.schema_markup_present === true
    ).length / total) * 100),

    semanticHtmlPercentage: Math.round((pages.filter(page =>
      page.technical_seo?.semantic_html_usage === true
    ).length / total) * 100),

    mobilePercentage: Math.round((pages.filter(page =>
      page.technical_seo?.mobile_friendly === true
    ).length / total) * 100),

    ariaPercentage: Math.round((pages.filter(page =>
      page.technical_seo?.aria_labels_present === true
    ).length / total) * 100),

    metaDescPercentage: Math.round((pages.filter(page =>
      page.technical_seo?.meta_description_present === true
    ).length / total) * 100),

    // Content structure benchmarks
    tablesPercentage: Math.round((pages.filter(page =>
      page.on_page_seo?.has_table === true
    ).length / total) * 100),

    orderedListsPercentage: Math.round((pages.filter(page =>
      page.on_page_seo?.has_ordered_list === true
    ).length / total) * 100),

    unorderedListsPercentage: Math.round((pages.filter(page =>
      page.on_page_seo?.has_unordered_list === true
    ).length / total) * 100),

    headingsPercentage: Math.round((pages.filter(page =>
      (page.on_page_seo?.heading_count || 0) > 0
    ).length / total) * 100),

    imagesPercentage: Math.round((pages.filter(page =>
      (page.on_page_seo?.image_count || 0) > 0
    ).length / total) * 100),

    videosPercentage: Math.round((pages.filter(page =>
      page.on_page_seo?.video_present === true
    ).length / total) * 100),

    // Performance benchmarks
    avgTechSeoScore: Math.round(pages.reduce((sum, page) => {
      const tech = page.technical_seo || {}
      let score = 0
      if (page.citation_url?.startsWith('https://') || tech.http_response_code === 200) score += 20
      if (tech.schema_markup_present === true) score += 20
      if (tech.semantic_html_usage === true) score += 20
      if (tech.aria_labels_present === true) score += 20
      if (tech.mobile_friendly === true) score += 10
      if (tech.meta_description_present === true) score += 5
      if (tech.html_structure_score >= 3) score += 5
      return sum + score
    }, 0) / total),

    avgContentQualityScore: Math.round(pages.reduce((sum, page) => {
      if (page.content_quality_score && page.content_quality_score > 0) {
        return sum + (Number(page.content_quality_score) * 20)
      }
      const content = page.content_quality || {}
      const onPage = page.on_page_seo || {}
      let score = 0
      score += (content.content_depth_score || 0) * 5
      score += (content.analysis_score || 0) * 5
      score += (content.content_optimization_score || 0) * 5
      score += (content.eeat_score || 0) * 3
      score += (content.readability_score || 0) * 3
      if (content.has_quotes) score += 3
      if (content.has_research) score += 4
      if (content.has_citations) score += 4
      if (content.has_statistics) score += 4
      const wordCount = onPage.word_count || 0
      if (wordCount > 2000) score += 10
      else if (wordCount > 1000) score += 7
      else if (wordCount > 500) score += 5
      else if (wordCount > 300) score += 3
      return sum + Math.min(score, 100)
    }, 0) / total),

    avgPagePerformanceScore: Math.round(pages.reduce((sum, page) => {
      const perf = page.page_performance || {}
      if (perf.page_speed_score) return sum + Number(perf.page_speed_score)

      let score = 0
      const speedScore = perf.page_speed_score || 50
      score += speedScore * 0.4
      const accessibilityScore = (perf.accessibility_score || 0) * 25
      score += accessibilityScore * 0.25
      const fcp = perf.firstContentfulPaint || 0
      let fcpScore = 100
      if (fcp > 2500) fcpScore = 0
      else if (fcp > 1800) fcpScore = 50
      else if (fcp > 1000) fcpScore = 75
      score += fcpScore * 0.15
      const lcp = perf.largestContentfulPaint || 0
      let lcpScore = 100
      if (lcp > 4000) lcpScore = 0
      else if (lcp > 2500) lcpScore = 50
      else if (lcp > 1500) lcpScore = 75
      score += lcpScore * 0.15
      const cls = perf.cumulativeLayoutShift || 0
      let clsScore = 100
      if (cls > 0.25) clsScore = 0
      else if (cls > 0.1) clsScore = 50
      else if (cls > 0.05) clsScore = 75
      score += clsScore * 0.05
      return sum + Math.round(Math.max(score, 0))
    }, 0) / total)
  }
})

// Helper function to get comparison indicator
const getComparisonIndicator = (current, average) => {
  if (current > average) {
    return {
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '↗️'
    }
  } else if (current < average) {
    return {
      trend: 'down',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '↘️'
    }
  } else {
    return {
      trend: 'equal',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '→'
    }
  }
}

// Calculate Technical SEO Score (BRAND PAGES ONLY)
const techSeoScore = computed(() => {
  if (!brandPages.value.length) return 0

  // Calculate based on actual technical_seo object fields
  const scores = brandPages.value.map(page => {
    let score = 0
    const tech = page.technical_seo || {}

    // If this page had crawl errors, use a default score based on basic URL analysis
    const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')

    if (hasCrawlError) {
      // For pages with crawl errors, give basic scores for what we can determine
      if (page.citation_url?.startsWith('https://')) score += 20 // HTTPS
      if (tech.mobile_friendly === true) score += 10 // Mobile friendly (often still detectable)
      score += 30 // Give some baseline score for being a legitimate page
      return score
    }

    // HTTPS/SSL (20 points)
    if (page.citation_url?.startsWith('https://') || tech.http_response_code === 200) {
      score += 20
    }

    // Schema markup (20 points)
    if (tech.schema_markup_present === true) {
      score += 20
    }

    // Semantic HTML (20 points)
    if (tech.semantic_html_usage === true) {
      score += 20
    }

    // ARIA/Accessibility (20 points)
    if (tech.aria_labels_present === true) {
      score += 20
    }

    // Mobile friendly (10 points)
    if (tech.mobile_friendly === true) {
      score += 10
    }

    // Meta description (5 points)
    if (tech.meta_description_present === true) {
      score += 5
    }

    // HTML structure quality (5 points)
    if (tech.html_structure_score >= 3) {
      score += 5
    }

    return score
  })

  const validScores = scores.filter(score => score >= 0)
  if (!validScores.length) return 0

  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
})

// Calculate Content Quality Score (BRAND PAGES ONLY)
const contentQualityScore = computed(() => {
  if (!brandPages.value.length) return 0

  // Use actual content_quality object with detailed scoring
  const scores = brandPages.value.map(page => {
    // Check if this page had crawl errors
    const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')

    if (hasCrawlError) {
      // For pages with crawl errors, use basic content quality estimate
      const content = page.content_quality || {}
      let score = 0

      // Use available scores or defaults
      score += (content.content_depth_score || 3) * 5 // Default to 3 if no data
      score += (content.analysis_score || 3) * 5
      score += (content.eeat_score || 3) * 3
      score += (content.readability_score || 3) * 3

      // Add baseline for being a legitimate cited page
      score += 20

      return Math.min(score, 100)
    }

    // First try direct score field from schema (scale from 0-5 to 0-100)
    if (page.content_quality_score && page.content_quality_score > 0) {
      return Number(page.content_quality_score) * 20
    }

    // Calculate based on content_quality object metrics
    const content = page.content_quality || {}
    const onPage = page.on_page_seo || {}
    let score = 0

    // Content depth and analysis (25 points)
    score += (content.content_depth_score || 0) * 5
    score += (content.analysis_score || 0) * 5

    // Content optimization (20 points)
    score += (content.content_optimization_score || 0) * 5

    // EEAT signals (15 points)
    score += (content.eeat_score || 0) * 3

    // Readability (15 points)
    score += (content.readability_score || 0) * 3

    // Content features (15 points)
    if (content.has_quotes) score += 3
    if (content.has_research) score += 4
    if (content.has_citations) score += 4
    if (content.has_statistics) score += 4

    // Word count from on_page_seo (10 points)
    const wordCount = onPage.word_count || 0
    if (wordCount > 2000) score += 10
    else if (wordCount > 1000) score += 7
    else if (wordCount > 500) score += 5
    else if (wordCount > 300) score += 3

    return Math.min(score, 100) // Cap at 100
  })

  const validScores = scores.filter(score => score >= 0)
  if (!validScores.length) return 0

  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
})

// Calculate Page Performance Score (BRAND PAGES ONLY)
const pagePerformanceScore = computed(() => {
  if (!brandPages.value.length) return 0

  // Calculate performance score based on available metrics in page_performance JSONB field
  const scores = brandPages.value.map(page => {
    const perf = page.page_performance || {}

    // Use direct page_speed_score if available
    if (perf.page_speed_score) {
      return Number(perf.page_speed_score)
    }

    // Calculate based on Core Web Vitals and accessibility
    let score = 0

    // Page speed contributes 40%
    const speedScore = perf.page_speed_score || 50 // Default to 50 if not available
    score += speedScore * 0.4

    // Accessibility contributes 25%
    const accessibilityScore = (perf.accessibility_score || 0) * 25 // Scale from 0-4 to 0-100
    score += accessibilityScore * 0.25

    // First Contentful Paint (15%)
    const fcp = perf.firstContentfulPaint || 0
    let fcpScore = 100
    if (fcp > 2500) fcpScore = 0
    else if (fcp > 1800) fcpScore = 50
    else if (fcp > 1000) fcpScore = 75
    score += fcpScore * 0.15

    // Largest Contentful Paint (15%)
    const lcp = perf.largestContentfulPaint || 0
    let lcpScore = 100
    if (lcp > 4000) lcpScore = 0
    else if (lcp > 2500) lcpScore = 50
    else if (lcp > 1500) lcpScore = 75
    score += lcpScore * 0.15

    // Cumulative Layout Shift (5%)
    const cls = perf.cumulativeLayoutShift || 0
    let clsScore = 100
    if (cls > 0.25) clsScore = 0
    else if (cls > 0.1) clsScore = 50
    else if (cls > 0.05) clsScore = 75
    score += clsScore * 0.05

    return Math.round(Math.max(score, 0)) // Don't go below 0
  })

  const validScores = scores.filter(score => score >= 0)
  if (!validScores.length) return 0

  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
})

// Technical SEO Metrics (BRAND PAGES ONLY)
const technicalSeoMetrics = computed(() => {
  if (!brandPages.value.length) return []

  const metrics = [
    {
      label: 'HTTPS/SSL',
      check: (page) => {
        return page.citation_url?.startsWith('https://') ||
               page.technical_seo?.http_response_code === 200
      },
      avgKey: 'httpsPercentage'
    },
    {
      label: 'Schema Markup',
      check: (page) => {
        // For crawl errors, assume schema is not present unless specifically detected
        const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')
        if (hasCrawlError) return false
        return page.technical_seo?.schema_markup_present === true
      },
      avgKey: 'schemaPercentage'
    },
    {
      label: 'Semantic HTML',
      check: (page) => {
        // For crawl errors, assume semantic HTML is not present
        const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')
        if (hasCrawlError) return false
        return page.technical_seo?.semantic_html_usage === true
      },
      avgKey: 'semanticHtmlPercentage'
    },
    {
      label: 'Mobile Friendly',
      check: (page) => {
        // Mobile friendly can often be detected even with crawl errors
        return page.technical_seo?.mobile_friendly === true
      },
      avgKey: 'mobilePercentage'
    },
    {
      label: 'ARIA Labels',
      check: (page) => {
        // For crawl errors, assume ARIA labels are not present
        const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')
        if (hasCrawlError) return false
        return page.technical_seo?.aria_labels_present === true
      },
      avgKey: 'ariaPercentage'
    },
    {
      label: 'Meta Description',
      check: (page) => {
        // For crawl errors, assume meta description is not present
        const hasCrawlError = page.analysis_notes?.includes('Default analysis used due to crawl or AI error')
        if (hasCrawlError) return false
        return page.technical_seo?.meta_description_present === true
      },
      avgKey: 'metaDescPercentage'
    }
  ]

  return metrics.map(metric => {
    const count = brandPages.value.filter(page => metric.check(page)).length
    const percentage = totalBrandPages.value > 0 ? Math.round((count / totalBrandPages.value) * 100) : 0

    return {
      label: metric.label,
      count,
      percentage,
      avgPercentage: benchmarkAverages.value[metric.avgKey] || 0,
      totalBrandPages: totalBrandPages.value
    }
  })
})

// Word Count Distribution (BRAND PAGES ONLY)
const wordCountDistribution = computed(() => {
  if (!brandPages.value.length) return []

  const ranges = [
    { range: '0-500', min: 0, max: 500 },
    { range: '501-1000', min: 501, max: 1000 },
    { range: '1001-2000', min: 1001, max: 2000 },
    { range: '2000+', min: 2001, max: Infinity }
  ]

  return ranges.map(range => {
    const count = brandPages.value.filter(page => {
      // Use word_count from on_page_seo object
      const wordCount = page.on_page_seo?.word_count || 0
      return wordCount >= range.min && wordCount <= range.max
    }).length

    return {
      range: range.range,
      count,
      percentage: totalBrandPages.value > 0 ? Math.round((count / totalBrandPages.value) * 100) : 0
    }
  })
})

// Content Structure Elements (BRAND PAGES ONLY)
const contentStructure = computed(() => {
  if (!brandPages.value.length) return []

  const elements = [
    {
      element: 'Tables',
      check: (page) => page.on_page_seo?.has_table === true,
      avgKey: 'tablesPercentage'
    },
    {
      element: 'Ordered Lists',
      check: (page) => page.on_page_seo?.has_ordered_list === true,
      avgKey: 'orderedListsPercentage'
    },
    {
      element: 'Unordered Lists',
      check: (page) => page.on_page_seo?.has_unordered_list === true,
      avgKey: 'unorderedListsPercentage'
    },
    {
      element: 'Headings',
      check: (page) => (page.on_page_seo?.heading_count || 0) > 0,
      avgKey: 'headingsPercentage'
    },
    {
      element: 'Images',
      check: (page) => (page.on_page_seo?.image_count || 0) > 0,
      avgKey: 'imagesPercentage'
    },
    {
      element: 'Videos',
      check: (page) => page.on_page_seo?.video_present === true,
      avgKey: 'videosPercentage'
    }
  ]

  return elements.map(element => {
    const count = brandPages.value.filter(page => element.check(page)).length
    const percentage = totalBrandPages.value > 0 ? Math.round((count / totalBrandPages.value) * 100) : 0

    return {
      element: element.element,
      percentage,
      avgPercentage: benchmarkAverages.value[element.avgKey] || 0
    }
  })
})

// Performance vs Citation Analysis
const performanceRanges = computed(() => {
  if (!pageAnalyses.value.length) return []

  const ranges = [
    { range: '90-100%', min: 90, max: 100 },
    { range: '80-89%', min: 80, max: 89 },
    { range: '70-79%', min: 70, max: 79 },
    { range: '60-69%', min: 60, max: 69 },
    { range: 'Below 60%', min: 0, max: 59 }
  ]

  return ranges.map(range => {
    const pagesInRange = pageAnalyses.value.filter(page => {
      // Use content_quality_score or relevance_score from schema
      const score = Number(page.content_quality_score || page.relevance_score || 0)
      return score >= range.min && score <= range.max
    })

    // Check for citations using schema fields
    const citations = pagesInRange.filter(page =>
      page.is_client_domain ||
      page.brand_mentioned ||
      (page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain))
    ).length

    const citationRate = pagesInRange.length > 0 ? Math.round((citations / pagesInRange.length) * 100) : 0

    const avgQualityScore = pagesInRange.length > 0
      ? Math.round(pagesInRange.reduce((sum, page) => {
          return sum + Number(page.content_quality_score || page.relevance_score || 0)
        }, 0) / pagesInRange.length)
      : 0

    return {
      range: range.range,
      pages: pagesInRange.length,
      citations,
      citationRate,
      avgQualityScore
    }
  }).filter(range => range.pages > 0)
})

// Selected issue for detailed view
const selectedIssue = ref(null)

// Top Issues and Recommendations (BRAND PAGES ONLY)
const topIssues = computed(() => {
  if (!brandPages.value.length) return []

  const issues = []

  // Check for SSL issues
  const noSSLPages = brandPages.value.filter(page => {
    const tech = page.technical_seo || {}
    return !(page.citation_url?.startsWith('https://') || tech.http_response_code === 200)
  })
  const noSSL = noSSLPages.length

  if (noSSL > 0) {
    issues.push({
      issue: 'Missing SSL Certificates',
      description: 'Some brand pages are not served over HTTPS, which affects search rankings and user trust.',
      affectedPages: noSSL,
      priority: 'High',
      pages: noSSLPages
    })
  }

  // Check for poor content quality
  const poorContentPages = brandPages.value.filter(page => {
    const score = Number(page.content_quality_score || page.relevance_score || 0)
    return score < 60
  })
  const poorContent = poorContentPages.length

  if (poorContent > 0) {
    issues.push({
      issue: 'Low Content Quality Scores',
      description: 'Brand pages with poor content quality scores need optimization for better engagement.',
      affectedPages: poorContent,
      priority: 'Medium',
      pages: poorContentPages
    })
  }

  // Check for missing structure
  const noStructurePages = brandPages.value.filter(page => {
    const onPage = page.on_page_seo || {}
    return !((onPage.heading_count || 0) > 0 ||
            onPage.has_ordered_list === true ||
            onPage.has_unordered_list === true)
  })
  const noStructure = noStructurePages.length

  if (noStructure > 0) {
    issues.push({
      issue: 'Missing Content Structure',
      description: 'Brand pages lack proper heading hierarchy and structured content elements.',
      affectedPages: noStructure,
      priority: 'Medium',
      pages: noStructurePages
    })
  }

  // Check for thin content
  const lowWordCountPages = brandPages.value.filter(page => {
    const wordCount = page.on_page_seo?.word_count || 0
    return wordCount < 300
  })
  const lowWordCount = lowWordCountPages.length

  if (lowWordCount > 0) {
    issues.push({
      issue: 'Thin Content',
      description: 'Brand pages with very low word counts may not provide sufficient value to users.',
      affectedPages: lowWordCount,
      priority: 'Low',
      pages: lowWordCountPages
    })
  }

  // Check for missing semantic markup
  const noSemanticPages = brandPages.value.filter(page => {
    const tech = page.technical_seo || {}
    return !(tech.semantic_html_usage === true || tech.schema_markup_present === true)
  })
  const noSemantic = noSemanticPages.length

  if (noSemantic > 0) {
    issues.push({
      issue: 'Missing Semantic Markup',
      description: 'Brand pages lack structured data and semantic HTML elements for better search visibility.',
      affectedPages: noSemantic,
      priority: 'Medium',
      pages: noSemanticPages
    })
  }

  // Check for accessibility issues
  const noAriaPages = brandPages.value.filter(page => {
    const tech = page.technical_seo || {}
    return !(tech.aria_labels_present === true)
  })
  const noAria = noAriaPages.length

  if (noAria > 0) {
    issues.push({
      issue: 'Poor Accessibility',
      description: 'Brand pages lack ARIA labels and accessibility features, limiting user experience.',
      affectedPages: noAria,
      priority: 'Low',
      pages: noAriaPages
    })
  }

  return issues.slice(0, 5) // Show top 5 issues
})
</script>