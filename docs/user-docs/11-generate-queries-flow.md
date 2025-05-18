# Generate Queries Flow

## Overview
This document describes how users generate analysis queries from client keywords in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have at least one client with keywords
- User navigates to analysis section

## User Journey
1. User clicks "Analysis" card in dashboard
2. User selects a client from dropdown
3. User clicks "Generate Queries" button
4. System generates queries from keywords
5. User reviews generated queries
6. User can proceed to run analysis

## Expected Behavior

### Visual Flow
1. Analysis page shows:
   - Client selection dropdown
   - Selected client's keywords displayed
   - "Generate Queries" button
   - Empty queries area

2. During generation:
   - Loading spinner
   - "Generating queries..." message
   - Button disabled

3. After generation:
   - List of generated queries appears
   - Each query shows:
     - Query text
     - Intent type (informational, commercial, etc.)
     - Toggle to include/exclude
   - "Run Analysis" button becomes available

4. On error:
   - Error message
   - Option to retry
   - Keywords remain visible

## Database Operations

### Edge Function Call
Request to generate-queries edge function:
```javascript
{
  clientId: "client-uuid",
  keywords: ["seo", "marketing", "optimization"],
  intents: ["informational", "commercial", "navigational"]
}
```

### Generated Data Structure
```javascript
{
  queries: [
    {
      text: "what is seo marketing",
      intent: "informational",
      keywords: ["seo", "marketing"],
      included: true
    },
    {
      text: "best seo optimization services",
      intent: "commercial",
      keywords: ["seo", "optimization"],
      included: true
    }
  ],
  totalCount: 10,
  generatedAt: "2024-01-15T10:00:00Z"
}
```

## Test Scenarios

### Normal Generation
1. Select client with 3-5 keywords
2. Click Generate Queries
3. Expected: 10-20 queries generated

### No Keywords
1. Select client without keywords
2. Expected: Message to add keywords first

### Large Keyword Set
1. Client with 20+ keywords
2. Expected: Appropriate number of queries

### AI Service Error
1. Simulate AI service failure
2. Expected: Friendly error message

### Empty Response
1. AI returns no queries
2. Expected: "No queries generated" message

## Technical Details
- Uses OpenAI/Claude for generation
- Queries based on keyword combinations
- Intent classification included
- No permanent storage until analysis run
- Session/temporary storage for preview