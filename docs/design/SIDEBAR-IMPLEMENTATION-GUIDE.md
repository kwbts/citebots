# Sidebar Implementation Guide: Hover-to-Expand Navigation

## Overview

This guide explains how to build a reliable three-panel navigation system with a hover-expandable sidebar, based on the working Citebots implementation. The system includes:

1. **Icon Bar** - 64px collapsed, expands to 256px on hover
2. **Context Panel** - Fixed 288px width with contextual navigation
3. **Top Bar** - 64px height with branding and user menu
4. **Main Content** - Flexible width area

## Critical Architecture Decisions

### 1. Dual-Rendering Pattern (The Key to Reliable Expansion)

**Problem**: Many implementations try to smoothly animate width changes, leading to layout jumps, text overflow, and flickering.

**Solution**: Render the sidebar TWICE:

```vue
<template>
  <div class="relative h-full">
    <!-- BASE: Always visible at 64px -->
    <div class="w-16 bg-gray-900 border-r border-gray-700/60 flex flex-col h-full relative z-10">
      <!-- Icon-only buttons -->
    </div>

    <!-- OVERLAY: Shows on hover at 256px -->
    <div
      v-if="isExpanded"
      class="absolute top-0 left-0 w-64 h-full bg-gray-900 border-r border-gray-700/60 shadow-xl z-50"
    >
      <!-- Same buttons but with labels -->
    </div>
  </div>
</template>
```

