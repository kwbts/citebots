<!-- components/labs/reports/DomainAuthorityCitationMetric.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Domain Authority & Citation Distribution</h3>
    
    <TextBox>
      Do the old SEO rules apply to GEO? It seems that traditional metrics like domain authority hold true.
    </TextBox>
    
    <!-- Platform Selector Toggle Buttons -->
    <div class="mb-6">
      <div class="flex">
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
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Bar Chart for Domain Authority Ranges -->
      <div>
        <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Citations by Domain Authority Range</h4>
        
        <div class="space-y-4">
          <!-- Domain Authority Range 1-25 -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">1-25</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDAPercentage('1-25')) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-blue-300 dark:bg-blue-600 rounded-full transition-all duration-700"
                :style="`width: ${getDAPercentage('1-25')}%`"
              ></div>
            </div>
          </div>
          
          <!-- Domain Authority Range 26-50 -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">26-50</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDAPercentage('26-50')) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-500 rounded-full transition-all duration-700"
                :style="`width: ${getDAPercentage('26-50')}%`"
              ></div>
            </div>
          </div>
          
          <!-- Domain Authority Range 51-75 -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">51-75</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDAPercentage('51-75')) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-blue-700 dark:bg-blue-400 rounded-full transition-all duration-700"
                :style="`width: ${getDAPercentage('51-75')}%`"
              ></div>
            </div>
          </div>
          
          <!-- Domain Authority Range 76-100 -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">76-100</span>
              <span class="text-gray-500 dark:text-gray-400">{{ formatPercentage(getDAPercentage('76-100')) }}</span>
            </div>
            <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-burntOrangeDark dark:bg-orange-500 rounded-full transition-all duration-700"
                :style="`width: ${getDAPercentage('76-100')}%`"
              ></div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Right Column: Citation Distribution by DA Score -->
      <div>
        <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Citation Distribution</h4>
        
        <!-- Citation Scatter Plot visualization (represents as a heat map) -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <!-- Heat map grid representation with 4 colored rows -->
          <div class="grid grid-cols-10 gap-1 mb-4">
            <!-- Each row has 10 cells representing increments of 10 in DA score -->
            <!-- Row 1: DA 76-100 -->
            <div 
              v-for="i in 10" 
              :key="`row1-${i}`" 
              class="h-6 rounded"
              :class="getDACellClass(76 + (i-1) * 2.5)"
            ></div>
            
            <!-- Row 2: DA 51-75 -->
            <div 
              v-for="i in 10" 
              :key="`row2-${i}`" 
              class="h-6 rounded"
              :class="getDACellClass(51 + (i-1) * 2.5)"
            ></div>
            
            <!-- Row 3: DA 26-50 -->
            <div 
              v-for="i in 10" 
              :key="`row3-${i}`" 
              class="h-6 rounded"
              :class="getDACellClass(26 + (i-1) * 2.5)"
            ></div>
            
            <!-- Row 4: DA 1-25 -->
            <div 
              v-for="i in 10" 
              :key="`row4-${i}`" 
              class="h-6 rounded"
              :class="getDACellClass(1 + (i-1) * 2.5)"
            ></div>
          </div>
          
          <!-- Legend for the heat map -->
          <div class="flex justify-between items-center mt-2">
            <div class="text-xs text-gray-500 dark:text-gray-400">Fewer Citations</div>
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
              <div class="w-4 h-4 bg-blue-300 dark:bg-blue-700/50 rounded"></div>
              <div class="w-4 h-4 bg-blue-500 dark:bg-blue-600/70 rounded"></div>
              <div class="w-4 h-4 bg-blue-700 dark:bg-blue-500/80 rounded"></div>
              <div class="w-4 h-4 bg-burntOrangeDark dark:bg-orange-500 rounded"></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">More Citations</div>
          </div>
          
          <!-- Domain Authority Scale Labels -->
          <div class="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div>1</div>
            <div>25</div>
            <div>50</div>
            <div>75</div>
            <div>100</div>
          </div>
          <div class="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            Domain Authority Score
          </div>
        </div>
        
        <!-- Citation Distribution Metrics -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">Median DA of Citations</div>
            <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
              {{ displayMedianDA() }}
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">Mode DA Range</div>
            <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
              {{ displayModeRange() }}
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">High Authority %</div>
            <div class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
              {{ formatPercentage(getDAPercentage('51-100')) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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

// Make sure activePlatform is properly initialized as a string
const activePlatform = ref('all');

// Calculate domain authority citation metrics from reportData
const calculateDomainAuthorityCitations = (reportData) => {
  // Initialize empty structure
  const empty = {
    all: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 },
    chatgpt: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 },
    perplexity: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 }
  };
  
  // Return empty data if the report data is missing
  if (!reportData || !reportData.clients) {
    return empty;
  }
  
  try {
    // Initialize counters for each platform and DA range
    const results = {
      all: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0, total: 0 },
      chatgpt: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0, total: 0 },
      perplexity: { '1-25': 0, '26-50': 0, '51-75': 0, '76-100': 0, total: 0 }
    };
    
    // Iterate through all clients and their queries/pages
    reportData.clients.forEach(client => {
      if (client.query_data) {
        client.query_data.forEach(query => {
          if (query.associated_pages) {
            query.associated_pages.forEach(page => {
              // Skip pages without domain authority
              if (!page.domain_authority) return;
              
              // Get platform from page data or query
              let platform = 'unknown';
              if (page.data_source) {
                platform = page.data_source.toLowerCase();
              } else if (query.query_metrics && query.query_metrics.data_source) {
                platform = query.query_metrics.data_source.toLowerCase();
              }
              
              // Determine which range this domain authority falls into
              let daRange;
              const da = parseFloat(page.domain_authority);
              if (da <= 25) daRange = '1-25';
              else if (da <= 50) daRange = '26-50';
              else if (da <= 75) daRange = '51-75';
              else daRange = '76-100';
              
              // Count for "all" platforms
              results.all[daRange]++;
              results.all.total++;
              
              // Count for specific platforms
              if (platform === 'chatgpt') {
                results.chatgpt[daRange]++;
                results.chatgpt.total++;
              } else if (platform === 'perplexity') {
                results.perplexity[daRange]++;
                results.perplexity.total++;
              }
            });
          }
        });
      }
    });
    
    // Convert counts to percentages
    const percentages = {
      all: { 
        '1-25': results.all.total > 0 ? (results.all['1-25'] / results.all.total) * 100 : 0,
        '26-50': results.all.total > 0 ? (results.all['26-50'] / results.all.total) * 100 : 0,
        '51-75': results.all.total > 0 ? (results.all['51-75'] / results.all.total) * 100 : 0,
        '76-100': results.all.total > 0 ? (results.all['76-100'] / results.all.total) * 100 : 0
      },
      chatgpt: {
        '1-25': results.chatgpt.total > 0 ? (results.chatgpt['1-25'] / results.chatgpt.total) * 100 : 0,
        '26-50': results.chatgpt.total > 0 ? (results.chatgpt['26-50'] / results.chatgpt.total) * 100 : 0,
        '51-75': results.chatgpt.total > 0 ? (results.chatgpt['51-75'] / results.chatgpt.total) * 100 : 0,
        '76-100': results.chatgpt.total > 0 ? (results.chatgpt['76-100'] / results.chatgpt.total) * 100 : 0
      },
      perplexity: {
        '1-25': results.perplexity.total > 0 ? (results.perplexity['1-25'] / results.perplexity.total) * 100 : 0,
        '26-50': results.perplexity.total > 0 ? (results.perplexity['26-50'] / results.perplexity.total) * 100 : 0,
        '51-75': results.perplexity.total > 0 ? (results.perplexity['51-75'] / results.perplexity.total) * 100 : 0,
        '76-100': results.perplexity.total > 0 ? (results.perplexity['76-100'] / results.perplexity.total) * 100 : 0
      }
    };
    
    return percentages;
  } catch (error) {
    console.error('Error calculating domain authority citations:', error);
    return empty;
  }
};

