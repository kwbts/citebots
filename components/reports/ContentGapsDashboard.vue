<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Content Gaps</h2>
    <div class="text-gray-600 dark:text-gray-400">
      <p>Content gaps dashboard coming soon...</p>
      <p class="mt-2 text-sm">This will identify missing content opportunities and competitor advantages.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, required: true },
  client: { type: Object, required: true },
  competitors: { type: Array, default: () => [] }
})
</script>