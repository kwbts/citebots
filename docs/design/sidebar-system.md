# Sidebar Navigation System - Citebots

## Overview

The Citebots sidebar system is a sophisticated three-panel navigation architecture that provides:
- **Collapsible icon bar** with hover-to-expand functionality
- **Fixed context panel** with dynamic secondary navigation
- **Smooth micro-interactions** with 150ms transitions
- **Role-based visibility** for different user types
- **Route-aware state management** tied to URL paths

## Architecture

### Three-Panel Layout

```
┌──────────────────────────────────────────────────────────┐
│ SlimTopBar (64px logo + brand + user menu)              │
├──────┬─────────────────┬───────────────────────────────┐
│ Icon │ Context Panel   │ Main Content                   │
│ Bar  │ (288px fixed)   │ (flexible width)               │
│ 64px │                 │                                │
│ ↕️   │  - Dashboard    │  <slot />                      │
│ 256px│  - Clients      │                                │
│      │  - Reports      │                                │
│      │  - Actions      │                                │
│      │  - Admin        │                                │
└──────┴─────────────────┴───────────────────────────────┘
```

### File Structure

```
components/layout/
├── SidebarIconBar.vue        # Primary navigation with icons
├── SidebarContextPanel.vue   # Secondary navigation menu
└── SlimTopBar.vue            # Top header bar

layouts/
└── dashboard.vue             # Main layout that assembles all components

composables/
└── useDarkMode.ts            # Dark mode state management
```

## Component Details

### 1. SidebarIconBar.vue

**Purpose**: Primary navigation with collapsible/expandable icon bar

**Key Features**:
- 64px collapsed width (icon-only)
- 256px expanded width (icon + label)
- Hover trigger for expansion
- Dual rendering (base + overlay)
- Active state highlighting

**File**: `components/layout/SidebarIconBar.vue` (381 lines)

#### Basic Structure

```vue
<template>
  <div
    class="relative"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- Base Sidebar (Always Visible - 64px) -->
    <div class="w-16 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <!-- Logo Space (matches top bar) -->
      <div class="h-16 flex-shrink-0"></div>

      <!-- Navigation Sections -->
      <nav class="flex-1 flex flex-col p-3 space-y-2">
        <!-- Section: Dashboard -->
        <button
          @click="setActiveSection('dashboard')"
          :class="getSectionClasses('dashboard')"
        >
          <svg class="w-5 h-5"><!-- Icon --></svg>
        </button>

        <!-- Section: Clients -->
        <button
          @click="setActiveSection('clients')"
          :class="getSectionClasses('clients')"
        >
          <svg class="w-5 h-5"><!-- Icon --></svg>
        </button>

        <!-- More sections... -->
      </nav>

      <!-- Settings (Bottom) -->
      <div class="p-3 border-t border-gray-800">
        <!-- Settings dropdown -->
      </div>
    </div>

    <!-- Expanded Overlay (Shows on Hover) -->
    <div
      v-if="isExpanded"
      class="absolute left-0 top-0 w-64 h-full bg-gray-900 border-r border-gray-800 z-50"
    >
      <!-- Same structure as base, but with labels -->
      <div class="h-16"></div>

      <nav class="flex-1 flex flex-col p-3 space-y-2">
        <button
          @click="setActiveSection('dashboard')"
          :class="getSectionClasses('dashboard')"
        >
          <svg class="w-5 h-5 mr-3"><!-- Icon --></svg>
          <span>Dashboard</span>
        </button>
        <!-- More sections with labels... -->
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const isExpanded = ref(false)
const route = useRoute()
const router = useRouter()

// Props
const props = defineProps<{
  activeSection: string
}>()

// Emits
const emit = defineEmits(['section-changed'])

// Methods
const setActiveSection = (section: string) => {
  emit('section-changed', section)
}

const getSectionClasses = (section: string) => {
  const base = 'rounded-lg flex items-center h-12 transition-all duration-150'
  const collapsed = 'w-10 justify-center' // Collapsed state
  const expanded = 'w-full px-3' // Expanded state

  const isActive = props.activeSection === section

  const activeClasses = 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
  const inactiveClasses = 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'

  return [
    base,
    isExpanded.value ? expanded : collapsed,
    isActive ? activeClasses : inactiveClasses
  ]
}
</script>
```

