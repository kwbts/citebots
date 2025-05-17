<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Citebots</h1>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
            <NuxtLink
              to="/dashboard/clients"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/clients')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Clients
            </NuxtLink>
            
            <NuxtLink
              to="/dashboard/analysis"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/analysis')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Run Analysis
            </NuxtLink>
            
            <NuxtLink
              to="/dashboard/reports"
              :class="[
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                isActive('/dashboard/reports')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Reports
            </NuxtLink>
          </div>
        </div>
        
        <!-- User Menu -->
        <div class="flex items-center">
          <div class="ml-3 relative">
            <div>
              <button
                @click="userMenuOpen = !userMenuOpen"
                type="button"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
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
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <NuxtLink
                  to="/dashboard/user"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  Profile
                </NuxtLink>
                <button
                  @click="signOut"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    <div class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <NuxtLink
          to="/dashboard/clients"
          :class="[
            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
            isActive('/dashboard/clients')
              ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
          ]"
        >
          Clients
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/analysis"
          :class="[
            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
            isActive('/dashboard/analysis')
              ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
          ]"
        >
          Run Analysis
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/reports"
          :class="[
            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
            isActive('/dashboard/reports')
              ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
          ]"
        >
          Reports
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const userMenuOpen = ref(false)

const userInitials = computed(() => {
  if (!user.value?.email) return 'U'
  const parts = user.value.email.split('@')[0].split('.')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return user.value.email[0].toUpperCase()
})

const isActive = (path: string) => {
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