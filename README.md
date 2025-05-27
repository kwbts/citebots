# Citebots - AI Citation Analysis Platform

An advanced SEO analysis tool that tracks and analyzes citations in Large Language Model responses (ChatGPT, Claude, Perplexity), helping organizations optimize their content for better AI visibility.

## 🚀 Production Status

**✅ LIVE AND OPERATIONAL** - [citebots.com](https://citebots.com)

### Latest Updates (January 18, 2025)
- ✅ Fixed page analysis data flow - all citation metrics now captured
- ✅ Enhanced edge function error handling and defensive programming
- ✅ Updated documentation structure for current implementation
- ✅ Removed test files and consolidated codebase

### Core Features
- ✅ User authentication with role-based access
- ✅ Client management with AI-powered enhancement
- ✅ Multi-platform citation analysis (ChatGPT, Perplexity)
- ✅ Advanced web crawling and content analysis
- ✅ Comprehensive SEO metrics and scoring
- ✅ Competitor tracking and comparison
- ✅ Real-time analysis progress tracking
- ✅ Detailed page-level insights

## 📦 Tech Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Hosting**: Netlify (Frontend) + Supabase (Backend)
- **External APIs**: 
  - OpenAI (GPT-4) - Query execution and content analysis
  - Perplexity - Alternative query engine
  - ScrapingBee - Web crawling
  - Google PageSpeed - Performance metrics

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Nuxt 3 SPA    │────▶│ Netlify/Supabase│────▶│   PostgreSQL    │
│   (Frontend)    │     │  Edge Functions │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  External APIs  │
                    │ OpenAI/Perplexity│
                    │   ScrapingBee    │
                    └─────────────────┘
```

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/[your-repo]/kb-citebots.git
cd kb-citebots

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Development Setup

### Required Environment Variables

```env
# Supabase
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# API Keys
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
SCRAPINGBEE_API_KEY=your_scrapingbee_key

# Site Configuration
SITE_URL=https://citebots.com
```

### Supabase CLI Commands

```bash
# Link to project
npx supabase link --project-ref trmaeodthlywcjwfzdka

# Deploy edge functions
npx supabase functions deploy [function-name] --no-verify-jwt

# View logs
npx supabase functions logs [function-name] --scroll

# Generate TypeScript types
npx supabase gen types typescript --linked > types/supabase.ts
```

## 📁 Project Structure

```
kb-citebots/
├── app/                    # Nuxt application files
├── components/             # Vue components
├── composables/           # Vue composables
├── pages/                 # Route pages
├── server/                # API endpoints
├── supabase/              # Edge functions
│   └── functions/
│       ├── analyze-citation/
│       ├── execute-query/
│       ├── generate-queries/
│       └── process-query/
├── netlify/               # Netlify functions
├── lib/                   # Shared utilities
├── types/                 # TypeScript definitions
├── scripts/               # Database migrations
└── docs/                  # Documentation
```

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles and roles
- `clients` - Client organizations
- `competitors` - Client competitors
- `analysis_runs` - Analysis batch jobs
- `analysis_queries` - Individual queries
- `page_analyses` - Page-level SEO data

See [/docs/architecture/current-data-model.md](/docs/architecture/current-data-model.md) for details.

## 🔌 API Documentation

### Edge Functions
- `analyze-citation` - Crawls and analyzes web pages
- `execute-query` - Runs queries on LLM platforms
- `generate-queries` - Creates queries from keywords
- `process-query` - Orchestrates analysis pipeline

See [/docs/api/edge-functions.md](/docs/api/edge-functions.md) for complete reference.

## 🚢 Deployment

### Frontend (Netlify)
- Automatic deployment from main branch
- Static SPA hosting
- Environment variables in Netlify dashboard

### Backend (Supabase)
- Edge functions deployed via CLI
- Database migrations via SQL scripts
- RLS policies for security

## 📖 Documentation

Comprehensive documentation available in `/docs/`:
- [Architecture Overview](/docs/architecture/current-architecture.md)
- [Data Model](/docs/architecture/current-data-model.md)
- [Edge Functions API](/docs/api/edge-functions.md)
- [Development Guide](/docs/development/supabase-cli-guide.md)
- [Quick Reference](/docs/development/quick-reference.md)

## 🔒 Security

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Service role keys for edge functions
- Environment variable isolation

## 📈 Monitoring

- Supabase Dashboard for database metrics
- Edge function logs via CLI
- Netlify Analytics for frontend

## 🛠️ Troubleshooting

Common issues and solutions in [/docs/development/quick-reference.md](/docs/development/quick-reference.md)

## 📝 Contributing

This is an internal project. For questions or issues:
- Check documentation first
- Review edge function logs
- Contact project maintainers

## 📋 License

Private/Internal Use Only

---

Last updated: January 18, 2025# Updated Tue May 27 14:19:12 EDT 2025
