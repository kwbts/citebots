<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Provision New Client</h1>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Brand Information -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Brand Information</h2>
        
        <div class="space-y-4">
          <div>
            <label for="brandName" class="block text-sm font-medium text-gray-700 mb-1">
              Brand Name
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Knak"
            />
          </div>
          
          <div>
            <label for="domain" class="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., knak.com"
            />
          </div>
        </div>
      </div>

      <!-- Competitors -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Competitors</h2>
        
        <div class="space-y-4">
          <div v-for="(competitor, index) in form.competitors" :key="index" class="flex gap-3">
            <input
              v-model="competitor.name"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Competitor name"
            />
            <input
              v-model="competitor.domain"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Competitor domain"
            />
            <button
              type="button"
              @click="removeCompetitor(index)"
              class="p-2 text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            @click="addCompetitor"
            class="mt-2 w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Competitor
          </button>
        </div>
      </div>

      <!-- AI Enhancement -->
      <div v-if="savedClientId" class="bg-green-50 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Client Created Successfully!</h3>
            <p class="text-gray-600 mt-1">Would you like to enhance this client with AI-powered data?</p>
          </div>
          <button
            @click="enhanceWithAI"
            :disabled="isEnhancing"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <svg v-if="isEnhancing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEnhancing ? 'Enhancing...' : 'Enhance with AI' }}
          </button>
        </div>

        <div v-if="aiError" class="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {{ aiError }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          type="button"
          @click="navigateTo('/dashboard/clients')"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <div class="flex gap-3">
          <button
            v-if="savedClientId"
            @click="navigateTo('/dashboard/clients/manage')"
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Clients
          </button>
          <button
            v-else
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Client' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useSupabase } from '~/composables/useSupabase'
import { useAIEnhancement } from '~/composables/useAIEnhancement'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const { enhanceClientWithAI } = useAIEnhancement()

const isSubmitting = ref(false)
const isEnhancing = ref(false)
const savedClientId = ref(null)
const aiError = ref(null)

const form = ref({
  brandName: '',
  domain: '',
  competitors: []
})

const addCompetitor = () => {
  form.value.competitors.push({ name: '', domain: '' })
}

const removeCompetitor = (index) => {
  form.value.competitors.splice(index, 1)
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // First create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: form.value.brandName,
        domain: form.value.domain
      })
      .select()
      .single()
    
    if (clientError) throw clientError
    
    // Then create competitors if any exist
    if (form.value.competitors.length > 0) {
      const competitors = form.value.competitors
        .filter(c => c.name && c.domain) // Only include competitors with both name and domain
        .map(competitor => ({
          client_id: client.id,
          name: competitor.name,
          domain: competitor.domain
        }))
      
      if (competitors.length > 0) {
        const { error: competitorsError } = await supabase
          .from('competitors')
          .insert(competitors)
        
        if (competitorsError) throw competitorsError
      }
    }
    
    // Success - save client ID and show AI enhancement option
    savedClientId.value = client.id
  } catch (error) {
    console.error('Error creating client:', error)
    alert(`Error creating client: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const enhanceWithAI = async () => {
  if (isEnhancing.value || !savedClientId.value) return

  isEnhancing.value = true
  aiError.value = null

  try {
    const result = await enhanceClientWithAI(
      savedClientId.value,
      form.value.brandName,
      form.value.domain
    )

    if (result.success) {
      // Success - navigate to edit page to see enhanced data
      navigateTo(`/dashboard/clients/edit-client-${savedClientId.value}`)
    } else {
      throw new Error(result.error || 'Enhancement failed')
    }
  } catch (error) {
    console.error('Error enhancing client:', error)
    aiError.value = error.message || 'Failed to enhance client with AI'
  } finally {
    isEnhancing.value = false
  }
}
</script>