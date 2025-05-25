<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Slim Top Bar -->
    <SlimTopBar />

    <!-- Main layout with sidebar -->
    <div class="flex-1 flex">
      <!-- Icon Bar -->
      <SidebarIconBar
        :active-section="activeSection"
        @section-changed="handleSectionChange"
      />

      <!-- Context Panel -->
      <SidebarContextPanel
        :active-section="activeSection"
      />

      <!-- Main content -->
      <main class="flex-1 bg-gray-50 dark:bg-gray-900">
        <div class="h-full">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SlimTopBar from '~/components/layout/SlimTopBar.vue'
import SidebarIconBar from '~/components/layout/SidebarIconBar.vue'
import SidebarContextPanel from '~/components/layout/SidebarContextPanel.vue'

const route = useRoute()

// Determine active section based on current route
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard/clients')) return 'clients'
  if (path.startsWith('/dashboard/analysis')) return 'analysis'
  if (path.startsWith('/dashboard/reports')) return 'reports'
  return 'dashboard'
})

const handleSectionChange = (section) => {
  // Navigate to the main page of the selected section
  const routes = {
    dashboard: '/dashboard',
    clients: '/dashboard/clients',
    analysis: '/dashboard/analysis',
    reports: '/dashboard/reports'
  }

  if (routes[section]) {
    navigateTo(routes[section])
  }
}
</script>