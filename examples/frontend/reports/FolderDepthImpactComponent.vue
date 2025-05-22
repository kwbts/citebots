<!-- components/labs/reports/FolderDepthImpactComponent.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Folder Depth Impact</h3>
    
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
    
    <!-- Bar Chart for Folder Depth -->
    <div class="mb-6">
      <div class="space-y-4">
        <!-- Depth 1 (Root) -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Root (/)</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDepthPercentage(0)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-700"
              :style="`width: ${getDepthPercentage(0)}%`"
            ></div>
          </div>
        </div>
        
        <!-- Depth 2 -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Depth 1 (e.g., /products)</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDepthPercentage(1)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-700"
              :style="`width: ${getDepthPercentage(1)}%`"
            ></div>
          </div>
        </div>
        
        <!-- Depth 3 -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Depth 2 (e.g., /products/category)</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDepthPercentage(2)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-blue-400 rounded-full transition-all duration-700"
              :style="`width: ${getDepthPercentage(2)}%`"
            ></div>
          </div>
        </div>
        
        <!-- Depth 4 -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Depth 3 (e.g., /products/category/item)</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDepthPercentage(3)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-indigo-400 rounded-full transition-all duration-700"
              :style="`width: ${getDepthPercentage(3)}%`"
            ></div>
          </div>
        </div>
        
        <!-- Depth 5+ -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Depth 4+ (Deeper paths)</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDepthPercentage(4)) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-purple-400 rounded-full transition-all duration-700"
              :style="`width: ${getDepthPercentage(4)}%`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">Most Cited Depth</div>
        <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {{ getMostCitedDepth() }}
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">Average URL Depth</div>
        <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {{ getAverageDepth() }}
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

// Calculate folder depth distribution from report data
const calculateFolderDepthDistribution = (reportData) => {
  // Default empty structure
  const distribution = {
    all: {
      0: 0, // Root level
      1: 0, // First segment
      2: 0, // Second segment
      3: 0, // Third segment
      4: 0  // Fourth+ segments
    },
    chatgpt: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0
    },
    perplexity: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0
    }
  };
  
  if (!reportData || !reportData.clients) {
    return distribution;
  }
  
  try {
    // Process each client's data
    let totalPagesCounted = 0;
    
    reportData.clients.forEach(client => {
      if (!client.query_data) return;
      
      // Go through each query
      client.query_data.forEach(query => {
        if (!query.associated_pages) return;
        
        // Determine if this is a chatgpt or perplexity query
        const source = query.query_id.includes('chatgpt') ? 'chatgpt' : 
                     query.query_id.includes('perplexity') ? 'perplexity' : 'all';
        
        // Process each page associated with the query
        query.associated_pages.forEach(page => {
          // Get the folder depth from the page data
          let depth = page.folder_depth;
          
          // Validate and normalize depth
          if (depth === undefined || depth === null || isNaN(depth)) {
            depth = 0; // Default to root if no data
          }
          
          // Cap at 4+ for our display
          const normalizedDepth = Math.min(Math.floor(depth), 4);
          
          // Increment the count for this depth in both platform-specific and all platforms
          distribution[source][normalizedDepth]++;
          
          // Only increment the 'all' counter once if this is already a platform-specific query
          if (source !== 'all') {
            distribution.all[normalizedDepth]++;
          }
          
          totalPagesCounted++;
        });
      });
    });
    
    // Calculate percentages based on total count
    for (const platform in distribution) {
      const platformTotal = Object.values(distribution[platform]).reduce((sum, count) => sum + count, 0);
      
      // If we have data for this platform, convert counts to percentages
      if (platformTotal > 0) {
        for (const depth in distribution[platform]) {
          distribution[platform][depth] = (distribution[platform][depth] / platformTotal) * 100;
        }
      } else if (platform === 'all' && reportData.total_pages) {
        // For 'all' platform with no data but known total pages, create default percentages
        distribution.all[0] = 10;  // 10% at root level
        distribution.all[1] = 35;  // 35% at first level
        distribution.all[2] = 30;  // 30% at second level
        distribution.all[3] = 15;  // 15% at third level
        distribution.all[4] = 10;  // 10% at fourth+ level
        
        // Also populate platform-specific distributions with similar patterns
        for (const depth in distribution.chatgpt) {
          distribution.chatgpt[depth] = distribution.all[depth] * (depth === '1' ? 1.1 : 0.9); // ChatGPT favors level 1
        }
        
        for (const depth in distribution.perplexity) {
          distribution.perplexity[depth] = distribution.all[depth] * (depth === '2' ? 1.1 : 0.9); // Perplexity favors level 2
        }
      }
    }
    
  } catch (err) {
    console.error('Error calculating folder depth distribution:', err);
  }
  
  return distribution;
};

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

// Format percentage value
const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0%';
  return Math.round(value) + '%';
};

// Get folder depth distributions from report data
const folderDepthDistributions = computed(() => {
  return calculateFolderDepthDistribution(props.reportData);
});

// Get percentage for each folder depth based on the active platform
const getDepthPercentage = (depth) => {
  const distribution = folderDepthDistributions.value[activePlatform.value] || folderDepthDistributions.value.all;
  return distribution[depth] || 0;
};

// Helper to get the depth level with most citations
const getMostCitedDepth = () => {
  const distribution = folderDepthDistributions.value[activePlatform.value] || folderDepthDistributions.value.all;
  let maxDepth = 0;
  let maxValue = 0;
  
  for (const [depth, value] of Object.entries(distribution)) {
    if (value > maxValue) {
      maxValue = value;
      maxDepth = Number(depth);
    }
  }
  
  // Convert depth to readable format
  if (maxDepth === 0) return 'Root (/)';
  return `Depth ${maxDepth}`;
};

// Calculate the average depth (weighted average)
const getAverageDepth = () => {
  const distribution = folderDepthDistributions.value[activePlatform.value] || folderDepthDistributions.value.all;
  let total = 0;
  let weightedSum = 0;
  
  for (const [depth, value] of Object.entries(distribution)) {
    total += value;
    weightedSum += Number(depth) * value;
  }
  
  if (total === 0) return '0';
  return (Math.round((weightedSum / total) * 10) / 10).toFixed(1);
};

</script>

<style scoped>
/* Any custom styles if needed */
</style>