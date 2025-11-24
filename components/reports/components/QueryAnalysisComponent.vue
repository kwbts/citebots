<!-- We'll write a fresh copy of the file and then replace it -->

<template>
  <div class="query-analysis-component bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Main Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Metrics</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Mentions & citations overview</p>
        </div>
      </div>

      <!-- Platform filter is now handled by parent component -->
      <div></div>
    </div>

    <!-- Key Metrics Section - Two Column Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Brand Mention Rate -->
      <div class="bg-white dark:bg-gray-800 border-0 rounded-xl p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">Brand Mention Rate</h4>
          <div class="relative group">
            <button
              class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
              aria-label="Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="absolute right-0 top-6 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p class="text-xs text-gray-600 dark:text-gray-300">
                Percentage of analyzed queries where your brand was mentioned by the AI system.
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ brandMentionRate }}%</div>
          
          <!-- Progress Bar -->
          <div class="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <div
              class="h-4 bg-orange-500 rounded-full transition-all duration-700"
              :style="{ width: `${brandMentionRate}%` }"
            ></div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ brandMentions }} of {{ totalQueries }} queries
          </p>
          
          <!-- Platform Breakdown -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Breakdown by Platform</h5>
            <div class="space-y-3">
              <div v-for="(item, index) in platformMentionRates" :key="index" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :class="getPlatformColor(item.platform)"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.platform }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {{ item.brandMentions }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ item.totalQueries }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ item.mentionRate }}%)</span>
                  </span>
                  <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-700"
                      :class="getPlatformColor(item.platform)"
                      :style="{ width: `${item.mentionRate}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Brand Citation Rate -->
      <div class="bg-white dark:bg-gray-800 border-0 rounded-xl p-6">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">Brand Citation Rate</h4>
          <div class="relative group">
            <button
              class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
              aria-label="Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="absolute right-0 top-6 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p class="text-xs text-gray-600 dark:text-gray-300">
                Percentage of citations in AI responses that link to your brand's website.
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ brandCitationRate }}%</div>
          
          <!-- Progress Bar -->
          <div class="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <div
              class="h-4 bg-blue-500 rounded-full transition-all duration-700"
              :style="{ width: `${brandCitationRate}%` }"
            ></div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ brandCitations }} of {{ totalCitations }} citations
          </p>
          
          <!-- Platform Breakdown -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Citation Rate by Platform</h5>
            <div class="space-y-3">
              <div v-for="(item, index) in platformCitationRates" :key="index" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :class="getPlatformColor(item.platform)"></div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.platform }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {{ item.citations }}<span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">/{{ item.totalCitations }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ item.citationRate }}%)</span>
                  </span>
                  <div class="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-2 rounded-full transition-all duration-700"
                      :class="getPlatformColor(item.platform)"
                      :style="{ width: `${item.citationRate}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Query Analysis Components can be added here -->

    <!-- Space for future components -->

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      analysis_queries: [],
      competitors: [],
      page_analyses: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  filter: {
    type: String,
    default: 'all'
  }
})

// Tab navigation
const tabs = [
  { id: 'categorization', label: 'Query Categorization' },
  { id: 'intent', label: 'Intent Analysis' },
  { id: 'response', label: 'Response Analysis' },
  { id: 'citations', label: 'Citation Patterns' },
  { id: 'competitive', label: 'Competitive Intelligence' },
  { id: 'platforms', label: 'Platform Comparison' }
]
const activeTab = ref('categorization')

// Filter options if needed
const showFilters = ref(false)
const filterOptions = [
  { value: 'all', label: 'All Queries' },
  { value: 'brand_mentioned', label: 'Brand Mentioned' },
  { value: 'competitor_mentioned', label: 'Competitor Mentioned' }
]
const selectedFilter = ref('all')

// Get queries from either queries or analysis_queries (for compatibility)
const queries = computed(() => {
  return props.data.analysis_queries || props.data.queries || []
})

// Total queries count
const totalQueries = computed(() => {
  return queries.value?.length || 0
})

// Brand mention metrics from analysis_queries (excluding implicit mentions)
const brandMentions = computed(() => {
  return queries.value?.filter(q => q.brand_mentioned === true && q.brand_mention_type !== 'implicit')?.length || 0
})

const brandMentionRate = computed(() => {
  if (!totalQueries.value) return 0
  return Math.round((brandMentions.value / totalQueries.value) * 100)
})

// Create a lookup of filtered query IDs for platform filtering
const filteredQueryIds = computed(() => {
  // Get all query IDs from the filtered queries
  const ids = new Set()
  queries.value?.forEach(query => {
    if (query.id) {
      ids.add(query.id)
    }
  })
  return ids
})