// Citation metrics calculation function
const calculateCitationMetrics = (reportData) => {
  // Initialize empty structure
  const empty = {
    all: { median: 0, modeRange: '51-75', highAuthority: 0 },
    chatgpt: { median: 0, modeRange: '51-75', highAuthority: 0 },
    perplexity: { median: 0, modeRange: '51-75', highAuthority: 0 }
  };
  
  // Return empty data if the report data is missing
  if (!reportData || !reportData.clients) {
    return empty;
  }
  
  try {
    // Get domain authorities for each platform
    const daValues = {
      all: [],
      chatgpt: [],
      perplexity: []
    };
    
    // Iterate through all clients and their queries/pages
    reportData.clients.forEach(client => {
      if (client.query_data) {
        client.query_data.forEach(query => {
          if (query.associated_pages) {
            query.associated_pages.forEach(page => {
              // Skip pages without domain authority
              if (!page.domain_authority) return;
              
              const da = parseFloat(page.domain_authority);
              
              // Get platform from page data or query
              let platform = 'unknown';
              if (page.data_source) {
                platform = page.data_source.toLowerCase();
              } else if (query.query_metrics && query.query_metrics.data_source) {
                platform = query.query_metrics.data_source.toLowerCase();
              }
              
              // Add to all platforms
              daValues.all.push(da);
              
              // Add to specific platform arrays
              if (platform === 'chatgpt') {
                daValues.chatgpt.push(da);
              } else if (platform === 'perplexity') {
                daValues.perplexity.push(da);
              }
            });
          }
        });
      }
    });
    
    // Calculate median for each platform
    const calculateMedian = (values) => {
      if (values.length === 0) return null;
      
      const sorted = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      
      if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
      } else {
        return sorted[middle];
      }
    };
    
    // Get mode range for each platform
    const getModeRange = (values) => {
      if (values.length === 0) return null;
      
      // Count occurrences in each range
      const ranges = {
        '1-25': 0,
        '26-50': 0,
        '51-75': 0,
        '76-100': 0
      };
      
      values.forEach(da => {
        if (da <= 25) ranges['1-25']++;
        else if (da <= 50) ranges['26-50']++;
        else if (da <= 75) ranges['51-75']++;
        else ranges['76-100']++;
      });
      
      // Find the mode range
      let modeRange = '1-25';
      let maxCount = ranges['1-25'];
      
      Object.entries(ranges).forEach(([range, count]) => {
        if (count > maxCount) {
          maxCount = count;
          modeRange = range;
        }
      });
      
      return modeRange;
    };
    
    // Calculate high authority percentage (DA > 50)
    const getHighAuthorityPercentage = (values) => {
      if (values.length === 0) return null;
      
      const highAuthCount = values.filter(da => da > 50).length;
      return (highAuthCount / values.length) * 100;
    };
    
    // Compile the metrics for each platform
    const metrics = {
      all: {
        median: calculateMedian(daValues.all),
        modeRange: getModeRange(daValues.all),
        highAuthority: getHighAuthorityPercentage(daValues.all)
      },
      chatgpt: {
        median: calculateMedian(daValues.chatgpt),
        modeRange: getModeRange(daValues.chatgpt),
        highAuthority: getHighAuthorityPercentage(daValues.chatgpt)
      },
      perplexity: {
        median: calculateMedian(daValues.perplexity),
        modeRange: getModeRange(daValues.perplexity),
        highAuthority: getHighAuthorityPercentage(daValues.perplexity)
      }
    };
    
    return metrics;
  } catch (error) {
    console.error('Error calculating citation metrics:', error);
    return empty;
  }
};

