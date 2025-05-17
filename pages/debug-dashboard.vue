<template>
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Dashboard Debug</h1>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Step 1: Check Auth</h2>
        <button @click="checkAuth" class="btn-primary mb-4">Check Auth</button>
        
        <div v-if="authData" class="mb-4">
          <h3 class="font-semibold mb-2">Auth Data</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(authData, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Step 2: Query Profile</h2>
        <button @click="queryProfile" class="btn-primary mb-4" :disabled="!userId">Query Profile</button>
        
        <div v-if="profileData" class="mb-4">
          <h3 class="font-semibold mb-2">Profile Data</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(profileData, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Step 3: Test Direct Query</h2>
        <button @click="testDirectQuery" class="btn-primary mb-4" :disabled="!userId">Test Direct Query</button>
        
        <div v-if="directResult" class="mb-4">
          <h3 class="font-semibold mb-2">Direct Query Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(directResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Final Check: Dashboard Logic</h2>
        <button @click="testDashboardLogic" class="btn-primary mb-4">Test Dashboard Logic</button>
        
        <div v-if="dashboardResult" class="mb-4">
          <h3 class="font-semibold mb-2">Dashboard Logic Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(dashboardResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const authData = ref(null)
const profileData = ref(null)
const directResult = ref(null)
const dashboardResult = ref(null)
const userId = ref(null)

const checkAuth = async () => {
  authData.value = null
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    authData.value = {
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        aud: user.aud,
        role: user.role
      } : null,
      session: !!session,
      authError: authError?.message,
      sessionError: sessionError?.message
    }
    
    if (user) {
      userId.value = user.id
    }
  } catch (error) {
    authData.value = { error: error.message }
  }
}

const queryProfile = async () => {
  profileData.value = null
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId.value)
      .single()
    
    profileData.value = {
      data,
      error: error?.message,
      query: `profiles.select('*').eq('id', '${userId.value}').single()`
    }
  } catch (error) {
    profileData.value = { error: error.message }
  }
}

const testDirectQuery = async () => {
  directResult.value = null
  
  try {
    // Try different queries
    const query1 = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, company, role')
      .eq('id', userId.value)
      .single()
    
    const query2 = await supabase
      .from('profiles')
      .select()
      .eq('id', userId.value)
      .single()
    
    const query3 = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    directResult.value = {
      specificColumns: {
        data: query1.data,
        error: query1.error?.message
      },
      noColumns: {
        data: query2.data,
        error: query2.error?.message
      },
      allProfiles: {
        data: query3.data,
        error: query3.error?.message
      }
    }
  } catch (error) {
    directResult.value = { error: error.message }
  }
}

const testDashboardLogic = async () => {
  dashboardResult.value = null
  
  try {
    // Replicate exact dashboard logic
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw authError
    }
    
    if (authUser) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      dashboardResult.value = {
        authUser: {
          id: authUser.id,
          email: authUser.email
        },
        profileData,
        profileError: profileError?.message,
        profileFields: profileData ? Object.keys(profileData) : []
      }
    }
  } catch (error) {
    dashboardResult.value = { error: error.message }
  }
}
</script>