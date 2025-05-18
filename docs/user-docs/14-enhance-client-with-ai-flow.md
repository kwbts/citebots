# Enhance Client with AI Flow

## Overview
This document describes how users can enhance client profiles using AI to generate descriptions and keywords in the Citebots application.

## Pre-requisites
- User must be logged in
- User must be creating or editing a client
- Client must have at least name and domain filled

## User Journey
1. User is on create/edit client form
2. User enters client name and domain
3. User clicks "Enhance with AI" button
4. System generates description and keywords
5. User reviews and can edit suggestions
6. User saves the enhanced client profile

## Expected Behavior

### Visual Flow
1. Initial form state:
   - Name field (filled)
   - Domain field (filled)
   - Keywords field (empty or existing)
   - Description field (empty or existing)
   - "Enhance with AI" button (enabled)

2. During enhancement:
   - Loading spinner on button
   - "Enhancing..." message
   - Form fields disabled
   - Other buttons disabled

3. After enhancement:
   - Description field populated
   - Keywords field populated
   - Success message briefly shown
   - Form fields enabled again
   - User can edit suggestions

4. On error:
   - Error message appears
   - Original values preserved
   - User can retry

## Database Operations

### Edge Function Call
Request to enhance-client-with-ai:
```javascript
{
  clientName: "Example Corp",
  domain: "example.com",
  existingKeywords: ["seo"], // if any
  existingDescription: "..." // if any
}
```

### AI Response Structure
```javascript
{
  description: "Example Corp is a leading provider of innovative solutions in the technology sector, specializing in cloud services and digital transformation.",
  keywords: [
    "cloud services",
    "digital transformation",
    "technology solutions",
    "enterprise software",
    "IT consulting"
  ],
  confidence: 0.85
}
```

### Update Operation
```sql
UPDATE clients 
SET description = 'AI generated description',
    keywords = '["keyword1", "keyword2", ...]',
    updated_at = current_timestamp
WHERE id = 'client-uuid'
```

## Test Scenarios

### New Client Enhancement
1. Create new client
2. Fill name: "Tech Startup"
3. Fill domain: "techstartup.io"
4. Click Enhance with AI
5. Expected: Relevant description and keywords

### Existing Client Enhancement
1. Edit client with existing data
2. Click Enhance with AI
3. Expected: AI considers existing content

### Domain Analysis
1. Enter specific domain
2. Expected: AI analyzes website content
3. Keywords reflect actual site content

### AI Service Error
1. Simulate AI API failure
2. Expected: Graceful error handling
3. Form remains usable

### Manual Override
1. Get AI suggestions
2. Edit them manually
3. Save modified version
4. Expected: Manual edits preserved

## Technical Details
- Uses OpenAI/Claude for generation
- May web scrape domain for context
- Considers existing content
- Non-destructive (user can edit)
- No automatic save (user controls)
- Rate limited to prevent abuse