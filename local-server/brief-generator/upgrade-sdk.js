/**
 * Script to upgrade the Anthropic SDK to the latest version
 */

const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Log header
console.log("=================================");
console.log("Anthropic SDK Upgrade Tool");
console.log("=================================\n");

// Check current version
try {
  const packageJson = require('./package.json');
  const currentVersion = packageJson.dependencies["@anthropic-ai/sdk"];
  console.log(`Current @anthropic-ai/sdk version: ${currentVersion}`);
} catch (error) {
  console.log("Could not determine current SDK version:", error.message);
}

// Upgrade the SDK
console.log("\nUpgrading to the latest SDK version...");
try {
  const output = execSync('npm install @anthropic-ai/sdk@latest --save').toString();
  console.log(output);
  
  // Check new version
  const newPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const newVersion = newPackageJson.dependencies["@anthropic-ai/sdk"];
  
  console.log(`\n✅ Successfully upgraded SDK from previous version to ${newVersion}`);
  console.log("\nPlease restart your application or tests to use the new SDK version.");
  
  // Create a sample usage file
  console.log("\nCreating a sample usage file with latest SDK format...");
  
  const sampleCode = `/**
 * Sample Claude API usage with the latest SDK
 */
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
});

async function testClaude() {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // A stable model that should be available
      max_tokens: 1000,
      messages: [
        { role: "user", content: "Hello, Claude! Please tell me what you can do." }
      ]
    });
    
    console.log("Claude response:");
    console.log(response.content[0].text);
  } catch (error) {
    console.error("Error calling Claude API:", error.message);
  }
}

// Run the test
testClaude();
`;

  fs.writeFileSync('./sample-claude-usage.js', sampleCode, 'utf8');
  console.log("✅ Created sample-claude-usage.js with the latest SDK format");
  
} catch (error) {
  console.error("\n❌ Failed to upgrade SDK:", error.message);
  console.log("\nPlease try manually running: npm install @anthropic-ai/sdk@latest --save");
}