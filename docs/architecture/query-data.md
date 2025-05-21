# Query Data Fields Reference

This document provides a comprehensive reference for all fields in the Query data model. Each field is explained with its format, type, and description.

| Field | Format | Type | Description |
|-------|--------|------|-------------|
| `id` | uuid | string | Unique identifier for this specific query analysis record |
| `analysis_run_id` | uuid | string | ID of the analysis batch run that generated this query data |
| `query_id` | text | string | Unique identifier for the query (platform prefix + uuid) |
| `query_text` | text | string | The full text of the query sent to the AI model |
| `query_keyword` | text | string | The main keyword extracted from or associated with the query |
| `query_category` | text | string | Category classification of the query (e.g., "Marketing Technology", "Software") |
| `query_topic` | text | string | Specific topic area of the query (e.g., "Email Marketing", "Construction Software") |
| `query_type` | text | string | Classification of query format or structure (question, command, research, etc.) |
| `query_intent` | text | string | User's underlying purpose or goal (informational, navigational, etc.) |
| `funnel_stage` | text | string | Marketing funnel position (awareness, consideration, decision, retention) |
| `query_complexity` | text | string | Assessment of query complexity (simple, moderate, complex) |
| `data_source` | text | string | Platform that generated the response ("chatgpt", "perplexity") |
| `model_response` | text | string | Full text response from the AI model |
| `citation_count` | integer | number | Total number of citations found in the model response |
| `brand_mentioned` | boolean | boolean | Whether the client's brand is mentioned in the response (true/false) |
| `brand_sentiment` | double precision | number | Sentiment score for brand mentions (-1.0 to 1.0) |
| `competitor_mentioned_names` | text[] | array | List of competitor brand names mentioned in the response |
| `competitor_count` | integer | number | Count of unique competitors mentioned in the response |
| `associated_pages_count` | integer | number | Number of crawled web pages associated with this query |
| `response_match` | text | string | How well the response aligns with the query intent (direct, partial, tangential, etc.) |
| `response_outcome` | text | string | Primary type of content provided in the response (information, recommendation, etc.) |
| `brand_mention_type` | text | string | How the brand is mentioned in the response (primary, secondary, implicit, etc.) |
| `competitor_context` | text | string | Context of competitor mentions relative to the brand (comparative, listed, exclusive, etc.) |
| `action_orientation` | text | string | Degree to which response encourages user actions (passive, suggestive, directive, etc.) |
| `query_competition` | text | string | Competitive position based on brand and competitor mentions (defending, opportunity, competitive, competitor advantage) |
| `status` | text | string | Processing status of the query (pending, in_progress, completed, error) |
| `created_at` | timestamp with time zone | string | When the query was created in ISO format |
| `completed_at` | timestamp with time zone | string | When query processing completed in ISO format |
| `error_message` | text | string | Error message if query processing failed |
| `brand_mention_count` | integer | number | Number of times the brand is mentioned in the response |
| `competitor_analysis` | jsonb | json | Detailed analysis of competitor mentions and comparisons |
| `brand_positioning` | text | string | How the brand is positioned relative to competitors (leader, contender, niche, etc.) |
| `total_competitor_mentions` | integer | number | Total count of all competitor mentions across all competitors |
| `associated_pages` | jsonb | json | Array of page analysis objects linked to this query |

## Field Value Constraints

### Status Values
- `pending`: Query is queued but not yet processed
- `in_progress`: Query is currently being processed
- `completed`: Query has been successfully processed
- `error`: Query processing failed with error

### Query Type Values
- `question`: Direct questions seeking information
- `command`: Instructional queries requesting specific actions
- `research`: In-depth information seeking
- `conversational`: Natural language, informal queries
- `comparison`: Direct comparisons between options
- `definition`: Requests for term definitions
- `how_to`: Process or method inquiries
- `example`: Requests for specific examples

### Query Intent Values
- `informational`: Seeking general knowledge
- `navigational`: Looking for a specific website/resource
- `transactional`: Intent to take an action (purchase, download)
- `commercial`: Researching before a purchase decision
- `local`: Seeking location-specific information
- `support`: Looking for help with a problem
- `educational`: Seeking to learn about a topic in depth
- `opinion`: Looking for subjective views or recommendations

