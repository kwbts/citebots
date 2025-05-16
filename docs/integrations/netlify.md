# Netlify Integration

## Overview

Netlify serves as the hosting and deployment platform for the Citebots application. This document outlines the configuration and deployment processes used to manage the application.

## Site Configuration

- **Site Name**: citebots
- **Custom Domain**: citebots.com
- **Framework**: Nuxt.js
- **Build Command**: `npm run build`
- **Publish Directory**: `.output/public`
- **Node Version**: 18.x

## Deployment Process

### Continuous Deployment

- Connected to GitHub repository
- Automatic deployments on push to main branch
- PR preview deployments enabled
- Deploy cancelation for outdated commits

### Branch Deployments

- `main` branch deploys to staging environment
- Tagged releases deploy to production environment
- Feature branches deploy to preview environments

## Environment Variables

The following environment variables are configured in Netlify:

```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
PERPLEXITY_API_KEY=your-perplexity-key
```

## Netlify Functions

Serverless functions are used for:

- API endpoints for client interactions
- LLM service proxying to keep API keys secure
- Background processing tasks
- Webhook handlers

### Function Configuration

- **Functions Directory**: `./netlify/functions`
- **Bundle Size Limit**: 50MB
- **Timeout**: 26 seconds (maximum allowed)

## Build Optimization

- Dependency caching enabled
- Image optimization with Netlify Image CDN
- Asset compression and minification

## Security Headers

Custom security headers are configured:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy

## Analytics and Monitoring

- Netlify Analytics enabled
- Server-side tracking without client-side JavaScript
- Error tracking with integration to monitoring service

## Deployment Validation

Before each production deployment:

1. Automated tests are run
2. Build process is validated
3. Preview deployment is manually reviewed
4. Performance metrics are checked

## Recovery Procedures

In case of deployment issues:

1. Instant rollback to previous deploy
2. Function-level rollbacks where appropriate
3. Environment variable restoration from backups