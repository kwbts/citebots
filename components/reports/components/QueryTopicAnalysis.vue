<template>
  <div class="query-topic-analysis bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-teal-50 dark:bg-teal-500/10 border border-teal-200/50 dark:border-teal-500/20 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Topic Cluster Analysis</h3>
      </div>
      
      <!-- Metric filter dropdown -->
      <div class="relative">
        <select
          v-model="sortMetric"
          class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        >
          <option value="queries">Sort by Query Count</option>
          <option value="mentionRate">Sort by Mention Rate</option>
          <option value="citations">Sort by Citation Count</option>
          <option value="eeatScore">Sort by EEAT Score</option>
          <option value="contentDepth">Sort by Content Depth</option>
          <option value="contentUniqueness">Sort by Content Uniqueness</option>
          <option value="citationMatch">Sort by Citation Match</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Table for Topic Analysis -->
    <div class="overflow-x-auto max-h-[500px]">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              @click="sortBy('name')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Topic
                <svg v-if="sortField === 'name'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortBy('queries')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Queries
                <svg v-if="sortField === 'queries'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortBy('mentionRate')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Brand Mention Rate
                <svg v-if="sortField === 'mentionRate'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortBy('citations')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center">
                Citations
                <svg v-if="sortField === 'citations'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </div>
            </th>
            <th
              @click="sortBy('pageQuality')"
              class="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/25"
            >
              <div class="flex items-center group relative">
                Page Quality
                <svg v-if="sortField === 'pageQuality'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
                <div class="absolute hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 w-48 text-xs -left-16 top-6">
                  <p class="mb-1 text-gray-700 dark:text-gray-300">Average of:</p>
                  <ul class="list-disc pl-4 text-gray-600 dark:text-gray-400">
                    <li>EEAT Score</li>
                    <li>Content Depth</li>
                    <li>Content Uniqueness</li>
                    <li>Citation Match</li>
                  </ul>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <template v-for="(topic, index) in sortedTopics" :key="index">
            <!-- Topic Row -->
            <tr
              @click="toggleExpand(topic.name)"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/25 transition-colors cursor-pointer"
            >
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex items-start">
                  <svg
                    class="w-4 h-4 mr-2 text-gray-400 transition-transform duration-200 flex-shrink-0 mt-0.5"
                    :class="{ 'rotate-90': expandedTopics.includes(topic.name) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <div class="font-medium">{{ formatTopicName(topic.name) }}</div>
                </div>
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ topic.queries.length }}</td>
              <td class="p-3 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-orange-500 dark:bg-orange-600 rounded-full" :style="`width: ${topic.mentionRate}%`"></div>
                  </div>
                  <span class="text-gray-700 dark:text-gray-300">{{ topic.mentionRate }}%</span>
                </div>
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ topic.citations }}</td>
              <td class="p-3 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-teal-500 dark:bg-teal-600 rounded-full" :style="`width: ${(topic.pageQuality / 5) * 100}%`"></div>
                  </div>
                  <span :class="getScoreColorClass(topic.pageQuality)">{{ topic.pageQuality.toFixed(1) }}</span>
                </div>
              </td>
            </tr>

            <!-- Expanded Content Row -->
            <tr v-if="expandedTopics.includes(topic.name)" class="bg-gray-50 dark:bg-gray-800/50">
              <td colspan="5" class="p-0">
                <div class="p-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
                  <!-- Topic Details Section -->
                  <div class="space-y-6">
                    <!-- Page Quality Metrics Summary -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div class="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">EEAT Score</div>
                        <div class="flex items-center gap-2">
                          <span class="text-base font-medium" :class="getScoreColorClass(topic.eeatScore)">{{ topic.eeatScore.toFixed(1) }}</span>
                          <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 dark:bg-blue-600 rounded-full" :style="`width: ${(topic.eeatScore / 5) * 100}%`"></div>
                          </div>
                        </div>
                      </div>
                      <div class="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Depth</div>
                        <div class="flex items-center gap-2">
                          <span class="text-base font-medium" :class="getScoreColorClass(topic.contentDepth)">{{ topic.contentDepth.toFixed(1) }}</span>
                          <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-purple-500 dark:bg-purple-600 rounded-full" :style="`width: ${(topic.contentDepth / 5) * 100}%`"></div>
                          </div>
                        </div>
                      </div>
                      <div class="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Uniqueness</div>
                        <div class="flex items-center gap-2">
                          <span class="text-base font-medium" :class="getScoreColorClass(topic.contentUniqueness)">{{ topic.contentUniqueness.toFixed(1) }}</span>
                          <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 dark:bg-indigo-600 rounded-full" :style="`width: ${(topic.contentUniqueness / 5) * 100}%`"></div>
                          </div>
                        </div>
                      </div>
                      <div class="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Citation Match</div>
                        <div class="flex items-center gap-2">
                          <span class="text-base font-medium" :class="getScoreColorClass(topic.citationMatch)">{{ topic.citationMatch.toFixed(1) }}</span>
                          <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full" :style="`width: ${(topic.citationMatch / 5) * 100}%`"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Queries in this Topic -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Related Queries</h4>
                      <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div class="overflow-x-auto">
                          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Query</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand Mentioned</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Citations</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                              <tr v-for="query in topic.queries.slice(0, 5)" :key="query.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/25">
                                <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-xs truncate">{{ query.query_text }}</td>
                                <td class="px-3 py-2 text-xs">
                                  <span v-if="query.brand_mentioned && query.brand_mention_type !== 'implicit'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">Yes</span>
                                  <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">No</span>
                                </td>
                                <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{{ query.citation_count || 0 }}</td>
                                <td class="px-3 py-2 text-xs">
                                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="getPlatformClass(query.data_source)">
                                    {{ formatPlatformName(query.data_source) }}
                                  </span>
                                </td>
                              </tr>
                              <tr v-if="topic.queries.length > 5">
                                <td colspan="4" class="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                                  And {{ topic.queries.length - 5 }} more queries...
                                </td>
                              </tr>
                              <tr v-if="topic.queries.length === 0">
                                <td colspan="4" class="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                                  No queries found for this topic.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Top Pages Section -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Pages</h4>
                      <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div class="overflow-x-auto">
                          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EEAT</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Depth</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uniqueness</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Match</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                              <tr v-for="page in topic.pages.slice(0, 5)" :key="page.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/25">
                                <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                  <a :href="page.citation_url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                                    {{ formatUrl(page.citation_url) }}
                                  </a>
                                  <span v-if="page.is_client_domain" class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300">
                                    Brand
                                  </span>
                                </td>
                                <td class="px-3 py-2 text-xs">
                                  <span :class="getScoreColorClass(page.content_quality?.eeat_score || 0)">
                                    {{ page.content_quality?.eeat_score || 'N/A' }}
                                  </span>
                                </td>
                                <td class="px-3 py-2 text-xs">
                                  <span :class="getScoreColorClass(page.content_quality?.content_depth_score || 0)">
                                    {{ page.content_quality?.content_depth_score || 'N/A' }}
                                  </span>
                                </td>
                                <td class="px-3 py-2 text-xs">
                                  <span :class="getScoreColorClass(page.content_quality?.content_uniqueness || 0)">
                                    {{ page.content_quality?.content_uniqueness || 'N/A' }}
                                  </span>
                                </td>
                                <td class="px-3 py-2 text-xs">
                                  <span :class="getScoreColorClass(page.content_quality?.citation_match_quality || 0)">
                                    {{ page.content_quality?.citation_match_quality || 'N/A' }}
                                  </span>
                                </td>
                              </tr>
                              <tr v-if="topic.pages.length > 5">
                                <td colspan="5" class="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                                  And {{ topic.pages.length - 5 }} more pages...
                                </td>
                              </tr>
                              <tr v-if="topic.pages.length === 0">
                                <td colspan="5" class="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400">
                                  No pages found for this topic.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-if="sortedTopics.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 dark:text-gray-400">
              No topic data available.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// UI state
