/**
 * Check environment variables and SDK installation
 */

const fs = require('fs');
const path = require('path');

console.log("Environment Check Tool");
console.log("======================\n");

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log("✅ .env file exists");
  
  try {
    const envContents = fs.readFileSync(envPath, 'utf8');
    const lines = envContents.split('\n');
    
    let claudeKeyFound = false;
    for (const line of lines) {
      if (line.startsWith('CLAUDE_API_KEY=')) {
        claudeKeyFound = true;
        const keyValue = line.substring('CLAUDE_API_KEY='.length);
        if (!keyValue.trim()) {
          console.log("❌ CLAUDE_API_KEY exists but is empty");
        } else {
          console.log("✅ CLAUDE_API_KEY exists and has a value");
          break;
        }
      }
    }
    
    if (!claudeKeyFound) {
      console.log("❌ CLAUDE_API_KEY not found in .env file");
    }
  } catch (error) {
    console.log(`❌ Error reading .env file: ${error.message}`);
  }
} else {
  console.log("❌ .env file does not exist");
  
  // Create a sample .env file
  try {
    const sampleEnv = `# Supabase Configuration
SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# API Keys for LLM Services
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
GOOGLE_SEARCH_API_KEY=your_google_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
SCRAPINGBEE_API_KEY=your_scrapingbee_key_here

# Server Configuration
BRIEF_GENERATOR_PORT=3001

# Feature Flags
USE_MOCK_PERPLEXITY=false
USE_MOCK_SCRAPING=false
`;
    
    fs.writeFileSync(envPath, sampleEnv, 'utf8');
    console.log("📝 Created a sample .env file. Please edit it with your actual API keys.");
  } catch (error) {
    console.log(`❌ Error creating sample .env file: ${error.message}`);
  }
}

// Check package.json for Anthropic SDK
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const anthropicVersion = packageJson.dependencies["@anthropic-ai/sdk"];
    
    if (anthropicVersion) {
      console.log(`✅ @anthropic-ai/sdk found in package.json: ${anthropicVersion}`);
    } else {
      console.log("❌ @anthropic-ai/sdk not found in package.json");
    }
  } else {
    console.log("❌ package.json does not exist");
  }
} catch (error) {
  console.log(`❌ Error checking package.json: ${error.message}`);
}

// Check if node_modules folder exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log("✅ node_modules folder exists");
  
  // Check if Anthropic SDK is installed
  const anthropicPath = path.join(nodeModulesPath, '@anthropic-ai', 'sdk');
  if (fs.existsSync(anthropicPath)) {
    console.log("✅ @anthropic-ai/sdk installed in node_modules");
  } else {
    console.log("❌ @anthropic-ai/sdk not found in node_modules");
  }
} else {
  console.log("❌ node_modules folder does not exist - run 'npm install' first");
}

console.log("\nRecommended next steps:");
console.log("1. Make sure CLAUDE_API_KEY is set in your .env file");
console.log("2. Run 'npm install' to ensure all dependencies are installed");
console.log("3. Run 'npm install @anthropic-ai/sdk@latest' to upgrade the Anthropic SDK");