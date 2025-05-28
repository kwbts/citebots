<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title text-gray-900 dark:text-white">Edit Client</h1>
          <p class="page-subtitle text-gray-600 dark:text-gray-300">
            Update client information and enhance with AI
          </p>
        </div>
        <NuxtLink 
          :to="`/dashboard/clients/${clientId}`"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Client
        </NuxtLink>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="card">
      <div class="animate-pulse space-y-6">
        <div class="space-y-4">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div class="space-y-3">
            <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div class="space-y-3">
            <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="card text-center py-12">
      <svg class="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Client</h3>
      <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <button @click="() => window.location.reload()" class="btn-primary">
        Reload Page
      </button>
    </div>
    
    <!-- Edit Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Brand Information -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Brand Information</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Basic information about the client's brand</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="brandName" class="form-label">
              Brand Name <span class="text-red-500">*</span>
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              required
              class="input-field"
              placeholder="e.g., Knak"
            />
          </div>
          
          <div class="space-y-2">
            <label for="domain" class="form-label">
              Domain <span class="text-red-500">*</span>
            </label>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              required
              class="input-field"
              placeholder="e.g., knak.com"
            />
          </div>
        </div>
      </div>

      <!-- Competitors Section -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Competitors</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Known competitors for analysis and comparison</p>
        </div>
        
        <div class="space-y-4">
          <div v-if="form.competitors.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <p class="text-sm">No competitors added yet</p>
          </div>
          
          <div v-for="(competitor, index) in form.competitors" :key="competitor.id || competitor.tempId"
               class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div class="space-y-2">
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">Company Name</label>
              <div class="relative">
                <input
                  v-model="competitor.name"
                  type="text"
                  :class="competitor.source === 'ai' ? 'pr-8 border-purple-300 dark:border-purple-600' : ''"
                  class="input-field"
                  placeholder="e.g., Acme Corp"
                />
                <span v-if="competitor.source === 'ai'" class="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600" title="Added by AI">
                  <span class="text-sm">✨</span>
                </span>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">Domain</label>
              <div class="relative">
                <input
                  v-model="competitor.domain"
                  type="text"
                  :class="competitor.source === 'ai' ? 'pr-8 border-purple-300 dark:border-purple-600' : ''"
                  class="input-field"
                  placeholder="e.g., acme.com"
                />
                <span v-if="competitor.source === 'ai'" class="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600" title="Added by AI">
                  <span class="text-sm">✨</span>
                </span>
              </div>
            </div>
            
            <div class="md:col-span-2 flex justify-end">
              <button
                type="button"
                @click="removeCompetitor(index)"
                class="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
          
          <button
            type="button"
            @click="addCompetitor"
            class="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors group"
          >
            <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Competitor
          </button>
        </div>
      </div>

      <!-- AI Enhanced Information -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI-Enhanced Information</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Detailed client information generated and enhanced by AI</p>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="clearDataExceptBrandAndDomain"
              class="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Clear Data
            </button>
            <button
              type="button"
              @click="enhanceWithAI"
              :disabled="isEnhancing || !form.brandName || !form.domain"
              class="btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg v-if="isEnhancing" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isEnhancing ? 'Refreshing...' : 'Refresh AI Data' }}</span>
              <span class="text-sm ml-1">✨</span>
            </button>
          </div>
        </div>

        <!-- Industry Classification -->
        <div class="mb-8">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">Industry Classification</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="form-label">
                Primary Industry
                <span class="ml-1 text-xs text-purple-600">✨ AI</span>
              </label>
              <input
                v-model="form.industryPrimary"
                type="text"
                class="input-field border-purple-300 dark:border-purple-600"
                placeholder="e.g., Technology"
              />
            </div>

            <div class="space-y-2">
              <label class="form-label">
                Business Model
                <span class="ml-1 text-xs text-purple-600">✨ AI</span>
              </label>
              <input
                v-model="form.businessModel"
                type="text"
                class="input-field border-purple-300 dark:border-purple-600"
                placeholder="e.g., B2B SaaS"
              />
            </div>

            <div class="space-y-2">
              <label class="form-label">
                Secondary Industry
                <span class="ml-1 text-xs text-purple-600">✨ AI</span>
              </label>
              <input
                v-model="form.industrySecondary"
                type="text"
                class="input-field border-purple-300 dark:border-purple-600"
                placeholder="e.g., Marketing"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="space-y-2">
              <label class="form-label">
                Sub-Industry / Specialization
                <span class="ml-1 text-xs text-purple-600">✨ AI</span>
              </label>
              <input
                v-model="form.subIndustry"
                type="text"
                class="input-field border-purple-300 dark:border-purple-600"
                placeholder="e.g., Email Marketing Automation"
              />
            </div>

            <div class="space-y-2">
              <label class="form-label">
                Geographic Focus
                <span class="ml-1 text-xs text-purple-600">✨ AI</span>
              </label>
              <input
                v-model="form.geographicFocus"
                type="text"
                class="input-field border-purple-300 dark:border-purple-600"
                placeholder="e.g., North America, Global"
              />
            </div>
          </div>
        </div>

        <!-- Enhanced Data Fields -->
        <div class="space-y-6">
          <TagInput
            v-model="form.targetAudience"
            v-model:source="form.targetAudienceSource"
            label="Target Audience"
            placeholder="Add audience segment"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.keyProducts"
            v-model:source="form.keyProductsSource"
            label="Key Products/Services"
            placeholder="Add product or service"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.uniqueSellingProps"
            v-model:source="form.uniqueSellingPropsSource"
            label="Unique Selling Propositions"
            placeholder="Add USP"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.brandVoice"
            v-model:source="form.brandVoiceSource"
            label="Brand Voice/Tone"
            placeholder="Add voice descriptor"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.customerProblems"
            v-model:source="form.customerProblemsSource"
            label="Customer Problems Solved"
            placeholder="Add problem"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.useCases"
            v-model:source="form.useCasesSource"
            label="Common Use Cases"
            placeholder="Add use case"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.industryTerminology"
            v-model:source="form.industryTerminologySource"
            label="Industry Terminology"
            placeholder="Add term"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.regulatoryConsiderations"
            v-model:source="form.regulatoryConsiderationsSource"
            label="Regulatory Considerations"
            placeholder="Add regulation"
            :isAI="hasAIData"
          />

          <TagInput
            v-model="form.geographicRegions"
            v-model:source="form.geographicRegionsSource"
            label="Geographic Regions"
            placeholder="Add region"
            :isAI="hasAIData"
          />
        </div>

        <div v-if="form.aiEnhancedAt" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-center text-sm text-blue-700 dark:text-blue-300">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Last enhanced: {{ formatDate(form.aiEnhancedAt) }} 
            <span v-if="form.aiEnhancementCount > 0" class="ml-2">({{ form.aiEnhancementCount }} times)</span>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <NuxtLink
          :to="`/dashboard/clients/${clientId}`"
          class="btn-secondary order-2 sm:order-1"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting || !form.brandName || !form.domain"
          class="btn-primary order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#app'
