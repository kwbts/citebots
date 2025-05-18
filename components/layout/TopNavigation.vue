<template>
  <nav class="bg-white shadow-sm border-b border-citebots-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/dashboard" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="bg-citebots-orange p-2 rounded-md">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-citebots-dark">Citebots</h1>
            </NuxtLink>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
            <NuxtLink
              to="/dashboard/clients"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/clients')
                  ? 'border-citebots-orange text-citebots-dark'
                  : 'border-transparent text-citebots-gray-600 hover:border-gray-300 hover:text-citebots-gray-800'
              ]"
            >
              Clients
            </NuxtLink>
            
            <NuxtLink
              to="/dashboard/analysis"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/analysis')
                  ? 'border-citebots-orange text-citebots-dark'
                  : 'border-transparent text-citebots-gray-600 hover:border-gray-300 hover:text-citebots-gray-800'
              ]"
            >
              Run Analysis
            </NuxtLink>
            
            <NuxtLink
              to="/dashboard/reports"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/reports')
                  ? 'border-citebots-orange text-citebots-dark'
                  : 'border-transparent text-citebots-gray-600 hover:border-gray-300 hover:text-citebots-gray-800'
              ]"
            >
              Reports
            </NuxtLink>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            type="button"
            class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-citebots-gray-400 hover:text-citebots-gray-500 hover:bg-citebots-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-citebots-orange"
          >
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <!-- User dropdown -->
          <div class="ml-3 relative">
            <div>
              <button
                @click="userMenuOpen = !userMenuOpen"
                type="button"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-citebots-orange"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-citebots-orange flex items-center justify-center">
                  <span class="text-white font-medium">{{ userInitials }}</span>
                </div>
              </button>
            </div>
            
            <!-- Dropdown menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="userMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              >
                <NuxtLink
                  to="/dashboard/user"
                  class="block px-4 py-2 text-sm text-citebots-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  Profile
                </NuxtLink>
                <button
                  @click="signOut"
                  class="block w-full text-left px-4 py-2 text-sm text-citebots-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1 bg-white shadow-lg">
          <NuxtLink
            to="/dashboard/clients"
            @click="mobileMenuOpen = false"
            :class="[
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
              isActive('/dashboard/clients')
                ? 'bg-citebots-orange/10 border-citebots-orange text-citebots-dark'
                : 'border-transparent text-citebots-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-citebots-gray-800'
            ]"
          >
            Clients
          </NuxtLink>
          
          <NuxtLink
            to="/dashboard/analysis"
            @click="mobileMenuOpen = false"
            :class="[
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
              isActive('/dashboard/analysis')
                ? 'bg-citebots-orange/10 border-citebots-orange text-citebots-dark'
                : 'border-transparent text-citebots-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-citebots-gray-800'
            ]"
          >
            Run Analysis
          </NuxtLink>
          
          <NuxtLink
            to="/dashboard/reports"
            @click="mobileMenuOpen = false"
            :class="[
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
              isActive('/dashboard/reports')
                ? 'bg-citebots-orange/10 border-citebots-orange text-citebots-dark'
                : 'border-transparent text-citebots-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-citebots-gray-800'
            ]"
          >
            Reports
          </NuxtLink>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)

const userInitials = computed(() => {
  if (!user.value?.email) return 'U'
  const parts = user.value.email.split('@')[0].split('.')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return user.value.email[0].toUpperCase()
})

const isActive = (path) => {
  return route.path.startsWith(path)
}

const signOut = async () => {
  try {
    await client.auth.signOut()
    await router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>