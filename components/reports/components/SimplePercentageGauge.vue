<template>
  <div class="percentage-gauge">
    <svg width="200" height="200" viewBox="0 0 200 200">
      <!-- Background Circle -->
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="#374151"
        stroke-width="12"
        class="gauge-bg"
      />
      
      <!-- Progress Arc -->
      <path
        :d="getArcPath()"
        fill="none"
        stroke="#f97316"
        stroke-width="12"
        stroke-linecap="round"
        class="gauge-progress"
      />
      
      <!-- Inner Circle -->
      <circle
        cx="100"
        cy="100"
        r="65"
        fill="#1e293b"
        class="gauge-inner-circle"
      />
      
      <!-- Percentage Value -->
      <text
        x="100"
        y="90"
        text-anchor="middle"
        font-size="65"
        font-weight="bold"
        fill="white"
        class="gauge-value"
      >{{ displayValue }}</text>
      
      <!-- Percentage Symbol -->
      <text
        x="100"
        y="120"
        text-anchor="middle"
        font-size="20"
        fill="rgba(255, 255, 255, 0.5)"
        class="gauge-symbol"
      >%</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    default: 0
  }
})

// Format the display value to a whole number
const displayValue = computed(() => {
  return Math.round(props.value || 0)
})

// Calculate the SVG arc path based on the percentage value
const getArcPath = () => {
  // Limit value to 0-100 range
  const percentage = Math.min(Math.max(props.value || 0, 0), 100) / 100

  // Define the circle properties
  const centerX = 100
  const centerY = 100
  const radius = 80
  
  // Calculate start angle (top of the circle, -90 degrees)
  const startAngle = -Math.PI / 2
  
  // Calculate end angle based on percentage
  const endAngle = startAngle + (2 * Math.PI * percentage)
  
  // Calculate start and end points
  const startX = centerX + radius * Math.cos(startAngle)
  const startY = centerY + radius * Math.sin(startAngle)
  const endX = centerX + radius * Math.cos(endAngle)
  const endY = centerY + radius * Math.sin(endAngle)
  
  // Determine if we need to use a large arc flag (if percentage > 50%)
  const largeArcFlag = percentage > 0.5 ? 1 : 0
  
  // Create SVG path
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
}
</script>

<style scoped>
.percentage-gauge {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.gauge-progress {
  transition: all 0.8s ease-in-out;
}

.gauge-inner-circle {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.gauge-value, .gauge-symbol {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>