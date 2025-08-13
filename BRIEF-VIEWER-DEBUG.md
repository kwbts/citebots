# Brief Viewer Debugging Guide

If you're having issues viewing briefs in the Citebots application, follow these steps to diagnose and fix the problem.

## Quick Start

1. **Check available briefs**
   Run the diagnostic script to see what briefs exist in your database:
   ```
   node check-briefs.js
   ```
   This will list all briefs and their IDs.

2. **Use the new debug viewer**
   Visit the new debug viewer page to directly access briefs:
   ```
   http://localhost:3000/dashboard/actions/content-brief/debug-view
   ```
   This page allows you to view briefs directly from Supabase without relying on complex routing.

3. **Use the standard debug page**
   Visit the debug page to inspect briefs:
   ```
   http://localhost:3000/dashboard/actions/content-brief/debug
   ```
   This page allows you to view briefs directly from Supabase without any complex UI.

4. **Try the simplified viewer**
   A simplified version of the brief viewer is available at:
   ```
   http://localhost:3000/dashboard/actions/content-brief/view/simple?id=YOUR_BRIEF_ID
   ```
   Replace `YOUR_BRIEF_ID` with an actual brief ID from step 1.

## Recent Updates

I've added a new debug viewer that should help address routing issues:

- **Direct Database Access**: The new debug viewer connects directly to Supabase
- **Simple Interface**: Input your brief ID and view the formatted brief
- **Raw Data View**: Toggle to see the raw JSON data for debugging
- **No Routing Dependencies**: Bypasses the dynamic route handlers that might be causing issues

## Common Issues

### 1. Brief Not Found

If you're getting "Brief not found" errors:
- Verify the brief ID is correct
- Check if you have access to the brief (RLS policies)
- Make sure the content_briefs table exists in your database

### 2. Content Missing

If the brief loads but content is missing:
- Check if the `content` field in the database is populated
- Verify the content structure matches what the frontend expects
- Try regenerating the brief

### 3. Authentication Issues

If you're being redirected to login:
- Make sure you're logged in
- Check your RLS policies

### 4. Routing Issues

If you're having issues with the dynamic routes:
- Try using the new debug viewer instead
- Check the browser console for routing errors
- Make sure you've restarted your Nuxt dev server after config changes

## Technical Details

### Content Brief Structure

A content brief should have this structure in the database:

```json
{
  "id": "uuid",
  "title": "string",
  "keywords": ["string"],
  "status": "string",
  "content": {
    "summary": "string",
    "content_suggestions": [{
      "suggestion": "string",
      "rationale": "string",
      "importance": number
    }],
    "table_of_contents": [{
      "title": "string",
      "points": ["string"]
    }],
    "research_links": [{
      "title": "string",
      "url": "string",
      "description": "string",
      "source_type": "string"
    }]
  }
}
```

### Implementation Approaches

The system now provides four different ways to view briefs:

1. **Standard View** (`/dashboard/actions/content-brief/view/[id].vue`)
   - Full-featured view with tabs and formatting
   - Gets data directly from Supabase

2. **Simple View** (`/dashboard/actions/content-brief/view/simple.vue`)
   - Minimal implementation with direct Supabase access
   - Useful for troubleshooting

3. **Debug View** (`/dashboard/actions/content-brief/debug.vue`)
   - Diagnostic tool for inspecting brief data
   - Shows raw database content

4. **New Debug Viewer** (`/dashboard/actions/content-brief/debug-view.vue`)
   - Enhanced debugging tool with formatted display
   - Direct Supabase access without routing dependencies
   - Includes raw data view option

### API-Free Implementation

The current implementation avoids using the local API server by accessing Supabase directly from the frontend. This eliminates the need to run the local server for viewing briefs.

If you prefer using the API server:
1. Start the server: `cd local-server/brief-generator && node server.js`
2. Edit `useBriefGenerator.ts` to use the API