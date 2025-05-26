<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Citebots</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Generative Engine Optimization Dashboard</p>
      </div>

      <!-- Login Form -->
      <div class="card">
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

      <!-- Messages -->
      <div v-if="message" class="mt-4 p-4 rounded-md" 
        :class="messageType === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDarkMode } from '~/composables/useDarkMode'

const router = useRouter()
const supabase = useSupabaseClient()
const { isDark } = useDarkMode() // Initialize dark mode
const message = ref('')
const messageType = ref('')
const isSubmitting = ref(false)

const loginForm = ref({
  email: '',
  password: ''
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
</script>