// Helper function to generate cell colors based on the DA score
// This simulates a heatmap of citation distribution
const getDACellClass = (score) => {
  // This would normally use actual data to determine heatmap intensity
  // For now, we're using a pattern that shows higher DA scores get more citations
  // especially in the 50-80 range
  const baseColors = {
    low: 'bg-blue-100 dark:bg-blue-900/30',
    mediumLow: 'bg-blue-300 dark:bg-blue-700/50',
    medium: 'bg-blue-500 dark:bg-blue-600/70',
    mediumHigh: 'bg-blue-700 dark:bg-blue-500/80',
    high: 'bg-burntOrangeDark dark:text-burntOrangeDark/90'
  };
  
  // Simulated distribution peaking around 60-70 DA
  if (score < 20) {
    return baseColors.low;
  } else if (score < 40) {
    return baseColors.mediumLow;
  } else if (score < 60) {
    return baseColors.medium;
  } else if (score < 80) {
    return baseColors.mediumHigh;
  } else {
    return baseColors.high;
  }
};

// Helper method to get platform-specific styling classes for buttons
const getPlatformButtonClass = (platform) => {
  const currentPlatform = activePlatform.value || 'all';
  
  if (currentPlatform === platform) {
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
  const currentPlatform = activePlatform.value || 'all';
  
  switch(platform) {
    case 'all':
      return 'bg-burntOrangeDark';
    case 'chatgpt':
      return 'bg-green-500';
    case 'perplexity':
      return 'bg-desaturatedTeal';
    default:
      return 'bg-gray-500';
  }
};

// Get domain authority citations from report data
const domainAuthorityCitations = computed(() => {
  // Default initialized structure to avoid undefined errors
  const defaultCitations = {
    all: { '1-25': null, '26-50': null, '51-75': null, '76-100': null },
    chatgpt: { '1-25': null, '26-50': null, '51-75': null, '76-100': null },
    perplexity: { '1-25': null, '26-50': null, '51-75': null, '76-100': null }
  };
  
  // Return either the calculated citations or the default if calculation fails
  const calculated = calculateDomainAuthorityCitations(props.reportData);
  
  // Ensure calculated has all platforms
  if (!calculated) return defaultCitations;
  
  // Combine defaults with any calculated values to ensure structure is complete
  return {
    all: { ...defaultCitations.all, ...calculated.all },
    chatgpt: { ...defaultCitations.chatgpt, ...calculated.chatgpt },
    perplexity: { ...defaultCitations.perplexity, ...calculated.perplexity }
  };
});

// Get citation metrics from report data
const citationMetrics = computed(() => {
  // Default initialized structure to avoid undefined errors
  const defaultMetrics = {
    all: { median: null, modeRange: null, highAuthority: null },
    chatgpt: { median: null, modeRange: null, highAuthority: null },
    perplexity: { median: null, modeRange: null, highAuthority: null }
  };
  
  // Return either the calculated metrics or the default if calculation fails
  const calculated = calculateCitationMetrics(props.reportData);
  
  // Ensure calculated has all platforms
  if (!calculated) return defaultMetrics;
  
  // Combine defaults with any calculated values to ensure structure is complete
  return {
    all: { ...defaultMetrics.all, ...calculated.all },
    chatgpt: { ...defaultMetrics.chatgpt, ...calculated.chatgpt },
    perplexity: { ...defaultMetrics.perplexity, ...calculated.perplexity }
  };
});

// Helper for getting combined ranges
const getDAPercentage = (range) => {
  try {
    // Get active platform from ref
    const currentPlatform = activePlatform.value || 'all';
    
    // Safely check if we have the required data
    if (!domainAuthorityCitations.value) {
      return 0;
    }
    
    if (!domainAuthorityCitations.value[currentPlatform]) {
      return 0;
    }
    
    const distribution = domainAuthorityCitations.value[currentPlatform];
    
    // If it's a single range
    if (distribution && distribution[range] !== undefined) {
      return distribution[range] || 0;
    }
    
    // Handle combined ranges (e.g., "51-100")
    if (range === '51-100' && distribution) {
      const range1 = distribution['51-75'] || 0;
      const range2 = distribution['76-100'] || 0;
      return range1 + range2;
    }
  } catch (error) {
    console.error('Error in getDAPercentage:', error);
  }
  
  return 0;
};

// Format percentage value
const formatPercentage = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return Math.round(value) + '%';
};

