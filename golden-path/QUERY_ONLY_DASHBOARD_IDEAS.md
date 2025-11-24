# Query-Only Dashboard Ideas

**Context**: We have 100s of LLM responses with rich query-level data. No page scraping required - all data from AI response analysis.

---

## Available Query-Only Data Points

### Query Metadata
- Query text, keyword, category, topic, type
- Query intent (informational, transactional, navigational)
- Query complexity (simple, moderate, complex)
- Funnel stage (awareness, consideration, decision, retention)

### Response Characteristics
- Model response text
- Response match (direct, partial, tangential)
- Response outcome (answer, recommendation, comparison, explanation, list, guide)
- Action orientation (passive, suggestive, directive, interactive, transactional, referral, educational)
- Query competition (defending, opportunity, competitive, competitor_advantage)
- Citation count (number of sources cited)

### Brand Performance
- Brand mentioned (boolean)
- Brand sentiment (-1 to +1)
- Brand mention type (primary, secondary, implicit, featured, none)

### Competitor Performance
- Competitor mentioned names (array)
- Competitor count
- Competitor context (comparative, listed, exclusive, alternative, leader, follower)

### Platform Data
- Data source (ChatGPT, Perplexity)
- Model used

---

## Dashboard Concept Ideas

### 1. **Query Intent Performance Dashboard** 🎯
**Purpose**: Understand which intents drive brand mentions and where you're missing

**Visualizations**:
- Intent breakdown pie chart (informational, transactional, navigational)
- Brand mention rate by intent (bar chart)
- Competitor presence by intent (stacked bar)
- Funnel stage progression (awareness → decision) with brand performance
- Intent × Funnel stage heatmap showing coverage gaps

**Key Questions Answered**:
- Are you visible in transactional queries (high-intent)?
- Do you dominate informational queries?
- Where are competitors stronger?
- Which funnel stages need content investment?

**Actionable Insights**:
- "You're strong in awareness (80% brand mention) but weak in decision-stage queries (15%)"
- "Competitors dominate transactional queries - create conversion-focused content"

---

### 2. **Response Outcome Strategy Dashboard** 💡
**Purpose**: Optimize for the types of responses AI generates

**Visualizations**:
- Outcome distribution (answer, recommendation, comparison, explanation)
- Brand mention rate by outcome type (already built!)
- Competitor comparison by outcome
- Action orientation by outcome (are recommendations actionable?)
- Outcome × Query complexity matrix

**Key Questions Answered**:
- When AI recommends solutions, are you included?
- Do comparison queries favor competitors?
- Are you strong in educational content (explanations)?
- Which outcomes drive citations?

**Actionable Insights**:
- "Comparison queries mention competitors 3x more - create head-to-head content"
- "You excel in explanations but lack recommendation visibility"

---

### 3. **Competitive Landscape Dashboard** 🏆
**Purpose**: Map competitive dynamics across query types

**Visualizations**:
- Head-to-head win rate by query category
- Competitor co-mention network (who appears together?)
- Query competition breakdown (defending, opportunity, competitive, competitor_advantage)
- Competitor context analysis (how are they positioned?)
- Share of voice by query topic

**Key Questions Answered**:
- Which competitors are your biggest threats?
- Where are you defending vs attacking?
- On which topics do you "own" the conversation?
- Are competitors positioned as leaders or alternatives?

**Actionable Insights**:
- "Competitor X appears in 70% of pricing queries - create pricing comparison content"
- "You're in defensive mode on 45% of queries - need offensive strategy"

---

### 4. **Query Complexity & Sophistication Dashboard** 🧠
**Purpose**: Understand performance across query sophistication levels

**Visualizations**:
- Complexity distribution (simple, moderate, complex)
- Brand mention rate by complexity
- Query type performance (question, command, research, conversational, comparison)
- Average sentiment by complexity
- Citation count by query sophistication

**Key Questions Answered**:
- Do you appear in complex, research-heavy queries?
- Are simple queries dominated by competitors?
- Does query format affect brand visibility?
- Are conversational queries different from direct questions?

**Actionable Insights**:
- "Complex queries cite you 2x more - double down on deep content"
- "Simple queries show low brand mention - need quick-answer content"

---

### 5. **Platform Performance Dashboard** 📱
**Purpose**: Compare performance across ChatGPT vs Perplexity

**Visualizations**:
- Side-by-side platform comparison (brand mention rate, sentiment, competitor presence)
- Platform preference by query type
- Citation behavior differences
- Response outcome distribution by platform
- Sentiment analysis by platform

**Key Questions Answered**:
- Which platform favors your brand?
- Do platforms respond differently to query types?
- Is sentiment consistent across platforms?
- Where should you optimize first?

**Actionable Insights**:
- "Perplexity cites you 40% more - prioritize Perplexity SEO"
- "ChatGPT shows neutral sentiment, Perplexity positive - investigate why"

---

### 6. **Sentiment & Positioning Dashboard** 😊😐😞
**Purpose**: Track how AI perceives and presents your brand

**Visualizations**:
- Sentiment trend over time (if multiple analysis runs)
- Sentiment distribution histogram
- Sentiment by query category
- Brand mention type breakdown (primary, secondary, featured, implicit)
- Sentiment correlation with competitor presence

