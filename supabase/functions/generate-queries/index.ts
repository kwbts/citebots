import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Generate queries with diverse intent types:
// 1. informational - Seeking general knowledge
// 2. navigational - Looking for a specific website/resource
// 3. transactional - Intent to take an action (purchase, download)
// 4. commercial - Researching before a purchase decision
// 5. educational - Seeking to learn about a topic in depth
// 6. opinion - Looking for subjective views or recommendations
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
async function generateDiverseQueries(keyword, clientInfo, count = 2, selectedIntents = []) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  const clientContext = `
Client: ${clientInfo.name}
Industry: ${clientInfo.industry || 'Not specified'}
Target Audience: ${clientInfo.target_audience?.join(', ') || 'General'}
Key Products: ${clientInfo.key_products?.join(', ') || 'Not specified'}
Unique Selling Props: ${clientInfo.unique_selling_props?.join(', ') || 'Not specified'}
Brand Voice: ${clientInfo.brand_voice?.join(', ') || 'Professional'}
Customer Problems: ${clientInfo.customer_problems?.join(', ') || 'Not specified'}
Use Cases: ${clientInfo.use_cases?.join(', ') || 'Not specified'}
`;

  // Build the list of intent types based on the selected intents
  const intentTypes = [
    { key: 'informational', desc: 'Seeking general knowledge' },
    { key: 'navigational', desc: 'Looking for a specific website/resource' },
    { key: 'transactional', desc: 'Intent to take an action (purchase, download)' },
    { key: 'commercial', desc: 'Researching before a purchase decision' },
    { key: 'local', desc: 'Seeking location-specific information' },
    { key: 'support', desc: 'Looking for help with a problem' },
    { key: 'educational', desc: 'Seeking to learn about a topic in depth' },
    { key: 'opinion', desc: 'Looking for subjective views or recommendations' }
  ];

  // Filter intent types if specific intents were selected
  const filteredIntentTypes = selectedIntents && selectedIntents.length > 0
    ? intentTypes.filter(type => selectedIntents.includes(type.key))
    : intentTypes;

  // Create a formatted list of intent types for the prompt
  const intentTypesList = filteredIntentTypes
    .map((type, index) => `${index + 1}. ${type.key.toUpperCase()}: ${type.desc}`)
    .join('\n');

  const prompt = `Role: You are an expert at generating high quality, natural language queries to be used in LLMs like ChatGPT, Perplexity, Claude, Gemini and others. You take keywords and turn them into queries for the user.

These queries will be used to help the user perform market research.

Keyword: "${keyword}"

Client Context:
${clientContext}

Consider the clientContext you've been provided as general information. It's not necessary or preferable for the "Client Name" to be used in every query, but it is important for certain types of queries. The clientContext is to help you understand the industry and positioning of the client. You should think like a prospective customer of the user, and imagine how the queries/keyword you use would help you solve a problem.

What type of queries do you think would a prospective customer ask an LLM when it relates to this product category?

Don't be overly complex or contrived in queries.

Generate exactly ${count} diverse queries with different intent types from ONLY the following types:
${intentTypesList}

Return ONLY a JSON object with a "queries" array. Each query should be an object with "text" and "intent":
{"queries": [{"text": "What are the key features to look for in email marketing software?", "intent": "commercial"}, {"text": "How do I set up automated email sequences?", "intent": "educational"}]}

Focus on natural, problem-solving queries that prospective customers would actually ask.`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at generating natural search queries that real users would type or ask. Generate diverse, realistic queries. Return only valid JSON objects.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }
  const data = await response.json();
  console.log('OpenAI response:', data);

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenAI response structure:', data);
    throw new Error('Invalid response structure from OpenAI');
  }

  let result;
  try {
    const content = data.choices[0].message.content;
    console.log('Content to parse:', content);

    if (!content) {
      throw new Error('Empty content from OpenAI');
    }

    // Clean content in case it has markdown formatting
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('Cleaned content:', cleanedContent);

    result = JSON.parse(cleanedContent);
    console.log('Parsed result:', result);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    console.error('Original content was:', data.choices[0].message.content);
    throw new Error('Invalid response format from OpenAI');
  }

  // Extract queries and ensure proper format
  const queries = result.queries || [];
  console.log('Extracted queries:', queries);

  if (!Array.isArray(queries) || queries.length === 0) {
    console.error('No valid queries found in result:', result);
    throw new Error('No queries generated by OpenAI');
  }

  // Ensure each query has the expected format
  const formattedQueries = queries.map(query => {
    if (typeof query === 'string') {
      // Fallback for old format
      return { text: query, intent: 'informational' };
    }
    return {
      text: query.text || query.query || '',
      intent: query.intent || 'informational'
    };
  }).filter(q => q.text.length > 0);

  console.log('Formatted queries:', formattedQueries);
  return formattedQueries;
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    console.log('Generate queries request received');
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        persistSession: false
      }
    });
    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    // Parse request
    const body = await req.json();
    console.log('Request body:', body);
    const { client_id, keywords, count = 3, intents } = body; // Default to 3 diverse queries per keyword
    // Fetch client info
    console.log('Fetching client:', client_id);
    const { data: client, error: clientError } = await supabaseClient.from('clients').select('*, competitors(*)').eq('id', client_id).eq('created_by', user.id).single();
    console.log('Client data:', client, 'Error:', clientError);
    if (clientError || !client) {
      throw new Error('Client not found or unauthorized');
    }
    // Generate diverse queries for each keyword
    const allQueries = [];
    console.log('Starting diverse query generation for keywords:', keywords);

    // Log the selected intents
    console.log('Selected intent types:', intents || 'All intents');

    for (const keyword of keywords) {
      try {
        console.log(`Generating ${count} diverse queries for keyword: ${keyword}`);
        const queries = await generateDiverseQueries(keyword, client, count, intents);
        console.log(`Generated ${queries.length} queries for ${keyword}`);

        // Format queries with metadata
        const formattedQueries = queries.map((query) => ({
          query_text: query.text,
          keyword: keyword,
          intent: query.intent,
          selected: true,
          metadata: {
            client_name: client.name,
            client_domain: client.domain,
            generated_at: new Date().toISOString(),
            generation_approach: 'diverse_intents',
            selected_intents: intents || 'all'
          }
        }));

        allQueries.push(...formattedQueries);
      } catch (error) {
        console.error(`Error generating queries for ${keyword}:`, error);

        // Create fallback queries based on selected intents
        let fallbackQueries = [];

        // Default fallbacks for each intent type
        const allFallbacks = {
          'informational': { text: `What is ${keyword}?`, intent: 'informational' },
          'commercial': { text: `Best ${keyword} tools`, intent: 'commercial' },
          'educational': { text: `How to use ${keyword}`, intent: 'educational' },
          'navigational': { text: `Find ${keyword} website`, intent: 'navigational' },
          'transactional': { text: `Buy ${keyword} service`, intent: 'transactional' },
          'opinion': { text: `Is ${keyword} worth it?`, intent: 'opinion' },
          'local': { text: `${keyword} near me`, intent: 'local' },
          'support': { text: `${keyword} troubleshooting guide`, intent: 'support' }
        };

        // If specific intents are selected, use only those for fallbacks
        if (intents && intents.length > 0) {
          fallbackQueries = intents
            .filter(intent => allFallbacks[intent])
            .map(intent => allFallbacks[intent]);
        } else {
          // Otherwise use the default three
          fallbackQueries = [
            allFallbacks.informational,
            allFallbacks.commercial,
            allFallbacks.educational
          ];
        }

        fallbackQueries.slice(0, count).forEach(fallback => {
          allQueries.push({
            query_text: fallback.text,
            keyword: keyword,
            intent: fallback.intent,
            selected: true,
            metadata: {
              client_name: client.name,
              client_domain: client.domain,
              generated_at: new Date().toISOString(),
              fallback: true,
              selected_intents: intents || 'all'
            }
          });
        });
      }
    }
    console.log(`Total queries generated: ${allQueries.length}`);
    return new Response(JSON.stringify({
      success: true,
      queries: allQueries,
      total: allQueries.length,
      client: {
        id: client.id,
        name: client.name,
        domain: client.domain
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error generating queries:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
