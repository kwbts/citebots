<template>
  <div class="relative h-full">
    <!-- Base sidebar - always 64px wide -->
    <div class="w-16 bg-gray-900 border-r border-gray-700/60 flex flex-col h-full">
      <!-- Navigation Icons -->
      <nav class="flex-1 flex flex-col pt-4 pb-6 px-2">
        <div class="space-y-2">
          <!-- Dashboard -->
          <button
            @click="setActiveSection('dashboard')"
            :class="[
              'rounded-lg flex items-center w-12 h-12 justify-center mx-auto transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'dashboard'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 21l8-8" />
            </svg>
          </button>

          <!-- Clients -->
          <button
            @click="setActiveSection('clients')"
            :class="[
              'rounded-lg flex items-center w-12 h-12 justify-center mx-auto transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'clients'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          <!-- Analysis -->
          <button
            @click="setActiveSection('analysis')"
            :class="[
              'rounded-lg flex items-center w-12 h-12 justify-center mx-auto transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'analysis'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>

          <!-- Reports -->
          <button
            @click="setActiveSection('reports')"
            :class="[
              'rounded-lg flex items-center w-12 h-12 justify-center mx-auto transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'reports'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <!-- Admin (Super Admin only) -->
          <button
            v-if="isSuperAdmin"
            @click="setActiveSection('admin')"
            :class="[
              'rounded-lg flex items-center w-12 h-12 justify-center mx-auto transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'admin'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-3 border-t border-gray-700/60">
        <div class="relative">
          <button
            @click="settingsMenuOpen = !settingsMenuOpen"
            class="rounded-lg flex items-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 border border-transparent w-12 h-12 justify-center mx-auto"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <!-- Settings Dropdown -->
          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="settingsMenuOpen"
              class="absolute bottom-full left-16 mb-2 w-48 bg-gray-800 border border-gray-700/60 rounded-lg shadow-xl py-2 z-50"
            >
              <NuxtLink
                to="/dashboard/admin/profile"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
                @click="settingsMenuOpen = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </NuxtLink>
              <button
                @click="signOut"
                class="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Hover overlay - expands OVER the base sidebar -->
    <div
      v-if="isExpanded"
      class="absolute top-0 left-0 w-64 h-full bg-gray-900 border-r border-gray-700/60 shadow-xl z-50 transition-all duration-200 ease-out flex flex-col"
      @mouseenter="expand"
      @mouseleave="collapse"
    >
      <!-- Expanded Navigation -->
      <nav class="flex-1 flex flex-col pt-4 pb-6 px-4">
        <div class="space-y-2">
          <!-- Dashboard -->
          <button
            @click="setActiveSection('dashboard')"
            :class="[
              'rounded-lg flex items-center w-full px-4 py-3 justify-start transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'dashboard'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 21l8-8" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Dashboard
            </span>
          </button>

          <!-- Clients -->
          <button
            @click="setActiveSection('clients')"
            :class="[
              'rounded-lg flex items-center w-full px-4 py-3 justify-start transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'clients'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Clients
            </span>
          </button>

          <!-- Analysis -->
          <button
            @click="setActiveSection('analysis')"
            :class="[
              'rounded-lg flex items-center w-full px-4 py-3 justify-start transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'analysis'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Analysis
            </span>
          </button>

          <!-- Reports -->
          <button
            @click="setActiveSection('reports')"
            :class="[
              'rounded-lg flex items-center w-full px-4 py-3 justify-start transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'reports'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Reports
            </span>
          </button>

          <!-- Admin (Super Admin only) -->
          <button
            v-if="isSuperAdmin"
            @click="setActiveSection('admin')"
            :class="[
              'rounded-lg flex items-center w-full px-4 py-3 justify-start transition-all duration-150 ease-out group relative focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900',
              activeSection === 'admin'
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Admin
            </span>
          </button>
        </div>
      </nav>

      <!-- Settings at bottom (Expanded) -->
      <div class="p-3 border-t border-gray-700/60">
        <div class="relative">
          <button
            @click="settingsMenuOpen = !settingsMenuOpen"
            class="rounded-lg flex items-center text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 border border-transparent w-full px-4 py-3 justify-start"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="ml-3 whitespace-nowrap font-semibold text-sm tracking-tight">
              Settings
            </span>
          </button>

          <!-- Settings Dropdown -->
          <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="settingsMenuOpen"
              class="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700/60 rounded-lg shadow-xl py-2 z-50"
            >
              <NuxtLink
                to="/dashboard/admin/profile"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
                @click="settingsMenuOpen = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </NuxtLink>
              <button
                @click="signOut"
                class="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Hover trigger area -->
    <div
      class="absolute top-0 left-0 w-16 h-full z-40"
      @mouseenter="expand"
      @mouseleave="collapse"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  activeSection: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['section-changed'])
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isExpanded = ref(false)
const settingsMenuOpen = ref(false)
const isSuperAdmin = ref(false)

// Check if user is super admin
const checkSuperAdmin = async () => {
  if (!user.value) return

  try {
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()

    isSuperAdmin.value = profile?.role === 'super_admin'
  } catch (error) {
    console.error('Error checking super admin status:', error)
    isSuperAdmin.value = false
  }
}

// Watch for user changes
watch(user, () => {
  if (user.value) {
    checkSuperAdmin()
  } else {
    isSuperAdmin.value = false
  }
}, { immediate: true })

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