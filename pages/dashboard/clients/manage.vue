<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Manage Clients</h1>
      <button
        @click="navigateTo('/dashboard/clients/provision')"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add New Client
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading clients...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4">
      <p class="text-red-700">Error loading clients: {{ error }}</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="clients.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No clients yet</h3>
      <p class="mt-1 text-gray-500">Get started by creating a new client.</p>
      <div class="mt-6">
        <button
          @click="navigateTo('/dashboard/clients/provision')"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create First Client
        </button>
      </div>
    </div>
    
    <!-- Clients List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="client in clients"
        :key="client.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ client.name }}</h3>
        <p class="text-gray-600 mb-4">{{ client.domain }}</p>
        
        <div v-if="client.competitors?.length > 0" class="mt-4 border-t pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Competitors</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li v-for="competitor in client.competitors" :key="competitor.id">
              {{ competitor.name }} ({{ competitor.domain }})
            </li>
          </ul>
        </div>
        
        <div class="mt-4 text-xs text-gray-500">
          Created {{ new Date(client.created_at).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from '#app'
import { useSupabase } from '~/composables/useSupabase'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const clients = ref([])
const isLoading = ref(true)
const error = ref(null)

const loadClients = async () => {
  try {
    // Fetch clients with their competitors
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
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    clients.value = data || []
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadClients()
})
</script>