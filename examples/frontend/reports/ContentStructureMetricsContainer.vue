<!-- components/labs/reports/ContentStructureMetricsContainer.vue -->
<template>
  <div>
    <!-- Header -->
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Content Structure Analysis</h2>
    
    <!-- Two-column container -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left column: Folder Depth Impact -->
      <FolderDepthImpactComponent :reportData="reportData" />
      
      <!-- Right column: Content Freshness Distribution -->
      <ContentFreshnessDistributionComponent :reportData="reportData" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import FolderDepthImpactComponent from './FolderDepthImpactComponent.vue';
import ContentFreshnessDistributionComponent from './ContentFreshnessDistributionComponent.vue';

const props = defineProps({
  reportData: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
/* Any custom styles if needed */
</style>