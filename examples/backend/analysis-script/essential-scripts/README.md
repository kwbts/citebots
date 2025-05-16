# Essential Scripts

This directory contains the core essential scripts from the citebots project.

## Directory Structure

- `core/` - Main execution scripts
  - `run-citebot-query.js` - Main query runner for executing citebot searches
  - `process-keywords.js` - Keyword processor for generating intent-based queries
  - `consolidate-results.js` - Results consolidator for combining multiple queries
  - `citebots.js` - Main citebots orchestration script

- `lib/` - Core library modules
  - `perplexityClient.js` - Perplexity API integration
  - `chatgptClient.js` - ChatGPT API integration
  - `webCrawler.js` - Web crawling functionality
  - `contentAnalyzer.js` - Content analysis module
  - `brandAnalyzer.js` - Brand mention analysis
  - `citationExtractor.js` - Citation extraction module
  - `resultsFormatter.js` - Results formatting
  - `cacheManager.js` - Cache management

- `config/` - Configuration files
  - `index.js` - Main configuration settings

- `docs/` - Essential documentation
  - `CITEBOT-DATA-DEFINITIONS.md` - Data structure definitions
  - `README-CITEBOT.md` - Citebot documentation
  - `client-info.md` - Client setup information
  - `keywords.md` - Keyword processing documentation

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (see config/index.js)

3. Run the main scripts from the core directory