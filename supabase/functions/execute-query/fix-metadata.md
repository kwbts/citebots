# Fix Metadata Extraction in Execute-Query

## Problem
The current metadata extraction is returning empty/default values for most fields.

## Immediate Fix

Update the `extractQueryMetadata` function to:

1. Use a more structured prompt
2. Add better error handling
3. Log the responses for debugging
4. Use GPT-3.5 with clear instructions

## Updated Function

```typescript
async function extractQueryMetadata(query: string, response: string, intent: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    console.log('No OpenAI API key, using defaults')
    return getDefaultMetadata(query, intent)
  }

  // Truncate response if too long (prevent token limits)
  const truncatedResponse = response.length > 2000 ? response.substring(0, 2000) + '...' : response

  const prompt = `
Analyze this query and its AI response. Return a JSON object with these exact fields and values.

Query: "${query}"
Response excerpt: "${truncatedResponse}"

Required JSON structure (use ONLY the specified values for each field):
{
  "query_category": Choose one: "general", "product", "service", "comparison", "troubleshooting", "educational"
  "query_topic": The main topic in 2-3 words (e.g., "workforce management", "construction software")
  "query_type": Choose one: "informational", "navigational", "transactional", "commercial"
  "funnel_stage": Choose one: "awareness", "consideration", "decision", "retention"
  "query_complexity": Choose one: "simple", "moderate", "complex"
  "response_match": Choose one: "direct", "partial", "tangential"
  "response_outcome": Choose one: "answer", "recommendation", "comparison", "explanation"
  "action_orientation": Choose one: "high", "medium", "low", "none"
  "query_competition": Choose one: "high", "moderate", "low", "opportunity"
}

Return ONLY the JSON object with these exact fields.`

  try {
    console.log('Extracting metadata for query:', query)
    
    const metadataResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a metadata extraction assistant. Return only valid JSON with the exact fields requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    if (metadataResponse.ok) {
      const data = await metadataResponse.json()
      const metadata = JSON.parse(data.choices[0].message.content)
      
      console.log('Extracted metadata:', metadata)
      
      // Validate required fields
      const requiredFields = [
        'query_category', 'query_topic', 'query_type', 'funnel_stage',
        'query_complexity', 'response_match', 'response_outcome',
        'action_orientation', 'query_competition'
      ]
      
      for (const field of requiredFields) {
        if (!metadata[field]) {
          console.warn(`Missing field ${field}, using default`)
          metadata[field] = getDefaultMetadata(query, intent)[field]
        }
      }
      
      return metadata
    } else {
      console.error('Metadata extraction failed:', await metadataResponse.text())
    }
  } catch (error) {
    console.error('Error extracting metadata:', error)
  }

  return getDefaultMetadata(query, intent)
}
```

## Key Changes

1. **Clearer prompt structure** with exact field values
2. **Response truncation** to avoid token limits
3. **Better error logging** to debug issues
4. **Field validation** to ensure all required fields exist
5. **Specific instructions** for JSON-only output

## Testing

After deployment, check logs:
```bash
npx supabase functions logs execute-query --scroll
```

Look for:
- "Extracting metadata for query:"
- "Extracted metadata:"
- Any error messages

## Deployment

1. Update the function in execute-query/index.ts
2. Deploy: `npx supabase functions deploy execute-query --no-verify-jwt`
3. Run a test query
4. Check logs and database for populated metadata