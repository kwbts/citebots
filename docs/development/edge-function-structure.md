# Supabase Edge Function Structure

## Important: Single File Requirement

Supabase Edge Functions only support a single `index.ts` file per function. Each function directory should contain ONLY:

```
supabase/functions/
├── function-name/
│   └── index.ts
```

## Common Issues

1. **Multiple files in function directory**: This will cause deployment errors
2. **Helper files**: Cannot have separate helper files - all code must be in index.ts
3. **Test files**: Should not be in the function directory

## Best Practices

1. Keep all function code in the single `index.ts` file
2. Use inline helper functions instead of separate files
3. For shared code between functions, duplicate it (no shared modules)
4. Remove any extra files before deployment

## Example Structure

✅ Correct:
```
supabase/functions/
├── analyze-citation/
│   └── index.ts
├── execute-query/
│   └── index.ts
└── process-query/
    └── index.ts
```

❌ Incorrect:
```
supabase/functions/
├── analyze-citation/
│   ├── index.ts
│   ├── helpers.ts      // This will cause issues!
│   └── types.ts        // This will cause issues!
```

## Deployment Command

Always deploy with:
```bash
npx supabase functions deploy function-name --project-ref your-project-ref --no-verify-jwt
```