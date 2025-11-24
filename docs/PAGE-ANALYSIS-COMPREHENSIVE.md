# Comprehensive Page Analysis Guide - Citebots

## Overview

Citebots performs extensive analysis on web pages that are cited by AI models (ChatGPT, Perplexity, Claude) in response to queries. This document explains **what** we analyze, **why** it matters, and **how** the data is used to help brands optimize their content for AI citation.

The analysis happens at multiple levels: the query/response level, individual pages cited in responses, and competitive landscape analysis.

---

## Analysis Hierarchy

```
Client Analysis
    └── Analysis Run (batch of queries for a client)
        └── Query Analysis (single query executed on platform)
            ├── Response Metadata (how the AI responded)
            ├── Brand Mention Analysis (how brand appears)
            ├── Competitor Analysis (competitive context)
            └── Page Analyses (each cited page)
                ├── Technical SEO
                ├── On-Page SEO
                ├── Content Quality
                ├── Page Performance
                ├── Domain Authority
                ├── E-E-A-T Signals
                └── Relevance & Intent Alignment
```

---

## 1. Query & Response Analysis

### 1.1 Query Metadata

**What we track:**
- **Query Text**: The actual question or command sent to the AI
- **Query Keyword**: Primary keyword the query is targeting
- **Query Category**: Type of query (general, product, service, comparison, troubleshooting, educational, pricing, features)
- **Query Topic**: Main subject matter (e.g., "workforce management", "construction software")
- **Query Type**: Format of query (question, command, research, conversational, comparison, definition, how_to, example)
- **Query Intent**: Original intent specified (informational, transactional, navigational)
- **Query Complexity**: Simple, moderate, or complex based on structure and word count
- **Funnel Stage**: Where in the buyer journey (awareness, consideration, decision, retention)

**Why it matters:**
Understanding query characteristics helps identify:
- Which types of queries cite your brand vs competitors
- Content gaps in your funnel coverage
- Opportunities where competitors are dominating
- Query patterns that drive citations

### 1.2 Response Characteristics

**What we track:**
- **Response Match**: How well the AI answered the query (direct, partial, tangential)
- **Response Outcome**: What the AI provided (answer, recommendation, comparison, explanation)
- **Action Orientation**: Level of guidance (passive, suggestive, directive, interactive, transactional, referral, educational)
- **Query Competition**: Competitive landscape (defending, opportunity, competitive, competitor_advantage)

**Why it matters:**
- **Direct matches** with strong citations indicate well-targeted content
- **Partial matches** suggest content improvement opportunities
- **Action orientation** reveals if your content drives outcomes vs just informing
- **Competition level** identifies defensive vs offensive opportunities

### 1.3 Citation Metrics

**What we track:**
- **Total Citation Count**: Number of sources cited in response
- **Citation Position**: Where each citation appears (position 1 = most prominent)
- **Associated Pages**: Which of your pages were cited

**Why it matters:**
- Position matters - early citations have more influence
- Multiple citations from same domain show authority
- Zero citations on relevant queries = optimization opportunity

---

## 2. Brand Presence Analysis

### 2.1 Brand Mention Tracking

**What we track:**
- **Brand Mentioned**: Boolean - was brand name mentioned?
- **Brand Mention Count**: Number of times brand appears in response
- **Brand in Citations**: Is brand domain in citation list?
- **Brand Mention Type**: How brand is positioned
  - **Primary**: Brand is the main subject
  - **Secondary**: Brand mentioned among others
  - **Implicit**: Brand concepts mentioned without explicit naming
  - **Featured**: Brand highlighted or given prominence
  - **None**: No brand mention

**Why it matters:**
- Tracks share of voice in AI responses
- Identifies queries where you should be mentioned but aren't
- Measures brand awareness in AI knowledge

### 2.2 Brand Sentiment & Context

**What we track:**
- **Brand Sentiment**: Score from -1 (negative) to +1 (positive)
- **Brand Positioning**: How brand is framed relative to market (prominent, mentioned, absent)
- **Brand Context**: Text surrounding brand mentions

**Why it matters:**
- Negative sentiment indicates reputation issues or incorrect information
- Context reveals how AI understands your value proposition
- Positioning shows if you're seen as leader, alternative, or follower

---

## 3. Competitor Analysis

### 3.1 Competitor Presence

**What we track:**
- **Competitor Mentioned Names**: List of competitors cited
- **Competitor Count**: Number of unique competitors mentioned
- **Total Competitor Mentions**: Sum of all competitor name occurrences
- **Competitor Context**: How competitors are positioned
  - **Comparative**: Directly compared to your brand
  - **Listed**: In list with brand, no comparison
  - **Exclusive**: Mentioned without brand in context
  - **Alternative**: Positioned as alternative solution
  - **Leader**: Positioned as market leader
  - **Follower**: Positioned secondary to other solutions
  - **None**: No competitive context

