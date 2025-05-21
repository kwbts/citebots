# Query Data Enhancement Plan

## Current Issues Identified

1. **Missing Metadata Fields**: Many queries are returning null or blank values for critical fields like:
   - query_category
   - query_topic
   - query_type
   - response_match
   - response_outcome
   - brand_mention_type
   - competitor_context
   - action_orientation
   - query_competition

2. **Integration Issues**: The enhanced metadata extraction system is not fully integrated into the main execution flow.

3. **Structure Issues**: The data structure returned by execute-query doesn't match what process-query expects.

## Enhancement Strategy

### 1. Edge Function Changes

#### A. Enhanced Metadata Integration

1. Update the `execute-query/index.ts` function to use the enhanced metadata extraction:

```typescript
// Import enhanced metadata functions
import { extractEnhancedQueryMetadata, analyzeCompetitorMentionsEnhanced } from './enhanced-metadata';

// Replace existing metadata extraction with enhanced version
const metadata = await extractEnhancedQueryMetadata(query_text, response, query_intent, brand_name, competitors);

// Replace competitor analysis with enhanced version
const competitorAnalysis = await analyzeCompetitorMentionsEnhanced(
  response,
  brand_name,
  brand_domain,
  competitors,
  citations
);
```

2. Ensure all required fields from the data model are explicitly included in the result object:

```typescript
// Create comprehensive result object with all fields explicitly defined
const result = {
  query_text,
  keyword,
  query_intent,
  platform,
  response_content: response,
  citations,
  citation_count: citations.length,
  
  // Brand data
  brand_mention: competitorAnalysis.brand_mention_type !== 'none',
  brand_mention_count: competitorAnalysis.brand_mention_count || 0,
  brand_sentiment: brandSentiment || 0,
  brand_mention_type: competitorAnalysis.brand_mention_type || 'none',
  brand_positioning: competitorAnalysis.brand_positioning || 'none',
  
  // Competitor data
  competitor_mentions: competitorAnalysis.competitors_mentioned || [],
  competitor_mentioned_names: competitorAnalysis.competitor_names || [],
  competitor_count: (competitorAnalysis.competitor_names || []).length,
  total_competitor_mentions: competitorAnalysis.total_competitor_mentions || 0,
  competitor_context: competitorAnalysis.competitor_context || 'none',
  competitor_analysis: competitorAnalysis,
  
  // Query metadata
  query_category: metadata.query_category || 'general',
  query_topic: metadata.query_topic || 'general',
  query_type: metadata.query_type || 'informational',
  funnel_stage: metadata.funnel_stage || 'awareness',
  query_complexity: metadata.query_complexity || 'simple',
  
  // Response metadata
  response_match: metadata.response_match || 'direct',
  response_outcome: metadata.response_outcome || 'answer',
  action_orientation: metadata.action_orientation || 'medium',
  query_competition: metadata.query_competition || 'opportunity',
  
  // Timestamps
  timestamp: new Date().toISOString()
};
```

#### B. Process Queue Worker Update

Update the process-queue-worker to correctly handle and preserve all fields from execute-query:

```typescript
// Correctly extract the result data from the structure returned by execute-query
const queryData = executeResult.result || {};

// Make sure we preserve ALL fields in the analysis_queries table update
await supabase
  .from('analysis_queries')
  .update({
    query_text: queryData.query_text,
    query_keyword: queryData.keyword,
    query_category: queryData.query_category,
    query_topic: queryData.query_topic,
    query_type: queryData.query_type,
    query_intent: queryData.query_intent,
    funnel_stage: queryData.funnel_stage,
    query_complexity: queryData.query_complexity,
    data_source: queryData.platform,
    model_response: queryData.response_content,
    citation_count: queryData.citation_count || 0,
    brand_mentioned: queryData.brand_mention || false,
    brand_sentiment: queryData.brand_sentiment || 0,
    competitor_mentioned_names: queryData.competitor_mentioned_names || [],
    competitor_count: queryData.competitor_count || 0,
    response_match: queryData.response_match,
    response_outcome: queryData.response_outcome,
    brand_mention_type: queryData.brand_mention_type,
    competitor_context: queryData.competitor_context,
    action_orientation: queryData.action_orientation,
    query_competition: queryData.query_competition,
    brand_mention_count: queryData.brand_mention_count || 0,
    competitor_analysis: queryData.competitor_analysis || null,
    brand_positioning: queryData.brand_positioning || 'none',
    total_competitor_mentions: queryData.total_competitor_mentions || 0,
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', queryRecord.id);
```

### 2. Enhanced Metadata Extraction

Update the enhanced-metadata.ts file to use GPT-4 for better classification:

```typescript
async function extractEnhancedQueryMetadata(query: string, response: string, intent: string, brandName: string, competitors: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return getDefaultMetadata(query, intent);
  }

  // Prepare competitor list for context
  const competitorList = Array.isArray(competitors) ? competitors.map(c => c.name).join(', ') : '';
  
  // Create a comprehensive prompt for better metadata extraction
  const prompt = `
Analyze this search query and AI response to extract comprehensive metadata.

Query: "${query}"
Response: "${response.substring(0, 1500)}..."
Brand: "${brandName}"
Competitors: "${competitorList}"

Provide a detailed analysis in JSON format with the following fields:

{
  "query_category": "Choose EXACTLY one: general/product/service/comparison/troubleshooting/educational/pricing/features/reviews",
  "query_topic": "Specific topic in 2-4 words",
  "query_type": "Choose EXACTLY one: informational/navigational/transactional/commercial/investigational",
  "funnel_stage": "Choose EXACTLY one: awareness/consideration/decision/retention/advocacy",
  "query_complexity": "Choose EXACTLY one: simple/moderate/complex/sophisticated",
  "response_match": "Choose EXACTLY one: direct/partial/tangential/comprehensive/inadequate",
  "response_outcome": "Choose EXACTLY one: answer/recommendation/comparison/explanation/guide/referral",
  "action_orientation": "Choose EXACTLY one: high/medium/low/none",
  "query_competition": "Choose EXACTLY one: high/moderate/low/opportunity/niche",
  "brand_relevance": "Choose EXACTLY one: central/mentioned/tangential/absent",
  "competitor_context": "Choose EXACTLY one: comparative/listed/exclusive/alternative/leader/follower/none"
}

Be specific, precise and accurate. All fields are REQUIRED.`;

  try {
    // Use GPT-4 for better classification
    const metadataResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Use the most capable model
        messages: [
          {
            role: 'system',
            content: 'You are an expert in query analysis and SEO metadata extraction. Provide precise categorization based on the content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,  // Lower temperature for more consistent results
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (metadataResponse.ok) {
      const data = await metadataResponse.json();
      const metadata = JSON.parse(data.choices[0].message.content);
      
      console.log('Enhanced metadata extraction result:', JSON.stringify(metadata, null, 2));
      
      // Return with fallbacks to ensure all fields are present
      return {
        query_category: metadata.query_category || 'general',
        query_topic: metadata.query_topic || 'general',
        query_type: metadata.query_type || 'informational',
        funnel_stage: metadata.funnel_stage || 'awareness',
        query_complexity: metadata.query_complexity || 'simple',
        response_match: metadata.response_match || 'direct',
        response_outcome: metadata.response_outcome || 'answer',
        action_orientation: metadata.action_orientation || 'medium',
        query_competition: metadata.query_competition || 'opportunity',
        brand_relevance: metadata.brand_relevance || 'absent',
        competitor_context: metadata.competitor_context || 'none'
      };
    }
  } catch (error) {
    console.error('Error extracting enhanced metadata:', error);
  }

  return getDefaultMetadata(query, intent);
}
```

### 3. Competitor Analysis Enhancement

Update the competitor analysis function to include proper positioning and competitive context:

```typescript
async function analyzeCompetitorMentionsEnhanced(response: string, brandName: string, brandDomain: string, competitors: any[], citations: any[]) {
  // Only use GPT-4 if API key is available
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Prepare competitor data
  const competitorAnalysis = [];
  const mentionedCompetitors = new Set<string>();
  
  // Check citations first
  const citationsList = Array.isArray(citations) ? citations : [];
  for (const citation of citationsList) {
    if (!citation || !citation.domain) continue;
    
    const domain = citation.domain.toLowerCase();
    
    // Check for brand domain
    if (domain.includes(brandDomain.toLowerCase())) {
      // Brand citation found
    }
    
    // Check for competitor domains
    const competitorsList = Array.isArray(competitors) ? competitors : [];
    for (const comp of competitorsList) {
      if (!comp || !comp.domain) continue;
      
      const compDomain = comp.domain.toLowerCase();
      if (domain.includes(compDomain)) {
        mentionedCompetitors.add(comp.name);
      }
    }
  }
  
  // If we have an API key, use GPT-4 for detailed analysis
  if (apiKey) {
    try {
      const competitorNames = Array.isArray(competitors) ? competitors.map(c => c.name).join(', ') : '';
      
      const prompt = `
Analyze this response for brand and competitor mentions:

Response: "${response.substring(0, 1500)}..."
Brand: "${brandName}"
Competitors: ${competitorNames}