**Why This Works**:
- Base sidebar maintains layout stability (no width changes)
- Overlay appears OVER content (doesn't push it)
- No complex transitions needed
- Text rendering is clean (no mid-animation clipping)

### 2. Positioning Strategy

```vue
<!-- Wrapper with hover detection -->
<div
  class="relative h-full"
  @mouseenter="isExpanded = true"
  @mouseleave="isExpanded = false"
>
  <!-- Base: Static positioning -->
  <div class="w-16 ... relative z-10">

  <!-- Overlay: Absolute positioning -->
  <div class="absolute top-0 left-0 w-64 ... z-50">
</div>
```

**Critical Details**:
- Wrapper has `relative` positioning
- Base has `relative` + `z-10` (stays on top when collapsed)
- Overlay has `absolute` + `z-50` (covers base when expanded)
- Hover detection on wrapper ensures smooth behavior

### 3. Button Duplication Pattern

You must render each button TWICE - once in base, once in overlay:

```vue
<!-- IN BASE SIDEBAR -->
<button
  @click="setActiveSection('dashboard')"
  :class="[
    'rounded-lg flex items-center h-12 transition-all duration-150',
    'w-10 justify-center',  // Fixed width, centered
    activeSection === 'dashboard'
      ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
  ]"
>
  <svg class="w-5 h-5 flex-shrink-0"><!-- Icon --></svg>
</button>

<!-- IN OVERLAY SIDEBAR -->
<button
  @click="setActiveSection('dashboard')"
  :class="[
    'rounded-lg flex items-center h-12 transition-all duration-150',
    'w-full px-3',  // Full width with padding
    activeSection === 'dashboard'
      ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
  ]"
>
  <svg class="w-5 h-5 flex-shrink-0"><!-- Icon --></svg>
  <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
    Dashboard
  </span>
</button>
```

**Key Differences**:
- Base: `w-10 justify-center` (icon only, centered)
- Overlay: `w-full px-3` (full width, left-aligned with padding)
- Overlay adds: `<span>` with label text
- Both share: Same click handler, same active state logic

## Complete Component Structure

### SidebarIconBar.vue

```vue
<template>
  <div
    class="relative h-full"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- ===== BASE SIDEBAR (64px) ===== -->
    <div class="w-16 bg-gray-900 border-r border-gray-700/60 flex flex-col h-full relative z-10">
      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col pt-4 pb-6 px-3">
        <div class="space-y-2">
          <!-- Dashboard Button -->
          <button
            @click="setActiveSection('dashboard')"
            :class="getButtonClasses('dashboard', false)"
          >
            <DashboardIcon class="w-5 h-5 flex-shrink-0" />
          </button>

          <!-- Clients Button -->
          <button
            @click="setActiveSection('clients')"
            :class="getButtonClasses('clients', false)"
          >
            <ClientsIcon class="w-5 h-5 flex-shrink-0" />
          </button>

          <!-- More sections... -->
        </div>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-3 border-t border-gray-700/60">
        <button
          @click="settingsMenuOpen = !settingsMenuOpen"
          class="rounded-lg flex items-center w-10 h-12 justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-150"
        >
          <SettingsIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- ===== EXPANDED OVERLAY (256px) ===== -->
    <div
      v-if="isExpanded"
      class="absolute top-0 left-0 w-64 h-full bg-gray-900 border-r border-gray-700/60 shadow-xl z-50 flex flex-col"
    >
      <!-- Navigation with Labels -->
      <nav class="flex-1 flex flex-col pt-4 pb-6 px-3">
        <div class="space-y-2">
          <!-- Dashboard Button (Expanded) -->
          <button
            @click="setActiveSection('dashboard')"
            :class="getButtonClasses('dashboard', true)"
          >
            <DashboardIcon class="w-5 h-5 flex-shrink-0" />
            <span class="ml-3 whitespace-nowrap font-semibold text-sm">
              Dashboard
            </span>
          </button>

          <!-- Clients Button (Expanded) -->
          <button
            @click="setActiveSection('clients')"
            :class="getButtonClasses('clients', true)"
          >
            <ClientsIcon class="w-5 h-5 flex-shrink-0" />
            <span class="ml-3 whitespace-nowrap font-semibold text-sm">
              Clients
            </span>
          </button>

          <!-- More sections... -->
        </div>
      </nav>

      <!-- Settings at bottom (Expanded) -->
      <div class="p-3 border-t border-gray-700/60">
        <button
          @click="settingsMenuOpen = !settingsMenuOpen"
          class="rounded-lg flex items-center w-full h-12 px-3 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-150"
        >
          <SettingsIcon class="w-5 h-5 flex-shrink-0" />
          <span class="ml-3 whitespace-nowrap font-semibold text-sm">
            Settings
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  activeSection: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['section-changed'])

const isExpanded = ref(false)
const settingsMenuOpen = ref(false)

const setActiveSection = (section) => {
  emit('section-changed', section)
}

const getButtonClasses = (section, isExpanded) => {
  const base = 'rounded-lg flex items-center h-12 transition-all duration-150 ease-out border'

  // Width and alignment based on expanded state
  const layout = isExpanded
    ? 'w-full px-3 justify-start'
    : 'w-10 justify-center'

  // Active state styling
  const isActive = props.activeSection === section
  const state = isActive
    ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-transparent'

  return [base, layout, state]
}
</script>
```

### Key Implementation Details

#### 1. Hover State Management

```javascript
const isExpanded = ref(false)

// In template:
@mouseenter="isExpanded = true"
@mouseleave="isExpanded = false"
```

**Important**: Put hover handlers on the outer wrapper, not individual buttons.

#### 2. Z-Index Layering

```css
/* Base sidebar */
.relative.z-10

/* Expanded overlay */
.absolute.z-50

/* Context panel (in separate component) */
.z-20
```

This ensures:
- Base shows when collapsed
- Overlay covers everything when expanded
- Context panel stays below overlay but above main content

#### 3. Icon Consistency

Always use `flex-shrink-0` on icons:

```vue
<svg class="w-5 h-5 flex-shrink-0">
```

This prevents icons from being squashed during layout changes.

#### 4. Text Truncation

Use `whitespace-nowrap` on label text:

```vue
<span class="ml-3 whitespace-nowrap font-semibold text-sm">
  Dashboard
</span>
```

This prevents text wrapping if the label is longer than expected.

## Layout Integration

### Dashboard Layout

```vue
<template>
  <div class="h-screen bg-gray-900 flex flex-col overflow-hidden">
    <!-- Top Bar (64px fixed) -->
    <SlimTopBar />

    <!-- Main Layout -->
    <div class="flex-1 flex min-h-0">
      <!-- Icon Sidebar (64px, expands to 256px) -->
      <SidebarIconBar
        :active-section="activeSection"
        @section-changed="handleSectionChange"
      />

      <!-- Context Panel (288px fixed) -->
      <SidebarContextPanel
        :active-section="activeSection"
      />

      <!-- Main Content (flexible) -->
      <main class="flex-1 overflow-y-auto bg-gray-900">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// Detect active section from route
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard/clients')) return 'clients'
  if (path.startsWith('/dashboard/reports')) return 'reports'
  // ... more sections
  return 'dashboard'
})

// Handle section change from icon bar
const handleSectionChange = (section) => {
  const routes = {
    dashboard: '/dashboard',
    clients: '/dashboard/clients',
    reports: '/dashboard/reports',
    // ... more routes
  }
  router.push(routes[section] || '/dashboard')
}
</script>
```

### Critical Layout CSS

```css
/* Outer container */
.h-screen          /* Full viewport height */
.flex.flex-col     /* Vertical stack */
.overflow-hidden   /* Prevent body scroll */

/* Main area */
.flex-1            /* Take remaining space */
.flex              /* Horizontal layout */
.min-h-0          /* Allow flex children to shrink */

/* Main content */
.flex-1            /* Take remaining width */
.overflow-y-auto   /* Scrollable content */
```

The `min-h-0` on the flex container is **critical** - without it, flex children won't respect their parent's height constraints.

## Context Panel Integration

### SidebarContextPanel.vue

```vue
<template>
  <div
    class="bg-gray-800 border-r border-gray-700/60 flex flex-col h-full"
    style="width: 288px; min-width: 288px; max-width: 288px; flex-shrink: 0;"
  >
    <!-- Section Header -->
    <div class="h-16 flex items-center px-6 border-b border-gray-700/60 flex-shrink-0">
      <h2 class="text-lg font-bold text-white">{{ sectionTitle }}</h2>
    </div>

    <!-- Navigation Content -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <!-- Dashboard Section -->
      <template v-if="activeSection === 'dashboard'">
        <NuxtLink to="/dashboard" :class="getNavClasses('/dashboard')">
          <HomeIcon class="w-4 h-4" />
          Home
        </NuxtLink>
      </template>

      <!-- More sections... -->
    </nav>
  </div>
</template>

<script setup>
const props = defineProps({
  activeSection: String
})

const route = useRoute()

const sectionTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    clients: 'Client Management',
    reports: 'Reports & Analysis',
    // ... more titles
  }
  return titles[props.activeSection] || 'Navigation'
})

const getNavClasses = (path) => {
  const isActive = route.path === path || route.path.startsWith(path + '/')

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

**Important**: Use inline styles for width to ensure it stays exactly 288px:

```html
style="width: 288px; min-width: 288px; max-width: 288px; flex-shrink: 0;"
```

## Common Pitfalls & Solutions

### Problem 1: Sidebar Jumps When Expanding

**Symptom**: Layout shifts when hovering over sidebar

**Cause**: Trying to animate width changes on a single element

**Solution**: Use dual-rendering pattern with absolute positioning

```vue
<!-- DON'T DO THIS -->
<div :class="isExpanded ? 'w-64' : 'w-16'">

<!-- DO THIS -->
<div class="relative">
  <div class="w-16"><!-- Base --></div>
  <div v-if="isExpanded" class="absolute ..."><!-- Overlay --></div>
</div>
```

### Problem 2: Text Clipping or Overflow

**Symptom**: Labels get cut off or wrapped during expansion

**Cause**: Text rendering during width transition

**Solution**: Only show text in the overlay (which doesn't transition)

```vue
<!-- In base: no text -->
<button class="w-10 justify-center">
  <Icon />
</button>

<!-- In overlay: full text -->
<button class="w-full px-3">
  <Icon />
  <span>Label</span>
</button>
```

### Problem 3: Hover Detection Issues

**Symptom**: Sidebar collapses when moving mouse between buttons

**Cause**: Hover detection on individual buttons with gaps

**Solution**: Put hover detection on the wrapper

```vue
<!-- DON'T DO THIS -->
<div>
  <button @mouseenter="expand">...</button>
  <button @mouseenter="expand">...</button>
</div>

<!-- DO THIS -->
<div @mouseenter="expand" @mouseleave="collapse">
  <button>...</button>
  <button>...</button>
</div>
```

### Problem 4: Active States Not Syncing

**Symptom**: Active state shows on base but not overlay (or vice versa)

**Cause**: Different logic for base and overlay buttons

**Solution**: Share the same computed class function

```javascript
const getButtonClasses = (section, isExpanded) => {
  // Same active state logic for both
  const isActive = props.activeSection === section

  return [
    'base-classes',
    isExpanded ? 'w-full px-3' : 'w-10 justify-center',
    isActive ? 'active-classes' : 'inactive-classes'
  ]
}
```

### Problem 5: Expanded Sidebar Appears Behind Content

**Symptom**: Overlay doesn't cover the context panel

**Cause**: Incorrect z-index values

**Solution**: Ensure overlay has highest z-index

```vue
<!-- Icon Bar Base -->
<div class="... z-10">

<!-- Icon Bar Overlay -->
<div class="... z-50">

<!-- Context Panel -->
<div class="... z-20">
```

## Responsive Considerations

### Mobile Handling

For mobile devices, you may want to disable hover expansion:

```vue
<div
  class="relative h-full"
  @mouseenter="!isMobile && (isExpanded = true)"
  @mouseleave="isExpanded = false"
>

<script setup>
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})
</script>
```

### Touch Device Support

For touch devices, consider adding a toggle button:

```vue
<button
  @click="isExpanded = !isExpanded"
  class="md:hidden"
