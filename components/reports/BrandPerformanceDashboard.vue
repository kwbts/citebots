<template>
  <div class="brand-performance-dashboard">
    <!-- Top Section: Filters -->
    <DashboardFilters
      v-model:filters="filters"
      @update:filters="handleFiltersUpdate"
      :loading="loading"
    />

    <!-- Key Metrics Section -->
    <div class="metrics-grid">
      <BrandMentionRateCard
        :data="brandMentionData"
        :loading="loading"
        :trend="brandMentionTrend"
        :platform-breakdown="platformBreakdown"
      />

      <NoCitationMentionsCard
        :data="noCitationData"
        :loading="loading"
        :trend="noCitationTrend"
        :opportunity-data="noCitationOpportunities"
      />
    </div>

    <!-- Middle Section: Query Analysis -->
    <div class="analysis-section">
      <QueryExplorerComponent
        :queries="displayQueries"
        :loading="loading"
        @query-select="handleQuerySelect"
      />

      <div class="breakdown-charts">
        <BrandMentionBreakdown
          :data="breakdownData"
          :loading="loading"
          @filter-change="handleBreakdownFilter"
        />
        
        <SentimentAnalysis
          :data="sentimentData"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Bottom Section: Competitive Analysis -->
    <div class="competitive-section">
      <BrandVsCompetitors
        :client-data="clientData"
        :competitor-data="competitorData"
        :selected-competitor="selectedCompetitor"
        :loading="loading"
        @competitor-select="handleCompetitorSelect"
      />

      <CompetitorSpotlight
        :competitor="selectedCompetitor"
        :competitor-metrics="competitorMetrics"
        :loading="loading"
      />

      <ResponseOutcomeAnalysis
        :outcome-data="outcomeData"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import DashboardFilters from './components/DashboardFilters.vue'
import BrandMentionRateCard from './components/BrandMentionRateCard.vue'
import NoCitationMentionsCard from './components/NoCitationMentionsCard.vue'
import QueryExplorerComponent from './components/QueryExplorerComponent.vue'
import BrandMentionBreakdown from './components/BrandMentionBreakdown.vue'
import SentimentAnalysis from './components/SentimentAnalysis.vue'
import BrandVsCompetitors from './components/BrandVsCompetitors.vue'
import CompetitorSpotlight from './components/CompetitorSpotlight.vue'
import ResponseOutcomeAnalysis from './components/ResponseOutcomeAnalysis.vue'

