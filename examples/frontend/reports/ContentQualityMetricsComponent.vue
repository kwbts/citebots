<!-- components/labs/reports/ContentQualityMetricsComponent.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Content Quality Metrics</h3>
      
      <TextBox>
        We used an AI assistant to review each citation URL to provide scores for content quality metrics. The AI read the content on page and then assigned it a score based on our guidelines.
      </TextBox>
      
      <!-- Platform Selector -->
      <div class="flex mb-6">
        <button 
          v-for="platform in platforms" 
          :key="platform.value"
          @click="activePlatform = platform.value" 
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="getPlatformButtonClass(platform.value)"
        >
          <div class="flex items-center">
            {{ platform.label }}
          </div>
        </button>
      </div>
      
      <!-- 2x2 Grid of Gauge Visualizations -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Content Depth Score -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Content Depth Score</h4>
          
          <div class="relative w-36 h-36 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="10"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(getMetricValue('contentDepth'), 10)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out"
              />
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ getMetricValue('contentDepth').toFixed(1) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 10</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Measures how thoroughly content covers the topic, including depth of information and comprehensiveness.
          </p>
        </div>
        
        <!-- Citation Match Quality -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Citation Match Quality</h4>
          
          <div class="relative w-36 h-36 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="10"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(getMetricValue('citationMatch'), 10)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out"
              />
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ getMetricValue('citationMatch').toFixed(1) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 10</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Evaluates how well the content answers the specific query or fulfills the information need.
          </p>
        </div>
        
        <!-- Content Uniqueness -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Content Uniqueness</h4>
          
          <div class="relative w-36 h-36 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="10"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(getMetricValue('contentUniqueness'), 10)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out"
              />
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ getMetricValue('contentUniqueness').toFixed(1) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 10</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Assesses how original the content is compared to similar resources in the same topic area.
          </p>
        </div>
        
        <!-- Readability Score -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Readability Score</h4>
          
          <div class="relative w-36 h-36 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="10"
                stroke-linecap="round"
                class="dark:stroke-gray-700"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateStrokeDashOffset(getMetricValue('readability'), 10)"
                transform="rotate(-90 50 50)"
                class="transition-all duration-700 ease-in-out"
              />
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ getMetricValue('readability').toFixed(1) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 10</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Measures how easy the content is to read and understand, factoring in sentence structure and complexity.
          </p>
        </div>
      </div>
      
      <!-- Key Insight -->
      <div class="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h5 class="text-sm font-medium text-indigo-800 dark:text-indigo-300">Key Insight</h5>
            <p class="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
              <span v-if="activePlatform === 'all'">
                Pages cited by LLMs score highest in citation match quality ({{ getMetricValue('citationMatch').toFixed(1) }}/10) and readability 
                ({{ getMetricValue('readability').toFixed(1) }}/10), suggesting that LLMs favor content that directly answers queries 
                in clear, accessible language over highly unique or exhaustive content.
              </span>
              <span v-else-if="activePlatform === 'chatgpt'">
                ChatGPT-cited pages score highest in readability ({{ getMetricValue('readability').toFixed(1) }}/10) and citation match quality 
                ({{ getMetricValue('citationMatch').toFixed(1) }}/10), suggesting that ChatGPT emphasizes accessible content that addresses queries directly.
              </span>
              <span v-else-if="activePlatform === 'perplexity'">
                Perplexity-cited pages excel in citation match quality ({{ getMetricValue('citationMatch').toFixed(1) }}/10) and content depth 
                ({{ getMetricValue('contentDepth').toFixed(1) }}/10), suggesting Perplexity may prioritize comprehensive information that directly answers queries.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import TextBox from './TextBox.vue';
  
  const props = defineProps({
    reportData: {
      type: Object,
      required: true
    }
  });
  
  // Platform selection options
  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'perplexity', label: 'Perplexity' }
  ];
  
  const activePlatform = ref('all');
  
  // No fallback data needed - rely entirely on API response
  
  // Helper method to get platform-specific styling classes for buttons
  const getPlatformButtonClass = (platform) => {
    if (activePlatform.value === platform) {
      switch(platform) {
        case 'all':
          return 'bg-gradient-to-r from-burntOrangeDark to-jasperOrange text-white';
        case 'chatgpt':
          return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        case 'perplexity':
          return 'bg-gradient-to-r from-desaturatedTeal to-mutedTeal text-white';
        default:
          return 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white';
      }
    }
    return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300';
  };
  
  // Helper method is no longer needed as dots have been removed
  const getPlatformDotClass = (platform) => {
    return 'bg-burntOrangeDark';
  };
  
  // Calculate metrics from the report data
  const calculateMetrics = () => {
    if (!props.reportData || !props.reportData.clients) {
      return {
        contentDepth: 0,
        citationMatch: 0,
        contentUniqueness: 0,
        readability: 0
      };
    }
    
    const allPages = [];
    let totalPages = 0;
    
    // Filter pages based on platform if needed
    props.reportData.clients.forEach(client => {
      if (client.query_data) {
        client.query_data.forEach(query => {
          // Skip if we're filtering by platform and it doesn't match
          if (activePlatform.value !== 'all') {
            // Check if this is the platform we want (based on query_metrics.data_source)
            if (query.query_metrics && 
                query.query_metrics.data_source && 
                query.query_metrics.data_source.toLowerCase() !== activePlatform.value.toLowerCase()) {
              return;
            }
          }
          
          if (query.associated_pages) {
            allPages.push(...query.associated_pages);
            totalPages += query.associated_pages.length;
          }
        });
      }
    });
    
    // Calculate average values for each metric
    let contentDepthTotal = 0;
    let citationMatchTotal = 0;
    let contentUniquenessTotal = 0;
    let readabilityTotal = 0;
    let countDepth = 0;
    let countCitation = 0;
    let countUniqueness = 0;
    let countReadability = 0;
    
    allPages.forEach(page => {
      // Content Depth Score
      if (page.content_depth_score !== undefined && !isNaN(parseFloat(page.content_depth_score))) {
        contentDepthTotal += parseFloat(page.content_depth_score);
        countDepth++;
      }
      
      // Citation Match Quality
      if (page.citation_match_quality !== undefined && !isNaN(parseFloat(page.citation_match_quality))) {
        citationMatchTotal += parseFloat(page.citation_match_quality);
        countCitation++;
      }
      
      // Content Uniqueness
      if (page.content_uniqueness !== undefined && !isNaN(parseFloat(page.content_uniqueness))) {
        contentUniquenessTotal += parseFloat(page.content_uniqueness);
        countUniqueness++;
      }
      
      // Readability Score
      if (page.readability_score !== undefined && !isNaN(parseFloat(page.readability_score))) {
        readabilityTotal += parseFloat(page.readability_score);
        countReadability++;
      }
    });
    
    // Calculate averages directly from data - no fallbacks
    return {
      contentDepth: countDepth > 0 ? contentDepthTotal / countDepth : 0,
      citationMatch: countCitation > 0 ? citationMatchTotal / countCitation : 0,
      contentUniqueness: countUniqueness > 0 ? contentUniquenessTotal / countUniqueness : 0,
      readability: countReadability > 0 ? readabilityTotal / countReadability : 0
    };
  };
  
  // Reactive computed property that calculates all metrics for the active platform
  const activeMetrics = computed(() => {
    return calculateMetrics();
  });
  
  // Get metric value by name for the active platform
  const getMetricValue = (metricName) => {
    return activeMetrics.value[metricName] || 0;
  };
  
  // Calculate stroke-dashoffset for circular progress
  const calculateStrokeDashOffset = (value, maxValue) => {
    const circumference = 282.7; // 2 * PI * radius (45)
    const percentage = (value / maxValue) * 100;
    return circumference - (circumference * percentage / 100);
  };
  </script>
  
  <style scoped>
  /* Add any custom styles if needed */
  </style>