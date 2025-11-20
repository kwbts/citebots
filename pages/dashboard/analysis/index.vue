<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">Run Analysis</h1>
            <p class="text-gray-600 dark:text-gray-300 text-base">Analyze citations and track your brand presence in AI responses</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Setup Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Analysis Setup</h2>
        <p class="text-gray-600 dark:text-gray-400 text-base">
          Configure your analysis parameters and generate queries based on your keywords
        </p>
      </div>

      <!-- Client Selection -->
      <div class="mb-8">
        <label for="client-select" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
          Select Client <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <select
            id="client-select"
            v-model="selectedClientId"
            class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
            :disabled="loading"
            :class="{ 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-800': !selectedClientId && attempted }"
          >
            <option value="">Choose a client...</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }} ({{ client.domain }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p v-if="clients.length === 0" class="text-sm text-amber-600 dark:text-amber-400 mt-3">
          No clients found. <NuxtLink to="/dashboard/clients" class="text-citebots-orange hover:text-citebots-orange/80 font-semibold transition-colors">Create your first client</NuxtLink>
        </p>
      </div>

      <!-- Report Name (Optional) -->
      <div v-if="selectedClient" class="mb-8">
        <label for="report-name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
          Report Name (Optional)
        </label>
        <input
          id="report-name"
          v-model="reportName"
          type="text"
          placeholder="e.g., Q4 Competitor Analysis"
          maxlength="150"
          class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Leave blank to auto-generate: "{{ selectedClient?.name }} Analysis - {{ new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}"
        </p>
      </div>

      <!-- Analysis Type Selection -->
      <div v-if="selectedClient" class="mb-8">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Analysis Type
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Choose the type of analysis to perform
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="analysisType = 'query-only'"
            :class="[
              'px-4 py-3 rounded-lg font-medium text-sm border transition-all duration-150 text-left',
              analysisType === 'query-only'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <div class="font-semibold">Query-Only</div>
                <div class="text-xs mt-1 opacity-80">Fast analysis without web scraping</div>
              </div>
            </div>
          </button>
          <button
            @click="analysisType = 'comprehensive'"
            :class="[
              'px-4 py-3 rounded-lg font-medium text-sm border transition-all duration-150 text-left',
              analysisType === 'comprehensive'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <div class="font-semibold">Comprehensive</div>
                <div class="text-xs mt-1 opacity-80">Full SEO analysis with page scraping</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Query Mode Toggle -->
      <div v-if="selectedClient" class="mb-8">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Query Mode
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Choose whether to generate queries from keywords or enter custom queries directly
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="queryMode = 'keywords'"
            :class="[
              'px-4 py-3 rounded-lg font-medium text-sm border transition-all duration-150',
              queryMode === 'keywords'
                ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
          >
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Generate from Keywords
          </button>
          <button
            @click="queryMode = 'custom'"
            :class="[
              'px-4 py-3 rounded-lg font-medium text-sm border transition-all duration-150',
              queryMode === 'custom'
                ? 'bg-citebots-orange/15 text-citebots-orange border-citebots-orange/30'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            ]"
          >
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Custom Queries
          </button>
        </div>
      </div>

      <!-- Keywords Section (shown when queryMode === 'keywords') -->
      <div v-if="selectedClient && queryMode === 'keywords'" class="mb-8">
        <div class="mb-4">
          <label for="custom-keywords" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Keywords <span class="text-red-500">*</span>
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter keywords for this analysis (one per line)
          </p>
        </div>
        <textarea
          id="custom-keywords"
          v-model="customKeywords"
          class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
          rows="4"
          placeholder="Enter keywords, one per line&#10;e.g.:&#10;email marketing&#10;automation software&#10;lead generation"
          :class="{ 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-800': !customKeywords && attempted }"
        ></textarea>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          These keywords will be used to generate analysis queries
        </p>
      </div>

      <!-- Custom Queries Section (shown when queryMode === 'custom') -->
      <div v-if="selectedClient && queryMode === 'custom'" class="mb-8">
        <div class="mb-4">
          <label for="custom-queries" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Custom Queries <span class="text-red-500">*</span>
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter your custom queries directly (one per line)
          </p>
        </div>
        <textarea
          id="custom-queries"
          v-model="customQueries"
          class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150"
          rows="6"
          placeholder="Enter queries, one per line&#10;e.g.:&#10;What is the best email marketing software?&#10;How to automate lead generation?&#10;Email marketing best practices 2024"
          :class="{ 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-800': !customQueries && attempted }"
        ></textarea>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          These queries will be analyzed directly without AI modification
        </p>
      </div>

      <!-- Query Intent Section -->
      <div v-if="selectedClient && queryMode === 'keywords'" class="mb-8">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Query Intent Types
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Select the types of queries to generate (default: all types)
          </p>
        </div>
        <TagInput
          v-model="selectedIntents"
          v-model:source="intentSources"
          :placeholder="'Add intent type...'"
          :label="''"
          :show-helper-text="false"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          <button
            v-for="intent in availableIntents"
            :key="intent.value"
            @click="toggleIntent(intent.value)"
            class="text-xs py-1.5 px-3 rounded-full text-left transition-colors"
            :class="[
              selectedIntents.includes(intent.value)
                ? 'bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <span class="font-medium">{{ intent.label }}</span>: {{ intent.description }}
          </button>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          These intent types determine what kinds of queries will be generated
        </p>
      </div>

      <!-- Queries Per Keyword Section -->
      <div v-if="selectedClient && queryMode === 'keywords'" class="mb-8">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Queries Per Keyword
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Select how many queries to generate for each keyword
          </p>
        </div>
        <div class="flex items-center">
          <div class="relative w-32">
            <select
              v-model="queriesPerKeyword"
              class="block w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-citebots-orange/50 focus:border-citebots-orange transition-all duration-150 pr-10 appearance-none"
            >
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {{ queriesPerKeyword === 1 ? 'query' : 'queries' }} per keyword
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Generating more queries provides better coverage but takes longer
        </p>
      </div>

      <!-- Action Section -->
      <div class="border-t border-gray-200 dark:border-gray-700/60 pt-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="totalKeywords > 0" class="font-semibold">
              {{ totalKeywords }} {{ queryMode === 'custom' ? 'custom queries' : 'keywords' }} ready for analysis
            </span>
            <span v-else>
              Select a client to begin
            </span>
          </div>

          <button
            @click="generateQueries"
            :disabled="!canGenerateQueries || loading"
            class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ loading ? (queryMode === 'custom' ? 'Processing Queries...' : 'Generating Queries...') : (queryMode === 'custom' ? 'Continue with Custom Queries' : 'Generate Queries') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 mb-8" :class="getStatusClasses()">
      <div class="flex items-start">
        <svg v-if="statusClass.includes('red')" class="w-6 h-6 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <svg v-else-if="statusClass.includes('yellow')" class="w-6 h-6 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <svg v-else class="w-6 h-6 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-base">{{ statusMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Results Preview -->
    <div v-if="analysisResults" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 mb-8">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Analysis Results</h3>
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Analysis ID:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 font-mono">
              {{ analysisResults.analysis_run.id }}
            </span>
          </div>
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Status:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 capitalize">
              {{ analysisResults.analysis_run.status }}
            </span>
          </div>
          <div>
            <span class="text-green-700 dark:text-green-300 font-semibold">Progress:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2 tabular-nums">
              {{ analysisResults.analysis_run.queries_completed }} / {{ analysisResults.analysis_run.queries_total }} queries
            </span>
          </div>
          <div v-if="analysisResults.analysis_run.completed_at">
            <span class="text-green-700 dark:text-green-300 font-semibold">Completed:</span>
            <span class="font-medium text-green-900 dark:text-green-100 ml-2">
              {{ formatDate(analysisResults.analysis_run.completed_at) }}
            </span>
          </div>
        </div>
        
        <button 
          v-if="analysisResults.analysis_run.status === 'completed'"
          @click="viewResults"
          class="bg-green-600 text-white border border-green-600 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-green-700 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 inline-flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
          </svg>
          View Detailed Results
        </button>
      </div>
    </div>

    <!-- No Clients State -->
    <div v-if="!loading && clients.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/60 rounded-lg flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No Clients Found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-base leading-relaxed">
        You need to create at least one client before running analysis. Clients help organize your keywords and analysis data.
      </p>
      <NuxtLink 
        to="/dashboard/clients" 
        class="bg-citebots-orange/15 text-citebots-orange border border-citebots-orange/30 rounded-lg px-6 py-3 font-semibold text-sm hover:bg-citebots-orange/20 hover:scale-[0.98] active:scale-[0.96] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-citebots-orange/50 focus:ring-offset-2 inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Create Your First Client
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import TagInput from '~/components/TagInput.vue'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Data
const clients = ref([])
const selectedClientId = ref('')
const platform = ref('chatgpt') // Default to ChatGPT
const loading = ref(false)
const statusMessage = ref('')
const statusClass = ref('')
const analysisResults = ref(null)
const customKeywords = ref('')
const customQueries = ref('')
const queryMode = ref('keywords') // 'keywords' or 'custom'
const analysisType = ref('query-only') // 'query-only' or 'comprehensive'
const attempted = ref(false)
const reportName = ref('')
const queriesPerKeyword = ref(3) // Default to 3 queries per keyword

// Query Intent Data
const selectedIntents = ref([
  'informational',
  'navigational',
  'transactional',
  'commercial',
  'educational',
  'opinion'
])
const intentSources = ref([
  'default', 'default', 'default', 'default', 'default', 'default'
])
const availableIntents = [
  { value: 'informational', label: 'Informational', description: 'Seeking general knowledge' },
  { value: 'navigational', label: 'Navigational', description: 'Looking for a specific website/resource' },
  { value: 'transactional', label: 'Transactional', description: 'Intent to take an action (purchase, download)' },
  { value: 'commercial', label: 'Commercial', description: 'Researching before a purchase decision' },
  { value: 'local', label: 'Local', description: 'Seeking location-specific information' },
  { value: 'support', label: 'Support', description: 'Looking for help with a problem' },
  { value: 'educational', label: 'Educational', description: 'Seeking to learn about a topic in depth' },
  { value: 'opinion', label: 'Opinion', description: 'Looking for subjective views or recommendations' }
]

// Toggle intent selection
const toggleIntent = (intent) => {
  const index = selectedIntents.value.indexOf(intent)
  if (index === -1) {
    // Add intent
    selectedIntents.value.push(intent)
    intentSources.value.push('manual')
  } else {
    // Remove intent
    selectedIntents.value.splice(index, 1)
    intentSources.value.splice(index, 1)
  }
}

// Computed
const selectedClient = computed(() =>
  clients.value.find(c => c.id === selectedClientId.value)
)

const totalKeywords = computed(() => {
  if (queryMode.value === 'custom') {
    if (!customQueries.value) return 0
    return customQueries.value
      .split('\n')
      .map(q => q.trim())
      .filter(q => q).length
  }
  
  if (!customKeywords.value) return 0

  const customKeywordsList = customKeywords.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k)

  return customKeywordsList.length
})

const canGenerateQueries = computed(() => {
  if (queryMode.value === 'custom') {
    return selectedClientId.value && customQueries.value && customQueries.value.trim()
  }
  return selectedClientId.value && totalKeywords.value > 0
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const getStatusClasses = () => {
  if (statusClass.value.includes('red')) {
    return 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20'
  }
  if (statusClass.value.includes('yellow')) {
    return 'border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20'
  }
  return 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20'
}

async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('created_by', user.value.id)
      .order('name')
    
    if (error) throw error
    clients.value = data || []
  } catch (error) {
    // Error handling for client fetch
    statusMessage.value = 'Error loading clients. Please refresh the page.'
    statusClass.value = 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
  }
}

async function generateQueries() {
  attempted.value = true

  if (!selectedClientId.value) {
    statusMessage.value = 'Please select a client'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Handle custom query mode
  if (queryMode.value === 'custom') {
    if (!customQueries.value) {
      statusMessage.value = 'Please provide at least one custom query'
      statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
      return
    }

    const allQueries = customQueries.value
      .split('\n')
      .map(q => q.trim())
      .filter(q => q) // Filter out empty strings

    // Check if we have any queries
    if (allQueries.length === 0) {
      statusMessage.value = 'Please provide at least one custom query'
      statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
      return
    }

    // Clear any previous status messages
    statusMessage.value = ''
    statusClass.value = ''

    // Navigate to preview page with custom queries
    router.push({
      path: '/dashboard/analysis/preview-queries',
      query: {
        client_id: selectedClientId.value,
        mode: 'custom',
        queries: allQueries.join(','),
        report_name: reportName.value || '',
        analysis_type: analysisType.value
      }
    })
    return
  }

  // Handle keywords mode (existing logic)
  if (!customKeywords.value) {
    statusMessage.value = 'Please provide at least one keyword'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  const allKeywords = customKeywords.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k) // Filter out empty strings

  // Check if we have any keywords
  if (allKeywords.length === 0) {
    statusMessage.value = 'Please provide at least one keyword'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Check if we have any intents selected
  if (selectedIntents.value.length === 0) {
    statusMessage.value = 'Please select at least one query intent type'
    statusClass.value = 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
    return
  }

  // Clear any previous status messages
  statusMessage.value = ''
  statusClass.value = ''

  // Navigate to preview page with all keywords and selected intents
  router.push({
    path: '/dashboard/analysis/preview-queries',
    query: {
      client_id: selectedClientId.value,
      keywords: allKeywords.join(','),
      intents: selectedIntents.value.join(','),
      count: queriesPerKeyword.value.toString(),
      report_name: reportName.value || '',
      analysis_type: analysisType.value
    }
  })
}

function viewResults() {
  if (analysisResults.value?.analysis_run?.id) {
    router.push(`/dashboard/analysis/${analysisResults.value.analysis_run.id}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchClients()
})

// Define page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'client-access']
})
</script>