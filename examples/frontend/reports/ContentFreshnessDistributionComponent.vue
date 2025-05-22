<!-- components/labs/reports/ContentFreshnessDistributionComponent.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Content Freshness Distribution</h3>
    
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
    
    <!-- Bar Chart for Content Freshness -->
    <div class="mb-6">
      <div class="space-y-4">
        <!-- Most Recent: 0-30 days -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">0-30 days</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('0-30')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('0-30')}%`"
            ></div>
          </div>
        </div>
        
        <!-- 1-3 months -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">1-3 months</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('1-3')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('1-3')}%`"
            ></div>
          </div>
        </div>
        
        <!-- 3-6 months -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">3-6 months</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('3-6')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('3-6')}%`"
            ></div>
          </div>
        </div>
        
        <!-- 6-12 months -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">6-12 months</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('6-12')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('6-12')}%`"
            ></div>
          </div>
        </div>
        
        <!-- 1+ years -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">1+ years</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('1+')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('1+')}%`"
            ></div>
          </div>
        </div>
        
        <!-- Unknown Date -->
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Unknown Date</span>
            <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getFreshnessPercentage('unknown')) }}</span>
          </div>
          <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-gray-500 rounded-full transition-all duration-700"
              :style="`width: ${getFreshnessPercentage('unknown')}%`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">Content Age Median</div>
        <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {{ getMedianAge() }}
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">Recent Content %</div>
        <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {{ formatPercentage(getRecentContentPercentage()) }}
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

// Calculate content freshness distribution from report data
const calculateFreshnessDistribution = (reportData) => {
  // Initialize distribution structure
  const distribution = {
    all: {
      '0-30': 0,   // 0-30 days
      '1-3': 0,    // 1-3 months
      '3-6': 0,    // 3-6 months
      '6-12': 0,   // 6-12 months
      '1+': 0,      // 1+ years
      'unknown': 0 // Unknown/blank dates
    },
    chatgpt: {
      '0-30': 0,
      '1-3': 0,
      '3-6': 0,
      '6-12': 0,
      '1+': 0,
      'unknown': 0
    },
    perplexity: {
      '0-30': 0,
      '1-3': 0,
      '3-6': 0,
      '6-12': 0,
      '1+': 0,
      'unknown': 0
    }
  };

  if (!reportData || !reportData.clients) {
    return distribution;
  }
  
  try {
    // Current date for comparison
    const now = new Date();
    
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
          // Get the last_modified_date from the page data
          const lastModifiedStr = page.last_modified_date;
          
          // If date is missing or invalid, increment the unknown category
          if (!lastModifiedStr) {
            distribution[source]['unknown']++;
            if (source !== 'all') {
              distribution.all['unknown']++;
            }
            totalPagesCounted++;
            return;
          }
          
          try {
            // Parse the date string
            const lastModified = new Date(lastModifiedStr);
            
            // Check if date is valid
            if (isNaN(lastModified.getTime())) {
              distribution[source]['unknown']++;
              if (source !== 'all') {
                distribution.all['unknown']++;
              }
              totalPagesCounted++;
              return;
            }
            
            // Calculate age in days
            const ageInDays = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));
            
            // Determine freshness category
            let category = 'unknown';
            if (ageInDays <= 30) {
              category = '0-30';
            } else if (ageInDays <= 90) {
              category = '1-3';
            } else if (ageInDays <= 180) {
              category = '3-6';
            } else if (ageInDays <= 365) {
              category = '6-12';
            } else {
              category = '1+';
            }
            
            // Increment counters for both platform-specific and all platforms
            distribution[source][category]++;
            if (source !== 'all') {
              distribution.all[category]++;
            }
            
            totalPagesCounted++;
          } catch (dateError) {
            console.error('Error parsing date:', dateError);
            distribution[source]['unknown']++;
            if (source !== 'all') {
              distribution.all['unknown']++;
            }
            totalPagesCounted++;
          }
        });
      });
    });
    
    // Convert counts to percentages for each platform
    for (const platform in distribution) {
      const platformTotal = Object.values(distribution[platform]).reduce((sum, count) => sum + count, 0);
      
      if (platformTotal > 0) {
        for (const category in distribution[platform]) {
          distribution[platform][category] = (distribution[platform][category] / platformTotal) * 100;
        }
      }
    }
    
  } catch (err) {
    console.error('Error calculating content freshness distribution:', err);
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

// Get freshness distributions from report data
const freshnessDistributions = computed(() => {
  return calculateFreshnessDistribution(props.reportData);
});

// Get percentage for each freshness category based on the active platform
const getFreshnessPercentage = (category) => {
  const distribution = freshnessDistributions.value[activePlatform.value] || freshnessDistributions.value.all;
  return distribution[category] || 0;
};

// Get median age bracket for content
const getMedianAge = () => {
  try {
    const platform = activePlatform.value;
    const distribution = freshnessDistributions.value[platform] || freshnessDistributions.value.all;
    
    // Calculate cumulative percentages to find the median (50% mark)
    const categories = ['0-30', '1-3', '3-6', '6-12', '1+'];
    let cumulative = 0;
    
    // First calculate the total percentage without unknown
    const totalKnown = categories.reduce((sum, category) => sum + distribution[category], 0);
    
    if (totalKnown <= 0) {
      return 'N/A';
    }
    
    // Find the category where cumulative goes over 50%
    for (const category of categories) {
      // Normalize the percentage relative to known dates only
      const normalizedPct = totalKnown > 0 ? (distribution[category] / totalKnown) * 100 : 0;
      cumulative += normalizedPct;
      
      // If we've crossed the 50% mark, we've found our median
      if (cumulative >= 50) {
        switch (category) {
          case '0-30': return '< 1 month';
          case '1-3': return '1-3 months';
          case '3-6': return '3-6 months';
          case '6-12': return '6-12 months';
          case '1+': return '> 1 year';
          default: return 'Unknown';
        }
      }
    }
    
    return 'N/A'; // If we somehow didn't find a median
  } catch (error) {
    console.error('Error calculating median age:', error);
    return 'N/A';
  }
};

// Calculate percentage of recent content (< 3 months)
const getRecentContentPercentage = () => {
  try {
    const distribution = freshnessDistributions.value[activePlatform.value] || freshnessDistributions.value.all;
    return (distribution['0-30'] || 0) + (distribution['1-3'] || 0);
  } catch (error) {
    console.error('Error calculating recent content percentage:', error);
    return 0;
  }
};

</script>

<style scoped>
/* Any custom styles if needed */
</style>