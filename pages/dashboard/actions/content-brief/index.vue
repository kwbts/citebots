<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header Section with Direct Links -->
    <div class="mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Content Brief Generator</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Create comprehensive content briefs powered by AI research and competitor analysis</p>
          </div>
          
          <!-- Direct Brief Viewer Link -->
          <div v-if="directBriefId" class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p class="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
              <strong>Having trouble viewing briefs?</strong>
            </p>
            <p class="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
              Try our direct brief viewer:
            </p>
            <NuxtLink
              :to="`/dashboard/actions/content-brief/view/${directBriefId}`"
              class="btn-primary-sm"
            >
              View Latest Brief
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Brief Parameters</h2>

      <!-- Input Form -->
      <div class="max-w-3xl mx-auto">
        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Client Selection -->
          <div class="mb-6">
            <label class="form-label">Select Client</label>
            <div class="relative">
              <select v-model="formData.clientId" class="input-field" required>
                <option value="" disabled>Choose a client...</option>
                <option value="null">No Client / Generic Brief</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
              <div v-if="isLoadingClients" class="absolute right-10 top-1/2 transform -translate-y-1/2">
                <svg class="animate-spin h-5 w-5 text-citebots-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <p v-if="selectedClient" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ selectedClient.domain }} • {{ selectedClient.industry_primary || 'Industry not specified' }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title / Working Title -->
            <div>
              <label class="form-label">Title / Working Title</label>
              <input
                v-model="formData.title"
                type="text"
                class="input-field"
                placeholder="e.g. Complete Guide to SEO for SaaS Companies"
                required
              />
            </div>

            <!-- Keywords -->
            <div>
              <label class="form-label">Keywords (comma separated)</label>
              <div class="relative">
                <input
                  v-model="keywordsInput"
                  type="text"
                  class="input-field pr-10"
                  placeholder="e.g. saas seo, seo for software companies"
                  @keydown.enter.prevent="addKeyword"
                  @blur="addKeyword"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-citebots-orange hover:text-citebots-orange-dark"
                  @click="addKeyword"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Keywords Tags Display -->
              <div v-if="formData.keywords.length > 0" class="flex flex-wrap gap-2 mt-2">
                <div
                  v-for="(keyword, index) in formData.keywords"
                  :key="index"
                  class="bg-citebots-orange/10 text-citebots-orange px-2 py-1 rounded-md flex items-center text-sm"
                >
                  <span>{{ keyword }}</span>
                  <button
                    type="button"
                    class="ml-1 text-citebots-orange hover:text-citebots-orange-dark"
                    @click="removeKeyword(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="keywordError" class="mt-1 text-sm text-red-600">{{ keywordError }}</p>
              <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">Add 1-5 keywords for your content brief</p>
            </div>
          </div>

          <!-- Purpose & Audience -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purpose & Audience</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Purpose Selection -->
              <div>
                <label class="form-label mb-3">Content Purpose</label>
                <div class="space-y-3">
                  <div
                    v-for="purpose in purposes"
                    :key="purpose.value"
                    class="border rounded-lg p-3 cursor-pointer transition-all duration-150"
                    :class="{
                      'border-gray-200 dark:border-gray-700 hover:border-citebots-orange/50 dark:hover:border-citebots-orange/50': formData.purpose !== purpose.value,
                      'border-citebots-orange bg-citebots-orange/5 dark:bg-citebots-orange/10': formData.purpose === purpose.value
                    }"
                    @click="formData.purpose = purpose.value"
                  >
                    <div class="flex items-center">
                      <div class="h-4 w-4 rounded-full border mr-3 flex items-center justify-center"
                        :class="{
                          'border-gray-400 dark:border-gray-500': formData.purpose !== purpose.value,
                          'border-citebots-orange': formData.purpose === purpose.value
                        }"
                      >
                        <div v-if="formData.purpose === purpose.value" class="h-2 w-2 rounded-full bg-citebots-orange"></div>
                      </div>
                      <span class="font-medium">{{ purpose.label }}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">{{ purpose.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Audience Selection -->
              <div>
                <label class="form-label mb-3">Target Audience</label>
                <div class="space-y-3">
                  <div
                    v-for="audience in audiences"
                    :key="audience.value"
                    class="border rounded-lg p-3 cursor-pointer transition-all duration-150"
                    :class="{
                      'border-gray-200 dark:border-gray-700 hover:border-citebots-orange/50 dark:hover:border-citebots-orange/50': formData.audience !== audience.value,
                      'border-citebots-orange bg-citebots-orange/5 dark:bg-citebots-orange/10': formData.audience === audience.value
                    }"
                    @click="formData.audience = audience.value"
                  >
                    <div class="flex items-center">
                      <div class="h-4 w-4 rounded-full border mr-3 flex items-center justify-center"
                        :class="{
                          'border-gray-400 dark:border-gray-500': formData.audience !== audience.value,
                          'border-citebots-orange': formData.audience === audience.value
                        }"
                      >
                        <div v-if="formData.audience === audience.value" class="h-2 w-2 rounded-full bg-citebots-orange"></div>
                      </div>
                      <span class="font-medium">{{ audience.label }}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">{{ audience.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Options -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Options</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Style Guide -->
              <div>
                <label class="form-label">Style Guide</label>
                <textarea
                  v-model="formData.styleGuide"
                  class="input-field min-h-[100px]"
                  placeholder="Optional: Brand voice, tone, formatting preferences, etc."
                ></textarea>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span :class="{ 'text-yellow-600': formData.styleGuide.length > 400 }">{{ formData.styleGuide.length }}</span>/500 characters
                </p>
              </div>

              <!-- Custom Instructions -->
              <div>
                <label class="form-label">Custom Instructions</label>
                <textarea
                  v-model="formData.customInstructions"
                  class="input-field min-h-[100px]"
                  placeholder="Optional: Any specific requirements or additional context that should be included..."
                ></textarea>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span :class="{ 'text-yellow-600': formData.customInstructions.length > 400 }">{{ formData.customInstructions.length }}</span>/500 characters
                </p>
              </div>
            </div>
          </div>


          <!-- Generate Button -->
          <div class="pt-4 flex justify-center">
            <button
              type="submit"
              class="btn-primary w-full md:w-1/2 flex items-center justify-center text-lg py-4"
              :disabled="isGenerating || !isFormValid"
              :class="{ 'opacity-70 cursor-not-allowed': isGenerating || !isFormValid }"
            >
              <svg v-if="isGenerating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isGenerating ? 'Generating Brief...' : 'Generate Content Brief' }}
            </button>
          </div>

          <!-- Processing Alert -->
          <div v-if="isGenerating" class="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 flex-1 md:flex md:justify-between">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  Content brief generation can take 2-3 minutes. Please don't close this page.
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="generatedBriefId" class="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 flex-1 md:flex md:justify-between">
                <p class="text-sm text-green-700 dark:text-green-300">
                  Brief generated successfully! View it using one of these options:
                </p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <NuxtLink 
                :to="`/dashboard/actions/content-brief/view/${generatedBriefId}`"
                class="btn-secondary-sm"
              >
                Standard View
              </NuxtLink>
              <NuxtLink 
                :to="`/brief-test/${generatedBriefId}`"
                class="btn-secondary-sm"
              >
                Simple View
              </NuxtLink>
              <NuxtLink 
                :to="`/dashboard/actions/content-brief/view/${generatedBriefId}`"
                class="btn-primary-sm"
              >
                Direct View
              </NuxtLink>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBriefGenerator } from '~/composables/useBriefGenerator'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const router = useRouter()
