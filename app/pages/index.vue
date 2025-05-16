<template>
  <div class="min-h-screen flex items-center justify-center bg-citebots-gray-50">
    <div class="max-w-md w-full">
      <!-- Logo and Header -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="bg-citebots-orange p-3 rounded-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-citebots-dark">Citebots</h1>
        <p class="text-citebots-gray-600 mt-2">Generative Engine Optimization Dashboard</p>
      </div>

      <!-- Toggle between forms -->
      <div class="mb-6">
        <div class="flex bg-citebots-gray-100 p-1 rounded-lg">
          <button
            @click="activeForm = 'login'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
              activeForm === 'login' 
                ? 'bg-white text-citebots-dark shadow-sm' 
                : 'text-citebots-gray-600 hover:text-citebots-gray-800'
            ]"
          >
            Sign In
          </button>
          <button
            @click="activeForm = 'request'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200',
              activeForm === 'request' 
                ? 'bg-white text-citebots-dark shadow-sm' 
                : 'text-citebots-gray-600 hover:text-citebots-gray-800'
            ]"
          >
            Request Access
          </button>
        </div>
      </div>

      <!-- Login Form -->
      <div v-if="activeForm === 'login'" class="card">
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              class="input-field"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div class="mb-6">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="w-full btn-primary">
            Sign In
          </button>
        </form>
      </div>

      <!-- Request Access Form -->
      <div v-else class="card">
        <form @submit.prevent="handleRequest">
          <div class="mb-4">
            <label for="request-name" class="form-label">Full Name</label>
            <input
              type="text"
              id="request-name"
              v-model="requestForm.name"
              class="input-field"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div class="mb-4">
            <label for="request-email" class="form-label">Email</label>
            <input
              type="email"
              id="request-email"
              v-model="requestForm.email"
              class="input-field"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div class="mb-4">
            <label for="company" class="form-label">Company</label>
            <input
              type="text"
              id="company"
              v-model="requestForm.company"
              class="input-field"
              placeholder="Your Company"
              required
            />
          </div>
          
          <div class="mb-6">
            <label for="role" class="form-label">Your Role</label>
            <select
              id="role"
              v-model="requestForm.role"
              class="input-field"
              required
            >
              <option value="">Select a role</option>
              <option value="client">Client</option>
              <option value="agency">Agency Partner</option>
              <option value="consultant">Consultant</option>
            </select>
          </div>

          <button type="submit" class="w-full btn-primary">
            Request Access
          </button>
        </form>
      </div>

      <!-- Messages -->
      <div v-if="message" class="mt-4 p-4 rounded-md" 
        :class="messageType === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeForm = ref('login')
const message = ref('')
const messageType = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const requestForm = ref({
  name: '',
  email: '',
  company: '',
  role: ''
})

const handleLogin = async () => {
  message.value = ''
  
  try {
    // For MVP, we'll do a simple check
    if (loginForm.value.email && loginForm.value.password) {
      // TODO: Implement actual Supabase authentication
      message.value = 'Logging in...'
      messageType.value = 'success'
      
      // Simulate login
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
  } catch (error) {
    message.value = 'Login failed. Please try again.'
    messageType.value = 'error'
  }
}

const handleRequest = async () => {
  message.value = ''
  
  try {
    // TODO: Implement actual request submission
    if (requestForm.value.name && requestForm.value.email) {
      message.value = 'Access request submitted successfully. We\'ll be in touch soon!'
      messageType.value = 'success'
      
      // Reset form
      requestForm.value = {
        name: '',
        email: '',
        company: '',
        role: ''
      }
    }
  } catch (error) {
    message.value = 'Failed to submit request. Please try again.'
    messageType.value = 'error'
  }
}
</script>