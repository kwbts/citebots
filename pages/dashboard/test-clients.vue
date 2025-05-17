<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Debug Clients</h1>

    <div v-if="loading" class="mb-4">
      <p>Loading user...</p>
    </div>

    <div v-else class="mb-4">
      <p><strong>User ID:</strong> {{ user?.id || 'Not loaded' }}</p>
      <p><strong>User Email:</strong> {{ user?.email || 'Not loaded' }}</p>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">All Clients (no filter):</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(allClients, null, 2) }}</pre>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">User's Clients (created_by filter):</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(userClients, null, 2) }}</pre>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">RLS Check:</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto">{{ JSON.stringify(rlsCheck, null, 2) }}</pre>
    </div>
    
    <button @click="checkClients" class="bg-blue-500 text-white px-4 py-2 rounded">
      Refresh Data
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const allClients = ref(null)
const userClients = ref(null)
const rlsCheck = ref(null)
const loading = ref(true)

const checkClients = async () => {
  try {
    console.log('Checking clients with user:', user.value)

    // Get all clients without filter
    const { data: all, error: allError } = await supabase
      .from('clients')
      .select('*')

    allClients.value = { data: all, error: allError }

    // Only check user-specific clients if user is loaded
    if (user.value && user.value.id) {
      // Get clients with created_by filter
      const { data: userOnly, error: userError } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', user.value.id)

      userClients.value = { data: userOnly, error: userError }
    } else {
      userClients.value = { data: null, error: 'No user ID available' }
    
    }

    // Check RLS by trying different queries
    const rlsTests = {}

    // Test 1: Just select
    const { data: test1, error: error1 } = await supabase
      .from('clients')
      .select('id, name')
    rlsTests.selectOnly = { count: test1?.length, error: error1 }

    // Test 2: With user filter (only if user exists)
    if (user.value && user.value.id) {
      const { data: test2, error: error2 } = await supabase
        .from('clients')
        .select('id, name')
        .eq('created_by', user.value.id)
      rlsTests.withUserFilter = { count: test2?.length, error: error2 }
    } else {
      rlsTests.withUserFilter = { error: 'No user ID' }
    }

    // Test 3: Check if created_by column exists
    const { data: test3, error: error3 } = await supabase
      .from('clients')
      .select('created_by')
      .limit(1)
    rlsTests.createdByColumn = { data: test3, error: error3 }

    rlsCheck.value = rlsTests
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Watch for user changes
watch(user, (newUser) => {
  console.log('User changed:', newUser)
  if (newUser) {
    loading.value = false
    checkClients()
  }
}, { immediate: true })

onMounted(async () => {
  console.log('Component mounted')
  console.log('Initial user:', user.value)

  // Also check the auth session directly
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session:', session)

  if (!user.value && session) {
    console.log('User not loaded yet but session exists')
  }
})
</script>