<template>
  <div class="circular-progress-container">
    <div class="circular-progress">
      <!-- Background track -->
      <div class="progress-track"></div>
      
      <!-- Colored progress arc -->
      <div class="progress-arc" :style="{ 
        '--progress-percentage': progress, 
        '--progress-color': progressColor 
      }"></div>
      
      <!-- Inner circle with text -->
      <div class="progress-inner">
        <div class="score">{{ formattedScore }}</div>
        <div class="label">{{ percentDisplay ? '%' : 'out of 10' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 10
  },
  color: {
    type: String,
    default: null // Default will use the progressColor computed property
  },
  percentDisplay: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const progress = computed(() => {
  return Math.min(props.score / 10, 1)
})

const formattedScore = computed(() => {
  if (props.percentDisplay) {
    return Math.round(props.score * 10)
  }
  return props.score.toFixed(1)
})

const progressColor = computed(() => {
  if (props.color) return props.color

  if (props.score >= 8) return 'var(--color-green, #10b981)'
  if (props.score >= 6) return 'var(--color-blue, #3b82f6)'
  if (props.score >= 4) return 'var(--color-yellow, #f59e0b)'
  return 'var(--color-red, #ef4444)'
})
</script>

<style scoped>
:root {
  --color-green: #10b981;
  --color-blue: #3b82f6;
  --color-yellow: #f59e0b;
  --color-orange: #f97316;
  --color-red: #ef4444;
}

.circular-progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.circular-progress {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Background track */
.progress-track {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 10px solid rgba(31, 41, 55, 0.5);
}

/* Progress arc - using SVG to create a properly filled arc */
.progress-arc {
  position: absolute;
  top: 0;
  left: 0;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  --progress-percentage: 0;
  --progress-color: var(--color-orange, #f97316);
  background: conic-gradient(
    var(--progress-color) 0% calc(var(--progress-percentage) * 100%),
    transparent calc(var(--progress-percentage) * 100%) 100%
  );
  clip-path: polygon(
    50% 50%,
    50% 0%,
    100% 0%,
    100% 100%, 
    0% 100%,
    0% 0%,
    50% 0%
  );
  mask: radial-gradient(transparent 60px, black 60px, black 80px, transparent 80px);
  -webkit-mask: radial-gradient(transparent 60px, black 60px, black 80px, transparent 80px);
}

/* Inner circle with text */
.progress-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background-color: #1e293b;
  z-index: 2;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.score {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Light mode styles */
:root:not(.dark) .progress-track {
  border-color: rgba(229, 231, 235, 0.8);
}

:root:not(.dark) .progress-inner {
  background-color: white;
}

:root:not(.dark) .score {
  color: #111827;
}

:root:not(.dark) .label {
  color: #6b7280;
}

/* Dark mode specific styles */
.dark .progress-track {
  border-color: rgba(31, 41, 55, 0.5);
}

.dark .progress-inner {
  background-color: #1e293b;
}
</style>