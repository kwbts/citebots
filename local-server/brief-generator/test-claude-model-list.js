/**
 * Test to list available Claude models
 * 
 * This script tests the Claude API and retrieves a list of available models
 * to help identify the correct model name to use.
 */

require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

// Check for Claude API key
if (!process.env.CLAUDE_API_KEY) {
  console.error('Error: CLAUDE_API_KEY is not set in environment variables');
  console.log('Please set it in your .env file');
  process.exit(1);
}

// Initialize Anthropic client
// For SDK version 0.12.8, we need to use the correct import and initialization
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function listAvailableModels() {
  try {
    console.log('Attempting to fetch available Claude models...');
    console.log('This will help determine which models are accessible with your API key.');
    
    // Try basic API call to check connectivity
    const response = await anthropic.messages.create({
      model: "claude-2.1", // Use older model compatible with SDK v0.12.8
      max_tokens: 10,
      messages: [{ role: "user", content: "Say OK" }],
    });
    
    console.log('\n✅ Basic API connectivity test successful!');
    console.log(`Response: "${response.content[0]?.text?.trim()}"\n`);
    
    // List of models to test
    const modelVersions = [
      // Claude 3 models
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",

      // Legacy Claude models (SDK 0.12.8 may only support these)
      "claude-2.1",
      "claude-2.0",
      "claude-instant-1.2",

      // Basic Claude models
      "claude-instant",
      "claude",

      // Simpler names
      "claude-v2",
      "claude-v1",
      "claude-instant-v1"
    ];
    
    console.log('Testing each model version for availability:');
    console.log('--------------------------------------------');
    
    // Test each model
    for (const model of modelVersions) {
      try {
        console.log(`Testing ${model.padEnd(30)} ... `);
        
        const modelResponse = await anthropic.messages.create({
          model: model,
          max_tokens: 5,
          messages: [{ role: "user", content: "Test" }],
        });
        
        console.log(`✅ Available - Response: "${modelResponse.content[0]?.text?.trim()}"`);
      } catch (error) {
        console.log(`❌ Not available - Error: ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\nTest completed! Use an available model in your application.');
    console.log('Remember to update model names in:');
    console.log('1. lib/claudeInsightGenerator.js');
    console.log('2. debug-apis.js');
  } catch (error) {
    console.error('Error testing Claude API:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
  }
}

// Run the test
listAvailableModels();