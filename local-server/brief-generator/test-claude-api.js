#!/usr/bin/env node

/**
 * Test Claude API connectivity and response
 */

require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

const Anthropic = require('@anthropic-ai/sdk');

async function testClaude() {
  console.log('Testing Claude API...\n');
  
  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  console.log('API Key found:', !!apiKey);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
  
  if (!apiKey) {
    console.error('ERROR: No Claude API key found in environment variables');
    process.exit(1);
  }
  
  try {
    const anthropic = new Anthropic({ apiKey });
    
    // Simple test prompt
    const testPrompt = `Extract statistics from this text and return as JSON array:
    
    "According to recent research, 73% of B2B companies report using content marketing. 
    Companies that blog see 67% more leads per month. 
    The content marketing industry is worth $412 billion as of 2025."
    
    Format: [{"statistic": "...", "source": "...", "context": "..."}]`;
    
    console.log('Sending test prompt to Claude...\n');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: testPrompt,
        },
      ],
      temperature: 0.3,
    });
    
    console.log('Response received!');
    console.log('Response structure:', {
      hasContent: !!response.content,
      contentLength: response.content?.length,
      firstContentType: response.content?.[0]?.type
    });
    
    if (response.content?.[0]?.text) {
      console.log('\nClaude Response:');
      console.log(response.content[0].text);
      
      // Try to parse as JSON
      try {
        const jsonStart = response.content[0].text.indexOf('[');
        const jsonEnd = response.content[0].text.lastIndexOf(']');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonText = response.content[0].text.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonText);
          console.log('\nParsed statistics:');
          console.log(JSON.stringify(parsed, null, 2));
        }
      } catch (parseError) {
        console.log('\nCould not parse response as JSON:', parseError.message);
      }
    }
    
  } catch (error) {
    console.error('\nERROR calling Claude API:');
    console.error('Message:', error.message);
    console.error('Type:', error.constructor.name);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testClaude();