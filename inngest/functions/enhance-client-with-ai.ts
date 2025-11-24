import { inngest } from "../client";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

interface EnhanceClientData {
  clientId: string;
  clientName: string;
  clientDomain: string;
}

interface CompetitorData {
  name: string;
  domain: string;
}

interface ChatGPTEnhancementData {
  industry_primary?: string;
  industry_secondary?: string;
  sub_industry?: string;
  business_model?: string;
  target_audience?: string[];
  key_products?: string[];
  unique_selling_props?: string[];
  geographic_focus?: string;
  geographic_regions?: string[];
  brand_voice?: string[];
  customer_problems?: string[];
  use_cases?: string[];
  industry_terminology?: string[];
  regulatory_considerations?: string[];
  competitors?: CompetitorData[];
}

// Helper function to limit array fields
function limitArrayFields(data: any): any {
  const result = { ...data };

  // Competitors get 5 items
  const competitorFields = ['competitors'];
  competitorFields.forEach(field => {
    if (Array.isArray(result[field])) {
      result[field] = result[field].slice(0, 5);
    } else if (result[field]) {
      result[field] = [result[field]].slice(0, 5);
    } else {
      result[field] = [];
    }
  });

  // All other fields get 3 items max
  const standardFields = [
    'target_audience', 'key_products', 'unique_selling_props',
    'geographic_regions', 'brand_voice', 'customer_problems',
    'use_cases', 'industry_terminology', 'regulatory_considerations'
  ];

  standardFields.forEach(field => {
    if (Array.isArray(result[field])) {
      result[field] = result[field].slice(0, 3);
    } else if (result[field]) {
      result[field] = [result[field]].slice(0, 3);
    } else {
      result[field] = [];
    }
  });

  return result;
}

// Main Inngest function to enhance client with AI
export const enhanceClientWithAI = inngest.createFunction(
  {
    id: "enhance-client-with-ai",
    name: "Enhance Client Profile with AI",
    retries: 2, // Retry on failure
    concurrency: {
      limit: 3 // Limit to 3 concurrent AI enhancement requests
    }
  },
  { event: "client/enhance.requested" },
  async ({ event, step }) => {
    const { clientId, clientName, clientDomain } = event.data as EnhanceClientData;

    // Step 1: Call OpenAI to get business intelligence
    const rawData = await step.run("call-openai-for-intelligence", async () => {
      const openAIKey = process.env.OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openai = new OpenAI({ apiKey: openAIKey });

      const prompt = `Analyze ${clientName} (website: ${clientDomain}) and provide business intelligence. Focus on finding highly relevant, specific information. Competitors should be direct competitors based on attributes similar to ${clientName}.

Return ONLY a JSON object with this exact structure:

{
  "industry_primary": "primary industry (1-3 words)",
  "industry_secondary": "secondary industry (1-3 words)",
  "sub_industry": "specific niche (1-4 words)",
  "business_model": "B2B/B2C/B2B2C/etc",
  "target_audience": ["audience1", "audience2", "audience3"],
  "key_products": ["product1", "product2", "product3"],
  "unique_selling_props": ["usp1", "usp2", "usp3"],
  "geographic_focus": "global/regional/local",
  "geographic_regions": ["region1", "region2", "region3"],
  "brand_voice": ["voice1", "voice2", "voice3"],
  "customer_problems": ["problem1", "problem2", "problem3"],
  "use_cases": ["case1", "case2", "case3"],
  "industry_terminology": ["term1", "term2", "term3"],
  "regulatory_considerations": ["reg1", "reg2", "reg3"],
  "competitors": [
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"}
  ]
}

IMPORTANT: Return exactly 5 competitors and 3 items for other arrays. Use valid JSON format only.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a business research assistant. Your goal is to provide accurate and specific information. Research companies and return accurate business data in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty content from OpenAI');
      }

      const parsed = JSON.parse(content) as ChatGPTEnhancementData;
      return parsed;
    });

    // Step 2: Limit array fields and prepare data
    const enhancedData = await step.run("process-ai-data", async () => {
      const limited = limitArrayFields(rawData);

      // Separate competitors from client data
      const { competitors, ...clientData } = limited;

      return {
        clientData: {
          ...clientData,
          ai_enhanced_at: new Date().toISOString(),
          ai_enhancement_count: 1,
          ai_enhancement_status: 'completed'
        },
        competitors: competitors || []
      };
    });

    // Step 3: Update client in database
    await step.run("update-client-record", async () => {
      const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase
        .from('clients')
        .update(enhancedData.clientData)
        .eq('id', clientId);

      if (error) {
        throw new Error(`Failed to update client: ${error.message}`);
      }

      return { updated: true };
    });

    // Step 4: Upsert competitors (each as a separate substep for reliability)
    const competitorResults = await step.run("upsert-competitors", async () => {
      const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const results = [];

      for (const competitor of enhancedData.competitors) {
        if (competitor.name && competitor.domain) {
          const { error } = await supabase
            .from('competitors')
            .upsert({
              client_id: clientId,
              name: competitor.name,
              domain: competitor.domain,
              source: 'ai',
              ai_data: { enhanced_data: enhancedData.clientData }
            }, {
              onConflict: 'client_id,domain'
            });

          if (error) {
            results.push({ competitor: competitor.name, success: false, error: error.message });
          } else {
            results.push({ competitor: competitor.name, success: true });
          }
        }
      }

      return results;
    });

    // Return summary
    return {
      success: true,
      clientId,
      clientName,
      enhanced: true,
      competitorsAdded: competitorResults.filter(r => r.success).length,
      competitorsFailed: competitorResults.filter(r => !r.success).length,
      summary: {
        total_fields_enhanced: Object.keys(enhancedData.clientData).length,
        competitors_processed: enhancedData.competitors.length
      }
    };
  }
);
