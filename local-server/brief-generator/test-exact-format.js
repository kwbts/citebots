/**
 * Test using exact format from Anthropic's documentation
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

// Initialize client exactly as shown in docs
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Test models in order of likelihood
const modelsToTest = [
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229", 
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2",
  "claude-v2",
  "claude-instant"
];

async function testModels() {
  console.log("Testing Claude API with format from documentation...\n");
  
  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}`);
      
      const msg = await anthropic.messages.create({
        model: model,
        max_tokens: 50,
        messages: [
          { role: "user", content: "Say 'Hello, I am Claude!' if you can hear me." }
        ]
      });
      
      console.log(`✅ Success! Response: "${msg.content[0]?.text?.trim()}"\n`);
      
      // If we get here, the model works - save it for reference
      console.log(`\n==========================`);
      console.log(`✅ WORKING MODEL FOUND: ${model}`);
      console.log(`==========================\n`);
      console.log("Use this model name in your application.");
      
      // Create a reference file with the working model name
      const fs = require('fs');
      fs.writeFileSync(
        'working-claude-model.txt', 
        `Working Claude model: ${model}\nTested on: ${new Date().toISOString()}\n`,
        'utf8'
      );
      
      // Success - no need to test more models
      return;
      
    } catch (error) {
      console.log(`❌ Error with model ${model}: ${error.message}\n`);
    }
  }
  
  console.log("❌ None of the tested models worked with your API key.");
  console.log("Please check your API key and try again.");
}

testModels();