<template>
  <div class="gauge-wrapper">
    <svg viewBox="0 0 120 120" class="gauge">
      <!-- Background Circle -->
      <circle 
        cx="60" 
        cy="60" 
        r="54" 
        fill="none" 
        stroke="#374151" 
        stroke-width="7"
        class="bg-circle"
      />
      
      <!-- Progress Arc -->
      <path
        :d="arcPath"
        fill="none"
        stroke="#f97316"
        stroke-width="8"
        stroke-linecap="round"
        class="progress-arc"
      />
      
      <!-- Inner Circle Background -->
      <circle 
        cx="60" 
        cy="60" 
        r="46" 
        fill="#1e293b" 
        class="inner-circle"
      />
      
      <!-- Text Content -->
      <text 
        x="60" 
        y="55" 
        text-anchor="middle" 
        font-size="36" 
        font-weight="700" 
        fill="#ffffff"
        class="value"
      >{{ Math.round(percentage) }}</text>
      
      <text 
        x="60" 
        y="75" 
        text-anchor="middle" 
        font-size="12" 
        fill="#999999"
        class="label"
      >%</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0
  }
})

// Calculate SVG arc path
const arcPath = computed(() => {
  // Normalize percentage to 0-100 range
  const value = Math.min(Math.max(props.percentage, 0), 100)
  
  // Circle properties
  const centerX = 60
  const centerY = 60
  const radius = 54
  
  // Calculate the angle in radians (start from top, go clockwise)
  const startAngle = -Math.PI / 2 // Start at 12 o'clock (-90 degrees)
  const endAngle = startAngle + (2 * Math.PI * value / 100) // Convert to radians
  
  // Calculate arc end points
  const startX = centerX + radius * Math.cos(startAngle)
  const startY = centerY + radius * Math.sin(startAngle)
  const endX = centerX + radius * Math.cos(endAngle)
  const endY = centerY + radius * Math.sin(endAngle)
  
  // Determine if the arc should be major (> 180°) or minor
  const largeArcFlag = value > 50 ? 1 : 0
  
  // SVG path: M=moveto, A=elliptical arc
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
})
</script>

<style scoped>
.gauge-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.gauge {
  width: 100%;
  height: 100%;
}

.inner-circle {
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2));
}

.progress-arc {
  transition: all 0.5s ease-in-out;
}

.value {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.label {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  opacity: 0.7;
}
</style>