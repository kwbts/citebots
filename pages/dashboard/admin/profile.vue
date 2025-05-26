<template>
  <div class="flex-1 space-y-8">
    <!-- Header Section -->
    <div class="border-b border-gray-200/50 dark:border-gray-700/50 pb-8">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin Access
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">Manage account information and preferences</p>
        </div>
        <button
          @click="logout"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300/50 dark:hover:border-red-500/30 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8">
      <div class="animate-pulse space-y-6">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div class="space-y-4">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Profile Information -->
    <div v-else-if="profile" class="space-y-8">
      <!-- Account Details -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <div class="flex items-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg">
            {{ getInitials(profile.first_name, profile.last_name) }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ profile.first_name }} {{ profile.last_name }}</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-2">{{ profile.email }}</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatRole(profile.role) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
              <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white cursor-not-allowed">
                {{ profile.first_name }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white cursor-not-allowed">
                {{ profile.email }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
              <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white cursor-not-allowed">
                {{ profile.last_name }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
              <div class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-white cursor-not-allowed">
                {{ profile.company || 'Not specified' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ stats.clientCount }}</div>
          <div class="text-gray-600 dark:text-gray-400 font-medium">Active Clients</div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ stats.analysisCount }}</div>
          <div class="text-gray-600 dark:text-gray-400 font-medium">Reports Generated</div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 text-center transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25 hover:scale-[0.98] active:scale-[0.96]">
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ stats.daysSinceJoined }}</div>
          <div class="text-gray-600 dark:text-gray-400 font-medium">Days Active</div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h3>

        <div class="space-y-8">
          <div class="flex items-center justify-between py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div class="font-medium text-gray-900 dark:text-white mb-1">Account Status</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Your account is active and in good standing</div>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-500/20">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active
            </span>
          </div>

          <div class="flex items-center justify-between py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div class="font-medium text-gray-900 dark:text-white mb-1">Dark Mode</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark theme</div>
            </div>
            <DarkModeToggle />
          </div>

          <div class="flex items-center justify-between py-4">
            <div>
              <div class="font-medium text-gray-900 dark:text-white mb-1">Member Since</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(profile.created_at) }}</div>
            </div>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012-2h4a1 1 0 012 2v4m4 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m4 0h8M9 7h6" />
              </svg>
              Joined {{ stats.daysSinceJoined }} days ago
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-12 text-center">
      <div class="w-16 h-16 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Profile</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        We're having trouble loading your profile information. Please try refreshing the page.
      </p>
      <button
        @click="refreshProfile"
        class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Profile
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'

// Apply auth middleware and dashboard layout
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const supabase = useSupabaseClient()
const user = ref(null)
const profile = ref(null)
const isLoading = ref(true)
const stats = ref({
  clientCount: 0,
  analysisCount: 0,
  daysSinceJoined: 0
})

// Import dark mode toggle component
const DarkModeToggle = defineAsyncComponent(() => import('~/components/layout/DarkModeToggle.vue'))

// Check if user is super admin
const checkSuperAdmin = async () => {
  if (!user.value) return

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    
    if (!profileData || profileData.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied: Super admin role required'
      })
    }
  } catch (error) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied: Super admin role required'
    })
  }
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

const formatRole = (role) => {
  if (!role) return 'User'
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadProfile = async () => {
  try {
    isLoading.value = true
    
    // Get the current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    if (authUser) {
      user.value = authUser

      // Check super admin access
      await checkSuperAdmin()

      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      if (profileData) {
        profile.value = profileData
        await loadStats(authUser.id)
      }
    } else {
      console.log('No authenticated user found')
      router.push('/')
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    isLoading.value = false
  }
}

const loadStats = async (userId) => {
  try {
    // Get client count
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Get analysis count
    const { count: analysisCount } = await supabase
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Calculate days since joined
    const joinDate = new Date(profile.value.created_at)
    const today = new Date()
    const daysSinceJoined = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24))

    stats.value = {
      clientCount: clientCount || 0,
      analysisCount: analysisCount || 0,
      daysSinceJoined: Math.max(daysSinceJoined, 1)
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const refreshProfile = () => {
  loadProfile()
}

const logout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

onMounted(() => {
  loadProfile()
})
</script>