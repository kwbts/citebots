# Citebots Local Server

Local queue processing server that replaces unreliable Supabase Edge Functions with a reliable Node.js server running on your machine.

## Features

- **Queue Processing**: Polls Supabase `analysis_queue` table and processes items
- **Same Data Flow**: Maintains exact same database schema and data structure as Edge Functions
- **API Integrations**: ChatGPT, Perplexity, and ScrapingBee for page analysis
- **Status Monitoring**: Web endpoints to check server status and trigger processing
- **Error Handling**: Retry logic and proper error tracking

## Setup

1. **Install Dependencies**
   ```bash
   cd local-server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Required Environment Variables**
   ```env
   SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
   SUPABASE_SERVICE_KEY=your_service_key_here
   OPENAI_API_KEY=your_openai_key_here
   PERPLEXITY_API_KEY=your_perplexity_key_here
   SCRAPINGBEE_API_KEY=your_scrapingbee_key_here
   ```

## Usage

### Start the Server
```bash
npm start
# or for development
npm run dev
```

### Server Endpoints

- **Status Check**: `GET http://localhost:3002/status`
  - Shows server status, processing state, and stats

- **Manual Trigger**: `POST http://localhost:3002/trigger`
  - Manually start queue processing

- **Health Check**: `GET http://localhost:3002/health`
  - Simple health check endpoint

### How It Works

1. **Frontend**: Creates analysis runs and queues items (no changes needed)
2. **Server**: Polls `analysis_queue` table every 5 seconds for pending items
3. **Processing**: Executes queries using ChatGPT/Perplexity and analyzes citations
4. **Results**: Stores results in same database tables with same structure
5. **Frontend**: Displays results normally (no changes needed)

## Configuration

- `POLL_INTERVAL`: How often to check for new queue items (default: 5000ms)
- `BATCH_SIZE`: How many items to process at once (default: 3)
- `PORT`: Server port (default: 3002)

## Architecture

```
Frontend → Supabase (queue) ← Local Server (polls & processes) → Supabase (results)
```

This approach:
- ✅ Keeps your existing frontend and database schema unchanged
- ✅ Provides reliable processing without Edge Function timeouts
- ✅ Maintains all existing analysis logic and data structures
- ✅ Easy to scale up when needed

## Frontend Integration

The frontend can check if the server is online:

```javascript
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3002/status');
    const status = await response.json();
    return status.status === 'online';
  } catch {
    return false;
  }
}
```

## Validation

To validate everything is working:

1. ✅ Go to `/dashboard/analysis` and generate keywords
2. ✅ Create an analysis run (items should appear in `analysis_queue`)
3. ✅ Server should pick up and process items automatically
4. ✅ Results should appear in dashboard with same data structure
5. ✅ Check server status at `http://localhost:3002/status`

## Development

The server automatically polls for queue items, but you can also trigger processing manually:

```bash
curl -X POST http://localhost:3002/trigger
```

## Monitoring

Check server logs for processing status:
- `🚀 Starting queue processing...`
- `✅ Processed item {id}`
- `❌ Error processing item {id}`
- `🏁 Queue processing completed`