#!/usr/bin/env node

/**
 * Environment Diagnostic Script
 * Tests environment variable loading and API access in the same context as server.js
 */

const dotenv = require('dotenv');
const logger = require('./lib/logger');

// Load environment variables exactly like server.js does
dotenv.config();

console.log('🔍 ENVIRONMENT DIAGNOSTICS');
console.log('=' .repeat(50));

// Test 1: Check if .env file is being loaded
console.log('\n1️⃣ Environment Variable Loading Test:');
console.log('Working Directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Test 2: Check API key presence and format
console.log('\n2️⃣ API Key Availability Test:');
const apiKeys = {
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY, 
  'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
  'PERPLEXITY_API_KEY': process.env.PERPLEXITY_API_KEY,
  'SCRAPINGBEE_API_KEY': process.env.SCRAPINGBEE_API_KEY,
  'GOOGLE_SEARCH_API_KEY': process.env.GOOGLE_SEARCH_API_KEY,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY
};

for (const [key, value] of Object.entries(apiKeys)) {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 5)}...${value.substring(value.length - 4)} (${value.length} chars)`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
}

// Test 3: Test API calls in server context
async function testAPICallsInServerContext() {
  console.log('\n3️⃣ API Calls in Server Context:');
  
  try {
    // Test OpenAI like the server does
    console.log('\nTesting OpenAI API...');
    const { AxiosOpenAI } = require('./lib/axiosOpenAI');
    
    if (process.env.OPENAI_API_KEY) {
      const openaiClient = new AxiosOpenAI(process.env.OPENAI_API_KEY, {
        timeout: 30000,
        defaultModel: 'gpt-4o'
      });
      
      const testResponse = await openaiClient.createChatCompletion({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Respond with exactly "API_TEST_SUCCESS" if you can see this message.' }
        ],
        temperature: 0.1,
        max_tokens: 50
      });
      
      const responseText = openaiClient.getResponseText(testResponse);
      console.log('✅ OpenAI Response:', responseText);
    } else {
      console.log('❌ OpenAI: No API key found');
    }
    
  } catch (error) {
    console.log('❌ OpenAI Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  try {
    // Test Perplexity like the server does
    console.log('\nTesting Perplexity API...');
    const axios = require('axios');
    
    if (process.env.PERPLEXITY_API_KEY) {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Respond with exactly "API_TEST_SUCCESS" if you can see this message.' }
          ],
          temperature: 0.1,
          max_tokens: 50
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
          },
          timeout: 30000
        }
      );
      
      console.log('✅ Perplexity Response:', response.data.choices[0].message.content);
    } else {
      console.log('❌ Perplexity: No API key found');
    }
    
  } catch (error) {
    console.log('❌ Perplexity Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  try {
    // Test ScrapingBee like the server does
    console.log('\nTesting ScrapingBee API...');
    const axios = require('axios');
    
    if (process.env.SCRAPINGBEE_API_KEY) {
      const response = await axios.get(
        'https://app.scrapingbee.com/api/v1/',
        {
          params: {
            api_key: process.env.SCRAPINGBEE_API_KEY,
            url: 'https://httpbin.org/json',
            render_js: 'false'
          },
          timeout: 30000
        }
      );
      
      console.log('✅ ScrapingBee Response Status:', response.status);
      console.log('   Content Length:', response.data.length);
    } else {
      console.log('❌ ScrapingBee: No API key found');
    }
    
  } catch (error) {
    console.log('❌ ScrapingBee Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test 4: Test import of server modules
console.log('\n4️⃣ Module Import Test:');
try {
  const queryGenerator = require('./lib/queryGenerator');
  const llmResearcher = require('./lib/llmResearcher');
  const contentScraper = require('./lib/contentScraper');
  const claudeInsightGenerator = require('./lib/claudeInsightGenerator');
  
  console.log('✅ All server modules imported successfully');
  
  // Test if the functions exist
  console.log('✅ queryGenerator.generateQueries:', typeof queryGenerator.generateQueries);
  console.log('✅ llmResearcher.queryChatGPT:', typeof llmResearcher.queryChatGPT);
  console.log('✅ llmResearcher.queryPerplexity:', typeof llmResearcher.queryPerplexity);
  console.log('✅ contentScraper.scrapeUrls:', typeof contentScraper.scrapeUrls);
  console.log('✅ claudeInsightGenerator.generateInsights:', typeof claudeInsightGenerator.generateInsights);
  
} catch (error) {
  console.log('❌ Module Import Error:', error.message);
}

// Run the tests
async function runDiagnostics() {
  await testAPICallsInServerContext();
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('If all APIs show success above, the environment is correctly configured.');
  console.log('If APIs fail here but work in test-apis.js, there\'s a context difference.');
  console.log('Check the working directory and environment variable loading.');
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
});