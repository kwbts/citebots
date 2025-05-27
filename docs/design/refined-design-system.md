# Refined Design System - Citebots

## Overview

This document outlines the refined design system implemented for Citebots, focusing on clean aesthetics, premium micro-interactions, and consistent visual hierarchy. The design maintains the existing orange brand color while introducing subtle refinements that enhance usability and visual appeal.

## Design Philosophy

### Core Principles
1. **Clean & Minimal**: Reduced visual noise through subtle borders, refined spacing, and simplified color usage
2. **Premium Micro-interactions**: 150ms ease-out transitions with subtle scale transforms for tactile feedback
3. **Consistent Hierarchy**: Clear typography scales with proper tracking and font weights
4. **Accessibility First**: Proper focus states, contrast ratios, and keyboard navigation
5. **8px Grid System**: Mathematical spacing for visual consistency

## Color System

### Primary Brand Colors
```css
/* Citebots Orange */
--citebots-orange: #ea580c
--citebots-orange-10: rgb(234 88 12 / 0.1)   /* Subtle backgrounds */
--citebots-orange-15: rgb(234 88 12 / 0.15)  /* Active states */
--citebots-orange-20: rgb(234 88 12 / 0.2)   /* Hover states */
--citebots-orange-30: rgb(234 88 12 / 0.3)   /* Borders */
--citebots-orange-50: rgb(234 88 12 / 0.5)   /* Focus rings */
```

### Usage Guidelines
- **Active States**: Use `bg-citebots-orange/15` with `border-citebots-orange/30`
- **Hover States**: Use `hover:bg-citebots-orange/20`
- **Focus States**: Use `focus:ring-citebots-orange/50`
- **Subtle Backgrounds**: Use `bg-citebots-orange/10` for logo containers

### Semantic Colors
```css
/* Success (using semantic green) */
--success-green: #10b981
--success-green-10: rgb(16 185 129 / 0.1)
```

### Gray Scale Refinements
```css
/* Refined borders with transparency */
border-gray-700/60     /* Softer than solid gray-700 */
bg-gray-800/50         /* Subtle hover backgrounds */
text-gray-400          /* Section headers and inactive text */
```

## Typography System

### Font Weights & Tracking
```css
/* Headers & Important Text */
font-bold tracking-tight

/* Navigation & Interactive Elements */
font-semibold text-sm tracking-tight

/* Section Headers */
font-bold text-xs uppercase tracking-wider

/* Body Text */
font-medium (default)
```

### Text Hierarchy
```css
/* Main Dashboard Cards */
text-2xl font-bold tracking-tight mb-3

/* Card Descriptions */
text-gray-600 dark:text-gray-400 text-sm leading-relaxed

/* Section Headers */
text-xs font-bold text-gray-400 uppercase tracking-wider

/* Navigation Items */
text-sm font-semibold tracking-tight
```

## Spacing System (8px Grid)

### Consistent Spacing Values
```css
/* Component Padding */
p-8                    /* Card content: 32px */
px-4 py-3             /* Button padding: 16px/12px */
px-6                  /* Header padding: 24px */

/* Margins & Gaps */
gap-8                 /* Card grid: 32px */
mb-6, mb-12          /* Section spacing: 24px/48px */
gap-2, gap-3         /* Small element spacing: 8px/12px */

/* Component Spacing */
pt-4 pb-6            /* Navigation: 16px/24px */
space-y-3            /* Button groups: 12px */
```

## Interactive Elements

### Button Styles

#### Primary Action Buttons
```vue
<button class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-4 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2">
  Button Text
</button>
```

#### Secondary Buttons
```vue
<button class="bg-gray-700/50 text-gray-300 border border-transparent rounded-lg px-4 py-3 font-semibold text-sm hover:bg-gray-700 hover:text-white hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2">
  Button Text
</button>
```

#### Navigation Items
```vue
<button class="flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-150 ease-out border border-transparent focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2">
  <svg class="w-4 h-4 mr-3" stroke-width="2">...</svg>
  Nav Item
</button>
```

### Active States
```css
/* Navigation Active */
bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30

/* Card Active (for interactive cards) */
group-hover:scale-[0.98] group-active:scale-[0.96]
```

### Micro-interactions
```css
/* Standard Transition */
transition-all duration-150 ease-out

/* Hover Scales */
hover:scale-[0.98]     /* Subtle press effect */
active:scale-[0.96]    /* Active press feedback */

/* Focus States (all interactive elements) */
focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900
```

## Component Patterns

### Dashboard Cards
```vue
<NuxtLink to="/path" class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
    <div class="mb-6">
      <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
        <svg class="w-6 h-6 text-citebots-orange" stroke-width="2">...</svg>
      </div>
    </div>
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Card Title</h3>
    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Card description text</p>
  </div>
</NuxtLink>
```

### Navigation Sections
```vue
<div class="mb-6">
  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">SECTION TITLE</h3>
  <!-- Navigation items -->
</div>
```