export default {
  name: 'BrandPerformanceDashboard',
  components: {
    DashboardFilters,
    BrandMentionRateCard,
    NoCitationMentionsCard,
    QueryExplorerComponent,
    BrandMentionBreakdown,
    SentimentAnalysis,
    BrandVsCompetitors,
    CompetitorSpotlight,
    ResponseOutcomeAnalysis
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    client: {
      type: Object,
      required: true
    },
    competitors: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // Reactive state
    const loading = ref(false)
    const selectedCompetitor = ref(null)
    
    // Default filters for future enhancements
    const filters = ref({
      platforms: ['chatgpt', 'perplexity'],
      brandedQueries: 'all'
    })

    // Helper functions
    const getPlatformLabel = (platform) => {
      const labels = {
        chatgpt: 'ChatGPT',
        claude: 'Claude',
        perplexity: 'Perplexity',
        bard: 'Bard',
        gemini: 'Gemini'
      }
      return labels[platform?.toLowerCase()] || platform || 'Unknown'
    }

    const getIntentLabel = (intent) => {
      const labels = {
        informational: 'Informational',
        commercial: 'Commercial',
        navigational: 'Navigational',
        transactional: 'Transactional'
      }
      return labels[intent?.toLowerCase()] || intent || 'Unknown'
    }

    const getTypeLabel = (type) => {
      const labels = {
        question: 'Question',
        command: 'Command',
        comparison: 'Comparison',
        howto: 'How-to',
        definition: 'Definition'
      }
      return labels[type?.toLowerCase()] || type || 'Unknown'
    }

    const getFunnelLabel = (stage) => {
      const labels = {
        awareness: 'Awareness',
        consideration: 'Consideration',
        decision: 'Decision',
        retention: 'Retention'
      }
      return labels[stage?.toLowerCase()] || stage || 'Unknown'
    }

    const getOutcomeLabel = (outcome) => {
      const labels = {
        recommendation: 'Recommendation',
        comparison: 'Comparison',
        explanation: 'Explanation',
        tutorial: 'Tutorial',
        analysis: 'Analysis'
      }
      return labels[outcome?.toLowerCase()] || outcome || 'Unknown'
    }

    // Computed data from props (matching existing pattern)
    const displayQueries = computed(() => {
      if (!props.data?.analysis_queries) return []
      return props.data.analysis_queries
    })

    const clientData = computed(() => {
      return props.client
    })

    const competitorData = computed(() => {
      return props.competitors
    })

    const analysisRuns = computed(() => {
      // Extract unique analysis runs from queries
      if (!props.data?.analysis_queries) return []
      const runs = new Map()
      props.data.analysis_queries.forEach(query => {
        if (query.analysis_run_id) {
          runs.set(query.analysis_run_id, {
            id: query.analysis_run_id,
            created_at: query.created_at,
            platform: query.data_source
          })
        }
      })
      return Array.from(runs.values())
    })

    const brandMentionData = computed(() => {
      if (!props.data?.analysis_queries) return { mentionRate: 0, mentionedQueries: 0, totalQueries: 0 }
      
      const queries = props.data.analysis_queries
      const totalQueries = queries.length
      const mentionedQueries = queries.filter(q => q.brand_mentioned === true).length
      const mentionRate = totalQueries > 0 ? (mentionedQueries / totalQueries) * 100 : 0
      
      return {
        mentionRate: Math.round(mentionRate * 10) / 10,
        mentionedQueries,
        totalQueries
      }
    })

    const noCitationData = computed(() => {
      if (!props.data?.analysis_queries) return { count: 0, percentage: 0, totalMentions: 0 }
      
      const queries = props.data.analysis_queries
      const brandMentions = queries.filter(q => q.brand_mentioned === true)
      
      // Count queries where brand is mentioned but no citation to client domain
      const noCitationMentions = brandMentions.filter(q => {
        if (!q.associated_pages || !Array.isArray(q.associated_pages)) return true
        
        return !q.associated_pages.some(page => 
          page.is_client_domain === true || 
          page.brand_mentioned === true ||
          (page.citation_url && props.client?.domain && page.citation_url.includes(props.client.domain))
        )
      })
      
      const count = noCitationMentions.length
      const percentage = brandMentions.length > 0 ? (count / brandMentions.length) * 100 : 0
      
      return {
        count,
        percentage: Math.round(percentage * 10) / 10,
        totalMentions: brandMentions.length
      }
    })

    const platformBreakdown = computed(() => {
      if (!props.data?.analysis_queries) return []
      
      const queries = props.data.analysis_queries
      const platformStats = {}
      
      queries.forEach(query => {
        const platform = query.data_source || 'unknown'
        if (!platformStats[platform]) {
          platformStats[platform] = { total: 0, mentioned: 0 }
        }
        platformStats[platform].total++
        if (query.brand_mentioned) {
          platformStats[platform].mentioned++
        }
      })
      
      return Object.entries(platformStats).map(([platform, stats]) => ({
        name: platform,
        label: getPlatformLabel(platform),
        total: stats.total,
        mentioned: stats.mentioned,
        mentionRate: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0
      }))
    })

    // Enhanced computed values based on actual data
    const breakdownData = computed(() => {
      if (!props.data?.analysis_queries) return { byIntent: [], byType: [], byFunnelStage: [] }
      
      const queries = props.data.analysis_queries
      
      // By Intent
      const intentStats = {}
      queries.forEach(query => {
        const intent = query.query_intent || 'Unknown'
        if (!intentStats[intent]) {
          intentStats[intent] = { total: 0, mentioned: 0 }
        }
        intentStats[intent].total++
        if (query.brand_mentioned) {
          intentStats[intent].mentioned++
        }
      })
      
      const byIntent = Object.entries(intentStats).map(([intent, stats]) => ({
        intent,
        label: getIntentLabel(intent),
        total: stats.total,
        mentioned: stats.mentioned,
        mentionRate: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0
      })).sort((a, b) => b.mentionRate - a.mentionRate)

      // By Type
      const typeStats = {}
      queries.forEach(query => {
        const type = query.query_type || 'Unknown'
        if (!typeStats[type]) {
          typeStats[type] = { total: 0, mentioned: 0 }
        }
        typeStats[type].total++
        if (query.brand_mentioned) {
          typeStats[type].mentioned++
        }
      })
      
      const byType = Object.entries(typeStats).map(([type, stats]) => ({
        type,
        label: getTypeLabel(type),
        total: stats.total,
        mentioned: stats.mentioned,
        mentionRate: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0
      })).sort((a, b) => b.mentionRate - a.mentionRate)

      // By Funnel Stage
      const funnelStats = {}
      queries.forEach(query => {
        const stage = query.funnel_stage || 'Unknown'
        if (!funnelStats[stage]) {
          funnelStats[stage] = { total: 0, mentioned: 0 }
        }
        funnelStats[stage].total++
        if (query.brand_mentioned) {
          funnelStats[stage].mentioned++
        }
      })
      
      const byFunnelStage = Object.entries(funnelStats).map(([stage, stats]) => ({
        stage,
        label: getFunnelLabel(stage),
        total: stats.total,
        mentioned: stats.mentioned,
        mentionRate: stats.total > 0 ? (stats.mentioned / stats.total) * 100 : 0
      })).sort((a, b) => b.mentionRate - a.mentionRate)
      
      return { byIntent, byType, byFunnelStage }
    })

    const sentimentData = computed(() => {
      if (!props.data?.analysis_queries) return { distribution: [], averageSentiment: 0, totalQueries: 0 }
      
      const queries = props.data.analysis_queries
      const sentimentQueries = queries.filter(q => 
        q.brand_mentioned && q.brand_sentiment !== null && q.brand_sentiment !== undefined
      )
      
      if (sentimentQueries.length === 0) {
        return { distribution: [], averageSentiment: 0, totalQueries: 0 }
      }
      
      const positive = sentimentQueries.filter(q => q.brand_sentiment > 0.2).length
      const neutral = sentimentQueries.filter(q => q.brand_sentiment >= -0.2 && q.brand_sentiment <= 0.2).length
      const negative = sentimentQueries.filter(q => q.brand_sentiment < -0.2).length
      
      const averageSentiment = sentimentQueries.reduce((sum, q) => sum + q.brand_sentiment, 0) / sentimentQueries.length
      
      return {
        distribution: [
          { label: 'Positive', count: positive, color: 'green' },
          { label: 'Neutral', count: neutral, color: 'gray' },
          { label: 'Negative', count: negative, color: 'red' }
        ],
        averageSentiment,
        totalQueries: sentimentQueries.length
      }
    })

    const outcomeData = computed(() => {
      if (!props.data?.analysis_queries) return { outcomes: [] }
      
      const queries = props.data.analysis_queries
      const outcomeStats = {}
      
      queries.forEach(query => {
        const outcome = query.response_outcome || 'Unknown'
        if (!outcomeStats[outcome]) {
          outcomeStats[outcome] = { total: 0, brandMentioned: 0, competitorMentioned: 0 }
        }
        outcomeStats[outcome].total++
        if (query.brand_mentioned) {
          outcomeStats[outcome].brandMentioned++
        }
        if (query.competitor_mentioned_names?.length > 0) {
          outcomeStats[outcome].competitorMentioned++
        }
      })
      
      const outcomes = Object.entries(outcomeStats).map(([outcome, stats]) => ({
        outcome,
        label: getOutcomeLabel(outcome),
        total: stats.total,
        brandMentioned: stats.brandMentioned,
        competitorMentioned: stats.competitorMentioned,
        brandRate: stats.total > 0 ? (stats.brandMentioned / stats.total) * 100 : 0,
        competitorRate: stats.total > 0 ? (stats.competitorMentioned / stats.total) * 100 : 0
      })).sort((a, b) => b.total - a.total)
      
      return { outcomes }
    })

    // Placeholder computed values for trends
    const brandMentionTrend = computed(() => null)
    const noCitationTrend = computed(() => null)
    
    const noCitationOpportunities = computed(() => {
      if (!props.data?.analysis_queries) return []
      
      const queries = props.data.analysis_queries
      const brandMentions = queries.filter(q => q.brand_mentioned === true)
      const noCitationMentions = brandMentions.filter(q => {
        if (!q.associated_pages || !Array.isArray(q.associated_pages)) return true
        return !q.associated_pages.some(page => page.is_client_domain === true || page.brand_mentioned === true)
      })
      
      // Group by intent for opportunities
      const opportunities = {}
      noCitationMentions.forEach(query => {
        const intent = query.query_intent || 'Unknown'
        opportunities[intent] = (opportunities[intent] || 0) + 1
      })
      
      return Object.entries(opportunities)
        .map(([type, count]) => ({
          type,
          label: getIntentLabel(type),
          count
        }))
        .sort((a, b) => b.count - a.count)
    })
    
    const competitorMetrics = computed(() => ({}))

    // Methods
    const handleFiltersUpdate = (newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
      // In the future, this could trigger data filtering
    }

    const handleQuerySelect = (query) => {
      // Handle individual query selection - could open a modal or navigate to detail view
    }

    const handleBreakdownFilter = (filterType, value) => {
      // Apply breakdown chart filters to main filters
      if (filterType === 'intent') {
        // Could add intent filter to the main filters
      }
      // Implement other filter types as needed
    }

    const handleCompetitorSelect = (competitor) => {
      selectedCompetitor.value = competitor
      // Could load additional competitor-specific data here
    }

    return {
      loading,
      filters,
      selectedCompetitor,
      displayQueries,
      clientData,
      competitorData,
      analysisRuns,
      brandMentionData,
      noCitationData,
      platformBreakdown,
      brandMentionTrend,
      noCitationTrend,
      noCitationOpportunities,
      breakdownData,
      sentimentData,
      competitorMetrics,
      outcomeData,
      handleFiltersUpdate,
      handleQuerySelect,
      handleBreakdownFilter,
      handleCompetitorSelect
    }
  }
}
</script>

<style scoped>
.brand-performance-dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.analysis-section {
  margin: 3rem 0;
}

.breakdown-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.competitive-section {
  margin: 3rem 0;
  display: grid;
  gap: 2rem;
}

@media (max-width: 768px) {
  .brand-performance-dashboard {
    padding: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .breakdown-charts {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>