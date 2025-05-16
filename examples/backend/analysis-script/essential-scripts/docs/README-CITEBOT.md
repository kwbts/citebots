# CiteBots - Analysis of Search Query Results with Citations

This tool analyzes responses from AI platforms (ChatGPT and Perplexity) for search queries, extracts citations, crawls the cited webpages, and analyzes content relevance.

## Command Reference

### 1. Running a Single Query

Use the `run-citebot-query.js` script to run custom queries with client information:

```bash
node run-citebot-query.js "Your Query" "Client Name" "client.domain.com" "platform" [--crawler=type]
```

#### Parameters:

1. `"Your Query"` (required): The search query term in quotes
2. `"Client Name"` (optional): The name of your client (default: "Humans of Martech")
3. `"client.domain.com"` (optional): The domain of your client (default: "humansofmartech.com")
4. `"platform"` (optional): Which AI platform to use - "chatgpt", "perplexity", or "both" (default: "both")
5. `--crawler=<type>` (optional): Web crawler to use - "basic" or "pro" (default: "pro")

#### Examples:

```bash
# Basic usage with minimal parameters
node run-citebot-query.js "Email marketing best practices"

# Specify client information and use both platforms
node run-citebot-query.js "Email marketing best practices" "Knak" "knak.com" "both"

# Use only ChatGPT for analysis
node run-citebot-query.js "Marketing automation trends" "Knak" "knak.com" "chatgpt"

# Use only Perplexity for analysis
node run-citebot-query.js "Email deliverability tips" "Knak" "knak.com" "perplexity"

# Use the free basic crawler (no API costs)
node run-citebot-query.js "Email marketing strategies" "Knak" "knak.com" "both" --crawler=basic

# Use the premium crawler (ScrapingBee API)
node run-citebot-query.js "Email marketing strategies" "Knak" "knak.com" "both" --crawler=pro
```

### 2. Processing Multiple Keywords from a File

The `process-keywords.js` script processes keywords from a markdown file and transforms them into different intent-based natural language queries:

```bash
node process-keywords.js [keywords-file.md] [options]
```

#### Options:
- `--client-info=<path>` - Path to client info markdown file (default: client-info.md)
- `--platform=<platform>` - Platform to use: chatgpt, perplexity, or both (default: both)
- `--intents=<list>` - Comma-separated list of query intents to use (default: all intents)
- `--crawler=<type>` - Web crawler to use: basic or pro (default: pro)

#### Examples:

```bash
# Basic usage - processes all keywords with all intents
node process-keywords.js keywords.md

# Specify client information file
node process-keywords.js keywords.md --client-info=clients/knak.md

# Process only specific intent types
node process-keywords.js keywords.md --intents=informational,navigational,commercial

# Use only ChatGPT for analysis
node process-keywords.js keywords.md --platform=chatgpt

# Use the free basic crawler
node process-keywords.js keywords.md --crawler=basic

# Complete example with all options
node process-keywords.js keywords.md --client-info=clients/knak.md --platform=both --intents=informational,educational,commercial --crawler=basic
```

#### Available Query Intents:
- `informational`: Seeking general knowledge (e.g., "What is email marketing?")
- `navigational`: Looking for a specific website/resource (e.g., "Leading email marketing tools")
- `transactional`: Intent to take an action (e.g., "Buy email marketing software")
- `commercial`: Researching before a purchase decision (e.g., "Best email marketing services")
- `local`: Seeking location-specific information (e.g., "Email marketing agencies near me")
- `support`: Looking for help with a problem (e.g., "Email marketing delivery issues")
- `educational`: Seeking to learn about a topic in depth (e.g., "Email marketing certification courses")
- `opinion`: Looking for subjective views or recommendations (e.g., "Is email marketing still effective?")

### 3. Testing Web Crawlers

CiteBots supports two types of web crawlers:
- `basic`: Free crawler using axios and cheerio (no API costs)
- `pro`: Premium crawler using ScrapingBee API (higher success rate with complex websites)

Test both crawlers against a specific URL:

```bash
# Compare both crawlers on the same URL
node test-crawlers.js https://example.com

# Test only the basic crawler
node test-basic-crawler.js https://example.com
```

### 4. File Format Examples

#### Example Keywords File

