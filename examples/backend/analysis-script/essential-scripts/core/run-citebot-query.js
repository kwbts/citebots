// run-citebot-query.js - Script to run a query against citebots.js with custom client info
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { processSingleQuery, runBothQueries } = require('./citebots');

// Get arguments
const args = process.argv.slice(2);

// Show help if no arguments
if (args.length === 0) {
  console.log('Usage: node run-citebot-query.js "Your Query" "Client Name" "client.domain.com" "platform" [options]');
  console.log('Example: node run-citebot-query.js "Email Marketing Best Practices" "Knak" "knak.com" "both"');
  console.log('Platforms: "chatgpt", "perplexity", or "both"');
  console.log('Options: --crawler=<type> (basic or pro, default: pro)');
  process.exit(1);
}

// Get parameters with defaults
const query = args[0];
const clientName = args[1] || "Humans of Martech";
const clientDomain = args[2] || "humansofmartech.com";
const platform = args[3] || "both";

// Check for crawler flag
const crawlerArg = args.find(arg => arg.startsWith('--crawler='));
if (crawlerArg) {
  const crawler = crawlerArg.replace('--crawler=', '');
  if (['basic', 'pro'].includes(crawler)) {
    // Set environment variable to control which crawler is used
    process.env.CITEBOTS_CRAWLER = crawler;
    console.log(`Using ${crawler} crawler for web scraping`);
  }
}

// Helper function to ensure directories exist
function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

/**
 * Run a query with custom client info
 */
async function runCustomQuery() {
  try {
    console.log(`Running query for client "${clientName}" (${clientDomain})`);
    console.log(`Query: "${query}"`);
    console.log(`Platform: ${platform}`);

    // Define client info
    const clientInfo = {
      brandName: clientName,
      brandDomain: clientDomain,
      competitors: [
        // Add default competitors - these can be customized as needed
        { name: "Marketo", pattern: "marketo\\.com" },
        { name: "HubSpot", pattern: "hubspot\\.com" },
        { name: "Mailchimp", pattern: "mailchimp\\.com" },
        { name: "Salesforce", pattern: "salesforce\\.com" },
        { name: "Campaign Monitor", pattern: "campaignmonitor\\.com" },
        { name: "ActiveCampaign", pattern: "activecampaign\\.com" }
      ]
    };
    
    // Prepare output directory
    const outputDir = path.join(process.cwd(), 'data/output');
    ensureDirectoryExists(outputDir);
    
    let queryResults;
    
    if (platform === 'both') {
      // Run the queries on both platforms
      console.log(`Running query on both platforms: "${query}"`);
      queryResults = await runBothQueries(query, {
        brandName: clientInfo.brandName,
        brandDomain: clientInfo.brandDomain,
        competitors: clientInfo.competitors,
        search_context_size: 'medium' // Use medium for better results
      });
    } else {
      // Run on a single platform
      console.log(`Running query on ${platform}: "${query}"`);
      const queryId = `${platform}_${Date.now().toString(36)}`;
      
      // Create empty result object
      const resultObject = {
        query_id: queryId,
        query_text: query,
        query_keyword: '',
        funnel_stage: 'TOFU',
        citation_count: 0,
        query_category: 'Informational',
        query_topic: 'Marketing Technology',
        query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple',
        query_type: 'Research',
        model_response: '',
        run_timestamp: new Date().toISOString(),
        data_source: platform,
        brand_mentioned: false,
        brand_sentiment: null,
        competitor_mentioned_name: [],
        competitor_count: 0,
        associated_pages_count: 0,
        associated_pages: []
      };
      
      // Process the query
      await processSingleQuery(query, {
        source: platform,
        brandName: clientInfo.brandName,
        brandDomain: clientInfo.brandDomain,
        competitors: clientInfo.competitors,
        search_context_size: 'medium'
      }, resultObject);
      
      // Format the results in the same structure as runBothQueries
      queryResults = { [platform]: resultObject };
    }
    
    // Extract the query results into an array
    const queryDataArray = Object.values(queryResults);
    
    // Create the final output
    const outputData = {
      client_name: clientInfo.brandName,
      date_of_analysis: new Date().toISOString(),
      query_data: queryDataArray
    };
    
    // Write to file
    const cleanClientName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const outputFile = path.join(outputDir, `${cleanClientName}_query_${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`Analysis complete! Results written to ${outputFile}`);
    
    return outputFile;
  } catch (error) {
    console.error('Error running query:', error);
    return null;
  }
}

// Run the function
runCustomQuery().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});