const supabase = useSupabaseClient()

// Form data
const formData = ref({
  clientId: '',
  title: '',
  keywords: [],
  purpose: 'inform',
  audience: 'intermediate',
  styleGuide: '',
  customInstructions: ''
})

// Clients data
const clients = ref([])
const isLoadingClients = ref(true)
const selectedClient = computed(() => {
  return clients.value.find(client => client.id === formData.value.clientId) || null
})

// Most recent brief ID
const directBriefId = ref(null)
const generatedBriefId = ref(null)

// Keywords handling
const keywordsInput = ref('')
const keywordError = ref('')

const addKeyword = () => {
  if (!keywordsInput.value.trim()) return

  // Split by commas and process each keyword
  const newKeywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k)

  // Add new keywords if they don't already exist
  for (const keyword of newKeywords) {
    if (!formData.value.keywords.includes(keyword)) {
      if (formData.value.keywords.length >= 5) {
        keywordError.value = 'Maximum 5 keywords allowed'
        return
      }
      formData.value.keywords.push(keyword)
    }
  }

  keywordsInput.value = ''
  keywordError.value = ''
}

const removeKeyword = (index) => {
  formData.value.keywords.splice(index, 1)
  keywordError.value = ''
}

// Validation
const isFormValid = computed(() => {
  return (formData.value.clientId || formData.value.clientId === 'null') &&
         formData.value.title &&
         formData.value.keywords.length > 0 &&
         formData.value.purpose &&
         formData.value.audience
})

