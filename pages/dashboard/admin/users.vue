<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">User Management</h1>
    
    <!-- Super Admin Only -->
    <div v-if="isSuperAdmin" class="space-y-6">
      <!-- Create User Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 class="text-lg font-semibold mb-4">Create New User</h2>
        
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input 
                v-model="newUser.email" 
                type="email" 
                required 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Account Type</label>
              <select 
                v-model="newUser.account_type" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="client">Client User</option>
                <option value="partner">Partner (Future)</option>
              </select>
            </div>
          </div>
          
          <!-- Client Assignment (for client users) -->
          <div v-if="newUser.account_type === 'client'" class="space-y-2">
            <label class="block text-sm font-medium">Assign to Client</label>
            <select 
              v-model="newUser.client_account_id" 
              required 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Client...</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">First Name</label>
              <input 
                v-model="newUser.firstName" 
                type="text" 
                required 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Last Name</label>
              <input 
                v-model="newUser.lastName" 
                type="text" 
                required 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Company</label>
              <input 
                v-model="newUser.company" 
                type="text" 
                required 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-citebots-orange bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
            </div>
          </div>
          
          <button 
            type="submit" 
            :disabled="loading || (newUser.account_type === 'client' && !newUser.client_account_id)"
            class="px-6 py-2 bg-citebots-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating...' : 'Create User' }}
          </button>
        </form>
        
        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-4 p-3 rounded-md" :class="messageType === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'">
          {{ message }}
        </div>
        
        <!-- Generated Password Display -->
        <div v-if="generatedPassword" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <h3 class="font-medium text-yellow-800 dark:text-yellow-300 mb-2">User Created Successfully!</h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Temporary password (share securely):</p>
          <code class="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-sm font-mono text-yellow-900 dark:text-yellow-100">{{ generatedPassword }}</code>
          <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">User should change this password on first login.</p>
        </div>
      </div>
      
      <!-- Existing Users List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 class="text-lg font-semibold mb-4">Existing Users</h2>
        
        <div v-if="loadingUsers" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-citebots-orange"></div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-gray-200 dark:border-gray-700">
              <tr class="text-left">
                <th class="pb-2 text-gray-900 dark:text-gray-100">Email</th>
                <th class="pb-2 text-gray-900 dark:text-gray-100">Name</th>
                <th class="pb-2 text-gray-900 dark:text-gray-100">Account Type</th>
                <th class="pb-2 text-gray-900 dark:text-gray-100">Assigned Client</th>
                <th class="pb-2 text-gray-900 dark:text-gray-100">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="py-2">
                <td class="py-2 text-gray-900 dark:text-gray-100">{{ user.email }}</td>
                <td class="py-2 text-gray-900 dark:text-gray-100">{{ user.first_name }} {{ user.last_name }}</td>
                <td class="py-2">
                  <span class="px-2 py-1 text-xs rounded-full" :class="getAccountTypeClass(user.account_type)">
                    {{ user.account_type }}
                  </span>
                </td>
                <td class="py-2 text-gray-900 dark:text-gray-100">{{ user.assigned_client_name || '-' }}</td>
                <td class="py-2 text-gray-900 dark:text-gray-100">{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Not Super Admin -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">Access denied. Super admin privileges required.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const loading = ref(false)
const loadingUsers = ref(false)
const message = ref('')
const messageType = ref('success')
const generatedPassword = ref('')

const newUser = ref({
  email: '',
  account_type: 'client',
  client_account_id: '',
  firstName: '',
  lastName: '',
  company: ''
})

const clients = ref([])
const users = ref([])
const userProfile = ref(null)

// Computed
const isSuperAdmin = computed(() => {
  // Check both the auth user data and profile data
  const authRole = user.value?.role === 'super_admin' || user.value?.account_type === 'super_admin'
  const profileRole = userProfile.value?.role === 'super_admin' || userProfile.value?.account_type === 'super_admin'
  
  return authRole || profileRole
})

// Methods
const loadUserProfile = async () => {
  try {
    if (!user.value?.id) return
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (error) throw error
    userProfile.value = data
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

const loadClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .order('name')
    
    if (error) throw error
    clients.value = data || []
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

const loadUsers = async () => {
  try {
    loadingUsers.value = true
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        account_type,
        client_account_id,
        created_at,
        clients:client_account_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Flatten the client name
    users.value = (data || []).map(user => ({
      ...user,
      assigned_client_name: user.clients?.name
    }))
    
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loadingUsers.value = false
  }
}

const createUser = async () => {
  try {
    loading.value = true
    message.value = ''
    generatedPassword.value = ''

    const requestBody = {
      email: newUser.value.email,
      firstName: newUser.value.firstName,
      lastName: newUser.value.lastName,
      company: newUser.value.company,
      role: newUser.value.account_type, // Map account_type to role for now
      clientId: newUser.value.account_type === 'client' ? newUser.value.client_account_id : null
    }

    console.log('Creating user with data:', requestBody)

    // Call the appropriate endpoint based on environment
    const endpoint = process.dev ? '/api/auth/provision' : '/.netlify/functions/auth-provision'
    const response = await $fetch(endpoint, {
      method: 'POST',
      body: requestBody
    })
    
    if (response.success) {
      message.value = 'User created successfully!'
      messageType.value = 'success'
      generatedPassword.value = response.password
      
      // Reset form
      newUser.value = {
        email: '',
        account_type: 'client',
        client_account_id: '',
        firstName: '',
        lastName: '',
        company: ''
      }
      
      // Reload users list
      await loadUsers()
    } else {
      throw new Error(response.message || 'Failed to create user')
    }
    
  } catch (error) {
    console.error('Error creating user:', error)
    console.error('Error details:', error.data || error.response)
    
    // Try to get the actual error message from the response
    let errorMessage = 'Failed to create user'
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    message.value = errorMessage
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const getAccountTypeClass = (accountType) => {
  switch (accountType) {
    case 'super_admin':
      return 'bg-red-100 text-red-800'
    case 'partner':
      return 'bg-blue-100 text-blue-800'
    case 'client':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Initialize
onMounted(async () => {
  await loadUserProfile()
  
  if (isSuperAdmin.value) {
    loadClients()
    loadUsers()
  }
})
</script>