**Why it matters:**
- Identifies who you're competing against in AI responses
- Shows where competitors have citation advantage
- Reveals comparative positioning opportunities

### 3.2 Detailed Competitor Analysis

**What we track per competitor:**
- **Mention Count**: Times competitor name appears
- **Mention Type**: How they're mentioned (recommendation, featured, mentioned)
- **Domain Citations**: If competitor domains were cited
- **Competitive Landscape**: Overall competitive intensity (competitive, uncontested)

**Why it matters:**
- Understand which competitors dominate which query types
- Identify weak competitive areas for offensive strategy
- Recognize strong competitive areas requiring defensive content

---

## 4. Page-Level Analysis

Every URL cited in an AI response undergoes comprehensive analysis across 6 dimensions:

### 4.1 Technical SEO Analysis

**What we track:**

**Validation & Accessibility:**
- **Is Valid**: Can we access the page?
- **Is Crawlable**: Does it allow crawling?
- **HTTP Response Code**: 200, 404, 403, etc.
- **Crawl Error**: Specific error if crawling failed

**Structured Data:**
- **Schema Markup Present**: Has structured data markup?
- **Schema Types**: What types (Article, Product, Organization, FAQPage, etc.)
- **Social Graphs Present**: Open Graph, Twitter Cards

**HTML Structure:**
- **HTML Structure Score**: Quality of heading hierarchy (1-10)
- **Semantic HTML Usage**: Uses semantic tags (article, section, nav, aside, header, footer)
- **Meta Description Present**: Has meta description tag?
- **ARIA Labels Present**: Has accessibility labels?
- **ARIA Label Types**: What accessibility roles used?

**Technical Signals:**
- **Mobile Friendly**: Responsive design indicators
- **Hreflang Declaration**: International targeting signals
- **Date Created**: Publication date if detected
- **Date Modified**: Last update date
- **CDN Usage**: Using content delivery network

**Why it matters:**
- **Schema markup** helps AIs understand content structure and entities
- **Semantic HTML** improves AI parsing and comprehension
- **Accessibility** correlates with content quality
- **Freshness signals** influence citation likelihood
- Technical health is table stakes for citation

### 4.2 On-Page SEO Analysis

**What we track:**

**Content Structure:**
- **Page Title**: The &lt;title&gt; tag content
- **Meta Description**: Meta description content
- **Word Count**: Total words on page
- **Heading Count**: Total number of headings
- **Heading Count by Type**: Distribution (H1: 1, H2: 5, H3: 8, etc.)

**Content Elements:**
- **Image Count**: Number of images
- **Video Present**: Has embedded video?
- **Has Table**: Contains data tables?
- **Table Count**: Number of tables
- **Has Lists**: Unordered and ordered lists
- **List Counts**: Number of each list type

**Internal Architecture:**
- **Internal Link Count**: Links to other pages on same domain
- **Folder Depth**: URL depth (example.com/a/b/c = depth 3)

**Authority Signals:**
- **Authorship Clear**: Has clear author attribution?
- **Content Type**: Blog, product page, documentation, news article, etc.
- **Keyword Match**: Does page target the query keywords?

**Why it matters:**
- **Title and meta** signal topic relevance to AIs
- **Word count** and depth correlate with comprehensive coverage
- **Heading structure** helps AIs extract key points
- **Rich media** (images, video, tables) suggests quality
- **Internal linking** shows content ecosystem and topical authority
- **Authorship** builds trust and authority signals

### 4.3 Content Quality Analysis

**What we track:**

**Quality Scores (1-5 scale unless noted):**
- **Content Depth Score**: How comprehensive and detailed
- **Readability Score**: How easy to understand
- **Content Uniqueness**: Original vs. derivative content
- **Content Optimization Score**: Overall SEO optimization level
- **Analysis Score**: Overall analytical quality

**Content Features:**
- **Has Statistics**: Contains data, percentages, numbers
- **Has Quotes**: Includes expert quotes or testimonials
- **Has Citations**: Links to external authoritative sources
- **Has Research**: References studies or research

**Content Classification:**
- **Rock/Paper/Scissors Framework**:
  - **Rock**: Factual reference content (data, definitions, specs)
  - **Paper**: Comprehensive guides (tutorials, how-tos, deep dives)
  - **Scissors**: Persuasive/sales content (marketing, product pages)
