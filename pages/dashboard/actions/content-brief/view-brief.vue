<template>
  <div class="max-w-7xl mx-auto">
    <!-- Debug Panel (only shown if there are errors or loading issues) -->
    <div v-if="error || isLoading" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-red-800 dark:text-red-400 font-semibold">Brief Loading Status</h3>
        <span class="px-2 py-1 text-xs rounded-full" 
          :class="{
            'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-400': !isLoading && !error,
            'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-400': isLoading,
            'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-400': !isLoading && error
          }">
          {{ isLoading ? 'Loading...' : (error ? 'Error' : 'Loaded') }}
        </span>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Supabase Connection</p>
          <div class="flex items-center mt-1">
            <span class="h-2 w-2 rounded-full mr-2" 
              :class="{
                'bg-green-500': !error,
                'bg-red-500': error,
                'bg-yellow-500 animate-pulse': isLoading
              }"></span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ isLoading ? 'Checking...' : (error ? 'Error' : 'Connected') }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-300 mb-3">
        {{ error }}
      </div>
      
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Brief ID:</strong> {{ briefId }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-32">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading brief...</p>
      </div>
    </div>

    <!-- Brief Content -->
    <template v-else-if="brief">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="mb-4 md:mb-0">
              <div class="flex items-center">
                <NuxtLink 
                  to="/dashboard/actions/content-brief" 
                  class="text-gray-600 dark:text-gray-400 hover:text-citebots-orange dark:hover:text-citebots-orange mr-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </NuxtLink>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-wide">
                  {{ brief.title || 'Content Brief' }}
                </h1>
              </div>
              <div class="mt-1 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{{ clientName }}</span>
                <span class="mx-2">•</span>
                <span>{{ formatDate(brief.created_at) }}</span>
                <span v-if="brief.keywords?.length" class="mx-2">•</span>
                <div v-if="brief.keywords?.length" class="flex flex-wrap gap-1 mt-1 md:mt-0">
                  <span 
                    v-for="(keyword, idx) in brief.keywords" 
                    :key="idx"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-citebots-orange/10 text-citebots-orange"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <button 
                class="btn-secondary-sm flex items-center"
                @click="copyToClipboard"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
              <button 
                class="btn-secondary-sm flex items-center"
                @click="exportAsPdf"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button 
                class="btn-secondary-sm flex items-center"
                @click="print"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button 
                class="btn-secondary-sm flex items-center"
                @click="shareBrief"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <NuxtLink
                to="/dashboard/actions/content-brief"
                class="btn-primary-sm flex items-center"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New Brief
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Left Sidebar - TOC Navigation -->
        <div class="md:col-span-1">
          <div class="sticky top-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-5">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Content Sections</h2>
              
              <!-- TOC Navigation -->
              <nav class="space-y-1">
                <button 
                  v-for="(tab, index) in tabs" 
                  :key="index"
                  @click="activeTab = tab.id"
                  class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out"
                  :class="activeTab === tab.id ? 
                    'bg-citebots-orange/10 text-citebots-orange' : 
                    'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40'"
                >
                  <div class="flex items-center">
                    <span class="mr-2">
                      <component :is="tab.icon" class="w-4 h-4" />
                    </span>
                    {{ tab.label }}
                  </div>
                </button>
              </nav>

              <!-- Meta Information -->
              <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Research Sources</h3>
                <div class="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ brief.content?.meta?.research_stats?.llm_queries_executed || 3 }} LLM queries</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ brief.content?.meta?.research_stats?.pages_analyzed || 7 }} pages analyzed</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ brief.content?.meta?.research_stats?.competitor_pages_analyzed || 3 }} competitor pages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="md:col-span-3">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6">
            <!-- Tab Content -->
            <div v-if="activeTab === 'overview'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Strategic Overview</h2>
              <div class="prose dark:prose-invert max-w-none">
                <p class="whitespace-pre-line">{{ brief.content?.strategic_overview || summaryPlaceholder }}</p>
              </div>

              <!-- Brand Voice Guidelines -->
              <div v-if="brief.content?.brand_voice_guidelines" class="mt-8">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Brand Voice Guidelines</h3>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ brief.content.brand_voice_guidelines }}</p>
                </div>
              </div>

              <!-- Specificity Requirements -->
              <div v-if="brief.content?.specificity_requirements" class="mt-8">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Specificity Requirements</h3>
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ brief.content.specificity_requirements }}</p>
                </div>
              </div>

              <!-- Content Differentiation -->
              <div v-if="brief.content?.content_differentiation" class="mt-8">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Content Differentiation Strategy</h3>
                <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ brief.content.content_differentiation }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'toc'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Table of Contents</h2>
              
              <div class="space-y-8">
                <div 
                  v-for="(section, idx) in brief.content?.table_of_contents || placeholderTOC" 
                  :key="idx"
                  class="border-l-4 border-citebots-orange/70 pl-4 py-1"
                >
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {{ section.title }}
                  </h3>
                  <ul class="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-1">
                    <li v-for="(point, pidx) in section.points" :key="pidx" class="text-base">
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'statistics'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quotable Statistics</h2>
              
              <div v-if="brief.content?.quotable_statistics?.length" class="space-y-4">
                <div 
                  v-for="(stat, idx) in brief.content.quotable_statistics" 
                  :key="idx"
                  class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-1">
                      <div class="h-8 w-8 rounded-full bg-citebots-orange/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-citebots-orange">
                        <p class="text-gray-900 dark:text-white font-semibold text-lg">"{{ stat.statistic }}"</p>
                      </div>
                      <div class="mt-2 flex items-center justify-between">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Source:</strong> {{ stat.source }}
                        </p>
                        <button 
                          @click="copyStatistic(stat)"
                          class="text-xs px-2 py-1 bg-citebots-orange/10 text-citebots-orange rounded hover:bg-citebots-orange/20 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ stat.context }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="text-gray-500 dark:text-gray-400">
                  <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No quotable statistics available for this brief.</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'research'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Research Sources</h2>
              
              <div class="space-y-4">
                <div 
                  v-for="(source, idx) in brief.content?.research_links || placeholderResearch" 
                  :key="idx"
                  class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-start">
                    <div class="flex-shrink-0 mt-1">
                      <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <a 
                        :href="source.url" 
                        target="_blank" 
                        class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {{ source.title }}
                        <svg class="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ source.description }}</p>
                      
                      <!-- Key Quotes -->
                      <div v-if="source.key_quotes && source.key_quotes.length" class="mt-3">
                        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Quotes:</h4>
                        <div class="space-y-2">
                          <div 
                            v-for="(quote, qIdx) in source.key_quotes" 
                            :key="qIdx"
                            class="bg-white dark:bg-gray-800 p-2 rounded border-l-2 border-blue-400"
                          >
                            <p class="text-sm text-gray-800 dark:text-gray-200 italic">"{{ quote }}"</p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Usage Notes -->
                      <div v-if="source.usage_notes" class="mt-3">
                        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Usage Notes:</h4>
                        <p class="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          {{ source.usage_notes }}
                        </p>
                      </div>
                      
                      <div class="mt-2 flex items-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                          {{ source.source_type }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'competitor'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Competitive Landscape Analysis</h2>
              
              <div v-if="brief.content?.competitive_landscape_analysis" class="space-y-6">
                <div class="bg-gray-50 dark:bg-gray-700/40 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="prose dark:prose-invert max-w-none">
                    <div class="whitespace-pre-line text-gray-900 dark:text-white">{{ brief.content.competitive_landscape_analysis }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Fallback to legacy competitor insights if new analysis not available -->
              <div v-else-if="brief.content?.process_notes?.competitor_insights?.length" class="space-y-4">
                <div 
                  v-for="(insight, idx) in brief.content.process_notes.competitor_insights" 
                  :key="idx"
                  class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p class="text-gray-900 dark:text-white">{{ insight }}</p>
                </div>
              </div>
              
              <div v-else class="prose dark:prose-invert max-w-none">
                <p>{{ competitorAnalysisPlaceholder }}</p>
              </div>
            </div>

            <div v-else-if="activeTab === 'process'" class="space-y-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Process Notes & Analysis</h2>
              
              <div class="space-y-6">
                <!-- LLM Analysis Details -->
                <div v-if="brief.content?.process_notes?.debug_info?.full_llm_responses?.length">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    LLM Research Analysis
                  </h3>
                  <div class="space-y-4">
                    <div 
                      v-for="(response, idx) in brief.content.process_notes.debug_info.full_llm_responses" 
                      :key="idx"
                      class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-gray-900 dark:text-white">
                          {{ response.platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity' }} Query #{{ idx + 1 }}
                        </h4>
                        <span class="text-xs px-2 py-1 rounded-full" 
                          :class="response.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'">
                          {{ response.success ? 'Success' : 'Failed' }}
                        </span>
                      </div>
                      
                      <div class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Query:</strong> {{ response.query }}
                      </div>
                      
                      <div class="grid grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                          <strong>Response Length:</strong> {{ response.response_length?.toLocaleString() || 0 }} chars
                        </div>
                        <div>
                          <strong>Citations:</strong> {{ response.citations_count || 0 }}
                        </div>
                        <div>
                          <strong>Processing Time:</strong> {{ response.processing_time_ms || 0 }}ms
                        </div>
                      </div>
                      
                      <!-- Show first 300 chars of response for content gap analysis -->
                      <div v-if="response.full_response && response.success" class="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                        <h5 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Response Preview:</h5>
                        <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {{ response.full_response.substring(0, 300) }}{{ response.full_response.length > 300 ? '...' : '' }}
                        </p>
                      </div>
                      
                      <div v-if="response.error" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <p class="text-xs text-red-700 dark:text-red-400">Error: {{ response.error }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Fallback to simple queries if detailed data not available -->
                <div v-else>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    LLM Queries Used
                  </h3>
                  <div class="space-y-3">
                    <div 
                      v-for="(query, idx) in brief.content?.process_notes?.llm_responses || placeholderQueries" 
                      :key="idx"
                      class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p class="text-gray-900 dark:text-white text-sm font-medium">{{ query }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Content Gap Analysis -->
                <div v-if="brief.content?.process_notes?.debug_info?.search_analysis">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Content Gap Analysis
                  </h3>
                  <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong class="text-blue-800 dark:text-blue-400">Total Results:</strong><br>
                        <span class="text-gray-700 dark:text-gray-300">{{ brief.content.process_notes.debug_info.search_analysis.total_results }}</span>
                      </div>
                      <div>
                        <strong class="text-blue-800 dark:text-blue-400">Unique Domains:</strong><br>
                        <span class="text-gray-700 dark:text-gray-300">{{ brief.content.process_notes.debug_info.search_analysis.unique_domains }}</span>
                      </div>
                      <div>
                        <strong class="text-blue-800 dark:text-blue-400">Keywords Searched:</strong><br>
                        <span class="text-gray-700 dark:text-gray-300">{{ brief.content.process_notes.debug_info.search_analysis.keywords_searched?.join(', ') || 'N/A' }}</span>
                      </div>
                      <div>
                        <strong class="text-blue-800 dark:text-blue-400">Top Competitors:</strong><br>
                        <span class="text-gray-700 dark:text-gray-300">{{ brief.content.process_notes.debug_info.search_analysis.top_ranking_domains?.slice(0, 2).map(d => d.domain).join(', ') || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Search Results Analysis -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Search Results Analyzed
                  </h3>
                  <div class="space-y-3">
                    <div 
                      v-for="(result, idx) in brief.content?.process_notes?.search_results || placeholderSearchResults" 
                      :key="idx"
                      class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p class="text-gray-900 dark:text-white text-sm font-medium">{{ result }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- No Brief Found Error -->
    <div v-else-if="!isLoading && !brief" class="flex items-center justify-center py-32">
      <div class="text-center bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-8 max-w-md mx-4">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-red-600 dark:text-red-400 mb-4 font-medium">Brief not found or you don't have permission to view it</p>
        <NuxtLink to="/dashboard/actions/content-brief" class="px-6 py-2 bg-citebots-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          Back to Content Brief Generator
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

// Brief data
const isLoading = ref(true)
const error = ref(null)
const brief = ref(null)
const briefId = ref('')
const clientName = ref('Generic Brief')

// Tab navigation
const activeTab = ref('overview')
const tabs = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>`
    })
  },
  { 
    id: 'toc', 
    label: 'Table of Contents', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
    })
  },
  { 
    id: 'research', 
    label: 'Research Sources', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    })
  },
  { 
    id: 'statistics', 
    label: 'Quotable Statistics', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`
    })
  },
  { 
    id: 'competitor', 
    label: 'Competitor Analysis', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
    })
  },
  { 
    id: 'process', 
    label: 'Process Notes', 
    icon: defineComponent({
      template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    })
  }
]

// Placeholder content for fallback
const summaryPlaceholder = `This comprehensive guide on SEO for SaaS companies should be structured to address the specific challenges and opportunities in the SaaS industry. Based on our research and competitor analysis, we recommend focusing on the intersection of technical SEO principles and SaaS-specific strategies that drive organic visibility and user acquisition.

Content should prioritize actionable tactics while providing context on why these approaches work specifically for SaaS businesses. There's a notable gap in competitor content regarding SaaS-specific keyword research methodologies and analytics integration for measuring SEO effectiveness against activation and retention metrics.`

const placeholderSuggestions = [
  {
    suggestion: "Include a comparison table of SaaS-specific SEO metrics vs. traditional SEO metrics",
    importance: 9.8,
    rationale: "Competitors lack clear differentiation between general SEO metrics and those most relevant to SaaS businesses"
  },
  {
    suggestion: "Create a step-by-step framework for integrating product analytics with SEO data",
    importance: 9.7,
    rationale: "This addresses a major gap in existing content while providing significant value to decision-makers"
  },
  {
    suggestion: "Develop a section on leveraging product-led content for SEO authority",
    importance: 9.6,
    rationale: "Analysis shows this approach generates 3x more qualified leads than generic SEO content for SaaS companies"
  },
  {
    suggestion: "Include case studies from both B2B and B2C SaaS companies with actual metrics",
    importance: 9.5,
    rationale: "Competitor content relies heavily on theory without sufficient real-world validation and results"
  }
]

const placeholderTOC = [
  {
    title: "1. Introduction: Understanding SEO in the SaaS Context",
    points: [
      "Definition and importance of SEO specifically for SaaS companies",
      "How SaaS SEO differs from traditional SEO approaches",
      "Key challenges and opportunities unique to software-as-a-service businesses",
      "Setting realistic expectations and timeframes for SaaS SEO success"
    ]
  },
  {
    title: "2. Strategic Keyword Research for SaaS",
    points: [
      "Identifying high-intent keywords throughout the SaaS customer journey",
      "Balancing product feature keywords with problem-solution keywords",
      "Competitive keyword analysis specific to SaaS market segments",
      "Long-tail opportunity analysis for product-led content"
    ]
  },
  {
    title: "3. Technical SEO Foundations for SaaS Platforms",
    points: [
      "Site architecture best practices for complex SaaS products",
      "JavaScript SEO considerations for web applications",
      "API documentation and developer content optimization",
      "Managing dynamic content and user-generated areas"
    ]
  }
]

const placeholderResearch = [
  {
    title: "The 2025 SaaS SEO Benchmark Report",
    url: "https://example.com/saas-seo-benchmark-2025",
    description: "Contains valuable statistics on average conversion rates from organic search for SaaS companies across different price points",
    source_type: "research"
  },
  {
    title: "Product-Led SEO: A New Framework for SaaS Growth",
    url: "https://example.com/product-led-seo-framework",
    description: "Academic research showing the effectiveness of integrating product features directly into SEO content strategy",
    source_type: "academic"
  },
  {
    title: "Technical SEO for Modern Web Applications",
    url: "https://example.com/technical-seo-webapps",
    description: "Comprehensive guide on handling JavaScript frameworks, SPAs, and dynamic content for search engines",
    source_type: "industry"
  }
]

const placeholderQueries = [
  "What are the most effective SEO strategies specifically for SaaS companies in 2025?",
  "How do successful SaaS companies integrate product analytics with SEO metrics?",
  "What technical SEO challenges are unique to JavaScript-heavy SaaS applications?"
]

const placeholderSearchResults = [
  "Top 10 SaaS SEO Strategies for 2025 (example.com)",
  "The Ultimate Guide to SaaS Marketing (competitor1.com)",
  "Technical SEO for Modern Web Applications (example.org)",
  "Product-Led Growth & SEO: The Complete Guide (competitor2.com)"
]

const competitorAnalysisPlaceholder = `Our analysis of competitor content reveals several key opportunities:

1. Depth of Technical Content: Most competitors offer surface-level technical SEO advice that doesn't address the specific challenges of modern SaaS architectures. Their content rarely discusses JavaScript frameworks, API documentation optimization, or handling user authentication areas.

2. Integration with Product Metrics: Competitors focus on traditional SEO metrics (rankings, traffic) but fail to connect these to SaaS-specific metrics like activation rate, feature adoption, and retention - creating an opportunity for more sophisticated, integrated measurement approaches.

3. Content Gaps: Few competitors address the intersection of product-led growth and SEO strategies, particularly how product features can be leveraged as SEO assets. Additionally, most lack specific guidance on optimizing for different SaaS pricing models (freemium vs. enterprise).`

// Fetch brief data directly from Supabase
const fetchBrief = async (id) => {
  if (!id) {
    error.value = 'No brief ID provided';
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  brief.value = null;
  
  try {
    console.log('Fetching brief with ID:', id);
    briefId.value = id;
    
    // Get brief directly from Supabase
    const { data: briefData, error: briefFetchError } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (briefFetchError) throw briefFetchError;
    if (!briefData) throw new Error('Brief not found');
    
    console.log('Brief data from Supabase:', briefData);
    brief.value = briefData;
    
    // If we have a client ID, try to get client info
    if (briefData.client_id) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('name, domain')
        .eq('id', briefData.client_id)
        .single();
      
      if (!clientError && clientData) {
        clientName.value = clientData.name;
      }
    }
  } catch (err) {
    console.error('Error fetching brief:', err);
    error.value = err.message || 'Error fetching brief data';
  } finally {
    isLoading.value = false;
  }
};

// Action handlers
const copyToClipboard = () => {
  // Simple text export to clipboard
  const textContent = formatBriefAsText(brief.value);
  navigator.clipboard.writeText(textContent)
    .then(() => {
      alert('Brief copied to clipboard');
    })
    .catch(err => {
      error.value = 'Failed to copy to clipboard';
      console.error(err);
    });
};

const exportAsPdf = () => {
  // Simple HTML export (no actual PDF generation)
  const content = formatBriefAsHtml(brief.value);
  const blob = new Blob([content], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const print = () => {
  window.print();
};

const shareBrief = () => {
  // Implementation would generate a shareable link
  const shareUrl = `${window.location.origin}/dashboard/actions/content-brief/view-brief?id=${brief.value.id}`;
  navigator.clipboard.writeText(shareUrl)
    .then(() => {
      alert('Share link copied to clipboard: ' + shareUrl);
    })
    .catch(err => {
      error.value = 'Failed to copy share link';
      console.error(err);
    });
};

const copyStatistic = (stat) => {
  const text = `"${stat.statistic}" - ${stat.source}`;
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Statistic copied to clipboard');
    })
    .catch(err => {
      error.value = 'Failed to copy statistic';
      console.error(err);
    });
};

// Format brief as text for clipboard
function formatBriefAsText(brief) {
  let text = `# ${brief.title}\n\n`;
  
  text += `## Strategic Overview\n\n${brief.content?.strategic_overview || 'No strategic overview available'}\n\n`;
  
  if (brief.content?.brand_voice_guidelines) {
    text += `## Brand Voice Guidelines\n\n${brief.content.brand_voice_guidelines}\n\n`;
  }
  
  if (brief.content?.specificity_requirements) {
    text += `## Specificity Requirements\n\n${brief.content.specificity_requirements}\n\n`;
  }
  
  text += `## Quotable Statistics\n\n`;
  if (brief.content?.quotable_statistics?.length) {
    brief.content.quotable_statistics.forEach((stat, index) => {
      text += `${index+1}. "${stat.statistic}" - ${stat.source}\n`;
      text += `   Context: ${stat.context}\n\n`;
    });
  } else {
    text += 'No quotable statistics available\n\n';
  }
  
  if (brief.content?.content_differentiation) {
    text += `## Content Differentiation Strategy\n\n${brief.content.content_differentiation}\n\n`;
  }
  
  if (brief.content?.competitive_landscape_analysis) {
    text += `## Competitive Landscape Analysis\n\n${brief.content.competitive_landscape_analysis}\n\n`;
  }
  
  text += `## Table of Contents\n\n`;
  if (brief.content?.table_of_contents?.length) {
    brief.content.table_of_contents.forEach(section => {
      text += `${section.title}\n`;
      section.points.forEach(point => {
        text += `- ${point}\n`;
      });
      text += '\n';
    });
  } else {
    text += 'No table of contents available\n\n';
  }
  
  text += `## Research Links\n\n`;
  if (brief.content?.research_links?.length) {
    brief.content.research_links.forEach(link => {
      text += `- [${link.title}](${link.url})\n`;
      text += `  ${link.description}\n\n`;
    });
  } else {
    text += 'No research links available\n\n';
  }
  
  // Add process notes summary
  if (brief.content?.process_notes?.debug_info) {
    text += `## Generation Details\n\n`;
    const debugInfo = brief.content.process_notes.debug_info;
    
    if (debugInfo.processing_steps) {
      text += `### Processing Steps:\n`;
      debugInfo.processing_steps.forEach(step => {
        text += `- ${step.step}: ${step.status}\n`;
      });
      text += '\n';
    }
    
    if (debugInfo.full_llm_responses?.length) {
      text += `### Research Queries (${debugInfo.full_llm_responses.length} total):\n`;
      debugInfo.full_llm_responses.forEach((response, idx) => {
        text += `${idx + 1}. [${response.platform}] ${response.query}\n`;
        text += `   Response: ${response.response_length} chars, ${response.citations_count} citations\n\n`;
      });
    }
    
    if (debugInfo.page_analysis?.length) {
      text += `### Pages Analyzed (${debugInfo.page_analysis.length} total):\n`;
      debugInfo.page_analysis.forEach(page => {
        text += `- ${page.url} (${page.status}) - ${page.content_length} chars\n`;
      });
      text += '\n';
    }
  }
  
  text += `\nGenerated: ${new Date(brief.created_at).toLocaleString()}\n`;
  
  return text;
}

// Format brief as HTML for export
function formatBriefAsHtml(brief) {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${brief.title} - Content Brief</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 20px; }
        h3 { color: #777; }
        .suggestion { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .importance { display: inline-block; height: 10px; background: orange; border-radius: 5px; }
        .toc-section { margin-bottom: 20px; border-left: 3px solid orange; padding-left: 15px; }
        .link { margin-bottom: 10px; }
        .strategic-section { background: #f0f7ff; padding: 15px; margin: 15px 0; border-left: 4px solid #007acc; }
        .competitor-section { background: #fff7f0; padding: 15px; margin: 15px 0; border-left: 4px solid #ff6b35; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${brief.title}</h1>
      <p><strong>Generated:</strong> ${new Date(brief.created_at).toLocaleString()}</p>
      
      <h2>Strategic Overview</h2>
      <p>${brief.content?.strategic_overview || 'No strategic overview available'}</p>
      
      ${brief.content?.brand_voice_guidelines ? `<h2>Brand Voice Guidelines</h2><div class="strategic-section"><p style="white-space: pre-line;">${brief.content.brand_voice_guidelines}</p></div>` : ''}
      
      ${brief.content?.specificity_requirements ? `<h2>Specificity Requirements</h2><p style="white-space: pre-line;">${brief.content.specificity_requirements}</p>` : ''}
      
      ${brief.content?.content_differentiation ? `<h2>Content Differentiation Strategy</h2><p style="white-space: pre-line;">${brief.content.content_differentiation}</p>` : ''}
      
      ${brief.content?.competitive_landscape_analysis ? `<h2>Competitive Landscape Analysis</h2><div style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b35; margin: 10px 0;">${brief.content.competitive_landscape_analysis}</div>` : ''}
      
      <h2>Quotable Statistics</h2>
  `;
  
  if (brief.content?.quotable_statistics?.length) {
    brief.content.quotable_statistics.forEach((stat, index) => {
      html += `
        <div class="suggestion">
          <h3>"${stat.statistic}"</h3>
          <p><strong>Source:</strong> ${stat.source}</p>
          <p><strong>Context:</strong> ${stat.context}</p>
        </div>
      `;
    });
  } else {
    html += `<p>No quotable statistics available</p>`;
  }
  
  html += `<h2>Table of Contents</h2>`;
  
  if (brief.content?.table_of_contents?.length) {
    brief.content.table_of_contents.forEach(section => {
      html += `
        <div class="toc-section">
          <h3>${section.title}</h3>
          <ul>
      `;
      
      section.points.forEach(point => {
        html += `<li>${point}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    });
  } else {
    html += `<p>No table of contents available</p>`;
  }
  
  html += `<h2>Research Links</h2>`;
  
  if (brief.content?.research_links?.length) {
    brief.content.research_links.forEach(link => {
      html += `
        <div class="link">
          <p><a href="${link.url}" target="_blank">${link.title}</a></p>
          <p>${link.description}</p>
          <p><small>${link.source_type}</small></p>
        </div>
      `;
    });
  } else {
    html += `<p>No research links available</p>`;
  }
  
  // Add process notes for detailed export
  if (brief.content?.process_notes) {
    html += `<h2>Process Notes & Debug Information</h2>`;
    
    if (brief.content.process_notes.debug_info) {
      const debugInfo = brief.content.process_notes.debug_info;
      
      html += `<h3>Generation Statistics</h3>`;
      html += `<ul>`;
      if (debugInfo.processing_steps) {
        debugInfo.processing_steps.forEach(step => {
          html += `<li><strong>${step.step}:</strong> ${step.status} ${step.timing ? `(${JSON.stringify(step.timing)})` : ''}</li>`;
        });
      }
      html += `</ul>`;
      
      if (debugInfo.full_llm_responses?.length) {
        html += `<h3>LLM Research Responses</h3>`;
        debugInfo.full_llm_responses.forEach((response, idx) => {
          html += `
            <div style="border: 1px solid #ddd; margin: 10px 0; padding: 10px;">
              <h4>${response.platform} Query ${idx + 1}</h4>
              <p><strong>Query:</strong> ${response.query}</p>
              <p><strong>Response Length:</strong> ${response.response_length} characters</p>
              <p><strong>Citations:</strong> ${response.citations_count}</p>
              <p><strong>Status:</strong> ${response.success ? 'Success' : 'Failed'}</p>
            </div>
          `;
        });
      }
      
      if (debugInfo.page_analysis?.length) {
        html += `<h3>Page Analysis Results</h3>`;
        html += `<table border="1" style="width: 100%; border-collapse: collapse;">`;
        html += `<tr><th>URL</th><th>Status</th><th>Title</th><th>Content Length</th></tr>`;
        debugInfo.page_analysis.forEach(page => {
          html += `<tr><td>${page.url}</td><td>${page.status}</td><td>${page.title}</td><td>${page.content_length}</td></tr>`;
        });
        html += `</table>`;
      }
    }
  }
  
  html += `
      <footer>
        Generated by Citebots Brief Generator on ${new Date().toLocaleDateString()}
      </footer>
    </body>
    </html>
  `;
  
  return html;
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Fetch data on mount
onMounted(() => {
  const id = route.query.id;
  if (id) {
    fetchBrief(id.toString());
  }
});
</script>

<style scoped>
/* Print styles */
@media print {
  button, .btn-primary-sm, .btn-secondary-sm {
    display: none;
  }
}
</style>