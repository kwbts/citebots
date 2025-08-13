# Generate Queries Workflow

## Overview
The generate-queries feature transforms keywords into natural language queries that users would ask AI platforms about a client's products/services.

## Workflow Steps

### 1. Input Collection (`/pages/dashboard/analysis/index.vue`)
- User selects a client
- Enters keywords (comma-separated)
- Chooses query generation options:
  - Number of queries per keyword (1-5)
  - Intent types (informational, transactional, etc.)
  - Custom vs AI-generated mode

### 2. AI Query Generation (`/supabase/functions/generate-queries/`)
- Edge function receives keywords + client context
- OpenAI GPT-4o generates diverse queries based on:
  - Client industry and products
  - Selected intent types
  - Natural language patterns
- Returns structured query objects with metadata

### 3. Preview & Selection (`/pages/dashboard/analysis/preview-queries.vue`)
- Displays all generated queries
- Users can:
  - Review and select/deselect queries
  - Choose target platforms (ChatGPT, Perplexity)
  - Decide between queue or direct processing

### 4. Queue Submission
- Selected queries submitted via `submit_analysis_to_queue` database function
- Creates queue items for each query × platform combination
- Tracks analysis run for reporting

### 5. Processing (`/local-server/server.js`)
- Local server polls queue
- Executes queries against AI platforms
- Analyzes citations and competitor mentions
- Updates results in database

## Key Components

**Frontend**: Vue composables handle state and API calls
**Edge Function**: Generates queries using OpenAI
**Database**: Queue-based architecture for reliability
**Local Server**: Processes queries asynchronously

## Intent Types
- **Informational**: "What is..."
- **Transactional**: "How to purchase..."
- **Commercial**: "Best options for..."
- **Support**: "Troubleshooting..."
- **Educational**: "Learn about..."

## Error Handling
- Fallback query generation if AI fails
- Queue retry mechanism
- Status tracking throughout pipeline