#### Active State Styling

```vue
<button
  :class="[
    // Base styles
    'rounded-lg flex items-center h-12 transition-all duration-150',

    // Width (changes based on expanded state)
    isExpanded ? 'w-full px-3' : 'w-10 justify-center',

    // Active state
    activeSection === 'clients'
      ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
  ]"
>
  <svg class="w-5 h-5" :class="{ 'mr-3': isExpanded }"><!-- Icon --></svg>
  <span v-if="isExpanded">Clients</span>
</button>
```

#### Role-Based Visibility

```vue
<template v-if="userRole !== 'client'">
  <!-- Hide Dashboard, Clients, Analysis from client users -->
  <button @click="setActiveSection('dashboard')">
    Dashboard
  </button>
</template>

<template v-if="userRole === 'super_admin'">
  <!-- Admin section only for super admins -->
  <button @click="setActiveSection('admin')">
    Admin
  </button>
</template>
```

---

### 2. SidebarContextPanel.vue

**Purpose**: Secondary navigation with context-specific menu items

**Key Features**:
- 288px fixed width
- Always visible (not collapsible)
- Dynamic content based on active section
- Tab-based navigation for reports
- Analysis type awareness

**File**: `components/layout/SidebarContextPanel.vue` (431 lines)

#### Basic Structure

```vue
<template>
  <div
    class="bg-gray-800 border-r border-gray-700/60 flex flex-col"
    style="width: 288px; min-width: 288px;"
  >
    <!-- Section Header -->
    <div class="h-16 flex items-center px-6 border-b border-gray-700/60">
      <h2 class="text-base font-semibold text-white tracking-tight">
        {{ sectionTitle }}
      </h2>
    </div>

    <!-- Dynamic Navigation Content -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <!-- Dashboard Section -->
      <template v-if="activeSection === 'dashboard'">
        <NuxtLink
          to="/dashboard"
          :class="getNavItemClasses('/dashboard')"
        >
          <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
          Home
        </NuxtLink>

        <NuxtLink
          to="/dashboard/clients"
          :class="getNavItemClasses('/dashboard/clients')"
        >
          <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
          Manage Clients
        </NuxtLink>
      </template>

      <!-- Clients Section -->
      <template v-if="activeSection === 'clients'">
        <NuxtLink to="/dashboard/clients">Overview</NuxtLink>
        <NuxtLink to="/dashboard/clients?tab=add">Add Client</NuxtLink>
      </template>

      <!-- Reports Section (Dynamic Tabs) -->
      <template v-if="activeSection === 'reports'">
        <!-- Show tabs if on report detail page -->
        <template v-if="isReportDetailPage">
          <NuxtLink
            :to="`${getCurrentReportPath()}?tab=overview`"
            :class="getTabClasses('overview')"
          >
            Overview
          </NuxtLink>

          <NuxtLink
            :to="`${getCurrentReportPath()}?tab=brand-performance`"
            :class="getTabClasses('brand-performance')"
          >
            Brand Performance
          </NuxtLink>

          <!-- Hide certain tabs for query-only analysis -->
          <NuxtLink
            v-if="!isQueryOnly"
            :to="`${getCurrentReportPath()}?tab=technical-seo`"
          >
            Technical SEO
          </NuxtLink>
        </template>

        <!-- Show general links if on reports list page -->
        <template v-else>
          <NuxtLink to="/dashboard/analysis">Run Analysis</NuxtLink>
          <NuxtLink to="/dashboard/reports">All Reports</NuxtLink>
        </template>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const analysisType = ref<'comprehensive' | 'query-only'>('comprehensive')

// Props
const props = defineProps<{
  activeSection: string
}>()

// Computed properties
const sectionTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    clients: 'Client Management',
    analysis: 'Analysis',
    reports: 'Reports',
    actions: 'Actions',
    admin: 'Administration'
  }
  return titles[props.activeSection] || 'Navigation'
})

const isReportDetailPage = computed(() => {
  return route.path.startsWith('/dashboard/reports/') &&
         route.path !== '/dashboard/reports'
})

const isQueryOnly = computed(() => {
  return analysisType.value === 'query-only'
})

// Methods
const getNavItemClasses = (path: string) => {
  const isActive = route.path === path || route.path.startsWith(path + '/')

  return [
    'flex items-center px-4 py-3 text-sm font-semibold rounded-lg',
    'transition-all duration-150 border',
    isActive
      ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
      : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border-transparent'
  ]
}

const getTabClasses = (tab: string) => {
  const isActive = route.query.tab === tab ||
    (!route.query.tab && tab === 'overview')

  return getNavItemClasses(isActive ? route.path : '')
}

const getCurrentReportPath = () => {
  return route.path
}

// Fetch analysis type for dynamic navigation
const fetchAnalysisType = async () => {
  if (!isReportDetailPage.value) return

  const reportId = route.path.split('/').pop()
  const client = useSupabaseClient()

  const { data } = await client
    .from('analysis_runs')
    .select('analysis_type')
    .eq('id', reportId)
    .single()

  if (data?.analysis_type) {
    analysisType.value = data.analysis_type
  }
}

// Watch route changes
watch(() => route.path, fetchAnalysisType, { immediate: true })
</script>
```

