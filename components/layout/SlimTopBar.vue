<template>
  <div class="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
    <!-- Left: Project Info -->
    <div class="flex items-center space-x-4">
      <NuxtLink to="/dashboard" class="text-lg font-semibold text-white hover:text-citebots-orange transition-colors">
        {{ companyName || 'Knowbots' }}
      </NuxtLink>
      <span class="text-gray-400 text-sm">Production</span>
    </div>

    <!-- Center: Empty for cleaner look -->
    <div></div>

    <!-- Right: User & Actions -->
    <div class="flex items-center space-x-3">
      <!-- Dark Mode Toggle -->
      <button
        @click="darkMode.toggle"
        class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        title="Toggle dark mode"
      >
        <svg v-if="darkMode.isDark.value" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- Help -->
      <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="userMenuOpen = !userMenuOpen"
          class="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div class="w-6 h-6 bg-citebots-orange rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-medium">{{ userInitials }}</span>
          </div>
          <span class="text-sm">{{ userEmail }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
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
            class="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
          >
            <NuxtLink
              to="/dashboard/user"
              class="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
              @click="userMenuOpen = false"
            >
              Profile Settings
            </NuxtLink>
            <hr class="border-gray-700 my-1">
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
  return user.value?.email?.split('@')[0] || 'User'
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