// Form submission
const isGenerating = ref(false)
const errorMessage = ref('')

const { generateBrief, error: briefError } = useBriefGenerator()

const submitForm = async () => {
  if (!isFormValid.value) return

  errorMessage.value = ''
  isGenerating.value = true
  generatedBriefId.value = null

  try {
    // Prepare the brief data
    const briefData = {
      title: formData.value.title,
      clientId: formData.value.clientId === 'null' ? null : formData.value.clientId,
      keywords: formData.value.keywords,
      purpose: formData.value.purpose,
      audience: formData.value.audience,
      styleGuide: formData.value.styleGuide,
      customInstructions: formData.value.customInstructions,
      researchDepth: 'comprehensive', // Always use comprehensive research
      platforms: {
        chatGpt: true,
        perplexity: true,
        google: true
      }
    }

    // Call the composable method to generate the brief
    const briefId = await generateBrief(briefData)

    if (briefError.value) {
      throw new Error(briefError.value)
    }

    // Store the ID for reference
    generatedBriefId.value = briefId
    directBriefId.value = briefId
  } catch (error) {
    console.error('Error generating brief:', error)
    errorMessage.value = error.message || 'An error occurred while generating the brief. Please try again.'
  } finally {
    isGenerating.value = false
  }
}

// Data for selectable options
const purposes = [
  {
    value: 'inform',
    label: 'Inform & Educate',
    description: 'Content focused on teaching the audience about a topic'
  },
  {
    value: 'convert',
    label: 'Drive Conversions',
    description: 'Content designed to encourage specific actions or purchases'
  },
  {
    value: 'awareness',
    label: 'Brand Awareness',
    description: 'Content that increases visibility and recognition'
  },
  {
    value: 'authority',
    label: 'Establish Authority',
    description: 'Content that demonstrates expertise in your field'
  },
  {
    value: 'seo',
    label: 'SEO / Ranking',
    description: 'Content optimized specifically for search engines'
  }
]

const audiences = [
  {
    value: 'beginners',
    label: 'Beginners / Novices',
    description: 'New to the topic, requires clear explanations of basics'
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Familiar with basics but needs deeper insights'
  },
  {
    value: 'advanced',
    label: 'Advanced / Technical',
    description: 'Highly knowledgeable audience seeking expert content'
  },
  {
    value: 'decision-makers',
    label: 'Decision Makers',
    description: 'Business leaders focused on ROI and strategic value'
  }
]

// Get latest brief ID for direct linking
const getLatestBriefId = async () => {
  try {
    const { data, error } = await supabase
      .from('content_briefs')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    if (data) {
      directBriefId.value = data.id;
    }
  } catch (err) {
    console.error('Error fetching latest brief:', err);
  }
};

// Load clients on mount
onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, domain, industry_primary')

    if (error) throw error

    clients.value = data || []
  } catch (error) {
    console.error('Error loading clients:', error)
    // Add some demo clients for testing
    clients.value = [
      { id: 'demo-1', name: 'Demo Client', domain: 'example.com', industry_primary: 'Technology' },
      { id: 'demo-2', name: 'Acme Corporation', domain: 'acme.com', industry_primary: 'Manufacturing' },
      { id: 'demo-3', name: 'Globex Industries', domain: 'globex.com', industry_primary: 'Finance' }
    ]
  } finally {
    isLoadingClients.value = false
  }
  
  // Get latest brief ID for direct link
  await getLatestBriefId();
})
</script>