#### Navigation Item Styling

```vue
<style scoped>
.nav-item {
  @apply flex items-center px-4 py-3 text-sm font-semibold rounded-lg;
  @apply transition-all duration-150 border border-transparent;
  @apply text-gray-300 hover:text-white hover:bg-gray-700/50;
}

.nav-item-active {
  @apply bg-citebots-orange/15 text-citebots-orange;
  @apply border-citebots-orange/30;
}
</style>
```

---

### 3. Dashboard Layout

**Purpose**: Main layout that assembles all sidebar components

**File**: `layouts/dashboard.vue` (107 lines)

#### Complete Layout Implementation

```vue
<template>
  <div class="h-screen bg-gray-900 flex flex-col">
    <!-- Top Bar -->
    <SlimTopBar />

    <!-- Main Layout -->
    <div class="flex-1 flex min-h-0">
      <!-- Icon Sidebar (64px, expandable to 256px) -->
      <SidebarIconBar
        ref="iconSidebar"
        :active-section="activeSection"
        @section-changed="handleSectionChange"
      />

      <!-- Context Panel (288px, fixed) -->
      <SidebarContextPanel
        ref="contextSidebar"
        :active-section="activeSection"
      />

      <!-- Main Content Area -->
      <main
        ref="mainContent"
        class="flex-1 overflow-y-auto bg-gray-900"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Refs for scroll forwarding
const iconSidebar = ref()
const contextSidebar = ref()
const mainContent = ref()

// Detect active section from route
const activeSection = computed(() => {
  const path = route.path

  if (path.startsWith('/dashboard/clients')) return 'clients'
  if (path.startsWith('/dashboard/analysis')) return 'analysis'
  if (path.startsWith('/dashboard/reports')) return 'reports'
  if (path.startsWith('/dashboard/actions')) return 'actions'
  if (path.startsWith('/dashboard/admin')) return 'admin'

  return 'dashboard'
})

// Handle section change from icon bar
const handleSectionChange = (section: string) => {
  const routes = {
    dashboard: '/dashboard',
    clients: '/dashboard/clients',
    analysis: '/dashboard/analysis',
    reports: '/dashboard/reports',
    actions: '/dashboard/actions',
    admin: '/dashboard/admin'
  }

  router.push(routes[section] || '/dashboard')
}

// Scroll forwarding: Forward wheel events from sidebars to main content
const forwardScrollToMain = (event: WheelEvent) => {
  if (mainContent.value) {
    event.preventDefault()
    mainContent.value.scrollBy({
      top: event.deltaY,
      behavior: 'auto'
    })
  }
}

// Setup scroll forwarding on mount
onMounted(() => {
  if (iconSidebar.value?.$el) {
    iconSidebar.value.$el.addEventListener('wheel', forwardScrollToMain, {
      passive: false
    })
  }

  if (contextSidebar.value?.$el) {
    contextSidebar.value.$el.addEventListener('wheel', forwardScrollToMain, {
      passive: false
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (iconSidebar.value?.$el) {
    iconSidebar.value.$el.removeEventListener('wheel', forwardScrollToMain)
  }

  if (contextSidebar.value?.$el) {
    contextSidebar.value.$el.removeEventListener('wheel', forwardScrollToMain)
  }
})
</script>
```

---

