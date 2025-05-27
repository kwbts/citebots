<template>
  <div class="h-16 bg-gray-900 border-b border-gray-700/60 flex items-center justify-between">
    <!-- Left: Logo positioned exactly like sidebar icons -->
    <div class="w-16 flex-shrink-0 px-2 flex items-center justify-center">
      <NuxtLink to="/" class="w-12 h-12 bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg flex items-center justify-center hover:bg-citebots-orange/20 dark:hover:bg-citebots-orange/25 transition-all duration-150 ease-out group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900">
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
      </NuxtLink>
    </div>

    <!-- Center: Brand text -->
    <div class="flex-1 px-6">
      <span class="text-xl font-bold text-white tracking-tight">Citebots</span>
    </div>

    <!-- Right: User & Actions -->
    <div class="flex items-center space-x-4 pr-8">
      <!-- Dark Mode Toggle -->
      <button
        @click="darkMode.toggle"
        class="p-3 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900"
        title="Toggle dark mode"
      >
        <svg v-if="darkMode.isDark.value" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="userMenuOpen = !userMenuOpen"
          class="flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <div class="w-8 h-8 bg-citebots-orange/10 dark:bg-citebots-orange/15 border border-citebots-orange/20 rounded-lg flex items-center justify-center">
            <span class="text-citebots-orange text-sm font-semibold">{{ userInitials }}</span>
          </div>
          <span class="text-base font-medium">{{ userEmail }}</span>
          <svg class="w-4 h-4 transition-transform duration-150" :class="{ 'rotate-180': userMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="userMenuOpen"
            class="absolute right-0 top-full mt-3 w-56 bg-gray-800 border border-gray-700/60 rounded-lg shadow-xl py-2 z-50"
          >
            <div class="px-4 py-3 border-b border-gray-700/50">
              <p class="text-sm font-semibold text-white">{{ userEmail }}</p>
              <p class="text-xs text-gray-400 mt-1">Signed in</p>
            </div>
            <div class="py-2">
              <NuxtLink
                to="/dashboard/admin/profile"
                class="flex items-center px-4 py-3 text-base text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-150"
                @click="userMenuOpen = false"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </NuxtLink>
              <hr class="border-gray-700/50 my-2">
              <button
                @click="signOut"
                class="flex items-center w-full text-left px-4 py-3 text-base text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-150"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()
const darkMode = useDarkMode()

const userMenuOpen = ref(false)
const profile = ref(null)

// Fetch user profile for company name
onMounted(async () => {
  if (user.value) {
    try {
      const { data } = await client
        .from('profiles')
        .select('company')
        .eq('id', user.value.id)
        .single()

      if (data) {
        profile.value = data
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }
})

const companyName = computed(() => {
  return profile.value?.company || null
})

const userInitials = computed(() => {
  if (!user.value?.email) return 'U'
  const parts = user.value.email.split('@')[0].split('.')
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return user.value.email[0].toUpperCase()
})

const userEmail = computed(() => {
  if (!user.value?.email) return 'User'

  const emailPrefix = user.value.email.split('@')[0]

  // Handle names with dots (like john.doe)
  if (emailPrefix.includes('.')) {
    return emailPrefix
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }

  // Handle single names
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase()
})


const signOut = async () => {
  try {
    await client.auth.signOut()
    await router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
  userMenuOpen.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      userMenuOpen.value = false
    }
  })
})
</script>