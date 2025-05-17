<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Provision New Client</h1>
      <button
        type="button"
        @click="enhanceWithAI"
        :disabled="!form.brandName || !form.domain || isEnhancing"
        class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
      >
        <svg v-if="isEnhancing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isEnhancing ? 'Enhancing...' : 'Enhance with AI' }}</span>
        <span class="text-sm">✨</span>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Brand Information -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Brand Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="brandName" class="block text-sm font-medium text-gray-700 mb-1">
              Brand Name <span class="text-red-500">*</span>
            </label>
            <input
              id="brandName"
              v-model="form.brandName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Knak"
            />
          </div>
          
          <div>
            <label for="domain" class="block text-sm font-medium text-gray-700 mb-1">
              Domain <span class="text-red-500">*</span>
            </label>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., knak.com"
            />
          </div>
        </div>
      </div>

      <!-- Industry Information -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Industry Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Primary Industry
              <span v-if="form.industryPrimary && aiFields.includes('industryPrimary')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.industryPrimary"
              type="text"
              :class="aiFields.includes('industryPrimary') ? 'border-purple-300' : 'border-gray-300'"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Secondary Industry
              <span v-if="form.industrySecondary && aiFields.includes('industrySecondary')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.industrySecondary"
              type="text"
              :class="aiFields.includes('industrySecondary') ? 'border-purple-300' : 'border-gray-300'"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Business Model
              <span v-if="form.businessModel && aiFields.includes('businessModel')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.businessModel"
              type="text"
              :class="aiFields.includes('businessModel') ? 'border-purple-300' : 'border-gray-300'"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="B2B, B2C, etc."
            />
          </div>
        </div>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Sub-Industry
              <span v-if="form.subIndustry && aiFields.includes('subIndustry')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.subIndustry"
              type="text"
              :class="aiFields.includes('subIndustry') ? 'border-purple-300' : 'border-gray-300'"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Geographic Focus
              <span v-if="form.geographicFocus && aiFields.includes('geographicFocus')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.geographicFocus"
              type="text"
              :class="aiFields.includes('geographicFocus') ? 'border-purple-300' : 'border-gray-300'"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Global, Regional, Local"
            />
          </div>
        </div>
      </div>

      <!-- Target Market & Products -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Target Market & Products</h2>
        
        <div class="space-y-4">
          <TagInput
            v-model="form.targetAudience"
            v-model:source="form.targetAudienceSource"
            label="Target Audience"
            placeholder="Add audience segment"
            :isAI="aiFields.includes('targetAudience')"
          />
          
          <TagInput
            v-model="form.keyProducts"
            v-model:source="form.keyProductsSource"
            label="Key Products/Services"
            placeholder="Add product or service"
            :isAI="aiFields.includes('keyProducts')"
          />
          
          <TagInput
            v-model="form.uniqueSellingProps"
            v-model:source="form.uniqueSellingPropsSource"
            label="Unique Selling Propositions"
            placeholder="Add USP"
            :isAI="aiFields.includes('uniqueSellingProps')"
          />
          
          <TagInput
            v-model="form.brandVoice"
            v-model:source="form.brandVoiceSource"
            label="Brand Voice"
            placeholder="Add voice descriptor"
            :isAI="aiFields.includes('brandVoice')"
          />
        </div>
      </div>

      <!-- Competitors -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Competitors</h2>
        
        <div class="space-y-4">
          <div v-for="(competitor, index) in form.competitors" :key="index" class="flex gap-3">
            <div class="flex-1 relative">
              <input
                v-model="competitor.name"
                type="text"
                :class="competitor.source === 'ai' ? 'pr-8 border-purple-300' : ''"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Competitor name"
              />
              <span v-if="competitor.source === 'ai'" class="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600" title="Added by AI">
                <span class="text-sm">✨</span>
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
                <span class="text-sm">✨</span>
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

      <!-- Business Context -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Business Context</h2>
        
        <div class="space-y-4">
          <TagInput
            v-model="form.customerProblems"
            v-model:source="form.customerProblemsSource"
            label="Customer Problems Solved"
            placeholder="Add problem"
            :isAI="aiFields.includes('customerProblems')"
          />
          
          <TagInput
            v-model="form.useCases"
            v-model:source="form.useCasesSource"
            label="Common Use Cases"
            placeholder="Add use case"
            :isAI="aiFields.includes('useCases')"
          />
          
          <TagInput
            v-model="form.industryTerminology"
            v-model:source="form.industryTerminologySource"
            label="Industry Terminology"
            placeholder="Add term"
            :isAI="aiFields.includes('industryTerminology')"
          />
          
          <TagInput
            v-model="form.regulatoryConsiderations"
            v-model:source="form.regulatoryConsiderationsSource"
            label="Regulatory Considerations"
            placeholder="Add regulation"
            :isAI="aiFields.includes('regulatoryConsiderations')"
          />
          
          <TagInput
            v-model="form.geographicRegions"
            v-model:source="form.geographicRegionsSource"
            label="Geographic Regions"
            placeholder="Add region"
            :isAI="aiFields.includes('geographicRegions')"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          type="button"
          @click="navigateTo('/dashboard/clients')"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Client' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useSupabase } from '~/composables/useSupabase'