>
  Toggle Menu
</button>
```

## Styling Guidelines

### Color System

```css
/* Active State */
bg-citebots-orange/15     /* 15% opacity background */
text-citebots-orange      /* Full color text */
border-citebots-orange/30 /* 30% opacity border */

/* Inactive State */
text-gray-400             /* Muted text */
border-transparent        /* No border */

/* Hover State */
hover:text-white
hover:bg-gray-800/50
```

### Transition Timing

Use consistent transition durations:

```css
transition-all duration-150 ease-out
```

This applies to:
- Background color changes
- Text color changes
- Border changes
- (But NOT width changes - those should be instant via v-if)

### Spacing System

```css
/* Icon spacing */
w-5 h-5         /* Icon size: 20px */
mr-3            /* Icon-to-text gap: 12px */

/* Button spacing */
h-12            /* Button height: 48px */
px-3            /* Horizontal padding: 12px */
space-y-2       /* Vertical gap: 8px */

/* Section spacing */
pt-4 pb-6       /* Top/bottom padding */
```

## Performance Optimization

### Minimize Re-renders

Use `v-if` sparingly - the overlay should only re-render when `isExpanded` changes:

```vue
<div v-if="isExpanded">
  <!-- Entire overlay content -->
</div>
```

Don't use `v-if` on individual elements inside the overlay.

### Event Listener Cleanup

If you add custom event listeners (for scroll forwarding, etc.), clean them up:

```javascript
onMounted(() => {
  sidebar.$el.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  sidebar.$el.removeEventListener('wheel', handleWheel)
})
```

## Testing Checklist

- [ ] Sidebar expands smoothly on hover
- [ ] Sidebar collapses when mouse leaves
- [ ] No layout shift when expanding/collapsing
- [ ] Text labels don't clip or wrap
- [ ] Active states sync between base and overlay
- [ ] Clicking sections navigates correctly
- [ ] Settings menu works in both states
- [ ] Z-index layering is correct
- [ ] Works with keyboard navigation
- [ ] Transitions feel smooth (150ms)
- [ ] No flickering or visual artifacts

## Example Use Cases

### Adding a New Section

1. Add button to base sidebar:

```vue
<button
  @click="setActiveSection('new-section')"
  :class="getButtonClasses('new-section', false)"
