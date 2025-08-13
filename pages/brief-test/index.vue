<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brief Viewer Test</h1>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief ID:</label>
        <div class="flex">
          <input 
            v-model="briefId" 
            type="text" 
            placeholder="Enter brief ID" 
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-citebots-orange focus:border-citebots-orange"
          />
          <button 
            @click="navigateToBrief"
            class="ml-2 bg-citebots-orange hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            View Brief
          </button>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="font-semibold mb-2">Example Brief IDs</h3>
        <div class="grid gap-2">
          <div class="p-2 bg-gray-50 dark:bg-gray-700/30 rounded flex justify-between items-center">
            <code class="text-sm">0dec3a2a-2cd5-466f-aca2-012826c22b3a</code>
            <button 
              @click="viewExampleBrief('0dec3a2a-2cd5-466f-aca2-012826c22b3a')"
              class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const briefId = ref('');

function navigateToBrief() {
  if (briefId.value.trim()) {
    router.push(`/brief-test/${briefId.value}`);
  }
}

function viewExampleBrief(id) {
  router.push(`/brief-test/${id}`);
}
</script>