# Testing Enhanced Metadata Extraction

## Step 1: Update Database Schema

Run this SQL to add the new metadata columns:

```bash
npx supabase db remote open
```

Then execute the SQL in `/scripts/update-execute-query-metadata.sql`

## Step 2: Update Edge Function

Update the execute-query function to use enhanced metadata extraction:

1. Replace the `extractQueryMetadata` function with `extractEnhancedQueryMetadata`
2. Replace the `analyzeCompetitorMentions` function with `analyzeCompetitorMentionsEnhanced`
3. Update the result object to include new metadata fields

## Step 3: Test Query

Create a test query to verify metadata extraction:

```javascript
{
  "query_text": "How does Bridgit's workforce intelligence compare to other construction software?",
  "keyword": "construction workforce software comparison",
  "query_intent": "comparison",
  "platform": "chatgpt",
  "brand_name": "Bridgit",
  "brand_domain": "bridgit.com",
  "competitors": [
    {
      "name": "Procore",
      "domain": "procore.com"
    },
    {
      "name": "PlanGrid",
      "domain": "plangrid.com"
    }
  ]
}
```

## Step 4: Verify Results

Check that the following metadata fields are populated:

### Standard Fields
- query_category
- query_topic
- query_type
- funnel_stage
- query_complexity
- response_match
- response_outcome
- action_orientation
- query_competition

### Enhanced Fields
- content_depth
- commercial_intent
- brand_relevance
- user_sophistication
- urgency_level
- solution_focus
- industry_specificity
- geographic_relevance
- temporal_context

### Competitive Analysis
- brand_mention_type
- brand_mention_count
- brand_sentiment
- competitor_mentioned_names
- overall_competitive_landscape
- recommendation_strength
- market_positioning

## Step 5: Database Query

Check results with:

```sql
SELECT 
    query_text,
    query_category,
    query_topic,
    query_type,
    funnel_stage,
    content_depth,
    commercial_intent,
    brand_relevance,
    overall_competitive_landscape
FROM public.analysis_queries
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;
```

## Expected Improvements

1. **Better Categorization**: More nuanced query categories
2. **Richer Topics**: Specific topics instead of "general"
3. **Funnel Stage Accuracy**: Better mapping to buyer journey
4. **Competition Analysis**: Detailed competitive landscape
5. **Commercial Intent**: Understanding purchase readiness
6. **Content Depth**: Quality assessment of responses

## Troubleshooting

If metadata is still empty:

1. Check edge function logs for errors
2. Verify OpenAI API key is set
3. Check GPT-4 API access (may need GPT-3.5 fallback)
4. Review prompt format and JSON parsing
5. Add more detailed logging to debug