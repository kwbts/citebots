/**
 * Minimal Claude API Test Script
 * 
 * This is a simplified test to check just Claude API connectivity
 */

require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

// Check if the API key is set
if (!process.env.CLAUDE_API_KEY) {
  console.error('CLAUDE_API_KEY not found in environment variables');
  console.error('Please add it to your .env file');
  process.exit(1);
}

console.log('CLAUDE_API_KEY is set in environment variables.');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Print SDK version
console.log(`Using Anthropic SDK version: ${require('@anthropic-ai/sdk/package.json').version}`);
console.log('Testing Claude API connectivity...\n');

// Test the API with a simple request
async function testClaudeAPI() {
  try {
    // Try with anthropic.completions (older SDK may use this)
    console.log('Method 1: Testing with anthropic.completions.create()...');
    try {
      const response = await anthropic.completions.create({
        model: 'claude-2.0',
        prompt: `${anthropic.HUMAN_PROMPT} Say OK if you can hear me ${anthropic.AI_PROMPT}`,
        max_tokens_to_sample: 10,
        temperature: 0,
      });
      
      console.log(`✅ Success with completions API!`);
      console.log(`Response: "${response.completion.trim()}"`);
    } catch (err) {
      console.log(`❌ Error with completions API: ${err.message}`);
    }

    // Try with anthropic.messages (newer SDK uses this)
    console.log('\nMethod 2: Testing with anthropic.messages.create()...');
    try {
      const response = await anthropic.messages.create({
        model: 'claude-2.0',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say OK if you can hear me' }],
      });
      
      console.log(`✅ Success with messages API!`);
      console.log(`Response: "${response.content[0]?.text?.trim()}"`);
    } catch (err) {
      console.log(`❌ Error with messages API: ${err.message}`);
    }
    
    console.log('\nTest completed.');
    
  } catch (error) {
    console.error('General error testing Claude API:', error.message);
  }
}

// Run the test
testClaudeAPI();