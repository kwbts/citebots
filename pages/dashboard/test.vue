<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Dashboard Test Page</h1>
    <p>If you can see this, nested routing is working.</p>
    <NuxtLink to="/dashboard" class="text-blue-600 hover:underline">Back to Dashboard</NuxtLink>
  </div>
</template>

<script setup>
console.log('Dashboard test page mounted')
</script>