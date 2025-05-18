<template>
  <div class="min-h-screen bg-citebots-gray-50 flex flex-col">
    <TopNavigation />
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import TopNavigation from '~/components/layout/TopNavigation.vue'
</script>