/**
 * API Connectivity Debug Script
 * 
 * Simple, clear checks for each API with minimal output
 */

require('dotenv').config();
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const { Configuration, OpenAIApi } = require('openai');

// API Keys
const KEYS = {
  OPENAI: process.env.OPENAI_API_KEY,
  CLAUDE: process.env.CLAUDE_API_KEY,
  PERPLEXITY: process.env.PERPLEXITY_API_KEY,
  SCRAPINGBEE: process.env.SCRAPINGBEE_API_KEY
};

// Test results container
const results = {};

// Test OpenAI API
async function testOpenAI() {
  if (!KEYS.OPENAI) {
    return "❌ OPENAI_API_KEY not configured";
  }
  
  try {
    const configuration = new Configuration({ apiKey: KEYS.OPENAI });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say OK if you can hear me" }],
      max_tokens: 10
    });
    
    return response.data?.choices?.[0]?.message?.content?.includes("OK") ? 
      "✅ OpenAI API connection successful" : 
      "⚠️ OpenAI API connected but unexpected response";
  } catch (error) {
    return `❌ OpenAI API error: ${error.message.substring(0, 100)}`;
  }
}

// Test Claude API
async function testClaude() {
  if (!KEYS.CLAUDE) {
    return "❌ CLAUDE_API_KEY not configured";
  }
  
  try {
    const anthropic = new Anthropic({ apiKey: KEYS.CLAUDE });
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say OK if you can hear me" }]
    });
    
    return response.content?.[0]?.text?.includes("OK") ? 
      "✅ Claude API connection successful" : 
      "⚠️ Claude API connected but unexpected response";
  } catch (error) {
    return `❌ Claude API error: ${error.message.substring(0, 100)}`;
  }
}

// Test Perplexity API
async function testPerplexity() {
  if (!KEYS.PERPLEXITY) {
    return "❌ PERPLEXITY_API_KEY not configured";
  }
  
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [{ role: 'user', content: 'Say OK if you can hear me' }],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${KEYS.PERPLEXITY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data?.choices?.[0]?.message?.content?.includes("OK") ? 
      "✅ Perplexity API connection successful" : 
      "⚠️ Perplexity API connected but unexpected response";
  } catch (error) {
    return `❌ Perplexity API error: ${error.response?.status || error.message.substring(0, 100)}`;
  }
}

// Test ScrapingBee API
async function testScrapingBee() {
  if (!KEYS.SCRAPINGBEE) {
    return "❌ SCRAPINGBEE_API_KEY not configured";
  }
  
  try {
    const url = `https://app.scrapingbee.com/api/v1/?api_key=${KEYS.SCRAPINGBEE}&url=https://httpbin.org/get&render_js=false`;
    const response = await axios.get(url);
    
    return response.data ? 
      "✅ ScrapingBee API connection successful" : 
      "⚠️ ScrapingBee API connected but unexpected response";
  } catch (error) {
    return `❌ ScrapingBee API error: ${error.response?.status || error.message.substring(0, 100)}`;
  }
}

// Test Supabase connection
async function testSupabase() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return "❌ Supabase credentials not configured";
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase.from('content_briefs').select('id').limit(1);
    
    if (error) throw new Error(error.message);
    return "✅ Supabase connection successful";
  } catch (error) {
    return `❌ Supabase error: ${error.message.substring(0, 100)}`;
  }
}

// Run all tests in parallel
async function runTests() {
  console.log("🔍 Running API connectivity tests...\n");
  
  const tests = {
    "OpenAI": testOpenAI(),
    "Claude": testClaude(),
    "Perplexity": testPerplexity(),
    "ScrapingBee": testScrapingBee(),
    "Supabase": testSupabase()
  };
  
  // Wait for all tests to complete
  const results = {};
  for (const [name, test] of Object.entries(tests)) {
    results[name] = await test;
  }
  
  // Print results in a clean table format
  console.log("=== API CONNECTIVITY RESULTS ===");
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${name.padEnd(12)}: ${result}`);
  });
  
  // Check if new columns exist in content_briefs table
  try {
    if (results["Supabase"].includes("✅")) {
      console.log("\n=== DATABASE SCHEMA CHECK ===");
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      
      const { data, error } = await supabase.rpc('pg_get_columns', { table_name: 'content_briefs' });
      
      if (error) {
        console.log(`Database schema check: ❌ Error checking schema`);
      } else {
        const columns = data.map(col => col.column_name);
        const newColumns = [
          'processing_metrics',
          'source_attribution',
          'ai_models_used',
          'quality_metrics',
          'client_context'
        ];
        
        newColumns.forEach(col => {
          console.log(`Column ${col.padEnd(20)}: ${columns.includes(col) ? '✅ Exists' : '❌ Missing'}`);
        });
      }
    }
  } catch (e) {
    console.log(`Database schema check: ❌ Error: ${e.message.substring(0, 100)}`);
  }
  
  console.log("\nDebug completed!");
}

// Run the tests
runTests();