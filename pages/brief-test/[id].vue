<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brief Viewer Test</h1>
      <p class="mb-4">Brief ID: <strong>{{ $route.params.id }}</strong></p>
      
      <div v-if="isLoading" class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-citebots-orange"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading brief...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <h3 class="text-red-800 dark:text-red-400 font-semibold mb-2">Error Loading Brief</h3>
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <div v-else-if="brief" class="space-y-4">
        <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">{{ brief.title }}</h2>
          <div class="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-2">
            <span v-for="(keyword, idx) in brief.keywords" :key="idx" 
              class="px-2 py-0.5 bg-citebots-orange/10 text-citebots-orange rounded-full">
              {{ keyword }}
            </span>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Summary</h3>
          <p class="text-gray-700 dark:text-gray-300">{{ brief.summary }}</p>
        </div>

        <div class="mt-4">
          <button @click="showRawData = !showRawData" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">
            {{ showRawData ? 'Hide' : 'Show' }} Raw Data
          </button>

          <div v-if="showRawData" class="mt-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[400px]">
            <pre class="text-xs text-gray-800 dark:text-gray-300">{{ JSON.stringify(brief, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const supabase = useSupabaseClient();

const brief = ref(null);
const isLoading = ref(true);
const error = ref(null);
const showRawData = ref(false);

onMounted(async () => {
  try {
    const id = route.params.id;
    console.log('Fetching brief with ID:', id);
    
    const { data, error: supabaseError } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (supabaseError) throw supabaseError;
    if (!data) throw new Error('Brief not found');
    
    console.log('Brief data from Supabase:', data);
    
    // Process the data
    brief.value = {
      id: data.id,
      title: data.title,
      keywords: data.keywords || [],
      summary: data.content?.summary || 'No summary available',
      // Store raw data for reference
      raw: data
    };
  } catch (err) {
    console.error('Error fetching brief:', err);
    error.value = err.message || 'Error fetching brief';
  } finally {
    isLoading.value = false;
  }
});
</script>