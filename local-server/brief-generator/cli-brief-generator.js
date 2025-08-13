#!/usr/bin/env node

const dotenv = require('dotenv');
const logger = require('./lib/logger');

// Load environment variables
dotenv.config();

// CLI tool now requires real configuration - no hardcoded test data
// Set these environment variables or pass as command line arguments
const briefInput = {
  clientId: process.env.CLI_CLIENT_ID || null,
  title: process.env.CLI_TITLE || 'Default Title - Set CLI_TITLE environment variable',
  keywords: process.env.CLI_KEYWORDS ? process.env.CLI_KEYWORDS.split(',') : ['example keyword'],
  purpose: process.env.CLI_PURPOSE || 'inform',
  audience: process.env.CLI_AUDIENCE || 'general',
  styleGuide: process.env.CLI_STYLE_GUIDE || null,
  customInstructions: process.env.CLI_CUSTOM_INSTRUCTIONS || null,
  researchDepth: process.env.CLI_RESEARCH_DEPTH || 'comprehensive',
  platforms: {
    chatGpt: process.env.CLI_USE_CHATGPT !== 'false',
    perplexity: process.env.CLI_USE_PERPLEXITY !== 'false',
    google: process.env.CLI_USE_GOOGLE !== 'false'
  },
  userId: process.env.CLI_USER_ID || 'cli-user'
};

// Import the brief processor
const { processBrief } = require('./lib/briefProcessor');

// Main function
async function main() {
  console.log('=================================');
  console.log('BRIEF GENERATOR CLI');
  console.log('=================================');
  console.log('Starting brief generation with:');
  console.log(`Title: ${briefInput.title}`);
  console.log(`Keywords: ${briefInput.keywords.join(', ')}`);
  console.log(`Purpose: ${briefInput.purpose}`);
  console.log(`Audience: ${briefInput.audience}`);
  console.log('=================================\n');

  try {
    logger.info('CLI brief generation started', briefInput);
    
    // Process the brief using the extracted logic
    const result = await processBrief(briefInput, {
      skipStatusUpdate: true  // Don't update database status in CLI mode
    });
    
    console.log('\nBrief generation completed!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    logger.error('CLI brief generation failed', { error: error.message, stack: error.stack });
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { briefInput, main };