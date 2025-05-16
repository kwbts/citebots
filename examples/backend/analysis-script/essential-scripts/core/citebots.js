// citebots.js - Main entry point for Citebots application
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import required modules with correct paths
const { queryChatGPT, getResponseText } = require('./src/lib/chatgptClient');
const { queryPerplexity } = require('./src/lib/perplexityClient');
const { analyzeContent } = require('./src/lib/contentAnalyzer');
const { crawlPage, isValidUrl } = require('./src/lib/webCrawler');
const { extractQueryKeywords } = require('./src/lib/queryKeywordExtractor');
const { extractCitationsFromChatGPT, extractCitationsFromText } = require('./src/lib/citationExtractor');
const { checkBrandMention, checkCompetitorMentions, analyzeBrandSentiment } = require('./src/lib/brandAnalyzer');
const { createClientSummary } = require('./src/lib/resultsFormatter');
const config = require('./src/config');

// Helper function to ensure directories exist
function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

/**
 * Process a single query on a specified platform
 * @param {string} query - The query to run
 * @param {Object} options - Additional options
 * @param {Object} resultObject - The result object to populate
 * @returns {Promise<Object>} - Processing results
 */
async function processSingleQuery(query, options, resultObject) {
  // Import required modules with the necessary functions
  const { v4: uuidv4 } = require('uuid');
  const { crawlPage, isValidUrl } = require('./src/lib/webCrawler');
  const { analyzeContent } = require('./src/lib/contentAnalyzer');
  const { extractCitationsFromChatGPT, extractCitationsFromText } = require('./src/lib/citationExtractor');
  const { checkBrandMention, checkCompetitorMentions, analyzeBrandSentiment } = require('./src/lib/brandAnalyzer');
  const { extractQueryKeywords } = require('./src/lib/queryKeywordExtractor');
  const { queryChatGPT } = require('./src/lib/chatgptClient');
  const { queryPerplexity } = require('./src/lib/perplexityClient');
  
  // Add the cleanUrl function directly to avoid import issues
  function cleanUrl(urlString) {
    try {
      const parsedUrl = new URL(urlString);
      return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    } catch (error) {
      console.warn(`Error cleaning URL ${urlString}: ${error.message}`);
      return urlString;
    }
  }
  
  try {
    console.log(`Processing query on ${options.source}: "${query}"`);
    
    // Use AI to extract valuable query keywords and categorization
    let queryData = {
      query_keyword: options.keyword || query.split(' ').slice(0, 3).join(' '),
      query_category: options.category || 'Informational',
      funnel_stage: options.funnelStage || 'TOFU',
      query_type: options.type || 'question', // One of: question, command, research, conversational, comparison, definition, how_to, example,
      query_topic: options.topic || 'Marketing Technology',
      query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple'
    };
    
    try {
      // Extract query keywords and other metadata if OpenAI is available
      queryData = await extractQueryKeywords(query);
    } catch (extractError) {
      console.warn(`Could not extract query keywords: ${extractError.message}`);
      // We'll use the default values
    }
    
    // Update resultObject with query metadata
    resultObject.query_keyword = queryData.query_keyword;
    resultObject.funnel_stage = queryData.funnel_stage;
    resultObject.query_category = queryData.query_category;
    resultObject.query_topic = queryData.query_topic;
    resultObject.query_complexity = queryData.query_complexity;
    resultObject.query_type = queryData.query_type;
    resultObject.query_intent = queryData.query_intent;
    resultObject.response_match = queryData.response_match;
    resultObject.response_outcome = queryData.response_outcome;
    resultObject.brand_mention_type = queryData.brand_mention_type;
    resultObject.competitor_context = queryData.competitor_context;
    resultObject.action_orientation = queryData.action_orientation;
    resultObject.query_competition = queryData.query_competition;
    
    // Query the appropriate LLM based on options
    let response, responseText;
    
    if (options.source === 'perplexity') {
      console.log('Querying Perplexity...');
      response = await queryPerplexity(query, {
        enhanceQuery: true
      });
      responseText = response.choices[0].message.content;
    } else {
      console.log('Querying ChatGPT...');
      response = await queryChatGPT(query, {
        enhanceQuery: true,
        search_context_size: options.search_context_size || 'low'
      });
      
      // Extract text from ChatGPT response - handling multiple formats
      if (Array.isArray(response)) {
        // New Responses API format (array of items)
        console.log('Detected new Responses API format (array)'); 
        const messageItem = response.find(item => item.type === 'message');
        if (messageItem && messageItem.content && Array.isArray(messageItem.content)) {
          const textContent = messageItem.content.find(content => content.type === 'output_text');
          if (textContent && textContent.text) {
            responseText = textContent.text;
          }
        }
      } else if (response.output_text) {
        // Direct output_text field (common in some Responses API returns)
        responseText = response.output_text;
      } else if (response.choices && response.choices[0] && response.choices[0].message) {
        // Classic Completions API format
        responseText = response.choices[0].message.content;
      } else if (response.output) {
        // Transitional Responses API format with output property
        const messageOutput = response.output?.find(item => item.type === 'message');
        if (messageOutput && messageOutput.content && messageOutput.content.length) {
          const textContent = messageOutput.content.find(content => content.type === 'output_text');
          if (textContent && textContent.text) {
            responseText = textContent.text;
          }
        }
      } else {
        console.warn('Unexpected response structure from ChatGPT');
        responseText = JSON.stringify(response);
      }
    }
    
    // Store the response
    resultObject.model_response = responseText;
    
    // Extract citations
    console.log('Extracting citations...');
    let citations = [];
    
    if (options.source === 'chatgpt') {
      console.log('Using ChatGPT citation extractor');
      citations = extractCitationsFromChatGPT(response);
      console.log(`Extracted ${citations.length} citations from ChatGPT response`);
    } else {
      console.log('Using text-based citation extractor');
      citations = extractCitationsFromText(responseText);
      console.log(`Extracted ${citations.length} citations from text`);
    }
    
    // Fallback to text-based extraction if no citations were found with main extractor
    if (citations.length === 0 && responseText) {
      console.log('No citations found with primary extractor, trying fallback text extraction...');
      citations = extractCitationsFromText(responseText);
      console.log(`Extracted ${citations.length} citations with fallback method`);  
    }
    resultObject.citation_count = citations.length;
    
    // Check for brand mentions
    const brandMentioned = checkBrandMention(
      citations, 
      responseText, 
      options.brandDomain, 
      options.brandName
    );
    resultObject.brand_mentioned = brandMentioned;
    
    // If the brand is mentioned, analyze the sentiment
    if (brandMentioned && options.brandName) {
      resultObject.brand_sentiment = analyzeBrandSentiment(responseText, options.brandName);
    }
    
    // Check for competitor mentions
    const competitorCheck = checkCompetitorMentions(
      citations, 
      responseText, 
      options.competitors
    );
    resultObject.competitor_mentioned_name = competitorCheck.names;
    resultObject.competitor_count = competitorCheck.names.length;
    
    // Process citations with deduplication
    console.log(`Processing ${citations.length} citations with deduplication...`);
    
    // Create a map for deduplication
    const uniqueUrls = new Set();
    const urlToCitationMap = new Map();
    
    // Step 1: Identify unique URLs and map citations to them
    for (const citation of citations) {
      try {
        if (!citation || !citation.url) {
          console.warn('Citation missing URL');
          continue;
        }
        
        // Clean the URL for consistent comparison
        const cleanedUrl = cleanUrl(citation.url);
        
        // Track which citations point to each URL
        if (!urlToCitationMap.has(cleanedUrl)) {
          urlToCitationMap.set(cleanedUrl, []);
        }
        urlToCitationMap.get(cleanedUrl).push(citation);
        
        // Add to unique URLs set
        uniqueUrls.add(cleanedUrl);
      } catch (error) {
        console.error(`Error processing citation URL ${citation.url}:`, error.message);
      }
    }
    
    console.log(`Found ${uniqueUrls.size} unique URLs out of ${citations.length} citations`);
    
    // Track statistics for logging
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Step 2: Validate and crawl each unique URL
    for (const url of uniqueUrls) {
      try {
        // Validate URL
        console.log(`Validating URL: ${url}`);
        const isValid = await isValidUrl(url);
        
        if (!isValid) {
          console.warn(`Invalid URL: ${url}`);
          continue;
        }
        
        // Crawl the page - include the original query for better keyword context
        console.log(`Crawling URL: ${url}`);
        
        // Use the appropriate crawler based on the environment variable
        let pageData;
        if (process.env.CITEBOTS_CRAWLER === 'basic') {
          console.log(`Using basic crawler for ${url}`);
          // Import basic crawler directly to avoid circular dependencies
          const basicCrawler = require('./src/lib/basicWebCrawler');
          pageData = await basicCrawler.crawlPage(url, { 
            query: query,
            // Pass additional options
            countryCode: options.countryCode,
            device: options.device
          });
        } else {
          console.log(`Using pro crawler (ScrapingBee) for ${url}`);
          pageData = await crawlPage(url, { 
            query: query,
            // Pass additional options
            countryCode: options.countryCode,
            device: options.device
          });
        }
        
        // Analyze content
        console.log(`Analyzing content for URL: ${url}`);
        const contentAnalysis = await analyzeContent(pageData, query);
        
        // Step 3: Create a page analysis for each citation that references this URL
        for (const citation of urlToCitationMap.get(url)) {
          // Generate a unique ID for the page
          const domain = new URL(url).hostname;
          const pageId = `${domain.replace(/\./g, '_')}_${uuidv4().substring(0, 8)}`;
          
          // Check if this is client domain
          const isClientDomain = domain.includes(options.brandDomain);
          
          // Check if this is competitor domain
          let isCompetitorDomain = false;
          for (const comp of options.competitors) {
            const regexPattern = comp.pattern.replace('.', '\\.');
            const regex = new RegExp(regexPattern, 'i');
            
            if (regex.test(domain)) {
              isCompetitorDomain = true;
              break;
            }
          }
          
          // Create the page analysis object
          const pageAnalysis = {
            page_analysis_id: pageId,
            technical_seo: {
              is_valid: true,
              is_crawlable: true,
              http_response_code: 200,
              schema_markup_present: pageData.schemaMarkupPresent || false,
              schema_types: pageData.schemaTypes ? pageData.schemaTypes.split(', ') : [],
              html_structure_score: pageData.htmlStructureScore || 5,
              semantic_html_usage: pageData.semantic_html_usage || false,
              mobile_friendly: pageData.mobileFriendly || true,
              hreflang_declaration: pageData.hreflang_declaration || false,
              date_created: null,
              date_modified: pageData.lastModifiedDate || null,
              cdn_usage: pageData.cdn_usage || false,
              meta_description_present: pageData.metaDescription ? true : false,
              aria_labels_present: pageData.aria_labels_present || false,
              aria_labels_types: pageData.aria_labels_types || [],
              social_graphs_present: pageData.social_graphs_present || false
            },
            page_performance: {
              page_speed_score: pageData.pageSpeedScore || 50,
              firstContentfulPaint: pageData.firstContentfulPaint || 1000,
              largestContentfulPaint: pageData.largestContentfulPaint || 2500,
              totalBlockingTime: pageData.totalBlockingTime || 100,
              cumulativeLayoutShift: pageData.cumulativeLayoutShift || 0.1,
              accessibility_score: pageData.accessibilityScore || 5
            },
            domain_authority: {
              domain_name: domain,
              domain_authority: pageData.domain_authority || 30,
              page_authority: pageData.page_authority || 20,
              backlink_count: pageData.backlink_count || 100,
              referring_domains: pageData.referring_domains || 50,
              link_propensity: pageData.link_propensity || 0.5,
              spam_score: pageData.spam_score || 2
            },
            on_page_seo: {
              page_title: pageData.pageTitle || '',
              content_type: contentAnalysis.content_type || 'Article',
              meta_description: pageData.metaDescription || '',
              word_count: pageData.wordCount || 0,
              image_count: pageData.imageCount || 0,
              video_present: pageData.videoPresent || false,
              has_table: pageData.has_table || false,
              has_table_count: pageData.has_table_count || 0,
              has_unordered_list: pageData.has_unordered_list || false,
              has_unordered_list_count: pageData.has_unordered_list_count || 0,
              has_ordered_list: pageData.has_ordered_list || false,
              has_ordered_list_count: pageData.has_ordered_list_count || 0,
              internal_link_count: pageData.internalLinkCount || 0,
              folder_depth: pageData.folder_depth || 1,
              authorship_clear: pageData.authorshipClear || false,
              heading_count: pageData.total_headings || 0,
              heading_count_type: pageData.heading_count_type || {
                h1: 1,
                h2: 3,
                h3: 5,
                h4: 2,
                h5: 0,
                h6: 0
              },
              keyword_match: contentAnalysis.keyword_match || []
            },
            content_quality: {
              content_depth_score: contentAnalysis.content_depth_score || 5,
              readability_score: contentAnalysis.reading_score || 5,
              sentiment_score: contentAnalysis.sentiment_score || 0,
              content_uniqueness: contentAnalysis.content_uniqueness || 5,
              content_optimization_score: contentAnalysis.content_optimization_score || 5,
              has_statistics: contentAnalysis.has_statistics || false,
              has_quotes: contentAnalysis.has_quotes || false,
              has_citations: contentAnalysis.has_citation || false,
              has_research: contentAnalysis.has_research || false,
              analysis_score: contentAnalysis.gpt_content_score || 5,
              rock_paper_scissors: contentAnalysis.rock_paper_scissors || 'Paper',
              citation_match_quality: contentAnalysis.citation_match_quality || 5,
              eeat_score: 5, // Placeholder value
              ai_content_detection: 3, // Placeholder value
              topical_cluster: contentAnalysis.topical_cluster || ''
            },
            page_analysis: {
              page_relevance_type: contentAnalysis.page_relevance_type || 'partial',
              page_intent_alignment: contentAnalysis.page_intent_alignment || 'moderate_match',
              content_format: contentAnalysis.content_format || 'article',
              content_depth: contentAnalysis.content_depth || 'overview',
              brand_positioning: contentAnalysis.brand_positioning || 'absent',
              competitor_presence: contentAnalysis.competitor_presence || 'none',
              call_to_action_strength: contentAnalysis.call_to_action_strength || 'passive',
              content_recency: contentAnalysis.content_recency || 'undated',
              eeat_signals: contentAnalysis.eeat_signals || 'moderate',
              user_experience_quality: contentAnalysis.user_experience_quality || 'average',
              content_structure: contentAnalysis.content_structure || 'hierarchical'
            },
            citation_url: citation.url,
            citation_position: citation.position,
            mention_type: ['citation'],
            is_client_domain: isClientDomain,
            is_competitor_domain: isCompetitorDomain,
            analysis_notes: contentAnalysis.analysis_notes || ''
          };
          
          // Add to the associated pages
          resultObject.associated_pages.push(pageAnalysis);
        }
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error.message);
      }
    }
    
    // Log cache performance
    console.log(`Cache performance: ${cacheHits} hits, ${cacheMisses} misses`);
    
    // Update the associated pages count
    resultObject.associated_pages_count = resultObject.associated_pages.length;
    
    return resultObject;
  } catch (error) {
    console.error('Error running query:', error);
    resultObject.error = error.message;
    return resultObject;
  }
}