const expandedTopics = ref([])
const sortMetric = ref('queries')
const sortField = ref('queries')
const sortDirection = ref('desc')

// Toggle expanded state for a topic
const toggleExpand = (topicName) => {
  const index = expandedTopics.value.indexOf(topicName)
  if (index === -1) {
    expandedTopics.value.push(topicName)
  } else {
    expandedTopics.value.splice(index, 1)
  }
}

// Process data to group by query_topic
const topicData = computed(() => {
  const queries = props.data?.analysis_queries || []
  const pageAnalyses = props.data?.page_analyses || []
  
  // Group queries by topic
  const topics = {}
  
  // Process queries
  queries.forEach(query => {
    const topic = query.query_topic || 'Uncategorized'
    
    if (!topics[topic]) {
      topics[topic] = {
        name: topic,
        queries: [],
        brandMentions: 0,
        citations: 0,
        pages: [],
        // Initialize scores
        eeatScore: 0,
        contentDepth: 0, 
        contentUniqueness: 0,
        citationMatch: 0,
        pageQuality: 0,
        // Track processed pages to avoid duplicates
        processedPageIds: new Set()
      }
    }
    
    // Add query to topic and update brand mentions
    topics[topic].queries.push(query)
    if (query.brand_mentioned && query.brand_mention_type !== 'implicit') {
      topics[topic].brandMentions++
    }
    
    // Process associated pages
    if (query.associated_pages && Array.isArray(query.associated_pages)) {
      query.associated_pages.forEach(page => {
        if (page && page.id && !topics[topic].processedPageIds.has(page.id)) {
          topics[topic].processedPageIds.add(page.id)
          topics[topic].pages.push(page)
          
          // Update citation count
          topics[topic].citations++
          
          // Add page quality metrics
          if (page.content_quality) {
            topics[topic].eeatScore += page.content_quality.eeat_score || 0
            topics[topic].contentDepth += page.content_quality.content_depth_score || 0
            topics[topic].contentUniqueness += page.content_quality.content_uniqueness || 0
            topics[topic].citationMatch += page.content_quality.citation_match_quality || 0
          }
        }
      })
    }
    
    // Also check page_analyses that match this query
    const queryPages = pageAnalyses.filter(page => page.query_id === query.id)
    queryPages.forEach(page => {
      if (page && page.id && !topics[topic].processedPageIds.has(page.id)) {
        topics[topic].processedPageIds.add(page.id)
        topics[topic].pages.push(page)
        
        // Update citation count
        topics[topic].citations++
        
        // Add page quality metrics
        if (page.content_quality) {
          topics[topic].eeatScore += page.content_quality.eeat_score || 0
          topics[topic].contentDepth += page.content_quality.content_depth_score || 0
          topics[topic].contentUniqueness += page.content_quality.content_uniqueness || 0
          topics[topic].citationMatch += page.content_quality.citation_match_quality || 0
        }
      }
    })
  })
  
  // Calculate averages and rates for each topic
  Object.values(topics).forEach(topic => {
    // Calculate brand mention rate
    topic.mentionRate = topic.queries.length > 0 
      ? Math.round((topic.brandMentions / topic.queries.length) * 100) 
      : 0
      
    // Calculate averages for page metrics
    const pageCount = topic.pages.length || 1 // Avoid division by zero
    topic.eeatScore = topic.eeatScore / pageCount
    topic.contentDepth = topic.contentDepth / pageCount
    topic.contentUniqueness = topic.contentUniqueness / pageCount
    topic.citationMatch = topic.citationMatch / pageCount
    
    // Calculate overall page quality (average of all metrics)
    topic.pageQuality = (topic.eeatScore + topic.contentDepth + topic.contentUniqueness + topic.citationMatch) / 4
    
    // Clean up the processed pages set as it's no longer needed
    delete topic.processedPageIds
  })
  
  return Object.values(topics)
})

