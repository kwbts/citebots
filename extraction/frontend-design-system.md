# Citebots V1 Frontend Design System Extraction

## Overview

This document extracts the complete frontend design system from Citebots V1 for migration to V2 Next.js implementation. Focus on layout patterns, color schemes, typography, and component structure.

## Color Palette

### Primary Colors
```css
'citebots-orange': '#D36641'  /* Brand primary */
'citebots-dark': '#0D1B2A'    /* Dark text/headers */
```

### Gray Scale
```css
'citebots-gray': {
  50: '#f9fafb',   /* Lightest backgrounds */
  100: '#f3f4f6',  /* Light backgrounds */
  200: '#e5e7eb',  /* Borders */
  300: '#d1d5db',  /* Form borders */
  400: '#9ca3af',  /* Placeholder text */
  500: '#6b7280',  /* Secondary text */
  600: '#4b5563',  /* Navigation text */
  700: '#374151',  /* Dark text */
  800: '#1f2937',  /* Dark backgrounds */
  900: '#111827',  /* Darkest backgrounds */
}
```

### Dark Mode Colors
```css
/* Dark mode uses standard Tailwind grays */
gray-900: '#111827'  /* Main background */
gray-800: '#1f2937'  /* Card/panel backgrounds */
gray-700: '#374151'  /* Borders */
gray-600: '#4b5563'  /* Secondary elements */
gray-500: '#6b7280'  /* Text */
gray-400: '#9ca3af'  /* Muted text */
gray-300: '#d1d5db'  /* Light text */
gray-200: '#e5e7eb'  /* Lightest text */
```

## Typography

### Font Stack
```css
font-family: system-ui, -apple-system, sans-serif
```

### Heading Styles
```css
h1: text-3xl font-bold text-citebots-dark
h2: text-2xl font-semibold text-citebots-dark  
h3: text-xl font-semibold text-citebots-dark

/* Dark mode variants */
.dark h1, .dark h2, .dark h3: text-white
```

### Body Text
```css
body: font-sans bg-citebots-gray-50 text-citebots-gray-900 antialiased
.dark body: bg-gray-900 text-gray-100
```

## Layout Architecture

### Dashboard Layout Structure
```
┌─────────────────────────────────────────────┐
│              SlimTopBar (64px)              │
├─────┬─────────────────────────────────────┤
│ Icon│      Context Panel     │  Main      │
│ Bar │      (288px fixed)     │  Content   │
│(64px│                       │  (flex-1)  │
│hover│                       │            │
│264px│                       │            │
│     │                       │            │
└─────┴───────────────────────┴────────────┘
```

### Component Hierarchy
1. **SlimTopBar** - Fixed header with logo, user menu, dark mode toggle
2. **SidebarIconBar** - Collapsible icon navigation (64px → 264px on hover)
3. **SidebarContextPanel** - Context-sensitive navigation (288px fixed)
4. **Main Content** - Flexible content area with max-width container

## Component Styles

### Navigation Elements

#### Active State Pattern
```css
/* Icon sidebar buttons */
active: 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
inactive: 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'

/* Context panel navigation */
.nav-item-active: 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
.nav-item: 'text-gray-300 hover:text-white hover:bg-gray-700/50'
```

#### Transition Classes
```css
transition-all duration-150 ease-out
transition-colors duration-200
transition-transform duration-150
```

### Button Styles

#### Primary Button
```css
.btn-primary: 'btn bg-citebots-orange hover:bg-citebots-orange/90 text-white shadow-sm hover:shadow'
```

#### Secondary Button
```css
.btn-secondary: 'btn bg-white hover:bg-citebots-gray-50 text-citebots-gray-800 border border-citebots-gray-300 hover:border-citebots-gray-400'
.dark .btn-secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 hover:border-gray-500'
```

#### Outline Button
```css
.btn-outline: 'btn bg-transparent hover:bg-citebots-orange hover:text-white text-citebots-orange border border-citebots-orange'
```

### Form Elements

