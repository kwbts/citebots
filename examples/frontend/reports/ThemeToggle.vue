<!-- components/labs/reports/ThemeToggle.vue -->
<template>
    <div class="inline-flex items-center">
      <span class="mr-2 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
        {{ theme === 'dark' ? 'Dark' : 'Light' }} Mode
      </span>
      <label class="relative inline-block w-14 h-7">
        <input 
          type="checkbox" 
          class="sr-only" 
          :checked="theme === 'dark'" 
          @change="toggleTheme"
        >
        <div 
          class="slider w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer transition-colors duration-300"
        >
          <div 
            class="knob absolute w-5 h-5 bg-gray-400 dark:bg-orange-500 rounded-full shadow-md transform transition-transform duration-300"
            :class="theme === 'dark' ? 'translate-x-8' : 'translate-x-1'"
            style="top: 4px;"
          ></div>
        </div>
      </label>
    </div>
  </template>
  
  <script setup>
  import { useTheme } from '@/composables/useTheme';
  
  const { theme, toggleTheme } = useTheme();
  </script>
  
  <style scoped>
  /* Make sure the slider and knob stay contained within their bounds */
  .slider {
    position: relative;
  }
  
  .slider .knob {
    /* Slight adjustment to knob to ensure perfect positioning */
    transition: transform 0.3s ease;
  }
  </style>