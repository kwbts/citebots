<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Diagnostic Page</h1>
    
    <!-- Step 1: Verify basic input works -->
    <div class="mb-8 p-4 border">
      <h2 class="font-bold mb-2">Step 1: Basic Input Test</h2>
      <input 
        type="text" 
        placeholder="Can you type here?"
        class="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <p class="mt-2 text-sm">If you can type above, inputs work on this page.</p>
    </div>
    
    <!-- Step 2: Check current URL -->
    <div class="mb-8 p-4 border">
      <h2 class="font-bold mb-2">Step 2: Current Page Info</h2>
      <p>Current URL path: {{ $route.path }}</p>
      <p>Route name: {{ $route.name }}</p>
      <p>Route params: {{ JSON.stringify($route.params) }}</p>
    </div>
    
    <!-- Step 3: Navigation test -->
    <div class="mb-8 p-4 border">
      <h2 class="font-bold mb-2">Step 3: Navigation Test</h2>
      <p class="mb-2">Click this button and tell me what happens:</p>
      <button 
        @click="testNavigation"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Test Navigation
      </button>
      <p class="mt-2">Navigation attempts: {{ navigationCount }}</p>
    </div>
    
    <!-- Step 4: Direct edit page test -->
    <div class="mb-8 p-4 border">
      <h2 class="font-bold mb-2">Step 4: Direct Edit Page</h2>
      <p class="mb-2">Enter a client ID and go directly to edit page:</p>
      <input 
        v-model="clientIdInput"
        type="text" 
        placeholder="Enter client ID"
        class="w-full px-3 py-2 border border-gray-300 rounded mb-2"
      />
      <button 
        @click="goDirectToEdit"
        class="px-4 py-2 bg-green-600 text-white rounded"
      >
        Go to Edit Page
      </button>
    </div>
    
    <!-- Step 5: Console check -->
    <div class="mb-8 p-4 border">
      <h2 class="font-bold mb-2">Step 5: Console Output</h2>
      <button 
        @click="logToConsole"
        class="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Log to Console
      </button>
      <p class="mt-2 text-sm">Check browser console for output</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navigationCount = ref(0)
const clientIdInput = ref('')

const testNavigation = () => {
  navigationCount.value++
  console.log('Navigation test clicked, count:', navigationCount.value)
  console.log('Current route:', route.path)
  alert('Navigation test clicked. Check if page changed.')
}

const goDirectToEdit = () => {
  if (clientIdInput.value) {
    const editPath = `/dashboard/clients/${clientIdInput.value}/edit`
    console.log('Navigating to:', editPath)
    router.push(editPath)
  } else {
    alert('Please enter a client ID')
  }
}

const logToConsole = () => {
  console.log('=== DIAGNOSTIC INFO ===')
  console.log('Current path:', route.path)
  console.log('Route object:', route)
  console.log('Router object:', router)
  console.log('Window location:', window.location.href)
  console.log('======================')
}
</script>