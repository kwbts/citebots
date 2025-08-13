/**
 * ENV File Setup Helper
 * 
 * This script helps check if .env file exists and creates it if needed
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
if (fs.existsSync(envFilePath)) {
  console.log('✅ .env file already exists at:');
  console.log(envFilePath);
  console.log('\nHere\'s what\'s in your .env file:');
  
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Print env file content with passwords/keys masked
  const maskedContent = envContent
    .split('\n')
    .map(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (value && value.length > 10 && key.toLowerCase().includes('key')) {
          return `${key}=${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
        }
      }
      return line;
    })
    .join('\n');
  
  console.log('\n' + maskedContent);
  
  console.log('\nTo update API keys, edit this file directly with:');
  console.log(`nano ${envFilePath}`);
  console.log('or');
  console.log(`code ${envFilePath}`);
  
  rl.question('\nWould you like to update this file now? (y/n): ', answer => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('No changes made to .env file.');
      rl.close();
    }
  });
} else {
  console.log('❌ No .env file found.');
  createEnvFile();
}

function createEnvFile() {
  console.log('\nCreating/updating .env file...');
  console.log('Please enter values for the following keys (press Enter to skip or use default):');
  
  // Default template
  const envTemplate = {
    // Supabase
    'SUPABASE_URL': 'https://trmaeodthlywcjwfzdka.supabase.co',
    'SUPABASE_SERVICE_KEY': '',
    
    // API Keys
    'OPENAI_API_KEY': '',
    'CLAUDE_API_KEY': '',
    'PERPLEXITY_API_KEY': '',
    'GOOGLE_SEARCH_API_KEY': '',
    'GOOGLE_SEARCH_ENGINE_ID': '',
    'SCRAPINGBEE_API_KEY': '',
    
    // Server Config
    'BRIEF_GENERATOR_PORT': '3001',
    
    // Feature Flags
    'USE_MOCK_PERPLEXITY': 'false',
    'USE_MOCK_SCRAPING': 'false'
  };
  
  // Read existing values if file exists
  let existingValues = {};
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          existingValues[key.trim()] = value.trim();
        }
      }
    });
  }
  
  const keys = Object.keys(envTemplate);
  let currentIndex = 0;
  
  function promptNextKey() {
    if (currentIndex >= keys.length) {
      // All keys processed, write file
      writeEnvFile();
      return;
    }
    
    const key = keys[currentIndex];
    const defaultValue = existingValues[key] || envTemplate[key];
    const displayValue = defaultValue && key.toLowerCase().includes('key') && defaultValue.length > 6 ? 
      `${defaultValue.substring(0, 3)}...${defaultValue.substring(defaultValue.length - 3)}` : 
      defaultValue;
    
    rl.question(`${key} [${displayValue || 'empty'}]: `, answer => {
      if (answer.trim()) {
        existingValues[key] = answer.trim();
      } else if (!existingValues[key]) {
        existingValues[key] = envTemplate[key];
      }
      
      currentIndex++;
      promptNextKey();
    });
  }
  
  function writeEnvFile() {
    let fileContent = '# Brief Generator Environment Configuration\n\n';
    
    // Supabase section
    fileContent += '# Supabase Configuration\n';
    fileContent += `SUPABASE_URL=${existingValues['SUPABASE_URL']}\n`;
    fileContent += `SUPABASE_SERVICE_KEY=${existingValues['SUPABASE_SERVICE_KEY']}\n\n`;
    
    // API Keys section
    fileContent += '# API Keys for LLM Services\n';
    fileContent += `OPENAI_API_KEY=${existingValues['OPENAI_API_KEY']}\n`;
    fileContent += `CLAUDE_API_KEY=${existingValues['CLAUDE_API_KEY']}\n`;
    fileContent += `PERPLEXITY_API_KEY=${existingValues['PERPLEXITY_API_KEY']}\n`;
    fileContent += `GOOGLE_SEARCH_API_KEY=${existingValues['GOOGLE_SEARCH_API_KEY']}\n`;
    fileContent += `GOOGLE_SEARCH_ENGINE_ID=${existingValues['GOOGLE_SEARCH_ENGINE_ID']}\n`;
    fileContent += `SCRAPINGBEE_API_KEY=${existingValues['SCRAPINGBEE_API_KEY']}\n\n`;
    
    // Server Config section
    fileContent += '# Server Configuration\n';
    fileContent += `BRIEF_GENERATOR_PORT=${existingValues['BRIEF_GENERATOR_PORT']}\n\n`;
    
    // Feature Flags section
    fileContent += '# Feature Flags\n';
    fileContent += `USE_MOCK_PERPLEXITY=${existingValues['USE_MOCK_PERPLEXITY']}\n`;
    fileContent += `USE_MOCK_SCRAPING=${existingValues['USE_MOCK_SCRAPING']}\n`;
    
    // Write the file
    fs.writeFileSync(envFilePath, fileContent);
    
    console.log('\n✅ .env file has been created/updated at:');
    console.log(envFilePath);
    console.log('\nYou can now run the debug script to test your API connections:');
    console.log('node debug-apis.js');
    
    rl.close();
  }
  
  // Start the prompting process
  promptNextKey();
}

rl.on('close', () => {
  process.exit(0);
});