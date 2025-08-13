# Standardized Edge Function Template

This document provides a standardized template for Supabase Edge Functions in the Citebots platform. It addresses the code duplication, error handling, and architectural issues identified in the current implementation.

## Design Goals

The standardized edge function template aims to:

1. **Reduce Duplication**: Minimize repeated code across functions
2. **Standardize Error Handling**: Implement consistent error handling patterns
3. **Improve Observability**: Add structured logging and telemetry
4. **Enhance Security**: Standardize authentication and authorization
5. **Boost Maintainability**: Create a clear, consistent structure
6. **Optimize Performance**: Implement best practices for performance

## Template Structure

Each edge function should follow this structure:

```typescript
// index.ts - Edge Function Template

// ======== IMPORTS ========
// Deno standard library imports
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Status } from "https://deno.land/std@0.177.0/http/http_status.ts";

// Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// ======== CONFIGURATION ========
// CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-use-queue",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Environment configuration
const ENV = {
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
  SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") || "",
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_KEY") || "",
  // Add other environment variables as needed
};

// Validation - ensure required environment variables are present
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY || !ENV.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
}

// Function metadata
const FUNCTION_METADATA = {
  name: "function-name", // Replace with actual function name
  version: "1.0.0",
  description: "Function description"
};

// ======== TYPE DEFINITIONS ========
// Define your function-specific types here
interface RequestPayload {
  // Define your request payload structure
}

interface ResponsePayload {
  success: boolean;
  data?: any;
  error?: string;
  error_code?: string;
  metadata?: Record<string, any>;
}

// ======== ERROR DEFINITIONS ========
enum ErrorCode {
  UNAUTHORIZED = "unauthorized",
  INVALID_INPUT = "invalid_input",
  NOT_FOUND = "not_found",
  PROCESSING_ERROR = "processing_error",
  EXTERNAL_API_ERROR = "external_api_error",
  DATABASE_ERROR = "database_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown"
}

class FunctionError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;

  constructor(message: string, code: ErrorCode, statusCode: number = 400, details?: any) {
    super(message);
    this.name = "FunctionError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ======== UTILITY FUNCTIONS ========
/**
 * Create Supabase client with appropriate authentication
 */
function createSupabaseClient(authHeader?: string) {
  if (authHeader) {
    // Create client with user's JWT
    return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
  } else {
    // Create admin client with service role
    return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }
}

/**
 * Validate request payload against schema
 */
function validatePayload(payload: any, schema: any): boolean {
  // Implement validation logic
  // This could use a validation library or custom logic
  return true; // Replace with actual validation
}

/**
 * Structure logging with consistent format
 */
function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "INFO",
    function: FUNCTION_METADATA.name,
    message,
    data
  }));
}

function logError(message: string, error: any) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "ERROR",
    function: FUNCTION_METADATA.name,
    message,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof FunctionError ? {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      } : {})
    } : error
  }));
}

/**
 * Handle authentication and return user information
 */
async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new FunctionError(
      "Missing authorization header", 
      ErrorCode.UNAUTHORIZED, 
      Status.Unauthorized
    );
  }

  const supabase = createSupabaseClient(authHeader);
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new FunctionError(
      "Invalid authentication credentials", 
      ErrorCode.UNAUTHORIZED, 
      Status.Unauthorized,
      { error }
    );
  }
  
  return { user, supabase };
}

/**
 * Process OPTIONS request for CORS
 */
function handleOptionsRequest(): Response {
  return new Response(null, {
    status: Status.OK,
    headers: corsHeaders
  });
}

/**
 * Create a standard response structure
 */
function createResponse(
  payload: ResponsePayload, 
  status: number = Status.OK
): Response {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// ======== MAIN FUNCTION HANDLER ========
/**
 * Main business logic for the function
 */
async function processRequest(req: Request): Promise<ResponsePayload> {
  // Start timing the request
  const startTime = performance.now();
  
  try {
    // Parse request body
    const payload = await req.json() as RequestPayload;
    
    // Validate payload
    if (!validatePayload(payload, {})) {
      throw new FunctionError(
        "Invalid request payload", 
        ErrorCode.INVALID_INPUT, 
        Status.BadRequest
      );
    }
    
    // Authenticate user
    const { user, supabase } = await authenticateRequest(req);
    
    // Log request
    logInfo("Processing request", { userId: user.id, payload });
    
    // [FUNCTION-SPECIFIC IMPLEMENTATION GOES HERE]
    // This is where the core business logic for each function would be implemented
    
    // Example implementation:
    const result = {
      // Function-specific result data
    };
    
    // Calculate execution time
    const executionTime = performance.now() - startTime;
    
    // Return success response
    return {
      success: true,
      data: result,
      metadata: {
        execution_time_ms: Math.round(executionTime),
        function: FUNCTION_METADATA.name,
        version: FUNCTION_METADATA.version
      }
    };
  } catch (error) {
    // Log error
    logError("Request processing failed", error);
    
    // Calculate execution time even for errors
    const executionTime = performance.now() - startTime;
    
    // Format error response based on error type
    if (error instanceof FunctionError) {
      return {
        success: false,
        error: error.message,
        error_code: error.code,
        metadata: {
          execution_time_ms: Math.round(executionTime),
          function: FUNCTION_METADATA.name,
          version: FUNCTION_METADATA.version
        }
      };
    } else {
      // Handle unexpected errors
      return {
        success: false,
        error: "An unexpected error occurred",
        error_code: ErrorCode.UNKNOWN,
        metadata: {
          execution_time_ms: Math.round(executionTime),
          function: FUNCTION_METADATA.name,
          version: FUNCTION_METADATA.version
        }
      };
    }
  }
}

// ======== SERVER HANDLER ========
/**
 * Main request handler for the edge function
 */
serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return createResponse(
      {
        success: false,
        error: "Method not allowed",
        error_code: "method_not_allowed"
      },
      Status.MethodNotAllowed
    );
  }
  
  try {
    // Process the request
    const result = await processRequest(req);
    
    // Return appropriate status code based on success/failure
    const statusCode = result.success ? Status.OK : 
      (result.error_code === ErrorCode.UNAUTHORIZED ? Status.Unauthorized : Status.BadRequest);
    
    return createResponse(result, statusCode);
  } catch (error) {
    // Catch any unhandled errors as a last resort
    logError("Unhandled error in request handler", error);
    
    return createResponse(
      {
        success: false,
        error: "Internal server error",
        error_code: ErrorCode.UNKNOWN
      },
      Status.InternalServerError
    );
  }
});
```

