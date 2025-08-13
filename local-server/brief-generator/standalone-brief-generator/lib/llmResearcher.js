const axios = require('axios');
const logger = require('./logger');
const { AxiosOpenAI } = require('./axiosOpenAI');

/**
 * Queries ChatGPT with the generated research queries
 * Using the improved AxiosOpenAI client based on working patterns
 * @param {Array<string>} queries - The research queries
 * @param {Object} [clientData] - Optional client data
 * @returns {Promise<Array<Object>>} - The ChatGPT responses
 */
async function queryChatGPT(queries, clientData) {
  logger.info('Starting ChatGPT research', { queryCount: queries.length });
  const results = [];

  // Check if API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OpenAI API key not found, skipping ChatGPT research');
    return results;
  }

  // Initialize the OpenAI client with timeout and model preferences
  const openaiClient = new AxiosOpenAI(apiKey, {
    timeout: 120000, // 2 minute timeout
    defaultModel: 'gpt-4o' // Ensure we use the latest model
  });

  for (const query of queries) {
    const startTime = Date.now();

    try {
      logger.debug('Sending query to ChatGPT', { query });

      // Construct system message based on client data
      let systemMessage = 'You are a research assistant providing detailed, accurate information with a strong focus on STATISTICS, DATA POINTS, and EXPERT OPINIONS. Always include specific numbers, percentages, research findings, and quotable insights from industry experts.';

      if (clientData) {
        systemMessage += ` You are researching information for a company in the ${clientData.industry_primary || 'general'} industry. Include relevant competitive intelligence and market statistics.`;
      }

      systemMessage += ' Always include URLs to your sources, especially for any statistics or data you provide. Format statistics and data points to make them stand out.';

      // Construct a detailed query that emphasizes finding statistics and data
      const enhancedQuery = `Research the following topic in detail, with a strong focus on finding STATISTICS, DATA POINTS, and EXPERT OPINIONS: "${query}"

Please include:
- Specific industry statistics with exact numbers and percentages
- Research findings from studies or surveys (with dates and methodologies)
- Growth rates, market sizes, and adoption metrics when available
- Comparative data showing trends over time
- Direct quotes from recognized experts
- Data-backed best practices

Format all statistics and data points in a way that makes them easy to identify.`;

      // Use the enhanced OpenAI client
      const response = await openaiClient.createChatCompletion({
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: enhancedQuery
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
        // Note: enableWebSearch parameter removed as it's not supported by the API
      });

      // Extract content using client helper method
      const content = openaiClient.getResponseText(response);

      // Extract citations using client helper method
      const citations = openaiClient.extractCitations(response);

      logger.debug('Received ChatGPT response', {
        query,
        responseTime: Date.now() - startTime,
        contentLength: content.length,
        citationsCount: citations.length
      });

      // Add to results
      results.push({
        platform: 'chatgpt',
        query,
        content,
        citations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error querying ChatGPT', {
        query,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });

      // Add error result
      results.push({
        platform: 'chatgpt',
        query,
        error: error.message,
        content: '',
        citations: [],
        timestamp: new Date().toISOString()
      });
    }
  }

  logger.info('Completed ChatGPT research', {
    queryCount: queries.length,
    successCount: results.filter(r => !r.error).length,
    totalCitations: results.reduce((sum, r) => sum + (r.citations?.length || 0), 0)
  });

  return results;
}

/**
 * Queries Perplexity with the generated research queries
 * @param {Array<string>} queries - The research queries
 * @param {Object} [clientData] - Optional client data
 * @returns {Promise<Array<Object>>} - The Perplexity responses
 */
