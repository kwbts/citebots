<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test Dynamic Route</h1>
    <p>ID from route: <strong>{{ $route.params.id }}</strong></p>
    <p class="mt-4">If you can see this page with the ID parameter, dynamic routing is working.</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>