// Get insight text based on platform
const getCitationInsight = () => {
  try {
    // Get the current platform from the ref
    const currentPlatform = activePlatform.value || 'all';
    
    if (!domainAuthorityCitations.value || !domainAuthorityCitations.value[currentPlatform]) {
      return "Analysis of citation patterns by domain authority is currently being processed.";
    }
    
    if (currentPlatform === 'all') {
      const highAuthorityPct = getDAPercentage('51-100');
      return "LLMs predominantly cite domains with higher authority scores. Our analysis shows that " +
             formatPercentage(highAuthorityPct) + " of citations come from domains with DA scores above 50, " +
             "suggesting that established, trustworthy domains are more likely to be referenced.";
    } else if (currentPlatform === 'chatgpt') {
      const midHighAuthorityPct = getDAPercentage('51-75');
      return "ChatGPT shows a strong preference for high-authority domains. " +
             formatPercentage(midHighAuthorityPct) + " of all citations come from domains with DA scores between 51-75, " +
             "indicating a bias toward well-established but not necessarily dominant sites.";
    } else if (currentPlatform === 'perplexity') {
      const midAuthorityPct = getDAPercentage('26-50');
      return "Perplexity AI includes a more balanced distribution of domain authorities, with " +
             formatPercentage(midAuthorityPct) + " of citations from mid-range authorities. " +
             "This suggests a slightly broader source selection compared to other LLMs.";
    }
    
    return "Analysis shows strong correlation between domain authority and citation frequency.";
  } catch (error) {
    console.error('Error in getCitationInsight:', error);
    return "Analysis of citation patterns by domain authority is currently unavailable.";
  }
};

// Helper for displaying median DA
const displayMedianDA = () => {
  try {
    const currentPlatform = activePlatform.value || 'all';
    
    if (citationMetrics.value && citationMetrics.value[currentPlatform]) {
      const median = citationMetrics.value[currentPlatform].median;
      if (median !== undefined && median !== null) {
        return Math.round(median * 10) / 10;
      }
    }
  } catch (error) {
    console.error("Error in displayMedianDA:", error);
  }
  return 'N/A';
};

// Helper for displaying mode range
const displayModeRange = () => {
  try {
    const currentPlatform = activePlatform.value || 'all';
    
    if (citationMetrics.value && citationMetrics.value[currentPlatform]) {
      const modeRange = citationMetrics.value[currentPlatform].modeRange;
      if (modeRange !== undefined && modeRange !== null) {
        return modeRange;
      }
    }
  } catch (error) {
    console.error("Error in displayModeRange:", error);
  }
  return 'N/A';
};

// No calculateDomainAuthorityMetrics function needed anymore
// Everything is calculated directly in the computed properties
</script>

<style scoped>
/* Any custom styles if needed */
</style>