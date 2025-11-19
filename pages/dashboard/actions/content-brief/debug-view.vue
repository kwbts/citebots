<template>
  <div class="max-w-7xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brief Viewer Debug</h1>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief ID:</label>
        <div class="flex">
          <input 
            v-model="briefId" 
            type="text" 
            placeholder="Enter brief ID" 
            class="input-field flex-1"
          />
          <button 
            @click="fetchBrief"
            class="ml-2 bg-citebots-orange hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            View Brief
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-32">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-citebots-orange"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading brief...</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <h3 class="text-red-800 dark:text-red-400 font-semibold mb-2">Error Loading Brief</h3>
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <!-- Debug Panel -->
      <div v-if="brief" class="mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold mb-3">Brief Details</h2>
        <div class="space-y-2">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ID:</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ brief.id }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ brief.title }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(brief.generated_at || brief.created_at) }}</p>
            </div>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Keywords:</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="(keyword, idx) in brief.keywords"
                :key="idx"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-citebots-orange/10 text-citebots-orange"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Brief Content -->
      <div v-if="brief" class="space-y-8">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
          <div class="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p>{{ brief.summary }}</p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Content Suggestions</h2>
          <div class="space-y-4">
            <div
              v-for="(suggestion, idx) in brief.content_suggestions"
              :key="idx"
              class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <div class="h-6 w-6 rounded-full bg-citebots-orange/10 flex items-center justify-center">
                    <span class="text-citebots-orange font-semibold text-sm">{{ idx + 1 }}</span>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-gray-900 dark:text-white font-medium">{{ suggestion.suggestion }}</p>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ suggestion.rationale }}</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Importance:</span>
                    <div class="ml-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-24">
                      <div
                        class="bg-citebots-orange rounded-full h-2"
                        :style="`width: ${(suggestion.importance / 10) * 100}%`"
                      ></div>
                    </div>
                    <span class="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ suggestion.importance }}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          
          <div class="space-y-6">
            <div 
              v-for="(section, idx) in brief.table_of_contents" 
              :key="idx"
              class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 border-l-citebots-orange/70"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {{ section.title }}
              </h3>
              <ul class="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300 ml-1">
                <li v-for="(point, pidx) in section.points" :key="pidx" class="text-base">
                  {{ point }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="brief.research_links && brief.research_links.length > 0">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Research Links</h2>
          
          <div class="space-y-4">
            <div 
              v-for="(source, idx) in brief.research_links" 
              :key="idx"
              class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div class="ml-3">
                  <a 
                    :href="source.url" 
                    target="_blank" 
                    class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {{ source.title }}
                    <svg class="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ source.description }}</p>
                  <div class="mt-2 flex items-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {{ source.source_type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw Data Section (for debugging) -->
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Raw Data</h2>
            <button 
              @click="showRawData = !showRawData"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-citebots-orange dark:hover:text-citebots-orange"
            >
              {{ showRawData ? 'Hide' : 'Show' }} Raw Data
            </button>
          </div>
          
          <div v-if="showRawData" class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[400px]">
            <pre class="text-xs text-gray-800 dark:text-gray-300">{{ JSON.stringify(brief, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  middleware: ['auth', 'client-access'],
  layout: 'dashboard',
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const briefId = ref('');
const brief = ref(null);
const isLoading = ref(false);
const error = ref(null);
const showRawData = ref(false);

// Get the brief ID from the URL if present
onMounted(() => {
  const id = route.query.id;
  if (id) {
    briefId.value = id;
    fetchBrief();
  }
});

async function fetchBrief() {
  if (!briefId.value) {
    error.value = 'Please enter a brief ID';
    return;
  }

  isLoading.value = true;
  error.value = null;
  brief.value = null;

  try {
    console.log('Fetching brief with ID:', briefId.value);
    
    // Directly fetch from Supabase
    const { data, error: supabaseError } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', briefId.value)
      .single();
    
    if (supabaseError) {
      throw supabaseError;
    }
    
    if (!data) {
      throw new Error('Brief not found');
    }
    
    console.log('Brief data:', data);
    
    // Process the data
    const processedBrief = {
      id: data.id,
      title: data.title,
      keywords: data.keywords || [],
      purpose: data.purpose || '',
      audience: data.audience || '',
      created_at: data.created_at,
      generated_at: data.created_at, // Fallback to created_at
      status: data.status,
      // Handle content object with fallbacks
      summary: data.content?.summary || '',
      content_suggestions: data.content?.content_suggestions || [],
      table_of_contents: data.content?.table_of_contents || [],
      research_links: data.content?.research_links || [],
      process_notes: data.content?.process_notes || {
        llm_responses: [],
        search_results: [],
        competitor_insights: []
      },
      // Store raw data for debugging
      raw: data
    };
    
    brief.value = processedBrief;
  } catch (err) {
    console.error('Error fetching brief:', err);
    error.value = err.message || 'Error fetching brief';
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>