## Implementation Guide

### Step 1: Create a New Page with Sidebar

```vue
<!-- pages/dashboard/your-page.vue -->
<template>
  <div class="max-w-6xl mx-auto p-8">
    <h1 class="text-2xl font-bold text-white mb-6">Your Page Title</h1>

    <!-- Your page content -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'  // This enables the sidebar system
})
</script>
```

The sidebar automatically:
- Detects the section from your route path
- Highlights the appropriate icon
- Shows contextual navigation

### Step 2: Add a New Section to Icon Bar

```vue
<!-- components/layout/SidebarIconBar.vue -->

<!-- In the collapsed state -->
<button
  @click="setActiveSection('your-section')"
  :class="[
    'rounded-lg flex items-center h-12 justify-center w-10',
    'transition-all duration-150',
    activeSection === 'your-section'
      ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
  ]"
>
  <svg class="w-5 h-5">
    <!-- Your icon SVG -->
  </svg>
</button>

<!-- In the expanded state -->
<button
  @click="setActiveSection('your-section')"
  :class="[
    'rounded-lg flex items-center h-12 w-full px-3',
    'transition-all duration-150',
    activeSection === 'your-section'
      ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
  ]"
>
  <svg class="w-5 h-5 mr-3">
    <!-- Your icon SVG -->
  </svg>
  <span class="text-sm font-semibold">Your Section</span>
</button>
```

### Step 3: Add Secondary Navigation for Your Section

```vue
<!-- components/layout/SidebarContextPanel.vue -->

<template v-if="activeSection === 'your-section'">
  <NuxtLink
    to="/dashboard/your-section"
    :class="getNavItemClasses('/dashboard/your-section')"
  >
    <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
    Overview
  </NuxtLink>

  <NuxtLink
    to="/dashboard/your-section/feature-1"
    :class="getNavItemClasses('/dashboard/your-section/feature-1')"
  >
    <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
    Feature 1
  </NuxtLink>

  <NuxtLink
    to="/dashboard/your-section/feature-2"
    :class="getNavItemClasses('/dashboard/your-section/feature-2')"
  >
    <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
    Feature 2
  </NuxtLink>
</template>
```

### Step 4: Update Layout Section Detection

```vue
<!-- layouts/dashboard.vue -->

const activeSection = computed(() => {
  const path = route.path

  // Add your new section
  if (path.startsWith('/dashboard/your-section')) return 'your-section'

  // ... existing sections
  if (path.startsWith('/dashboard/clients')) return 'clients'
  if (path.startsWith('/dashboard/reports')) return 'reports'

  return 'dashboard'
})

const handleSectionChange = (section: string) => {
  const routes = {
    'your-section': '/dashboard/your-section',  // Add route
    dashboard: '/dashboard',
    clients: '/dashboard/clients',
    // ... other routes
  }

  router.push(routes[section] || '/dashboard')
}
```

### Step 5: Update Context Panel Section Title

```vue
<!-- components/layout/SidebarContextPanel.vue -->

const sectionTitle = computed(() => {
  const titles = {
    'your-section': 'Your Section Title',  // Add title
    dashboard: 'Dashboard',
    clients: 'Client Management',
    // ... other titles
  }
  return titles[props.activeSection] || 'Navigation'
})
```

---

## Advanced Features

### 1. Tab-Based Navigation (Reports Pattern)

For pages that need multiple sub-views without changing the URL path:

```vue
<!-- In SidebarContextPanel.vue -->

<template v-if="activeSection === 'reports' && isReportDetailPage">
  <!-- Overview Tab -->
  <NuxtLink
    :to="`${currentPath}?tab=overview`"
    :class="getTabClasses('overview')"
  >
    Overview
  </NuxtLink>

  <!-- Performance Tab -->
  <NuxtLink
    :to="`${currentPath}?tab=performance`"
    :class="getTabClasses('performance')"
  >
    Performance
  </NuxtLink>
</template>

<script setup>
const getTabClasses = (tab: string) => {
  const isActive = route.query.tab === tab ||
    (!route.query.tab && tab === 'overview')

  return [
    'flex items-center px-4 py-3 text-sm font-semibold rounded-lg',
    'transition-all duration-150 border',
    isActive
      ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
      : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border-transparent'
  ]
}
</script>
```