## Extension Points

The template includes specific extension points where function-specific logic should be added:

1. **Type Definitions**: Add function-specific request/response types
2. **Payload Validation**: Implement function-specific validation logic
3. **Business Logic**: Implement the core functionality of the edge function
4. **Error Handling**: Add function-specific error types and handling
5. **Authentication Extensions**: Add role-based or resource-based authorization

## Implementation Guidelines

When implementing a specific edge function using this template:

### 1. Function Configuration

Update the `FUNCTION_METADATA` object:

```typescript
const FUNCTION_METADATA = {
  name: "analyze-citation", // Use the actual function name
  version: "1.0.0",
  description: "Analyzes web pages for citations and brand mentions"
};
```

### 2. Request/Response Types

Define specific types for your function:

```typescript
interface AnalyzeCitationRequest {
  url: string;
  brand_name: string;
  competitors?: Array<{ name: string; domain: string }>;
  options?: {
    depth: number;
    extract_text: boolean;
  };
}

interface AnalyzeCitationResponse {
  success: boolean;
  data?: {
    url: string;
    title: string;
    brand_mentions: number;
    competitor_mentions: Array<{ name: string; mentions: number }>;
    content_quality: number;
    extracted_text?: string;
  };
  error?: string;
  error_code?: string;
  metadata?: Record<string, any>;
}
```

### 3. Input Validation

Implement function-specific validation:

```typescript
function validateAnalyzeCitationRequest(payload: any): boolean {
  if (!payload.url || typeof payload.url !== 'string') {
    throw new FunctionError(
      "URL is required and must be a string", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  if (!payload.brand_name || typeof payload.brand_name !== 'string') {
    throw new FunctionError(
      "Brand name is required and must be a string", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  // Validate competitors if provided
  if (payload.competitors && !Array.isArray(payload.competitors)) {
    throw new FunctionError(
      "Competitors must be an array", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  return true;
}
```

### 4. Business Logic Implementation

Implement the core function logic:

