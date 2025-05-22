<template>
  <div class="text-box p-6 mt-6 mb-10 rounded-lg shadow-sm
              dark:bg-gray-800/50 dark:border dark:border-gray-700/50
              bg-gray-50 border border-gray-200">
    <div class="flex items-start">
      <div class="mr-3 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
             class="w-5 h-5 text-blue-500 dark:text-blue-400">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <p class="text-base leading-relaxed text-gray-700 dark:text-white">
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<script setup>
</script>