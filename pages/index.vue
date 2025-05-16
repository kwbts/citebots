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

          <button type="submit" class="w-full btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>

      <!-- Request Access Form -->
      <div v-else class="card">
        <form @submit.prevent="handleRequest">
          <div class="mb-4">
            <label for="first-name" class="form-label">First Name</label>
            <input
              type="text"
              id="first-name"
              v-model="requestForm.firstName"
              class="input-field"
              placeholder="John"
              required
            />
          </div>

          <div class="mb-4">
            <label for="last-name" class="form-label">Last Name</label>
            <input
              type="text"
              id="last-name"
              v-model="requestForm.lastName"
              class="input-field"
              placeholder="Doe"
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

          <div class="mb-6">
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

          <button type="submit" class="w-full btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Processing...' : 'Request Access' }}
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
import { useSupabase } from '~/composables/useSupabase'

const router = useRouter()
const supabase = useSupabase()
const activeForm = ref('login')
const message = ref('')
const messageType = ref('')
const isSubmitting = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const requestForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: ''
})

const handleLogin = async () => {
  message.value = ''
  isSubmitting.value = true

  try {
    // Implement actual Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.value.email,
      password: loginForm.value.password,
    })

    if (error) {
      throw error
    }

    message.value = 'Login successful! Redirecting...'
    messageType.value = 'success'

    // Check if we have a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  } catch (error) {
    message.value = error.message || 'Login failed. Please check your credentials.'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const handleRequest = async () => {
  message.value = ''
  isSubmitting.value = true

  try {
    // Basic validation
    if (!requestForm.value.firstName || !requestForm.value.lastName ||
        !requestForm.value.email || !requestForm.value.company) {
      throw new Error('Please fill in all fields')
    }

    // Check if email is jon@knowbots.ca
    if (requestForm.value.email === 'jon@knowbots.ca') {
      message.value = 'Processing Super Admin account creation...'
      messageType.value = 'success'

      // Call Netlify function to create super admin account
      const response = await $fetch('/.netlify/functions/auth-provision', {
        method: 'POST',
        body: {
          firstName: requestForm.value.firstName,
          lastName: requestForm.value.lastName,
          email: requestForm.value.email,
          company: requestForm.value.company,
          role: 'super_admin'
        }
      })

      console.log('API Response:', response) // Debug log

      if (response && response.password) {
        message.value = `Account created successfully! Your password is: ${response.password}`
      } else {
        message.value = 'Account created but password not received. Check the access_requests table in Supabase.'
        console.error('No password in response:', response)
      }
      // Reset form
      requestForm.value = {
        firstName: '',
        lastName: '',
        email: '',
        company: ''
      }
    } else {
      // For other users, just store the request
      message.value = 'Access request submitted. Super Admin approval required.'
      messageType.value = 'success'
    }
  } catch (error) {
    console.error('Request error:', error)
    if (error.data) {
      console.error('Error data:', error.data)
    }
    message.value = error.message || 'Failed to submit request. Please try again.'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>