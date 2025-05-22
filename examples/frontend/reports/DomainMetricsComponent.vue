<!-- components/labs/reports/DomainMetricsComponent.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Domain Metrics</h3>
      
      <TextBox>
        For every response from ChatGPT or Perplexity we received URLs for the web pages cited. We ran each of these pages through Moz to get domain and page insights.
      </TextBox>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Domain Authority Gauge -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Domain Authority</h4>
          
          <div class="relative w-48 h-48 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="12"
                stroke-linecap="round"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#D36641" 
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="251.2"
                :stroke-dashoffset="calculateStrokeDashOffset(metrics.domainAuthority.avg, 100)"
                transform="rotate(-90 50 50)"
              />
              
              <!-- Removed industry benchmark line and circle -->
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ Math.round(metrics.domainAuthority.avg * 10) / 10 }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</span>
            </div>
          </div>
          
          <!-- Domain Authority Details -->
          <div class="mt-4 text-center">
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Median</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ Math.round(metrics.domainAuthority.median * 10) / 10 }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Benchmark</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ metrics.benchmarks.domainAuthority }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Range</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ metrics.domainAuthority.min }}-{{ metrics.domainAuthority.max }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Page Authority Gauge -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5">
          <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Page Authority</h4>
          
          <div class="relative w-48 h-48 mx-auto">
            <!-- Background Circle -->
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <!-- Gray background circle -->
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#e5e7eb" 
                stroke-width="12"
                stroke-linecap="round"
              />
              
              <!-- Value arc -->
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#3B82F6" 
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="251.2"
                :stroke-dashoffset="calculateStrokeDashOffset(metrics.pageAuthority.avg, 100)"
                transform="rotate(-90 50 50)"
              />
              
              <!-- Industry benchmark line -->
              <!-- Removed industry benchmark line and circle -->
            </svg>
            
            <!-- Value in the center -->
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ Math.round(metrics.pageAuthority.avg * 10) / 10 }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</span>
            </div>
          </div>
          
          <!-- Page Authority Details -->
          <div class="mt-4 text-center">
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Median</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ Math.round(metrics.pageAuthority.median * 10) / 10 }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Benchmark</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ metrics.benchmarks.pageAuthority }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-gray-500 dark:text-gray-400">Range</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ metrics.pageAuthority.min }}-{{ metrics.pageAuthority.max }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Key Insight -->
      <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h5 class="text-sm font-medium text-blue-800 dark:text-blue-300">Key Insight</h5>
            <p class="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Cited pages have an average domain authority {{ compareToIndustry(metrics.domainAuthority.avg, metrics.benchmarks.domainAuthority) }} industry 
              benchmarks, suggesting that LLMs favor {{ metrics.domainAuthority.avg > metrics.benchmarks.domainAuthority ? 'more established' : 'newer' }} domains.
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
  
  // Calculate domain metrics from report data
  const calculateDomainMetrics = (reportData) => {
    if (!reportData || !reportData.clients) {
      return {
        domainAuthority: { avg: 0, median: 0, min: 0, max: 0 },
        pageAuthority: { avg: 0, median: 0, min: 0, max: 0 },
        benchmarks: { domainAuthority: 40, pageAuthority: 35 }
      };
    }
  
    const domainAuthorities = [];
    const pageAuthorities = [];
  
    // Iterate through all clients and their queries/pages
    reportData.clients.forEach(client => {
      if (client.query_data) {
        client.query_data.forEach(query => {
          if (query.associated_pages) {
            query.associated_pages.forEach(page => {
              // Extract domain authority if available
              if (page.domain_authority !== undefined && 
                  page.domain_authority !== null && 
                  !isNaN(parseFloat(page.domain_authority))) {
                domainAuthorities.push(parseFloat(page.domain_authority));
              }
              
              // Extract page authority if available
              if (page.page_authority !== undefined && 
                  page.page_authority !== null && 
                  !isNaN(parseFloat(page.page_authority))) {
                pageAuthorities.push(parseFloat(page.page_authority));
              }
            });
          }
        });
      }
    });
  
    // Calculate statistics for domain authority
    const domainAvg = domainAuthorities.length 
      ? domainAuthorities.reduce((sum, val) => sum + val, 0) / domainAuthorities.length
      : 0;
      
    const sortedDomainAuth = [...domainAuthorities].sort((a, b) => a - b);
    const domainMedian = domainAuthorities.length
      ? (sortedDomainAuth.length % 2 === 0
        ? (sortedDomainAuth[sortedDomainAuth.length / 2 - 1] + sortedDomainAuth[sortedDomainAuth.length / 2]) / 2
        : sortedDomainAuth[Math.floor(sortedDomainAuth.length / 2)])
      : 0;
  
    // Calculate statistics for page authority
    const pageAvg = pageAuthorities.length 
      ? pageAuthorities.reduce((sum, val) => sum + val, 0) / pageAuthorities.length
      : 0;
      
    const sortedPageAuth = [...pageAuthorities].sort((a, b) => a - b);
    const pageMedian = pageAuthorities.length
      ? (sortedPageAuth.length % 2 === 0
        ? (sortedPageAuth[sortedPageAuth.length / 2 - 1] + sortedPageAuth[sortedPageAuth.length / 2]) / 2
        : sortedPageAuth[Math.floor(sortedPageAuth.length / 2)])
      : 0;
  
    return {
      domainAuthority: {
        avg: domainAvg,
        median: domainMedian,
        min: domainAuthorities.length ? Math.min(...domainAuthorities) : 0,
        max: domainAuthorities.length ? Math.max(...domainAuthorities) : 0
      },
      pageAuthority: {
        avg: pageAvg,
        median: pageMedian,
        min: pageAuthorities.length ? Math.min(...pageAuthorities) : 0,
        max: pageAuthorities.length ? Math.max(...pageAuthorities) : 0
      },
      benchmarks: {
        domainAuthority: 40, // Industry standard benchmark
        pageAuthority: 35    // Industry standard benchmark
      }
    };
  };
  
  // Compute metrics from report data dynamically - no fallbacks
  const metrics = computed(() => {
    // Only use the calculated metrics from the data, no fallbacks
    return calculateDomainMetrics(props.reportData);
  });
  
  // Calculate stroke-dashoffset for gauge chart (scales to max value)
  const calculateStrokeDashOffset = (value, maxValue) => {
    const circumference = 251.2; // 2 * PI * radius
    const percentage = (value / maxValue) * 100;
    return circumference - (circumference * percentage / 100);
  };
  
  // Get coordinates for benchmark indicator on gauge
  const getBenchmarkCoordinates = (value, maxValue) => {
    const percentage = value / maxValue;
    const angle = percentage * Math.PI;
    const radius = 40; // Same as circle radius
    
    // Calculate coordinates (adjusted to circle's center at 50,50)
    const x = 50 + radius * Math.cos(angle - Math.PI / 2);
    const y = 50 + radius * Math.sin(angle - Math.PI / 2);
    
    return { x, y };
  };
  
  // Compare metrics to industry benchmarks
  const compareToIndustry = (value, benchmark) => {
    const difference = Math.abs(value - benchmark);
    const percentDifference = (difference / benchmark) * 100;
    
    let descriptor;
    if (value > benchmark) {
      if (percentDifference > 30) {
        descriptor = 'significantly exceeds';
      } else if (percentDifference > 15) {
        descriptor = 'exceeds';
      } else {
        descriptor = 'slightly exceeds';
      }
    } else {
      if (percentDifference > 30) {
        descriptor = 'falls significantly below';
      } else if (percentDifference > 15) {
        descriptor = 'falls below';
      } else {
        descriptor = 'is slightly below';
      }
    }
    
    return descriptor;
  };
  </script>
  
  <style scoped>
  /* Optional custom styling */
  </style>