```typescript
// Inside processRequest function
// Analyze Citation specific implementation
const { url, brand_name, competitors = [], options = {} } = payload;

// Validate request
validateAnalyzeCitationRequest(payload);

// Fetch the page using ScrapingBee
const pageContent = await fetchPageContent(url, options);

// Analyze content for brand mentions
const brandMentions = countBrandMentions(pageContent, brand_name);

// Analyze content for competitor mentions
const competitorMentions = await analyzeCompetitorMentions(pageContent, competitors);

// Calculate content quality score
const contentQuality = calculateContentQuality(pageContent);

// Return results
return {
  success: true,
  data: {
    url,
    title: extractTitle(pageContent),
    brand_mentions: brandMentions,
    competitor_mentions: competitorMentions,
    content_quality: contentQuality,
    extracted_text: options.extract_text ? extractText(pageContent) : undefined
  },
  metadata: {
    execution_time_ms: Math.round(performance.now() - startTime),
    function: FUNCTION_METADATA.name,
    version: FUNCTION_METADATA.version
  }
};
```

### 5. Error Handling

Add function-specific error handling:

```typescript
try {
  // Business logic here
} catch (error) {
  // Function-specific error handling
  if (error.name === 'ScrapingBeeError') {
    throw new FunctionError(
      `Failed to fetch page content: ${error.message}`,
      ErrorCode.EXTERNAL_API_ERROR,
      Status.BadGateway,
      { url, error: error.message }
    );
  }
  
  // Re-throw other errors to be caught by the main handler
  throw error;
}
```

### 6. Authorization Logic

Add function-specific authorization checks:

```typescript
// Check if user has permission to analyze this URL
const { data: client, error: clientError } = await supabase
  .from('clients')
  .select('id, domain')
  .or(`created_by.eq.${user.id},user_id.eq.${user.id}`)
  .single();

if (clientError || !client) {
  throw new FunctionError(
    "You don't have permission to analyze content for this client",
    ErrorCode.UNAUTHORIZED,
    Status.Forbidden
  );
}

// Check if URL domain matches client domain or is allowed
if (!isUrlAllowedForClient(url, client.domain)) {
  throw new FunctionError(
    "URL domain is not authorized for this client",
    ErrorCode.UNAUTHORIZED,
    Status.Forbidden
  );
}
```

## Performance Considerations

To ensure optimal performance:

1. **Timeout Awareness**: Always implement timeout-aware logic (edge functions have ~25s limit)
2. **Resource Cleanup**: Always clean up resources (close connections, etc.)
3. **Efficient Processing**: Implement efficient data processing patterns
4. **Caching**: Use appropriate caching strategies
5. **Error Recovery**: Implement graceful fallbacks for failures

Example timeout-aware code:

```typescript
const TIMEOUT_MS = 20000; // 20 seconds (buffer before 25s hard limit)
const startTime = performance.now();

// Periodically check for timeout approach
function isTimeoutApproaching() {
  return (performance.now() - startTime) > TIMEOUT_MS;
}

// Within processing loop
for (const item of items) {
  if (isTimeoutApproaching()) {
    // Save state and exit gracefully
    logInfo("Approaching timeout, saving state and exiting");
    return {
      success: true,
      data: { 
        partial_result: true,
        processed_items: processedCount,
        total_items: items.length
      },
      metadata: {
        execution_time_ms: Math.round(performance.now() - startTime),
        completion_percentage: Math.round((processedCount / items.length) * 100)
      }
    };
  }
  
  // Process item
  await processItem(item);
}
```

## Error Handling Strategy

The template implements a multi-layered error handling strategy:

1. **Domain-Specific Errors**: Using `FunctionError` class with error codes
2. **Graceful Degradation**: Returning partial results when possible
3. **Detailed Logging**: Structured error logs with context
4. **Client-Friendly Messages**: User-appropriate error messages
5. **Preserving Stack Traces**: Maintaining debug information for developers

## Logging Guidelines

Follow these guidelines for consistent logging:

1. **Structured Format**: Always use the provided logInfo/logError functions
2. **Appropriate Level**: Use INFO for normal operations, ERROR for exceptions
3. **Contextual Data**: Include relevant context with each log
4. **PII Awareness**: Never log sensitive user data or credentials
5. **Performance Impact**: Log important events without excessive detail

Example logging pattern:

```typescript
// Good - structured, contextual
logInfo("Processing analysis request", { 
  clientId: client.id, 
  url: url,
  options: { 
    depth: options.depth
  }
});

// Good - error with context
logError("Failed to analyze URL", { 
  error: error.message,
  url: url,
  statusCode: error.status
});

// Bad - unstructured, no context
console.log("Processing request");
console.error("Error occurred");
```

