<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title text-gray-900 dark:text-white">My Profile</h1>
          <p class="page-subtitle text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
        </div>
        <button
          @click="logout"
          class="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="card">
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div class="space-y-3">
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
        </div>
      </div>
    </div>
    
    <!-- Profile Information -->
    <div v-else-if="profile" class="space-y-8">
      <!-- Account Details -->
      <div class="card">
        <div class="flex items-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
            {{ getInitials(profile.first_name, profile.last_name) }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ profile.first_name }} {{ profile.last_name }}</h2>
            <p class="text-gray-600 dark:text-gray-400">{{ profile.email }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mt-1">
              {{ formatRole(profile.role) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <div class="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
                {{ profile.first_name }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div class="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
                {{ profile.email }}
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <div class="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
                {{ profile.last_name }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
              <div class="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
                {{ profile.company || 'Not specified' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card text-center">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.clientCount }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Active Clients</div>
        </div>

        <div class="card text-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.analysisCount }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Reports Generated</div>
        </div>

        <div class="card text-center">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.daysSinceJoined }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">Account Status</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Your account is active and in good standing</div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Active
            </span>
          </div>

          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark theme</div>
            </div>
            <DarkModeToggle />
          </div>

          <div class="flex items-center justify-between py-3">
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">Member Since</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(profile.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else class="card text-center py-12">
      <svg class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to Load Profile</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        We're having trouble loading your profile information. Please try refreshing the page.
      </p>
      <button
        @click="refreshProfile"
        class="btn-primary"
      >
        Refresh Profile
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'

// Apply auth middleware
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