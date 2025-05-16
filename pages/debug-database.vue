<template>
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Database Debug (Admin)</h1>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Check Tables</h2>
        <button @click="checkTables" class="btn-primary mb-4">Check Tables</button>
        
        <div v-if="tablesResult" class="mb-4">
          <h3 class="font-semibold mb-2">Tables Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(tablesResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Check All Profiles</h2>
        <button @click="checkProfiles" class="btn-primary mb-4">Check Profiles</button>
        
        <div v-if="profilesResult" class="mb-4">
          <h3 class="font-semibold mb-2">Profiles Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(profilesResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card mb-4">
        <h2 class="text-lg font-semibold mb-4">Check Auth Users</h2>
        <button @click="checkAuthUsers" class="btn-primary mb-4">Check Auth Users</button>
        
        <div v-if="authUsersResult" class="mb-4">
          <h3 class="font-semibold mb-2">Auth Users Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(authUsersResult, null, 2) }}</pre>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Create Profile for User</h2>
        <form @submit.prevent="createProfile" class="space-y-4">
          <div>
            <label class="form-label">User ID</label>
            <input v-model="profileForm.id" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Email</label>
            <input v-model="profileForm.email" type="email" class="input-field" required />
          </div>
          <div>
            <label class="form-label">First Name</label>
            <input v-model="profileForm.first_name" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Last Name</label>
            <input v-model="profileForm.last_name" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Company</label>
            <input v-model="profileForm.company" class="input-field" required />
          </div>
          <div>
            <label class="form-label">Role</label>
            <select v-model="profileForm.role" class="input-field">
              <option value="super_admin">Super Admin</option>
              <option value="partner">Partner</option>
              <option value="client">Client</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">Create Profile</button>
        </form>
        
        <div v-if="createResult" class="mt-4">
          <h3 class="font-semibold mb-2">Create Result</h3>
          <pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(createResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tablesResult = ref(null)
const profilesResult = ref(null)
const authUsersResult = ref(null)
const createResult = ref(null)

const profileForm = ref({
  id: '',
  email: 'jon@knowbots.ca',
  first_name: 'Jon',
  last_name: 'Taylor',
  company: 'Knowbots',
  role: 'super_admin'
})

const checkTables = async () => {
  tablesResult.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/debug-database', {
      method: 'POST',
      body: { action: 'check-tables' }
    })
    
    tablesResult.value = response
  } catch (err) {
    tablesResult.value = { error: err.message }
  }
}

const checkProfiles = async () => {
  profilesResult.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/debug-database', {
      method: 'POST',
      body: { action: 'check-profiles' }
    })
    
    profilesResult.value = response
  } catch (err) {
    profilesResult.value = { error: err.message }
  }
}

const checkAuthUsers = async () => {
  authUsersResult.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/debug-database', {
      method: 'POST',
      body: { action: 'check-auth-users' }
    })
    
    authUsersResult.value = response
  } catch (err) {
    authUsersResult.value = { error: err.message }
  }
}

const createProfile = async () => {
  createResult.value = null
  
  try {
    const response = await $fetch('/.netlify/functions/debug-database', {
      method: 'POST',
      body: {
        action: 'create-profile',
        profileData: profileForm.value
      }
    })
    
    createResult.value = response
  } catch (err) {
    createResult.value = { error: err.message }
  }
}
</script>