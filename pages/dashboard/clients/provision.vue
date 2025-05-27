<template>
  <div class="max-w-2xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Add New Client</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Enter your client's basic information to get started</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Creation Form -->
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="mb-8">
          <div class="text-xs font-semibold text-citebots-orange/80 dark:text-citebots-orange/90 uppercase tracking-wider mb-2">CLIENT SETUP</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Basic Information</h2>
          <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed">We'll automatically research and enhance your client profile with AI.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label for="brandName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
              Client Name <span class="text-red-500">*</span>
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              required
              class="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
              placeholder="e.g., Acme Corporation"
            />
          </div>

          <div>
            <label for="domain" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
              Website Domain <span class="text-red-500">*</span>
            </label>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              required
              class="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
              placeholder="e.g., acme.com"
            />
          </div>
        </div>

        <!-- What happens next -->
        <div class="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">What happens next?</h3>
              <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• We'll create your client profile</li>
                <li>• AI will research their industry and competitors</li>
                <li>• You'll be taken to the management page to review and edit</li>
                <li>• Competitors will be ready for analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isSubmitting || !form.brandName || !form.domain"
          class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-8 py-4 font-semibold text-base hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 focus:ring-offset-gray-900 inline-flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSubmitting ? 'Creating Client...' : 'Create Client' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useAIEnhancement } from '~/composables/useAIEnhancement'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const { enhanceClientWithAI } = useAIEnhancement()

const isSubmitting = ref(false)

const form = ref({
  brandName: '',
  domain: ''
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get user profile to determine partner_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user?.id)
      .single()

    // Determine partner_id based on role
    let partnerId = user?.id // Default to current user
    if (profile?.role === 'super_admin') {
      // For super admin, they can be their own partner or we could ask them to select
      partnerId = user?.id
    }

    // Create the client with minimal data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: form.value.brandName,
        domain: form.value.domain,
        created_by: user?.id,
        partner_id: partnerId,
        // Set status to indicate AI enhancement is pending
        ai_enhancement_status: 'pending'
      })
      .select()
      .single()
    
    if (clientError) throw clientError
    
    // Navigate to manage page immediately - AI enhancement will happen in background
    navigateTo(`/dashboard/clients/${client.id}/manage`)
    
    // Start AI enhancement in background (don't await)
    enhanceClientInBackground(client.id, form.value.brandName, form.value.domain)
    
  } catch (error) {
    console.error('Error creating client:', error)
    alert(`Error creating client: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// Background AI enhancement
const enhanceClientInBackground = async (clientId, brandName, domain) => {
  try {
    // Update status to processing
    await supabase
      .from('clients')
      .update({ ai_enhancement_status: 'processing' })
      .eq('id', clientId)
    
    // Run AI enhancement
    const result = await enhanceClientWithAI(clientId, brandName, domain)
    
    if (result.success) {
      // Update client with AI data
      const updateData = {
        ...result.data,
        ai_enhancement_status: 'completed',
        ai_enhanced_at: new Date().toISOString()
      }
      
      await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId)
      
      console.log('AI enhancement completed for client:', clientId)
    } else {
      throw new Error('AI enhancement failed')
    }
  } catch (error) {
    console.error('Background AI enhancement failed:', error)
    
    // Update status to failed
    await supabase
      .from('clients')
      .update({ 
        ai_enhancement_status: 'failed',
        ai_enhancement_error: error.message 
      })
      .eq('id', clientId)
  }
}
</script>