## Implementation Examples

### Example 1: analyze-citation

```typescript
// Core business logic for analyze-citation
async function analyzeCitation(
  url: string,
  brandName: string,
  competitors: Array<{ name: string; domain: string }>,
  options: any
): Promise<any> {
  // Validate URL format
  if (!isValidUrl(url)) {
    throw new FunctionError(
      "Invalid URL format", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  // Fetch page content with ScrapingBee
  const scrapingBeeApiKey = Deno.env.get("SCRAPINGBEE_API_KEY");
  if (!scrapingBeeApiKey) {
    throw new FunctionError(
      "ScrapingBee API key not configured", 
      ErrorCode.CONFIGURATION_ERROR
    );
  }
  
  // Implement timeout-aware fetching
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(url)}&premium_proxy=true`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new FunctionError(
        `ScrapingBee returned error: ${response.status}`, 
        ErrorCode.EXTERNAL_API_ERROR,
        Status.BadGateway
      );
    }
    
    const html = await response.text();
    
    // Process the content
    const results = {
      url,
      title: extractTitle(html),
      brand_mentions: countMentions(html, brandName),
      competitor_mentions: competitors.map(comp => ({
        name: comp.name,
        mentions: countMentions(html, comp.name)
      })),
      content_quality: calculateContentQuality(html),
      extracted_text: options.extract_text ? extractText(html) : undefined
    };
    
    return results;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new FunctionError(
        "ScrapingBee request timed out", 
        ErrorCode.TIMEOUT,
        Status.GatewayTimeout
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Example 2: execute-query

```typescript
// Core business logic for execute-query
async function executeQuery(
  query: string,
  provider: 'openai' | 'perplexity',
  options: any
): Promise<any> {
  // Validate query
  if (!query || query.trim().length < 3) {
    throw new FunctionError(
      "Query must be at least 3 characters", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  // Validate provider
  if (!['openai', 'perplexity'].includes(provider)) {
    throw new FunctionError(
      "Provider must be 'openai' or 'perplexity'", 
      ErrorCode.INVALID_INPUT
    );
  }
  
  // Execute query based on provider
  if (provider === 'openai') {
    return await executeOpenAIQuery(query, options);
  } else {
    return await executePerplexityQuery(query, options);
  }
}

async function executeOpenAIQuery(query: string, options: any): Promise<any> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new FunctionError(
      "OpenAI API key not configured", 
      ErrorCode.CONFIGURATION_ERROR
    );
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || "gpt-4o",
        messages: [
          {
            role: "user",
            content: query
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new FunctionError(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`, 
        ErrorCode.EXTERNAL_API_ERROR,
        response.status
      );
    }
    
    const data = await response.json();
    return {
      provider: "openai",
      model: data.model,
      response: data.choices[0].message.content,
      usage: data.usage,
      query: query
    };
  } catch (error) {
    // Re-throw FunctionError instances
    if (error instanceof FunctionError) {
      throw error;
    }
    
    // Wrap other errors
    throw new FunctionError(
      `OpenAI query execution failed: ${error.message}`, 
      ErrorCode.EXTERNAL_API_ERROR,
      Status.InternalServerError
    );
  }
}
```

## Migration Strategy

To migrate existing edge functions to this template:

1. **Create New Version**: Create a new file with the standardized template
2. **Port Business Logic**: Move the core business logic to the appropriate section
3. **Enhance Error Handling**: Update error handling to use the new pattern
4. **Add Validation**: Implement proper input validation
5. **Improve Logging**: Add structured logging throughout
6. **Test Thoroughly**: Test the new implementation against the old one
7. **Deploy**: Deploy the updated function and verify functionality
8. **Monitor**: Monitor for any regressions or issues

## Conclusion

This standardized edge function template provides a robust foundation for all Supabase Edge Functions in the Citebots platform. By implementing this template across all functions, we will:

1. **Reduce Duplication**: Eliminate repeated boilerplate code
2. **Improve Reliability**: Standardize error handling and recovery
3. **Enhance Observability**: Implement consistent logging and telemetry
4. **Strengthen Security**: Standardize authentication and authorization
5. **Increase Maintainability**: Create a consistent, understandable structure
6. **Optimize Performance**: Implement best practices for all functions

This template should be used for all new edge functions and existing functions should be progressively migrated to this structure according to the phased refactoring plan.

---

*Last updated: [YYYY-MM-DD]*