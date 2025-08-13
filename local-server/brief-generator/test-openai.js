/**
 * Test OpenAI API with gpt-4
 * This script tests the OpenAI API with the gpt-4 model to ensure it works correctly
 */
require('dotenv').config();
const { AxiosOpenAI } = require('./lib/axiosOpenAI');

async function testOpenAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in .env file');
    }
    
    console.log('Testing OpenAI API with gpt-4 model');
    console.log('API Key:', `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Create client
    const client = new AxiosOpenAI(apiKey, {
      timeout: 30000,
      defaultModel: 'gpt-4'
    });
    
    console.log('Sending test request to OpenAI...');
    const response = await client.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France? Respond in one sentence.' }
      ],
      temperature: 0.2,
      max_tokens: 100
    });
    
    console.log('Response received:');
    console.log('Status:', response.choices[0].message.content);
    
    // Test with basic response_format (text)
    console.log('\nTesting with response_format = text...');
    const responseWithFormat = await client.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of Italy? Respond in one sentence.' }
      ],
      temperature: 0.2,
      max_tokens: 100,
      response_format: { type: 'text' }  // This should work with gpt-4
    });
    
    console.log('Response received with text format:');
    console.log('Status:', responseWithFormat.choices[0].message.content);
    
    console.log('\n✅ OpenAI API tests successful!');
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testOpenAI().catch(console.error);