const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const queryGenerator = require('./queryGenerator');
const llmResearcher = require('./llmResearcher');
const webSearcher = require('./webSearcher');
const contentScraper = require('./contentScraper');
const enhancedScraper = require('./enhancedScraper');
const contentAnalyzer = require('./contentAnalyzer');
const briefAssembler = require('./briefAssembler');
const clientDataEnhancer = require('./clientDataEnhancer');
const metricsHelper = require('./metricsHelper');
const { cleanAndValidateUrl } = require('./contentScraper');
const logger = require('./logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to update brief status
async function updateBriefStatus(briefId, status, updateData = {}) {
  const { error } = await supabase
    .from('content_briefs')
    .update({
      status,
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', briefId);

  if (error) {
    logger.error('Failed to update brief status', {
      briefId,
      status,
      error: error.message
    });
    throw error;
  }
}

// Helper function to log processing steps
async function logProcessingStep(briefId, step, metadata = {}) {
  try {
    const { error } = await supabase
      .from('brief_processing_logs')
      .insert({
        brief_id: briefId,
        step,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      logger.warn('Failed to log processing step', {
        briefId,
        step,
        error: error.message
      });
    }
  } catch (error) {
    logger.warn('Error logging processing step', {
      briefId,
      step,
      error: error.message
    });
  }
}

// Generate fallback suggestions when analysis fails
function generateFallbackSuggestions(briefData) {
  return [
    {
      category: 'Introduction',
      content: `Start with a compelling introduction that addresses the importance of ${briefData.title} for ${briefData.audience} audience.`
    },
    {
      category: 'Main Content',
      content: `Cover the key aspects of ${briefData.keywords.join(' and ')} with practical examples and actionable insights.`
    },
    {
      category: 'Best Practices',
      content: `Include industry best practices and common pitfalls to avoid when implementing ${briefData.title}.`
    },
    {
      category: 'Conclusion',
      content: `Summarize key takeaways and provide clear next steps for readers to implement the concepts discussed.`
    }
  ];
}

// Main brief processing function
async function processBrief(briefData, options = {}) {
  const briefId = briefData.briefId || uuidv4();
  const requestId = uuidv4();
  logger.info('Starting brief processing pipeline', { briefId, requestId });

  // Initialize timing tracking
  const processStart = Date.now();
  const processTimings = {
    start: processStart,
    queryGeneration: 0,
    llmResearch: 0,
    webScraping: 0,
    contentAnalysis: 0,
    briefAssembly: 0
  };

  // Initialize feature flags
  let claudeInsightsGenerated = false;
  let perplexityUsed = false;

  try {
    // Update status to processing if we have a briefId
    if (briefData.briefId && !options.skipStatusUpdate) {
      await updateBriefStatus(briefId, 'processing');
      logger.info('Brief status updated to processing', { briefId });
    }

    // Step 1: Fetch and enhance client data if a client is selected
    logger.info('PHASE 1: Client data retrieval and enhancement', {
      hasClientId: !!briefData.clientId
    });

    let clientData = null;
    if (briefData.clientId && briefData.clientId !== 'knak-demo') {
      // Fetch raw client data
      const { data: client, error } = await supabase
        .from('clients')
        .select('*, competitors(*)')
        .eq('id', briefData.clientId)
        .single();

      if (error) {
        logger.error('Failed to fetch client data', {
          clientId: briefData.clientId,
          error: error.message
        });
        throw new Error(`Error fetching client data: ${error.message}`);
      }

      // Enhance client data for better AI context
      try {
        logger.info('Enhancing client data for improved analysis', {
          clientName: client.name,
          competitorsCount: client.competitors?.length || 0
        });

        clientData = await clientDataEnhancer.enhanceClientData(client);

        logger.info('Client data enhanced successfully', {
          enhancedFields: Object.keys(clientData).filter(key => !client[key])
        });
      } catch (enhanceError) {
        logger.warn('Client data enhancement failed, using raw data', {
          error: enhanceError.message
        });
        clientData = client;
      }
    } else if (briefData.clientId === 'knak-demo') {
      // Use demo client data
      clientData = {
        id: 'knak-demo',
        name: 'Knak',
        domain: 'knak.com',
        description: 'Marketing Technology',
        competitors: []
      };
    }

    await logProcessingStep(briefId, 'client_data_loaded', {
      clientId: clientData?.id,
      clientName: clientData?.name
    });

    // PHASE 2: Query generation
    logger.info('PHASE 2: Research query generation', {
      title: briefData.title,
      keywordCount: briefData.keywords.length
    });

    const queryGenStart = Date.now();
    const queryParams = {
      title: briefData.title,
      keywords: briefData.keywords,
      purpose: briefData.purpose,
      audience: briefData.audience,
      clientData,
      maxQueries: 3 // Limiting to max 3 queries
    };

    let queries;
    try {
      queries = await queryGenerator.generateQueries(queryParams);
      processTimings.queryGeneration = Date.now() - queryGenStart;

      logger.info('Research queries generated successfully', {
        queryCount: queries.length,
        queries: queries.map(q => q.substring(0, 50) + '...'),
        timeTaken: processTimings.queryGeneration
      });

      await logProcessingStep(briefId, 'queries_generated', {
        queries,
        timeTaken: processTimings.queryGeneration
      });
    } catch (error) {
      processTimings.queryGeneration = Date.now() - queryGenStart;
      logger.error('Failed to generate research queries', {
        error: error.message,
        timeTaken: processTimings.queryGeneration
      });
      await logProcessingStep(briefId, 'query_generation_failed', {
        error: error.message,
        timeTaken: processTimings.queryGeneration
      });

      // Create some basic queries from the title and keywords as a fallback
      queries = [
        `Provide comprehensive information about ${briefData.title}`,
        `What are the best practices for ${briefData.keywords[0] || briefData.title}?`,
        `How does ${briefData.keywords[1] || briefData.title} benefit ${briefData.audience}?`
      ];

      logger.info('Using fallback queries', { queries });
    }

    // PHASE 3: Research execution
    logger.info('PHASE 3: Research execution preparation', {
      platforms: briefData.platforms
    });

    const llmResearchStart = Date.now();
    const researchPromises = [];
    const researchResults = {
      llmResponses: [],
      searchResults: [],
      scrapedContent: []
    };
    
    // 3.1: LLM Research (ChatGPT)
    if (briefData.platforms.chatGpt) {
      logger.info('Initiating ChatGPT research', { queryCount: queries.length });
      researchPromises.push(
        llmResearcher.queryChatGPT(queries, clientData)
          .then(results => {
            researchResults.llmResponses.push(...results);
            logger.info('ChatGPT research completed', { responseCount: results.length });
            return results;
          })
          .catch(error => {
            logger.error('ChatGPT research failed', { error: error.message });
            return [];
          })
      );
    }

    // 3.2: Perplexity Research
    if (briefData.platforms.perplexity) {
      logger.info('Initiating Perplexity research', { queryCount: queries.length });
      researchPromises.push(
        llmResearcher.queryPerplexity(queries, clientData)
          .then(results => {
            researchResults.llmResponses.push(...results);
            perplexityUsed = true;
            logger.info('Perplexity research completed', { responseCount: results.length });
            return results;
          })
          .catch(error => {
            logger.error('Perplexity research failed', { error: error.message });
            return [];
          })
      );
    }

    // 3.3: Google Search Research
    if (briefData.platforms.google) {
      logger.info('Initiating Google search research', { queryCount: queries.length });
      researchPromises.push(
        webSearcher.googleSearch(queries, clientData)
          .then(results => {
            researchResults.searchResults.push(...results);
            logger.info('Google search completed', { resultCount: results.length });
            return results;
          })
          .catch(error => {
            logger.error('Google search failed', { error: error.message });
            return [];
          })
      );
    }

    // Wait for all research to complete
    try {
      await Promise.all(researchPromises);
      processTimings.llmResearch = Date.now() - llmResearchStart;

      logger.info('All research phases completed', {
        llmResponseCount: researchResults.llmResponses.length,
        searchResultCount: researchResults.searchResults.length,
        timeTaken: processTimings.llmResearch
      });

      await logProcessingStep(briefId, 'research_completed', {
        llmResponses: researchResults.llmResponses.length,
        searchResults: researchResults.searchResults.length,
        timeTaken: processTimings.llmResearch
      });
    } catch (error) {
      logger.error('Research phase failed', { error: error.message });
      await logProcessingStep(briefId, 'research_failed', {
        error: error.message
      });
    }

    // PHASE 4: URL collection from research results
    logger.info('PHASE 4: URL collection from research results', {
      llmResponseCount: researchResults.llmResponses.length,
      searchResultCount: researchResults.searchResults.length
    });

    const urlsToScrape = [];

    // Collect URLs from LLM responses (this is where citation markers appear!)
    researchResults.llmResponses.forEach(response => {
      if (response.citations && Array.isArray(response.citations)) {
        response.citations.forEach(citation => {
          if (citation.url) {
            const cleanedUrl = cleanAndValidateUrl(citation.url);
            if (cleanedUrl && !urlsToScrape.includes(cleanedUrl)) {
              logger.debug('Adding URL from LLM citation', { 
                platform: response.platform,
                originalUrl: citation.url,
                cleanedUrl: cleanedUrl,
                citationMarkerRemoved: citation.url !== cleanedUrl
              });
              urlsToScrape.push(cleanedUrl);
            }
          }
        });
      }
    });

    // Add URLs from Google search results
    researchResults.searchResults.forEach(result => {
      if (result.url) {
        const cleanedUrl = cleanAndValidateUrl(result.url);
        if (cleanedUrl && !urlsToScrape.includes(cleanedUrl)) {
          logger.debug('Adding URL from search result', { 
            originalUrl: result.url,
            cleanedUrl: cleanedUrl,
            title: result.title
          });
          urlsToScrape.push(cleanedUrl);
        }
      }
    });

    logger.info('Initial URL collection completed', {
      totalUrlsFound: urlsToScrape.length,
      // Log first few URLs to see the citation marker issue
      sampleUrls: urlsToScrape.slice(0, 10)
    });

    await logProcessingStep(briefId, 'url_collection_completed', {
      initialUrlCount: urlsToScrape.length,
      urls: urlsToScrape.slice(0, 5) // Log only first 5 URLs to avoid excessive logging
    });

    // PHASE 5: Web scraping execution
    const webScrapingStart = Date.now();
    logger.info('PHASE 5: Starting enhanced content scraping', {
      initialUrlCount: urlsToScrape.length,
      usingMock: process.env.USE_MOCK_SCRAPING === 'true'
    });

    await logProcessingStep(briefId, 'content_scraping_started', {
      initialUrlCount: urlsToScrape.length,
      urls: urlsToScrape.slice(0, 5) // Log only first 5 URLs to avoid excessive logging
    });

    try {
      // Use enhanced scraper that extracts additional links
      const enhancedScrapingOptions = {
        extractLinks: true,         // Extract additional links from the content
        linkDepth: 1,               // Only go one level deep
        maxLinksPerPage: 3,         // Extract up to 3 links per page
        sameDomainOnly: false       // Allow links to other domains
      };

      // Execute enhanced scraping
      logger.info('Starting enhanced scraping with options', enhancedScrapingOptions);
      const enhancedScrapingResults = await enhancedScraper.enhancedScrape(urlsToScrape, enhancedScrapingOptions);

      // Store the pages in the research results
      researchResults.scrapedContent = enhancedScrapingResults.pages;

      // Store additional extracted links for reference
      researchResults.extractedLinks = enhancedScrapingResults.extractedLinks;

      // Store crawl statistics
      researchResults.crawlStats = enhancedScrapingResults.crawlStats;
      processTimings.webScraping = Date.now() - webScrapingStart;

      logger.info('Enhanced content scraping completed', {
        totalPagesScraped: enhancedScrapingResults.crawlStats.totalPages,
        primaryPages: enhancedScrapingResults.crawlStats.primaryPages,
        secondaryPages: enhancedScrapingResults.crawlStats.secondaryPages,
        extractedLinks: enhancedScrapingResults.extractedLinks.length,
        timeTaken: processTimings.webScraping
      });

      await logProcessingStep(briefId, 'content_scraping_completed', {
        scrapedCount: researchResults.scrapedContent.length,
        primaryPages: enhancedScrapingResults.crawlStats.primaryPages,
        secondaryPages: enhancedScrapingResults.crawlStats.secondaryPages,
        extractedLinksCount: enhancedScrapingResults.extractedLinks.length
      });
    } catch (error) {
      logger.error('Enhanced content scraping failed', { error: error.message, stack: error.stack });

      // Fallback to standard scraping if enhanced scraping fails
      try {
        logger.info('Falling back to standard content scraping');
        researchResults.scrapedContent = await contentScraper.scrapeUrls(urlsToScrape);

        logger.info('Standard content scraping completed as fallback', {
          successCount: researchResults.scrapedContent.length,
          failureCount: urlsToScrape.length - researchResults.scrapedContent.length
        });

        await logProcessingStep(briefId, 'content_scraping_fallback_completed', {
          scrapedCount: researchResults.scrapedContent.length,
          error: error.message
        });
      } catch (fallbackError) {
        logger.error('Fallback content scraping also failed', { error: fallbackError.message });
        await logProcessingStep(briefId, 'content_scraping_error', {
          error: `Enhanced scraping failed: ${error.message}. Fallback scraping failed: ${fallbackError.message}`,
          urlCount: urlsToScrape.length
        });

        // Continue with empty scraped content if there's an error
        researchResults.scrapedContent = [];
      }
    }

    // Return result with scraping completed
    return {
      success: true,
      briefId,
      processTimings,
      queries,
      clientData,
      researchResults: {
        llmResponseCount: researchResults.llmResponses.length,
        searchResultCount: researchResults.searchResults.length,
        urlsToScrape: urlsToScrape,
        scrapedContentCount: researchResults.scrapedContent?.length || 0,
        extractedLinksCount: researchResults.extractedLinks?.length || 0,
        crawlStats: researchResults.crawlStats,
        // Don't return full content to avoid huge output
        llmResponses: researchResults.llmResponses.map(r => ({ 
          platform: r.platform, 
          query: r.query?.substring(0, 50) + '...', 
          contentLength: r.content?.length || 0,
          citationCount: r.citations?.length || 0
        })),
        searchResults: researchResults.searchResults.map(r => ({ 
          query: r.query?.substring(0, 50) + '...', 
          url: r.url, 
          title: r.title?.substring(0, 50) + '...' 
        })),
        scrapedContent: researchResults.scrapedContent?.slice(0, 3).map(page => ({
          url: page.url,
          title: page.title?.substring(0, 50) + '...',
          contentLength: page.content?.length || 0,
          success: page.success
        })) || []
      },
      message: 'Web scraping completed - content analysis next'
    };

  } catch (error) {
    logger.error('Brief processing failed', {
      briefId,
      error: error.message,
      stack: error.stack
    });

    // Update status to error if we have a briefId
    if (briefData.briefId && !options.skipStatusUpdate) {
      await updateBriefStatus(briefId, 'error', {
        error_message: error.message
      });
    }

    throw error;
  }
}

module.exports = {
  processBrief,
  updateBriefStatus,
  logProcessingStep,
  generateFallbackSuggestions
};