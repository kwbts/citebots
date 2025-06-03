<template>
  <div class="gauge-container">
    <svg width="220" height="220" viewBox="0 0 220 220">
      <!-- Background Circle -->
      <circle
        cx="110"
        cy="110"
        r="90"
        fill="none"
        stroke="#e5e7eb"
        stroke-width="16"
        class="gauge-bg dark:stroke-gray-700"
      />
      
      <!-- Progress Arc for percentage display -->
      <circle
        v-if="percentDisplay"
        cx="110"
        cy="110"
        r="90"
        fill="none"
        :stroke="scoreColor"
        stroke-width="16"
        stroke-dasharray="565.48"
        :stroke-dashoffset="565.48 * (1 - scoreForArc)"
        stroke-linecap="round"
        transform="rotate(-90 110 110)"
        class="progress-arc"
      />

      <!-- Special Progress Segments for non-percentage display -->
      <template v-if="!percentDisplay">
        <path
          d="M 110 20 A 90 90 0 0 1 200 110"
          fill="none"
          stroke="transparent"
          stroke-width="16"
        />
        <path
          d="M 200 110 A 90 90 0 0 1 180 150"
          fill="none"
          :stroke="scoreColor"
          stroke-width="16"
          stroke-linecap="round"
        />
        <path
          d="M 180 150 A 90 90 0 1 1 110 20"
          fill="none"
          stroke="transparent"
          stroke-width="16"
        />
      </template>

      <!-- Inner Circle -->
      <circle
        cx="110"
        cy="110"
        r="74"
        fill="#ffffff"
        class="gauge-inner-circle dark:fill-[#1e293b]"
      />
      
      <!-- Score Value Display with Percentage Symbol -->
      <g transform="translate(110,110)">
        <text
          x="0"
          y="5"
          text-anchor="middle"
          font-size="54"
          font-weight="bold"
          fill="#1f2937"
          class="score-text dark:fill-white"
        >{{ displayScore }}%</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'

const { isDark } = useDarkMode()

const props = defineProps({
  score: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 10
  },
  percentDisplay: {
    type: Boolean,
    default: false
  }
})

// Calculate score value for arc (0-1 range)
const scoreForArc = computed(() => {
  return Math.min(Math.max(props.score, 0), 1)
})

// Display score - whole number
const displayScore = computed(() => {
  if (props.percentDisplay) {
    return Math.round(props.score * 100)
  }
  return Math.round(props.score * 10) / 10
})

// Color based on score or fixed for percentDisplay
const scoreColor = computed(() => {
  if (props.percentDisplay) return '#f97316' // orange-500
  
  // Color scheme for regular score display
  if (props.score >= 8) return '#10b981' // green-500
  if (props.score >= 6) return '#f59e0b' // amber-500
  if (props.score >= 4) return '#f97316' // orange-500
  return '#ef4444' // red-500
})
</script>

<style scoped>
.gauge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.score-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.label-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  opacity: 0.8;
}

.gauge-inner-circle {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}

.progress-arc {
  transition: stroke-dashoffset 1s ease-in-out;
}
</style>