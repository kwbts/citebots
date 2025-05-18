<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Edit Client</h1>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading client data...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4 mb-6">
      <p class="text-red-700">Error: {{ error }}</p>
    </div>
    
    <!-- Edit Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Brand Information -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Brand Information</h2>
        
        <div class="space-y-4">
          <div>
            <label for="brandName" class="block text-sm font-medium text-gray-700 mb-1">
              Brand Name
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="domain" class="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Competitors -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Competitors</h2>
        
        <div class="space-y-4">
          <div v-for="(competitor, index) in form.competitors" :key="competitor.id || competitor.tempId"
               class="flex gap-3">
            <div class="flex-1 relative">
              <input
                v-model="competitor.name"
                type="text"
                :class="competitor.source === 'ai' ? 'pr-8 border-purple-300' : ''"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Competitor name"
              />
              <span v-if="competitor.source === 'ai'" class="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600" title="Added by AI">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7h4v2H8V7zm0 4h4v2H8v-2z"/>
                </svg>
              </span>
            </div>
            <div class="flex-1 relative">
              <input
                v-model="competitor.domain"
                type="text"
                :class="competitor.source === 'ai' ? 'pr-8 border-purple-300' : ''"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Competitor domain"
              />
              <span v-if="competitor.source === 'ai'" class="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600" title="Added by AI">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7h4v2H8V7zm0 4h4v2H8v-2z"/>
                </svg>
              </span>
            </div>
            <button
              type="button"
              @click="removeCompetitor(index)"
              class="p-2 text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            @click="addCompetitor"
            class="mt-2 w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Competitor
          </button>
        </div>
      </div>

      <!-- AI Enhanced Fields -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">AI-Enhanced Information</h2>
          <div class="flex gap-2">
            <button
              type="button"
              @click="clearDataExceptBrandAndDomain"
              class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Clear Data
            </button>
            <button
              type="button"
              @click="enhanceWithAI"
              :disabled="isEnhancing"
              class="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 text-sm flex items-center gap-2"
            >
              <svg v-if="isEnhancing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEnhancing ? 'Refreshing...' : 'Refresh AI Data' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Industry Classification -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Primary Industry
              <span class="ml-1 text-xs text-purple-600">(AI)</span>
            </label>
            <input
              v-model="form.industryPrimary"
              type="text"
              class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Secondary Industry
              <span class="ml-1 text-xs text-purple-600">(AI)</span>
            </label>
            <input
              v-model="form.industrySecondary"
              type="text"
              class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sub-Industry
              <span class="ml-1 text-xs text-purple-600">(AI)</span>
            </label>
            <input
              v-model="form.subIndustry"
              type="text"
              class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Business Model
              <span class="ml-1 text-xs text-purple-600">(AI)</span>
            </label>
            <input
              v-model="form.businessModel"
              type="text"
              class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Geographic Focus
              <span class="ml-1 text-xs text-purple-600">(AI)</span>
            </label>
            <input
              v-model="form.geographicFocus"
              type="text"
              class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Text Areas for more complex data -->
        <div class="mt-4 space-y-4">
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
        </div>

        <div v-if="form.aiEnhancedAt" class="mt-4 text-sm text-gray-500">
          Last enhanced: {{ new Date(form.aiEnhancedAt).toLocaleString() }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          type="button"
          @click="navigateTo(`/dashboard/clients/${clientId}`)"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
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
  middleware: 'auth',
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
          domain
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
    domain: '' 
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
      if (result.competitors && result.competitors.length > 0) {
        for (const aiCompetitor of result.competitors) {
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
    console.error('Full error object:', err)
    if (err.response) {
      console.error('Response data:', err.response)
    }
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