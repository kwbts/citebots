<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">My Profile</h1>
    
    <div v-if="isLoading" class="text-citebots-gray-600">Loading profile...</div>
    
    <div v-else-if="profile" class="card">
      <h2 class="text-xl font-semibold text-citebots-dark mb-4">Account Details</h2>
      <div class="space-y-4">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt class="font-medium text-citebots-gray-600">Name:</dt>
            <dd class="text-citebots-dark">{{ profile?.first_name }} {{ profile?.last_name }}</dd>
          </div>
          <div>
            <dt class="font-medium text-citebots-gray-600">Email:</dt>
            <dd class="text-citebots-dark">{{ profile?.email }}</dd>
          </div>
          <div>
            <dt class="font-medium text-citebots-gray-600">Company:</dt>
            <dd class="text-citebots-dark">{{ profile?.company }}</dd>
          </div>
          <div>
            <dt class="font-medium text-citebots-gray-600">Role:</dt>
            <dd class="text-citebots-dark capitalize">{{ profile?.role }}</dd>
          </div>
        </dl>
      </div>
    </div>
    
    <p v-else class="text-citebots-gray-600">
      Unable to load profile information. Please try refreshing the page.
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

// Apply auth middleware
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const router = useRouter()
const supabase = useSupabaseClient()
const user = ref(null)
const profile = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    // Get the current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    if (authUser) {
      console.log('Auth user:', authUser)
      user.value = authUser

      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      if (profileData) {
        console.log('Profile data:', profileData)
        profile.value = profileData
      }
    } else {
      console.log('No authenticated user found')
      router.push('/')
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
</script>