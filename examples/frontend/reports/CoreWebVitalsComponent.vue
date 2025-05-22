<!-- components/labs/reports/CoreWebVitalsComponent.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Core Web Vitals</h3>
      
      <TextBox>
        Calling the Page Speed Insights API let us get preliminary Core Web Vitals scores for each citation URL. We're improving this process after finding outlier results, possibly due to how the API was called.
      </TextBox>
      
      <!-- First Contentful Paint Gauge -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">First Contentful Paint</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatTime(metrics.fcp.avg) }} avg ({{ getRatingText('fcp', metrics.fcp.avg) }})
              </p>
            </div>
          </div>
        </div>
        
        <!-- FCP Gauge visualization -->
        <div class="relative py-2">
          <!-- Google threshold markers -->
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>0s</span>
            <span class="absolute left-[18%]">1.8s</span>
            <span class="absolute left-[30%]">3s</span>
            <span class="absolute right-0">10s+</span>
          </div>
          
          <!-- Gauge background with thresholds -->
          <div class="flex h-6 rounded-full overflow-hidden">
            <div class="w-[18%] bg-green-500"></div>
            <div class="w-[12%] bg-yellow-500"></div>
            <div class="w-[70%] bg-red-500"></div>
          </div>
          
          <!-- Marker for current value -->
          <div 
            class="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 dark:border-white rounded-full transform -translate-y-1/2 -translate-x-1/2"
            :style="`left: ${Math.min(getFCPPositionPercentage(metrics.fcp.avg), 98)}%`"
          ></div>
          
          <!-- Google recommendation -->
          <div class="mt-1 text-xs text-green-600 dark:text-green-400">
            <span>Google recommends: &lt; 1.8s</span>
          </div>
        </div>
      </div>
      
      <!-- Largest Contentful Paint Gauge -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">Largest Contentful Paint</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatTime(metrics.lcp.avg) }} avg ({{ getRatingText('lcp', metrics.lcp.avg) }})
              </p>
            </div>
          </div>
        </div>
        
        <!-- LCP Gauge visualization -->
        <div class="relative py-2">
          <!-- Google threshold markers -->
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>0s</span>
            <span class="absolute left-[12.5%]">2.5s</span>
            <span class="absolute left-[20%]">4s</span>
            <span class="absolute right-0">20s+</span>
          </div>
          
          <!-- Gauge background with thresholds -->
          <div class="flex h-6 rounded-full overflow-hidden">
            <div class="w-[12.5%] bg-green-500"></div>
            <div class="w-[7.5%] bg-yellow-500"></div>
            <div class="w-[80%] bg-red-500"></div>
          </div>
          
          <!-- Marker for current value -->
          <div 
            class="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 dark:border-white rounded-full transform -translate-y-1/2 -translate-x-1/2"
            :style="`left: ${Math.min(getLCPPositionPercentage(metrics.lcp.avg), 98)}%`"
          ></div>
          
          <!-- Google recommendation -->
          <div class="mt-1 text-xs text-green-600 dark:text-green-400">
            <span>Google recommends: &lt; 2.5s</span>
          </div>
        </div>
      </div>
      
      <!-- Total Blocking Time Visualization -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">Total Blocking Time</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatMilliseconds(metrics.tbt.avg) }} avg ({{ getRatingText('tbt', metrics.tbt.avg) }})
              </p>
            </div>
          </div>
        </div>
        
        <!-- TBT Variable Range Chart -->
        <div class="relative py-2">
          <!-- Google threshold markers -->
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>0ms</span>
            <span class="absolute left-[20%]">200ms</span>
            <span class="absolute left-[60%]">600ms</span>
            <span class="absolute right-0">1000ms+</span>
          </div>
          
          <!-- TBT range visualization - box plot style -->
          <div class="h-12 relative">
            <!-- Background scale with thresholds -->
            <div class="absolute inset-y-0 left-0 right-0 flex h-6 top-1/2 transform -translate-y-1/2 rounded-full overflow-hidden">
              <div class="w-[20%] bg-green-500"></div>
              <div class="w-[40%] bg-yellow-500"></div>
              <div class="w-[40%] bg-red-500"></div>
            </div>
            
            <!-- Min-Max range - removed the dark line, only keeping the background range -->
            <div 
              class="absolute top-1/2 h-4 bg-gray-200 dark:bg-gray-700/50 transform -translate-y-1/2 opacity-0"
              :style="`
                left: ${Math.min(getTBTPositionPercentage(metrics.tbt.min), 98)}%; 
                width: ${Math.min(getTBTPositionPercentage(metrics.tbt.max) - getTBTPositionPercentage(metrics.tbt.min), 98 - getTBTPositionPercentage(metrics.tbt.min))}%
              `"
            ></div>
            
            <!-- Average marker -->
            <div 
              class="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 dark:border-white rounded-full transform -translate-y-1/2 -translate-x-1/2"
              :style="`left: ${Math.min(getTBTPositionPercentage(metrics.tbt.avg), 98)}%`"
            ></div>
          </div>
          
          <!-- Google recommendation -->
          <div class="mt-1 text-xs text-green-600 dark:text-green-400">
            <span>Google recommends: &lt; 200ms</span>
          </div>
        </div>
      </div>
      
      <!-- Key Insight Note -->
      <div class="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h5 class="text-sm font-medium text-indigo-800 dark:text-indigo-300">Key Insight</h5>
            <p class="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
              LLMs cite pages with significantly slower load times than Google's ideal thresholds, 
              suggesting speed may be less important for generative AI citations than for traditional search rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import TextBox from './TextBox.vue';
  
  const props = defineProps({
    reportData: {
      type: Object,
      required: true
    }
  });
  
  // Function to calculate Core Web Vitals metrics from report data
  const calculateCoreWebVitals = (reportData) => {
    if (!reportData || !reportData.clients) {
      return {
        fcp: { avg: 0, median: 0, min: 0, max: 0 },
        lcp: { avg: 0, median: 0, min: 0, max: 0 },
        tbt: { avg: 0, median: 0, min: 0, max: 0 },
        cls: { avg: 0, median: 0, min: 0, max: 0 },
        pageSpeed: { avg: 0, median: 0, min: 0, max: 0 },
        totalPages: 0
      };
    }
    
    // Collect all pages from all clients
    const allPages = [];
    
    reportData.clients.forEach(client => {
      if (client.query_data) {
        client.query_data.forEach(query => {
          if (query.associated_pages) {
            allPages.push(...query.associated_pages);
          }
        });
      }
    });
    
    // Extract metrics
    const fcpValues = [];
    const lcpValues = [];
    const tbtValues = [];
    const clsValues = [];
    const pageSpeedValues = [];
    
    // Process each page
    allPages.forEach(page => {
      // First Contentful Paint
      if (page.firstContentfulPaint !== undefined && 
          page.firstContentfulPaint !== null && 
          !isNaN(parseFloat(page.firstContentfulPaint))) {
        fcpValues.push(parseFloat(page.firstContentfulPaint));
      }
      
      // Largest Contentful Paint
      if (page.largestContentfulPaint !== undefined && 
          page.largestContentfulPaint !== null && 
          !isNaN(parseFloat(page.largestContentfulPaint))) {
        lcpValues.push(parseFloat(page.largestContentfulPaint));
      }
      
      // Total Blocking Time
      if (page.totalBlockingTime !== undefined && 
          page.totalBlockingTime !== null && 
          !isNaN(parseFloat(page.totalBlockingTime))) {
        tbtValues.push(parseFloat(page.totalBlockingTime));
      }
      
      // Cumulative Layout Shift
      if (page.cumulativeLayoutShift !== undefined && 
          page.cumulativeLayoutShift !== null && 
          !isNaN(parseFloat(page.cumulativeLayoutShift))) {
        clsValues.push(parseFloat(page.cumulativeLayoutShift));
      }
      
      // Page Speed Score
      if (page.pageSpeedScore !== undefined && 
          page.pageSpeedScore !== null && 
          !isNaN(parseFloat(page.pageSpeedScore))) {
        pageSpeedValues.push(parseFloat(page.pageSpeedScore));
      }
    });
    
    // Calculate statistics for each metric
    const calculateStats = (values) => {
      if (values.length === 0) return { avg: 0, median: 0, min: 0, max: 0 };
      
      // Calculate average
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate median
      const sorted = [...values].sort((a, b) => a - b);
      const median = values.length % 2 === 0
        ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
        : sorted[Math.floor(values.length / 2)];
        
      // Get min and max
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      return { avg, median, min, max, values };
    };
    
    return {
      fcp: calculateStats(fcpValues),
      lcp: calculateStats(lcpValues),
      tbt: calculateStats(tbtValues),
      cls: calculateStats(clsValues),
      pageSpeed: calculateStats(pageSpeedValues),
      totalPages: allPages.length
    };
  };
  
  // Define Google's recommended thresholds
  const googleThresholds = {
    fcp: { good: 1800, moderate: 3000 }, // in ms
    lcp: { good: 2500, moderate: 4000 }, // in ms
    tbt: { good: 200, moderate: 600 },   // in ms
    cls: { good: 0.1, moderate: 0.25 }   // unit-less
  };
  
  // Compute metrics directly from report data - no fallbacks
  const metrics = computed(() => {
    // Only use actual data from Supabase
    return calculateCoreWebVitals(props.reportData);
  });
  
  // Helper formatting functions
  const formatTime = (milliseconds) => {
    return (milliseconds / 1000).toFixed(1) + 's';
  };
  
  const formatMilliseconds = (ms) => {
    return Math.round(ms) + 'ms';
  };
  
  // Calculate position percentage for gauge visualization
  const getFCPPositionPercentage = (value) => {
    // Scale for display: 0ms to 10000ms (10s) mapped to 0-100%
    const maxScale = 10000;
    return Math.min((value / maxScale) * 100, 100);
  };
  
  const getLCPPositionPercentage = (value) => {
    // Scale for display: 0ms to 20000ms (20s) mapped to 0-100%
    const maxScale = 20000;
    return Math.min((value / maxScale) * 100, 100);
  };
  
  const getTBTPositionPercentage = (value) => {
    // Scale for display: 0ms to 1000ms (1s) mapped to 0-100%
    const maxScale = 1000;
    return Math.min((value / maxScale) * 100, 100);
  };
  
  // Get rating text for each metric
  const getRatingText = (metric, value) => {
    const thresholds = googleThresholds[metric];
    
    if (value <= thresholds.good) {
      return 'Good';
    } else if (value <= thresholds.moderate) {
      return 'Needs Improvement';
    } else {
      return 'Poor';
    }
  };
  </script>
  
  <style scoped>
  /* Any custom styles if needed */
  </style>