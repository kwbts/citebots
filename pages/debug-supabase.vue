<template>
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Supabase Debug</h1>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Connection Test</h2>
        <button @click="testConnection" class="btn-primary mb-4">Test Connection</button>
        
        <div v-if="connectionResult" class="mb-4">
          <h3 class="font-semibold mb-2">Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(connectionResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Auth Status</h2>
        <button @click="checkAuth" class="btn-primary mb-4">Check Auth</button>
        
        <div v-if="authStatus" class="mb-4">
          <h3 class="font-semibold mb-2">Auth Status</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(authStatus, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Direct Profile Query</h2>
        <button @click="queryProfiles" class="btn-primary mb-4">Query Profiles</button>
        
        <div v-if="profilesResult" class="mb-4">
          <h3 class="font-semibold mb-2">Profiles Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(profilesResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Test SQL Query</h2>
        <button @click="testSQL" class="btn-primary mb-4">Run SQL Test</button>
        
        <div v-if="sqlResult" class="mb-4">
          <h3 class="font-semibold mb-2">SQL Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(sqlResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const connectionResult = ref(null)
const authStatus = ref(null)
const profilesResult = ref(null)
const sqlResult = ref(null)

const testConnection = async () => {
  connectionResult.value = null
  
  try {
    // Test basic connection by trying to get session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    connectionResult.value = {
      success: !error,
      session: session ? 'Session exists' : 'No session',
      error: error ? error.message : null,
      url: supabase.supabaseUrl,
      hasAnon: !!supabase.anonKey
    }
  } catch (err) {
    connectionResult.value = {
      success: false,
      error: err.message
    }
  }
}

const checkAuth = async () => {
  authStatus.value = null
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    authStatus.value = {
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      session: session ? {
        access_token: 'exists',
        token_type: session.token_type,
        expires_at: session.expires_at
      } : null,
      authError: authError ? authError.message : null,
      sessionError: sessionError ? sessionError.message : null
    }
  } catch (err) {
    authStatus.value = {
      error: err.message
    }
  }
}

const queryProfiles = async () => {
  profilesResult.value = null
  
  try {
    // First, try to get all profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
    
    // Then try to get user's profile
    const { data: { user } } = await supabase.auth.getUser()
    let userProfile = null
    let userError = null
    
    if (user) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      userProfile = result.data
      userError = result.error
    }
    
    profilesResult.value = {
      allProfiles,
      allError: allError ? allError.message : null,
      userProfile,
      userError: userError ? userError.message : null,
      userId: user ? user.id : null
    }
  } catch (err) {
    profilesResult.value = {
      error: err.message
    }
  }
}

const testSQL = async () => {
  sqlResult.value = null
  
  try {
    // First check if we can access any data
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count(*)')
    
    // Try to list all public tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    sqlResult.value = {
      test: testData,
      testError: testError ? testError.message : null,
      tables,
      tablesError: tablesError ? tablesError.message : null
    }
  } catch (err) {
    sqlResult.value = {
      error: err.message
    }
  }
}
</script>