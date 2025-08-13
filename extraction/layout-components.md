# Citebots V1 Layout Components for V2 Migration

## Component: SlimTopBar
**Purpose**: Fixed header with branding, user menu, and dark mode toggle  
**V1 Location**: `/components/layout/SlimTopBar.vue`  
**V2 Location**: `/components/layout/TopBar.tsx`  
**Dependencies**: User authentication, dark mode hook, router navigation  
**Notes**: Includes custom robot logo SVG, user initials generation, dropdown menu

### Working Code:
```vue
<template>
  <div class="h-16 bg-gray-900 border-b border-gray-700/60 flex items-center justify-between">
    <!-- Left: Logo positioned exactly like sidebar icons -->
    <div class="w-16 flex-shrink-0 px-2 flex items-center justify-center">
      <NuxtLink to="/" class="w-12 h-12 bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg flex items-center justify-center hover:bg-citebots-orange/20 dark:hover:bg-citebots-orange/25 transition-all duration-150 ease-out group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900">
        <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <!-- Robot head SVG paths -->
          <rect x="4.5" y="6" width="15" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="6" x2="12" y2="3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="12" cy="3" r="0.8" stroke="currentColor" stroke-width="1.5"/>
          <line x1="9" y1="10.5" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="15" y1="10.5" x2="15" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="10.5" y1="15" x2="13.5" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </NuxtLink>
    </div>

    <!-- Center: Brand text -->
    <div class="flex-1 px-6">
      <span class="text-xl font-bold text-white tracking-tight">Citebots</span>
    </div>

    <!-- Right: User & Actions -->
    <div class="flex items-center space-x-4 pr-8">
      <!-- Dark Mode Toggle Button -->
      <button
        @click="darkMode.toggle"
        class="p-3 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <!-- Sun/Moon icons -->
      </button>

      <!-- User Menu Dropdown -->
      <div class="relative">
        <button class="flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg">
          <div class="w-8 h-8 bg-citebots-orange/10 border border-citebots-orange/20 rounded-lg flex items-center justify-center">
            <span class="text-citebots-orange text-sm font-semibold">{{ userInitials }}</span>
          </div>
          <span class="text-base font-medium">{{ userEmail }}</span>
        </button>
        <!-- Dropdown menu -->
      </div>
    </div>
  </div>
</template>
```

### Required Changes for V2:
- Convert Vue template to JSX
- Replace NuxtLink with Next.js Link
- Convert Vue refs to React useState
- Adapt user authentication to Next.js pattern
- Convert dark mode composable to next-themes

---

## Component: SidebarIconBar
**Purpose**: Collapsible icon navigation that expands on hover  
**V1 Location**: `/components/layout/SidebarIconBar.vue`  
**V2 Location**: `/components/layout/IconSidebar.tsx`  
**Dependencies**: User role permissions, routing, hover state management  
**Notes**: 64px base width, expands to 264px on hover with text labels

### Working Code:
```vue
<template>
  <div 
    class="relative h-full"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- Base sidebar - always 64px wide -->
    <div class="w-16 bg-gray-900 border-r border-gray-700/60 flex flex-col h-full relative z-10">
      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col pt-4 pb-6 px-3">
        <div class="space-y-2">
          <!-- Dashboard Button -->
          <button
            v-if="!isClient"
            @click="setActiveSection('dashboard')"
            :class="[
              'rounded-lg flex items-center h-12 justify-center transition-all duration-150 ease-out relative',
              'w-10',
              activeSection === 'dashboard'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </button>
          <!-- More navigation buttons... -->
        </div>
      </nav>
    </div>

    <!-- Expanded overlay with text labels -->
    <div
      v-if="isExpanded"
      class="absolute top-0 left-0 w-64 h-full bg-gray-900 border-r border-gray-700/60 shadow-xl z-50 transition-all duration-200 ease-out flex flex-col"
    >
      <!-- Expanded navigation with labels -->
    </div>
  </div>
</template>
```