// Citation metrics from page_analyses with platform filtering
const totalCitations = computed(() => {
  // Match the approach used in TestingDashboard
  return props.data.page_analyses?.length || 0
})

const brandCitations = computed(() => {
  // Match the approach used in TestingDashboard
  return props.data.page_analyses?.filter(page => page.is_client_domain)?.length || 0
})

const brandCitationRate = computed(() => {
  if (!totalCitations.value) return 0
  return Math.round((brandCitations.value / totalCitations.value) * 100)
})

// Query Type Distribution (informational, navigational, transactional, commercial)
const queryTypeDistribution = computed(() => {
  if (!queries.value || queries.value.length === 0) return []

  const types = {}
  const total = queries.value.length

  queries.value.forEach(query => {
    const type = query.query_intent || 'unknown'
    types[type] = (types[type] || 0) + 1
  })

  return Object.entries(types).map(([type, count]) => ({
    type,
    label: formatLabel(type),
    count,
    percentage: Math.round((count / total) * 100)
  })).sort((a, b) => b.count - a.count)
})

// Platform filter
const platformFilter = computed(() => {
  return props.filter || 'all'
})

// Query statistics sections
const activeQueryChart = ref('intent')

// Brand vs Competitor metrics
const brandVsCompetitor = computed(() => {
  // Simulate calculation
  const competitorRate = 30
  const diff = brandMentionRate.value - competitorRate
  return diff > 0 ? `+${diff}%` : `${diff}%`
})

// Competitor data
const competitorData = computed(() => {
  // Simplified competitor data for UI display
  return {
    name: 'Top Competitor',
    domain: 'competitor.com',
    mentionRate: 30,
    totalMentions: Math.round(totalQueries.value * 0.3),
    queryCount: totalQueries.value,
    recommendRate: '25%',
    citationRate: '18%'
  }
})

// Competitor query types
const competitorQueryTypes = computed(() => {
  // Sample data for display
  return [
    { type: 'Informational', yourRate: 65, competitorRate: 45 },
    { type: 'Commercial', yourRate: 55, competitorRate: 60 },
    { type: 'Navigational', yourRate: 80, competitorRate: 25 },
    { type: 'Transactional', yourRate: 40, competitorRate: 50 }
  ]
})

// Competitive status
const competitiveStatus = computed(() => {
  // Sample data for display
  return [
    { category: 'Informational Queries', status: 'defending' },
    { category: 'Commercial Queries', status: 'competitive' },
    { category: 'Navigation Queries', status: 'opportunity' },
    { category: 'Citation Quality', status: 'competitor_advantage' }
  ]
})

// Competition queries
const competitionQueries = computed(() => {
  // Sample queries where both brand and competitor are mentioned
  return [
    { query: 'Best email marketing tools for small business', type: 'Commercial', brandMentioned: true, competitorMentioned: true },
    { query: 'Email marketing vs social media ROI', type: 'Informational', brandMentioned: true, competitorMentioned: true },
    { query: 'Top CRM integrations for email campaigns', type: 'Transactional', brandMentioned: false, competitorMentioned: true },
    { query: 'How to automate marketing workflows', type: 'How-to', brandMentioned: true, competitorMentioned: false },
    { query: 'Enterprise email solutions comparison', type: 'Comparison', brandMentioned: true, competitorMentioned: true }
  ]
})

// Response outcome distribution
const responseOutcomeDistribution = computed(() => {
  // Sample data for UI display
  return [
    { type: 'recommendation', label: 'Recommendation', percentage: 45 },
    { type: 'comparison', label: 'Comparison', percentage: 30 },
    { type: 'mention', label: 'Mention', percentage: 25 }
  ]
})

// Platform mention rates
const platformMentionRates = computed(() => {
  // Calculate platform-specific mention rates from actual data
  const platforms = ['chatgpt', 'perplexity'];
  
  if (!queries.value || queries.value.length === 0) {
    return [];
  }
  
  return platforms.map(platform => {
    // Filter queries by platform
    const platformQueries = queries.value.filter(q => 
      q.data_source?.toLowerCase() === platform.toLowerCase()
    );
    
    // Count brand mentions for this platform (excluding implicit mentions)
    const platformBrandMentions = platformQueries.filter(q => q.brand_mentioned === true && q.brand_mention_type !== 'implicit');
    
    // Calculate rate
    const totalPlatformQueries = platformQueries.length;
    const brandMentionCount = platformBrandMentions.length;
    const mentionRate = totalPlatformQueries ? Math.round((brandMentionCount / totalPlatformQueries) * 100) : 0;
    
    return {
      platform: platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity',
      totalQueries: totalPlatformQueries,
      brandMentions: brandMentionCount,
      mentionRate
    };
  }).filter(p => p.totalQueries > 0); // Only show platforms with queries
})

