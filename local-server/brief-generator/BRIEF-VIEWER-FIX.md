# Brief Viewer Connectivity Fix

This document outlines the changes made to fix the brief viewer connectivity issues.

## Issue Summary

The brief viewer page (`/dashboard/actions/content-brief/view/[id].vue`) was unable to load brief data. The primary issues were:

1. **Dynamic Route Problems**: The `[id].vue` pattern doesn't work well in static site deployments
2. **Connection Problems**: The frontend couldn't connect to the local API server
3. **API Endpoint Mismatches**: Missing endpoints in the server implementation
4. **Error Handling**: Insufficient error handling in API requests
5. **Data Structure Mismatch**: Differences between expected and actual data formats

## Solution Implemented

### 1. New Query Parameter Based Approach

The main solution is switching from path parameters to query parameters:

```
OLD: /dashboard/actions/content-brief/view/123e4567-e89b-12d3-a456-426614174000
NEW: /dashboard/actions/content-brief/view-brief?id=123e4567-e89b-12d3-a456-426614174000
```

Key files:
- `/dashboard/actions/content-brief/view-brief.vue`: New main viewer using query parameters
- `/dashboard/actions/content-brief/view-redirect.vue`: Redirects legacy URLs to new format
- `/dashboard/actions/content-brief/view/index.vue`: Redirects to debug page

### 2. Enhanced useBriefGenerator.ts Composable

The `useBriefGenerator.ts` composable has been modified to:

- Use a hardcoded API URL for local development to avoid environment variable issues
- Add a fallback mechanism to retrieve data directly from Supabase if the API server is unavailable
- Improve error handling with better error messages and text parsing
- Format data consistently across both API and Supabase data sources
- Add debugging capabilities with a DEBUG_API flag

Key changes:

```typescript
// Hardcoded API URL for reliability
const apiUrl = 'http://localhost:3001';

// Debug flag for detailed logging
const DEBUG_API = true;

// Fallback to Supabase if API server fails
try {
  // Try API server first
  // ...
} catch (apiError) {
  // Fall back to direct Supabase fetch
  const { data: brief, error: supabaseError } = await supabase
    .from('content_briefs')
    .select('*')
    .eq('id', id)
    .single();
  
  // Format data to match expected structure
  // ...
}
```

### 3. Enhanced Brief Viewer Page

The new brief viewer page (`view-brief.vue`) has been enhanced with:

- Uses query parameter (`?id=xyz`) instead of path parameter
- Direct Supabase access for data retrieval
- A debug panel that appears when loading issues are detected
- Connectivity status indicators for Supabase
- Detailed error information and troubleshooting guidance
- Fallback content when certain sections are missing

### 4. Diagnostic and Testing Tools

New utility pages and scripts:

- `debug.vue`: A page to browse and inspect all available briefs
- `check-briefs.js`: Checks for briefs in the database and their structure
- `view-all-briefs.js`: Interactive tool to browse and inspect briefs
- `test-cors.js` + `cors-test.html`: Test CORS and API connectivity from browser
- `start-server.sh`: Script to verify environment setup and start the server

### 5. HTML Export Fallback

Added a fallback HTML export option when the export server endpoint is unavailable:

```typescript
// If API server is down, use a fallback approach
const content = formatBriefAsHtml(brief.value);
const blob = new Blob([content], {type: 'text/html'});
const url = URL.createObjectURL(blob);
window.open(url, '_blank');
```

## How to Use

### Viewing a Brief

1. Go to `/dashboard/actions/content-brief/view-brief?id=YOUR_BRIEF_ID`
2. The page will load the brief directly from Supabase
3. You can navigate through the tabs to see different sections of the brief

### Finding Available Briefs

1. Go to `/dashboard/actions/content-brief/debug`
2. This page lists all briefs available in the database
3. Click "View" to load a specific brief in the viewer

### Creating a New Brief

1. Go to `/dashboard/actions/content-brief`
2. Fill out the form and submit
3. You'll be automatically redirected to the viewer page with your new brief

## Testing the Solution

### Verifying Connectivity

1. Start the local server (optional, as direct Supabase access works without it):
   ```bash
   cd /Users/jontaylor/Documents/kb-citebots/local-server/brief-generator
   ./start-server.sh
   ```

2. Access the brief viewer in the frontend:
   ```
   http://localhost:3000/dashboard/actions/content-brief/view-brief?id=[brief-id]
   ```

3. Check browser console for debugging information

### Testing Different Scenarios

- **Local server working**: Brief should load via API with fallback to Supabase if needed
- **Local server down**: Brief should load directly from Supabase
- **Brief not found**: Error should be displayed with helpful debug information
- **Export function**: Should work even if export endpoint is missing by using HTML fallback

## Future Improvements

1. **Environment Variable Consistency**: Add BRIEF_GENERATOR_API_URL to Nuxt config
2. **Server Implementation**: Add missing endpoints like `/brief/:id/status`
3. **Authentication**: Implement proper JWT validation in the server
4. **PDF/DOCX Export**: Implement proper document export endpoints
5. **Client Information**: Enhance client information when displaying briefs for better context

## Conclusion

The implemented solution ensures briefs can be viewed reliably in a static site deployment by:
1. Using query parameters instead of path parameters
2. Accessing Supabase directly for data
3. Providing proper error handling and fallbacks
4. Adding comprehensive debug tools