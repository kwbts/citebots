<!-- components/labs/reports/OnPageSEOComponent.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">On-page SEO Elements</h3>
    
    <TextBox>
      We crawled each page to check for key SEO elements. In our next report, we'll review items like tables, lists, and heading structure.
    </TextBox>
    
    <div class="space-y-8">
      <!-- Mobile Friendly -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">Mobile Friendly</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Responsive design/viewport</p>
            </div>
          </div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatPercentage(metrics.mobileFriendly.percentage) }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-green-500 rounded-full" 
            :style="`width: ${metrics.mobileFriendly.percentage}%`"
          ></div>
        </div>
      </div>
      
      <!-- SSL (HTTPS) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">SSL (HTTPS)</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Secure connection with SSL</p>
            </div>
          </div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatPercentage(metrics.ssl.percentage) }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-blue-500 rounded-full" 
            :style="`width: ${metrics.ssl.percentage}%`"
          ></div>
        </div>
      </div>
      
      <!-- Semantic HTML -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">Semantic HTML</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Structured markup with HTML5 elements</p>
            </div>
          </div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatPercentage(metrics.semanticHTML.percentage) }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" 
            :style="`width: ${metrics.semanticHTML.percentage}%`"
          ></div>
        </div>
      </div>
      
      <!-- CDN Usage -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">CDN Usage</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Content delivery network for assets</p>
            </div>
          </div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatPercentage(metrics.cdn.percentage) }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-purple-500 rounded-full" 
            :style="`width: ${metrics.cdn.percentage}%`"
          ></div>
        </div>
      </div>
      
      <!-- Href-lang -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">Href-lang</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">Multi-language support tags</p>
            </div>
          </div>
          <div class="text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatPercentage(metrics.hrefLang.percentage) }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-orange-500 rounded-full" 
            :style="`width: ${metrics.hrefLang.percentage}%`"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Key Insight -->
    <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h5 class="text-sm font-medium text-blue-800 dark:text-blue-300">Key Insight</h5>
          <p class="text-sm text-blue-700 dark:text-blue-400 mt-1">
            {{ generateInsight() }}
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

// Function to calculate on-page SEO metrics from report data
const calculateOnPageSEOMetrics = (reportData) => {
  if (!reportData || !reportData.clients) {
    return {
      mobileFriendly: { percentage: 0 },
      ssl: { percentage: 0 },
      semanticHTML: { percentage: 0 },
      cdn: { percentage: 0 },
      hrefLang: { percentage: 0 },
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
  
  // Count pages with each element
  let mobileFriendlyCount = 0;
  let sslCount = 0;
  let semanticHTMLCount = 0;
  let cdnCount = 0;
  let hrefLangCount = 0;
  
  // Process each page
  allPages.forEach(page => {
    // Mobile Friendly
    if (page.mobile_friendly === true || page.mobile_friendly === "true" || 
        page.mobile_friendly === "checked" || page.is_responsive === true || 
        page.is_responsive === "true" || page.is_responsive === "checked") {
      mobileFriendlyCount++;
    }
    
    // SSL
    if (page.ssl_enabled === true || page.ssl_enabled === "true" || 
        page.ssl_enabled === "checked" || page.has_ssl === true || 
        page.has_ssl === "true" || page.has_ssl === "checked") {
      sslCount++;
    }
    
    // Semantic HTML
    if (page.semantic_html_usage === true || page.semantic_html_usage === "true" || 
        page.semantic_html_usage === "checked" || page.uses_semantic_html === true || 
        page.uses_semantic_html === "true" || page.uses_semantic_html === "checked") {
      semanticHTMLCount++;
    }
    
    // CDN Usage
    if (page.uses_cdn === true || page.uses_cdn === "true" || 
        page.uses_cdn === "checked" || page.cdn_usage === true || 
        page.cdn_usage === "true" || page.cdn_usage === "checked") {
      cdnCount++;
    }
    
    // Href-lang
    if (page.hreflang_declaration === true || page.hreflang_declaration === "true" || 
        page.hreflang_declaration === "checked" || page.has_hreflang === true || 
        page.has_hreflang === "true" || page.has_hreflang === "checked") {
      hrefLangCount++;
    }
  });
  
  // Calculate percentages
  const totalPages = allPages.length;
  const mobileFriendlyPercentage = totalPages ? (mobileFriendlyCount / totalPages) * 100 : 0;
  const sslPercentage = totalPages ? (sslCount / totalPages) * 100 : 0;
  const semanticHTMLPercentage = totalPages ? (semanticHTMLCount / totalPages) * 100 : 0;
  const cdnPercentage = totalPages ? (cdnCount / totalPages) * 100 : 0;
  const hrefLangPercentage = totalPages ? (hrefLangCount / totalPages) * 100 : 0;
  
  return {
    mobileFriendly: { 
      percentage: mobileFriendlyPercentage
    },
    ssl: { 
      percentage: sslPercentage
    },
    semanticHTML: { 
      percentage: semanticHTMLPercentage
    },
    cdn: { 
      percentage: cdnPercentage
    },
    hrefLang: { 
      percentage: hrefLangPercentage
    },
    totalPages: totalPages
  };
};

// Compute metrics with report data
const metrics = computed(() => {
  // Only use data calculated from the report, no fallbacks
  return calculateOnPageSEOMetrics(props.reportData);
});

// Helper formatting functions
const formatPercentage = (value) => {
  return Math.round(value) + '%';
};

// Generate insight based on the metrics
const generateInsight = () => {
  const mobilePercentage = metrics.value.mobileFriendly.percentage;
  const sslPercentage = metrics.value.ssl.percentage;
  const semanticPercentage = metrics.value.semanticHTML.percentage;
  
  if (mobilePercentage > 95 && sslPercentage > 95) {
    return `Mobile-friendly design (${formatPercentage(mobilePercentage)}) and SSL (${formatPercentage(sslPercentage)}) are nearly universal in LLM citations, suggesting these may be baseline requirements rather than differentiators for ranking.`;
  } else if (semanticPercentage > 85) {
    return `Semantic HTML (${formatPercentage(semanticPercentage)}) is prevalent among cited pages, indicating that structured content is a key factor in LLM content selection. In contrast, hreflang tags (${formatPercentage(metrics.value.hrefLang.percentage)}) are much less common.`;
  } else if (metrics.value.cdn.percentage > 70) {
    return `${formatPercentage(metrics.value.cdn.percentage)} of cited pages use CDNs for asset delivery, potentially indicating that page speed and performance are significant ranking factors for LLMs.`;
  } else {
    return `Mobile optimization (${formatPercentage(mobilePercentage)}) and secure connections (${formatPercentage(sslPercentage)}) dominate, while international targeting via hreflang (${formatPercentage(metrics.value.hrefLang.percentage)}) is much less common in LLM citations.`;
  }
};
</script>

<style scoped>
/* Any custom styles if needed */
</style>