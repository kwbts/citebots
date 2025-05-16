// process-keywords.js - Script to process keywords from a markdown file
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { processSingleQuery, runBothQueries } = require('./citebots');
const config = require('./src/config');

// Rate limiting configuration
const RATE_LIMITS = {
  // Delay between API calls in milliseconds
  apiCallDelay: 2000,  // 2 seconds between API calls
  // Delay between processing keywords
  keywordDelay: 5000,  // 5 seconds between keywords
  // Maximum concurrent queries
  maxConcurrentQueries: 2,
  // Delay when reaching limits (temporary backoff)
  backoffDelay: 30000  // 30 seconds
};

// Initialize OpenAI client for query generation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openai.apiKey
});

/**
 * Helper function to add delay between operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Semaphore for controlling concurrent operations
 */
class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++;
      return Promise.resolve();
    }

    // Return a promise that resolves when a resource is released
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.count--;
    
    if (this.queue.length > 0 && this.count < this.max) {
      this.count++;
      const next = this.queue.shift();
      next();
    }
  }
}

// Create a semaphore for limiting concurrent API calls
const apiSemaphore = new Semaphore(RATE_LIMITS.maxConcurrentQueries);

// Query intent types
const QUERY_INTENTS = [
  'informational',
  'navigational',
  'transactional',
  'commercial',
  'local',
  'support',
  'educational',
  'opinion'
];

/**
 * Read keywords from a markdown file (one keyword per line)
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<string[]>} - Array of keywords
 */
async function readKeywordsFromMarkdown(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    
    // Extract keywords (one per line, skip empty lines and lines starting with #)
    const keywords = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    console.log(`Read ${keywords.length} keywords from ${filePath}`);
    return keywords;
  } catch (error) {
    console.error(`Error reading keywords from file: ${error.message}`);
    throw error;
  }
}

/**
 * Transform a keyword into natural language queries based on query intents
 * @param {string} keyword - The keyword to transform
 * @param {string[]} intents - Array of query intents to generate queries for
 * @returns {Promise<Object>} - Map of intent to generated query
 */
async function transformKeywordToQueries(keyword, intents = QUERY_INTENTS) {
  try {
    console.log(`Transforming keyword: "${keyword}" into ${intents.length} queries`);
    
    // Apply rate limiting - acquire a semaphore slot
    await apiSemaphore.acquire();
    console.log(`Acquired API slot for keyword: "${keyword}"`);
    
    try {
      // Create intent descriptions for the prompt
      const intentDescriptions = {
        'informational': 'Seeking general knowledge about the topic',
        'navigational': 'Looking for a specific website or resource related to the topic',
        'transactional': 'Intent to take an action (purchase, download, register) related to the topic',
        'commercial': 'Researching before making a purchase decision related to the topic',
        'local': 'Seeking location-specific information about the topic',
        'support': 'Looking for help with a problem related to the topic',
        'educational': 'Seeking to learn about the topic in depth',
        'opinion': 'Looking for subjective views or recommendations about the topic'
      };
      
      // Format the intents for the prompt
      const intentPromptParts = intents.map(intent => 
        `- ${intent}: ${intentDescriptions[intent] || 'Query related to this intent'}`
      ).join('\n');
      
      // Call OpenAI API to transform the keyword
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a search query generator that creates natural language queries from keywords based on different query intents.'
          },
          {
            role: 'user',
            content: `Transform this keyword into natural language queries for each of the following query intents:

Keyword: "${keyword}"

Query intents:
${intentPromptParts}

Format your response as JSON with intent names as keys and generated natural language queries as values. Each query should be a complete, well-formed question or request that a user might naturally type into a search engine or ask a virtual assistant.

Example:
{
  "informational": "What is content marketing and how does it work?",
  "navigational": "Find official HubSpot content marketing guide",
  ...
}`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      
      console.log(`Successfully generated ${Object.keys(result).length} queries for keyword: "${keyword}"`);
      return result;
    } catch (error) {
      console.error(`Error transforming keyword to queries: ${error.message}`);
      
      // Generate basic queries as fallback
      const fallbackQueries = {};
      for (const intent of intents) {
        switch (intent) {
          case 'informational':
            fallbackQueries[intent] = `What is ${keyword}?`;
            break;
          case 'navigational':
            fallbackQueries[intent] = `Best website for ${keyword}`;
            break;
          case 'transactional':
            fallbackQueries[intent] = `Buy ${keyword}`;
            break;
          case 'commercial':
            fallbackQueries[intent] = `Best ${keyword} to purchase`;
            break;
          case 'local':
            fallbackQueries[intent] = `${keyword} near me`;
            break;
          case 'support':
            fallbackQueries[intent] = `How to fix ${keyword} problems`;
            break;
          case 'educational':
            fallbackQueries[intent] = `Learn about ${keyword} in depth`;
            break;
          case 'opinion':
            fallbackQueries[intent] = `What do people think about ${keyword}?`;
            break;
          default:
            fallbackQueries[intent] = `${keyword} ${intent}`;
        }
      }
      
      return fallbackQueries;
    } finally {
      // Release the semaphore slot and add delay
      apiSemaphore.release();
      console.log(`Released API slot for keyword: "${keyword}". Adding delay of ${RATE_LIMITS.apiCallDelay}ms`);
      await delay(RATE_LIMITS.apiCallDelay);
    }
  } catch (error) {
    console.error(`Fatal error transforming keyword to queries: ${error.message}`);
    return {}; // Return empty object in case of fatal error
  }
}

