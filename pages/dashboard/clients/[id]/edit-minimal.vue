<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8">Edit Client (Minimal)</h1>
    
    <form @submit.prevent="saveChanges" class="space-y-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Brand Information</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              v-model="name"
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
        <NuxtLink
          :to="`/dashboard/clients/${clientId}`"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
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

const route = useRoute()
const supabase = useSupabase()

const clientId = route.params.id
const name = ref('')
const domain = ref('')

onMounted(async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()
  
  if (data) {
    name.value = data.name
    domain.value = data.domain
  }
})

const saveChanges = async () => {
  const { error } = await supabase
    .from('clients')
    .update({
      name: name.value,
      domain: domain.value
    })
    .eq('id', clientId)
  
  if (!error) {
    navigateTo(`/dashboard/clients/${clientId}`)
  } else {
    alert('Error: ' + error.message)
  }
}
</script>