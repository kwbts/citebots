<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Edit Client</h1>
    
    <!-- Debug State Display -->
    <div class="mb-4 p-2 bg-gray-100 rounded text-sm">
      <p>Loading: {{ isLoading }}</p>
      <p>Error: {{ error || 'none' }}</p>
      <p>Client ID: {{ clientId }}</p>
      <p>Form: {{ JSON.stringify(form) }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 rounded-lg p-4 mb-6">
      <p class="text-red-700">Error: {{ error }}</p>
    </div>

    <!-- Edit Form (Always show) -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="mb-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-blue-700">Loading client data...</p>
      </div>

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
            />
          </div>
        </div>
      </div>

      <!-- Competitors -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Competitors</h2>
        
        <div class="space-y-4">
          <!-- Existing Competitors -->
          <div v-for="(competitor, index) in form.competitors" :key="competitor.tempId || competitor.id" 
               class="flex gap-3">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          type="button"
          @click="navigateTo(`/dashboard/clients/${clientId}`)"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#app'
import { useSupabase } from '~/composables/useSupabase'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const supabase = useSupabase()
const clientId = route.params.id

const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref(null)

const form = ref({
  brandName: '',
  domain: '',
  competitors: []
})

// Track original competitors to determine which to add/update/delete
const originalCompetitors = ref([])

const loadClient = async () => {
  console.log('Loading client with ID:', clientId)
  try {
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select(`
        *,
        competitors (
          id,
          name,
          domain
        )
      `)
      .eq('id', clientId)
      .single()

    if (fetchError) throw fetchError

    console.log('Loaded client data:', data)

    // Populate form with existing data
    form.value.brandName = data.name
    form.value.domain = data.domain
    form.value.competitors = data.competitors || []

    // Store original competitors for comparison
    originalCompetitors.value = JSON.parse(JSON.stringify(data.competitors || []))

    console.log('Form populated:', form.value)
  } catch (err) {
    console.error('Error loading client:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const addCompetitor = () => {
  form.value.competitors.push({ 
    tempId: Date.now(), // Temporary ID for tracking new competitors
    name: '', 
    domain: '' 
  })
}

const removeCompetitor = (index) => {
  form.value.competitors.splice(index, 1)
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  console.log('Submitting form:', form.value)
  isSubmitting.value = true
  error.value = null

  try {
    // Update client basic info
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        name: form.value.brandName,
        domain: form.value.domain
      })
      .eq('id', clientId)

    console.log('Update error:', updateError)
    if (updateError) throw updateError
    
    // Process competitors
    const currentCompetitors = form.value.competitors.filter(c => c.name && c.domain)
    const originalIds = originalCompetitors.value.map(c => c.id)
    const currentIds = currentCompetitors.filter(c => c.id).map(c => c.id)
    
    // Identify competitors to add, update, and delete
    const toAdd = currentCompetitors.filter(c => !c.id)
    const toUpdate = currentCompetitors.filter(c => c.id)
    const toDelete = originalCompetitors.value.filter(c => !currentIds.includes(c.id))
    
    // Add new competitors
    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('competitors')
        .insert(toAdd.map(competitor => ({
          client_id: clientId,
          name: competitor.name,
          domain: competitor.domain
        })))
      
      if (addError) throw addError
    }
    
    // Update existing competitors
    for (const competitor of toUpdate) {
      const { error: updateError } = await supabase
        .from('competitors')
        .update({
          name: competitor.name,
          domain: competitor.domain
        })
        .eq('id', competitor.id)
      
      if (updateError) throw updateError
    }
    
    // Delete removed competitors
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('competitors')
        .delete()
        .in('id', toDelete.map(c => c.id))
      
      if (deleteError) throw deleteError
    }
    
    // Navigate back to client detail page
    navigateTo(`/dashboard/clients/${clientId}`)
  } catch (err) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadClient()
})
</script>