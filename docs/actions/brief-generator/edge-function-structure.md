# Content Brief Generator Edge Function Structure

This document outlines the proposed structure for the Content Brief Generator edge function, including the main components, helper functions, and implementation considerations.

## Edge Function Structure

Since Supabase Edge Functions are limited to a single `index.ts` file, we need to organize the code efficiently within this constraint. Below is the recommended structure for the edge function.

```typescript
// content-brief-generator/index.ts

// Core imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Types
interface BriefRequest {
  client_id: string;
  title: string;
  keywords: string[];
  purpose?: 'inform' | 'convert' | 'awareness' | 'authority' | 'seo';
  audience?: 'beginners' | 'intermediate' | 'advanced' | 'decision-makers';
  style_guide?: string;
  custom_instructions?: string;
}

interface ClientData {
  id: string;
  name: string;
  domain: string;
  industry_primary?: string;
  target_audience?: string[];
  key_products?: string[];
  unique_selling_props?: string[];
  brand_voice?: string[];
  customer_problems?: string[];
  use_cases?: string[];
  // Additional client fields as needed
}

interface CompetitorData {
  id: string;
  client_id: string;
  name: string;
  domain: string;
  // Additional competitor fields as needed
}

interface GeneratedQuery {
  query_text: string;
  intent: string;
  source: 'chatgpt' | 'perplexity' | 'google';
}

interface ResearchResult {
  query: string;
  source: string;
  content: string;
  url?: string;
  title?: string;
  is_competitor?: boolean;
}

interface ContentBrief {
  id: string;
  client_id: string;
  title: string;
  meta: {
    client_name: string;
    client_domain: string;
    client_info: Partial<ClientData>;
    keywords: string[];
    purpose: string;
    audience: string;
    generated_at: string;
    research_stats: {
      llm_queries_executed: number;
      google_searches_performed: number;
      pages_analyzed: number;
      competitor_pages_analyzed: number;
    }
  };
  summary: string;
  content_suggestions: Array<{
    suggestion: string;
    importance: number;
    rationale: string;
  }>;
  table_of_contents: Array<{
    title: string;
    points: string[];
  }>;
  research_links: Array<{
    title: string;
    url: string;
    description: string;
    source_type: 'research' | 'news' | 'academic' | 'industry';
  }>;
  process_notes: {
    llm_responses: string[];
    search_results: string[];
    competitor_insights: string[];
  };
}

// --- Helper Functions ---

// 1. Request Validation
async function validateRequest(req: Request, supabase: any): Promise<{ valid: boolean; user?: any; client?: ClientData; error?: string }> {
  // Implementation: Validate auth token, check user permissions, verify client exists
}

// 2. Client Data Retrieval
async function getClientData(clientId: string, supabase: any): Promise<{ client: ClientData; competitors: CompetitorData[] }> {
  // Implementation: Fetch client profile and competitors
}

// 3. AI Query Generation
async function generateResearchQueries(
  clientData: ClientData,
  briefRequest: BriefRequest,
  openAiKey: string
): Promise<GeneratedQuery[]> {
  // Implementation: Generate diverse research queries using OpenAI
}

// 4. ChatGPT Research
async function performChatGptResearch(
  queries: GeneratedQuery[],
  clientData: ClientData,
  openAiKey: string
): Promise<ResearchResult[]> {
  // Implementation: Execute research queries with ChatGPT
}

// 5. Perplexity Research
async function performPerplexityResearch(
  queries: GeneratedQuery[],
  clientData: ClientData,
  perplexityKey: string
): Promise<ResearchResult[]> {
  // Implementation: Execute research queries with Perplexity
}

// 6. Google Search
async function performGoogleSearch(
  keyword: string,
  clientDomain: string,
  googleApiKey: string
): Promise<ResearchResult[]> {
  // Implementation: Execute Google searches and extract results
}

// 7. Web Content Scraping
async function scrapeWebContent(
  urls: string[],
  scrapingBeeKey: string
): Promise<ResearchResult[]> {
  // Implementation: Scrape and extract content from URLs
}

// 8. Content Analysis
async function analyzeContent(
  researchResults: ResearchResult[],
  clientData: ClientData,
  competitors: CompetitorData[],
  openAiKey: string
): Promise<{
  summary: string;
  content_suggestions: ContentBrief['content_suggestions'];
  competitor_insights: string[];
}> {
  // Implementation: Analyze research results and generate insights
}

// 9. Table of Contents Generation
async function generateTableOfContents(
  title: string,
  keywords: string[],
  researchResults: ResearchResult[],
  clientData: ClientData,
  analysisResults: any,
  openAiKey: string
): Promise<ContentBrief['table_of_contents']> {
  // Implementation: Generate structured TOC with explanatory points
}

// 10. Research Links Compilation
async function compileResearchLinks(
  researchResults: ResearchResult[],
  competitors: CompetitorData[],
  openAiKey: string
): Promise<ContentBrief['research_links']> {
  // Implementation: Identify and verify quality research sources
}

// 11. Brief Assembly
async function assembleBrief(
  briefRequest: BriefRequest,
  clientData: ClientData,
  researchResults: ResearchResult[],
  analysisResults: any,
  tableOfContents: ContentBrief['table_of_contents'],
  researchLinks: ContentBrief['research_links'],
  stats: any
): Promise<ContentBrief> {
  // Implementation: Assemble complete brief from components
}

// --- Main Handler Function ---
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Initialize environment and clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || '';
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY') || '';
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY') || '';
    const scrapingBeeKey = Deno.env.get('SCRAPINGBEE_API_KEY') || '';
    
    // Validate environment
    if (!supabaseUrl || !supabaseKey || !openAiKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const briefRequest: BriefRequest = await req.json();
    
    // Validate request and permissions
    const { valid, user, client, error } = await validateRequest(req, supabase);
    if (!valid) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'validation_error', message: error } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get client data
    const { client: clientData, competitors } = await getClientData(briefRequest.client_id, supabase);
    
    // Generate research queries
    const queries = await generateResearchQueries(clientData, briefRequest, openAiKey);
    
    // Execute research in parallel
    const [chatGptResults, perplexityResults, googleResults] = await Promise.all([
      performChatGptResearch(queries, clientData, openAiKey),
      perplexityKey ? performPerplexityResearch(queries, clientData, perplexityKey) : [],
      performGoogleSearch(briefRequest.keywords[0], clientData.domain, googleApiKey)
    ]);
    
    // Compile all research results
    const allResearchResults = [...chatGptResults, ...perplexityResults, ...googleResults];
    
    // Get URLs to scrape
    const urlsToScrape = allResearchResults
      .filter(r => r.url)
      .map(r => r.url as string);
    
    // Scrape web content
    const scrapedContent = await scrapeWebContent(urlsToScrape, scrapingBeeKey);
    
    // Combine all research
    const completeResearchResults = [
      ...allResearchResults,
      ...scrapedContent
    ];
    
    // Analyze content
    const analysisResults = await analyzeContent(
      completeResearchResults,
      clientData,
      competitors,
      openAiKey
    );
    
    // Generate table of contents
    const tableOfContents = await generateTableOfContents(
      briefRequest.title,
      briefRequest.keywords,
      completeResearchResults,
      clientData,
      analysisResults,
      openAiKey
    );
    
    // Compile research links
    const researchLinks = await compileResearchLinks(
      completeResearchResults,
      competitors,
      openAiKey
    );
    
    // Research stats
    const researchStats = {
      llm_queries_executed: queries.length,
      google_searches_performed: googleResults.length,
      pages_analyzed: scrapedContent.length,
      competitor_pages_analyzed: scrapedContent.filter(r => 
        competitors.some(c => r.url?.includes(c.domain))
      ).length
    };
    
    // Assemble final brief
    const brief = await assembleBrief(
      briefRequest,
      clientData,
      completeResearchResults,
      analysisResults,
      tableOfContents,
      researchLinks,
      researchStats
    );
    
    // Store brief in database
    const { data: savedBrief, error: saveError } = await supabase
      .from('content_briefs')
      .insert({
        client_id: briefRequest.client_id,
        title: brief.title,
        keywords: briefRequest.keywords,
        purpose: briefRequest.purpose || 'inform',
        audience: briefRequest.audience || 'intermediate',
        content: brief,
        created_by: user.id
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving brief:', saveError);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, brief }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error generating content brief:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'process_error',
          message: error.message || 'Error generating content brief',
          details: { stack: error.stack }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

## Implementation Considerations

### Error Handling

The edge function should implement comprehensive error handling:

1. **Input Validation**
   - Validate all required fields and formats
   - Check for reasonable content lengths
   - Validate client permissions

2. **API Error Handling**
   - Implement retry logic for transient errors
   - Handle rate limiting for external APIs
   - Gracefully degrade if non-critical APIs are unavailable

3. **Timeout Management**
   - Implement timeouts for all external API calls
   - Use promise timeouts for long-running operations
   - Return partial results if some steps time out

### Performance Optimization

To ensure the edge function performs efficiently:

1. **Parallel Execution**
   - Use `Promise.all` for independent operations
   - Implement batching for similar API calls
   - Cache intermediate results

2. **Resource Management**
   - Monitor memory usage during execution
   - Implement streaming for large responses
   - Clean up resources properly

3. **Caching Strategy**
   - Cache client and competitor data
   - Implement result caching with TTL
   - Use consistent cache keys

### Database Schema

The function assumes the following database schema:

```sql
-- Client briefs table
CREATE TABLE content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  audience TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE content_briefs ENABLE ROW LEVEL SECURITY;

-- Policy for brief access
CREATE POLICY "Users can view briefs for clients they have access to"
ON content_briefs
FOR SELECT
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = content_briefs.client_id
    AND (clients.created_by = auth.uid() OR clients.user_id = auth.uid())
  )
);
```

### Environment Variables

The edge function requires these environment variables:

- `SUPABASE_URL`: The Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database operations
- `OPENAI_API_KEY`: OpenAI API key for content generation
- `PERPLEXITY_API_KEY`: Optional Perplexity API key
- `GOOGLE_API_KEY`: Google Search API key
- `SCRAPINGBEE_API_KEY`: ScrapingBee API key for web scraping

### Deployment Notes

When deploying this edge function:

1. **Environment Setup**
   - Ensure all environment variables are set
   - Configure appropriate timeout settings
   - Set up proper CORS configuration

2. **Memory Considerations**
   - Monitor memory usage during testing
   - Implement chunking for large operations
   - Consider splitting into multiple functions if needed

3. **Security**
   - Validate all user inputs
   - Implement proper authentication checks
   - Sanitize outputs for storage