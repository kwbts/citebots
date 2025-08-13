# Modular Brief Assembly Design

## Overview

This document outlines the proposed modular architecture for the brief generation system, moving from a monolithic approach to specialized, validated modules.

## Current vs. Proposed Architecture

### Current (Monolithic)
```
User Input → Research Collection → Single Claude Mega-Prompt → Raw Assembly → Output
```

### Proposed (Modular)
```
User Input → Research Intelligence → Strategic Foundation → Content Generation → Validation & Enhancement → Output
```

---

## Module Breakdown

### Module 1: Research Intelligence Engine
**Purpose**: Gather and process raw research data into structured intelligence

#### Input Context
```javascript
{
  keywords: string[],
  client: {
    competitors: { name, domain }[],
    industry: string,
    target_audience: string
  },
  purpose: 'seo' | 'authority' | 'convert' | 'inform',
  platforms: { chatGpt, perplexity, google }
}
```

#### Processing Steps
1. **Competitor Intelligence**
   - Analyze competitor content strategies
   - Identify content gaps and opportunities
   - Map competitive landscape

2. **Statistical Source Discovery**
   - Extract numerical data from research
   - Validate statistical claims
   - Score source authority

3. **Authority Content Mapping**
   - Identify high-authority sources
   - Map content themes and angles
   - Track citation patterns

#### Output Context
```javascript
{
  competitorIntel: {
    competitors: [{ 
      name, domain, contentStrategy, gaps, strengths 
    }],
    contentLandscape: string,
    opportunityAreas: string[]
  },
  statisticalSources: [{
    statistic: string,
    source: string,
    authority_score: number,
    context: string,
    verified: boolean
  }],
  authorityContent: [{
    title: string,
    url: string,
    authority_score: number,
    key_insights: string[],
    content_angle: string
  }],
  researchSummary: {
    total_sources: number,
    coverage_score: number,
    recency_score: number
  }
}
```

#### Design Decisions Needed
- [ ] Statistical validation criteria (what makes a stat "good"?)
- [ ] Authority scoring algorithm (domain authority + content quality?)
- [ ] Competitor analysis depth (how many pages per competitor?)
- [ ] Research quality thresholds (minimum sources, recency requirements)

---

### Module 2: Strategic Foundation Generator
**Purpose**: Create the strategic framework that guides all content decisions

#### Input Context
```javascript
{
  researchIntelligence: // Output from Module 1
  briefParams: {
    title: string,
    keywords: string[],
    purpose: string,
    audience: string,
    client: object
  },
  userContext: {
    styleGuide?: string,
    customInstructions?: string
  }
}
```

#### Processing Steps
1. **Positioning Analysis**
   - Define unique value proposition
   - Identify differentiation opportunities
   - Map competitive advantages

2. **Audience Specification**
   - Refine audience persona details
   - Identify specific pain points
   - Define knowledge level and needs

3. **Content Strategy Framework**
   - Define narrative structure
   - Set tone and approach
   - Establish key messaging pillars

#### Output Context
```javascript
{
  strategicPositioning: {
    unique_angle: string,
    differentiation_strategy: string,
    competitive_advantages: string[],
    positioning_statement: string
  },
  audienceProfile: {
    persona_details: string,
    pain_points: string[],
    knowledge_level: string,
    content_preferences: string[]
  },
  contentStrategy: {
    narrative_structure: string,
    tone_guidelines: string,
    messaging_pillars: string[],
    avoidance_strategy: string[]
  },
  validation: {
    positioning_strength: number,
    audience_specificity: number,
    differentiation_clarity: number
  }
}
```

#### Design Decisions Needed
- [ ] Purpose-specific positioning templates (SEO vs Authority vs Convert)
- [ ] Audience profiling depth (how granular to get?)
- [ ] Validation scoring methodology
- [ ] Fallback strategies for weak positioning

---

### Module 3: Content Section Generators
**Purpose**: Generate specific brief sections using strategic foundation

#### Input Context
```javascript
{
  strategicFoundation: // Output from Module 2
  researchIntelligence: // Output from Module 1
  sectionType: 'overview' | 'statistics' | 'competitive' | 'toc'
}
```

#### Sub-Modules

##### 3A: Strategic Overview Generator
**Processing Steps**:
- Create executive summary format
- Integrate key positioning points
- Include supporting evidence

**Output**: Structured strategic overview with clear narrative

##### 3B: Statistics Extractor & Validator
**Processing Steps**:
- Extract numerical data from research
- Validate statistical claims
- Format with proper attribution
- Score relevance and authority

**Output**: Validated statistics array with sources and context

##### 3C: Competitive Analysis Generator
**Processing Steps**:
- Analyze competitor positioning
- Identify content gaps
- Generate differentiation strategy
- Create tactical recommendations

**Output**: Structured competitive analysis with actionable insights

##### 3D: Table of Contents Generator
**Processing Steps**:
- Map content structure to strategic goals
- Integrate research insights
- Customize for purpose and audience

**Output**: Purpose-driven content outline

#### Design Decisions Needed
- [ ] Section interdependencies (what order to generate?)
- [ ] Quality thresholds for each section
- [ ] Template variations by purpose/audience
- [ ] Fallback content strategies

