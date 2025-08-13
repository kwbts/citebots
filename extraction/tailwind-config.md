# Citebots V1 Tailwind Configuration for V2 Migration

## Complete Tailwind Config
**Purpose**: Tailwind CSS configuration with custom colors and dark mode setup  
**V1 Location**: `/tailwind.config.js`  
**V2 Location**: `/tailwind.config.js` (adapted for Next.js)  
**Dependencies**: Tailwind CSS, dark mode class strategy  
**Notes**: Uses 'class' dark mode strategy, custom color palette

### Working Code:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'citebots-orange': '#D36641',
        'citebots-dark': '#0D1B2A',
        'citebots-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

### Required Changes for V2:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'citebots-orange': '#D36641',
        'citebots-dark': '#0D1B2A',
        'citebots-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

---

## Global CSS Styles
**Purpose**: Base styles, component classes, and utilities  
**V1 Location**: `/assets/css/main.css`  
**V2 Location**: `/styles/globals.css`  
**Dependencies**: Tailwind CSS layers  
**Notes**: Includes custom component classes and dark mode variants

### Working Code:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans bg-citebots-gray-50 text-citebots-gray-900 antialiased;
  }

  .dark body {
    @apply bg-gray-900 text-gray-100;
  }

  h1 {
    @apply text-3xl font-bold text-citebots-dark;
  }

  .dark h1 {
    @apply text-white;
  }

  h2 {
    @apply text-2xl font-semibold text-citebots-dark;
  }

  .dark h2 {
    @apply text-white;
  }

  h3 {
    @apply text-xl font-semibold text-citebots-dark;
  }

  .dark h3 {
    @apply text-white;
  }
}

@layer components {
  /* Buttons */
  .btn {
    @apply font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center;
  }

  .btn-primary {
    @apply btn bg-citebots-orange hover:bg-citebots-orange/90 text-white shadow-sm hover:shadow;
  }

  .btn-secondary {
    @apply btn bg-white hover:bg-citebots-gray-50 text-citebots-gray-800 border border-citebots-gray-300 hover:border-citebots-gray-400;
  }

  .dark .btn-secondary {
    @apply bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 hover:border-gray-500;
  }

  .btn-tertiary {
    @apply btn bg-citebots-gray-100 hover:bg-citebots-gray-200 text-citebots-gray-800;
  }

  .btn-outline {
    @apply btn bg-transparent hover:bg-citebots-orange hover:text-white text-citebots-orange border border-citebots-orange hover:border-citebots-orange;
  }

  .dark .btn-outline {
    @apply text-citebots-orange border-citebots-orange hover:bg-citebots-orange hover:text-white;
  }

  /* Forms */
  .input-field {
    @apply w-full px-4 py-2.5 bg-white border border-citebots-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-citebots-orange focus:border-citebots-orange transition-colors duration-200 text-gray-900 placeholder-gray-500;
  }

  .dark .input-field {
    @apply bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-citebots-orange focus:border-citebots-orange;
  }

  /* Fix browser autofill styling in dark mode */
  .dark .input-field:-webkit-autofill,
  .dark .input-field:-webkit-autofill:hover,
  .dark .input-field:-webkit-autofill:focus,
  .dark .input-field:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgb(55 65 81) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Light mode autofill (for consistency) */
  .input-field:-webkit-autofill,
  .input-field:-webkit-autofill:hover,
  .input-field:-webkit-autofill:focus,
  .input-field:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: rgb(17 24 39) !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  .form-label {
    @apply block text-sm font-medium text-citebots-gray-700 mb-2;
  }

  .dark .form-label {
    @apply text-gray-300;
  }

  /* Cards */
  .card {
    @apply bg-white rounded-xl shadow-sm border border-citebots-gray-100 p-6 hover:shadow-md transition-shadow duration-200;
  }

  .dark .card {
    @apply bg-gray-800 border-gray-700 text-white;
  }

  .card-bordered {
    @apply card border-2;
  }

  /* Page headers */
  .page-header {
    @apply mb-8;
  }

  .page-title {
    @apply text-3xl font-bold text-citebots-dark mb-2;
  }

  .page-subtitle {
    @apply text-citebots-gray-600;
  }

  /* Container */
  .content-container {
    @apply w-full max-w-7xl mx-auto;
  }

  /* Grid layouts */
  .grid-dashboard {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  /* Spacing utilities */
  .section-spacing {
    @apply mb-8;
  }
}
```

---

## CSS Custom Properties Alternative (for V2)

For better Next.js integration, consider converting to CSS custom properties:

```css
:root {
  --citebots-orange: #D36641;
  --citebots-dark: #0D1B2A;
  
  /* Gray scale */
  --citebots-gray-50: #f9fafb;
  --citebots-gray-100: #f3f4f6;
  --citebots-gray-200: #e5e7eb;
  --citebots-gray-300: #d1d5db;
  --citebots-gray-400: #9ca3af;
  --citebots-gray-500: #6b7280;
  --citebots-gray-600: #4b5563;
  --citebots-gray-700: #374151;
  --citebots-gray-800: #1f2937;
  --citebots-gray-900: #111827;
}

/* Dark mode overrides */
.dark {
  --bg-primary: var(--citebots-gray-900);
  --bg-secondary: var(--citebots-gray-800);
  --text-primary: white;
  --text-secondary: var(--citebots-gray-300);
}
```

---

## PostCSS Configuration (if needed)

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Implementation Notes for V2

### Next.js Specific Changes
1. Update content paths for Next.js file structure
2. Consider using CSS modules for component-specific styles
3. Integrate with next-themes for dark mode
4. Use CSS custom properties for dynamic theming

### Performance Optimizations
1. Purge unused styles in production
2. Split critical CSS for faster loading
3. Use CSS-in-JS for component-specific styles if needed
4. Consider Tailwind JIT mode for faster builds

### Browser Compatibility
1. Autofill styles for webkit browsers
2. Focus ring accessibility
3. Color contrast compliance
4. Reduced motion preferences

### Migration Priority
1. **High**: Color palette, base styles, layout utilities
2. **Medium**: Component classes, form styles, button variants
3. **Low**: Advanced animations, browser-specific fixes