# Client Selection Component for Content Brief Generator

## Overview

The client selection component in the Content Brief Generator allows users to choose which client the brief is being created for, or to create a generic brief without a client association.

## Key Features

### 1. No Client Option

- Add a "No Client / Generic Brief" option at the top of the client dropdown
- This enables users to quickly create briefs that aren't tied to a specific client
- Generic briefs can be useful for:
  - Testing/experimenting with the brief generator
  - Creating templates that can be adapted for specific clients later
  - Generating briefs for general topics without client context
  - Creating personal research briefs

### 2. Client Data Display

- Show client name as primary identifier
- Include additional helpful context in the dropdown:
  - Client domain
  - Industry (if available)
- After selection, show a brief preview of key client information:
  - Domain
  - Industry
  - (Optionally) Number of existing briefs for this client

### 3. Loading State

- Show a loading indicator while client data is being fetched
- Use a subtle spinner next to the dropdown while loading
- Disable the dropdown during loading to prevent interaction errors

### 4. Search/Filtering

- Implement simple text-based filtering
- Search should match against:
  - Client name
  - Client domain
  - Industry

## Implementation Details

### Database Considerations

When a brief is created without a client association:

- The `client_id` field should be NULL or use a special value to indicate "no client"
- Other client-related metadata (domain, industry, etc.) should be omitted or marked as N/A
- The system should not attempt to perform client-specific research (e.g., searching the client's domain)

### UI Implementation

```vue
<div class="mb-6">
  <label class="form-label">Select Client (Optional)</label>
  <div class="relative">
    <select v-model="formData.clientId" class="input-field">
      <option value="">No Client / Generic Brief</option>
      <option v-for="client in filteredClients" :key="client.id" :value="client.id">
        {{ client.name }} {{ client.domain ? `(${client.domain})` : '' }}
      </option>
    </select>
    <div v-if="isLoadingClients" class="absolute right-10 top-1/2 transform -translate-y-1/2">
      <svg class="animate-spin h-5 w-5 text-citebots-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
  
  <!-- Search Input -->
  <div class="mt-2">
    <input 
      v-model="clientSearchTerm" 
      type="text" 
      class="input-field" 
      placeholder="Search clients..." 
    />
  </div>
  
  <!-- Client Preview -->
  <div v-if="selectedClient" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-md">
    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ selectedClient.name }}
    </p>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ selectedClient.domain }} • {{ selectedClient.industry_primary || 'Industry not specified' }}
    </p>
  </div>
  
  <!-- Generic Brief Note -->
  <div v-else-if="formData.clientId === ''" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
    <p class="text-sm text-blue-700 dark:text-blue-300">
      Creating a generic brief without client context. Client-specific research will be skipped.
    </p>
  </div>
</div>
```

## Backend Considerations

When processing a content brief without a client association:

1. Skip client-specific research steps:
   - Domain-specific searches
   - Competitor analysis
   - Brand-specific content guidelines

2. Focus more heavily on:
   - General topic research
   - Industry-standard practices
   - Keyword-focused content structure

3. Modify the edge function to handle the null client case gracefully:
   - Include conditional logic for client-specific processing
   - Use default values for required parameters that would normally come from client data

## Future Enhancements

- Recently used clients list for quick selection
- Ability to save "favorite" clients
- Client grouping/categorization in the dropdown
- Client quick-create option within the brief generator interface