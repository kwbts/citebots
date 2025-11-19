<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Content Brief Debugger</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Brief Lookup</h2>
      <div class="flex space-x-2 mb-4">
        <input v-model="briefId" placeholder="Enter brief ID" class="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-3 py-2 flex-grow" />
        <button @click="loadBrief" class="bg-citebots-orange hover:bg-orange-600 text-white px-4 py-2 rounded">Load Brief</button>
      </div>
      <div v-if="isLoading" class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <div class="animate-spin h-4 w-4 border-2 border-citebots-orange border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
      <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
    </div>
    
    <div v-if="allBriefs.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Available Briefs</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-4">#</th>
              <th class="text-left py-2 px-4">ID</th>
              <th class="text-left py-2 px-4">Title</th>
              <th class="text-left py-2 px-4">Status</th>
              <th class="text-left py-2 px-4">Created</th>
              <th class="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(brief, i) in allBriefs" :key="brief.id" class="border-b border-gray-200 dark:border-gray-700">
              <td class="py-2 px-4">{{ i + 1 }}</td>
              <td class="py-2 px-4 font-mono text-sm">{{ brief.id }}</td>
              <td class="py-2 px-4">{{ brief.title }}</td>
              <td class="py-2 px-4">
                <span :class="{
                  'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300': brief.status === 'completed',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300': brief.status === 'processing',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': brief.status === 'pending',
                  'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300': brief.status === 'failed'
                }" class="px-2 py-1 rounded-full text-xs">
                  {{ brief.status }}
                </span>
              </td>
              <td class="py-2 px-4">{{ formatDate(brief.created_at) }}</td>
              <td class="py-2 px-4">
                <div class="flex space-x-2">
                  <button @click="briefId = brief.id; loadBrief()" class="text-blue-500 hover:underline">View</button>
                  <a :href="`/dashboard/actions/content-brief/view/${brief.id}`" target="_blank" class="text-citebots-orange hover:underline">Open Page</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="currentBrief" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Brief Details</h2>
        <div>
          <button @click="showRawData = !showRawData" class="text-blue-500 hover:underline">
            {{ showRawData ? 'Show Formatted' : 'Show Raw JSON' }}
          </button>
        </div>
      </div>
      
      <div v-if="!showRawData">
        <div class="mb-4">
          <h3 class="font-semibold mb-1">Title</h3>
          <p>{{ currentBrief.title }}</p>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-1">Status</h3>
          <p>{{ currentBrief.status }}</p>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-1">Keywords</h3>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="(keyword, idx) in currentBrief.keywords" 
              :key="idx"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-1">Summary</h3>
          <p v-if="currentBrief.content?.summary">{{ currentBrief.content.summary }}</p>
          <p v-else class="text-red-500">No summary found in content</p>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-1">Content Structure</h3>
          <div v-if="currentBrief.content" class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div v-for="(value, key) in contentStructure" :key="key" class="mb-2">
              <strong>{{ key }}:</strong> 
              <span v-if="Array.isArray(value)">
                {{ value.length }} items
              </span>
              <span v-else-if="typeof value === 'object'">
                Object with {{ Object.keys(value).length }} keys
              </span>
              <span v-else>
                {{ value }}
              </span>
            </div>
          </div>
          <p v-else class="text-red-500">No content structure found</p>
        </div>
      </div>
      
      <pre v-else class="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">{{ JSON.stringify(currentBrief, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const briefId = ref('')
const currentBrief = ref(null)
const isLoading = ref(false)
const error = ref(null)
const showRawData = ref(false)
const allBriefs = ref([])
const supabase = useSupabaseClient()

// Fetch all briefs
const fetchAllBriefs = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const { data, error: fetchError } = await supabase
      .from('content_briefs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    allBriefs.value = data || []
  } catch (err) {
    console.error('Error fetching briefs:', err)
    error.value = `Error loading briefs: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

// Load a specific brief
const loadBrief = async () => {
  if (!briefId.value) {
    error.value = 'Please enter a brief ID'
    return
  }
  
  isLoading.value = true
  error.value = null
  currentBrief.value = null
  
  try {
    const { data, error: fetchError } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', briefId.value)
      .single()
    
    if (fetchError) throw fetchError
    if (!data) throw new Error('Brief not found')
    
    currentBrief.value = data
    console.log('Brief data:', data)
  } catch (err) {
    console.error('Error loading brief:', err)
    error.value = `Error loading brief: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Computed content structure
const contentStructure = computed(() => {
  if (!currentBrief.value?.content) return {}
  
  return Object.keys(currentBrief.value.content).reduce((acc, key) => {
    const value = currentBrief.value.content[key]
    acc[key] = value
    return acc
  }, {})
})

// On mount, fetch all briefs
onMounted(() => {
  fetchAllBriefs()
})
</script>