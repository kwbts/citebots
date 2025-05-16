<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Environment Check</h1>
    
    <div class="space-y-4">
      <div>
        <strong>Supabase URL:</strong>
        <code class="ml-2 p-1 bg-gray-100">{{ supabaseUrl }}</code>
      </div>
      
      <div>
        <strong>Has Anon Key:</strong>
        <code class="ml-2 p-1 bg-gray-100">{{ hasAnonKey }}</code>
      </div>
      
      <div>
        <strong>Runtime Config:</strong>
        <pre class="mt-2 p-4 bg-gray-100 rounded overflow-auto">{{ JSON.stringify(runtimeConfig, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const supabaseUrl = config.public.supabaseUrl
const hasAnonKey = !!config.public.supabaseAnonKey
const runtimeConfig = {
  public: {
    supabaseUrl: config.public.supabaseUrl,
    hasAnonKey: !!config.public.supabaseAnonKey
  },
  // Don't expose the service key
  hasServiceKey: !!config.supabaseServiceKey
}
</script>