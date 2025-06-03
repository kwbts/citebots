<template>
  <div class="space-y-6 mx-auto max-w-md">
    <!-- Title and percentage stats -->
    <div class="flex justify-between items-center px-4">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Your Brand: {{ brandCitationPercentage }}%
      </div>
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Competitors: {{ competitorCitationPercentage }}%
      </div>
    </div>
    
    <!-- Main stacked bar -->
    <div class="relative">
      <!-- Total citations label -->
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Citation Distribution</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">Total: {{ totalCitations }}</span>
      </div>
      
      <!-- Bar container -->
      <div class="h-16 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
        <!-- Brand only segment -->
        <div 
          class="absolute top-0 left-0 h-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center"
          :style="`width: ${(brandOnlyCitations / totalCitations) * 100}%`">
          <div class="text-white font-bold">{{ brandOnlyCitations }}</div>
        </div>
        
        <!-- Overlap segment -->
        <div 
          class="absolute top-0 h-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center"
          :style="`left: ${(brandOnlyCitations / totalCitations) * 100}%; width: ${(overlappingCitations / totalCitations) * 100}%`">
          <div class="text-white font-bold">{{ overlappingCitations }}</div>
        </div>
        
        <!-- Competitor only segment -->
        <div 
          class="absolute top-0 h-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center"
          :style="`left: ${((brandOnlyCitations + overlappingCitations) / totalCitations) * 100}%; width: ${(competitorOnlyCitations / totalCitations) * 100}%`">
          <div class="text-white font-bold">{{ competitorOnlyCitations }}</div>
        </div>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="grid grid-cols-3 gap-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-orange-500 dark:bg-orange-600"></div>
        <span class="text-gray-600 dark:text-gray-400">Brand Only</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-purple-500 dark:bg-purple-600"></div>
        <span class="text-gray-600 dark:text-gray-400">Both</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-blue-500 dark:bg-blue-600"></div>
        <span class="text-gray-600 dark:text-gray-400">Competitors Only</span>
      </div>
    </div>
    
    <!-- Citation metrics -->
    <div class="grid grid-cols-3 gap-4 mt-4">
      <div class="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-orange-500 dark:text-orange-400">{{ brandOnlyCitations }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Brand Only</div>
      </div>
      <div class="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-purple-500 dark:text-purple-400">{{ overlappingCitations }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Shared</div>
      </div>
      <div class="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
        <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">{{ competitorOnlyCitations }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Comp. Only</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  brandOnlyCitations: {
    type: Number,
    required: true
  },
  competitorOnlyCitations: {
    type: Number,
    required: true
  },
  overlappingCitations: {
    type: Number,
    required: true
  }
})

// Computed properties
const totalCitations = computed(() => {
  return props.brandOnlyCitations + props.competitorOnlyCitations + props.overlappingCitations
})

const brandCitationPercentage = computed(() => {
  if (totalCitations.value === 0) return 0
  return Math.round(((props.brandOnlyCitations + props.overlappingCitations) / totalCitations.value) * 100)
})

const competitorCitationPercentage = computed(() => {
  if (totalCitations.value === 0) return 0
  return Math.round(((props.competitorOnlyCitations + props.overlappingCitations) / totalCitations.value) * 100)
})
</script>

<style scoped>
/* Animation for the bar segments */
@keyframes growWidth {
  from { width: 0; }
  to { width: var(--final-width); }
}

.bar-segment {
  animation: growWidth 1s ease-out forwards;
}
</style>