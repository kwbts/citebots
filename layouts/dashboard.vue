<template>
  <div class="min-h-screen bg-citebots-gray-50 flex flex-col">
    <TopNavigation />

    <!-- Main content area with sidebar preparation -->
    <div class="flex-1 flex">
      <!-- Sidebar space (hidden for now, ready for future) -->
      <aside class="hidden lg:block w-0 lg:w-0 transition-all duration-300 ease-in-out">
        <!-- Sidebar content will go here when needed -->
      </aside>

      <!-- Main content -->
      <main class="flex-1">
        <div class="h-full">
          <!-- Content wrapper matching TopNavigation width -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import TopNavigation from '~/components/layout/TopNavigation.vue'
</script>