// Sort topics based on selected metric and column clicks
const sortedTopics = computed(() => {
  let result = [...topicData.value]

  // Function to handle sorting based on direction
  const sortByField = (field, a, b) => {
    // Get values based on field
    let aValue, bValue;

    // Special handling for queries field which is an array
    if (field === 'queries') {
      aValue = a.queries.length
      bValue = b.queries.length
    } else if (field === 'name') {
      aValue = a.name.toLowerCase()
      bValue = b.name.toLowerCase()
      // String comparison
      return sortDirection.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      aValue = a[field]
      bValue = b[field]
    }

    // Numerical comparison
    return sortDirection.value === 'asc'
      ? aValue - bValue
      : bValue - aValue
  }

  // First apply dropdown filter sorting
  switch (sortMetric.value) {
    case 'mentionRate':
      result.sort((a, b) => sortByField('mentionRate', a, b))
      break
    case 'citations':
      result.sort((a, b) => sortByField('citations', a, b))
      break
    case 'eeatScore':
      result.sort((a, b) => sortByField('eeatScore', a, b))
      break
    case 'contentDepth':
      result.sort((a, b) => sortByField('contentDepth', a, b))
      break
    case 'contentUniqueness':
      result.sort((a, b) => sortByField('contentUniqueness', a, b))
      break
    case 'citationMatch':
      result.sort((a, b) => sortByField('citationMatch', a, b))
      break
    default:
      // If no dropdown filter is selected, use the column sort
      if (sortField.value) {
        result.sort((a, b) => sortByField(sortField.value, a, b))
      } else {
        // Default sort by query count
        result.sort((a, b) => b.queries.length - a.queries.length)
      }
  }

  return result
})

