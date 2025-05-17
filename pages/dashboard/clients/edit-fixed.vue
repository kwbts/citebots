<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8">Edit Client (Fixed Version)</h1>
    
    <!-- Debug info -->
    <div class="mb-4 p-4 bg-gray-100 rounded">
      <p>Client ID from params: {{ $route.params.id }}</p>
      <p>Loading: {{ isLoading }}</p>
    </div>
    
    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Brand Information</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              v-model="brandName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input
              v-model="domain"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div class="flex justify-between">
        <button
          type="button"
          @click="navigateTo(`/dashboard/clients/${$route.params.id}`)"
          class="px-6 py-2 border border-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from '#app'
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const isLoading = ref(false)
const brandName = ref('')
const domain = ref('')

onMounted(async () => {
  const clientId = useRoute().params.id
  console.log('Edit-fixed mounted with ID:', clientId)
  
  if (clientId) {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      
      if (data) {
        brandName.value = data.name
        domain.value = data.domain
        console.log('Data loaded:', data)
      }
      
      if (error) {
        console.error('Error loading:', error)
      }
    } finally {
      isLoading.value = false
    }
  }
})

const handleSubmit = async () => {
  const clientId = useRoute().params.id
  console.log('Submitting for ID:', clientId)
  
  try {
    const { error } = await supabase
      .from('clients')
      .update({
        name: brandName.value,
        domain: domain.value
      })
      .eq('id', clientId)
    
    if (error) throw error
    
    navigateTo(`/dashboard/clients/${clientId}`)
  } catch (error) {
    console.error('Save error:', error)
    alert('Error: ' + error.message)
  }
}
</script>