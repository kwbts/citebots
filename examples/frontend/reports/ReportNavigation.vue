<!-- components/labs/reports/ReportNavigation.vue -->
<template>
  <header class="fixed w-full top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
    <div class="max-w-[1140px] mx-auto px-4">
      <nav class="flex items-center justify-between py-4">
        <!-- Logo -->
        <div class="text-xl sm:text-2xl font-bold font-body">
          <NuxtLink
            to="/"
            class="hover:text-burntOrange text-darkNavy dark:text-white transition-colors duration-200"
          >
            Knowbots
          </NuxtLink>
        </div>
        
        <!-- Breadcrumb -->
        <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <NuxtLink 
            to="/" 
            class="hover:text-burntOrange transition-colors duration-200"
          >
            Home
          </NuxtLink>
          <span class="text-gray-400 dark:text-gray-600">/</span>
          <NuxtLink 
            to="/core-sample/" 
            class="hover:text-burntOrange transition-colors duration-200"
          >
            Core Sample
          </NuxtLink>
          <span class="text-gray-400 dark:text-gray-600">/</span>
          <span class="text-burntOrangeDark dark:text-orange-400 font-medium">May 2025</span>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
// No additional logic needed for this simplified navigation
</script>

<style scoped>
/* Any custom styles if needed */
</style>