<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading client...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4">
      <p class="text-red-700">Error loading client: {{ error }}</p>
    </div>

    <!-- Client Details -->
    <div v-else-if="client">
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ client.name }}</h1>
          <p class="text-lg text-gray-600 mt-1">{{ client.domain }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="goToEdit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Client (Working)
          </button>
          <button
            @click="goToSimpleEdit"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Simple Edit (Test)
          </button>
          <NuxtLink
            :to="`/dashboard/clients/test-edit?id=${client.id}`"
            class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 inline-block"
          >
            Test Page
          </NuxtLink>
          <button
            @click="goToMinimalEdit"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Minimal Edit
          </button>
          <button
            @click="showDeleteConfirm = true"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Diagnostic Links -->
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <p class="font-semibold mb-2">Diagnostic Tools:</p>
        <div class="flex gap-2 flex-wrap">
          <NuxtLink
            to="/dashboard/clients/diagnostic"
            class="px-3 py-1 bg-gray-600 text-white rounded text-sm"
          >
            Diagnostic Page
          </NuxtLink>
          <NuxtLink
            :to="`/dashboard/clients/edit-standalone?id=${client.id}`"
            class="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
          >
            Standalone Edit
          </NuxtLink>
          <NuxtLink
            to="/dashboard/clients/compare-test"
            class="px-3 py-1 bg-pink-600 text-white rounded text-sm"
          >
            Compare Test
          </NuxtLink>
          <NuxtLink
            :to="`/dashboard/clients/edit-fixed?id=${client.id}`"
            class="px-3 py-1 bg-orange-600 text-white rounded text-sm"
          >
            Edit Fixed
          </NuxtLink>
          <NuxtLink
            to="/dashboard/clients/route-debug"
            class="px-3 py-1 bg-cyan-600 text-white rounded text-sm"
          >
            Route Debug
          </NuxtLink>
        </div>
      </div>

      <!-- Brand Information -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Brand Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Brand Name</p>
            <p class="text-gray-900">{{ client.name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Domain</p>
            <p class="text-gray-900">{{ client.domain }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Created</p>
            <p class="text-gray-900">{{ new Date(client.created_at).toLocaleDateString() }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Last Updated</p>
            <p class="text-gray-900">{{ new Date(client.updated_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <!-- Competitors -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Competitors</h2>
        
        <div v-if="client.competitors?.length > 0" class="space-y-3">
          <div v-for="competitor in client.competitors" :key="competitor.id" 
               class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900">{{ competitor.name }}</h3>
                <p class="text-gray-600">{{ competitor.domain }}</p>
              </div>
              <p class="text-xs text-gray-500">
                Added {{ new Date(competitor.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="mt-2">No competitors added yet</p>
          <button
            @click="navigateTo(`/dashboard/clients/${client.id}/edit`)"
            class="mt-3 text-blue-600 hover:text-blue-700"
          >
            Add competitors
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete {{ client?.name }}? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteClient"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
import { useSupabase } from '~/composables/useSupabase'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabase()

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
  // Use the working top-level dynamic route instead of nested
  navigateTo(`/client-edit-${route.params.id}`)
}

const goToSimpleEdit = () => {
  navigateTo(`/dashboard/clients/${route.params.id}/edit-simple`)
}

const goToMinimalEdit = () => {
  navigateTo(`/dashboard/clients/${route.params.id}/edit-minimal`)
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