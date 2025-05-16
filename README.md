# Citebots - GEO Analytics Platform

An internal application for citation analysis in LLM responses, helping organizations optimize their content for better visibility in AI-generated answers.

## 🚀 Weekend MVP Sprint

**URGENT**: Building a demo to close a business deal. Focus on working functionality over perfect UI.

### Quick Links
- [Development Plan](/docs/development/micro-steps-mvp.md)
- [Documentation](/docs/README.md)
- [Claude Instructions](/CLAUDE.md)

## 📦 Tech Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Netlify
- **APIs**: OpenAI, Anthropic, Google, Perplexity

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your Supabase and API keys to .env

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 📁 Project Structure

```
kb-citebots/
├── app/                # Nuxt 3 application
├── server/             # API routes and middleware
├── services/           # Business logic
├── lib/                # Shared utilities
├── netlify/            # Edge functions
└── docs/               # Documentation
```

## 🎯 MVP Features

- [ ] User authentication
- [ ] Client management
- [ ] Citation analysis
- [ ] Results display
- [ ] Share links

## 📖 Documentation

See the `/docs` directory for comprehensive documentation:
- Project overview and philosophy
- Architecture and system design
- Development guides
- API documentation

## 🔐 Environment Variables

Required environment variables (see `.env.example`):
- Supabase credentials
- LLM API keys
- Site configuration

## 🚢 Deployment

The site is deployed to Netlify with automatic builds from the main branch.

```bash
# Manual deployment
netlify deploy --prod
```

## 📝 License

Private/Internal Use Only