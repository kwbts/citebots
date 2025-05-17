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
            <NuxtLink to="/dashboard/user" class="text-sm text-citebots-gray-600 hover:text-citebots-gray-800">
              My Profile
            </NuxtLink>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Clients Card -->
        <NuxtLink to="/dashboard/clients" class="card hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-citebots-orange/10 p-3 rounded-lg">
              <svg class="w-6 h-6 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-sm text-citebots-gray-500">→</span>
          </div>
          <h3 class="text-lg font-semibold text-citebots-dark mb-2">Clients</h3>
          <p class="text-citebots-gray-600">Manage your client accounts and profiles</p>
        </NuxtLink>

        <!-- Analysis Card -->
        <div class="card opacity-50 cursor-not-allowed">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gray-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span class="text-sm text-gray-400">Coming Soon</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">Analysis</h3>
          <p class="text-gray-500">Run citation analysis on LLM responses</p>
        </div>

        <!-- Reports Card -->
        <div class="card opacity-50 cursor-not-allowed">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gray-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="text-sm text-gray-400">Coming Soon</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">Reports</h3>
          <p class="text-gray-500">View and share analysis reports</p>
        </div>
      </div>

      <!-- Quick Start Guide -->
      <div class="mt-8 card">
        <h2 class="text-xl font-semibold text-citebots-dark mb-4">Quick Start</h2>
        <ol class="list-decimal list-inside space-y-2 text-citebots-gray-600">
          <li>Add your clients to track their citation performance</li>
          <li>Run analysis to see how they appear in AI responses</li>
          <li>Generate reports to share insights</li>
        </ol>
      </div>

    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'
import { onMounted } from 'vue'

// Apply auth middleware
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const supabase = useSupabase()

onMounted(async () => {
  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push('/')
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