// Using built-in Supabase composable
import { useAIEnhancement } from '~/composables/useAIEnhancement'
import TagInput from '~/components/TagInput.vue'

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard'
})

const route = useRoute()
const supabase = useSupabaseClient()

// Get client ID from route params
const clientId = route.params.id

const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref(null)

const form = ref({
  brandName: '',
  domain: '',
  competitors: [],
  // Single value AI fields
  industryPrimary: '',
  industrySecondary: '',
  subIndustry: '',
  businessModel: '',
  geographicFocus: '',
  // Array AI fields with sources
  targetAudience: [],
  targetAudienceSource: [],
  keyProducts: [],
  keyProductsSource: [],
  uniqueSellingProps: [],
  uniqueSellingPropsSource: [],
  brandVoice: [],
  brandVoiceSource: [],
  customerProblems: [],
  customerProblemsSource: [],
  useCases: [],
  useCasesSource: [],
  industryTerminology: [],
  industryTerminologySource: [],
  regulatoryConsiderations: [],
  regulatoryConsiderationsSource: [],
  geographicRegions: [],
  geographicRegionsSource: [],
  aiEnhancedAt: null,
  aiEnhancementCount: 0
})

const { enhanceClientWithAI } = useAIEnhancement()
const isEnhancing = ref(false)
const hasAIData = ref(false)