### Icon Treatment
```css
/* Standard Icon Size */
w-4 h-4           /* Small icons (navigation) */
w-5 h-5           /* Medium icons (sidebar) */
w-6 h-6           /* Large icons (cards) */

/* Icon Stroke */
stroke-width="2"  /* All icons use stroke-width 2 */

/* Icon Spacing */
mr-3              /* Icon to text spacing */
```

## Layout Components

### Top Navigation
- **Height**: `h-16` (64px)
- **Logo Area**: `w-16` with centered `w-12 h-12` logo
- **Logo Background**: `bg-citebots-orange/10` with hover `bg-citebots-orange/15`
- **Typography**: `text-xl font-bold tracking-tight`

### Sidebar Icon Bar
- **Width**: `w-16` collapsed, `w-48` expanded
- **Button Size**: `w-12 h-12` when collapsed (centered with `mx-auto`)
- **Padding**: `pt-4 pb-6 px-2` for proper alignment
- **Expansion**: Smooth `transition-all duration-150 ease-out`

### Context Panel
- **Width**: `w-64` fixed
- **Header**: `h-16` to match top bar with `px-6`
- **Content**: `px-4 py-6` with proper section spacing

## Dark Mode Considerations

### Background Hierarchy
```css
bg-gray-900        /* Main background */
bg-gray-800        /* Card backgrounds */
bg-gray-700        /* Interactive hover states */
bg-gray-600        /* Pressed states */
```

### Border Refinements
```css
border-gray-700/60     /* Softer than solid borders */
border-gray-600        /* Hover state borders */
```

### Text Colors
```css
text-white             /* Primary text */
text-gray-300          /* Secondary text */
text-gray-400          /* Muted text, section headers */
```

## Implementation Guidelines

### Migration Checklist

#### 1. Typography Updates
- [ ] Replace `font-medium` with `font-semibold` for interactive elements
- [ ] Add `tracking-tight` to headers and important text
- [ ] Use `font-bold` for section headers and main titles
- [ ] Standardize text sizes: `text-sm` for nav, `text-2xl` for card titles

#### 2. Color System Migration
- [ ] Replace solid orange backgrounds with `bg-citebots-orange/15`
- [ ] Add `border-citebots-orange/30` to active states
- [ ] Update hover states to use `/20` opacity
- [ ] Implement `/10` backgrounds for subtle highlights

#### 3. Spacing Standardization
- [ ] Update card padding to `p-8`
- [ ] Use `gap-8` for card grids
- [ ] Standardize button padding to `px-4 py-3`
- [ ] Apply consistent `mb-6` section spacing

#### 4. Interactive Enhancements
- [ ] Add `hover:scale-[0.98]` and `active:scale-[0.96]` to interactive elements
- [ ] Update transitions to `duration-150 ease-out`
- [ ] Implement consistent focus states with orange ring
- [ ] Add proper border treatments to all buttons

#### 5. Icon Standardization
- [ ] Update all icons to `stroke-width="2"`
- [ ] Standardize icon sizes (w-4/w-5/w-6)
- [ ] Ensure consistent `mr-3` spacing

### Code Examples

#### Before (Old Style)
```vue
<button class="bg-citebots-orange text-white px-3 py-2 rounded hover:bg-orange-600 transition-colors">
  Button
</button>
```

#### After (Refined Style)
```vue
<button class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 px-4 py-3 rounded-lg font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2">
  Button
</button>
```

## Quality Assurance

### Visual Consistency Checks
1. **Spacing**: All elements follow 8px grid system
2. **Typography**: Consistent font weights and tracking
3. **Colors**: Proper opacity usage for orange brand color
4. **Interactions**: All buttons have hover/focus/active states
5. **Icons**: Consistent sizing and stroke weights

### Performance Considerations
- Use `transform` properties for animations (GPU-accelerated)
- Minimize transition duration (150ms standard)
- Use `ease-out` for natural motion curves

### Accessibility Standards
- Minimum contrast ratios maintained
- Focus rings visible on all interactive elements
- Keyboard navigation support
- Semantic HTML structure preserved

## Future Enhancements

### Potential Additions
1. **Animation Presets**: Standard entrance/exit animations
2. **Loading States**: Skeleton screens with refined styling
3. **Toast Notifications**: Consistent with color system
4. **Modal Dialogs**: Following spacing and color guidelines
5. **Form Elements**: Input styling to match button patterns

### Design Tokens
Consider implementing CSS custom properties for easier maintenance:

```css
:root {
  --citebots-orange: #ea580c;
  --spacing-xs: 0.5rem;     /* 8px */
  --spacing-sm: 0.75rem;    /* 12px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;      /* 48px */
  --transition-fast: 150ms ease-out;
  --border-radius: 0.5rem;  /* 8px */
}
```

This design system provides a solid foundation for maintaining visual consistency while allowing for future growth and refinement.