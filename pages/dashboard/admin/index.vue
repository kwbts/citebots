<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Administrative tools and management functions</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right bg-citebots-orange/10 dark:bg-citebots-orange/15 rounded-lg px-4 py-3 border border-citebots-orange/20 dark:border-citebots-orange/30">
              <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Admin Access</div>
              <div class="flex items-center text-sm font-semibold text-citebots-orange mt-1">
                <div class="w-2 h-2 bg-citebots-orange rounded-full mr-2"></div>
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Admin Tools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <!-- User Profile Card -->
      <NuxtLink
        to="/dashboard/admin/profile"
        class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg inline-flex group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-150 group-hover:shadow-sm">
              <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-blue-600/80 dark:text-blue-400/90 uppercase tracking-wider mb-2">PROFILE</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">User Profile</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Manage account information and preferences</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/50">
              View Profile
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Access Requests Card -->
      <NuxtLink
        to="/dashboard/admin/access-requests"
        class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-citebots-orange/10 dark:bg-citebots-orange/15 p-4 rounded-lg group-hover:bg-citebots-orange/15 dark:group-hover:bg-citebots-orange/20 transition-colors duration-150 inline-flex group-hover:shadow-sm">
              <svg class="w-7 h-7 text-citebots-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">MANAGEMENT</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Access Requests</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Manage user access requests and approvals</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-citebots-orange/10 dark:bg-citebots-orange/15 text-citebots-orange px-3 py-2 rounded-lg text-sm font-medium border border-citebots-orange/20 dark:border-citebots-orange/30">
              Manage Requests
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- User Management Card -->
      <NuxtLink
        to="/dashboard/admin/users"
        class="group focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:scale-[0.98] group-active:scale-[0.96] transition-all duration-150 ease-out">
          <div class="mb-6">
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg inline-flex group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors duration-150 group-hover:shadow-sm">
              <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m-2.006-2.006a3 3 0 00-3.997 0" />
              </svg>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs font-semibold text-purple-600/80 dark:text-purple-400/90 uppercase tracking-wider mb-2">MULTI-TENANCY</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">User Management</h3>
            <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">Create and manage client users with account assignments</p>
          </div>

          <div class="flex items-baseline">
            <span class="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/50">
              Manage Users
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Admin Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">System Overview</h2>
        <p class="text-gray-600 dark:text-gray-400 text-base">Platform statistics and administrative metrics</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2 tabular-nums">{{ totalUsers }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Users</div>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2 tabular-nums">{{ activeUsers }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Users</div>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2 tabular-nums">{{ pendingRequests }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending Requests</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Middleware to check super admin access
definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const totalUsers = ref(0)
const activeUsers = ref(0)
const pendingRequests = ref(0)

// Check if user is super admin
const checkSuperAdmin = async () => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    
    if (!profile || profile.role !== 'super_admin') {
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

// Fetch admin statistics
const fetchStats = async () => {
  try {
    // Get total users count
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    totalUsers.value = totalCount || 0

    // Get active users count
    const { count: activeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    activeUsers.value = activeCount || 0

    // Get pending access requests count
    const { count: pendingCount } = await supabase
      .from('access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    pendingRequests.value = pendingCount || 0

  } catch (error) {
    console.error('Error fetching admin stats:', error)
  }
}

onMounted(async () => {
  await checkSuperAdmin()
  await fetchStats()
})
</script>