const originalCompetitors = ref([])

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// Load client data
onMounted(async () => {
  if (!clientId) {
    error.value = 'No client ID provided'
    isLoading.value = false
    return
  }
  
  try {
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select(`
        *,
        competitors (
          id,
          name,
          domain,
          source
        )
      `)
      .eq('id', clientId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Populate form
    form.value.brandName = data.name
    form.value.domain = data.domain
    form.value.competitors = (data.competitors || []).map(c => ({
      ...c,
      source: c.source || 'manual'
    }))

    // Populate all fields
    form.value.industryPrimary = data.industry_primary || ''
    form.value.industrySecondary = data.industry_secondary || ''
    form.value.subIndustry = data.sub_industry || ''
    form.value.businessModel = data.business_model || ''
    form.value.geographicFocus = data.geographic_focus || ''

    // Populate array fields
    form.value.targetAudience = data.target_audience || []
    form.value.keyProducts = data.key_products || []
    form.value.uniqueSellingProps = data.unique_selling_props || []
    form.value.brandVoice = data.brand_voice || []
    form.value.customerProblems = data.customer_problems || []
    form.value.useCases = data.use_cases || []
    form.value.industryTerminology = data.industry_terminology || []
    form.value.regulatoryConsiderations = data.regulatory_considerations || []
    form.value.geographicRegions = data.geographic_regions || []

    // Set source arrays (assume all existing data is from ai if aiEnhancedAt exists)
    const source = data.ai_enhanced_at ? 'ai' : 'manual'
    form.value.targetAudienceSource = form.value.targetAudience.map(() => source)
    form.value.keyProductsSource = form.value.keyProducts.map(() => source)
    form.value.uniqueSellingPropsSource = form.value.uniqueSellingProps.map(() => source)
    form.value.brandVoiceSource = form.value.brandVoice.map(() => source)
    form.value.customerProblemsSource = form.value.customerProblems.map(() => source)
    form.value.useCasesSource = form.value.useCases.map(() => source)
    form.value.industryTerminologySource = form.value.industryTerminology.map(() => source)
    form.value.regulatoryConsiderationsSource = form.value.regulatoryConsiderations.map(() => source)
    form.value.geographicRegionsSource = form.value.geographicRegions.map(() => source)

    form.value.aiEnhancedAt = data.ai_enhanced_at
    form.value.aiEnhancementCount = data.ai_enhancement_count || 0
    hasAIData.value = !!data.ai_enhanced_at

    // Store original for comparison
    originalCompetitors.value = JSON.parse(JSON.stringify(data.competitors || []))
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

// Add competitor
const addCompetitor = () => {
  form.value.competitors.push({ 
    tempId: Date.now(),
    name: '', 
    domain: '',
    source: 'manual'
  })
}

// Remove competitor
const removeCompetitor = (index) => {
  form.value.competitors.splice(index, 1)
}

// Handle form submission
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  error.value = null
  
  try {
    // Update client basic info and AI fields
    const updateData = {
      name: form.value.brandName,
      domain: form.value.domain
    }

    // Add all fields (including empty ones)
    updateData.industry_primary = form.value.industryPrimary
    updateData.industry_secondary = form.value.industrySecondary
    updateData.sub_industry = form.value.subIndustry
    updateData.business_model = form.value.businessModel
    updateData.target_audience = form.value.targetAudience
    updateData.key_products = form.value.keyProducts
    updateData.unique_selling_props = form.value.uniqueSellingProps
    updateData.geographic_focus = form.value.geographicFocus
    updateData.brand_voice = form.value.brandVoice
    updateData.customer_problems = form.value.customerProblems
    updateData.use_cases = form.value.useCases
    updateData.industry_terminology = form.value.industryTerminology
    updateData.regulatory_considerations = form.value.regulatoryConsiderations
    updateData.geographic_regions = form.value.geographicRegions

    const { error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
    
    if (updateError) throw updateError
    
    // Process competitors
    const currentCompetitors = form.value.competitors.filter(c => c.name && c.domain)
    const originalIds = originalCompetitors.value.map(c => c.id)
    const currentIds = currentCompetitors.filter(c => c.id).map(c => c.id)
    
    // Identify changes
    const toAdd = currentCompetitors.filter(c => !c.id)
    const toUpdate = currentCompetitors.filter(c => c.id)
    const toDelete = originalCompetitors.value.filter(c => !currentIds.includes(c.id))
    
    // Add new competitors
    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('competitors')
        .insert(toAdd.map(competitor => ({
          client_id: clientId,
          name: competitor.name,
          domain: competitor.domain,
          source: competitor.source || 'manual'
        })))
      
      if (addError) throw addError
    }
    
    // Update existing competitors
    for (const competitor of toUpdate) {
      const { error: updateError } = await supabase
        .from('competitors')
        .update({
          name: competitor.name,
          domain: competitor.domain
        })
        .eq('id', competitor.id)
      
      if (updateError) throw updateError
    }
    
    // Delete removed competitors
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('competitors')
        .delete()
        .in('id', toDelete.map(c => c.id))
      
      if (deleteError) throw deleteError
    }
    
    // Navigate back to client detail
    navigateTo(`/dashboard/clients/${clientId}`)
  } catch (err) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

// Enhance with AI
const enhanceWithAI = async () => {
  if (isEnhancing.value) return

  isEnhancing.value = true
  error.value = null

  try {
    const result = await enhanceClientWithAI(
      clientId,
      form.value.brandName,
      form.value.domain
    )

    if (result.success) {
      // Update form with AI data
      hasAIData.value = true
      const data = result.data

      // Update single value fields
      form.value.industryPrimary = data.industry_primary || form.value.industryPrimary
      form.value.industrySecondary = data.industry_secondary || form.value.industrySecondary
      form.value.subIndustry = data.sub_industry || form.value.subIndustry
      form.value.businessModel = data.business_model || form.value.businessModel
      form.value.geographicFocus = data.geographic_focus || form.value.geographicFocus

      // Merge array fields (don't replace, add to existing)
      if (data.target_audience?.length) {
        form.value.targetAudience = [...form.value.targetAudience, ...data.target_audience]
        form.value.targetAudienceSource = [...form.value.targetAudienceSource, ...data.target_audience.map(() => 'ai')]
      }
      if (data.key_products?.length) {
        form.value.keyProducts = [...form.value.keyProducts, ...data.key_products]
        form.value.keyProductsSource = [...form.value.keyProductsSource, ...data.key_products.map(() => 'ai')]
      }
      if (data.unique_selling_props?.length) {
        form.value.uniqueSellingProps = [...form.value.uniqueSellingProps, ...data.unique_selling_props]
        form.value.uniqueSellingPropsSource = [...form.value.uniqueSellingPropsSource, ...data.unique_selling_props.map(() => 'ai')]
      }
      if (data.brand_voice?.length) {
        form.value.brandVoice = [...form.value.brandVoice, ...data.brand_voice]
        form.value.brandVoiceSource = [...form.value.brandVoiceSource, ...data.brand_voice.map(() => 'ai')]
      }
      if (data.customer_problems?.length) {
        form.value.customerProblems = [...form.value.customerProblems, ...data.customer_problems]
        form.value.customerProblemsSource = [...form.value.customerProblemsSource, ...data.customer_problems.map(() => 'ai')]
      }
      if (data.use_cases?.length) {
        form.value.useCases = [...form.value.useCases, ...data.use_cases]
        form.value.useCasesSource = [...form.value.useCasesSource, ...data.use_cases.map(() => 'ai')]
      }
      if (data.industry_terminology?.length) {
        form.value.industryTerminology = [...form.value.industryTerminology, ...data.industry_terminology]
        form.value.industryTerminologySource = [...form.value.industryTerminologySource, ...data.industry_terminology.map(() => 'ai')]
      }
      if (data.regulatory_considerations?.length) {
        form.value.regulatoryConsiderations = [...form.value.regulatoryConsiderations, ...data.regulatory_considerations]
        form.value.regulatoryConsiderationsSource = [...form.value.regulatoryConsiderationsSource, ...data.regulatory_considerations.map(() => 'ai')]
      }
      if (data.geographic_regions?.length) {
        form.value.geographicRegions = [...form.value.geographicRegions, ...data.geographic_regions]
        form.value.geographicRegionsSource = [...form.value.geographicRegionsSource, ...data.geographic_regions.map(() => 'ai')]
      }

      form.value.aiEnhancedAt = data.ai_enhanced_at
      form.value.aiEnhancementCount = (form.value.aiEnhancementCount || 0) + 1

      // Add AI competitors if they don't exist
      if (result.competitors?.competitors?.length > 0) {
        for (const aiCompetitor of result.competitors.competitors) {
          const exists = form.value.competitors.some(c =>
            c.domain === aiCompetitor.domain
          )
          if (!exists) {
            form.value.competitors.push({
              ...aiCompetitor,
              tempId: Date.now() + Math.random(),
              source: 'ai'
            })
          }
        }
      }
    } else {
      throw new Error(result.error || 'Enhancement failed')
    }
  } catch (err) {
    console.error('Error enhancing client:', err)
    error.value = err.message || 'Failed to enhance client with AI'
  } finally {
    isEnhancing.value = false
  }
}

// Clear all data except brand name and domain
const clearDataExceptBrandAndDomain = () => {
  if (confirm('This will clear all data except Brand Name and Domain. Are you sure?')) {
    // Store brand name and domain
    const brandName = form.value.brandName
    const domain = form.value.domain

    // Clear all form data
    form.value = {
      ...form.value,
      // Preserve brand and domain
      brandName,
      domain,

      // Clear all other fields
      industryPrimary: '',
      industrySecondary: '',
      subIndustry: '',
      businessModel: '',
      geographicFocus: '',
      competitors: [],

      // Clear all array fields
      targetAudience: [],
      targetAudienceSource: [],
      keyProducts: [],
      keyProductsSource: [],
      uniqueSellingProps: [],
      uniqueSellingPropsSource: [],
      brandVoice: [],
      brandVoiceSource: [],
      customerProblems: [],
      customerProblemsSource: [],
      useCases: [],
      useCasesSource: [],
      industryTerminology: [],
      industryTerminologySource: [],
      regulatoryConsiderations: [],
      regulatoryConsiderationsSource: [],
      geographicRegions: [],
      geographicRegionsSource: [],

      // Clear AI metadata
      aiEnhancedAt: null,
      aiEnhancementCount: 0
    }

    hasAIData.value = false
  }
}
</script>