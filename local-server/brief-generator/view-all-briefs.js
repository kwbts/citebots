#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

async function viewAllBriefs() {
  try {
    console.log(`${colors.cyan}Fetching briefs from Supabase...${colors.reset}`);
    
    // Get all briefs
    const { data: briefs, error } = await supabase
      .from('content_briefs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!briefs || briefs.length === 0) {
      console.log(`${colors.yellow}No briefs found in the database.${colors.reset}`);
      return;
    }

    console.log(`${colors.green}Found ${briefs.length} briefs in the database:${colors.reset}\n`);
    
    // Print brief list as a table
    console.log(`${colors.bold}ID                                     | Title                            | Status      | Created${colors.reset}`);
    console.log('--------------------------------------------------------------------------------');
    
    briefs.forEach((brief) => {
      const id = brief.id.substring(0, 8) + '...';
      const title = (brief.title || 'Untitled').substring(0, 30).padEnd(30, ' ');
      const status = (brief.status || 'unknown').padEnd(10, ' ');
      const created = new Date(brief.created_at).toLocaleString().padEnd(20, ' ');
      
      let statusColor = colors.white;
      if (brief.status === 'completed') statusColor = colors.green;
      if (brief.status === 'failed') statusColor = colors.red;
      if (brief.status === 'pending' || brief.status === 'processing') statusColor = colors.yellow;
      
      console.log(`${id.padEnd(40, ' ')} | ${title} | ${statusColor}${status}${colors.reset} | ${created}`);
    });
    
    console.log('\n');
    
    // Ask user if they want to view a specific brief
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.cyan}Enter brief ID to view details (or press Enter to exit): ${colors.reset}`, async (answer) => {
      if (answer.trim()) {
        const briefId = answer.trim();
        await viewBriefDetails(briefId);
      }
      
      rl.close();
    });
    
  } catch (error) {
    console.error(`${colors.red}Error checking briefs:${colors.reset}`, error.message);
    process.exit(1);
  }
}

async function viewBriefDetails(briefId) {
  try {
    const { data: brief, error } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', briefId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!brief) {
      console.log(`${colors.yellow}Brief with ID ${briefId} not found.${colors.reset}`);
      return;
    }

    console.log(`\n${colors.bold}${colors.magenta}Brief Details:${colors.reset}\n`);
    console.log(`${colors.bold}ID:${colors.reset} ${brief.id}`);
    console.log(`${colors.bold}Title:${colors.reset} ${brief.title}`);
    console.log(`${colors.bold}Status:${colors.reset} ${brief.status}`);
    console.log(`${colors.bold}Created:${colors.reset} ${new Date(brief.created_at).toLocaleString()}`);
    console.log(`${colors.bold}Client ID:${colors.reset} ${brief.client_id || 'None (generic)'}`);
    console.log(`${colors.bold}Created By:${colors.reset} ${brief.created_by || 'Unknown'}`);
    console.log(`${colors.bold}Keywords:${colors.reset} ${Array.isArray(brief.keywords) ? brief.keywords.join(', ') : 'None'}`);
    
    // Check if content exists and is properly structured
    if (brief.content) {
      console.log(`\n${colors.bold}${colors.cyan}Content Structure:${colors.reset}`);
      const contentKeys = Object.keys(brief.content);
      console.log(`${colors.bold}Keys:${colors.reset} ${contentKeys.join(', ')}`);
      
      // Check for specific expected keys
      const expectedKeys = ['summary', 'content_suggestions', 'table_of_contents', 'research_links'];
      const missingKeys = expectedKeys.filter(key => !contentKeys.includes(key));
      
      if (missingKeys.length > 0) {
        console.log(`${colors.yellow}WARNING: Missing expected keys: ${missingKeys.join(', ')}${colors.reset}`);
      } else {
        console.log(`${colors.green}All expected content keys are present${colors.reset}`);
      }
      
      // Print summary if available
      if (brief.content.summary) {
        console.log(`\n${colors.bold}Summary:${colors.reset}`);
        console.log(brief.content.summary.substring(0, 300) + (brief.content.summary.length > 300 ? '...' : ''));
      }
      
      // Print content suggestions count
      if (Array.isArray(brief.content.content_suggestions)) {
        console.log(`\n${colors.bold}Content Suggestions:${colors.reset} ${brief.content.content_suggestions.length} items`);
        brief.content.content_suggestions.slice(0, 3).forEach((suggestion, idx) => {
          console.log(`  ${colors.yellow}${idx + 1}.${colors.reset} ${suggestion.suggestion}`);
        });
        if (brief.content.content_suggestions.length > 3) {
          console.log(`  ... and ${brief.content.content_suggestions.length - 3} more`);
        }
      }
      
      // Option to export to JSON file
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(`\n${colors.cyan}Export brief to JSON file? (y/n): ${colors.reset}`, (answer) => {
        if (answer.toLowerCase() === 'y') {
          const filename = `brief-${brief.id.substring(0, 8)}.json`;
          fs.writeFileSync(
            path.join(process.cwd(), filename), 
            JSON.stringify(brief, null, 2)
          );
          console.log(`${colors.green}Brief exported to ${filename}${colors.reset}`);
        }
        
        rl.close();
      });
      
    } else {
      console.log(`${colors.yellow}Content: None (Empty or null)${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error fetching brief details:${colors.reset}`, error.message);
  }
}

// Run the function
viewAllBriefs();