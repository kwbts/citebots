<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-lg dark:hover:shadow-gray-900/25">
    <!-- Parent Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-xl flex items-center justify-center">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Brand Page Issues & Recommendations</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Priority fixes for improving your brand page SEO performance</p>
      </div>
    </div>

    <!-- Child Container -->
    <div class="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl p-4">
      <div class="space-y-4">
        <div v-for="issue in issues" :key="issue.issue"
             class="rounded-xl border transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800"
             :class="issue.priority === 'High' ? 'border-red-200/50 dark:border-red-800/30' : issue.priority === 'Medium' ? 'border-yellow-200/50 dark:border-yellow-800/30' : 'border-blue-200/50 dark:border-blue-800/30'">
          <div class="flex items-start p-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   :class="issue.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30' : issue.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'">
                <svg class="w-4 h-4" :class="issue.priority === 'High' ? 'text-red-600 dark:text-red-400' : issue.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'"
                     fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-semibold text-gray-900 dark:text-white">{{ issue.issue }}</h4>
                <button
                  @click="toggleIssue(issue.issue)"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  {{ expandedIssue === issue.issue ? 'Hide Details' : 'View Pages' }}
                </button>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ issue.description }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Affects {{ issue.affectedPages }} brand pages • Priority: {{ issue.priority }}</p>
            </div>
          </div>

          <!-- Dropdown with affected pages -->
          <div v-if="expandedIssue === issue.issue && issue.pages" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div class="p-4">
              <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Affected Brand Pages:</h5>
              <div class="space-y-2">
                <div v-for="page in issue.pages" :key="page.id"
                     class="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ page.page_title || 'Untitled Page' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ page.citation_url }}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Query ID: {{ page.query_id }}
                    </div>
                  </div>
                  <a :href="page.citation_url" target="_blank"
                     class="ml-3 px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                    View Page →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  issues: {
    type: Array,
    required: true
  }
})

const expandedIssue = ref(null)

const toggleIssue = (issueKey) => {
  expandedIssue.value = expandedIssue.value === issueKey ? null : issueKey
}
</script>