async function queryPerplexity(queries, clientData) {
  logger.info('Starting Perplexity research', { queryCount: queries.length });
  const results = [];

  // Check if API key is available
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityApiKey) {
    logger.warn('Perplexity API key not found, skipping Perplexity research');
    return results;
  }

  // No mock responses - fail fast if API is unavailable

  for (const query of queries) {
    const startTime = Date.now();

    try {
      logger.debug('Sending query to Perplexity', { query });

      // Construct system message based on client data
      let systemMessage = 'You are a research assistant providing detailed, accurate information with a strong focus on STATISTICS, DATA POINTS, and EXPERT OPINIONS. Always include specific numbers, percentages, research findings, and quotable insights from industry experts.';

      if (clientData) {
        systemMessage += ` You are researching information for a company in the ${clientData.industry_primary || 'general'} industry. Include relevant competitive intelligence and market statistics.`;
      }

      systemMessage += ' Always include URLs to your sources, especially for any statistics or data you provide. Format statistics and data points to make them stand out.';

      // Send request to Perplexity API with direct axios call
      // Use the confirmed working model from the LLM analysis scripts
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar', // Correct Perplexity model
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: `Research the following topic in detail, with a strong focus on finding STATISTICS, DATA POINTS, and EXPERT OPINIONS: "${query}"

Please include:
- Specific industry statistics with exact numbers and percentages
- Research findings from studies or surveys (with dates and methodologies)
- Growth rates, market sizes, and adoption metrics when available
- Comparative data showing trends over time
- Direct quotes from recognized experts
- Data-backed best practices

Format all statistics and data points in a way that makes them easy to identify.`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${perplexityApiKey}`
          },
          timeout: 60000 // 1 minute timeout
        }
      );

      // Enhanced error checking for Perplexity API response
      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        logger.warn('Invalid response structure from Perplexity API', {
          query,
          hasData: !!response.data,
          hasChoices: !!(response.data && response.data.choices),
          choicesLength: response.data?.choices?.length || 0
        });
        throw new Error('Invalid response structure from Perplexity API');
      }

      const messageContent = response.data.choices[0].message?.content;
      if (!messageContent || messageContent.trim().length === 0) {
        logger.warn('Empty or no content found in Perplexity API response', {
          query,
          hasMessage: !!response.data.choices[0].message,
          contentLength: messageContent ? messageContent.length : 0
        });
        throw new Error('No content found in Perplexity API response');
      }

      // Extract citations using a more robust method
      const citations = extractCitationsFromText(messageContent);

      logger.debug('Received Perplexity response', {
        query,
        responseTime: Date.now() - startTime,
        contentLength: messageContent.length,
        citationsCount: citations.length
      });

      // Add to results
      results.push({
        platform: 'perplexity',
        query,
        content: messageContent,
        citations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error querying Perplexity', {
        query,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });

      // Add error result
      results.push({
        platform: 'perplexity',
        query,
        error: error.message,
        content: '',
        citations: [],
        timestamp: new Date().toISOString()
      });
    }
  }

  logger.info('Completed Perplexity research', {
    queryCount: queries.length,
    successCount: results.filter(r => !r.error).length,
    totalCitations: results.reduce((sum, r) => sum + (r.citations?.length || 0), 0)
  });

  return results;
}

/**
 * Extracts citations from text with improved markdown link detection
 * @param {string} text - The text to extract citations from
 * @returns {Array<Object>} - The extracted citations
 */
function extractCitationsFromText(text) {
  const citations = [];
  let position = 1;

  // Extract markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(text))) {
    const [_, linkText, url] = match;

    try {
      // Clean URL by removing query parameters and fragments
      const cleanUrl = new URL(url);
      const normalizedUrl = `${cleanUrl.protocol}//${cleanUrl.host}${cleanUrl.pathname}`;

      // Check if URL already exists in citations
      const exists = citations.some(citation => citation.url === normalizedUrl);
      if (!exists) {
        // Get surrounding context (up to 100 chars before and after)
        const urlIndex = text.indexOf(match[0]);
        const start = Math.max(0, urlIndex - 100);
        const end = Math.min(text.length, urlIndex + match[0].length + 100);
        const context = text.substring(start, end);

        citations.push({
          title: linkText,
          url: normalizedUrl,
          position: position++,
          context,
          source: 'markdown_link'
        });
      }
    } catch (e) {
      logger.warn(`Skipping invalid URL: ${url}`, { error: e.message });
    }
  }

  // If no markdown links found, look for plain URLs
  if (citations.length === 0) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    while ((match = urlRegex.exec(text))) {
      const [url] = match;

      // Clean up URL (remove trailing punctuation)
      let cleanUrlStr = url;
      if (cleanUrlStr.endsWith('.') || cleanUrlStr.endsWith(',') || cleanUrlStr.endsWith(')') || cleanUrlStr.endsWith('"') || cleanUrlStr.endsWith("'")) {
        cleanUrlStr = cleanUrlStr.slice(0, -1);
      }

      try {
        const cleanUrl = new URL(cleanUrlStr);
        const normalizedUrl = `${cleanUrl.protocol}//${cleanUrl.host}${cleanUrl.pathname}`;

        // Check if URL already exists in citations
        const exists = citations.some(citation => citation.url === normalizedUrl);
        if (!exists) {
          // Get surrounding context (up to 100 chars before and after)
          const urlIndex = text.indexOf(cleanUrlStr);
          const start = Math.max(0, urlIndex - 100);
          const end = Math.min(text.length, urlIndex + cleanUrlStr.length + 100);
          const context = text.substring(start, end);

          citations.push({
            title: `Source from ${cleanUrl.hostname}`,
            url: normalizedUrl,
            position: position++,
            context,
            source: 'plain_url'
          });
        }
      } catch (e) {
        logger.warn(`Skipping invalid URL: ${cleanUrlStr}`, { error: e.message });
      }
    }
  }

  return citations;
}


// For backward compatibility
const extractCitations = extractCitationsFromText;

module.exports = {
  queryChatGPT,
  queryPerplexity,
  extractCitations,
  extractCitationsFromText
};