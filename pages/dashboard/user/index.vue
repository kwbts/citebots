<template>
  <div class="min-h-screen bg-citebots-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="bg-citebots-orange p-2 rounded-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-citebots-dark">My Profile</h1>
              <p class="text-sm text-citebots-gray-600">User Account Details</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <NuxtLink to="/dashboard" class="text-sm text-citebots-gray-600 hover:text-citebots-gray-800">
              ← Back to Dashboard
            </NuxtLink>
            <span class="text-sm text-citebots-gray-600">
              Welcome{{ profile ? `, ${profile.first_name}` : '' }}
            </span>
            <button @click="logout" class="btn-secondary flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading" class="card">
        <div class="animate-pulse">
          <div class="h-8 bg-citebots-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-4 bg-citebots-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      <div v-else class="card">
        <h2 class="text-2xl font-semibold text-citebots-dark mb-4">Welcome to Citebots</h2>
        <div class="mb-6">
          <p class="text-citebots-gray-600 mb-4">
            You are logged in as a {{ profile?.role || 'user' }}.
          </p>
          <div class="bg-citebots-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-citebots-dark mb-2">Your Profile</h3>
            <dl class="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt class="font-medium text-citebots-gray-600">Name:</dt>
                <dd class="text-citebots-dark">{{ profile?.first_name }} {{ profile?.last_name }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Email:</dt>
                <dd class="text-citebots-dark">{{ profile?.email }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Company:</dt>
                <dd class="text-citebots-dark">{{ profile?.company }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Role:</dt>
                <dd class="text-citebots-dark capitalize">{{ profile?.role }}</dd>
              </div>
            </dl>
          </div>
        </div>
        <p class="text-citebots-gray-600">
          This is your dashboard. We're building out the MVP functionality. Coming soon: client management, analysis tools, and reporting.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
// Using built-in Supabase composable
import { onMounted, ref } from 'vue'

// Apply auth middleware
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient()
const user = ref(null)
const profile = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    // Get the current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    if (authUser) {
      console.log('Auth user:', authUser)
      user.value = authUser

      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        console.log('User ID:', authUser.id)

        // Check if profile exists at all
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
        console.log('All profiles:', allProfiles)
      } else {
        console.log('Profile data:', profileData)
        profile.value = profileData
      }
    } else {
      // If no user, redirect to login
      router.push('/')
    }
  } catch (error) {
    console.error('Error loading user:', error)
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>