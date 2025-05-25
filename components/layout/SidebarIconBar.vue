<template>
  <div
    class="bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
    :class="isExpanded ? 'w-48' : 'w-16'"
    @mouseenter="expand"
    @mouseleave="collapse"
  >
    <!-- Logo/Brand -->
    <div class="h-16 flex items-center border-b border-gray-700 px-4">
      <NuxtLink
        to="/dashboard"
        class="flex items-center hover:opacity-80 transition-opacity"
        @click="collapse"
      >
        <div class="bg-citebots-orange p-2 rounded-lg flex-shrink-0">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span
          v-if="isExpanded"
          class="ml-3 text-white font-semibold whitespace-nowrap transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Citebots
        </span>
      </NuxtLink>
    </div>

    <!-- Navigation Icons -->
    <nav class="flex-1 flex flex-col space-y-2 py-4 px-2">
      <!-- Dashboard -->
      <button
        @click="setActiveSection('dashboard')"
        :class="[
          'rounded-lg flex items-center transition-colors group relative',
          isExpanded ? 'w-full px-3 py-3 justify-start' : 'w-12 h-12 justify-center',
          activeSection === 'dashboard'
            ? 'bg-citebots-orange text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        ]"
      >
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21l8-8" />
        </svg>
        <span
          v-if="isExpanded"
          class="ml-3 whitespace-nowrap font-medium transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Dashboard
        </span>
      </button>

      <!-- Clients -->
      <button
        @click="setActiveSection('clients')"
        :class="[
          'rounded-lg flex items-center transition-colors group relative',
          isExpanded ? 'w-full px-3 py-3 justify-start' : 'w-12 h-12 justify-center',
          activeSection === 'clients'
            ? 'bg-citebots-orange text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        ]"
      >
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span
          v-if="isExpanded"
          class="ml-3 whitespace-nowrap font-medium transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Clients
        </span>
      </button>

      <!-- Analysis -->
      <button
        @click="setActiveSection('analysis')"
        :class="[
          'rounded-lg flex items-center transition-colors group relative',
          isExpanded ? 'w-full px-3 py-3 justify-start' : 'w-12 h-12 justify-center',
          activeSection === 'analysis'
            ? 'bg-citebots-orange text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        ]"
      >
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span
          v-if="isExpanded"
          class="ml-3 whitespace-nowrap font-medium transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Analysis
        </span>
      </button>

      <!-- Reports -->
      <button
        @click="setActiveSection('reports')"
        :class="[
          'rounded-lg flex items-center transition-colors group relative',
          isExpanded ? 'w-full px-3 py-3 justify-start' : 'w-12 h-12 justify-center',
          activeSection === 'reports'
            ? 'bg-citebots-orange text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        ]"
      >
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span
          v-if="isExpanded"
          class="ml-3 whitespace-nowrap font-medium transition-opacity duration-300"
          :class="isExpanded ? 'opacity-100' : 'opacity-0'"
        >
          Reports
        </span>
      </button>
    </nav>

    <!-- Settings at bottom -->
    <div class="p-2 border-t border-gray-700">
      <div class="relative">
        <button
          @click="settingsMenuOpen = !settingsMenuOpen"
          :class="[
            'rounded-lg flex items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
            isExpanded ? 'w-full px-3 py-3 justify-start' : 'w-12 h-12 justify-center'
          ]"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span
            v-if="isExpanded"
            class="ml-3 whitespace-nowrap font-medium transition-opacity duration-300"
            :class="isExpanded ? 'opacity-100' : 'opacity-0'"
          >
            Settings
          </span>
        </button>

        <!-- Settings Dropdown -->
        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="settingsMenuOpen"
            :class="[
              'absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50',
              isExpanded ? 'bottom-full left-0 right-0 mb-2' : 'bottom-full left-16 mb-2 w-48'
            ]"
          >
            <NuxtLink
              to="/dashboard/user"
              class="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
              @click="settingsMenuOpen = false"
            >
              Profile
            </NuxtLink>
            <button
              @click="signOut"
              class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </transition>
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
const client = useSupabaseClient()
const router = useRouter()

const isExpanded = ref(false)
const settingsMenuOpen = ref(false)

const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
  settingsMenuOpen.value = false
}

const setActiveSection = (section) => {
  emit('section-changed', section)
}

const signOut = async () => {
  try {
    await client.auth.signOut()
    await router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
  settingsMenuOpen.value = false
}
</script>