>
  <NewIcon class="w-5 h-5 flex-shrink-0" />
</button>
```

2. Add button to overlay:

```vue
<button
  @click="setActiveSection('new-section')"
  :class="getButtonClasses('new-section', true)"
>
  <NewIcon class="w-5 h-5 flex-shrink-0" />
  <span class="ml-3 whitespace-nowrap font-semibold text-sm">
    New Section
  </span>
</button>
```

3. Update route handler in layout:

```javascript
const activeSection = computed(() => {
  if (route.path.startsWith('/dashboard/new-section')) return 'new-section'
  // ... other sections
})

const handleSectionChange = (section) => {
  const routes = {
    'new-section': '/dashboard/new-section',
    // ... other routes
  }
  router.push(routes[section])
}
```

4. Add context panel content:

```vue
<template v-if="activeSection === 'new-section'">
  <NuxtLink to="/dashboard/new-section">Overview</NuxtLink>
  <!-- More links -->
</template>
```

## Summary

The key to a reliable hover-to-expand sidebar is the **dual-rendering pattern**:

1. **Base sidebar** (64px) - Always visible, maintains layout stability
2. **Overlay sidebar** (256px) - Shows on hover, positioned absolutely

This eliminates animation issues, prevents layout shift, and provides clean text rendering.

Additional critical points:

- Use `relative` wrapper with hover detection
- Base has `relative z-10`, overlay has `absolute z-50`
- Duplicate all buttons (icon-only in base, icon+label in overlay)
- Share active state logic between both
- Use `flex-shrink-0` on icons
- Use `whitespace-nowrap` on labels
- Keep transitions at 150ms
- Put fixed width on context panel via inline styles

Follow this pattern, and you'll have a sidebar that works reliably across all browsers and scenarios.
