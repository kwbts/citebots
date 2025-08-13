# AI Query Generation Approach

## Core Philosophy
Transform keywords into natural language queries that real users would ask AI platforms when researching products/services.

## Key Components

### 1. Intent-Based Generation
The script supports 8 distinct query intent types:
- **Informational**: General knowledge seeking ("What is...")
- **Navigational**: Finding specific resources ("Where to find...")
- **Transactional**: Action-oriented ("How to purchase...")
- **Commercial**: Purchase research ("Best options for...")
- **Local**: Location-specific ("Near me...")
- **Support**: Problem-solving ("Troubleshooting...")
- **Educational**: Deep learning ("How to master...")
- **Opinion**: Subjective views ("Is it worth it...")

### 2. Context-Aware Prompting
The AI receives rich client context:
```
- Industry and target audience
- Key products and services
- Unique selling propositions
- Brand voice characteristics
- Customer problems they solve
- Common use cases
```

This ensures generated queries align with the client's business reality.

### 3. Prompt Engineering Strategy
The prompt:
- Positions the AI as a market research expert
- Emphasizes natural, problem-solving queries
- Avoids contrived or overly complex language
- Thinks from prospective customer perspective
- Uses structured JSON output format

### 4. Smart Defaults & Flexibility
- Default: 2-3 queries per keyword
- Configurable: 1-5 queries based on needs
- Intent filtering: Generate only specific types when needed
- Fallback mechanism: Pre-defined queries if AI fails

### 5. Technical Implementation

**OpenAI Integration**:
- Model: GPT-4o for quality
- Temperature: 0.8 for creativity/diversity
- JSON mode: Structured, parseable output
- Error handling: Graceful fallbacks

**Query Structure**:
```json
{
  "query_text": "Generated natural language query",
  "keyword": "Original keyword",
  "intent": "commercial",
  "metadata": {
    "client_name": "...",
    "generation_approach": "diverse_intents",
    "selected_intents": ["commercial", "educational"]
  }
}
```

### 6. Fallback Strategy
If AI generation fails, the system:
1. Uses pre-defined templates per intent type
2. Maintains intent diversity
3. Marks queries as fallback in metadata
4. Ensures analysis can continue

## Example Flow

**Input**: Keyword "email marketing"
**Client Context**: SaaS company, B2B focus
**Selected Intents**: Commercial, Educational

**Output**:
1. "What are the best email marketing platforms for B2B companies?" (commercial)
2. "How to create automated email campaigns that convert?" (educational)

## Design Principles

1. **User-Centric**: Think like actual customers
2. **Diverse**: Cover multiple search intents
3. **Natural**: Avoid keyword stuffing
4. **Contextual**: Incorporate client specifics
5. **Reliable**: Always produce usable queries

This approach ensures comprehensive market intelligence by understanding how real users search for solutions.