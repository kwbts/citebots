import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Detailed logging helper
function log(message: string, data?: any): void {
  console.log(`[content-brief-generator] ${message}`, data ? JSON.stringify(data) : '');
}

// Helper function to validate required fields
function validateRequestBody(body: any): string | null {
  log('Validating request body', body);
  
  const requiredFields = ['title', 'keywords', 'purpose', 'audience', 'platforms'];
  
  // Check if required fields are present
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  
  // Validate keywords array
  if (!Array.isArray(body.keywords) || body.keywords.length === 0) {
    return 'Keywords must be a non-empty array';
  }
  
  // Validate platforms object
  if (typeof body.platforms !== 'object') {
    return 'Platforms must be an object';
  }
  
  // Ensure at least one platform is selected
  if (!body.platforms.chatGpt && !body.platforms.perplexity && !body.platforms.google) {
    return 'At least one research platform must be selected';
  }
  
  // All validations passed
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed',
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
  
  try {
    log('Brief generation request received');
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    // Create Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
      },
    });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      log('User authentication error', userError);
      throw new Error('Unauthorized');
    }
    log('User authenticated', { id: user.id });
    
    // Parse request body
    const body = await req.json();
    log('Request body received', body);
    
    // Validate request body
    const validationError = validateRequestBody(body);
    if (validationError) {
      log('Validation error', validationError);
      throw new Error(validationError);
    }
    
    // Extract data from request
    const {
      clientId,
      title,
      keywords,
      purpose,
      audience,
      styleGuide,
      customInstructions,
      researchDepth: 'comprehensive', // Always use comprehensive research
      platforms,
    } = body;
    
    // Fetch client data if client ID is provided
    let clientData = null;
    if (clientId && clientId !== 'null') {
      log('Fetching client data', { clientId });
      
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .select('*, competitors(*)')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        log('Error fetching client data', clientError);
        throw new Error(`Error fetching client data: ${clientError.message}`);
      }
      
      if (!client) {
        log('Client not found', { clientId });
        throw new Error('Client not found');
      }
      
      // Check if user has access to this client
      if (client.created_by !== user.id) {
        // Check if the user is a super admin
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!profile || profile.role !== 'super_admin') {
          log('Access denied to client', { clientId, userId: user.id });
          throw new Error('You do not have access to this client');
        }
      }
      
      clientData = client;
      log('Client data fetched successfully', { 
        clientName: client.name,
        competitorsCount: client.competitors?.length || 0
      });
    } else {
      log('No client ID provided, creating a generic brief');
    }
    
    // Create brief record in database
    const briefData = {
      client_id: clientId === 'null' ? null : clientId,
      title,
      keywords,
      purpose,
      audience,
      style_guide: styleGuide || null,
      custom_instructions: customInstructions || null,
      research_depth: 'comprehensive', // Always use comprehensive research
      platforms,
      status: 'pending',
      created_by: user.id,
      logs: {
        created: new Date().toISOString(),
        steps: [{
          step: 'brief_created',
          timestamp: new Date().toISOString(),
          data: {
            client_id: clientId === 'null' ? null : clientId,
            title,
            keywords: keywords.length,
            platforms: Object.keys(platforms).filter(p => platforms[p])
          }
        }]
      }
    };
    
    log('Creating brief record in database', briefData);
    const { data: brief, error: insertError } = await supabaseClient
      .from('content_briefs')
      .insert(briefData)
      .select()
      .single();
    
    if (insertError) {
      log('Error creating brief record', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }
    
    log('Brief record created successfully', { briefId: brief.id });
    
    // Return the brief ID and estimated time
    return new Response(JSON.stringify({
      success: true,
      briefId: brief.id,
      message: 'Brief generation started',
      estimatedTime: '2-3 minutes'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    log('Error processing request', { message: error.message, stack: error.stack });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});