### 2. Conditional Tab Visibility (Analysis Type Pattern)

Show/hide tabs based on data fetched from the database:

```vue
<!-- In SidebarContextPanel.vue -->

<script setup>
const analysisType = ref<'comprehensive' | 'query-only'>('comprehensive')

const fetchAnalysisType = async () => {
  const reportId = route.params.id
  const client = useSupabaseClient()

  const { data } = await client
    .from('analysis_runs')
    .select('analysis_type')
    .eq('id', reportId)
    .single()

  analysisType.value = data?.analysis_type || 'comprehensive'
}

const isQueryOnly = computed(() => analysisType.value === 'query-only')

watch(() => route.path, fetchAnalysisType, { immediate: true })
</script>

<template>
  <!-- Show only for comprehensive analysis -->
  <NuxtLink
    v-if="!isQueryOnly"
    :to="`${currentPath}?tab=technical-seo`"
  >
    Technical SEO
  </NuxtLink>

  <!-- Always show -->
  <NuxtLink :to="`${currentPath}?tab=overview`">
    Overview
  </NuxtLink>
</template>
```

### 3. Role-Based Navigation Items

```vue
<!-- In SidebarIconBar.vue or SidebarContextPanel.vue -->

<script setup>
const user = useSupabaseUser()
const userRole = ref('client')

watch(user, async (newUser) => {
  if (newUser) {
    const client = useSupabaseClient()
    const { data } = await client
      .from('profiles')
      .select('role')
      .eq('id', newUser.id)
      .single()

    userRole.value = data?.role || 'client'
  }
}, { immediate: true })
</script>

<template>
  <!-- Only show for super_admin -->
  <template v-if="userRole === 'super_admin'">
    <NuxtLink to="/dashboard/admin">
      Admin Panel
    </NuxtLink>
  </template>

  <!-- Hide from client users -->
  <template v-if="userRole !== 'client'">
    <NuxtLink to="/dashboard/clients">
      Manage Clients
    </NuxtLink>
  </template>
</template>
```

---

## Styling Guide

### Color Palette

```css
/* Active/Selected State */
bg-citebots-orange/15          /* Background: 15% opacity orange */
text-citebots-orange           /* Text: full orange */
border-citebots-orange/30      /* Border: 30% opacity orange */

/* Hover State */
hover:bg-gray-800/50           /* Icon Bar hover */
hover:bg-gray-700/50           /* Context Panel hover */
hover:text-white               /* Text on hover */

/* Inactive State */
text-gray-400                  /* Default text color */
text-gray-300                  /* Context panel text */
border-transparent             /* No border */

/* Backgrounds */
bg-gray-900                    /* Icon Bar background */
bg-gray-800                    /* Context Panel background */
border-gray-800                /* Icon Bar borders */
border-gray-700/60             /* Context Panel borders */
```

### Transitions

All interactive elements use consistent transitions:

```css
transition-all duration-150 ease-out
```

Applied to:
- Background colors
- Text colors
- Border colors
- Width changes (sidebar expansion)

### Spacing (8px Grid System)

```css
/* Navigation Items */
px-4 py-3      /* Padding: 16px horizontal, 12px vertical */
space-y-1      /* Gap between items: 4px */
space-y-2      /* Gap between sections: 8px */

/* Containers */
p-3            /* Sidebar padding: 12px */
p-4            /* Context panel padding: 16px */
px-6           /* Header padding: 24px */

/* Heights */
h-12           /* Button height: 48px */
h-16           /* Header height: 64px */
```

### Typography

```css
/* Section Titles */
text-base font-semibold tracking-tight

/* Navigation Items */
text-sm font-semibold

/* Icon + Label Spacing */
mr-3           /* 12px gap between icon and text */
```

---

## Best Practices

### 1. Route-Based Active States

Always derive active states from the route, not local state:

```typescript
// Good: Route-based
const isActive = computed(() => route.path.startsWith('/dashboard/clients'))

// Bad: Local state
const activeTab = ref('clients')
```

### 2. Section Detection in Layout

Keep section detection in the layout, not in sidebar components:

```typescript
// In layouts/dashboard.vue
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard/clients')) return 'clients'
  return 'dashboard'
})
```

### 3. Navigation Consistency

Use consistent patterns for navigation items:

```vue
<NuxtLink
  :to="path"
  :class="[
    'flex items-center px-4 py-3 text-sm font-semibold rounded-lg',
    'transition-all duration-150 border',
    isActive
      ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
      : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border-transparent'
  ]"
>
  <svg class="w-4 h-4 mr-3"><!-- Icon --></svg>
  {{ label }}
</NuxtLink>
```

### 4. Scroll Forwarding

Always implement scroll forwarding to prevent sidebar scroll:

```typescript
const forwardScrollToMain = (event: WheelEvent) => {
  if (mainContent.value) {
    event.preventDefault()
    mainContent.value.scrollBy({
      top: event.deltaY,
      behavior: 'auto'
    })
  }
}

onMounted(() => {
  sidebar.$el.addEventListener('wheel', forwardScrollToMain, {
    passive: false
  })
})
```

### 5. Accessibility

Ensure keyboard navigation works:

```vue
<button
  type="button"
  @click="navigate"
  @keydown.enter="navigate"
  @keydown.space.prevent="navigate"
>
  Navigation Item
</button>
```

---

## Common Patterns

### Adding a Dropdown Menu

```vue
<div class="relative" v-click-outside="() => isOpen = false">
  <!-- Trigger -->
  <button @click="isOpen = !isOpen">
    Settings
  </button>

  <!-- Menu -->
  <div
    v-if="isOpen"
    class="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
  >
    <NuxtLink
      to="/dashboard/admin/profile"
      class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
    >
      Profile
    </NuxtLink>

    <button
      @click="signOut"
      class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
    >
      Sign Out
    </button>
  </div>
</div>
```

### Adding Dividers Between Sections

```vue
<nav class="space-y-1">
  <!-- Section 1 -->
  <NuxtLink to="/path1">Item 1</NuxtLink>
  <NuxtLink to="/path2">Item 2</NuxtLink>

  <!-- Divider -->
  <div class="border-t border-gray-700/60 my-3"></div>

  <!-- Section 2 -->
  <NuxtLink to="/path3">Item 3</NuxtLink>
  <NuxtLink to="/path4">Item 4</NuxtLink>
</nav>
```

### Adding Section Headers

```vue
<div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
  Section Title
</div>

<NuxtLink to="/path">Item</NuxtLink>
```

---

## Troubleshooting

### Sidebar Not Expanding

Check that you have both hover states set:

```vue
<div
  @mouseenter="isExpanded = true"
  @mouseleave="isExpanded = false"
>
```

### Active State Not Highlighting

Ensure your route detection is correct:

```typescript
// Check for exact match
route.path === '/dashboard/clients'

// Check for path prefix
route.path.startsWith('/dashboard/clients')
```

### Navigation Not Working

Verify your section change handler:

```typescript
const handleSectionChange = (section: string) => {
  const routes = {
    clients: '/dashboard/clients',
    // ... add your section
  }
  router.push(routes[section] || '/dashboard')
}
```

### Tabs Not Switching

Make sure you're watching query params:

```typescript
const activeTab = computed(() => {
  return route.query.tab || 'overview'
})
```

### Scroll Not Forwarding

Check that event listeners are attached:

```typescript
onMounted(() => {
  if (sidebar.value?.$el) {
    sidebar.value.$el.addEventListener('wheel', forwardScrollToMain, {
      passive: false  // Important!
    })
  }
})
```

---

## Summary

The Citebots sidebar system provides:

1. **Icon Bar**: Collapsible primary navigation (64px → 256px)
2. **Context Panel**: Fixed secondary navigation (288px)
3. **Route-Aware**: Automatic section detection from URL
4. **Role-Based**: Conditional visibility based on user role
5. **Tab Support**: Query parameter-based sub-navigation
6. **Smooth UX**: Consistent 150ms transitions
7. **Scroll Forwarding**: Prevents sidebar scrolling

**Key Files**:
- `components/layout/SidebarIconBar.vue` (381 lines)
- `components/layout/SidebarContextPanel.vue` (431 lines)
- `layouts/dashboard.vue` (107 lines)
- `components/layout/SlimTopBar.vue` (223 lines)

**Total System**: ~1,223 lines of code

This architecture provides a scalable, maintainable navigation system that adapts to user roles, route changes, and dynamic content requirements.
 