<template>
  <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="text-base font-semibold text-gray-900 dark:text-white">Brand Mention Rate by Outcome</h4>
      </div>
      <div class="relative group">
        <button
          class="flex items-center justify-center w-4 h-4 text-gray-500 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
          aria-label="Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </button>
        <div class="absolute right-0 top-5 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <p class="text-xs text-gray-600 dark:text-gray-300">
            Shows your brand mention rate for each response outcome type (answer, recommendation, comparison, explanation).
          </p>
        </div>
      </div>
    </div>

    <!-- Outcome Metrics -->
    <div class="space-y-3">
      <div v-if="outcomeMetrics.length === 0" class="text-center p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">No outcome data available</p>
      </div>

      <div v-for="(outcome, index) in outcomeMetrics" :key="outcome.type" class="p-2.5 bg-white dark:bg-gray-800/50 rounded-lg">
        <div class="flex justify-between items-center mb-1.5">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-gray-700 dark:text-gray-300">{{ outcome.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ outcome.brandMentions }} of {{ outcome.total }}</span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border font-semibold"
              :class="getMentionRateClass(outcome.mentionRate)"
            >
              {{ formatPercentage(outcome.mentionRate) }}
            </span>
          </div>
        </div>
        <div class="relative h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
            :class="getBarColor(index)"
            :style="`width: ${Math.min(outcome.mentionRate, 100)}%`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  queries: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Calculate metrics grouped by outcome
const outcomeMetrics = computed(() => {
  if (!props.queries || props.queries.length === 0) return []

  // Group queries by outcome
  const outcomes = {}

  props.queries.forEach(query => {
    const outcome = query.response_outcome || 'unknown'

    if (!outcomes[outcome]) {
      outcomes[outcome] = {
        total: 0,
        brandMentions: 0
      }
    }

    outcomes[outcome].total++

    // Check if brand is mentioned
    if (query.brand_mentioned === true && query.brand_mention_type !== 'implicit') {
      outcomes[outcome].brandMentions++
    }
  })

  // Convert to array and calculate rates
  const outcomeArray = Object.entries(outcomes).map(([type, data]) => ({
    type,
    label: getOutcomeLabel(type),
    total: data.total,
    brandMentions: data.brandMentions,
    mentionRate: data.total > 0 ? (data.brandMentions / data.total) * 100 : 0
  }))

  // Sort by mention rate descending
  return outcomeArray.sort((a, b) => b.mentionRate - a.mentionRate)
})

const getOutcomeLabel = (type) => {
  const labels = {
    'answer': 'Answer',
    'recommendation': 'Recommendation',
    'comparison': 'Comparison',
    'explanation': 'Explanation',
    'list': 'List',
    'guide': 'Guide',
    'unknown': 'Unknown'
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const formatPercentage = (value) => {
  return Math.round(value || 0) + '%'
}

const getMentionRateClass = (rate) => {
  if (rate >= 70) {
    return 'bg-green-50 dark:bg-green-600/20 text-green-700 dark:text-green-200 border-green-200/50 dark:border-green-500/30'
  } else if (rate >= 40) {
    return 'bg-yellow-50 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-200 border-yellow-200/50 dark:border-yellow-500/30'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-gray-600/30'
}

const getBarColor = (index) => {
  const colors = [
    'bg-blue-500 dark:bg-blue-400',
    'bg-indigo-500 dark:bg-indigo-400',
    'bg-purple-500 dark:bg-purple-400',
    'bg-pink-500 dark:bg-pink-400',
    'bg-teal-500 dark:bg-teal-400',
    'bg-cyan-500 dark:bg-cyan-400',
    'bg-violet-500 dark:bg-violet-400'
  ]
  return colors[index % colors.length]
}
</script>
