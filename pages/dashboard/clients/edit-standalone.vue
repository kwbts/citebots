<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Standalone Edit Page</h1>
    
    <!-- URL Info -->
    <div class="mb-4 p-4 bg-gray-100 rounded">
      <p>This page is at: /dashboard/clients/edit-standalone</p>
      <p>Client ID from query: {{ clientId }}</p>
    </div>
    
    <!-- Simple Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Edit Client</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <input
            v-model="brandName"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Type brand name here"
          />
          <p class="text-sm text-gray-500 mt-1">Current value: {{ brandName }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input
            v-model="domain"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Type domain here"
          />
          <p class="text-sm text-gray-500 mt-1">Current value: {{ domain }}</p>
        </div>
        
        <button
          @click="saveData"
          class="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
    
    <!-- Debug Info -->
    <div class="mt-4 p-4 bg-yellow-50 rounded">
      <h3 class="font-semibold mb-2">Debug Info</h3>
      <p>Page loaded at: {{ loadTime }}</p>
      <p>Inputs are bound to Vue: {{ brandName !== '' || domain !== '' ? 'Yes' : 'No' }}</p>
      <button @click="testClick" class="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm">
        Test Click ({{ clickCount }} clicks)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabase } from '~/composables/useSupabase'

const route = useRoute()
const supabase = useSupabase()

const clientId = ref(route.query.id || '')
const brandName = ref('')
const domain = ref('')
const loadTime = ref(new Date().toLocaleTimeString())
const clickCount = ref(0)

const loadData = async () => {
  if (clientId.value) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId.value)
        .single()
      
      if (data) {
        brandName.value = data.name
        domain.value = data.domain
      }
    } catch (error) {
      console.error('Error loading:', error)
    }
  }
}

const saveData = async () => {
  alert(`Would save: ${brandName.value}, ${domain.value}`)
  console.log('Save clicked with:', { brandName: brandName.value, domain: domain.value })
}

const testClick = () => {
  clickCount.value++
  console.log('Button clicked, count:', clickCount.value)
}

onMounted(() => {
  console.log('Edit standalone page mounted')
  loadData()
})
</script>