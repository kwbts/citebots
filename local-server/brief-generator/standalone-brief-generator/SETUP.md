# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

**Required API Keys:**
- OpenAI API Key (for ChatGPT)
- Claude API Key (for insights)
- Perplexity API Key (for research)
- ScrapingBee API Key (for web scraping)
- Supabase URL & Service Key (for database)

**Optional:**
- Google Search API (currently disabled due to quota limits)

## 3. Start the Server

```bash
npm start
```

Server will start on `http://localhost:3001`

## 4. Test the Service

```bash
node test-server.js
```

This will:
1. Check server health
2. Generate a test brief
3. Monitor completion status
4. Display results

## 5. Basic Usage

### Generate a Brief

```bash
curl -X POST http://localhost:3001/generate-brief \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Content Title",
    "keywords": ["keyword1", "keyword2"],
    "purpose": "blog",
    "audience": "developers",
    "researchDepth": "medium",
    "platforms": {
      "chatGpt": true,
      "perplexity": true,
      "google": false
    },
    "userId": "your-user-id"
  }'
```

### Check Brief Status

```bash
curl http://localhost:3001/brief/YOUR_BRIEF_ID
```

### List All Briefs

```bash
curl http://localhost:3001/briefs
```

## 6. Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t brief-generator .
docker run -p 3001:3001 --env-file .env brief-generator
```

## 7. Production Considerations

- Set `NODE_ENV=production`
- Increase memory allocation (2GB+ recommended)
- Set up proper logging/monitoring
- Configure load balancing if needed
- Monitor API quotas and usage

## Troubleshooting

**Server won't start:**
- Check all required environment variables are set
- Verify API keys are valid
- Ensure port 3001 is available

**Brief generation fails:**
- Check logs for specific API errors
- Verify database connectivity
- Test API keys individually

**Google Search errors:**
- Set `DISABLE_GOOGLE_SEARCH=true` in `.env`
- Service will work with ChatGPT and Perplexity only