// Platform citation rates
const platformCitationRates = computed(() => {
  // Calculate platform-specific citation rates
  // First, get page analyses for each platform
  const platforms = ['ChatGPT', 'Perplexity'];

  if (!props.data.page_analyses || props.data.page_analyses.length === 0) {
    // Return sample data if no data available
    return [
      { platform: 'ChatGPT', citations: Math.round(totalCitations.value * 0.6), totalCitations: Math.round(totalCitations.value * 0.6), citationRate: 25 },
      { platform: 'Perplexity', citations: Math.round(totalCitations.value * 0.4), totalCitations: Math.round(totalCitations.value * 0.4), citationRate: 35 }
    ];
  }

  return platforms.map(platform => {
    // Filter pages by platform
    const platformPages = props.data.page_analyses.filter(page => {
      // Match query's data_source to platform (using the query_id to look up the query)
      if (page.query_id) {
        const query = queries.value.find(q => q.id === page.query_id);
        return query && query.data_source?.toLowerCase() === platform.toLowerCase();
      }
      return false;
    });

    // Get client domain pages for this platform
    const platformClientPages = platformPages.filter(page => page.is_client_domain);

    // Calculate rate
    const totalPlatformCitations = platformPages.length;
    const clientCitations = platformClientPages.length;
    const citationRate = totalPlatformCitations ? Math.round((clientCitations / totalPlatformCitations) * 100) : 0;

    return {
      platform,
      citations: clientCitations,
      totalCitations: totalPlatformCitations,
      citationRate
    };
  });
})

// Intent to brand correlation
const intentToBrandCorrelation = computed(() => {
  // Sample data showing correlation between query intent and brand mentions
  return [
    { type: 'informational', label: 'Informational', count: Math.round(totalQueries.value * 0.4), brandMentions: Math.round(totalQueries.value * 0.4 * 0.6), mentionRate: 60 },
    { type: 'commercial', label: 'Commercial', count: Math.round(totalQueries.value * 0.3), brandMentions: Math.round(totalQueries.value * 0.3 * 0.7), mentionRate: 70 },
    { type: 'navigational', label: 'Navigational', count: Math.round(totalQueries.value * 0.2), brandMentions: Math.round(totalQueries.value * 0.2 * 0.8), mentionRate: 80 }
  ]
})

// Opportunity score
const opportunityScore = computed(() => {
  // Calculate opportunity score based on brand mention rate and citation rate
  return Math.round(((brandMentionRate.value / 100) * 0.7 + (brandCitationRate.value / 100) * 0.3) * 100)
})

// Top query opportunities
const topOpportunities = computed(() => {
  // Sample opportunities for the UI
  return [
    { 
      title: 'Email Automation Queries', 
      type: 'opportunity',
      score: 8,
      description: 'Your brand is mentioned in only 30% of automation-related queries despite having strong features in this area.'
    },
    { 
      title: 'ROI Comparison Queries', 
      type: 'negative',
      score: 4,
      description: 'Competitors are outperforming your brand 2:1 in queries about measuring email marketing ROI.'
    },
    { 
      title: 'Integration-Related Queries', 
      type: 'positive',
      score: 9,
      description: 'Your brand dominates in queries about CRM integrations with an 85% mention rate.'
    }
  ]
})

// Citation by query type
const citationByQueryType = computed(() => {
  // Sample data showing citation rates by query type
  return [
    { type: 'Informational', yourRate: 30, competitorRate: 20 },
    { type: 'Commercial', yourRate: 25, competitorRate: 35 },
    { type: 'How-to', yourRate: 40, competitorRate: 15 },
    { type: 'Comparison', yourRate: 20, competitorRate: 25 }
  ]
})

// Helper function to format label text
const formatLabel = (text) => {
  if (!text) return 'Unknown'
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ')
}

