const axios = require('axios');
const logger = require('./logger');

/**
 * Searches Google for the given keywords and client information
 * @param {Array<string>} keywords - The keywords to search for (max 3)
 * @param {Object} [clientData] - Optional client data
 * @returns {Promise<Array<Object>>} - The search results
 */
async function googleSearch(keywords, clientData) {
  const limitedKeywords = keywords.slice(0, 3); // Ensure max 3 keywords
  logger.info('Starting Google search', { 
    keywordCount: limitedKeywords.length,
    keywords: limitedKeywords,
    hasClientData: !!clientData
  });
  
  // Check if API key and search engine ID are available
  // Try both potential variable names based on the working implementation
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_ID;

  if (!googleApiKey || !searchEngineId) {
    const error = new Error('Google API key or search engine ID not found. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    logger.error('Google search configuration missing', {
      hasGoogleSearchApiKey: !!process.env.GOOGLE_SEARCH_API_KEY,
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      hasGoogleSearchEngineId: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
      hasGoogleCseId: !!process.env.GOOGLE_CSE_ID
    });
    throw error;
  }
  
  // Check for environment variable to disable Google search when quota is exceeded
  if (process.env.DISABLE_GOOGLE_SEARCH === 'true') {
    logger.warn('Google Search is disabled via DISABLE_GOOGLE_SEARCH environment variable');
    return [];
  }
  
  const results = [];
  
  // Search for each keyword with rate limiting
  for (let i = 0; i < limitedKeywords.length; i++) {
    const keyword = limitedKeywords[i];
    const startTime = Date.now();
    
    // Add delay between searches to avoid rate limiting (except for the first search)
    if (i > 0) {
      logger.debug('Adding delay between Google searches to avoid rate limiting');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 second delay
    }
    
    try {
      logger.debug('Executing Google search', { keyword });
      
      // Send request to Google Custom Search API with retry logic
      const response = await executeSearchWithRetry(googleApiKey, searchEngineId, keyword);
      
      // Process search results
      const searchResults = response.data.items || [];
      
      logger.debug('Received Google search results', {
        keyword,
        responseTime: Date.now() - startTime,
        resultCount: searchResults.length
      });
      
      // Add to results
      searchResults.forEach(item => {
        results.push({
          keyword,
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink
        });
      });
      
    } catch (error) {
      logger.error('Error executing Google search', {
        keyword,
        error: error.message,
        status: error.response?.status,
        isRateLimit: error.response?.status === 429
      });
      
      // If rate limited, add longer delay before next search
      if (error.response?.status === 429) {
        logger.warn('Rate limited by Google Search API, adding extended delay');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 second delay
      }
    }
  }
  
  // If client data is available, also search for client-specific content
  if (clientData && clientData.domain) {
    try {
      logger.debug('Executing client-specific search', { 
        domain: clientData.domain,
        keywords: limitedKeywords
      });
      
      // Add delay before client search if we did any previous searches
      if (limitedKeywords.length > 0) {
        logger.debug('Adding delay before client-specific search');
        await new Promise(resolve => setTimeout(resolve, 4000)); // Increased to 4 second delay
      }
      
      // Use first keyword for client-specific search
      const clientKeyword = limitedKeywords[0];
      const clientQuery = `site:${clientData.domain} ${clientKeyword}`;
      
      // Send request to Google Custom Search API for client domain with retry
      const response = await executeSearchWithRetry(googleApiKey, searchEngineId, clientQuery, 1); // Only 1 retry for client search
      
      // Process search results
      const searchResults = response.data.items || [];
      
      logger.debug('Received client-specific search results', {
        domain: clientData.domain,
        resultCount: searchResults.length
      });
      
      // Add to results
      searchResults.forEach(item => {
        results.push({
          keyword: clientKeyword,
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          isClientContent: true
        });
      });
      
    } catch (error) {
      logger.error('Error executing client-specific search', {
        domain: clientData.domain,
        error: error.message,
        status: error.response?.status,
        isRateLimit: error.response?.status === 429
      });
      
      // Log warning for rate limiting but don't fail the entire process
      if (error.response?.status === 429) {
        logger.warn('Client-specific search rate limited, continuing without client results');
      }
    }
  }
  
  logger.info('Completed Google search', {
    totalResults: results.length,
    clientContentResults: results.filter(r => r.isClientContent).length
  });
  
  return results;
}

/**
 * Execute Google search with retry logic for rate limiting
 * @param {string} apiKey - Google API key
 * @param {string} searchEngineId - Google Custom Search Engine ID
 * @param {string} keyword - Search keyword
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<Object>} - The search response
 */
async function executeSearchWithRetry(apiKey, searchEngineId, keyword, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: apiKey,
            cx: searchEngineId,
            q: keyword,
            num: 5 // Get top 5 results
          },
          timeout: 15000 // Increased to 15 second timeout
        }
      );
      
      return response;
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === maxRetries;
      
      if (isRateLimit && !isLastAttempt) {
        const delay = Math.min(3000 * Math.pow(2, attempt), 20000); // Exponential backoff, max 20 seconds
        logger.warn(`Google Search rate limited, retrying in ${delay}ms`, {
          keyword,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not rate limited or last attempt, throw the error
      throw error;
    }
  }
}

module.exports = {
  googleSearch
};