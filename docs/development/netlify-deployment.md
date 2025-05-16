# Netlify Deployment Guide

## Overview

This guide documents how we deploy our Nuxt 3 SPA to Netlify. We learned several important lessons during the initial deployment that are crucial for future reference.

## Key Configuration

### 1. Force Static Preset

**Problem**: Nuxt auto-detects Netlify and tries to use server functions, causing deployment failures.

**Solution**: Explicitly force the static preset in multiple places:

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // SPA mode
  nitro: {
    preset: 'static',
    output: {
      publicDir: '.output/public'
    }
  }
})
```

### 2. Environment Variables

Set the preset in Netlify environment:

```toml
# netlify.toml
[build.environment]
  NODE_VERSION = "18"
  NITRO_PRESET = "static"
```

### 3. Build Commands

Use generate command with explicit preset:

```json
// package.json
{
  "scripts": {
    "generate": "NITRO_PRESET=static nuxt generate"
  }
}
```

## Complete Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"
  NITRO_PRESET = "static"

# SPA fallback for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## SPA Routing

For client-side routing to work properly:

1. Create `public/_redirects` file:
```
/*    /index.html   200
```

2. Configure redirects in `netlify.toml` (as shown above)

## Deployment Process

1. **Development**: `npm run dev` (runs on port 3000-3002)
2. **Build Locally**: `npm run generate` (creates static files)
3. **Deploy**: 
   - Automatic: Push to GitHub main branch
   - Manual: `netlify deploy --prod`

## Common Issues & Solutions

### Issue 1: Blank Page on Netlify
**Cause**: Build output mismatch or missing SPA fallback
**Solution**: Ensure correct publish directory and redirects

### Issue 2: Server Function Errors
**Cause**: Nuxt auto-detecting Netlify environment
**Solution**: Force static preset (NITRO_PRESET=static)

### Issue 3: Missing Files Error
**Error**: "ENOENT: no such file or directory, open '.netlify/functions-internal/server/server.json'"
**Solution**: This means Nuxt is trying to build server functions. Force static preset.

## File Structure

After generate command:
```
.output/
├── public/          # This gets deployed to Netlify
│   ├── index.html   # Main SPA entry point
│   ├── _nuxt/       # Built assets
│   └── _redirects   # Netlify routing
```

## Environment Setup

1. Connect GitHub repo to Netlify
2. Set build command: `npm run generate`
3. Set publish directory: `.output/public`
4. Add environment variable: `NITRO_PRESET=static`

## Verification

After deployment, check:
1. Site loads at root URL
2. Direct page access works (e.g., /dashboard)
3. Client-side navigation works
4. Assets load correctly

## Quick Deploy Commands

```bash
# Generate static files
npm run generate

# Deploy to Netlify (preview)
netlify deploy

# Deploy to production
netlify deploy --prod

# Or use npm script
npm run deploy
```

## Important Notes

1. **Always force static preset** - Nuxt's auto-detection will break SPA deployments
2. **SPA fallback is crucial** - Without it, direct URL access fails
3. **Use generate, not build** - Build creates SSR output, generate creates static files
4. **Check build logs** - Netlify provides detailed error messages

## Troubleshooting Checklist

- [ ] Is `ssr: false` in nuxt.config.ts?
- [ ] Is `nitro.preset: 'static'` set?
- [ ] Is `NITRO_PRESET=static` in environment?
- [ ] Is publish directory `.output/public`?
- [ ] Are redirects configured for SPA?
- [ ] Is the generate command used instead of build?

This configuration ensures a successful Nuxt 3 SPA deployment to Netlify every time!