Provide analysis in JSON format:
{
  "brand_mentions": {
    "direct_mentions": number of times brand is mentioned directly,
    "indirect_mentions": number of implied references,
    "mention_context": "positive/neutral/negative/mixed",
    "sentiment_score": -1 to 1,
    "prominence": "primary/secondary/minimal/none"
  },
  "competitor_mentions": [
    {
      "name": "competitor name",
      "mention_count": number of mentions,
      "context": "comparison/alternative/referenced/featured",
      "sentiment": "positive/neutral/negative",
      "relative_position": "superior/equal/inferior/unclear"
    }
  ],
  "overall_competitive_landscape": "brand-favorable/competitor-favorable/neutral/mixed",
  "recommendation_strength": "strong/moderate/weak/none",
  "market_positioning": "leader/challenger/niche/unclear"
}`;

      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in competitive analysis and brand sentiment analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 600,
          response_format: { type: 'json_object' }
        })
      });

      if (analysisResponse.ok) {
        const data = await analysisResponse.json();
        const analysis = JSON.parse(data.choices[0].message.content);
        
        console.log('Enhanced competitor analysis result:', JSON.stringify(analysis, null, 2));
        
        return {
          brand_mention_type: analysis.brand_mentions.prominence || 'none',
          brand_mention_count: analysis.brand_mentions.direct_mentions + analysis.brand_mentions.indirect_mentions || 0,
          brand_sentiment: analysis.brand_mentions.sentiment_score || 0,
          competitors_mentioned: analysis.competitor_mentions.map((c: any) => ({
            name: c.name,
            mentions: c.mention_count || 1,
            type: c.context || 'mentioned',
            sentiment: c.sentiment || 'neutral',
            position: c.relative_position || 'unclear'
          })),
          competitor_names: analysis.competitor_mentions.map((c: any) => c.name),
          overall_landscape: analysis.overall_competitive_landscape || 'neutral',
          recommendation_strength: analysis.recommendation_strength || 'none',
          brand_positioning: analysis.market_positioning || 'unclear',
          competitor_context: analysis.competitor_mentions.length > 0 ? analysis.competitor_mentions[0].context : 'none',
          total_competitor_mentions: analysis.competitor_mentions.reduce((sum: number, c: any) => sum + c.mention_count, 0)
        };
      }
    } catch (error) {
      console.error('Error in enhanced competitor analysis:', error);
    }
  }
  
  // Fallback to basic analysis if GPT-4 fails
  const responseLower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const brandMentionCount = (response.match(new RegExp(brandLower, 'gi')) || []).length;
  
  // Determine brand mention type
  let brandMentionType = 'none';
  if (brandMentionCount > 0) {
    brandMentionType = brandMentionCount > 3 ? 'primary' : 'secondary';
  }
  
  return {
    brand_mention_type: brandMentionType,
    brand_mention_count: brandMentionCount,
    brand_sentiment: 0,
    competitors_mentioned: Array.from(mentionedCompetitors).map(name => ({
      name,
      mentions: 1,
      type: 'mentioned',
      sentiment: 'neutral',
      position: 'unclear'
    })),
    competitor_names: Array.from(mentionedCompetitors),
    overall_landscape: 'neutral',
    recommendation_strength: 'none',
    brand_positioning: 'unclear',
    competitor_context: mentionedCompetitors.size > 0 ? 'mentioned' : 'none',
    total_competitor_mentions: mentionedCompetitors.size
  };
}
```

## Deployment Instructions

1. **Update Enhanced Metadata File**:
   ```bash
   # Deploy the enhanced-metadata.ts file
   cp /path/to/your/updated/enhanced-metadata.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/execute-query/enhanced-metadata.ts
   ```

2. **Update Execute Query Function**:
   ```bash
   # Update the execute-query function
   cp /path/to/your/updated/execute-query.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/execute-query/index.ts
   
   # Deploy the function
   npx supabase functions deploy execute-query --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
   ```

3. **Update Process Queue Worker**:
   ```bash
   # Update the process-queue-worker function
   cp /path/to/your/updated/process-queue-worker.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/process-queue-worker/index.ts
   
   # Deploy the function
   npx supabase functions deploy process-queue-worker --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
   ```

## Testing

After deploying the changes, test the system with various queries to ensure:

1. All metadata fields are properly populated
2. Brand and competitor data is accurately extracted
3. The response contains all required fields as defined in the data model

## Monitoring

Monitor the function logs for any errors:

```bash
npx supabase functions logs execute-query --project-ref trmaeodthlywcjwfzdka
npx supabase functions logs process-queue-worker --project-ref trmaeodthlywcjwfzdka
```

Monitor the database for data quality:

```sql
-- Check for missing data in recent queries
SELECT id, query_text, query_category, query_topic, query_type, response_match, response_outcome
FROM analysis_queries
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;
```