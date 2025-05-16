// src/lib/chatgptClient.js
const axios = require('axios');
const config = require('../config');

/**
 * Clean URL by removing query parameters and fragments
 * @param {string} urlString - The URL to clean
 * @returns {string} - The cleaned URL
 */
function cleanUrl(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  } catch (error) {
    console.warn(`Error cleaning URL ${urlString}: ${error.message}`);
    return urlString;
  }
}

/**
 * Send a query to the ChatGPT API
 * @param {string} query - The query text to send to ChatGPT
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The ChatGPT API response
 */
/**
 * Send a query to the ChatGPT API with proper handling of web search tool calls
 * @param {string} query - The query text to send to ChatGPT
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The ChatGPT API response
 */
async function queryChatGPT(query, options = {}) {
  try {
    // Get API key from config
    const apiKey = config.chatgpt?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("ChatGPT API key is not configured");
    }

    // Use model specified or default to search-enabled model
    const model = options.model || "gpt-4o";
    
    console.log(`Calling ChatGPT API with query: "${query.substring(0, 100)}..."`);
    console.log(`Using model: ${model}`);
    
    // Check if we should wrap the query to encourage citations
    const actualQuery = options.enhanceQuery !== false ? 
      `${query}\n\nPlease provide specific citations with functional URLs to authoritative sources that support your answer.` : 
      query;
    
    // Use the Chat Completions API
    console.log('Using Chat Completions API');
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Keep track of the conversation messages
    const messages = [
      { 
        role: 'system', 
        content: options.systemPrompt || 'You are a knowledgeable assistant that always cites your sources with working URLs. Provide thorough and detailed responses with multiple high-quality citations.' 
      },
      { role: 'user', content: actualQuery }
    ];
    
    // Configure the request for Chat Completions API
    const requestData = {
      model: model,
      messages: messages
    };
    
    // Set temperature
    requestData.temperature = options.temperature || 0.2;
    
    // If using a model that supports it, enable web search
    if (model.includes('gpt-4o') || model.includes('search-preview')) {
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
    
    // Log the request configuration
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    console.log('API Endpoint:', apiEndpoint);
    
    // Make the initial API request
    console.log('Sending request to OpenAI...');
    
    try {
      const response = await axios.post(
        apiEndpoint,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: config.app.requestTimeoutMs || 30000
        }
      );
      
      console.log('Response received from ChatGPT');
      console.log('Response status:', response.status);
      
      // Log a preview of the response data
      const responsePreview = JSON.stringify(response.data).slice(0, 500) + '...';
      console.log('Response data preview:', responsePreview);
      
      let finalResponse = response.data;
      
      // Check if we need to handle tool calls and make an additional request
      if (response.data?.choices?.[0]?.message?.tool_calls) {
        console.log('Found tool calls in response. Will process and make a follow-up request.');
        
        const assistantMessage = response.data.choices[0].message;
        messages.push(assistantMessage);
        
        // Process each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          if (toolCall.type === 'web_search' || (toolCall.function && toolCall.function.name === 'search_web')) {
            try {
              // Handle both direct web_search tool calls and function-based search_web calls
              let searchQuery = query;
              
              if (toolCall.function) {
                const args = JSON.parse(toolCall.function.arguments);
                searchQuery = args.query || query;
                console.log(`Processing search_web function call with query: "${searchQuery}"`);
              } else {
                console.log(`Processing web_search tool call with query: "${searchQuery}"`);
              }
              
              // Add a web search response
              // In a real implementation, you would use a search API here
              const toolResponse = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  search_results: [
                    {
                      title: "Example search result",
                      url: "https://example.com/search",
                      snippet: "This is a placeholder for search results. In a real implementation, these would be actual search results."
                    }
                  ]
                })
              };
              
              // Add the name property only for function calls
              if (toolCall.function) {
                toolResponse.name = toolCall.function.name;
              }
              
              messages.push(toolResponse);
            } catch (e) {
              console.warn('Error processing web search tool call:', e);
              // Add a generic response if we can't parse the arguments
              const errorResponse = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: "Failed to process search request" })
              };
              
              // Add the name property only for function calls
              if (toolCall.function) {
                errorResponse.name = toolCall.function.name;
              }
              
              messages.push(errorResponse);
            }
          }
        }
        
        // Make the follow-up request with the tool results
        console.log('Making follow-up request with tool results...');
        console.log('Updated messages:', JSON.stringify(messages, null, 2));
        
        // Create a new request object without temperature for the follow-up
        const followupRequestData = {
          model: model,
          messages: messages
        };
        
        // Only add temperature for non-search models
        if (!model.includes('search-preview')) {
          followupRequestData.temperature = options.temperature || 0.2;
        }
        
        const followupResponse = await axios.post(
          apiEndpoint,
          followupRequestData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            timeout: config.app.requestTimeoutMs || 30000
          }
        );
        
        console.log('Follow-up response received from ChatGPT');
        const followupPreview = JSON.stringify(followupResponse.data).slice(0, 500) + '...';
        console.log('Follow-up response preview:', followupPreview);
        
        // Use the follow-up response as our final result
        finalResponse = followupResponse.data;
      }
      
      // Check if we have valid response content
      if (finalResponse.choices && finalResponse.choices.length > 0) {
        console.log('Valid response content detected');
        if (finalResponse.choices[0].message) {
          const contentPreview = finalResponse.choices[0].message.content?.slice(0, 100) + '...';
          console.log('Message content preview:', contentPreview || 'No content found');
        } else {
          console.log('No message property found in the first choice');
          console.log('First choice data:', JSON.stringify(finalResponse.choices[0]));
        }
      } else {
        console.log('WARNING: Unexpected response structure:', JSON.stringify(finalResponse));
      }
      
      // Return the final response data
      return finalResponse;
    } catch (axiosError) {
      console.error('Axios error details:');
      
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error status:', axiosError.response.status);
        console.error('Error headers:', JSON.stringify(axiosError.response.headers, null, 2));
        console.error('Error data:', JSON.stringify(axiosError.response.data, null, 2));
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('No response received. Request details:', axiosError.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error during request setup:', axiosError.message);
      }
      
      // Re-throw with more details
      throw axiosError;
    }
  } catch (error) {
    console.error('ChatGPT API error:', error.message);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Check for common error patterns
    if (error.message.includes('429')) {
      console.error('RATE LIMIT ERROR: You are sending too many requests to the OpenAI API.');
    } else if (error.message.includes('401')) {
      console.error('AUTHENTICATION ERROR: Your API key may be invalid or expired.');
    } else if (error.message.includes('404')) {
      console.error('MODEL ERROR: The requested model may not exist or you may not have access to it.');
    } else if (error.message.includes('timeout')) {
      console.error('TIMEOUT ERROR: The request took too long to complete.');
    }
    
    throw new Error(`ChatGPT API error: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Extract citations from a ChatGPT API response
 * @param {Object} chatGptResponse - The response from ChatGPT API
 * @returns {Array} - Array of extracted citations
 */
function extractCitationsFromChatGPT(chatGptResponse) {
  try {
    console.log('Extracting citations from ChatGPT response...');
    const citations = [];
    let position = 1;
    
    // Check if response has expected structure
    if (!chatGptResponse) {
      console.warn('Empty ChatGPT response');
      return citations;
    }
    
    console.log('Response object keys:', Object.keys(chatGptResponse).join(', '));
    
    // Standard Completions API response
    if (chatGptResponse.choices && chatGptResponse.choices[0]) {
      console.log('Found choices in response. First choice keys:', 
        Object.keys(chatGptResponse.choices[0]).join(', '));
      
      if (chatGptResponse.choices[0].message) {
        console.log('Found message in first choice. Message keys:', 
          Object.keys(chatGptResponse.choices[0].message).join(', '));
        
        const messageContent = chatGptResponse.choices[0].message.content;
        
        if (messageContent) {
          console.log('Message content length:', messageContent.length);
          console.log('Message content preview:', messageContent.substring(0, 200));
        } else {
          console.warn('No content found in message');
        }
        
        // First try to find annotations if they exist
        if (chatGptResponse.choices[0].message.annotations) {
          console.log('Found annotations in message. Count:', 
            chatGptResponse.choices[0].message.annotations.length);
            
          for (const annotation of chatGptResponse.choices[0].message.annotations) {
            console.log('Processing annotation type:', annotation.type);
            
            if (annotation.type === 'file_citation' || annotation.type === 'file_path') {
              console.log('Skipping file citation/path');
              continue; // Skip file citations
            }
            
            if (annotation.text && annotation.text.startsWith('http')) {
              console.log('Found URL in annotation:', annotation.text);
              
              citations.push({
                title: `Citation ${position}`,
                url: annotation.text,
                position: position++
              });
            }
          }
        } else {
          console.log('No annotations found in message');
        }
        
        // Extract from tool calls if present
        if (chatGptResponse.choices[0].message.tool_calls) {
          console.log('Found tool_calls in message. Count:', 
            chatGptResponse.choices[0].message.tool_calls.length);
            
          for (const toolCall of chatGptResponse.choices[0].message.tool_calls) {
            console.log('Processing tool call type:', toolCall.type);
            
            if (toolCall.type === 'function' && toolCall.function && toolCall.function.name === 'search_web') {
              console.log('Found search_web function call');
              
              try {
                console.log('Parsing function arguments:', toolCall.function.arguments);
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                if (functionArgs.urls && Array.isArray(functionArgs.urls)) {
                  console.log('Found URLs in function arguments. Count:', functionArgs.urls.length);
                  
                  functionArgs.urls.forEach(url => {
                    console.log('Adding URL from tool call:', url);
                    
                    citations.push({
                      title: `Search Result ${position}`,
                      url: url,
                      position: position++
                    });
                  });
                } else {
                  console.log('No URLs found in function arguments');
                }
              } catch (e) {
                console.warn('Failed to parse tool call arguments:', e);
              }
            }
          }
        } else {
          console.log('No tool_calls found in message');
        }
        
        // If no citations found, try to extract from markdown links
        if (citations.length === 0 && messageContent) {
          console.log('No citations found from annotations or tool calls. Trying markdown links...');
          
          // Match markdown-style links [text](url)
          const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let match;
          let markdownMatches = 0;
          
          while ((match = markdownLinkRegex.exec(messageContent))) {
            markdownMatches++;
            const [_, linkText, url] = match;
            
            console.log(`Found markdown link ${markdownMatches}: [${linkText}](${url})`);
            
            // Clean the URL
            try {
              const cleanedUrl = cleanUrl(url);
              console.log('Cleaned URL:', cleanedUrl);
              
              // Check if we already have this URL
              const exists = citations.some(citation => citation.url === cleanedUrl);
              if (!exists) {
                console.log('Adding URL from markdown link');
                
                citations.push({
                  title: linkText,
                  url: cleanedUrl,
                  position: position++,
                  source: 'markdown_link'
                });
              } else {
                console.log('URL already exists in citations');
              }
            } catch (e) {
              console.warn(`Skipping invalid URL: ${url}`, e);
            }
          }
          
          console.log(`Found ${markdownMatches} markdown links in content`);
        }
        
        // If still no citations, try finding plain URLs
        if (citations.length === 0 && messageContent) {
          console.log('No citations found from markdown links. Trying plain URLs...');
          
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          let match;
          let urlMatches = 0;
          
          while ((match = urlRegex.exec(messageContent))) {
            urlMatches++;
            const [url] = match;
            
            console.log(`Found plain URL ${urlMatches}: ${url}`);
            
            // Clean up the URL (remove trailing punctuation)
            let cleanUrlStr = url;
            if (cleanUrlStr.endsWith('.') || cleanUrlStr.endsWith(',') || cleanUrlStr.endsWith(')') || cleanUrlStr.endsWith('"') || cleanUrlStr.endsWith("'")) {
              cleanUrlStr = cleanUrlStr.slice(0, -1);
              console.log('Cleaned URL string:', cleanUrlStr);
            }
            
            try {
              const normalizedUrl = cleanUrl(cleanUrlStr);
              console.log('Normalized URL:', normalizedUrl);
              
              // Check if we already have this URL
              const exists = citations.some(citation => citation.url === normalizedUrl);
              if (!exists) {
                const domainName = new URL(normalizedUrl).hostname;
                console.log('Adding URL from plain text. Domain:', domainName);
                
                citations.push({
                  title: `Source from ${domainName}`,
                  url: normalizedUrl,
                  position: position++,
                  source: 'plain_url'
                });
              } else {
                console.log('URL already exists in citations');
              }
            } catch (e) {
              console.warn(`Skipping invalid URL: ${cleanUrlStr}`, e);
            }
          }
          
          console.log(`Found ${urlMatches} plain URLs in content`);
        }
      } else {
        console.warn('No message property found in choice object');
      }
    } else {
      console.warn('No valid choices found in response object');
    }
    
    // Look for the Responses API format as well
    if (citations.length === 0 && chatGptResponse.output) {
      console.log('Checking Responses API format (output field)...');
      
      // Find the message output item in the response
      const messageOutput = chatGptResponse.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content.length) {
        console.log('Found message output in Responses API format');
        
        // Look for annotations in the text content
        const textContent = messageOutput.content.find(content => content.type === 'output_text');
        if (textContent) {
          console.log('Found text content in message output');
          
          if (textContent.annotations) {
            console.log('Found annotations in text content. Count:', textContent.annotations.length);
            
            for (const annotation of textContent.annotations) {
              console.log('Processing annotation type:', annotation.type);
              
              if (annotation.type === 'url_citation') {
                console.log('Found URL citation:', annotation.url);
                
                // Clean URL by removing query parameters
                const cleanedUrl = cleanUrl(annotation.url);
                citations.push({
                  title: annotation.title || `Citation ${position}`,
                  url: cleanedUrl,
                  position: position++,
                  start_index: annotation.start_index,
                  end_index: annotation.end_index,
                  source: 'url_citation'
                });
              }
            }
          } else {
            console.log('No annotations found in text content');
          }
          
          // If no citations found from annotations, try markdown links
          if (citations.length === 0 && textContent.text) {
            console.log('Trying to extract markdown links from text content...');
            
            const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;
            
            while ((match = markdownLinkRegex.exec(textContent.text))) {
              const [_, linkText, url] = match;
              console.log(`Found markdown link: [${linkText}](${url})`);
              
              try {
                const cleanedUrl = cleanUrl(url);
                const exists = citations.some(citation => citation.url === cleanedUrl);
                if (!exists) {
                  citations.push({
                    title: linkText,
                    url: cleanedUrl,
                    position: position++,
                    source: 'markdown_link'
                  });
                }
              } catch (e) {
                console.warn(`Skipping invalid URL: ${url}`, e);
              }
            }
          }
        } else {
          console.log('No text content found in message output');
        }
      } else {
        console.log('No valid message output found in Responses API format');
      }
    }
    
    console.log(`Successfully extracted ${citations.length} citations from ChatGPT response`);
    if (citations.length > 0) {
      console.log('Citations:', JSON.stringify(citations, null, 2));
    }
    
    return citations;
  } catch (error) {
    console.error('Error extracting citations:', error);
    console.error('Error stack:', error.stack);
    
    // Try to log the response structure
    try {
      console.error('Response object that caused error:', 
        JSON.stringify(chatGptResponse, null, 2).slice(0, 1000) + '...');
    } catch (jsonError) {
      console.error('Could not stringify response object:', jsonError.message);
    }
    
    return [];
  }
}

/**
 * Get response text from ChatGPT response object
 * @param {Object} chatGptResponse - The response from ChatGPT API
 * @returns {string} - The extracted text content
 */
function getResponseText(chatGptResponse) {
  try {
    console.log('Getting response text from ChatGPT response...');
    console.log('Response object structure:', Object.keys(chatGptResponse).join(', '));
    
    // Standard format for Chat Completions API
    if (chatGptResponse.choices && chatGptResponse.choices[0]) {
      console.log('Found choices in response. First choice structure:', Object.keys(chatGptResponse.choices[0]).join(', '));
      
      if (chatGptResponse.choices[0].message) {
        console.log('Found message in first choice. Message structure:', Object.keys(chatGptResponse.choices[0].message).join(', '));
        
        if (chatGptResponse.choices[0].message.content) {
          console.log('Found content in message. Content length:', chatGptResponse.choices[0].message.content.length);
          return chatGptResponse.choices[0].message.content;
        } else {
          console.warn('No content found in message object');
        }
      } else {
        console.warn('No message property found in choice object');
      }
    } else {
      console.warn('No choices found in response object');
    }
    
    // Check for Responses API format (output field)
    if (chatGptResponse.output) {
      console.log('Found output field in response. Checking for message output...');
      
      const messageOutput = chatGptResponse.output.find(item => item.type === 'message');
      if (messageOutput) {
        console.log('Found message output. Structure:', Object.keys(messageOutput).join(', '));
        
        if (messageOutput.content && messageOutput.content.length) {
          console.log('Found content array in message output. Length:', messageOutput.content.length);
          
          const textContent = messageOutput.content.find(content => content.type === 'output_text');
          if (textContent && textContent.text) {
            console.log('Found text content. Length:', textContent.text.length);
            return textContent.text;
          } else {
            console.warn('No text content found in message output content array');
          }
        } else {
          console.warn('No content array found in message output');
        }
      } else {
        console.warn('No message output found in output array');
      }
    } else {
      console.log('No output field found in response');
    }
    
    // Fall back to checking if there's a direct output_text property
    if (chatGptResponse.output_text) {
      console.log('Found output_text field. Length:', chatGptResponse.output_text.length);
      return chatGptResponse.output_text;
    }
    
    // Last resort: dump the entire response as JSON
    console.warn('No text content found in ChatGPT response. Response structure:', JSON.stringify(chatGptResponse, null, 2).slice(0, 1000) + '...');
    return '';
  } catch (error) {
    console.error('Error extracting response text:', error);
    console.error('Error stack:', error.stack);
    
    // Try to log the response structure
    try {
      console.error('Response object that caused error:', JSON.stringify(chatGptResponse, null, 2).slice(0, 1000) + '...');
    } catch (jsonError) {
      console.error('Could not stringify response object:', jsonError.message);
    }
    
    return '';
  }
}

module.exports = {
  queryChatGPT,
  extractCitationsFromChatGPT,
  getResponseText,
  cleanUrl
};