/**
 * Run a query on both ChatGPT and Perplexity, then combine results
 * @param {string} query - The query to run
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Combined query results
 */
async function runBothQueries(query, options) {
  console.log(`Running query on both ChatGPT and Perplexity: "${query}"`);
  const startTime = new Date();
  
  // Create unique query IDs
  const queryIdBase = uuidv4().substring(0, 8);
  
  // Prepare result objects
  const results = {
    chatgpt: {
      query_id: `chatgpt_${queryIdBase}`,
      query_text: query,
      query_keyword: options.keyword || query.split(' ').slice(0, 3).join(' '),
      funnel_stage: options.funnelStage || 'TOFU',
      citation_count: 0,
      query_category: options.category || 'Informational',
      query_topic: options.topic || 'Marketing Technology',
      query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple',
      query_type: options.type || 'question',
      query_intent: options.intent || 'informational',
      response_match: 'direct',
      response_outcome: 'information',
      brand_mention_type: 'none',
      competitor_context: 'none',
      action_orientation: 'passive',
      query_competition: 'opportunity',
      model_response: '',
      run_timestamp: startTime.toISOString(),
      data_source: 'chatgpt',
      brand_mentioned: false,
      brand_sentiment: null,
      competitor_mentioned_name: [],
      competitor_count: 0,
      associated_pages_count: 0,
      associated_pages: []
    },
    perplexity: {
      query_id: `perplexity_${queryIdBase}`,
      query_text: query,
      query_keyword: options.keyword || query.split(' ').slice(0, 3).join(' '),
      funnel_stage: options.funnelStage || 'TOFU',
      citation_count: 0,
      query_category: options.category || 'Informational',
      query_topic: options.topic || 'Marketing Technology',
      query_complexity: query.split('.').length > 1 ? 'Complex' : 'Simple',
      query_type: options.type || 'question',
      query_intent: options.intent || 'informational',
      response_match: 'direct',
      response_outcome: 'information',
      brand_mention_type: 'none',
      competitor_context: 'none',
      action_orientation: 'passive',
      query_competition: 'opportunity',
      model_response: '',
      run_timestamp: startTime.toISOString(),
      data_source: 'perplexity',
      brand_mentioned: false,
      brand_sentiment: null,
      competitor_mentioned_name: [],
      competitor_count: 0,
      associated_pages_count: 0,
      associated_pages: []
    }
  };
  
  // Run queries in parallel
  const chatgptPromise = processSingleQuery(query, { ...options, source: 'chatgpt' }, results.chatgpt);
  const perplexityPromise = processSingleQuery(query, { ...options, source: 'perplexity' }, results.perplexity);
  
  // Wait for both to complete
  try {
    await Promise.all([chatgptPromise, perplexityPromise]);
  } catch (error) {
    console.error("Error while running parallel queries:", error);
    // Continue with whatever results we have
  }
  
  return results;
}

