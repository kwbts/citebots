<template>
  <div class="flex-1 space-y-8">
    <!-- Header Section -->
    <div class="border-b border-gray-200/50 dark:border-gray-700/50 pb-8">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Access Request Management</h1>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-500/20">
          <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Admin Access
        </span>
      </div>
      <p class="text-gray-600 dark:text-gray-400">Manage user access requests for the Citebots platform</p>
    </div>

    <!-- Create New Access Request -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div class="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create New Access Request</h2>
        </div>
        <p class="text-gray-600 dark:text-gray-400">Manually create an access request for a new user</p>
      </div>
      <div class="p-8">
        <form @submit.prevent="createAccessRequest" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input
              v-model="newRequest.firstName"
              type="text"
              class="w-full px-4 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-300 dark:focus:border-orange-500/50 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input
              v-model="newRequest.lastName"
              type="text"
              class="w-full px-4 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-300 dark:focus:border-orange-500/50 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              v-model="newRequest.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-300 dark:focus:border-orange-500/50 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
            <input
              v-model="newRequest.company"
              type="text"
              class="w-full px-4 py-3 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 focus:border-orange-300 dark:focus:border-orange-500/50 transition-all duration-200"
              required
            />
          </div>
          <div class="md:col-span-2">
            <button
              type="submit"
              class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
            >
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ isSubmitting ? 'Creating...' : 'Create Access Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Access Requests Table -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
      <div class="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Access Requests</h2>
        </div>
        <p class="text-gray-600 dark:text-gray-400">Review and manage pending access requests</p>
      </div>
      
      <div v-if="loading" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="animate-spin w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-medium">Loading access requests...</p>
      </div>

      <div v-else-if="accessRequests.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Access Requests</h3>
        <p class="text-gray-600 dark:text-gray-400">No access requests found in the system</p>
      </div>
      
      <div v-else class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200/50 dark:border-gray-700/50">
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</th>
                <th class="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <tr v-for="request in accessRequests" :key="request.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                <td class="px-8 py-6 whitespace-nowrap">
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ request.first_name }} {{ request.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ request.email }}</div>
                  </div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ request.company }}
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(request.status)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border">
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(request.requested_at) }}
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <span v-if="request.generated_password" class="font-mono text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white px-3 py-1 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                    {{ request.generated_password }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-8 py-6 whitespace-nowrap space-x-3">
                  <button
                    v-if="request.status === 'pending'"
                    @click="approveRequest(request)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmitting"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    @click="deleteRequest(request.id)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmitting"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="p-6 rounded-2xl border transition-all duration-200"
      :class="messageType === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 border-red-200/50 dark:border-red-500/20' : 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300 border-green-200/50 dark:border-green-500/20'">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center border"
          :class="messageType === 'error' ? 'bg-red-100 dark:bg-red-500/20 border-red-200/50 dark:border-red-500/30' : 'bg-green-100 dark:bg-green-500/20 border-green-200/50 dark:border-green-500/30'">
          <svg v-if="messageType === 'error'" class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <svg v-else class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="font-medium">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Middleware to check super admin access
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const accessRequests = ref([])
const loading = ref(true)
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref('')

const newRequest = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: ''
})

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

// Load access requests
const loadAccessRequests = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('requested_at', { ascending: false })
    
    if (error) throw error
    accessRequests.value = data || []
  } catch (error) {
    console.error('Error loading access requests:', error)
    message.value = 'Failed to load access requests'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

// Create new access request
const createAccessRequest = async () => {
  try {
    isSubmitting.value = true
    message.value = ''

    // Basic validation
    if (!newRequest.value.firstName || !newRequest.value.lastName || 
        !newRequest.value.email || !newRequest.value.company) {
      throw new Error('Please fill in all fields')
    }

    // Check if email is jon@knowbots.ca for auto-provision
    if (newRequest.value.email === 'jon@knowbots.ca') {
      // Call Netlify function to create super admin account
      const response = await $fetch('/.netlify/functions/auth-provision', {
        method: 'POST',
        body: {
          firstName: newRequest.value.firstName,
          lastName: newRequest.value.lastName,
          email: newRequest.value.email,
          company: newRequest.value.company,
          role: 'super_admin'
        }
      })

      if (response && response.password) {
        message.value = `Super admin account created successfully! Password: ${response.password}`
        messageType.value = 'success'
      } else {
        message.value = 'Account created but password not received'
        messageType.value = 'error'
      }
    } else {
      // Create regular access request
      const { error } = await supabase
        .from('access_requests')
        .insert([{
          email: newRequest.value.email,
          first_name: newRequest.value.firstName,
          last_name: newRequest.value.lastName,
          company: newRequest.value.company,
          status: 'pending',
          requested_at: new Date().toISOString()
        }])

      if (error) throw error

      message.value = 'Access request created successfully'
      messageType.value = 'success'
    }

    // Reset form
    newRequest.value = {
      firstName: '',
      lastName: '',
      email: '',
      company: ''
    }

    // Reload requests
    await loadAccessRequests()

  } catch (error) {
    console.error('Error creating access request:', error)
    message.value = error.message || 'Failed to create access request'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Approve access request
const approveRequest = async (request) => {
  try {
    isSubmitting.value = true
    message.value = ''

    // Call Netlify function to provision the user
    const response = await $fetch('/.netlify/functions/auth-provision', {
      method: 'POST',
      body: {
        firstName: request.first_name,
        lastName: request.last_name,
        email: request.email,
        company: request.company,
        role: 'client'
      }
    })

    if (response && response.password) {
      // Update the access request with approval details
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.value.id,
          generated_password: response.password
        })
        .eq('id', request.id)

      if (error) throw error

      message.value = `User approved successfully! Password: ${response.password}`
      messageType.value = 'success'
      
      // Reload requests
      await loadAccessRequests()
    } else {
      throw new Error('Failed to generate password')
    }

  } catch (error) {
    console.error('Error approving request:', error)
    message.value = error.message || 'Failed to approve request'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Delete access request
const deleteRequest = async (requestId) => {
  if (!confirm('Are you sure you want to delete this access request?')) {
    return
  }

  try {
    isSubmitting.value = true
    message.value = ''

    const { error } = await supabase
      .from('access_requests')
      .delete()
      .eq('id', requestId)

    if (error) throw error

    message.value = 'Access request deleted successfully'
    messageType.value = 'success'
    
    // Reload requests
    await loadAccessRequests()

  } catch (error) {
    console.error('Error deleting request:', error)
    message.value = error.message || 'Failed to delete request'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Utility functions
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-500/20'
    case 'approved':
      return 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-500/20'
    default:
      return 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-500/20'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Clear message after 5 seconds
watch(message, (newMessage) => {
  if (newMessage) {
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }
})

// Initialize
onMounted(async () => {
  await checkSuperAdmin()
  await loadAccessRequests()
})
</script>