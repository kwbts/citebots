<!-- components/labs/reports/QuestionsToAnswer.vue -->
<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Questions to Answer</h3>
      
      <!-- Hexagon Grid Layout -->
      <div class="relative">
        <!-- Removed Exploratory Watermark -->
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            v-for="(question, index) in questions" 
            :key="index"
            class="relative overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]"
          >
            <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-5 h-full">
              
              <!-- Question Icon -->
              <div class="flex items-center mb-4">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3"
                  :class="getBgColorClass(index)"
                >
                  <component :is="icons[index]" class="w-5 h-5" />
                </div>
                <div class="text-lg font-medium text-gray-800 dark:text-gray-200">Question {{ index + 1 }}</div>
              </div>
              
              <!-- Question Text -->
              <p class="text-gray-700 dark:text-gray-300 text-lg font-medium mb-3">{{ question.title }}</p>
              <p class="text-gray-600 dark:text-gray-400">{{ question.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- Removed connection lines -->
      </div>
    </div>
  </template>
  
  <script setup>
  import { h } from 'vue';
  
  // Question data
  const questions = [
    {
      title: "What does GEO have in common with SEO?",
      description: "Exploring the foundational similarities between search engine optimization and the emerging field of generative engine optimization."
    },
    {
      title: "What signals can we get from the data to start experimentation?",
      description: "Identifying patterns and variables from our citation analysis that could form the basis for structured testing and experiments."
    },
    {
      title: "What, if anything, is different than SEO?",
      description: "Examining the unique aspects of optimizing for LLM citations compared to traditional search engine ranking factors."
    },
    {
      title: "What type of data can we collect and is it valuable for experimentation?",
      description: "This is not meant to be a definitive study. Far from it. It's designed instead to help us set up experiments and to see if we can successfully optimize for LLM search."
    }
  ];
  
  // Icon components using render functions for simplicity
  const icons = [
    // Tent Icon (Question 1)
    h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M2 20h20' }),
      h('path', { d: 'M12 3L2 20' }),
      h('path', { d: 'M12 3l10 17' }),
      h('path', { d: 'M7 20v-4' }),
      h('path', { d: 'M17 20v-4' })
    ]),
    
    // Satellite Icon (Question 2)
    h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M4 10a2 2 0 0 1 2-2c.24 0 .5 0 .7.07' }),
      h('path', { d: 'M19.07 7.07A2 2 0 0 1 22 10a13.8 13.8 0 0 1-7.63 12.38' }),
      h('path', { d: 'M6.07 7.07a5 5 0 0 1 12.78 6.79' }),
      h('path', { d: 'M12 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4z' }),
      h('path', { d: 'M12 15v-2' })
    ]),
    
    // Scales/Balance Icon (Question 3)
    h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M12 3v18' }),
      h('path', { d: 'M8 6h8' }),
      h('path', { d: 'M7 12l5-4 5 4' }),
      h('path', { d: 'M7 16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2' })
    ]),
    
    // Beaker/Lab Flask Icon (Question 4)
    h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M9 3l-6 11a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-6-11' }),
      h('path', { d: 'M9 3h6' }),
      h('path', { d: 'M12 12h.01' }),
      h('path', { d: 'M9 15h.01' }),
      h('path', { d: 'M15 15h.01' })
    ])
  ];
  
  // Icon background colors
  const getBgColorClass = (index) => {
    const colors = [
      'bg-blue-500',        // Question 1
      'bg-green-500',       // Question 2
      'bg-purple-600',      // Question 3
      'bg-burntOrangeDark'  // Question 4
    ];
    
    return colors[index] || 'bg-gray-500';
  };
  
  // Icon fill colors for the hexagon pattern
  const iconColors = [
    '#3B82F6', // Blue
    '#22C55E', // Green
    '#9333EA', // Purple
    '#D36641'  // Burnt Orange
  ];
  </script>
  
  <style scoped>
  /* Optional: Add any specific styling for the component here */
  </style>