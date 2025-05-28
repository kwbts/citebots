<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Loading client...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p class="text-red-700 dark:text-red-300">Error loading client: {{ error }}</p>
    </div>

    <!-- Client Details -->
    <div v-else-if="client">
      <!-- Header -->
      <div class="page-header flex justify-between items-start">
        <div>
          <h1 class="page-title">{{ client.name }}</h1>
          <p class="page-subtitle">{{ client.domain }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="goToEdit"
            class="btn-secondary"
          >
            Edit Client
          </button>
          <button
            @click="showDeleteConfirm = true"
            class="btn-primary bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Brand Information -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Brand Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="form-label">Brand Name</p>
            <p class="text-gray-900 dark:text-white">{{ client.name || 'Not specified' }}</p>
          </div>
          <div>
            <p class="form-label">Domain</p>
            <p class="text-gray-900 dark:text-white">{{ client.domain || 'Not specified' }}</p>
          </div>
          <div>
            <p class="form-label">Created</p>
            <p class="text-gray-900 dark:text-white">{{ new Date(client.created_at).toLocaleDateString() }}</p>
          </div>
          <div>
            <p class="form-label">Last Updated</p>
            <p class="text-gray-900 dark:text-white">{{ new Date(client.updated_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <!-- Industry Information -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Industry Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="form-label">Primary Industry</p>
            <p class="text-gray-900 dark:text-white">{{ client.industry_primary || 'Not specified' }}</p>
          </div>
          <div>
            <p class="form-label">Secondary Industry</p>
            <p class="text-gray-900 dark:text-white">{{ client.industry_secondary || 'Not specified' }}</p>
          </div>
          <div>
            <p class="form-label">Business Model</p>
            <p class="text-gray-900 dark:text-white">{{ client.business_model || 'Not specified' }}</p>
          </div>
          <div>
            <p class="form-label">Sub-Industry</p>
            <p class="text-gray-900 dark:text-white">{{ client.sub_industry || 'Not specified' }}</p>
          </div>
        </div>
      </div>

      <!-- Target Market & Products -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Target Market & Products</h2>
        <div class="space-y-4">
          <div>
            <p class="form-label">Target Audience</p>
            <div v-if="client.target_audience?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.target_audience" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Key Products/Services</p>
            <div v-if="client.key_products?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.key_products" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Unique Selling Propositions</p>
            <div v-if="client.unique_selling_props?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.unique_selling_props" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Brand Voice</p>
            <div v-if="client.brand_voice?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.brand_voice" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
        </div>
      </div>

      <!-- Business Context -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Business Context</h2>
        <div class="space-y-4">
          <div>
            <p class="form-label">Customer Problems Solved</p>
            <div v-if="client.customer_problems?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.customer_problems" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Common Use Cases</p>
            <div v-if="client.use_cases?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.use_cases" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Industry Terminology</p>
            <div v-if="client.industry_terminology?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.industry_terminology" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Regulatory Considerations</p>
            <div v-if="client.regulatory_considerations?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.regulatory_considerations" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
          
          <div>
            <p class="form-label">Geographic Regions</p>
            <div v-if="client.geographic_regions?.length" class="flex flex-wrap gap-2">
              <span v-for="(item, index) in client.geographic_regions" :key="index"
                    class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </span>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">Not specified</p>
          </div>
        </div>
      </div>

      <!-- Competitors -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Competitors</h2>
        
        <div v-if="client.competitors?.length > 0" class="space-y-3">
          <div v-for="competitor in client.competitors" :key="competitor.id"
               class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ competitor.name }}</h3>
                <p class="text-gray-600 dark:text-gray-400">{{ competitor.domain }}</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Added {{ new Date(competitor.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="mt-2">No competitors added yet</p>
          <button
            @click="goToEdit"
            class="mt-3 text-citebots-orange hover:text-citebots-orange/80"
          >
            Add competitors
          </button>
        </div>
      </div>

      <!-- Keywords -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Keywords</h2>
        <div v-if="client.keywords?.length" class="flex flex-wrap gap-2">
          <span v-for="(keyword, index) in client.keywords" :key="index"
                class="inline-block bg-citebots-orange/10 text-citebots-orange px-3 py-1 rounded-full text-sm font-medium">
            {{ keyword }}
          </span>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400">No keywords defined</p>
      </div>

      <!-- AI Enhancement Info -->
      <div v-if="client.ai_enhancement_count > 0" class="card mb-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <span class="mr-2">AI Enhancement</span>
          <span class="text-sm text-purple-600 dark:text-purple-400">✨</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="form-label">Enhancement Count</p>
            <p class="text-gray-900 dark:text-white">{{ client.ai_enhancement_count }} times</p>
          </div>
          <div>
            <p class="form-label">Last Enhanced</p>
            <p class="text-gray-900 dark:text-white">{{ client.ai_enhanced_at ? new Date(client.ai_enhanced_at).toLocaleDateString() : 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete {{ client?.name }}? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="deleteClient"
            class="btn-primary bg-red-600 hover:bg-red-700"
          >
            Delete Client
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navigateTo } from '#app'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const client = ref(null)
const isLoading = ref(true)
const error = ref(null)
const showDeleteConfirm = ref(false)

const loadClient = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select(`
        *,
        competitors (
          id,
          name,
          domain,
          created_at
        )
      `)
      .eq('id', route.params.id)
      .single()
    
    if (fetchError) throw fetchError
    
    client.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const goToEdit = () => {
  navigateTo(`/dashboard/clients/edit-client-${route.params.id}`)
}

const deleteClient = async () => {
  try {
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', route.params.id)

    if (deleteError) throw deleteError

    // Navigate back to manage page after successful deletion
    navigateTo('/dashboard/clients/manage')
  } catch (err) {
    console.error('Error deleting client:', err)
    alert(`Error deleting client: ${err.message}`)
  }
}

onMounted(() => {
  loadClient()
})
</script>