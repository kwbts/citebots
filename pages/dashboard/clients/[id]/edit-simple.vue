<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Edit Client (Simple Test)</h1>
    
    <!-- Debug Info -->
    <div class="mb-4 p-4 bg-gray-100 rounded">
      <p>Client ID: {{ $route.params.id }}</p>
      <p>Loading: {{ isLoading }}</p>
      <p>Data: {{ JSON.stringify(clientData) }}</p>
    </div>
    
    <!-- Simple Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <input
            v-model="clientData.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input
            v-model="clientData.domain"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          @click="saveClient"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'

const route = useRoute()
const supabase = useSupabase()

const isLoading = ref(false)
const clientData = ref({
  name: '',
  domain: ''
})

const loadClient = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (error) throw error
    
    clientData.value = {
      name: data.name,
      domain: data.domain
    }
  } catch (error) {
    console.error('Error loading:', error)
  } finally {
    isLoading.value = false
  }
}

const saveClient = async () => {
  try {
    const { error } = await supabase
      .from('clients')
      .update({
        name: clientData.value.name,
        domain: clientData.value.domain
      })
      .eq('id', route.params.id)
    
    if (error) throw error
    alert('Saved successfully!')
  } catch (error) {
    console.error('Error saving:', error)
    alert('Error saving: ' + error.message)
  }
}

onMounted(() => {
  loadClient()
})
</script>