<template>
  <div class="gauge-container" :style="{ '--percentage': percentage + '%' }">
    <div class="gauge">
      <div class="gauge-fill"></div>
      <div class="gauge-center">
        <div class="gauge-value">{{ displayValue }}</div>
        <div class="gauge-label">%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})

const percentage = computed(() => {
  return Math.min(Math.max(props.value || 0, 0), 100)
})

const displayValue = computed(() => {
  return Math.round(props.value || 0)
})
</script>

<style scoped>
.gauge-container {
  --percentage: 0%;
  --gauge-size: 180px;
  --gauge-thickness: 12px;
  --gauge-color: #f97316; /* orange-500 */
  --gauge-bg: #2c3645;
  --gauge-center-color: #1e293b;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.gauge {
  position: relative;
  width: var(--gauge-size);
  height: var(--gauge-size);
  border-radius: 50%;
  background-color: var(--gauge-bg);
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.gauge-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 270deg, /* Start at 12 o'clock position (270 degrees in conic-gradient) */
    var(--gauge-color) 0% var(--percentage),
    transparent var(--percentage) 100%
  );
}

/* Ensure the fill has proper mask */
.gauge:after {
  content: "";
  position: absolute;
  top: var(--gauge-thickness);
  left: var(--gauge-thickness);
  right: var(--gauge-thickness);
  bottom: var(--gauge-thickness);
  background: var(--gauge-center-color);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2) inset;
}

.gauge-center {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-value {
  font-size: 60px;
  font-weight: bold;
  color: white;
  line-height: 1;
  margin-bottom: -10px;
}

.gauge-label {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
}
</style>