#### Input Fields
```css
.input-field: 'w-full px-4 py-2.5 bg-white border border-citebots-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-citebots-orange focus:border-citebots-orange transition-colors duration-200'
.dark .input-field: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-citebots-orange focus:border-citebots-orange'
```

### Card Components

#### Base Card
```css
.card: 'bg-white rounded-xl shadow-sm border border-citebots-gray-100 p-6 hover:shadow-md transition-shadow duration-200'
.dark .card: 'bg-gray-800 border-gray-700 text-white'
```

## Logo & Branding

### Robot Logo SVG
```svg
<!-- Citebots robot head with antenna -->
<svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <!-- Large robot head outline -->
  <rect x="4.5" y="6" width="15" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
  <!-- Antenna -->
  <line x1="12" y1="6" x2="12" y2="3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="12" cy="3" r="0.8" stroke="currentColor" stroke-width="1.5"/>
  <!-- Minimal eyes -->
  <line x1="9" y1="10.5" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="15" y1="10.5" x2="15" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Mouth line -->
  <line x1="10.5" y1="15" x2="13.5" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### Brand Typography
```css
/* Logo text */
font-size: text-xl (20px)
font-weight: font-bold
color: text-citebots-dark (light mode) / text-white (dark mode)
letter-spacing: tracking-tight
```

## Dark Mode Implementation

### Toggle Pattern
- Uses `class` strategy in Tailwind config
- Toggle button in top bar with sun/moon icons
- Consistent dark mode variants for all components

### Dark Mode Classes
```css
/* Background hierarchy */
bg-gray-900   /* Main background */
bg-gray-800   /* Panel/card backgrounds */
bg-gray-700   /* Interactive elements */

/* Text hierarchy */
text-white    /* Primary text */
text-gray-300 /* Secondary text */
text-gray-400 /* Muted text */

/* Borders */
border-gray-700/60  /* Primary borders */
border-gray-700/50  /* Secondary borders */
```

## Responsive Design

### Mobile Adaptations
- Sidebar collapses to mobile menu
- Top navigation shows hamburger menu
- Context panel slides over content
- Touch-friendly button sizes (44px minimum)

### Breakpoints
```css
sm: 640px   /* Small screens */
md: 768px   /* Medium screens */
lg: 1024px  /* Large screens */
xl: 1280px  /* Extra large */
```

## Focus & Accessibility

### Focus Rings
```css
focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900
```

### ARIA Patterns
- Proper button roles and states
- Screen reader labels
- Keyboard navigation support
- Color contrast compliance

## Animation Patterns

### Micro-interactions
```css
/* Hover states */
hover:bg-opacity-20
hover:scale-105
hover:shadow-md

/* Transitions */
transition-all duration-150 ease-out
transition-colors duration-200
transition-transform duration-150

/* Loading states */
opacity-50 cursor-not-allowed
```

### Page Transitions
```css
/* Vue transitions */
enter-active-class: "transition ease-out duration-150"
enter-from-class: "transform opacity-0 scale-95"
enter-to-class: "transform opacity-100 scale-100"
leave-active-class: "transition ease-in duration-100"
leave-from-class: "transform opacity-100 scale-100"
leave-to-class: "transform opacity-0 scale-95"
```

## Grid & Layout Utilities

### Dashboard Grid
```css
.grid-dashboard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
```

### Content Containers
```css
.content-container: 'w-full max-w-7xl mx-auto'
.page-header: 'mb-8'
.section-spacing: 'mb-8'
```

## Implementation Notes for V2

### Next.js Adaptations Needed
1. Convert Vue components to React/JSX
2. Replace NuxtLink with Next.js Link
3. Adapt composables to React hooks
4. Convert Tailwind config to Next.js format
5. Implement dark mode with next-themes

### Component Priority
1. **High Priority**: Layout shell, navigation, colors, typography
2. **Medium Priority**: Button variants, form styles, cards
3. **Low Priority**: Advanced animations, micro-interactions

### Preserved Patterns
- Three-panel layout structure
- Hover-expandable sidebar
- Context-sensitive navigation
- Orange accent color scheme
- Dark mode toggle placement
- Robot logo design
