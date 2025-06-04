<template>
  <div>
    <QueryAnalysisV2
      :data="data"
      :client="client"
      :removeControls="true"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QueryAnalysisV2 from './components/QueryAnalysisV2.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  client: {
    type: Object,
    required: true
  }
})
</script>