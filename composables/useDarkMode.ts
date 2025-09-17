import { ref, computed, watch } from 'vue'

// Global reactive state for dark mode
const isDark = ref(true) // Default to dark mode
let isInitialized = false

export const useDarkMode = () => {
  // Initialize from localStorage or system preference
  const initialize = () => {
    if (process.client && !isInitialized) {
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        try {
          isDark.value = JSON.parse(stored)
        } catch (error) {
          console.warn('Error parsing darkMode from localStorage:', error)
          isDark.value = true // Default to dark mode on error
        }
      } else {
        // Default to dark mode (instead of system preference)
        isDark.value = true
      }
      updateDOM()
      isInitialized = true
    }
  }

  // Update DOM classes with smooth transition
  const updateDOM = () => {
    if (process.client && document.documentElement) {
      // Add transition class temporarily for smooth theme switching
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease'

      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // Remove transition after animation completes
      setTimeout(() => {
        if (document.documentElement) {
          document.documentElement.style.transition = ''
        }
      }, 300)
    }
  }

  // Watch for changes and persist (only set up once)
  if (!isInitialized) {
    watch(isDark, (newValue) => {
      if (process.client) {
        try {
          localStorage.setItem('darkMode', JSON.stringify(newValue))
          updateDOM()
        } catch (error) {
          console.warn('Error saving darkMode to localStorage:', error)
        }
      }
    })
  }

  const toggle = () => {
    isDark.value = !isDark.value
  }

  const setDark = (value: boolean) => {
    isDark.value = value
  }

  // Initialize on first use
  if (process.client && typeof document !== 'undefined' && !isInitialized) {
    initialize()
  }

  return {
    isDark: computed(() => isDark.value),
    toggle,
    setDark
  }
}