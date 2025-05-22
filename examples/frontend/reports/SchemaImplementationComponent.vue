<!-- components/labs/reports/SchemaImplementationComponent.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Schema Implementation</h3>
      
      <TextBox>
        It's difficult to pinpoint exactly what percentage of websites implement Schema markup across the entire web. According to our research, it's about 20% of sites. The prevalence of structured data in cited URLs is notable; this could be quick win for most brands for both GEO and SEO.
      </TextBox>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Schema Implementation Percentage Circle -->
        <div class="flex flex-col items-center justify-center">
          <div class="relative w-64 h-64">
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
              />
              
              <!-- Industry Average marker -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#9CA3AF"
                stroke-width="3"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateCircleDashOffset(metrics.industryAverage)"
                transform="rotate(-90 50 50)"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#3B82F6" 
                stroke-width="10"
                stroke-dasharray="282.7"
                :stroke-dashoffset="calculateCircleDashOffset(metrics.percentage)"
                transform="rotate(-90 50 50)"
              />
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-4xl font-bold text-gray-800 dark:text-gray-200">{{ Math.round(metrics.percentage) }}%</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 mt-1">have schema markup</span>
            </div>
          </div>
          
          <!-- Industry Average Legend -->
          <div class="mt-4 flex items-center">
            <div class="w-4 h-0.5 bg-gray-400 mr-2"></div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Industry Average ({{ metrics.industryAverage }}%)</span>
          </div>
          
          <!-- Schema Code Snippet Example -->
          <div class="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 w-full overflow-hidden">
            <h5 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Example Schema Markup</h5>
            <pre class="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto"><code>&lt;script type="application/ld+json"&gt;
  {
    "@context": "https://schema.org",
    "@type": "{{ getMostCommonSchemaType() }}",
    "name": "Page Title",
    "url": "https://example.com/page"
  }
  &lt;/script&gt;</code></pre>
          </div>
        </div>
        
        <!-- Top Schema Types Bar Chart -->
        <div>
          <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Top Schema Types</h4>
          
          <div class="space-y-4">
            <div v-for="(schema, index) in topSchemaTypes" :key="schema.type" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ schema.type }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ Math.round(schema.percentage) }}%</span>
              </div>
              
              <div class="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="absolute top-0 left-0 h-full rounded-full"
                  :class="getSchemaTypeColor(index)"
                  :style="`width: ${schema.percentage}%`"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Key Insight -->
          <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
            <p class="text-sm text-blue-700 dark:text-blue-400">
              <span class="font-medium">Key Insight:</span> 
              Schema implementation across LLM-cited pages ({{ Math.round(metrics.percentage) }}%) significantly exceeds 
              the industry average ({{ metrics.industryAverage }}%), suggesting that structured data may enhance content visibility to LLMs.
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
  
  // Function to calculate schema implementation metrics from report data
  const calculateSchemaImplementation = (reportData) => {
    if (!reportData || !reportData.clients) {
      return {
        percentage: 0,
        schemaTypes: [],
        pagesWithSchema: 0,
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
    
    let pagesWithSchema = 0;
    const schemaTypesCount = {};
    
    // Process each page
    allPages.forEach(page => {
      if (page.schema_markup_present === true || 
          page.schema_markup_present === "true" || 
          page.schema_markup_present === "checked") {
        pagesWithSchema++;
        
        // Count schema types
        if (page.schema_types && Array.isArray(page.schema_types)) {
          page.schema_types.forEach(type => {
            schemaTypesCount[type] = (schemaTypesCount[type] || 0) + 1;
          });
        }
      }
    });
    
    // Calculate percentage
    const schemaPercentage = allPages.length > 0 ? (pagesWithSchema / allPages.length) * 100 : 0;
    
    // Get top schema types
    const sortedSchemaTypes = Object.entries(schemaTypesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / pagesWithSchema) * 100
      }));
    
    return {
      percentage: schemaPercentage,
      schemaTypes: sortedSchemaTypes,
      pagesWithSchema,
      totalPages: allPages.length
    };
  };
  
  // Compute metrics directly from report data - no fallbacks
  const metrics = computed(() => {
    const calculated = calculateSchemaImplementation(props.reportData);
    
    // Add industry average to the calculated metrics, but don't use fallback data
    return {
      ...calculated,
      industryAverage: 20 // Industry standard benchmark
    };
  });
  
  // Get top 10 schema types for display
  const topSchemaTypes = computed(() => {
    return metrics.value.schemaTypes.slice(0, 10);
  });
  
  // Get most common schema type for example
  const getMostCommonSchemaType = () => {
    if (metrics.value.schemaTypes.length === 0) {
      return "WebPage";
    }
    return metrics.value.schemaTypes[0].type;
  };
  
  // Calculate stroke-dashoffset for circular progress
  const calculateCircleDashOffset = (percentage) => {
    const circumference = 282.7; // 2 * PI * radius
    return circumference - (circumference * percentage / 100);
  };
  
  // Get color for schema type bar based on index
  const getSchemaTypeColor = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500'
    ];
    
    return colors[index % colors.length];
  };
  </script>
  
  <style scoped>
  /* Any custom styles if needed */
  </style>