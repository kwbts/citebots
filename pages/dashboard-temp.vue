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
              <h1 class="text-xl font-semibold text-citebots-dark">Citebots Dashboard</h1>
              <p class="text-sm text-citebots-gray-600">Generative Engine Optimization</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-citebots-gray-600">
              Welcome{{ userName ? `, ${userName}` : '' }}
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
        
        <!-- Show user email at minimum -->
        <div class="mb-6">
          <p class="text-citebots-gray-600 mb-4">
            You are logged in as: {{ userEmail }}
          </p>
          
          <!-- Show profile if available -->
          <div v-if="profileData" class="bg-citebots-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-citebots-dark mb-2">Your Profile</h3>
            <dl class="grid grid-cols-1 gap-2 text-sm">
              <div>
                <dt class="font-medium text-citebots-gray-600">Name:</dt>
                <dd class="text-citebots-dark">{{ profileData.first_name }} {{ profileData.last_name }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Email:</dt>
                <dd class="text-citebots-dark">{{ profileData.email }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Company:</dt>
                <dd class="text-citebots-dark">{{ profileData.company }}</dd>
              </div>
              <div>
                <dt class="font-medium text-citebots-gray-600">Role:</dt>
                <dd class="text-citebots-dark capitalize">{{ profileData.role }}</dd>
              </div>
            </dl>
          </div>
          
          <!-- Debug info -->
          <div v-if="error" class="mt-4 p-4 bg-red-50 rounded-lg">
            <p class="text-red-600">Error loading profile: {{ error }}</p>
            <p class="text-sm text-red-500 mt-2">
              This is likely due to RLS policies. Run the SQL fix in Supabase.
            </p>
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
import { useSupabase } from '~/composables/useSupabase'
import { onMounted, ref } from 'vue'

// Apply auth middleware
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const supabase = useSupabase()
const isLoading = ref(true)
const userEmail = ref('')
const userName = ref('')
const profileData = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    // Get auth user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      userEmail.value = user.email
      
      // Try to get profile - if it fails, we'll still show basic info
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('Profile error:', profileError)
          error.value = profileError.message
          
          // Try using the Netlify function instead
          const response = await $fetch('/.netlify/functions/debug-database', {
            method: 'POST',
            body: {
              action: 'get-user-profile',
              userId: user.id
            }
          }).catch(err => {
            console.error('Netlify function error:', err)
            return null
          })
          
          if (response?.profile) {
            profileData.value = response.profile
            userName.value = response.profile.first_name
          }
        } else {
          profileData.value = profile
          userName.value = profile.first_name
        }
      } catch (err) {
        console.error('Profile loading error:', err)
        error.value = err.message
      }
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('Dashboard error:', err)
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