```markdown
# Keywords File
# Each keyword should be on its own line
# Lines starting with # are ignored

email marketing
content strategy
marketing automation
B2B lead generation
```

### Example Client Info File

```markdown
# Client Information

# Basic Information
Brand Name: Acme Corp
Brand Domain: acmecorp.com

# Competitors
Competitors:
Competitor One | competitor1.com
Competitor Two | competitor2.com
Competitor Three | competitor3.com
```

## Key Features

The CiteBots system provides:

1. **Dual AI Analysis**: Process queries through ChatGPT and/or Perplexity
2. **Citation Extraction**: Automatically extract URLs from AI responses
3. **Web Content Analysis**: Crawl and analyze cited webpages
4. **Brand Monitoring**: Detect client brand mentions in responses and citations
5. **Competitor Analysis**: Identify competitor mentions across all content
6. **Intent-Based Queries**: Transform keywords into different intent-based queries
7. **Batch Processing**: Process multiple keywords from a markdown file
8. **Rate Limiting**: Built-in protection against API rate limits
9. **Flexible Crawling**: Choose between two web crawler options:
   - `basic`: Free crawler using axios/cheerio (no API costs)
   - `pro`: Premium crawler using ScrapingBee API (better success with complex sites)
10. **Detailed Output**: Comprehensive JSON output for further analysis

## Output Format

All results are saved as JSON files:

### Single Query Results
Location: `data/output/client_name_query_timestamp.json`

Example: `data/output/Knak-Email_marketing_best_practices_1746528614158.json`

### Keyword-Based Results
Location: `data/output/keywords/client_name_keyword_intent_timestamp.json`

Example: `data/output/keywords/Knak-email_marketing-informational_1746528614158.json`

### Output Structure
Each JSON file includes:
- **Client Information**: Brand name, domain, and competitors
- **Query Details**: Original query and analysis parameters
- **AI Responses**: Full responses from ChatGPT and/or Perplexity
- **Citations**: List of extracted URLs from AI responses
- **Page Analysis**: Content quality, relevance, and metadata for each cited page
- **Brand Analysis**: Client brand mentions in responses and citations
- **Competitor Analysis**: Competitor mentions across all content
- **Summary Statistics**: Overall metrics and data quality assessment

## How Different Commands Work Together

- **run-citebot-query.js**: Use for one-off queries or specific research questions
- **process-keywords.js**: Use for bulk processing of keywords across multiple intent types
- **test-crawlers.js**: Use for troubleshooting when web pages aren't crawling properly

The process-keywords.js script will transform a single keyword (e.g., "email marketing") into multiple intent-based queries (e.g., "What is email marketing?", "Best email marketing tools", etc.) and run each through the same analysis process used by run-citebot-query.js.

## Rate Limiting Protection

Both scripts include built-in rate limiting to prevent API throttling:
- Delays between individual API calls
- Maximum concurrent queries
- Exponential backoff for failures

You can adjust these parameters in the RATE_LIMITS configuration at the top of each script.

## Generating Consolidated Results

There are two ways to get consolidated results:

### Option 1: Use process-keywords-consolidated.js

For direct consolidated output in a single file, use the consolidated script:

```bash
# Process keywords and save a single consolidated output file
node process-keywords-consolidated.js keywords.md --crawler=basic

# With all options
node process-keywords-consolidated.js keywords.md --client-info=clients/knak.md --platform=both --intents=informational,commercial --crawler=basic
```

This script:
- Processes each keyword and intent
- Saves all results in a single consolidated JSON file
- Includes summary statistics
- Tracks all queries together
- Creates the file in `data/output/consolidated/`

### Option 2: Consolidate Existing Results

If you've already run process-keywords.js and have multiple output files, you can consolidate them afterward:

```bash
# Consolidate the latest results for a client
node consolidate-results.js "Client Name"

# Consolidate results from a specific batch (using timestamp)
node consolidate-results.js "Client Name" 1746528614158
```

The consolidated file will contain:
- Summary statistics across all queries
- Client information
- Organized results by keyword and intent
- Citation counts and analysis

Example workflow:
1. Process keywords: `node process-keywords.js keywords.md --crawler=basic`
2. Consolidate results: `node consolidate-results.js "Client Name"`
3. View the consolidated report in the output directory