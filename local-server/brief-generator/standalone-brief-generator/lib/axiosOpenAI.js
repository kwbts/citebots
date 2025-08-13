/**
 * Enhanced axios-based OpenAI client
 * Based on working patterns from LLM analysis scripts
 */
const axios = require('axios');
const logger = require('./logger');
const webSearcher = require('./webSearcher');

/**
 * A simplified OpenAI API client using axios
 * Based on the working patterns from the LLM analysis scripts
 */
class AxiosOpenAI {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://api.openai.com/v1';
    this.timeout = options.timeout || 60000;
    this.defaultModel = options.defaultModel || 'gpt-4o';
  }

  /**
   * Send a chat completion request to the OpenAI API
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - The API response
   */
  async createChatCompletion(params) {
    try {
      const endpoint = `${this.baseURL}/chat/completions`;

      // Set default model if not provided
      const requestData = {
        model: params.model || this.defaultModel,
        messages: params.messages,
        temperature: params.temperature || 0.2,
        max_tokens: params.max_tokens || 2000,
        ...params
      };

      // Add web search tool if using a supported model
      if ((requestData.model.includes('gpt-4o') || requestData.model.includes('search-preview')) && params.enableWebSearch !== false) {
        requestData.tools = [
          {
            "type": "function",
            "function": {
              "name": "search_web",
              "description": "Search the web for information",
              "parameters": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string",
                    "description": "The search query"
                  }
                },
                "required": ["query"]
              }
            }
          }
        ];
        requestData.tool_choice = "auto";
      }

      logger.debug('Sending request to OpenAI', {
        endpoint,
        model: requestData.model,
        messageCount: requestData.messages.length,
        temperature: requestData.temperature,
        hasTools: !!requestData.tools
      });

      const response = await axios.post(
        endpoint,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: this.timeout
        }
      );

      logger.debug('Received response from OpenAI', {
        status: response.status,
        model: response.data.model,
        choicesCount: response.data.choices?.length || 0,
        hasToolCalls: !!response.data.choices?.[0]?.message?.tool_calls
      });

      // Check if we need to handle tool calls
      if (response.data?.choices?.[0]?.message?.tool_calls) {
        logger.debug('Found tool calls in response, handling follow-up request');

        // Process the tool calls and make a follow-up request
        return this.handleToolCalls(response.data, requestData);
      }

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error in createChatCompletion');
      throw error;
    }
  }

  /**
   * Handle tool calls in the response by making a follow-up request
   * @param {Object} initialResponse - The initial API response
   * @param {Object} initialRequest - The initial request data
   * @returns {Promise<Object>} - The follow-up API response
   */
  async handleToolCalls(initialResponse, initialRequest) {
    try {
      const messages = [...initialRequest.messages];

      // Add the assistant's message with tool calls
      const assistantMessage = initialResponse.choices[0].message;
      messages.push(assistantMessage);

      // Process each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === 'function' && toolCall.function?.name === 'search_web') {
          try {
            // Parse the function arguments
            const args = JSON.parse(toolCall.function.arguments);
            const searchQuery = args.query || initialRequest.messages[initialRequest.messages.length - 1].content;

            logger.debug('Processing search_web tool call', {
              toolCallId: toolCall.id,
              searchQuery: searchQuery.substring(0, 100) + (searchQuery.length > 100 ? '...' : '')
            });

            // Call actual search API instead of using mock results
            try {
              const searchResults = await webSearcher.googleSearch([searchQuery]);
              
              // Format search results for ChatGPT tool response
              const formattedResults = searchResults.slice(0, 5).map(result => ({
                title: result.title,
                url: result.url,
                snippet: result.snippet
              }));

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify({
                  search_results: formattedResults.length > 0 ? formattedResults : [
                    {
                      title: "No search results found",
                      url: "https://www.google.com",
                      snippet: "No relevant search results were found for this query."
                    }
                  ]
                })
              });
            } catch (searchError) {
              logger.warn('Search API failed during tool call, using fallback', {
                error: searchError.message,
                searchQuery: searchQuery.substring(0, 50)
              });
              
              // Fallback to basic response
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify({
                  search_results: [
                    {
                      title: "Search temporarily unavailable",
                      url: "https://www.google.com",
                      snippet: "Search functionality is temporarily unavailable. Please continue with available information."
                    }
                  ]
                })
              });
            }
          } catch (e) {
            logger.error('Error processing search_web tool call', {
              error: e.message,
              toolCallId: toolCall.id
            });

            // Add an error response
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({ error: "Failed to process search request" })
            });
          }
        }
      }

      // Make the follow-up request
      logger.debug('Making follow-up request with tool results', {
        messageCount: messages.length
      });

      const followupRequest = {
        model: initialRequest.model,
        messages: messages,
        temperature: initialRequest.temperature,
        max_tokens: initialRequest.max_tokens
      };

      const followupResponse = await axios.post(
        `${this.baseURL}/chat/completions`,
        followupRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: this.timeout
        }
      );

      logger.debug('Received follow-up response', {
        status: followupResponse.status,
        choicesCount: followupResponse.data.choices?.length || 0
      });

      return followupResponse.data;
    } catch (error) {
      this.handleError(error, 'Error handling tool calls');
      throw error;
    }
  }

  /**
   * Handle API errors with focused logging
   * @param {Error} error - The error object
   * @param {string} context - Context for the error
   */
  handleError(error, context) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`${context}: API error`, {
        status: error.response.status,
        type: error.response.data?.error?.type || 'unknown',
        message: error.response.data?.error?.message || error.message
      });

      // Check for common error types
      if (error.response.status === 429) {
        logger.warn('Rate limit reached - consider reducing request frequency');
      } else if (error.response.status === 401) {
        logger.warn('Authentication error - check API key validity');
      } else if (error.response.status === 404) {
        logger.warn('Model not found - check if model name is correct');
      }
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(`${context}: Network error`, {
        timeout: this.timeout,
        isTimeout: error.code === 'ECONNABORTED'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(`${context}: Request setup error`, {
        message: error.message
      });
    }
  }

  /**
   * Extract citations from a response
   * @param {Object} response - The API response
   * @returns {Array<Object>} - Extracted citations
   */
  extractCitations(response) {
    try {
      const citations = [];
      let position = 1;

      // Check if we have a valid response
      if (!response || !response.choices || !response.choices[0].message) {
        return citations;
      }

      const messageContent = response.choices[0].message.content || '';

      // First try to extract from markdown links [text](url)
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = markdownLinkRegex.exec(messageContent))) {
        const [_, linkText, url] = match;

        try {
          // Clean URL by removing query parameters and fragments
          const cleanUrl = new URL(url);
          const normalizedUrl = `${cleanUrl.protocol}//${cleanUrl.host}${cleanUrl.pathname}`;

          // Check if URL already exists in citations
          const exists = citations.some(citation => citation.url === normalizedUrl);
          if (!exists) {
            citations.push({
              title: linkText,
              url: normalizedUrl,
              position: position++,
              source: 'markdown_link'
            });
          }
        } catch (e) {
          logger.warn(`Skipping invalid URL: ${url}`, { error: e.message });
        }
      }

      // If no citations found from markdown links, try finding plain URLs
      if (citations.length === 0) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        while ((match = urlRegex.exec(messageContent))) {
          const [url] = match;

          // Clean up the URL (remove trailing punctuation)
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
              const domainName = cleanUrl.hostname;

              citations.push({
                title: `Source from ${domainName}`,
                url: normalizedUrl,
                position: position++,
                source: 'plain_url'
              });
            }
          } catch (e) {
            logger.warn(`Skipping invalid URL: ${cleanUrlStr}`, { error: e.message });
          }
        }
      }

      return citations;
    } catch (error) {
      logger.error('Error extracting citations', {
        error: error.message,
        stack: error.stack
      });
      return [];
    }
  }

  /**
   * Get response text from an API response
   * @param {Object} response - The API response
   * @returns {string} - The extracted text content
   */
  getResponseText(response) {
    try {
      // Standard format for Chat Completions API
      if (response.choices && response.choices[0]?.message?.content) {
        const content = response.choices[0].message.content;
        
        // Log warning if content is empty or too short
        if (!content || content.trim().length === 0) {
          logger.warn('OpenAI returned empty content', {
            hasChoices: !!response.choices,
            choicesLength: response.choices?.length || 0,
            hasMessage: !!response.choices?.[0]?.message,
            finishReason: response.choices?.[0]?.finish_reason
          });
          return '';
        }
        
        if (content.trim().length < 50) {
          logger.warn('OpenAI returned suspiciously short content', {
            contentLength: content.length,
            trimmedLength: content.trim().length,
            finishReason: response.choices?.[0]?.finish_reason,
            content: content.substring(0, 100)
          });
        }
        
        return content;
      }

      logger.warn('OpenAI response missing expected structure', {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length || 0,
        hasMessage: !!response.choices?.[0]?.message
      });

      // Fallback: empty string
      return '';
    } catch (error) {
      logger.error('Error extracting response text', {
        error: error.message,
        stack: error.stack
      });
      return '';
    }
  }
}

/**
 * Standalone function for backward compatibility
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} - The API response
 */
async function createChatCompletion(params) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const client = new AxiosOpenAI(apiKey);
    const response = await client.createChatCompletion(params);

    return {
      data: response
    };
  } catch (error) {
    logger.error('Error calling OpenAI API', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    throw error;
  }
}

module.exports = {
  AxiosOpenAI,
  createChatCompletion
};