---

### Module 4: Validation & Enhancement Engine
**Purpose**: Ensure quality standards and enhance weak sections

#### Input Context
```javascript
{
  generatedSections: {
    strategic_overview: string,
    statistics: array,
    competitive_analysis: string,
    table_of_contents: array
  },
  qualityRequirements: {
    min_statistics: number,
    required_positioning: boolean,
    competitive_differentiation: boolean,
    audience_specificity: boolean
  }
}
```

#### Processing Steps
1. **Quality Assessment**
   - Score each section against criteria
   - Identify gaps and weaknesses
   - Flag missing elements

2. **Enhancement Processing**
   - Regenerate weak sections
   - Add missing elements
   - Improve clarity and specificity

3. **Final Validation**
   - Ensure coherence across sections
   - Validate against user requirements
   - Score overall brief quality

#### Output Context
```javascript
{
  validatedBrief: {
    // Enhanced sections
  },
  qualityScores: {
    strategic_overview: number,
    statistics: number,
    competitive_analysis: number,
    table_of_contents: number,
    overall: number
  },
  enhancements_made: string[],
  quality_warnings: string[]
}
```

#### Design Decisions Needed
- [ ] Quality scoring algorithms
- [ ] Enhancement strategies (regenerate vs refine?)
- [ ] Quality thresholds for release
- [ ] User feedback integration

---

## Context Passing Architecture

### Data Flow Pattern
```javascript
// Each module receives context and returns enhanced context
const context = {
  user_input: briefParams,
  research_data: null,
  strategic_foundation: null,
  content_sections: null,
  validation_results: null
};

// Pipeline execution
context.research_data = await researchEngine.process(context);
context.strategic_foundation = await strategicGenerator.process(context);
context.content_sections = await contentGenerators.process(context);
context.validation_results = await validationEngine.process(context);
```

### Context Schema
```javascript
{
  // Core brief parameters
  brief_params: {
    title: string,
    keywords: string[],
    purpose: string,
    audience: string,
    client?: object
  },
  
  // User customization
  user_context: {
    style_guide?: string,
    custom_instructions?: string
  },
  
  // Research intelligence
  research_intelligence?: {
    competitor_intel: object,
    statistical_sources: array,
    authority_content: array
  },
  
  // Strategic foundation
  strategic_foundation?: {
    positioning: object,
    audience_profile: object,
    content_strategy: object
  },
  
  // Generated content
  content_sections?: {
    strategic_overview: string,
    statistics: array,
    competitive_analysis: string,
    table_of_contents: array
  },
  
  // Quality metrics
  quality_metrics?: {
    section_scores: object,
    overall_score: number,
    enhancements: array
  }
}
```

---

## Key Design Decisions Required

### 1. Module Independence vs. Integration
**Decision**: How tightly coupled should modules be?
- **Option A**: Fully independent modules with standardized interfaces
- **Option B**: Integrated modules that can access all previous context
- **Recommendation**: Option B for context richness, with fallback isolation

### 2. Quality vs. Speed Trade-offs
**Decision**: How many validation/enhancement cycles?
- **Option A**: Single-pass generation with basic validation
- **Option B**: Multi-pass with iterative enhancement
- **Recommendation**: Configurable depth based on use case

### 3. Prompt Engineering Strategy
**Decision**: How to manage AI prompts across modules?
- **Option A**: Embedded prompts in each module
- **Option B**: Centralized prompt management system
- **Option C**: Template-based prompt generation
- **Recommendation**: Option C for maintainability and testing

### 4. Error Handling & Fallbacks
**Decision**: How to handle module failures?
- **Option A**: Fail fast - stop pipeline on any failure
- **Option B**: Graceful degradation with fallback content
- **Option C**: Retry with simplified prompts
- **Recommendation**: Combination of B and C

### 5. Caching & Performance
**Decision**: What to cache between generations?
- **Option A**: Cache research data for similar keywords
- **Option B**: Cache strategic frameworks for similar clients
- **Option C**: Cache validation patterns
- **Recommendation**: All three with different TTLs

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create modular interfaces and context schema
2. Implement basic validation framework
3. Break down current mega-prompt into focused prompts

### Phase 2: Core Modules (Week 2)
1. Research Intelligence Engine
2. Strategic Foundation Generator
3. Statistics Extractor & Validator

### Phase 3: Enhancement (Week 3)
1. Content Section Generators
2. Validation & Enhancement Engine
3. Quality scoring system

### Phase 4: Optimization (Week 4)
1. Performance optimization
2. Caching implementation
3. User feedback integration

---

## Success Metrics

### Quality Improvements
- [ ] Statistics success rate >90% (vs current ~0%)
- [ ] Strategic positioning specificity score >80
- [ ] Competitive differentiation clarity >75
- [ ] User satisfaction rating >4.0/5

### System Performance
- [ ] Generation time <2 minutes (vs current ~1 minute)
- [ ] Module failure recovery <10 seconds
- [ ] Cache hit rate >60% for similar briefs

### Development Velocity
- [ ] Prompt iteration cycle <1 day
- [ ] A/B testing capability
- [ ] Quality regression detection