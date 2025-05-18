# Edge Function Deployment Guide

## Manual Deployment Process

User manually deploys all Supabase edge functions using the following command:

```bash
npx supabase functions deploy [function-name] --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

## Key Edge Functions

1. **analyze-citation** - Analyzes citations from LLM responses
2. **execute-query** - Executes queries on ChatGPT/Perplexity
3. **process-query** - Processes query results and manages citations
4. **run-custom-analysis** - Runs custom analysis with selected queries
5. **enhance-client-with-ai** - Enhances client profiles with AI

## Important Notes

1. **Single File Structure**: Each edge function must have only one `index.ts` file
2. **No Helper Files**: All code must be in the single index.ts file
3. **Manual Deployment**: User deploys manually after local development
4. **Include `--no-verify-jwt`**: Always include this flag in deployment commands
5. **Project Reference**: Always use `--project-ref trmaeodthlywcjwfzdka`

## Example Deployment Workflow

1. Update the edge function locally:
   ```
   /supabase/functions/process-query/index.ts
   ```

2. Deploy the function:
   ```bash
   npx supabase functions deploy process-query --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
   ```

3. Monitor logs in Supabase dashboard for any errors

## Common Issues Resolved

1. **Undefined Length Errors**: Always use defensive programming
   ```typescript
   const count = Array.isArray(items) ? items.length : 0
   ```

2. **Multiple Files Error**: Keep only index.ts in each function directory

3. **Perplexity Model Error**: Use 'sonar' not 'sonar-medium-online'

## Deployment Log

- **May 18, 2025**: Complete rewrite of process-query and run-custom-analysis with defensive programming
- **May 18, 2025**: Fixed regex errors in analyze-citation
- **May 18, 2025**: Added better error logging to all functions