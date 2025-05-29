<template>
  <div class="h-screen bg-gray-900 flex flex-col overflow-hidden">
    <!-- Slim Top Bar -->
    <SlimTopBar />

    <!-- Main layout with two sidebars -->
    <div class="flex-1 flex min-h-0">
      <!-- Icon Bar (expandable on hover) -->
      <SidebarIconBar
        ref="iconSidebar"
        :active-section="activeSection"
        @section-changed="handleSectionChange"
        class="sidebar-area"
      />

      <!-- Context Panel (always open) -->
      <SidebarContextPanel
        ref="contextSidebar"
        :active-section="activeSection"
        class="sidebar-area"
      />

      <!-- Main content -->
      <main ref="mainContent" class="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  if (path.startsWith('/dashboard/admin')) return 'admin'
  return 'dashboard'
})

const handleSectionChange = (section) => {
  // Navigate to the main page of the selected section
  const routes = {
    dashboard: '/dashboard',
    clients: '/dashboard/clients',
    analysis: '/dashboard/analysis',
    reports: '/dashboard/reports',
    admin: '/dashboard/admin'
  }

  if (routes[section]) {
    navigateTo(routes[section])
  }
}

// Template refs
const iconSidebar = ref(null)
const contextSidebar = ref(null)
const mainContent = ref(null)

// Scroll forwarding functionality
const forwardScrollToMain = (event) => {
  if (mainContent.value) {
    // Prevent default scrolling on the sidebar
    event.preventDefault()

    // Forward the scroll event to the main content
    mainContent.value.scrollBy({
      top: event.deltaY,
      behavior: 'auto'
    })
  }
}

onMounted(() => {
  // Add wheel event listeners to both sidebars
  if (iconSidebar.value?.$el) {
    iconSidebar.value.$el.addEventListener('wheel', forwardScrollToMain, { passive: false })
  }

  if (contextSidebar.value?.$el) {
    contextSidebar.value.$el.addEventListener('wheel', forwardScrollToMain, { passive: false })
  }
})

onUnmounted(() => {
  // Clean up event listeners
  if (iconSidebar.value?.$el) {
    iconSidebar.value.$el.removeEventListener('wheel', forwardScrollToMain)
  }

  if (contextSidebar.value?.$el) {
    contextSidebar.value.$el.removeEventListener('wheel', forwardScrollToMain)
  }
})
</script>