- **Topical Cluster**: Main topic/category
- **Sentiment Score**: Overall tone (-1 to +1)

**Citation Relevance:**
- **Citation Match Quality**: How well page matches query (1-5)
- **AI Content Detection Score**: Likelihood of AI-generated content (1-5)

**Why it matters:**
- **Depth and uniqueness** are strong citation drivers
- **Statistics and research** build authority
- **External citations** show trustworthiness
- **Rock/Paper/Scissors** helps identify content type gaps
- **Match quality** reveals if cited pages truly answer queries
- AI-generated content may be discounted by AI models

### 4.4 Page Performance Metrics

**What we track:**

**Core Web Vitals:**
- **Page Speed Score**: Overall performance (0-100)
- **First Contentful Paint (FCP)**: Time to first visual content (ms)
- **Largest Contentful Paint (LCP)**: Time to main content (ms)
- **Total Blocking Time (TBT)**: JavaScript blocking time (ms)
- **Cumulative Layout Shift (CLS)**: Visual stability score

**Accessibility:**
- **Accessibility Score**: Overall accessibility (1-5)

**Why it matters:**
- **Fast pages** create better user experiences
- **Poor performance** may signal lower quality to AIs
- **Core Web Vitals** correlate with search rankings
- **Accessibility** suggests professional, quality content
- User experience signals indirectly influence citation

### 4.5 Domain Authority Metrics

**What we track:**

**Domain-Level Metrics:**
- **Domain Name**: The root domain
- **Domain Authority**: Overall domain strength (0-100)
- **Page Authority**: Individual page strength (0-100)
- **Spam Score**: Likelihood of spam (0-17, lower is better)

**Link Metrics:**
- **Backlink Count**: Total inbound links
- **Referring Domains**: Unique domains linking to site
- **Link Propensity**: Likelihood of earning links (0-1)

**Why it matters:**
- **High DA/PA** sites are more likely to be cited
- **Link metrics** signal authority and trustworthiness
- **Low spam scores** prevent filtering/discounting
- AIs favor authoritative sources for factual claims

### 4.6 E-E-A-T Analysis (Experience, Expertise, Authoritativeness, Trustworthiness)

**What we track:**

**Experience Signals:**
- **Experience Score**: Evidence of first-hand experience (1-10)
- **Real-world Application**: Practical examples and use cases
- **Case Studies**: Specific documented cases
- **Expert Commentary**: Insights from practitioners
- **Temporal Markers**: Evidence of long-term involvement

**Expertise Signals:**
- **Expertise Score**: Demonstrated knowledge depth (1-10)
- **Technical Depth**: Appropriate complexity for topic
- **Terminology Usage**: Correct industry language
- **Explanation Quality**: Clarity and accuracy
- **Research References**: Citations to authoritative sources
- **Detail Level**: Specificity and granularity
- **Industry Knowledge**: Demonstrated understanding

**Authoritativeness Signals:**
- **Authoritativeness Score**: Recognized authority (1-10)
- **Domain Credibility**: Site reputation
- **Industry Recognition**: Authority status in field
- **Comprehensiveness**: Complete coverage expected from authority
- **Citation Quality**: Quality of sources referenced
- **Content Depth**: Depth vs. typical authority sources
- **Credentials**: Author qualifications mentioned

**Trustworthiness Signals:**
- **Trustworthiness Score**: Reliability indicators (1-10)
- **Information Balance**: Fair, balanced presentation
- **Limitation Transparency**: Acknowledges what's unknown
- **Fact vs Opinion**: Clear distinction
- **Information Currency**: Up-to-date information
- **Attribution Practices**: Proper source attribution
- **Accuracy Indicators**: Fact-checking signals
- **Citation Presence**: External references

**Overall E-E-A-T:**
- **E-E-A-T Score**: Combined score (1-10)
- **Key Strengths**: Top 3 E-E-A-T advantages
- **Improvement Areas**: Top 3 E-E-A-T weaknesses

**Why it matters:**
- E-E-A-T is Google's primary quality framework
- AIs likely use similar quality assessment
- **Experience** shows first-hand knowledge
- **Expertise** demonstrates deep understanding
- **Authoritativeness** builds citation confidence
- **Trustworthiness** prevents misinformation
- High E-E-A-T pages are citation magnets

### 4.7 Page Relevance & Intent Analysis

**What we track:**

**Relevance Metrics:**
- **Page Relevance Type**: How page matches query
  - **Direct**: Exactly matches query intent
  - **Partial**: Covers some but not all of query
  - **Misaligned**: Doesn't really answer query

