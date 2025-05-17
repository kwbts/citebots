<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Test Edit Page</h1>
    
    <!-- Test Input -->
    <div class="mb-4">
      <label class="block mb-2">Test Input (should be editable):</label>
      <input 
        v-model="testValue" 
        type="text" 
        class="w-full px-3 py-2 border border-gray-300 rounded"
        placeholder="Type here"
      />
      <p class="mt-2">Value: {{ testValue }}</p>
    </div>
    
    <!-- Client ID Test -->
    <div class="mb-4">
      <p>Route params: {{ $route.params }}</p>
      <p>Client ID: {{ clientId }}</p>
    </div>
    
    <!-- Simple Client Data -->
    <div class="mb-4">
      <button @click="loadClient" class="px-4 py-2 bg-blue-600 text-white rounded mb-2">
        Load Client Data
      </button>
      <p>Client Data: {{ JSON.stringify(clientData) }}</p>
    </div>
    
    <!-- Test if inputs work at all -->
    <div class="mb-4">
      <input 
        type="text" 
        placeholder="Raw input test"
        class="w-full px-3 py-2 border border-gray-300 rounded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'

const route = useRoute()
const supabase = useSupabase()

const testValue = ref('Initial value')
const clientId = ref(route.params.id)
const clientData = ref(null)

const loadClient = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId.value)
      .single()
    
    if (error) throw error
    clientData.value = data
  } catch (error) {
    console.error('Error:', error)
    alert('Error: ' + error.message)
  }
}
</script>