// Color classes for different entities
const getTypeTagClass = (type) => {
  const typeMap = {
    informational: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    commercial: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    navigational: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    transactional: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
    'how-to': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
    comparison: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300'
  }
  
  return typeMap[type?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
}

const getOutcomeTagClass = (outcome) => {
  const outcomeMap = {
    recommendation: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    answer: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    guide: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
    analysis: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
    explanation: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
  }
  
  return outcomeMap[outcome?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
}

const getSentimentTagClass = (sentiment) => {
  const sentimentMap = {
    positive: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    neutral: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
    negative: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
  }
  
  return sentimentMap[sentiment?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
}

const getColorClass = (category) => {
  const categoryMap = {
    product: 'bg-blue-500 dark:bg-blue-500',
    service: 'bg-green-500 dark:bg-green-500',
    technology: 'bg-purple-500 dark:bg-purple-500',
    feature: 'bg-indigo-500 dark:bg-indigo-500',
    tool: 'bg-amber-500 dark:bg-amber-500',
    platform: 'bg-pink-500 dark:bg-pink-500',
    solution: 'bg-cyan-500 dark:bg-cyan-500',
    review: 'bg-red-500 dark:bg-red-500',
    comparison: 'bg-orange-500 dark:bg-orange-500',
    guide: 'bg-emerald-500 dark:bg-emerald-500',
    informational: 'bg-blue-500 dark:bg-blue-500',
    commercial: 'bg-green-500 dark:bg-green-500',
    navigational: 'bg-purple-500 dark:bg-purple-500',
    transactional: 'bg-amber-500 dark:bg-amber-500'
  }
  return categoryMap[category?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

const getIntentColorClass = (intent) => {
  const intentMap = {
    informational: 'bg-blue-500 dark:bg-blue-500',
    commercial: 'bg-green-500 dark:bg-green-500',
    navigational: 'bg-purple-500 dark:bg-purple-500',
    transactional: 'bg-amber-500 dark:bg-amber-500'
  }
  return intentMap[intent?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

const getResponseColorClass = (type) => {
  const typeMap = {
    recommendation: 'bg-green-500 dark:bg-green-500',
    comparison: 'bg-blue-500 dark:bg-blue-500',
    mention: 'bg-purple-500 dark:bg-purple-500'
  }
  return typeMap[type?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

const getCompetitionStatusColor = (status) => {
  const statusMap = {
    defending: 'bg-blue-500 dark:bg-blue-500',
    opportunity: 'bg-green-500 dark:bg-green-500',
    competitive: 'bg-amber-500 dark:bg-amber-500',
    competitor_advantage: 'bg-red-500 dark:bg-red-500'
  }
  return statusMap[status?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

const getBrandCompetitorColor = (type) => {
  const typeMap = {
    brand_only: 'bg-green-500 dark:bg-green-500',
    competitor_only: 'bg-red-500 dark:bg-red-500',
    both: 'bg-amber-500 dark:bg-amber-500',
    neither: 'bg-gray-500 dark:bg-gray-500'
  }
  return typeMap[type?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

const getPlatformColor = (platform) => {
  const platformMap = {
    chatgpt: 'bg-green-500 dark:bg-green-500',
    perplexity: 'bg-blue-500 dark:bg-blue-500'
  }
  return platformMap[platform?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

// Helper functions for Opportunity Analysis
const getInsightColor = (type) => {
  const typeMap = {
    positive: 'bg-green-500 dark:bg-green-500',
    neutral: 'bg-blue-500 dark:bg-blue-500',
    negative: 'bg-red-500 dark:bg-red-500',
    opportunity: 'bg-amber-500 dark:bg-amber-500'
  }
  return typeMap[type?.toLowerCase()] || 'bg-gray-500 dark:bg-gray-500'
}

// Brand position relative to competitors
const brandPositionStatus = computed(() => {
  // Determine if brand is ahead, equal, or behind competitors
  if (brandMentionRate.value > 60) {
    return 'ahead of'
  } else if (brandMentionRate.value > 40) {
    return 'on par with'
  } else {
    return 'behind'
  }
})

// Count of unique domains in citations
const domainCount = computed(() => {
  const domains = new Set()
  props.data.page_analyses?.forEach(page => {
    if (page.domain_name) {
      domains.add(page.domain_name)
    }
  })
  return domains.size || 15 // Fallback
})

// Sample data for the response table
const responseTableData = computed(() => {
  return [
    { query: 'What is email marketing?', type: 'Informational', outcome: 'Answer', mentionType: 'Primary', sentiment: 'Positive' },
    { query: 'Best email marketing tools', type: 'Commercial', outcome: 'Recommendation', mentionType: 'Comparison', sentiment: 'Neutral' },
    { query: 'Email marketing vs social media', type: 'Comparison', outcome: 'Analysis', mentionType: 'Secondary', sentiment: 'Positive' },
    { query: 'How to improve email open rates', type: 'How-to', outcome: 'Guide', mentionType: 'Example', sentiment: 'Positive' },
    { query: 'Email marketing compliance', type: 'Informational', outcome: 'Explanation', mentionType: 'Authority', sentiment: 'Neutral' }
  ]
})
</script>

<style scoped>
.query-analysis-component {
  position: relative;
  min-height: 300px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* When nested inside the component, cards shouldn't have a border since the parent already has one */
.query-analysis-component > .grid > div {
  border: 1px solid transparent;
  background-color: rgba(255, 255, 255, 0.05);
}
</style>