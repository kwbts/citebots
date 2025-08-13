/**
 * Test script for Claude API integration
 * 
 * This script tests the Claude API connectivity and basic functionality
 * Usage: node test-claude.js
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('./lib/logger');

// Check for Claude API key
if (!process.env.CLAUDE_API_KEY) {
  console.error('Error: CLAUDE_API_KEY is not set in environment variables');
  console.log('Please set it in your .env file');
  process.exit(1);
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function testClaudeAPI() {
  try {
    console.log('Testing Claude API connectivity...');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: "Generate 3 statistics about content marketing effectiveness in the format of a JSON array. Each statistic should include the data point, source, and year.",
        },
      ],
    });

    console.log('\nClaude API response received successfully!\n');
    console.log('Response content:');
    console.log(response.content[0].text);
    
    // Try to parse the response as JSON
    try {
      // Look for JSON in the response
      const jsonMatch = response.content[0].text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('\nSuccessfully parsed JSON data:');
        console.log(JSON.stringify(parsedData, null, 2));
      }
    } catch (parseError) {
      console.log('\nNote: Could not parse response as JSON. This is expected if Claude didn\'t return proper JSON format.');
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Claude API:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
  }
}

// Run the test
testClaudeAPI();