**Intent Alignment:**
- **Page Intent Alignment**: Query-page intent match
  - **High**: Perfect intent match
  - **Moderate**: Reasonable intent match
  - **Low**: Weak intent match
  - **Mismatch**: Wrong intent entirely

**Content Characteristics:**
- **Content Format**: Article, blog, landing page, product page, documentation, tutorial
- **Content Depth**: Comprehensive, overview, shallow
- **Content Structure**: Hierarchical, linear, fragmented
- **Content Recency**: Recent, older, outdated, undated

**Positioning:**
- **Brand Positioning**: How brand appears (prominent, mentioned, absent)
- **Competitor Presence**: Competitor visibility (exclusive, featured, mentioned, none)
- **Call to Action Strength**: CTA clarity (strong, moderate, passive, none)

**User Experience:**
- **E-E-A-T Signals**: Quality signals (strong, moderate, weak)
- **User Experience Quality**: Overall UX (excellent, good, average, poor, problematic)

**Analysis Notes:**
- **Free-form observations** about the page and citation

**Why it matters:**
- **Direct relevance** pages are more likely to be cited
- **Intent alignment** shows if page truly serves user need
- **Format and depth** reveal content strategy effectiveness
- **Recency** impacts trust for time-sensitive topics
- **Strong CTAs** can drive action even from AI citations
- **UX quality** correlates with citation likelihood

---

## 5. Competitive Intelligence Derived from Analysis

### 5.1 Citation Rate Comparison

**What we derive:**
- Your citation rate vs competitors across query types
- Which queries cite you vs competitors
- Citation position comparison (are you cited first or third?)

**Why it matters:**
- Identifies where you're winning vs losing
- Reveals content gap opportunities
- Shows defensive vs offensive priorities

### 5.2 Content Quality Benchmarking

**What we derive:**
- Average E-E-A-T scores: yours vs competitors
- Content depth comparison
- Technical SEO quality comparison
- Domain authority gaps

**Why it matters:**
- Shows if quality gap explains citation gap
- Identifies which quality factors matter most
- Guides content improvement priorities

### 5.3 Query Strategy Insights

**What we derive:**
- Which query types favor your brand
- Which funnel stages you dominate vs lack coverage
- Query complexity patterns (are you cited for complex or simple queries?)
- Topic clusters where you have authority

**Why it matters:**
- Optimize for query types where you can win
- Fill gaps in funnel coverage
- Develop content for underserved complexity levels
- Double down on authority topics

### 5.4 Content Format Analysis

**What we derive:**
- Which content formats get cited most (blog vs product page)
- Rock/Paper/Scissors distribution in your citations vs competitors
- Optimal content depth for citation

**Why it matters:**
- Format influences citation likelihood
- Balance content portfolio for maximum citations
- Understand what type of content AIs prefer for each query type

---

## 6. How This Data Drives Action

### 6.1 Content Gap Identification

**The analysis reveals:**
- Queries where competitors are cited but you're not
- Topics with low coverage but high citation potential
- Funnel stages missing content
- Query types underserved by your content

**Action:** Create targeted content to fill gaps

### 6.2 Content Optimization

**The analysis reveals:**
- Pages cited with low E-E-A-T scores
- Pages with poor technical SEO blocking citations
- Content with wrong intent alignment
- Thin content getting cited (expand it!)

**Action:** Improve existing pages to increase citation likelihood

### 6.3 Competitive Strategy

**The analysis reveals:**
- Where you have citation advantage (defend)
- Where competitors dominate (attack or avoid)
- Uncontested query territories (claim)
- Comparative positioning opportunities

**Action:** Develop defensive and offensive content strategies

### 6.4 Brand Positioning

**The analysis reveals:**
- How AIs currently position your brand
- Sentiment issues to address
- Mention type patterns (primary vs secondary)
- Context accuracy problems

**Action:** Shape AI understanding through content and entity optimization

### 6.5 Technical SEO Priorities

**The analysis reveals:**
- Schema markup gaps preventing citation
- Accessibility issues correlating with low citations
- Page performance problems
- Mobile-friendliness issues

**Action:** Fix technical issues to unlock citation potential

---

## 7. Key Performance Indicators (KPIs)

### Primary Citation KPIs
- **Citation Rate**: % of relevant queries citing your brand
- **Average Citation Position**: Where you appear in citation lists
- **Share of Citations**: Your citations / total citations in query set
- **Citation Quality Score**: Average E-E-A-T of citing pages

### Brand Presence KPIs
- **Mention Rate**: % of queries mentioning brand name
- **Primary Mention Rate**: % where you're primary subject
- **Sentiment Score**: Average brand sentiment across mentions
- **Positioning Score**: How favorably you're positioned

