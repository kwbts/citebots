/**
 * Test using the exact code from Anthropic's documentation
 */

// Load environment variables
require('dotenv').config();

// Import exactly as shown in docs
const Anthropic = require("@anthropic-ai/sdk");

// Initialize exactly as shown in docs
const anthropic = new Anthropic({
  // Use environment variable
  apiKey: process.env.CLAUDE_API_KEY,
});

// Log some debug info
console.log("API Key present:", !!process.env.CLAUDE_API_KEY);
console.log("API Key length:", process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0);

// Check SDK version safely
let sdkVersion = "unknown";
try {
  const pkg = require('@anthropic-ai/sdk/package.json');
  sdkVersion = pkg.version;
} catch (e) {
  console.log("Could not determine SDK version:", e.message);
}
console.log("Anthropic SDK version:", sdkVersion);

// Run the test with exact parameters from docs
async function runTest() {
  try {
    console.log("Testing with exact parameters from documentation...");
    
    // Use the exact model from docs: claude-sonnet-4-20250514
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 20000,
      temperature: 1,
      messages: [
        { role: "user", content: "Hello, Claude!" }
      ]
    });
    
    console.log("Response received:");
    console.log(msg.content[0].text);
    
  } catch (error) {
    console.error("Error calling Claude API:");
    console.error("Message:", error.message);
    
    // Log more details if available
    if (error.status) console.error("Status:", error.status);
    if (error.type) console.error("Type:", error.type);
    if (error.response && error.response.data) console.error("Response data:", error.response.data);
    
    console.log("\nTrying to install latest SDK version...");
    
    const { execSync } = require('child_process');
    try {
      console.log(execSync('npm install @anthropic-ai/sdk@latest').toString());
      console.log("\nInstalled latest SDK version. Please run test again.");
    } catch (npmError) {
      console.error("Failed to install latest SDK:", npmError.message);
    }
  }
}

runTest();