// Sort function for column headers
const sortBy = (field) => {
  // If clicking the same field, toggle direction
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New field, default to descending (showing highest values first)
    sortField.value = field
    sortDirection.value = 'desc'
  }

  // Update the dropdown to match the column selection
  if (['mentionRate', 'citations', 'queries'].includes(field)) {
    sortMetric.value = field
  } else if (field === 'pageQuality') {
    sortMetric.value = 'queries' // Default to queries when sorting by pageQuality
  } else {
    sortMetric.value = 'queries' // Default to queries for other fields
  }
}

// Helper functions
const formatTopicName = (topic) => {
  if (!topic) return 'Uncategorized'
  // Replace underscores with spaces and capitalize
  return topic.charAt(0).toUpperCase() + 
    topic.slice(1).toLowerCase().replace(/_/g, ' ')
}

const formatUrl = (url) => {
  if (!url) return 'Unknown URL'
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '')
  } catch (e) {
    return url.substring(0, 30) + (url.length > 30 ? '...' : '')
  }
}

const getScoreColorClass = (score) => {
  if (score >= 4) return 'text-green-600 dark:text-green-400'
  if (score >= 3) return 'text-blue-600 dark:text-blue-400'
  if (score >= 2) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const formatPlatformName = (platform) => {
  if (!platform) return 'Unknown'
  
  const nameMap = {
    'chatgpt': 'ChatGPT',
    'perplexity': 'Perplexity',
    'claude': 'Claude',
    'bard': 'Bard',
    'gemini': 'Gemini'
  }
  
  return nameMap[platform.toLowerCase()] || platform
}

const getPlatformClass = (platform) => {
  const classMap = {
    'chatgpt': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    'perplexity': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    'claude': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
    'bard': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    'gemini': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
  }
  
  return classMap[platform?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}
</script>

<style scoped>
.query-topic-analysis {
  position: relative;
  min-height: 350px;
}

.query-topic-analysis:hover {
  transform: translateY(-2px);
}

/* Animation for expanding rows */
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out forwards;
  overflow: hidden;
}
</style>