### Competitive KPIs
- **Citation Win Rate**: Queries where you're cited vs competitors
- **Competitive Citation Ratio**: Your citations / competitor citations
- **Exclusive Coverage**: Queries citing you but not competitors
- **Lost Opportunities**: Relevant queries citing competitors, not you

### Content Quality KPIs
- **Average E-E-A-T Score**: Across cited pages
- **Content Depth Score**: How comprehensive is cited content
- **Match Quality Score**: Citation relevance to queries
- **Fresh Content Ratio**: % of citations from recently updated content

### Technical Health KPIs
- **Schema Coverage**: % of cited pages with schema markup
- **Page Speed Score**: Average across cited pages
- **Mobile Optimization Rate**: % of cited pages mobile-friendly
- **Crawlability Rate**: % of pages successfully crawlable

---

## 8. Analysis Workflow

### Step 1: Query Execution
1. Generate queries from keywords and intents
2. Execute queries on AI platforms (ChatGPT, Perplexity)
3. Capture full responses and citation lists

### Step 2: Response Analysis
1. Extract citations from response
2. Analyze brand mentions and sentiment
3. Identify competitor mentions
4. Classify query and response characteristics

### Step 3: Page Crawling
1. Crawl each cited URL (ScrapingBee)
2. Extract HTML content
3. Parse structured data

### Step 4: Page Analysis
1. **Technical SEO**: Automated extraction from HTML
2. **On-Page SEO**: Automated content analysis
3. **Content Quality**: AI-powered assessment (GPT-4o-mini)
4. **E-E-A-T**: Deep AI analysis of quality signals
5. **Domain Authority**: API-based or estimated metrics
6. **Relevance**: AI-powered intent and match analysis

### Step 5: Data Storage
1. Store in structured database (Supabase)
2. Link analysis_run → queries → page_analyses
3. Enable querying and reporting

### Step 6: Insights & Reporting
1. Aggregate metrics across queries
2. Compare brand vs competitors
3. Generate actionable recommendations
4. Visualize trends and gaps

---

## 9. Why This Level of Detail Matters

### For SEO in the AI Era

Traditional SEO optimizes for search engine rankings. **AI SEO** optimizes for being cited by AI models as authoritative sources. This requires:

1. **Content that AIs trust** (E-E-A-T signals)
2. **Content AIs can parse** (structured data, semantic HTML)
3. **Content matching AI understanding** (entity recognition, topic modeling)
4. **Content comprehensiveness** (covering topics deeply)
5. **Content freshness** (up-to-date information)

### For Competitive Intelligence

Understanding not just **if** you're cited, but **how** and **why** compared to competitors reveals:

1. Your competitive moat (citations you own)
2. Competitive threats (citations you're losing)
3. Market opportunities (uncited queries)
4. Positioning problems (wrong context or sentiment)

### For Content Strategy

Granular analysis enables:

1. **Precision targeting**: Create exactly the content that gets cited
2. **Quality benchmarking**: Know what "good enough" means
3. **Format optimization**: Use formats that work for each query type
4. **ROI measurement**: Track which content drives citations

### For Brand Management

AI responses shape brand perception. Analysis helps:

1. **Monitor brand narrative**: How AIs describe your brand
2. **Correct misinformation**: Identify inaccurate positioning
3. **Amplify strengths**: Double down on positive citations
4. **Manage sentiment**: Address negative mentions

---

## 10. Data Privacy & Ethics

### What We Don't Track

- Individual user queries (we execute queries ourselves)
- Personal information from cited pages
- Private or paywalled content (respect robots.txt)
- Competitive intelligence beyond public citations

### What We Respect

- Robots.txt directives
- API terms of service
- Content licensing
- Attribution requirements

### How We Use Data

- Aggregate analysis only
- Benchmarking with anonymization
- Client-specific insights stay private
- No scraping for competitive espionage

---

## Summary

Citebots performs the most comprehensive page analysis in the industry specifically designed for the AI citation era. We track:

- **50+ query characteristics** to understand context
- **10+ brand presence metrics** to measure visibility
- **20+ competitor metrics** for competitive intelligence
- **100+ page-level signals** across 6 dimensions
- **Comprehensive E-E-A-T analysis** with 4 scored dimensions
- **Intent and relevance matching** for every citation

This depth enables unprecedented insights into how to win AI citations, optimize content quality, and compete effectively in the age of AI-mediated information discovery.

The goal: Help brands become the authoritative sources that AI models cite consistently, accurately, and favorably.
