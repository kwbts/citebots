<template>
  <button
    @click="toggleDarkMode"
    :class="[
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
    ]"
    role="switch"
    :aria-checked="isDarkMode"
    aria-label="Toggle dark mode"
  >
    <span
      :class="[
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        isDarkMode ? 'translate-x-5' : 'translate-x-0'
      ]"
    >
      <span
        :class="[
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
          isDarkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
        ]"
        aria-hidden="true"
      >
        <!-- Sun icon -->
        <svg class="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 12 12">
          <path d="M6 0h1v2H6zM6 10h1v2H6zM0 6v1h2V6zM10 6v1h2V6zM2.05 1.64l.71.71L1.64 3.46l-.71-.71zM9.54 8.36l.71.71-1.11 1.11-.71-.71zM1.64 8.36l.71-.71 1.11 1.11-.71.71zM8.36 1.64l.71-.71 1.11 1.11-.71.71zM6 2a4 4 0 100 8 4 4 0 000-8z"/>
        </svg>
      </span>
      <span
        :class="[
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
          isDarkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
        ]"
        aria-hidden="true"
      >
        <!-- Moon icon -->
        <svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
          <path d="M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6c1.66 0 3.16-.68 4.24-1.76C9.1 11.38 7.64 12 6 12c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.64 0 3.1.62 4.24 1.76C9.16.68 7.66 0 6 0z"/>
        </svg>
      </span>
    </span>
  </button>
</template>

<script setup>
import { useDarkMode } from '~/composables/useDarkMode'

const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>