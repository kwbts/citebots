<!-- components/labs/reports/utils/AnimatedNumber.vue -->
<template>
    <span>{{ displayValue }}</span>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  
  const props = defineProps({
    value: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 1000
    },
    easing: {
      type: String,
      default: 'easeOutExpo'
    },
    delay: {
      type: Number,
      default: 0
    },
    formatFn: {
      type: Function,
      default: null
    }
  });
  
  const displayValue = ref(0);
  let animationTimer = null;
  
  // Easing functions
  const easings = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  };
  
  // Animation function
  const animate = (from, to) => {
    const startTime = performance.now();
    const duration = props.duration;
    const easingFn = easings[props.easing] || easings.easeOutExpo;
    
    // Clear any existing animation
    if (animationTimer) {
      clearTimeout(animationTimer);
    }
    
    // Animation loop
    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      const currentValue = Math.round(from + (to - from) * easedProgress);
      displayValue.value = props.formatFn ? props.formatFn(currentValue) : currentValue;
      
      if (progress < 1) {
        animationTimer = requestAnimationFrame(updateValue);
      }
    };
    
    // Start animation after delay
    setTimeout(() => {
      requestAnimationFrame(updateValue);
    }, props.delay);
  };
  
  // Watch for value changes and animate
  watch(() => props.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      animate(displayValue.value, newValue);
    }
  }, { immediate: false });
  
  // Initialize on mount
  onMounted(() => {
    displayValue.value = 0;
    animate(0, props.value);
  });
  </script>