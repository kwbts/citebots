<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title text-gray-900 dark:text-white">Add New Client</h1>
      <p class="page-subtitle text-gray-600 dark:text-gray-300 mb-6">Provision a new client profile and enhance it with AI</p>
    </div>

    <!-- Top Actions -->
    <div class="flex justify-end items-center mb-6">
      <div class="flex gap-2">
        <button
          type="button"
          @click="enhanceWithAI"
          :disabled="!form.brandName || !form.domain || isEnhancing"
          class="btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg v-if="isEnhancing" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isEnhancing ? 'Enhancing with AI...' : 'Enhance with AI' }}</span>
          <span class="text-sm ml-1">✨</span>
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting || !form.brandName || !form.domain"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Saving Client...' : 'Save Client' }}
        </button>
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit" @keydown.enter.prevent class="space-y-8">
      <!-- Brand Information & Competitors Group -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Brand Information</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Enter your brand's basic information to get started.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        <!-- Competitors Section -->
        <div class="border-t dark:border-gray-600 pt-6">
          <div class="mb-4">
            <h3 class="font-medium text-gray-900 dark:text-white mb-1">Competitors</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Add known competitors to help with analysis.</p>
          </div>

          <div class="space-y-4">
            <div v-if="form.competitors.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <p class="text-sm">No competitors added yet</p>
            </div>

            <div v-for="(competitor, index) in form.competitors" :key="index" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Competitor
            </button>
          </div>
        </div>
      </div>

      <!-- Industry Information -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Industry Information</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Help us understand your industry context and business model.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="form-label">
              Primary Industry
              <span v-if="form.industryPrimary && aiFields.includes('industryPrimary')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.industryPrimary"
              type="text"
              :class="aiFields.includes('industryPrimary') ? 'border-purple-300 dark:border-purple-600' : ''"
              class="input-field"
              placeholder="e.g., Technology, Healthcare"
            />
          </div>
          
          <div>
            <label class="form-label">
              Business Model
              <span v-if="form.businessModel && aiFields.includes('businessModel')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.businessModel"
              type="text"
              :class="aiFields.includes('businessModel') ? 'border-purple-300 dark:border-purple-600' : ''"
              class="input-field"
              placeholder="e.g., B2B SaaS, B2C E-commerce"
            />
          </div>

          <div>
            <label class="form-label">
              Secondary Industry
              <span v-if="form.industrySecondary && aiFields.includes('industrySecondary')" class="ml-1 text-xs text-purple-600">✨ AI</span>
            </label>
            <input
              v-model="form.industrySecondary"
              type="text"
              :class="aiFields.includes('industrySecondary') ? 'border-purple-300 dark:border-purple-600' : ''"
              class="input-field"
              placeholder="e.g., Marketing, Finance"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <label class="form-label">
            Sub-Industry / Specialization
            <span v-if="form.subIndustry && aiFields.includes('subIndustry')" class="ml-1 text-xs text-purple-600">✨ AI</span>
          </label>
          <input
            v-model="form.subIndustry"
            type="text"
            :class="aiFields.includes('subIndustry') ? 'border-purple-300 dark:border-purple-600' : ''"
            class="input-field"
            placeholder="e.g., Email Marketing Automation, Cloud Security"
          />
        </div>
      </div>

      <!-- Target Market & Products -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Target Market & Products</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Define your target audience and key offerings.</p>
        </div>

        <div class="space-y-6">
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

      <!-- Business Context -->
      <div class="card">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Business Context</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Provide context about your business operations and market.</p>
        </div>

        <div class="space-y-6">
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

      <!-- Bottom Actions -->
      <div class="flex justify-end items-center">
        <div class="flex gap-2">
          <button
            type="button"
            @click="enhanceWithAI"
            :disabled="!form.brandName || !form.domain || isEnhancing"
            class="btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg v-if="isEnhancing" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isEnhancing ? 'Enhancing with AI...' : 'Enhance with AI' }}</span>
            <span class="text-sm ml-1">✨</span>
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !form.brandName || !form.domain"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Saving Client...' : 'Save Client' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { navigateTo } from '#app'
// Using built-in Supabase composable
import { useAIEnhancement } from '~/composables/useAIEnhancement'
import TagInput from '~/components/TagInput.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
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
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    // Create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: form.value.brandName,
        domain: form.value.domain,
        created_by: user?.id, // Explicitly set the created_by field
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