**Key Questions Answered**:
- Is AI sentiment toward your brand positive?
- Which query types generate negative sentiment?
- When are you featured vs mentioned in passing?
- Does competitor presence affect your sentiment?

**Actionable Insights**:
- "Pricing queries show negative sentiment (-0.4) - address pricing perception"
- "You're featured in 60% of mentions - strong brand authority"

---

### 7. **Query Coverage Gap Analysis Dashboard** 🔍
**Purpose**: Identify content opportunities and gaps

**Visualizations**:
- Query category coverage matrix (what you cover vs don't)
- Topic × Funnel stage heatmap with brand mention overlay
- Zero-mention query analysis (queries where brand isn't mentioned)
- High-competition opportunity queries
- Low-hanging fruit queries (low competitor presence, no brand mention)

**Key Questions Answered**:
- Which query categories lack brand visibility?
- What topics are underserved?
- Where are the easiest wins?
- Which queries should you prioritize?

**Actionable Insights**:
- "23 'how-to' queries with zero brand mentions - create tutorials"
- "Pricing category: 80% competitor mentions, 10% brand - priority gap"

---

### 8. **Action Orientation & User Intent Dashboard** 🚀
**Purpose**: Understand how actionable AI responses are and what they drive

**Visualizations**:
- Action orientation breakdown (passive, suggestive, directive, transactional)
- Brand mention rate by action type
- Outcome × Action orientation matrix
- Transactional query performance (highest intent)
- Referral vs educational response split

**Key Questions Answered**:
- Do directive responses include your brand?
- Are transactional queries converting to mentions?
- Is AI passively informing or actively recommending?
- Which action types favor your brand?

**Actionable Insights**:
- "Directive responses mention competitors 3x more - strengthen CTA content"
- "Transactional queries perform well (75% brand mention) - amplify"

---

### 9. **Query Type Performance Dashboard** 📊
**Purpose**: Optimize content for different query formats

**Visualizations**:
- Query type distribution (question, command, comparison, definition, how_to)
- Brand performance by query type
- Best/worst performing query types
- Competitor dominance by query type
- Citation count correlation with query type

**Key Questions Answered**:
- Do comparison queries favor competitors?
- Are "how to" queries well-covered?
- Which query formats drive the most citations?
- Where should you create content?

**Actionable Insights**:
- "Comparison queries: 20% brand mention, 85% competitor - create comparison pages"
- "How-to queries: 90% brand mention - your strength, amplify"

---

### 10. **Citation & Reference Dashboard** 📚
**Purpose**: Analyze citation patterns without page scraping

**Visualizations**:
- Average citations per query
- Citation count distribution
- Brand mention × Citation count correlation
- Zero-citation query analysis
- High-citation query characteristics

**Key Questions Answered**:
- Do more citations mean less brand mention?
- Which queries generate the most citations?
- Are zero-citation queries good or bad for brand?
- What drives citation behavior?

**Actionable Insights**:
- "High-citation queries (5+) show 60% lower brand mention - need authority"
- "Zero-citation queries mention brand 80% - conversational content works"

---

## Recommended Priority Dashboards for Query-Only Mode

### Must-Have (Phase 1)
1. **Query Intent Performance Dashboard** - Core strategic view
2. **Response Outcome Strategy Dashboard** - Already started (Brand Mention by Outcome)
3. **Competitive Landscape Dashboard** - Differentiator

### High Value (Phase 2)
4. **Query Coverage Gap Analysis Dashboard** - Actionable opportunities
5. **Platform Performance Dashboard** - Optimization focus
6. **Sentiment & Positioning Dashboard** - Reputation tracking

### Nice-to-Have (Phase 3)
7. **Query Complexity Dashboard** - Content depth strategy
8. **Action Orientation Dashboard** - Conversion optimization
9. **Query Type Performance Dashboard** - Format optimization
10. **Citation & Reference Dashboard** - Citation strategy

---

## Implementation Notes

### Data Requirements
All dashboards use **query-only data** from `analysis_queries` table:
- No `page_analyses` dependencies
- No web scraping required
- Fast to compute
- Scales to 1000s of queries

### Visualization Patterns
- **Bar charts**: Compare brand vs competitors across dimensions
- **Heatmaps**: Show coverage/gaps in 2D matrices
- **Pie/donut charts**: Show distributions
- **Line charts**: Show trends (if multiple analysis runs)
- **Scatter plots**: Show correlations
- **Tables**: Detailed breakdowns with filters

### Technical Approach
1. Create reusable chart components (BarChart, Heatmap, etc.)
2. Build computed aggregations in dashboard composables
3. Use existing color palette for consistency
4. Add filters: platform, query type, funnel stage, date range
5. Export/share capabilities

---

## MVC Checkpoint

**Does this serve the Golden Path?**
- ✅ Leverages existing query-only data
- ✅ No new data collection needed
- ✅ Provides actionable insights
- ✅ Differentiates from comprehensive mode
- ✅ Solves real customer problems

**Avoid Feature Creep**:
- Start with 2-3 dashboards max
- Test with real data first
- Get user feedback before building all 10
- Iterate based on what users actually use

---

## Next Steps

1. **Pick 1-2 dashboards** to prototype
2. **Use existing components** where possible (charts, metrics)
3. **Test with real query data** to validate insights
4. **Get user feedback** on usefulness
5. **Iterate** before building more

Stay on the Path. 🛤️