/**
 * The main function
 */
async function main() {
  let outputFile = null;
  
  try {
    // Get query from command line args or use default
    const args = process.argv.slice(2);
    const query = args[0] || "What are the best podcasts about marketing technology?";
    
    // Define client info
    const clientInfo = {
      brandName: "Humans of Martech",
      brandDomain: "humansofmartech.com",
      competitors: [
        { name: "MarTech Podcast", pattern: "martechpod\\.com" },
        { name: "Martech Zone Interviews", pattern: "martechzone\\.com" },
        { name: "Marketing Over Coffee", pattern: "marketingovercoffee\\.com" },
        { name: "Show Me Your Tech Stack", pattern: "showmeyourtechstack\\.com" },
        { name: "Making Sense of MarTech", pattern: "making-sense-of-martech\\.com" },
        { name: "The CMO Podcast", pattern: "thecmo\\.com" }
      ]
    };
    
    // Determine if we should run one or both platforms
    const platform = args[1] || 'both'; // 'chatgpt', 'perplexity', or 'both'
    
    // Prepare output directory before running query
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
        search_context_size: 'low' // to minimize costs
      });
    } else {
      // Run on a single platform
      console.log(`Running query on ${platform}: "${query}"`);
      const queryId = `${platform}_${uuidv4().substring(0, 8)}`;
      
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
        query_type: 'question',
        query_intent: 'informational',
        response_match: 'direct',
        response_outcome: 'information',
        brand_mention_type: 'none',
        competitor_context: 'none',
        action_orientation: 'passive',
        query_competition: 'opportunity',
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
        search_context_size: 'low'
      }, resultObject);
      
      // Format the results in the same structure as runBothQueries
      queryResults = { [platform]: resultObject };
    }
    
    // Extract the query results into an array
    const queryDataArray = Object.values(queryResults);
    
    // Create client summary data
    const clientSummary = createClientSummary(queryDataArray, clientInfo.competitors);
    
    // Create the final output
    const outputData = {
      client_name: clientInfo.brandName,
      date_of_analysis: new Date().toISOString(),
      query_data: queryDataArray,
      client_summary: clientSummary
    };
    
    // Write to file with error handling
    try {
      outputFile = path.join(outputDir, `query_analysis_${Date.now()}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
      console.log(`Analysis complete! Results written to ${outputFile}`);
    } catch (writeError) {
      console.error('Error writing output file:', writeError);
      // Try to write to a default location as fallback
      try {
        outputFile = path.join(process.cwd(), `query_analysis_${Date.now()}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
        console.log(`Analysis written to fallback location: ${outputFile}`);
      } catch (fallbackError) {
        console.error('Failed to write output even to fallback location:', fallbackError);
      }
    }
    
    return outputFile;
  } catch (error) {
    console.error('Fatal error in main process:', error);
    // Try to create a minimal output file so something is saved
    try {
      const outputDir = path.join(process.cwd(), 'data/output');
      ensureDirectoryExists(outputDir);
      outputFile = path.join(outputDir, `error_analysis_${Date.now()}.json`);
      
      const errorData = {
        client_name: "Humans of Martech",
        date_of_analysis: new Date().toISOString(),
        error: error.message,
        error_stack: error.stack,
        query_data: []
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(errorData, null, 2));
      console.log(`Error saved to: ${outputFile}`);
    } catch (outputError) {
      console.error('Failed to save error information:', outputError);
    }
  }
  
  return outputFile;
}

// Run the main function if this script is called directly
if (require.main === module) {
  main();
}

// Export functions for use in other files
module.exports = {
  processSingleQuery,
  runBothQueries,
  main
};