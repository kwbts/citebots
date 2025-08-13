const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Import our modules
const queryGenerator = require('./lib/queryGenerator');
const llmResearcher = require('./lib/llmResearcher');
const webSearcher = require('./lib/webSearcher');
const contentScraper = require('./lib/contentScraper');
const enhancedScraper = require('./lib/enhancedScraper');
const contentAnalyzer = require('./lib/contentAnalyzer');
const briefAssembler = require('./lib/briefAssembler');
const clientDataEnhancer = require('./lib/clientDataEnhancer');
const metricsHelper = require('./lib/metricsHelper');
const logger = require('./lib/logger');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.BRIEF_GENERATOR_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate brief endpoint
app.post('/generate-brief', async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  logger.info('Brief generation request received', { 
    requestId, 
    clientId: req.body.clientId || 'generic',
    title: req.body.title,
    keywords: req.body.keywords
  });

  try {
    // LIFECYCLE CHECK 1: Request validation
    logger.info('Starting brief generation request validation');

    // Validate required fields
    const requiredFields = ['title', 'keywords', 'purpose', 'audience', 'researchDepth', 'platforms'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      logger.warn('Invalid request - missing fields', { missingFields });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Extract data from request
    const {
      clientId,
      title,
      keywords,
      purpose,
      audience,
      styleGuide,
      customInstructions,
      researchDepth,
      platforms,
      userId // Should be provided by the authenticated frontend
    } = req.body;

    // Ensure we have at least one platform selected
    if (!platforms.chatGpt && !platforms.perplexity && !platforms.google) {
      logger.warn('Invalid request - no platforms selected');
      throw new Error('At least one research platform must be selected');
    }

    logger.info('Request validation successful', {
      title,
      keywordCount: keywords.length,
      selectedPlatforms: Object.entries(platforms)
        .filter(([_, selected]) => selected)
        .map(([name]) => name)
    });

    // LIFECYCLE CHECK 2: Database record creation
    logger.info('Creating brief record in database');

    const briefRecord = {
      client_id: clientId || null,
      title,
      keywords,
      purpose,
      audience,
      style_guide: styleGuide || null,
      custom_instructions: customInstructions || null,
      research_depth: researchDepth,
      platforms,
      status: 'pending',
      created_by: userId,
      logs: {
        created: new Date().toISOString(),
        steps: []
      }
    };

    const { data: brief, error } = await supabase
      .from('content_briefs')
      .insert(briefRecord)
      .select()
      .single();

    if (error) {
      logger.error('Database error creating brief record', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details || 'No details available'
      });
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Brief record created successfully', {
      briefId: brief.id,
      clientId: brief.client_id,
      status: brief.status
    });

    // Start processing in the background
    processBrief(brief.id, req.body).catch(err => {
      logger.error('Error in background processing', { 
        requestId, 
        briefId: brief.id,
        error: err.message,
        stack: err.stack
      });
    });

    // Return immediately with the brief ID
    res.status(200).json({
      success: true,
      briefId: brief.id,
      message: 'Brief generation started',
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    logger.error('Error processing brief generation request', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get brief by ID endpoint
app.get('/brief/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: brief, error } = await supabase
      .from('content_briefs')
      .select('*, client:clients(id, name, domain)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Brief not found'
      });
    }

    res.status(200).json({
      success: true,
      brief
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// List briefs endpoint with filtering
app.get('/briefs', async (req, res) => {
  try {
    const { client_id, status, created_by, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('content_briefs')
      .select('*, client:clients(id, name, domain)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (created_by) {
      query = query.eq('created_by', created_by);
    }
    
    const { data: briefs, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      briefs,
      count: briefs.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// The main brief processing function
async function processBrief(briefId, briefData) {
  const requestId = uuidv4();
  logger.info('Starting brief processing pipeline', { briefId });

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
    // LIFECYCLE CHECK 3: Process initialization
    // Update status to processing
    await updateBriefStatus(briefId, 'processing');
    logger.info('Brief status updated to processing', { briefId });

    // Step 1: Fetch and enhance client data if a client is selected
    logger.info('PHASE 1: Client data retrieval and enhancement', {
      hasClientId: !!briefData.clientId
    });

    let clientData = null;
    if (briefData.clientId) {
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
          clientName: clientData.name,
          clientDomain: clientData.domain,
          competitorsCount: clientData.competitors?.length || 0,
          enhancedFields: Object.keys(clientData).length
        });
      } catch (enhancementError) {
        logger.warn('Client data enhancement failed, using raw data', {
          error: enhancementError.message
        });
        clientData = client;
      }

      await logProcessingStep(briefId, 'client_data_fetched_and_enhanced', {
        client: {
          id: clientData.id,
          name: clientData.name,
          domain: clientData.domain,
          competitors_count: clientData.competitors?.length || 0,
          enhanced: clientData !== client
        }
      });
    } else {
      logger.info('No client specified, creating generic brief');
      await logProcessingStep(briefId, 'generic_brief_noted', {
        message: 'No client specified, creating generic brief'
      });
    }

    // LIFECYCLE CHECK 4: Query generation
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

      // Fail fast instead of using fallback queries
      throw error;
    }

    // LIFECYCLE CHECK 5: Research execution setup
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
            const successCount = results.filter(r => !r.error).length;
            logger.info('ChatGPT research completed', {
              successCount,
              errorCount: results.length - successCount
            });

            researchResults.llmResponses.push(...results);
            return logProcessingStep(briefId, 'chatgpt_research_completed', {
              count: results.length,
              successCount,
              queries: results.map(r => r.query)
            });
          })
          .catch(err => {
            logger.error('ChatGPT research failed', { error: err.message });
            return logProcessingStep(briefId, 'chatgpt_research_failed', {
              error: err.message
            });
          })
      );
    }

    // 3.2: LLM Research (Perplexity)
    if (briefData.platforms.perplexity) {
      logger.info('Initiating Perplexity research', { queryCount: queries.length });
      perplexityUsed = true;
      researchPromises.push(
        llmResearcher.queryPerplexity(queries, clientData)
          .then(results => {
            const successCount = results.filter(r => !r.error).length;
            logger.info('Perplexity research completed', {
              successCount,
              errorCount: results.length - successCount,
              usingMock: process.env.USE_MOCK_PERPLEXITY === 'true'
            });

            researchResults.llmResponses.push(...results);
            return logProcessingStep(briefId, 'perplexity_research_completed', {
              count: results.length,
              successCount,
              queries: results.map(r => r.query)
            });
          })
          .catch(err => {
            logger.error('Perplexity research failed', { error: err.message });
            perplexityUsed = false;
            return logProcessingStep(briefId, 'perplexity_research_failed', {
              error: err.message
            });
          })
      );
    }

    // 3.3: Google Search (max 3 searches)
    if (briefData.platforms.google) {
      // Use first 3 keywords maximum for Google searches
      const searchKeywords = briefData.keywords.slice(0, 3);
      logger.info('Initiating Google search', { keywordCount: searchKeywords.length });

      researchPromises.push(
        webSearcher.googleSearch(searchKeywords, clientData)
          .then(results => {
            logger.info('Google search completed', { resultCount: results.length });
            researchResults.searchResults = results;
            return logProcessingStep(briefId, 'google_search_completed', {
              count: results.length,
              keywords: searchKeywords
            });
          })
          .catch(err => {
            logger.error('Google search failed', { error: err.message });
            return logProcessingStep(briefId, 'google_search_failed', {
              error: err.message
            });
          })
      );
    }

    // LIFECYCLE CHECK 6: Wait for all research to complete
    logger.info('Waiting for all research tasks to complete');
    await Promise.all(researchPromises);
    processTimings.llmResearch = Date.now() - llmResearchStart;

    logger.info('All research tasks completed', {
      llmResponseCount: researchResults.llmResponses.length,
      searchResultCount: researchResults.searchResults.length,
      timeTaken: processTimings.llmResearch
    });
    
    // LIFECYCLE CHECK 7: Content scraping preparation
    logger.info('PHASE 4: Content scraping preparation');
    const urlsToScrape = [];

    // Extract URLs from LLM responses
    researchResults.llmResponses.forEach(response => {
      if (response.citations) {
        response.citations.forEach(citation => {
          if (citation.url && !urlsToScrape.includes(citation.url)) {
            urlsToScrape.push(citation.url);
          }
        });
      }
    });

    // Add URLs from Google search results
    researchResults.searchResults.forEach(result => {
      if (result.url && !urlsToScrape.includes(result.url)) {
        urlsToScrape.push(result.url);
      }
    });

    logger.info('Initial URL collection completed', {
      totalUrlsFound: urlsToScrape.length
    });

    await logProcessingStep(briefId, 'content_scraping_started', {
      initialUrlCount: urlsToScrape.length,
      urls: urlsToScrape.slice(0, 5) // Log only first 5 URLs to avoid excessive logging
    });

    // LIFECYCLE CHECK 8: Enhanced content scraping execution
    const webScrapingStart = Date.now();
    logger.info('Starting enhanced content scraping', {
      initialUrlCount: urlsToScrape.length,
      usingMock: process.env.USE_MOCK_SCRAPING === 'true'
    });

    try {
      // Use enhanced scraper that extracts additional links
      const enhancedScrapingOptions = {
        extractLinks: true,         // Extract additional links from the content
        linkDepth: 1,               // Only go one level deep
        maxLinksPerPage: 3,         // Extract up to 3 links per page
        sameDomainOnly: false       // Allow links to other domains
      };

      // Execute enhanced scraping with timeout protection
      const SCRAPING_TIMEOUT = 5 * 60 * 1000; // 5 minutes maximum
      const enhancedScrapingResults = await Promise.race([
        enhancedScraper.enhancedScrape(urlsToScrape, enhancedScrapingOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Enhanced scraping timed out after ${SCRAPING_TIMEOUT / 1000} seconds`)), SCRAPING_TIMEOUT)
        )
      ]);

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
      logger.error('Enhanced content scraping failed', { error: error.message });

      // Fallback to standard scraping if enhanced scraping fails
      try {
        logger.info('Falling back to standard content scraping');
        const FALLBACK_TIMEOUT = 3 * 60 * 1000; // 3 minutes for fallback
        researchResults.scrapedContent = await Promise.race([
          contentScraper.scrapeUrls(urlsToScrape),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Fallback scraping timed out after ${FALLBACK_TIMEOUT / 1000} seconds`)), FALLBACK_TIMEOUT)
          )
        ]);

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
    
    // LIFECYCLE CHECK 9: Content analysis
    const contentAnalysisStart = Date.now();
    logger.info('PHASE 5: Content analysis', {
      title: briefData.title,
      researchDataPoints: {
        llmResponses: researchResults.llmResponses.length,
        searchResults: researchResults.searchResults.length,
        scrapedPages: researchResults.scrapedContent.length
      }
    });

    const analysisParams = {
      title: briefData.title,
      keywords: briefData.keywords,
      purpose: briefData.purpose,
      audience: briefData.audience,
      clientData,
      llmResponses: researchResults.llmResponses,
      searchResults: researchResults.searchResults,
      scrapedContent: researchResults.scrapedContent,
      depth: briefData.researchDepth
    };

    let analysisResults;
    try {
      analysisResults = await contentAnalyzer.analyzeContent(analysisParams);

      logger.info('Content analysis completed successfully', {
        summaryLength: analysisResults.summary?.length || 0,
        strategicInsightsGenerated: !!analysisResults.strategicPositioning,
        competitorInsightsCount: analysisResults.competitorInsights?.length || 0
      });

      // Check if Claude insights were successfully generated
      claudeInsightsGenerated = !!analysisResults.statistics && analysisResults.statistics.length > 0;

      processTimings.contentAnalysis = Date.now() - contentAnalysisStart;
      await logProcessingStep(briefId, 'content_analysis_completed', {
        summaryLength: analysisResults.summary?.length || 0,
        strategicInsightsGenerated: !!analysisResults.strategicPositioning,
        competitorInsightsCount: analysisResults.competitorInsights?.length || 0,
        statisticsCount: (analysisResults.statistics || []).length,
        claudeInsightsGenerated,
        timeTaken: processTimings.contentAnalysis
      });
    } catch (error) {
      logger.error('Content analysis failed', { error: error.message });
      await logProcessingStep(briefId, 'content_analysis_error', {
        error: error.message
      });

      // Fail fast instead of creating fallback analysis
      throw error;
    }

    // LIFECYCLE CHECK 10: Brief assembly
    const briefAssemblyStart = Date.now();
    logger.info('PHASE 6: Brief assembly');

    let brief;
    try {
      brief = await briefAssembler.assembleBrief({
        title: briefData.title,
        keywords: briefData.keywords,
        purpose: briefData.purpose,
        audience: briefData.audience,
        clientData,
        styleGuide: briefData.styleGuide,
        customInstructions: briefData.customInstructions,
        analysisResults,
        researchResults
      });

      processTimings.briefAssembly = Date.now() - briefAssemblyStart;

      logger.info('Brief assembly completed successfully', {
        tocSections: brief.table_of_contents.length,
        researchLinksCount: brief.research_links.length,
        statisticsCount: (brief.statistics || []).length,
        timeTaken: processTimings.briefAssembly
      });

      await logProcessingStep(briefId, 'brief_assembly_completed', {
        tocSections: brief.table_of_contents.length,
        researchLinksCount: brief.research_links.length,
        statisticsCount: (brief.statistics || []).length,
        timeTaken: processTimings.briefAssembly
      });
    } catch (error) {
      logger.error('Brief assembly failed', { error: error.message });
      await logProcessingStep(briefId, 'brief_assembly_error', {
        error: error.message
      });

      // Fail fast instead of creating minimal brief structure
      throw error;
    }
    
    // LIFECYCLE CHECK 11: Database update with tracking metrics
    logger.info('PHASE 7: Database update - saving completed brief with tracking metrics');

    try {
      // Calculate processing time and metrics
      const startTime = new Date(briefData.createdAt || Date.now() - 60000);
      const processingTimeMs = Date.now() - startTime.getTime();
      const processingSeconds = (processingTimeMs / 1000).toFixed(2);

      // Compile processing metrics
      const processingMetrics = {
        total_processing_time_ms: processingTimeMs,
        query_generation_time_ms: processTimings.queryGeneration || 0,
        llm_research_time_ms: processTimings.llmResearch || 0,
        web_scraping_time_ms: processTimings.webScraping || 0,
        content_analysis_time_ms: processTimings.contentAnalysis || 0,
        brief_assembly_time_ms: processTimings.briefAssembly || 0,
        urls_processed: researchResults.scrapedContent.length,
        urls_discovered: (researchResults.extractedLinks || []).length + (researchResults.scrapedContent || []).length,
        total_queries_executed: (researchResults.llmResponses || []).length
      };

      // Compile source attribution
      const sourceAttribution = {
        chatgpt_citations: researchResults.llmResponses.filter(r => r.platform === 'chatgpt').reduce((sum, r) => sum + (r.citations?.length || 0), 0),
        perplexity_citations: researchResults.llmResponses.filter(r => r.platform === 'perplexity').reduce((sum, r) => sum + (r.citations?.length || 0), 0),
        google_search_results: (researchResults.searchResults || []).length,
        primary_urls: researchResults.crawlStats?.primaryPages || researchResults.scrapedContent.length,
        secondary_urls: researchResults.crawlStats?.secondaryPages || 0,
        competitor_urls: clientData && clientData.competitors ?
          metricsHelper.countCompetitorUrls(researchResults.scrapedContent, clientData.competitors) : 0,
        citation_domains: metricsHelper.extractUniqueDomains(researchResults.llmResponses)
      };

      // Compile AI model usage
      const aiModelsUsed = {
        claude: claudeInsightsGenerated ? {
          model_version: "claude-sonnet-4-20250514",
          usage: "insight_generation",
          tokens_used: metricsHelper.estimateClaudeTokensUsed(brief)
        } : null,
        gpt: {
          model_version: "gpt-4o",
          usage: "content_analysis_and_generation",
          tokens_used: metricsHelper.estimateGptTokensUsed(brief)
        },
        perplexity: perplexityUsed ? {
          model_version: "llama-3-70b-online",
          usage: "research",
          tokens_used: metricsHelper.estimatePerplexityTokensUsed(researchResults)
        } : null
      };

      // Compile quality metrics
      const qualityMetrics = {
        statistics_count: (brief.statistics || []).length,
        expert_quotes_count: metricsHelper.countExpertQuotes(brief),
        citation_count: (brief.research_links || []).length,
        competitor_insight_count: (brief.process_notes?.competitor_insights || []).length,
        toc_sections_count: (brief.table_of_contents || []).length,
        research_links_count: (brief.research_links || []).length,
        word_count: metricsHelper.countTotalWords(brief),
        claude_enhanced: claudeInsightsGenerated || false
      };

      // Compile client context if available
      const clientContext = clientData ? {
        market_position: clientData.marketPosition?.type || 'unknown',
        differentiators: clientData.differentiators || [],
        competitors_analyzed: clientData.competitors?.map(c => c.domain) || [],
        industry_context: clientData.industry?.primary || 'general'
      } : null;

      // Update the database with all metrics
      const { error } = await supabase
        .from('content_briefs')
        .update({
          status: 'completed',
          content: brief,
          processing_metrics: processingMetrics,
          source_attribution: sourceAttribution,
          ai_models_used: aiModelsUsed,
          quality_metrics: qualityMetrics,
          client_context: clientContext,
          updated_at: new Date().toISOString()
        })
        .eq('id', briefId);

      if (error) {
        logger.error('Database error when saving brief content and metrics', {
          error: error.message,
          errorCode: error.code
        });
        throw new Error(`Error updating brief with content and metrics: ${error.message}`);
      }

      logger.info('Brief generation completed successfully with metrics', {
        briefId,
        title: briefData.title,
        processingTime: `${processingSeconds}s`,
        totalUrls: processingMetrics.urls_processed,
        statistics: qualityMetrics.statistics_count,
        finalStatus: 'completed'
      });

      await logProcessingStep(briefId, 'brief_generation_completed', {
        processingTime: processingSeconds,
        status: 'completed',
        metrics: {
          urls_processed: processingMetrics.urls_processed,
          statistics_count: qualityMetrics.statistics_count,
          toc_sections: qualityMetrics.toc_sections_count
        }
      });

    } catch (error) {
      logger.error('Error in final database update', {
        briefId,
        error: error.message
      });

      // Try one more time to update the database with a partial success status
      try {
        await supabase
          .from('content_briefs')
          .update({
            status: 'completed_with_errors',
            content: brief,
            error_message: `Completed with errors: ${error.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', briefId);

        logger.info('Brief saved with partial success status', { briefId });
      } catch (dbError) {
        logger.error('Failed to update brief status even with error status', {
          briefId,
          error: dbError.message
        });
      }
    }

  } catch (error) {
    // LIFECYCLE CHECK 12: Error handling for the entire process
    logger.error('Critical error in brief generation process', {
      briefId,
      phase: error.phase || 'unknown',
      error: error.message
    });

    // Final attempt to update the database with failure status
    try {
      await supabase
        .from('content_briefs')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', briefId);

      await logProcessingStep(briefId, 'brief_generation_failed', {
        error: error.message
      });

      logger.info('Brief status updated to failed', { briefId });
    } catch (dbError) {
      logger.error('Failed to update brief status to failed', {
        briefId,
        error: dbError.message
      });
    }
  }
}


// Helper function to update brief status
async function updateBriefStatus(briefId, status) {
  const { error } = await supabase
    .from('content_briefs')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', briefId);
  
  if (error) {
    logger.error('Error updating brief status', { briefId, status, error });
    throw new Error(`Error updating brief status: ${error.message}`);
  }
}

// Helper function to log processing steps
async function logProcessingStep(briefId, step, data) {
  // First fetch current logs
  const { data: brief, error: fetchError } = await supabase
    .from('content_briefs')
    .select('logs')
    .eq('id', briefId)
    .single();
  
  if (fetchError) {
    logger.error('Error fetching brief logs', { briefId, step, error: fetchError });
    throw new Error(`Error fetching brief logs: ${fetchError.message}`);
  }
  
  // Update logs with new step
  const logs = brief.logs || { steps: [] };
  logs.steps.push({
    step,
    timestamp: new Date().toISOString(),
    data
  });
  
  // Save updated logs
  const { error: updateError } = await supabase
    .from('content_briefs')
    .update({ logs })
    .eq('id', briefId);
  
  if (updateError) {
    logger.error('Error updating brief logs', { briefId, step, error: updateError });
    throw new Error(`Error updating brief logs: ${updateError.message}`);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Brief generator server running on port ${PORT}`);
  logger.info(`Brief generator server started on port ${PORT}`);
});

module.exports = app; // For testing