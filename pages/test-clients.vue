<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Debug Clients</h1>
    
    <div class="mb-4">
      <p><strong>User ID:</strong> {{ user?.id }}</p>
      <p><strong>User Email:</strong> {{ user?.email }}</p>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">All Clients (no filter):</h2>
      <pre class="bg-gray-100 p-4 rounded">{{ JSON.stringify(allClients, null, 2) }}</pre>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">User's Clients (created_by filter):</h2>
      <pre class="bg-gray-100 p-4 rounded">{{ JSON.stringify(userClients, null, 2) }}</pre>
    </div>
    
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-2">RLS Check:</h2>
      <pre class="bg-gray-100 p-4 rounded">{{ JSON.stringify(rlsCheck, null, 2) }}</pre>
    </div>
    
    <button @click="checkClients" class="bg-blue-500 text-white px-4 py-2 rounded">
      Refresh Data
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const allClients = ref(null)
const userClients = ref(null)
const rlsCheck = ref(null)

const checkClients = async () => {
  try {
    // Get all clients without filter
    const { data: all, error: allError } = await supabase
      .from('clients')
      .select('*')
    
    allClients.value = { data: all, error: allError }
    
    // Get clients with created_by filter
    const { data: userOnly, error: userError } = await supabase
      .from('clients')
      .select('*')
      .eq('created_by', user.value.id)
    
    userClients.value = { data: userOnly, error: userError }
    
    // Check RLS by trying different queries
    const rlsTests = {}
    
    // Test 1: Just select
    const { data: test1, error: error1 } = await supabase
      .from('clients')
      .select('id, name')
    rlsTests.selectOnly = { count: test1?.length, error: error1 }
    
    // Test 2: With user filter
    const { data: test2, error: error2 } = await supabase
      .from('clients')
      .select('id, name')
      .eq('created_by', user.value.id)
    rlsTests.withUserFilter = { count: test2?.length, error: error2 }
    
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

onMounted(() => {
  checkClients()
})
</script>