import { useAIEnhancement } from '~/composables/useAIEnhancement'
import TagInput from '~/components/TagInput.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const { enhanceClientWithAI } = useAIEnhancement()

const isSubmitting = ref(false)
const isEnhancing = ref(false)
const aiFields = ref([])

const form = ref({
  // Basic fields
  brandName: '',
  domain: '',
  competitors: [],
  
  // Single-value fields
  industryPrimary: '',
  industrySecondary: '',
  subIndustry: '',
  businessModel: '',
  geographicFocus: '',
  
  // Array fields
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
  geographicRegionsSource: []
})

const addCompetitor = () => {
  form.value.competitors.push({ name: '', domain: '', source: 'manual' })
}

const removeCompetitor = (index) => {
  form.value.competitors.splice(index, 1)
}

const enhanceWithAI = async () => {
  if (!form.value.brandName || !form.value.domain || isEnhancing.value) return
  
  isEnhancing.value = true
  
  try {
    // Create temporary client just for AI enhancement
    const tempClientId = crypto.randomUUID()
    
    const result = await enhanceClientWithAI(
      tempClientId,
      form.value.brandName,
      form.value.domain
    )
    
    if (result.success) {
      const data = result.data
      
      // Update form with AI data
      form.value.industryPrimary = data.industry_primary || form.value.industryPrimary
      form.value.industrySecondary = data.industry_secondary || form.value.industrySecondary
      form.value.subIndustry = data.sub_industry || form.value.subIndustry
      form.value.businessModel = data.business_model || form.value.businessModel
      form.value.geographicFocus = data.geographic_focus || form.value.geographicFocus
      
      // Handle array fields
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
      
      // Add AI competitors
      if (result.competitors?.competitors?.length) {
        for (const aiCompetitor of result.competitors.competitors) {
          const exists = form.value.competitors.some(c =>
            c.domain === aiCompetitor.domain
          )
          if (!exists) {
            form.value.competitors.push({
              ...aiCompetitor,
              source: 'ai'
            })
          }
        }
      }
      
      // Mark which fields were AI-enhanced
      aiFields.value = [
        'industryPrimary', 'industrySecondary', 'subIndustry', 'businessModel',
        'geographicFocus', 'targetAudience', 'keyProducts', 'uniqueSellingProps',
        'brandVoice', 'customerProblems', 'useCases', 'industryTerminology',
        'regulatoryConsiderations', 'geographicRegions'
      ]
    }
  } catch (error) {
    console.error('Error enhancing with AI:', error)
    alert('Failed to enhance with AI. You can still fill in the fields manually.')
  } finally {
    isEnhancing.value = false
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // Create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: form.value.brandName,
        domain: form.value.domain,
        industry_primary: form.value.industryPrimary,
        industry_secondary: form.value.industrySecondary,
        sub_industry: form.value.subIndustry,
        business_model: form.value.businessModel,
        geographic_focus: form.value.geographicFocus,
        target_audience: form.value.targetAudience,
        key_products: form.value.keyProducts,
        unique_selling_props: form.value.uniqueSellingProps,
        brand_voice: form.value.brandVoice,
        customer_problems: form.value.customerProblems,
        use_cases: form.value.useCases,
        industry_terminology: form.value.industryTerminology,
        regulatory_considerations: form.value.regulatoryConsiderations,
        geographic_regions: form.value.geographicRegions,
        ai_enhanced_at: aiFields.value.length > 0 ? new Date().toISOString() : null,
        ai_enhancement_count: aiFields.value.length > 0 ? 1 : 0
      })
      .select()
      .single()
    
    if (clientError) throw clientError
    
    // Create competitors
    if (form.value.competitors.length > 0) {
      const competitors = form.value.competitors
        .filter(c => c.name && c.domain)
        .map(competitor => ({
          client_id: client.id,
          name: competitor.name,
          domain: competitor.domain,
          source: competitor.source || 'manual'
        }))
      
      if (competitors.length > 0) {
        const { error: competitorsError } = await supabase
          .from('competitors')
          .insert(competitors)
        
        if (competitorsError) throw competitorsError
      }
    }
    
    // Navigate to the edit page
    navigateTo(`/dashboard/clients/edit-client-${client.id}`)
  } catch (error) {
    console.error('Error creating client:', error)
    alert(`Error creating client: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>