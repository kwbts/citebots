<!-- components/labs/reports/TotalQueriesMetric.vue -->
<template>
  <div class="metric-container bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 rounded-lg shadow-lg">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Number of Queries Analyzed</h3>
    
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
    
    <!-- Animated Counter -->
    <div class="flex items-center space-x-6">
      <div class="relative" style="min-width: 130px;">
        <div class="text-5xl font-bold text-transparent bg-clip-text" :class="getPlatformGradientClass()">
          <animated-number :value="getQueryCount()" :duration="1000" />
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">Total queries analyzed</div>
      </div>
      
      <!-- Small Query Generation Graphic -->
      <div class="hidden md:block">
        <svg class="w-24 h-24 text-gray-400 dark:text-gray-600" viewBox="0 0 100 100">
          <g fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- Keywords to Queries Flow -->
            <rect x="15" y="20" width="25" height="15" rx="2" class="text-gray-400 dark:text-gray-500" fill="currentColor" opacity="0.3" />
            <rect x="15" y="43" width="25" height="15" rx="2" class="text-gray-400 dark:text-gray-500" fill="currentColor" opacity="0.3" />
            <rect x="15" y="66" width="25" height="15" rx="2" class="text-gray-400 dark:text-gray-500" fill="currentColor" opacity="0.3" />
            
            <!-- Flow Arrows -->
            <path d="M45 27.5 H55 L65 43" stroke-dasharray="2" />
            <path d="M45 50.5 H60 L65 50.5" stroke-dasharray="2" />
            <path d="M45 73.5 H55 L65 58" stroke-dasharray="2" />
            
            <!-- Query Formation -->
            <rect x="70" y="35" width="20" height="30" rx="4" stroke-width="2" class="text-black dark:text-white" :class="getPlatformStrokeClass()" />
            <line x1="75" y1="45" x2="85" y2="45" stroke-width="2" class="text-black dark:text-white" :class="getPlatformStrokeClass()" />
            <line x1="75" y1="50" x2="85" y2="50" stroke-width="2" class="text-black dark:text-white" :class="getPlatformStrokeClass()" />
            <line x1="75" y1="55" x2="83" y2="55" stroke-width="2" class="text-black dark:text-white" :class="getPlatformStrokeClass()" />
          </g>
        </svg>
      </div>
    </div>
    
    <!-- Platform Breakdown - Always visible regardless of active platform -->
    <div class="mt-6">
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Platform Breakdown</div>
      <div class="flex items-center mb-2">
        <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="flex">
            <div 
              class="h-4 bg-green-500" 
              :style="`width: ${getChatGPTPercentage()}%`"
            ></div>
            <div 
              class="h-4 bg-desaturatedTeal" 
              :style="`width: ${getPerplexityPercentage()}%`"
            ></div>
          </div>
        </div>
      </div>
      <div class="flex text-xs text-gray-500 dark:text-gray-400 justify-between">
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          ChatGPT ({{ getChatGPTCount() }})
        </div>
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full bg-desaturatedTeal mr-1"></span>
          Perplexity ({{ getPerplexityCount() }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AnimatedNumber from './utils/AnimatedNumber.vue';

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

// Helper method to get platform-specific styling classes for indicator dots
const getPlatformDotClass = (platform) => {
  switch(platform) {
    case 'all':
      return 'bg-orange-500';
    case 'chatgpt':
      return 'bg-green-500';
    case 'perplexity':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper method to get platform-specific gradient text classes
const getPlatformGradientClass = () => {
  return 'bg-gradient-to-r from-burntOrangeDark to-jasperOrange';
};

// Helper method to get platform-specific stroke classes for the SVG
const getPlatformStrokeClass = () => {
  return 'stroke-burntOrangeDark';
};

// Get query counts based on the selected platform
const getQueryCount = () => {
  if (!props.reportData || !props.reportData.total_queries) return 0;
  
  if (activePlatform.value === 'all') {
    return props.reportData.total_queries || countAllQueries();
  } else if (activePlatform.value === 'chatgpt') {
    return getChatGPTCount();
  } else if (activePlatform.value === 'perplexity') {
    return getPerplexityCount();
  }
  
  return 0;
};

// Counts all queries across all data
const countAllQueries = () => {
  if (!props.reportData) return 0;
  return props.reportData.total_queries || 0;
};

// Get actual count of ChatGPT queries from data
const getChatGPTCount = () => {
  if (!props.reportData || !props.reportData.clients) return 0;
  
  let count = 0;
  // Count queries specifically from ChatGPT
  props.reportData.clients.forEach(client => {
    if (client.query_data) {
      client.query_data.forEach(query => {
        if (query.query_metrics && 
            query.query_metrics.data_source && 
            query.query_metrics.data_source.toLowerCase() === 'chatgpt') {
          count++;
        }
      });
    }
  });
  
  return count;
};

// Get actual count of Perplexity queries from data
const getPerplexityCount = () => {
  if (!props.reportData || !props.reportData.clients) return 0;
  
  let count = 0;
  // Count queries specifically from Perplexity
  props.reportData.clients.forEach(client => {
    if (client.query_data) {
      client.query_data.forEach(query => {
        if (query.query_metrics && 
            query.query_metrics.data_source && 
            query.query_metrics.data_source.toLowerCase() === 'perplexity') {
          count++;
        }
      });
    }
  });
  
  return count;
};

// Calculate ChatGPT percentage of total
const getChatGPTPercentage = () => {
  const total = countAllQueries();
  if (total === 0) return 0;
  
  return (getChatGPTCount() / total) * 100;
};

// Calculate Perplexity percentage of total
const getPerplexityPercentage = () => {
  const total = countAllQueries();
  if (total === 0) return 0;
  
  return (getPerplexityCount() / total) * 100;
};
</script>

<style scoped>
.metric-container {
  min-height: 200px;
}

/* Add any additional custom styles here */
</style>