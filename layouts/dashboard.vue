<template>
  <div class="min-h-screen bg-gray-50">
    <TopNavigation />
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNavigation from '~/components/layout/TopNavigation.vue'
</script>