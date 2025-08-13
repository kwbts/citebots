/**
 * Brief Viewer Script
 * This script allows you to view generated briefs from the command line
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase() || 'list';
const briefId = args[1];
const format = args[2]?.toLowerCase() || 'pretty';

/**
 * Main function
 */
async function main() {
  try {
    switch (command) {
      case 'list':
        await listBriefs();
        break;
      case 'view':
        if (!briefId) {
          console.error('Error: Missing brief ID. Usage: node view-briefs.js view <brief_id>');
          process.exit(1);
        }
        await viewBrief(briefId);
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * List all briefs
 */
async function listBriefs() {
  console.log('Fetching briefs...');
  
  const { data: briefs, error } = await supabase
    .from('content_briefs')
    .select('id, title, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (briefs.length === 0) {
    console.log('No briefs found');
    return;
  }
  
  console.log('Recent briefs:');
  console.log('=============');
  
  briefs.forEach((brief, index) => {
    const statusEmoji = getStatusEmoji(brief.status);
    const created = new Date(brief.created_at).toLocaleString();
    
    console.log(`${index + 1}. [${statusEmoji} ${brief.status.toUpperCase()}] ${brief.id}`);
    console.log(`   Title: ${brief.title}`);
    console.log(`   Created: ${created}`);
    console.log();
  });
  
  console.log('To view a brief, run: node view-briefs.js view <brief_id>');
}

/**
 * View a specific brief
 */
async function viewBrief(briefId) {
  console.log(`Fetching brief ${briefId}...`);
  
  const { data: brief, error } = await supabase
    .from('content_briefs')
    .select('*')
    .eq('id', briefId)
    .single();
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!brief) {
    console.log(`Brief with ID ${briefId} not found`);
    return;
  }
  
  const statusEmoji = getStatusEmoji(brief.status);
  
  console.log('Brief details:');
  console.log('=============');
  console.log(`ID: ${brief.id}`);
  console.log(`Title: ${brief.title}`);
  console.log(`Status: ${statusEmoji} ${brief.status.toUpperCase()}`);
  console.log(`Created: ${new Date(brief.created_at).toLocaleString()}`);
  console.log(`Updated: ${new Date(brief.updated_at).toLocaleString()}`);
  console.log();
  
  if (brief.error_message) {
    console.log('Error:');
    console.log(brief.error_message);
    console.log();
  }
  
  if (format === 'json') {
    console.log('Content:');
    console.log(JSON.stringify(brief.content, null, 2));
    return;
  }
  
  if (!brief.content) {
    console.log('No content available');
    return;
  }
  
  // Display brief content
  console.log('Content Summary:');
  console.log('---------------');
  console.log(brief.content.summary || 'No summary available');
  console.log();
  
  if (brief.content.table_of_contents && brief.content.table_of_contents.length > 0) {
    console.log('Table of Contents:');
    console.log('-----------------');
    brief.content.table_of_contents.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title}`);
      if (section.points && section.points.length > 0) {
        section.points.forEach(point => {
          console.log(`   - ${point}`);
        });
      }
      console.log();
    });
  }
  
  if (brief.content.content_suggestions && brief.content.content_suggestions.length > 0) {
    console.log('Content Suggestions:');
    console.log('-------------------');
    brief.content.content_suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.suggestion}`);
      console.log(`   Rationale: ${suggestion.rationale}`);
      console.log(`   Importance: ${suggestion.importance}`);
      console.log();
    });
  }
  
  if (brief.content.research_links && brief.content.research_links.length > 0) {
    console.log('Research Links:');
    console.log('--------------');
    brief.content.research_links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   Type: ${link.source_type}`);
      console.log();
    });
  }
  
  console.log('For full JSON output, run: node view-briefs.js view <brief_id> json');
}

/**
 * Show help text
 */
function showHelp() {
  console.log('Brief Viewer');
  console.log('===========');
  console.log('Usage:');
  console.log('  node view-briefs.js list                  - List recent briefs');
  console.log('  node view-briefs.js view <brief_id>       - View a brief in pretty format');
  console.log('  node view-briefs.js view <brief_id> json  - View a brief in JSON format');
  console.log('  node view-briefs.js help                  - Show this help');
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'processing':
      return '🔄';
    case 'completed':
      return '✅';
    case 'completed_with_errors':
      return '⚠️';
    case 'failed':
      return '❌';
    default:
      return '❓';
  }
}

// Run the script
main().catch(console.error);