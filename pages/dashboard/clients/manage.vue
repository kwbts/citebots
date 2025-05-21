<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header flex justify-between items-center">
      <div>
        <h1 class="page-title">Manage Clients</h1>
        <p class="page-subtitle">View and manage your client profiles</p>
      </div>
      <button
        @click="navigateTo('/dashboard/clients/provision')"
        class="btn-primary"
      >
        Add New Client
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
      <p class="mt-4 text-citebots-gray-600">Loading clients...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4">
      <p class="text-red-700">Error loading clients: {{ error }}</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="clients.length === 0" class="text-center py-12 card">
      <svg class="mx-auto h-12 w-12 text-citebots-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-citebots-dark">No clients yet</h3>
      <p class="mt-1 text-citebots-gray-500">Get started by creating a new client.</p>
      <button
        @click="navigateTo('/dashboard/clients/provision')"
        class="mt-4 btn-primary"
      >
        Create Your First Client
      </button>
    </div>
    
    <!-- Clients List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="client in clients"
        :key="client.id"
        @click="viewClient(client.id)"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold text-citebots-dark">{{ client.name }}</h3>
            <p class="text-citebots-gray-600">{{ client.domain }}</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span v-if="client.industry_primary" class="text-xs bg-citebots-gray-100 text-citebots-gray-600 px-2 py-1 rounded">
                {{ client.industry_primary }}
              </span>
              <span v-if="client.business_model" class="text-xs bg-citebots-gray-100 text-citebots-gray-600 px-2 py-1 rounded">
                {{ client.business_model }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-citebots-gray-500">
              Updated {{ formatDate(client.updated_at) }}
            </p>
            <div class="mt-2 flex gap-2 justify-end">
              <button
                @click.stop="editClient(client.id)"
                class="text-citebots-orange hover:text-citebots-orange/80"
                title="Edit"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="runAnalysis(client.id)"
                class="text-green-600 hover:text-green-700"
                title="Run Analysis"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { navigateTo } from '#app'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const clients = ref([])
const isLoading = ref(true)
const error = ref(null)

const loadClients = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })

    if (fetchError) throw fetchError

    clients.value = data || []
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const viewClient = (id) => {
  navigateTo(`/dashboard/clients/${id}`)
}

const editClient = (id) => {
  navigateTo(`/dashboard/clients/edit-client-${id}`)
}

const runAnalysis = (id) => {
  navigateTo(`/dashboard/analysis?client_id=${id}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadClients()
})
</script>