/**
 * Process queries through citebots for a single keyword
 * @param {string} keyword - The original keyword
 * @param {Object} queries - Map of intent to query
 * @param {Object} clientInfo - Client information
 * @param {string} platform - Platform to use (chatgpt, perplexity, or both)
 * @param {string} outputDir - Output directory for results
 * @returns {Promise<Array>} - Array of output files
 */
async function processQueriesForKeyword(keyword, queries, clientInfo, platform = 'both', outputDir) {
  console.log(`Processing ${Object.keys(queries).length} queries for keyword: "${keyword}"`);
  const outputFiles = [];
  
  // Helper function to ensure directories exist
  function ensureDirectoryExists(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }
  
  // Ensure output directory exists
  ensureDirectoryExists(outputDir);
  
  // Process each query
  for (const [intent, query] of Object.entries(queries)) {
    try {
      console.log(`Running query for intent "${intent}": "${query}"`);
      
      // Apply rate limiting - acquire a semaphore slot
      await apiSemaphore.acquire();
      console.log(`Acquired API slot for query: "${query}" (intent: ${intent})`);
      
      try {
        let queryResults;
        
        if (platform === 'both') {
          // Run the queries on both platforms
          console.log(`Running query on both platforms: "${query}"`);
          queryResults = await runBothQueries(query, {
            brandName: clientInfo.brandName,
            brandDomain: clientInfo.brandDomain,
            competitors: clientInfo.competitors,
            search_context_size: 'medium', // Use medium for better results
            keyword: keyword,
            intent: intent
          });
        } else {
          // Run on a single platform
          console.log(`Running query on ${platform}: "${query}"`);
          const queryId = `${platform}_${Date.now().toString(36)}`;
          
          // Create empty result object
          const resultObject = {
            query_id: queryId,
            query_text: query,
            query_keyword: keyword,
            funnel_stage: 'TOFU',
            citation_count: 0,
            query_category: 'Informational',
            query_topic: 'Marketing Technology',
            query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple',
            query_type: 'Research',
            query_intent: intent,
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
            search_context_size: 'medium',
            keyword: keyword,
            intent: intent
          }, resultObject);
          
          // Format the results in the same structure as runBothQueries
          queryResults = { [platform]: resultObject };
        }
        
        // Extract the query results into an array
        const queryDataArray = Object.values(queryResults);
        
        // Create the final output
        const outputData = {
          client_name: clientInfo.brandName,
          keyword: keyword,
          query_intent: intent,
          date_of_analysis: new Date().toISOString(),
          query_data: queryDataArray
        };
        
        // Write to file
        const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const outputFile = path.join(outputDir, `${clientInfo.brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${cleanKeyword}_${intent}_${Date.now()}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
        console.log(`Results written to ${outputFile}`);
        
        outputFiles.push(outputFile);
      } catch (error) {
        console.error(`Error processing query "${query}" for intent "${intent}": ${error.message}`);
        
        // If hitting API limits, add a longer backoff delay
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          console.log(`Rate limit detected, adding backoff delay of ${RATE_LIMITS.backoffDelay}ms`);
          await delay(RATE_LIMITS.backoffDelay);
        }
      } finally {
        // Release the semaphore slot and add delay
        apiSemaphore.release();
        console.log(`Released API slot for query: "${query}". Adding delay of ${RATE_LIMITS.apiCallDelay}ms`);
        await delay(RATE_LIMITS.apiCallDelay);
      }
    } catch (error) {
      console.error(`Fatal error processing query "${query}" for intent "${intent}": ${error.message}`);
    }
  }
  
  return outputFiles;
}

/**
 * Main function to process all keywords from a file
 * @param {string} inputFile - Path to markdown file with keywords
 * @param {Object} clientInfo - Client information
 * @param {string} platform - Platform to use (chatgpt, perplexity, or both)
 * @param {string[]} selectedIntents - Specific intents to use (optional)
 * @param {boolean} consolidate - Whether to save all results in a single file
 * @returns {Promise<void|string>} - Returns output file path if consolidate is true
 */
async function processKeywordsFile(inputFile, clientInfo, platform = 'both', selectedIntents = QUERY_INTENTS, consolidate = false) {
  try {
    // Read keywords from file
    const keywords = await readKeywordsFromMarkdown(inputFile);
    
    // Prepare output directories
    const outputDir = path.join(process.cwd(), 'data/output/keywords');
    const consolidatedDir = path.join(process.cwd(), 'data/output/consolidated');
    
    [outputDir, consolidate ? consolidatedDir : null].filter(Boolean).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log(`Processing ${keywords.length} keywords with ${selectedIntents.length} intents each`);
    console.log(`Rate limits: ${RATE_LIMITS.maxConcurrentQueries} concurrent queries, ${RATE_LIMITS.apiCallDelay}ms between API calls, ${RATE_LIMITS.keywordDelay}ms between keywords`);
    
    // Create a consolidated results object if needed
    let consolidatedResults = null;
    let intermediateFilePath = null;
    
    if (consolidate) {
      const batchId = Date.now();
      consolidatedResults = {
        batch_id: batchId,
        client_name: clientInfo.brandName,
        client_domain: clientInfo.brandDomain,
        platform: platform,
        intents: selectedIntents,
        keywords: keywords,
        date_of_analysis: new Date().toISOString(),
        queries_total: keywords.length * selectedIntents.length,
        queries_completed: 0,
        queries_by_keyword: {},
        all_queries: []
      };
      
      // Set up intermediate file path for saving progress
      intermediateFilePath = path.join(
        consolidatedDir, 
        `${clientInfo.brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_all_queries_${batchId}_intermediate.json`
      );
    }
    
    // Process each keyword
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      try {
        console.log(`Processing keyword ${i+1}/${keywords.length}: "${keyword}"`);
        
        // Initialize keyword entry in consolidated results
        if (consolidate) {
          consolidatedResults.queries_by_keyword[keyword] = {
            keyword,
            intents: {},
            total_queries_planned: selectedIntents.length,
            completed_queries: 0
          };
        }
        
        // Transform keyword to queries
        const queries = await transformKeywordToQueries(keyword, selectedIntents);
        
        if (consolidate) {
          // Process each query individually for consolidated results
          for (const [intent, query] of Object.entries(queries)) {
            try {
              // Process the query
              console.log(`Running query for intent "${intent}": "${query}"`);
              
              // Apply rate limiting - acquire a semaphore slot
              await apiSemaphore.acquire();
              console.log(`Acquired API slot for query: "${query}" (intent: ${intent})`);
              
              try {
                let queryResults;
                
                if (platform === 'both') {
                  // Run the queries on both platforms
                  console.log(`Running query on both platforms: "${query}"`);
                  queryResults = await runBothQueries(query, {
                    brandName: clientInfo.brandName,
                    brandDomain: clientInfo.brandDomain,
                    competitors: clientInfo.competitors,
                    search_context_size: 'medium', // Use medium for better results
                    keyword: keyword,
                    intent: intent
                  });
                } else {
                  // Run on a single platform
                  console.log(`Running query on ${platform}: "${query}"`);
                  const queryId = `${platform}_${Date.now().toString(36)}`;
                  
                  // Create empty result object
                  const resultObject = {
                    query_id: queryId,
                    query_text: query,
                    query_keyword: keyword,
                    funnel_stage: 'TOFU',
                    citation_count: 0,
                    query_category: 'Informational',
                    query_topic: 'Marketing Technology',
                    query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple',
                    query_type: 'Research',
                    query_intent: intent,
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
                    search_context_size: 'medium',
                    keyword: keyword,
                    intent: intent
                  }, resultObject);
                  
                  // Format the results in the same structure as runBothQueries
                  queryResults = { [platform]: resultObject };
                }
                
                // Extract the query results into an array
                const queryDataArray = Object.values(queryResults);
                
                // Create the query result object
                const queryResult = {
                  keyword,
                  intent,
                  query,
                  client_name: clientInfo.brandName,
                  client_domain: clientInfo.brandDomain,
                  timestamp: Date.now(),
                  date_of_analysis: new Date().toISOString(),
                  platforms: Object.keys(queryResults),
                  results: queryDataArray,
                  
                  // Extract citations
                  citations: queryDataArray.flatMap(result => 
                    result.associated_pages ? result.associated_pages.map(page => ({
                      url: page.url,
                      title: page.title || '',
                      platform: result.data_source
                    })) : []
                  ),
                  
                  // Brand and competitor mentions
                  brandMentions: queryDataArray.map(result => ({
                    platform: result.data_source,
                    inResponse: result.brand_mentioned || false,
                    count: result.brand_mention_count || 0
                  })),
                  
                  competitorMentions: queryDataArray.map(result => ({
                    platform: result.data_source,
                    competitors: result.competitor_mentioned_name || []
                  }))
                };
                
                // Add to consolidated results
                consolidatedResults.queries_by_keyword[keyword].intents[intent] = queryResult;
                consolidatedResults.queries_by_keyword[keyword].completed_queries++;
                consolidatedResults.all_queries.push(queryResult);
                consolidatedResults.queries_completed++;
                
                // Save intermediate results periodically
                if (consolidatedResults.queries_completed % 3 === 0 || 
                    consolidatedResults.queries_completed === consolidatedResults.queries_total) {
                  try {
                    fs.writeFileSync(intermediateFilePath, JSON.stringify(consolidatedResults, null, 2));
                    console.log(`Saved intermediate results (${consolidatedResults.queries_completed}/${consolidatedResults.queries_total} queries completed)`);
                  } catch (saveError) {
                    console.error(`Error saving intermediate results: ${saveError.message}`);
                  }
                }
                
              } catch (error) {
                console.error(`Error processing query "${query}" for intent "${intent}": ${error.message}`);
                
                // If hitting API limits, add a longer backoff delay
                if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                  console.log(`Rate limit detected, adding backoff delay of ${RATE_LIMITS.backoffDelay}ms`);
                  await delay(RATE_LIMITS.backoffDelay);
                }
              } finally {
                // Release the semaphore slot and add delay
                apiSemaphore.release();
                console.log(`Released API slot for query: "${query}". Adding delay of ${RATE_LIMITS.apiCallDelay}ms`);
                await delay(RATE_LIMITS.apiCallDelay);
              }
            } catch (queryError) {
              console.error(`Error processing query for intent "${intent}": ${queryError.message}`);
            }
          }
        } else {
          // Process all queries for this keyword using the original method
          await processQueriesForKeyword(keyword, queries, clientInfo, platform, outputDir);
        }
        
        // Add delay between keywords, but not after the last one
        if (i < keywords.length - 1) {
          console.log(`Keyword "${keyword}" completed. Adding delay of ${RATE_LIMITS.keywordDelay}ms before next keyword`);
          await delay(RATE_LIMITS.keywordDelay);
        }
      } catch (keywordError) {
        console.error(`Error processing keyword "${keyword}": ${keywordError.message}`);
      }
    }
    
    // If using consolidated mode, create summary and save final file
    if (consolidate) {
      // Calculate summary statistics
      const summary = {
        total_keywords: keywords.length,
        total_intents: selectedIntents.length,
        total_queries_planned: keywords.length * selectedIntents.length,
        total_queries_completed: consolidatedResults.queries_completed,
        completion_percentage: Math.round((consolidatedResults.queries_completed / consolidatedResults.queries_total) * 100),
        
        citations: {
          total: consolidatedResults.all_queries.reduce((sum, query) => sum + (query.citations ? query.citations.length : 0), 0),
          by_platform: {}
        },
        
        brand_mentions: {
          total: 0,
          by_platform: {}
        },
        
        competitor_mentions: {
          total: 0,
          by_competitor: {}
        }
      };
      
      // Calculate platform-specific stats
      if (platform === 'both' || platform === 'chatgpt') {
        summary.citations.by_platform.chatgpt = consolidatedResults.all_queries.reduce((sum, query) => 
          sum + (query.citations ? query.citations.filter(c => c.platform === 'chatgpt').length : 0), 0);
        
        summary.brand_mentions.by_platform.chatgpt = consolidatedResults.all_queries.reduce((sum, query) => {
          const chatgptMention = query.brandMentions.find(bm => bm.platform === 'chatgpt');
          return sum + (chatgptMention ? chatgptMention.count : 0);
        }, 0);
      }
      
      if (platform === 'both' || platform === 'perplexity') {
        summary.citations.by_platform.perplexity = consolidatedResults.all_queries.reduce((sum, query) => 
          sum + (query.citations ? query.citations.filter(c => c.platform === 'perplexity').length : 0), 0);
        
        summary.brand_mentions.by_platform.perplexity = consolidatedResults.all_queries.reduce((sum, query) => {
          const perplexityMention = query.brandMentions.find(bm => bm.platform === 'perplexity');
          return sum + (perplexityMention ? perplexityMention.count : 0);
        }, 0);
      }
      
      // Calculate total brand mentions
      summary.brand_mentions.total = Object.values(summary.brand_mentions.by_platform).reduce((sum, count) => sum + count, 0);
      
      // Process competitor mentions
      consolidatedResults.all_queries.forEach(query => {
        query.competitorMentions.forEach(cm => {
          (cm.competitors || []).forEach(competitor => {
            summary.competitor_mentions.by_competitor[competitor] = (summary.competitor_mentions.by_competitor[competitor] || 0) + 1;
            summary.competitor_mentions.total++;
          });
        });
      });
      
      // Add summary to results
      consolidatedResults.summary = summary;
      
      // Save final consolidated results
      const outputFileName = `${clientInfo.brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_all_queries_${consolidatedResults.batch_id}.json`;
      const outputPath = path.join(consolidatedDir, outputFileName);
      
      fs.writeFileSync(outputPath, JSON.stringify(consolidatedResults, null, 2));
      console.log(`Consolidated results saved to ${outputPath}`);
      
      return outputPath;
    }
    
    console.log('All keywords processed successfully!');
    return null;
  } catch (error) {
    console.error(`Error processing keywords file: ${error.message}`);
  }
}

/**
 * Read client info from a markdown file
 * @param {string} filePath - Path to the client info markdown file
 * @returns {Promise<Object>} - Client info object
 */
async function readClientInfoFromMarkdown(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Client info file not found at ${filePath}, using defaults`);
      return null;
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim());
    
    // Parse client info
    let clientInfo = {
      brandName: "Humans of Martech",
      brandDomain: "humansofmartech.com",
      competitors: []
    };
    
    let inCompetitorsSection = false;
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line) continue;
      
      // Parse brand name
      if (line.toLowerCase().startsWith('brand name:')) {
        clientInfo.brandName = line.substring('brand name:'.length).trim();
        continue;
      }
      
      // Parse brand domain
      if (line.toLowerCase().startsWith('brand domain:')) {
        clientInfo.brandDomain = line.substring('brand domain:'.length).trim();
        continue;
      }
      
      // Check for competitors section
      if (line.toLowerCase() === 'competitors:') {
        inCompetitorsSection = true;
        continue;
      }
      
      // Parse competitor entries (format: CompetitorName | competitordomain.com)
      if (inCompetitorsSection && line.includes('|')) {
        const [name, domain] = line.split('|').map(part => part.trim());
        
        if (name && domain) {
          const pattern = domain.replace(/\./g, '\\.').replace(/\*/g, '.*');
          clientInfo.competitors.push({ name, pattern });
        }
      }
    }
    
    // Add default competitors if none were found
    if (clientInfo.competitors.length === 0) {
      clientInfo.competitors = [
        { name: "Marketo", pattern: "marketo\\.com" },
        { name: "HubSpot", pattern: "hubspot\\.com" },
        { name: "Mailchimp", pattern: "mailchimp\\.com" },
        { name: "Salesforce", pattern: "salesforce\\.com" },
        { name: "Campaign Monitor", pattern: "campaignmonitor\\.com" },
        { name: "ActiveCampaign", pattern: "activecampaign\\.com" }
      ];
    }
    
    console.log(`Read client info for "${clientInfo.brandName}" (${clientInfo.brandDomain}) with ${clientInfo.competitors.length} competitors`);
    return clientInfo;
  } catch (error) {
    console.error(`Error reading client info: ${error.message}`);
    return null;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  let inputFile = 'keywords.md';
  let clientInfoFile = 'client-info.md';
  let platform = 'both';
  let consolidate = false;
  
  // Parse command line arguments
  if (args.length >= 1) {
    // Check if first arg is a file path or a flag
    if (!args[0].startsWith('--')) {
      inputFile = args[0];
    }
    
    // Check for client info file flag
    const clientInfoArg = args.find(arg => arg.startsWith('--client-info='));
    if (clientInfoArg) {
      clientInfoFile = clientInfoArg.replace('--client-info=', '');
    }
    
    // Check for platform flag
    const platformArg = args.find(arg => arg.startsWith('--platform='));
    if (platformArg) {
      platform = platformArg.replace('--platform=', '');
      if (!['chatgpt', 'perplexity', 'both'].includes(platform)) {
        platform = 'both';
      }
    }
    
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
    
    // Check for consolidate flag
    if (args.includes('--consolidate') || args.includes('--single-file')) {
      consolidate = true;
      console.log('Will save all results to a single consolidated file');
    }
  } else {
    console.log('Usage: node process-keywords.js [keywords-file.md] [options]');
    console.log('Options:');
    console.log('  --client-info=<path>   Path to client info markdown file (default: client-info.md)');
    console.log('  --platform=<platform>  Platform to use: chatgpt, perplexity, or both (default: both)');
    console.log('  --intents=<list>       Comma-separated list of intents to use');
    console.log('  --crawler=<type>       Web crawler to use: basic or pro (default: pro)');
    console.log('  --consolidate          Save all results to a single file (default: false)');
    console.log('  --single-file          Same as --consolidate');
    console.log('');
    console.log('Available intents: informational, navigational, transactional, commercial, local, support, educational, opinion');
    console.log('');
    console.log('Crawler types:');
    console.log('  basic - Uses axios and cheerio (free, no API costs)');
    console.log('  pro   - Uses ScrapingBee API (paid, higher success rate with dynamic content)');
    console.log('');
    console.log('If no arguments are provided, the script will use:');
    console.log('- keywords.md for keywords');
    console.log('- client-info.md for client information');
    console.log('- all query intents');
    console.log('- both platforms (ChatGPT and Perplexity)');
    console.log('- pro crawler (ScrapingBee)');
    console.log('- separate files for each query (use --consolidate for a single file)');
  }
  
  // Check if files exist
  if (!fs.existsSync(inputFile)) {
    console.error(`Keywords file not found: ${inputFile}`);
    process.exit(1);
  }
  
  // Check for intents flag
  let selectedIntents = QUERY_INTENTS;
  const intentsArg = args.find(arg => arg.startsWith('--intents='));
  if (intentsArg) {
    const specifiedIntents = intentsArg.replace('--intents=', '').split(',');
    selectedIntents = specifiedIntents.filter(intent => QUERY_INTENTS.includes(intent));
    if (selectedIntents.length === 0) {
      selectedIntents = QUERY_INTENTS;
    }
  }
  
  // Read client info and then process keywords
  (async () => {
    // Try to read client info from file
    let clientInfo = await readClientInfoFromMarkdown(clientInfoFile);
    
    // Use default client info if not available
    if (!clientInfo) {
      console.log('Using default client info');
      clientInfo = {
        brandName: "Humans of Martech",
        brandDomain: "humansofmartech.com",
        competitors: [
          { name: "Marketo", pattern: "marketo\\.com" },
          { name: "HubSpot", pattern: "hubspot\\.com" },
          { name: "Mailchimp", pattern: "mailchimp\\.com" },
          { name: "Salesforce", pattern: "salesforce\\.com" },
          { name: "Campaign Monitor", pattern: "campaignmonitor\\.com" },
          { name: "ActiveCampaign", pattern: "activecampaign\\.com" }
        ]
      };
    }
  
    // Run the main function
    const result = await processKeywordsFile(inputFile, clientInfo, platform, selectedIntents, consolidate);
    
    if (consolidate && result) {
      console.log(`Consolidated file generated: ${result}`);
    }
  })().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

// Export functions for use in other files
module.exports = {
  readKeywordsFromMarkdown,
  transformKeywordToQueries,
  processQueriesForKeyword,
  processKeywordsFile,
  readClientInfoFromMarkdown,
  QUERY_INTENTS
};