# Deployment Checklist

## Pre-Deployment

- [ ] Code tested locally with `npm run dev`
- [ ] No console errors in browser
- [ ] All routes work correctly
- [ ] Assets load properly

## Deployment Configuration

### nuxt.config.ts
- [ ] `ssr: false` for SPA mode
- [ ] `nitro.preset: 'static'` explicitly set
- [ ] CSS path correct: `~/assets/css/main.css`

### netlify.toml
- [ ] Build command: `npm run generate`
- [ ] Publish directory: `.output/public`
- [ ] NITRO_PRESET=static in environment
- [ ] SPA redirects configured

### package.json
- [ ] Generate script has NITRO_PRESET: `"generate": "NITRO_PRESET=static nuxt generate"`

## Files Check
- [ ] `public/_redirects` exists with `/*    /index.html   200`
- [ ] All pages in correct location (`pages/` directory)
- [ ] Assets in correct location (`assets/` directory)

## Deployment Steps

1. **Commit changes**
   ```bash
   git add -A
   git commit -m "Your commit message"
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Monitor Netlify build**
   - Check build logs for errors
   - Verify "static" preset is being used
   - Ensure no server function errors

4. **Verify deployment**
   - Visit site URL
   - Test direct page access
   - Check console for errors
   - Test all navigation

## Common Errors to Watch For

- ❌ "Building for Nitro preset: `netlify-legacy`" → Should be `static`
- ❌ "ENOENT: no such file or directory, open '.netlify/functions-internal/server/server.json'"
- ❌ Blank page → Check browser console
- ❌ 404 on direct page access → Check redirects

## Success Indicators

- ✅ "Building for Nitro preset: `static`"
- ✅ "Generated public dist"
- ✅ No server function errors
- ✅ Site loads with proper styling
- ✅ Navigation works correctly

## If Deployment Fails

1. Check build logs on Netlify
2. Verify NITRO_PRESET is set correctly
3. Ensure generate command is used (not build)
4. Check file paths in nuxt.config.ts
5. Clear Netlify cache and retry

## Quick Fix Commands

```bash
# Force static generation
NITRO_PRESET=static npm run generate

# Test generated output locally
npm run preview

# Manual deploy to Netlify
netlify deploy --prod
```