const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Directory where keyword results are stored
const KEYWORDS_OUTPUT_DIR = path.join(__dirname, 'data', 'output', 'keywords');
const CONSOLIDATED_OUTPUT_DIR = path.join(__dirname, 'data', 'output', 'consolidated');

/**
 * Reads all JSON files in the keywords output directory and groups them by client and batch
 * This assumes files follow the naming convention: clientName-keyword-intent_timestamp.json
 */
function consolidateResults(clientName, batchId) {
  // If no batchId provided, use the most recent files for the client
  const allFiles = fs.readdirSync(KEYWORDS_OUTPUT_DIR)
    .filter(file => file.endsWith('.json') && file.startsWith(clientName));
  
  if (allFiles.length === 0) {
    console.error(`No results found for client "${clientName}"`);
    return null;
  }

  console.log(`Found ${allFiles.length} files for client "${clientName}"`);
  
  // If no batchId, find the most recent timestamp
  if (!batchId) {
    // Group files by timestamp
    const filesByTimestamp = {};
    allFiles.forEach(file => {
      const match = file.match(/(\d+)\.json$/);
      if (match) {
        const timestamp = match[1];
        filesByTimestamp[timestamp] = filesByTimestamp[timestamp] || [];
        filesByTimestamp[timestamp].push(file);
      }
    });
    
    // Find the timestamp with the most files (likely to be the latest batch)
    let mostCommonTimestamp = null;
    let maxFiles = 0;
    
    for (const [timestamp, files] of Object.entries(filesByTimestamp)) {
      if (files.length > maxFiles) {
        maxFiles = files.length;
        mostCommonTimestamp = timestamp;
      }
    }
    
    batchId = mostCommonTimestamp;
    console.log(`Using most recent batch ID: ${batchId}`);
  }
  
  // Filter files by batch ID
  const batchFiles = allFiles.filter(file => file.includes(batchId));
  
  if (batchFiles.length === 0) {
    console.error(`No files found for batch ID "${batchId}"`);
    return null;
  }
  
  console.log(`Processing ${batchFiles.length} files for batch ID "${batchId}"`);
  
  // Group results by keyword and intent
  const consolidatedResults = {
    clientInfo: null,
    summary: {
      keywords: new Set(),
      intents: new Set(),
      totalCitations: 0,
      totalBrandMentions: 0,
      totalCompetitorMentions: 0,
      totalQueries: batchFiles.length,
      platforms: new Set(),
    },
    results: []
  };
  
  // Process each file
  batchFiles.forEach(filename => {
    try {
      const fullPath = path.join(KEYWORDS_OUTPUT_DIR, filename);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      
      // Store client info from first file
      if (!consolidatedResults.clientInfo && data.clientInfo) {
        consolidatedResults.clientInfo = data.clientInfo;
      }
      
      // Extract keyword and intent from filename
      const filenameParts = filename.split('-');
      const keywordAndIntent = filenameParts[1] ? filenameParts[1].split('.')[0].split('_') : [];
      
      const keyword = data.keyword || (keywordAndIntent.length > 0 ? keywordAndIntent[0] : 'unknown');
      const intent = data.intent || (keywordAndIntent.length > 1 ? keywordAndIntent[1] : 'unknown');
      
      // Add to summary
      consolidatedResults.summary.keywords.add(keyword);
      consolidatedResults.summary.intents.add(intent);
      
      // Count citations and mentions
      const citations = data.citations || [];
      consolidatedResults.summary.totalCitations += citations.length;
      
      // Count brand mentions
      if (data.brandMentionAnalysis) {
        consolidatedResults.summary.totalBrandMentions += 
          (data.brandMentionAnalysis.inResponse || 0) + 
          (data.brandMentionAnalysis.inCitations || 0);
      }
      
      // Count competitor mentions
      if (data.competitorMentionAnalysis) {
        Object.values(data.competitorMentionAnalysis).forEach(competitor => {
          consolidatedResults.summary.totalCompetitorMentions += 
            (competitor.inResponse || 0) + (competitor.inCitations || 0);
        });
      }
      
      // Add platform to summary
      if (data.chatgptResponse) consolidatedResults.summary.platforms.add('chatgpt');
      if (data.perplexityResponse) consolidatedResults.summary.platforms.add('perplexity');
      
      // Add result to consolidated results
      consolidatedResults.results.push({
        keyword,
        intent,
        query: data.query,
        citations: citations,
        brandMentions: data.brandMentionAnalysis,
        competitorMentions: data.competitorMentionAnalysis,
        platforms: {
          chatgpt: !!data.chatgptResponse,
          perplexity: !!data.perplexityResponse
        },
        citationsCount: citations.length,
        timestamp: data.timestamp || parseInt(batchId)
      });
      
    } catch (err) {
      console.error(`Error processing file ${filename}:`, err);
    }
  });
  
  // Convert Sets to Arrays for JSON serialization
  consolidatedResults.summary.keywords = Array.from(consolidatedResults.summary.keywords);
  consolidatedResults.summary.intents = Array.from(consolidatedResults.summary.intents);
  consolidatedResults.summary.platforms = Array.from(consolidatedResults.summary.platforms);
  
  // Sort results by keyword and intent
  consolidatedResults.results.sort((a, b) => {
    if (a.keyword !== b.keyword) {
      return a.keyword.localeCompare(b.keyword);
    }
    return a.intent.localeCompare(b.intent);
  });
  
  return consolidatedResults;
}

/**
 * Main function to save consolidated results
 */
function saveConsolidatedResults(clientName, batchId) {
  const results = consolidateResults(clientName, batchId);
  
  if (!results) {
    console.error('No results to consolidate');
    return;
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONSOLIDATED_OUTPUT_DIR)) {
    fs.mkdirSync(CONSOLIDATED_OUTPUT_DIR, { recursive: true });
  }
  
  // Generate filename
  const timestamp = batchId || Date.now();
  const outputFilename = `${clientName}-consolidated-${timestamp}.json`;
  const outputPath = path.join(CONSOLIDATED_OUTPUT_DIR, outputFilename);
  
  // Write results to file
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`Consolidated results saved to ${outputPath}`);
  console.log(`Summary: ${results.summary.totalQueries} queries across ${results.summary.keywords.length} keywords`);
  console.log(`Found ${results.summary.totalCitations} citations, ${results.summary.totalBrandMentions} brand mentions, and ${results.summary.totalCompetitorMentions} competitor mentions`);
  
  return outputPath;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { clientName: null, batchId: null };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value;
    } else if (!options.clientName) {
      options.clientName = arg;
    } else if (!options.batchId) {
      options.batchId = arg;
    }
  }
  
  return options;
}

// Run the script
const { clientName, batchId } = parseArgs();

if (!clientName) {
  console.error('Usage: node consolidate-results.js <clientName> [batchId] [--option=value]');
  console.error('Example: node consolidate-results.js Knak 1746528614158');
  console.error('Example: node consolidate-results.js Knak');
  process.exit(1);
}

saveConsolidatedResults(clientName, batchId);