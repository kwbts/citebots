<!-- components/labs/reports/MethodologyComponent.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Methodology</h3>
      
      <TextBox>
        We needed a way to conduct an analysis at scale. Our programmatic approach allowed us to craft queries, submit them to simple, vanilla versions of ChatGPT and Perplexity, and analyze the responses. Our goal was to collect as many data points as possible.
      </TextBox>
      
      <div class="relative">
        <!-- Removed GEO Keyword Badge -->
        
        <!-- Mobile View: Vertical Steps -->
        <div class="md:hidden space-y-6">
          <div v-for="(step, index) in methodologySteps" :key="index" class="flex">
            <div class="flex flex-col items-center mr-4">
              <!-- Step Number Circle -->
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                :class="getStepColorClass(index)"
              >
                {{ index + 1 }}
              </div>
              <!-- Connecting Line -->
              <div v-if="index < methodologySteps.length - 1" class="w-0.5 h-16 bg-gray-300 dark:bg-gray-700 mt-2"></div>
            </div>
            
            <div class="flex-1">
              <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <div class="mr-3">
                    <component :is="step.icon" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h4 class="font-medium text-gray-800 dark:text-gray-200">{{ step.title }}</h4>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Desktop View: Horizontal Flowchart -->
        <div class="hidden md:block">
          <div class="relative flex justify-between items-start">
            <!-- Steps -->
            <div 
              v-for="(step, index) in methodologySteps" 
              :key="index" 
              class="w-1/5 px-2 relative"
            >
              <!-- Step Box -->
              <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 h-full">
                <!-- Step Number Circle -->
                <div class="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                    :class="getStepColorClass(index)"
                  >
                    {{ index + 1 }}
                  </div>
                </div>
                
                <div class="mt-6 text-center">
                  <div class="flex justify-center mb-3">
                    <component :is="step.icon" class="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">{{ step.title }}</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">{{ step.description }}</p>
                </div>
                
                <!-- Special Branching for Step 4 -->
                <div v-if="index === 3" class="mt-3">
                  <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center">
                      <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mb-1"></div>
                      <span>Content</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-1.5 h-1.5 rounded-full bg-green-500 mb-1"></div>
                      <span>Technical</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-1.5 h-1.5 rounded-full bg-purple-500 mb-1"></div>
                      <span>Authority</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Connecting Arrows -->
              <div 
                v-if="index < methodologySteps.length - 1" 
                class="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-400 dark:text-gray-600">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Removed connecting dashed line -->
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { h } from 'vue';
  import TextBox from './TextBox.vue';
  
  // Methodology step data
  const methodologySteps = [
    {
      title: "Query Generation",
      description: "Converting keywords into natural language queries via LLM-assisted transformation.",
      icon: h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
        h('circle', { cx: '9', cy: '10', r: '1' }),
        h('circle', { cx: '14', cy: '10', r: '1' }),
      ])
    },
    {
      title: "LLM Response Collection",
      description: "Gathering responses from multiple LLMs using the generated natural language queries.",
      icon: h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
        h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }),
        h('path', { d: 'M8 21V5' }),
        h('path', { d: 'M12 17h4' }),
        h('path', { d: 'M12 13h4' }),
        h('path', { d: 'M12 9h4' }),
      ])
    },
    {
      title: "Citation URL Extraction",
      description: "Identifying and extracting citation URLs from LLM responses for analysis.",
      icon: h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
        h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }),
      ])
    },
    {
      title: "Multi-Factor Analysis",
      description: "Evaluating cited pages on content quality, technical factors, and domain authority.",
      icon: h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
        h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }),
      ])
    },
    {
      title: "Data Synthesis",
      description: "Combining all analysis data to identify patterns and optimization opportunities.",
      icon: h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('path', { d: 'M14 2v6h6' }),
        h('path', { d: 'M9 15v-3' }),
        h('path', { d: 'M12 15v-6' }),
        h('path', { d: 'M15 15v-3' }),
      ])
    }
  ];
  
  // Get color classes for step numbers
  const getStepColorClass = (index) => {
    const colors = [
      'bg-orange-500',  // Step 1
      'bg-blue-500',    // Step 2
      'bg-green-500',   // Step 3
      'bg-purple-500',  // Step 4
      'bg-burntOrangeDark'  // Step 5
    ];
    
    return colors[index] || 'bg-gray-500';
  };
  </script>
  
  <style scoped>
  /* Optional custom styling */
  </style>