<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Top-Level Dynamic Route Test</h1>
    
    <div class="p-4 bg-green-100 rounded">
      <h2 class="font-semibold mb-2">This is at: /test-dynamic-[id]</h2>
      <p>Route params: {{ JSON.stringify($route.params) }}</p>
      <p>ID from params: {{ $route.params.id }}</p>
      <p>Full path: {{ $route.path }}</p>
    </div>
    
    <div class="mt-4">
      <p>To test this, navigate to: /test-dynamic-123</p>
      <p>The ID should be: 123</p>
    </div>
  </div>
</template>

<script setup>
// No script needed - just testing route params
</script>