### Funnel Stage Values
- `awareness`: Top of funnel - becoming aware of solutions
- `consideration`: Middle of funnel - comparing options
- `decision`: Bottom of funnel - ready to purchase
- `retention`: Post-purchase engagement

### Response Match Values
- `direct`: Provides exactly what was asked for
- `partial`: Addresses some aspects of the query
- `tangential`: Related but not directly addressing the query
- `misaligned`: Doesn't properly understand or address the query
- `over_delivery`: Provides more information than requested
- `under_delivery`: Provides less information than requested
- `reformulated`: Responds to a reinterpreted version of the query
- `clarification`: Asks for more information instead of answering

### Response Outcome Values
- `information`: Factual data or explanation
- `recommendation`: Specific suggestions or advice
- `product_mention`: Referenced specific products/services
- `service_suggestion`: Suggested professional services
- `procedural`: Step-by-step instructions
- `comparative`: Side-by-side evaluation
- `resource_list`: Collection of resources or tools
- `referral`: Suggestion to consult elsewhere
- `educational`: Conceptual teaching or explanation
- `mixed`: Combination of multiple outcomes

### Brand Mention Type Values
- `primary`: Brand is the main subject of the response
- `secondary`: Brand mentioned among others but not as the focus
- `implicit`: Brand concepts/products mentioned without explicitly naming the brand
- `featured`: Brand is highlighted or given prominence
- `none`: No brand mention detected

### Competitor Context Values
- `comparative`: Directly compared to competitors (strengths/weaknesses)
- `listed`: Mentioned in a list with competitors without detailed comparison
- `exclusive`: Mentioned without any competitors in the same context
- `alternative`: Mentioned as an alternative to another solution
- `leader`: Positioned as a market leader or best-in-class
- `follower`: Positioned as secondary to competitor solutions
- `none`: No competitive context established

### Action Orientation Values
- `passive`: Information only with no calls to action
- `suggestive`: General suggestions without specific directives
- `directive`: Clear calls to action or specific steps to take
- `interactive`: Encourages follow-up questions or engagement
- `transactional`: Explicitly facilitates a purchase or conversion
- `referral`: Directs user to seek more information elsewhere
- `educational`: Focuses on learning rather than immediate action

### Query Competition Values
- `defending`: Brand is cited, no competitor
- `opportunity`: Neither brand nor competitor is mentioned
- `competitive`: Both brand and at least one competitor is mentioned
- `competitor_advantage`: Competitor is cited but the brand is not

## JSON Structure Examples

### Competitor Analysis JSON
```json
{
  "competitors": [
    {
      "name": "Competitor1",
      "mention_count": 3,
      "sentiment": 0.2,
      "mention_context": "alternative",
      "positioning": "leader"
    },
    {
      "name": "Competitor2",
      "mention_count": 1,
      "sentiment": -0.1,
      "mention_context": "comparison",
      "positioning": "niche"
    }
  ],
  "overall_competitive_landscape": "competitive",
  "brand_relative_positioning": "contender"
}
```

### Associated Pages JSON
```json
[
  {
    "page_id": "uuid-value",
    "url": "https://example.com/page1",
    "citation_position": 1,
    "citation_context": "direct reference",
    "page_relevance_type": "direct",
    "page_intent_alignment": "high",
    "content_type": "article",
    "domain_authority": 45,
    "content_depth_score": 4
  },
  {
    "page_id": "uuid-value-2",
    "url": "https://another-example.com/page2",
    "citation_position": 2,
    "citation_context": "supporting evidence",
    "page_relevance_type": "partial",
    "page_intent_alignment": "moderate",
    "content_type": "blog post",
    "domain_authority": 32,
    "content_depth_score": 3
  }
]
```

## Value Generation

1. **User-Provided Values**: 
   - Query keywords
   - Query intents
   - Analysis parameters

2. **Generated Values**:
   - Timestamps
   - IDs
   - Counts (citations, competitors, etc.)

3. **AI-Generated Values**:
   - Brand and competitor sentiment
   - Query categorization
   - Content analysis
   - Response match quality

4. **Crawler-Generated Values**:
   - Associated pages data
   - Content metrics
   - SEO data points

This documentation provides a reference for all fields in the Query data model. Understanding these definitions helps when interpreting the output data and when modifying the system to customize the analysis process.