### Required Changes for V2:
- Convert Vue hover events to React onMouseEnter/Leave
- Replace Vue v-if with React conditional rendering
- Convert role-based visibility logic
- Adapt click handlers to Next.js router

---

## Component: SidebarContextPanel
**Purpose**: Context-sensitive navigation panel (288px fixed width)  
**V1 Location**: `/components/layout/SidebarContextPanel.vue`  
**V2 Location**: `/components/layout/ContextPanel.tsx`  
**Dependencies**: Current route, active section, user permissions  
**Notes**: Shows different navigation based on active section

### Working Code:
```vue
<template>
  <div class="bg-gray-800 border-r border-gray-700/60 flex flex-col h-full" style="width: 288px; min-width: 288px; max-width: 288px; flex-shrink: 0;">
    <!-- Section Header -->
    <div class="h-16 flex items-center px-6 border-b border-gray-700/60 flex-shrink-0">
      <h2 class="text-lg font-bold text-white tracking-tight">{{ sectionTitle }}</h2>
    </div>

    <!-- Navigation Content -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <!-- Dashboard Section -->
      <template v-if="activeSection === 'dashboard'">
        <div class="mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">OVERVIEW</h3>
          <NuxtLink to="/dashboard" class="nav-item" :class="{ 'nav-item-active': $route.path === '/dashboard' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            Home
          </NuxtLink>
        </div>
      </template>
      <!-- More sections... -->
    </nav>
  </div>
</template>

<style scoped>
.nav-item {
  @apply flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-150 ease-out border border-transparent;
}

.nav-item-active {
  @apply bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30;
}
</style>
```

### Required Changes for V2:
- Convert Vue template conditionals to React
- Replace NuxtLink with Next.js Link
- Convert Tailwind @apply styles to Tailwind classes or CSS modules
- Adapt route matching logic

---

## Component: DashboardLayout
**Purpose**: Main layout wrapper coordinating all layout components  
**V1 Location**: `/layouts/dashboard.vue`  
**V2 Location**: `/components/layout/DashboardLayout.tsx`  
**Dependencies**: All child layout components, routing, scroll management  
**Notes**: Handles scroll forwarding from sidebars to main content

### Working Code:
```vue
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
const route = useRoute()

// Determine active section based on current route
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard/clients')) return 'clients'
  if (path.startsWith('/dashboard/analysis')) return 'analysis'
  if (path.startsWith('/dashboard/reports')) return 'reports'
  if (path.startsWith('/dashboard/actions')) return 'actions'
  if (path.startsWith('/dashboard/admin')) return 'admin'
  return 'dashboard'
})
</script>
```

### Required Changes for V2:
- Convert Vue layout to React component with children prop
- Replace Vue slot with React children
- Convert computed properties to useMemo hooks
- Adapt routing logic to Next.js useRouter
- Convert scroll event handling to React refs and useEffect

---

## Navigation Icons Library

### Dashboard Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M8 21l8-8" />
</svg>
```

### Clients Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>
```

### Analysis Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
```

### Reports Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
```

### Actions Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg>
```

### Admin Icon
```svg
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
</svg>
```

---

## Layout Responsive Behavior

### Desktop (1024px+)
- Full three-panel layout
- Icon sidebar expands on hover
- Context panel always visible

### Tablet (768px - 1023px)
- Context panel slides over content when needed
- Icon sidebar remains collapsible
- Top bar remains fixed

### Mobile (< 768px)
- Single panel layout
- Navigation via mobile menu in top bar
- Full-screen content area

---

## Performance Considerations

### Optimizations Applied
1. Fixed positioning prevents layout shifts
2. CSS transforms for hover animations
3. Debounced scroll event handling
4. Lazy loading of navigation icons
5. Memoized route calculations

### Memory Management
1. Event listener cleanup on unmount
2. Proper ref management for scroll forwarding
3. Conditional rendering of expanded states
