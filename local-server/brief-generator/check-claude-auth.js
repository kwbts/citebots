#!/usr/bin/env node

/**
 * Quick Claude API authentication test
 */

const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

async function testClaudeAuth() {
  console.log('=================================');
  console.log('CLAUDE API AUTHENTICATION TEST');
  console.log('=================================');

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? '✅ Set' : '❌ Not set'}`);

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    console.log('\n❌ No Claude API key found. Please set ANTHROPIC_API_KEY environment variable.');
    console.log('\nExample: export ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  console.log(`\n🔑 Using API key: ${apiKey.substring(0, 10)}...`);

  // Initialize client
  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  try {
    console.log('\n🧪 Testing Claude API...');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello Claude! Please respond with exactly: 'Authentication test successful'",
        },
      ],
    });

    console.log('\n✅ Claude API Response:');
    console.log('Model:', response.model);
    console.log('Content:', response.content[0].text);
    console.log('Usage:', response.usage);
    
    console.log('\n🎉 Claude API authentication successful!');
    
  } catch (error) {
    console.log('\n❌ Claude API Error:');
    console.log('Error message:', error.message);
    
    if (error.message.includes('authentication') || error.message.includes('apiKey')) {
      console.log('\n💡 This looks like an authentication error.');
      console.log('Please check that your ANTHROPIC_API_KEY is correct.');
    } else if (error.message.includes('rate limit')) {
      console.log('\n💡 Rate limit reached. Your API key works but you\'ve hit usage limits.');
    } else {
      console.log('\n💡 Unexpected error. Check the error details above.');
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testClaudeAuth();
}

module.exports = { testClaudeAuth };