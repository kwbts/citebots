# Brief Generator API Server

This local API server handles the generation of content briefs using multiple research sources (ChatGPT, Perplexity, Google Search) and provides endpoints for the frontend to interact with.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project with service key
- API keys for research platforms (OpenAI, Perplexity, Google Search, ScrapingBee)

### Setup

1. Create or update the `.env` file in this directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# API Keys for LLM Services
OPENAI_API_KEY=your_openai_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
GOOGLE_SEARCH_API_KEY=your_google_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
SCRAPINGBEE_API_KEY=your_scrapingbee_key_here

# Server Configuration
BRIEF_GENERATOR_PORT=3001

# Feature Flags
USE_MOCK_PERPLEXITY=true
USE_MOCK_SCRAPING=true
```

2. Install dependencies:

```bash
npm install
```

### Starting the Server

Use the provided startup script to check environment variables and start the server:

```bash
./start-server.sh
```

Or start the server directly:

```bash
node server.js
```

The server will run on port 3001 by default (configurable via BRIEF_GENERATOR_PORT environment variable).

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /generate-brief` - Start the brief generation process
- `GET /brief/:id` - Get a specific brief by ID
- `GET /briefs` - List all briefs with optional filtering

## Working with Content Briefs

### Viewing Briefs in the Database

Use the `view-all-briefs.js` script to list all briefs in the database and view their details:

```bash
./view-all-briefs.js
```

This interactive script allows you to:
- See all briefs in the database
- View detailed information about specific briefs
- Export briefs to JSON files for inspection

### Testing API Connectivity

Use the CORS test page to check if the API is accessible from the browser:

1. Start the server: `node server.js`
2. Start the CORS test server: `node test-cors.js`
3. Open the HTML test page in your browser: `open cors-test.html`

## Troubleshooting

### Brief Not Loading in Frontend

If briefs are not loading in the frontend:

1. Verify the local server is running (`node server.js`)
2. Check the browser console for errors
3. Make sure the brief ID exists in the database (use `view-all-briefs.js`)
4. Test API connectivity using the CORS test page

The frontend now includes a debug panel that automatically appears when there are loading issues. It shows:
- Local server connectivity status
- Supabase connectivity status
- Error details
- Brief ID being requested

### Common Issues

- **CORS errors**: The server includes CORS middleware but might need configuration for specific domains
- **Authentication errors**: Make sure you're logged in with a valid Supabase session
- **Missing API keys**: Check the `.env` file has all required API keys
- **Database connection**: Verify the Supabase URL and service key are correct

## Advanced Usage

### Generating Briefs Programmatically

You can generate briefs by sending a POST request to the `/generate-brief` endpoint:

```bash
curl -X POST http://localhost:3001/generate-brief \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Content Brief",
    "keywords": ["keyword1", "keyword2"],
    "purpose": "Informational",
    "audience": "Technical professionals",
    "researchDepth": "comprehensive",
    "platforms": {
      "chatGpt": true,
      "perplexity": true,
      "google": true
    }
  }'
```

### Using Fallback Modes

When APIs are unavailable or if you want to test without using API credits:

- Set `USE_MOCK_PERPLEXITY=true` in `.env` to use mock responses instead of calling Perplexity API
- Set `USE_MOCK_SCRAPING=true` in `.env` to skip ScrapingBee calls and use mock content

## Development

The server is structured as follows:

- `server.js` - Main Express server and API endpoints
- `/lib/` - Module libraries:
  - `queryGenerator.js` - Generates research queries from brief parameters
  - `llmResearcher.js` - Handles LLM API interactions (ChatGPT, Perplexity)
  - `webSearcher.js` - Performs Google Search API queries
  - `contentScraper.js` - Scrapes content from URLs using ScrapingBee
  - `contentAnalyzer.js` - Analyzes research data to extract insights
  - `briefAssembler.js` - Assembles final brief structure
  - `logger.js` - Structured logging system

## Frontend Integration

The frontend connects to this local server using the `useBriefGenerator.ts` composable, which provides methods for:

- Generating briefs (`generateBrief`)
- Fetching briefs (`getBrief`)
- Listing briefs (`listBriefs`)
- Exporting briefs (`exportBrief`)

For best results, the frontend and local server should be running simultaneously.