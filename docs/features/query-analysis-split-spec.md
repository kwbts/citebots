# Query Analysis Split - Feature Spec

## Core Concept

Split analysis into two distinct product offerings with different depth, speed, and cost profiles:

1. **Query Analysis** - Fast, lightweight analysis of LLM responses only
2. **Full Report** - Comprehensive analysis including page scraping and citation quality

## Why This Matters

### User Value
- **Speed to insight** - Query analysis gives immediate feedback (seconds vs minutes)
- **Cost efficiency** - Not every question needs a full scrape
- **Better mental model** - Different tools for different jobs
- **Progressive disclosure** - Start light, go deep when needed

### Business Value
- **Lower operational costs** - Reduce unnecessary scraping
- **Better user experience** - Faster feedback loop
- **More frequent usage** - Lower barrier to "just check something quick"
- **Upsell path** - Query analysis can reveal when full report is warranted

## What Changes

### User-Facing

**Analysis Trigger**
- User now chooses between two analysis types (exact UI TBD)
- Each type has different value proposition and expected results
- Question: Should defaults exist? Does context matter (new client vs existing)?

**Results Display**
- Query analysis shows response-level insights only
- Full report shows everything (current behavior)
- Question: Same dashboard with conditional components, or separate views?

**Pricing/Credits** (Future consideration)
- Query analysis = 1 credit
- Full report = 5-10 credits
- Question: Do we want to position this now or add later?

### Technical

**Execution Path**
```
Query Analysis:
└─ Execute queries → Parse responses → Analyze response patterns → Done

Full Report:
└─ Execute queries → Parse responses → Extract citations →
   Scrape pages → Analyze everything → Done
```

**Data Storage**
- New field somewhere: `analysis_type: 'query' | 'full'`
- Question: On analysis record, or inferred from data presence?
- Question: Should we track execution time/cost separately?

**Function Architecture**
Option A: Branch existing functions based on type parameter
Option B: Separate edge functions for each path
Option C: Shared orchestrator, modular components

## What Gets Analyzed

### Query Analysis Includes:
- Response structure and length
- Competitor mentions (frequency, positioning)
- Brand presence/absence
- Sentiment analysis
- Citation existence (but not quality)
- Response patterns across queries
- Comparative positioning

### Query Analysis Excludes:
- Page content quality
- Citation relevance scores
- SEO recommendations
- On-page optimization opportunities
- Content gap analysis
- Detailed competitive positioning

### Question: Is This Enough Value?
Does query-only analysis provide sufficient actionable insights to stand alone?
Or does it feel incomplete without page data?

## Open Design Questions

### Upgrade Path
- Can a query analysis be "upgraded" to full report later?
- Does this save the query responses to avoid re-executing?
- Is this a separate action or seamless continuation?

### Naming/Positioning
- "Query Analysis" vs "Quick Scan" vs "Response Check"
- "Full Report" vs "Deep Dive" vs "Citation Analysis"
- How do we communicate the difference without overwhelming?

### UI Entry Points
Option A: Two separate buttons on analysis page
Option B: Single button with modal selection
Option C: Radio buttons with explanation text
Option D: Progressive - start with query, offer full as next step

### Results Presentation
Option A: Same dashboard, conditionally hide unavailable sections
Option B: Different dashboard layouts for each type
Option C: Query results with prominent "Upgrade to Full Report" CTA

### Data Modeling
Option A: Single analysis type, flag for what was included
Option B: Separate tables for query_analyses and full_reports
Option C: Polymorphic - different analysis types inherit from base

## Technical Considerations

### What Stays Shared
- Query execution (`execute-query`)
- Response parsing and storage
- AI analysis capabilities
- Client/competitor data
- Results storage structure

### What Might Split
- Analysis orchestration
- Results calculation logic
- Metrics/aggregations
- Display components

### Performance Implications
- Query analysis: 30-60 seconds (mostly LLM calls)
- Full report: 3-5+ minutes (mostly scraping)
- Question: Do we show different progress indicators?

## Implementation Scope

### Minimal Version (MVP)
1. Add `analysis_type` parameter to existing flow
2. Gate scraping operations behind `type === 'full'` check
3. Simple UI selection (two buttons)
4. Conditionally render existing dashboard components
5. **Estimated: 3-5 hours**

### Enhanced Version
1. Separate edge functions for clarity
2. Optimized query-only analysis (faster, simpler)
3. Custom dashboard view for query results
4. Upgrade path from query → full
5. Cost/time estimates shown upfront
6. **Estimated: 8-12 hours**

### Future Extensions
- Scheduled query-only monitoring (cheaper to run frequently)
- Smart recommendations: "These results suggest a full report would be valuable"
- Hybrid mode: Query analysis + selective page scraping
- Historical comparison (query analysis over time)

## Success Metrics

How do we know this is working?

- **Usage split** - Do users actually use query-only, or always choose full?
- **Upgrade rate** - Do query analyses lead to full reports?
- **Speed to insight** - Does faster feedback increase engagement?
- **Cost savings** - Reduction in unnecessary scraping operations?

## Risks & Unknowns

1. **Value Perception** - Will query-only feel "incomplete" or genuinely useful?
2. **Complexity Creep** - Does this make the product harder to understand?
3. **Technical Debt** - Does branching logic get messy quickly?
4. **Competitor Data** - Query analysis still needs competitor list - is this properly separated?
5. **Historical Context** - How does this affect analysis comparison over time?

## Decision Points

Before implementing, need to decide:

1. **Is query-only analysis valuable enough to stand alone?**
   - What specific insights does it provide?
   - What user problems does it solve?

2. **How do we position the choice to users?**
   - What's the value prop for each?
   - When would you choose one vs the other?

3. **What's the upgrade path?**
   - One-way (query → full) or separate?
   - Seamless or explicit action?

4. **How do we handle existing analyses?**
   - Retroactively tag as "full"?
   - Migration needed?

5. **What's the MVP scope?**
   - Ship minimal version fast, iterate?
   - Or design the full experience first?

## Next Steps

1. Review this spec - does the concept hold up?
2. Test assumptions - mock up what query-only results look like
3. Decide on scope - MVP vs enhanced
4. Choose architecture approach
5. Implement and validate

## Notes for Future Self

- Keep it simple initially - can always enhance
- User feedback will be critical - ship and learn
- Don't overthink the data model - start flexible
- The upgrade path might be the key to adoption
- Consider how this affects demo/sales story

---

**Status**: Draft for discussion
**Author**: Claude
**Date**: 2025-10-14
