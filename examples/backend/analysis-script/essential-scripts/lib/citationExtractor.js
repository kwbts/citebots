// src/lib/citationExtractor.js

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
   * Extract citations from a ChatGPT API response
   * @param {Object} chatGptResponse - The response from ChatGPT API
   * @returns {Array} - Array of extracted citations
   */
  function extractCitationsFromChatGPT(chatGptResponse) {
    try {
      const citations = [];
      let position = 1;
      
      // Check if response has expected structure
      if (!chatGptResponse) {
        console.warn('Empty ChatGPT response');
        return citations;
      }

      console.log('Analyzing ChatGPT response format...');
      console.log('Response object keys:', Object.keys(chatGptResponse).join(', '));
      
      // Format 1: OpenAI Chat Completions API response with tool_calls for web_search
      if (chatGptResponse.choices && chatGptResponse.choices[0]?.message?.tool_calls) {
        console.log('Detected Chat Completions API response with tool_calls');
        const toolCalls = chatGptResponse.choices[0].message.tool_calls;
        console.log(`Found ${toolCalls.length} tool calls`);
        
        // Extract URLs from search tool calls
        for (const toolCall of toolCalls) {
          console.log(`Processing tool call type: ${toolCall.type || toolCall.function?.name}`);
          
          // Handle both web_search (native) and search_web (function) tool calls
          if (toolCall.type === 'web_search' || (toolCall.function && toolCall.function.name === 'search_web')) {
            try {
              // Get arguments
              let searchInfo = {};
              if (toolCall.function) {
                searchInfo = JSON.parse(toolCall.function.arguments);
              } else if (toolCall.web_search) {
                searchInfo = toolCall.web_search;
              }
              
              console.log('Search info:', JSON.stringify(searchInfo));
              
              // Add URLs from search results if any
              if (searchInfo.urls && Array.isArray(searchInfo.urls)) {
                console.log(`Found ${searchInfo.urls.length} URLs in tool call`);
                
                for (const url of searchInfo.urls) {
                  const cleanedUrl = cleanUrl(url);
                  citations.push({
                    title: `Search Result ${position}`,
                    url: cleanedUrl,
                    position: position++,
                    source: 'web_search_tool'
                  });
                }
              }
            } catch (e) {
              console.warn('Error processing web search tool call arguments:', e.message);
            }
          }
        }
        
        // If no citations found in tool calls, try the message content
        if (citations.length === 0 && chatGptResponse.choices[0].message.content) {
          console.log('No citations found in tool calls, checking message content');
          const messageContent = chatGptResponse.choices[0].message.content;
          
          // Look for markdown-style links
          extractFromMarkdownLinks(messageContent, citations);
          
          // If no markdown links, try plain URLs
          if (citations.length === 0) {
            extractFromPlainUrls(messageContent, citations);
          }
        }
      }
      // Format 2: Standard Chat Completions API response with annotations
      else if (chatGptResponse.choices && chatGptResponse.choices[0]?.message?.annotations) {
        console.log('Detected Chat Completions API response with annotations');
        const annotations = chatGptResponse.choices[0].message.annotations;
        console.log(`Found ${annotations.length} annotations`);
        
        // Extract URLs from annotations
        for (const annotation of annotations) {
          console.log(`Processing annotation type: ${annotation.type}`);
          
          if (annotation.type === 'file_citation' || annotation.type === 'file_path') {
            console.log('Skipping file citation/path');
            continue; // Skip file citations
          }
          
          if (annotation.text && annotation.text.startsWith('http')) {
            console.log(`Found URL in annotation: ${annotation.text}`);
            
            citations.push({
              title: `Citation ${position}`,
              url: cleanUrl(annotation.text),
              position: position++,
              source: 'annotation'
            });
          }
        }
        
        // If no citations found in annotations, try the message content
        if (citations.length === 0 && chatGptResponse.choices[0].message.content) {
          console.log('No citations found in annotations, checking message content');
          const messageContent = chatGptResponse.choices[0].message.content;
          
          // Look for markdown-style links
          extractFromMarkdownLinks(messageContent, citations);
          
          // If no markdown links, try plain URLs
          if (citations.length === 0) {
            extractFromPlainUrls(messageContent, citations);
          }
        }
      }
      // Format 3: Standard Chat Completions API response (without annotations or tool calls)
      else if (chatGptResponse.choices && chatGptResponse.choices[0]?.message?.content) {
        console.log('Detected standard Chat Completions API response format');
        const messageContent = chatGptResponse.choices[0].message.content;
        console.log(`Message content length: ${messageContent.length}`);
        
        // Look for markdown-style links
        extractFromMarkdownLinks(messageContent, citations);
        
        // If no markdown links, try plain URLs
        if (citations.length === 0) {
          extractFromPlainUrls(messageContent, citations);
        }
      }
      // Format 4: New Responses API format (array format)
      else if (Array.isArray(chatGptResponse)) {
        console.log('Detected array response format (newer API)');
        
        // Find the message output in the response array
        const messageItem = chatGptResponse.find(item => item.type === 'message');
        if (messageItem && messageItem.content && Array.isArray(messageItem.content)) {
          // Look for the text content with annotations
          const textContent = messageItem.content.find(content => content.type === 'output_text');
          
          if (textContent && textContent.annotations && Array.isArray(textContent.annotations)) {
            console.log(`Found ${textContent.annotations.length} annotations in Responses API format`);
            
            // Extract url_citation annotations
            for (const annotation of textContent.annotations) {
              if (annotation.type === 'url_citation' && annotation.url) {
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
          }
          
          // If no annotations found or they don't contain citations,
          // try to extract from the text content
          if (citations.length === 0 && textContent && textContent.text) {
            console.log('Attempting to extract citations from text content');
            extractFromMarkdownLinks(textContent.text, citations);
            
            if (citations.length === 0) {
              extractFromPlainUrls(textContent.text, citations);
            }
          }
        }
      }
      // Format 5: Response with output property (transitional format)
      else if (chatGptResponse.output) {
        console.log('Detected output property format');
        // Find the message output item in the response
        const messageOutput = chatGptResponse.output?.find(item => item.type === 'message');
        if (!messageOutput || !messageOutput.content || !messageOutput.content.length) {
          console.warn('No message content found in response');
          return citations;
        }
        
        // Look for annotations in the text content
        const textContent = messageOutput.content.find(content => content.type === 'output_text');
        if (textContent && textContent.annotations) {
          console.log(`Found ${textContent.annotations.length} annotations in output format`);
          for (const annotation of textContent.annotations) {
            if (annotation.type === 'url_citation') {
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
        }
        
        // If no citations found in annotations, try markdown links and plain URLs
        if (citations.length === 0 && textContent && textContent.text) {
          extractFromMarkdownLinks(textContent.text, citations);
          
          if (citations.length === 0) {
            extractFromPlainUrls(textContent.text, citations);
          }
        }
      }
      // Format 6: Direct output_text field
      else if (chatGptResponse.output_text) {
        console.log('Detected direct output_text format');
        extractFromMarkdownLinks(chatGptResponse.output_text, citations);
        
        if (citations.length === 0) {
          extractFromPlainUrls(chatGptResponse.output_text, citations);
        }
      }
      // Format 7: Raw JSON string (sometimes responses are returned as strings)
      else if (typeof chatGptResponse === 'string') {
        console.log('Detected string response, attempting to parse as JSON');
        try {
          // Try to parse it as JSON
          const parsedResponse = JSON.parse(chatGptResponse);
          // Recursively call this function with the parsed object
          return extractCitationsFromChatGPT(parsedResponse);
        } catch (parseError) {
          console.warn('Failed to parse string as JSON, checking for URLs');
          // If it's not valid JSON, try to extract URLs directly from the string
          extractFromMarkdownLinks(chatGptResponse, citations);
          if (citations.length === 0) {
            extractFromPlainUrls(chatGptResponse, citations);
          }
        }
      } else {
        console.warn('Unrecognized response format, structure:', 
          JSON.stringify(Object.keys(chatGptResponse)).slice(0, 200) + '...');
      }
      
      console.log(`Successfully extracted ${citations.length} citations from ChatGPT response`);
      if (citations.length > 0) {
        console.log('First citation:', JSON.stringify(citations[0]));
      }
      return citations;
    } catch (error) {
      console.error('Error extracting citations:', error);
      console.error('Error stack:', error.stack);
      return [];
    }
  }
  
  /**
   * Extract citations from text
   * @param {string} text - The text to extract citations from
   * @returns {Array} - Array of extracted citations
   */
  function extractCitationsFromText(text) {
    const citations = [];
    
    if (!text) {
      console.warn('Empty text provided for citation extraction');
      return citations;
    }
    
    // Extract from markdown links first
    extractFromMarkdownLinks(text, citations);
    
    // If no markdown links found, try plain URLs
    if (citations.length === 0) {
      extractFromPlainUrls(text, citations);
    }
    
    return citations;
  }
  
  /**
   * Helper function to extract markdown links from text
   * @param {string} text - The text to extract links from
   * @param {Array} citations - The citations array to populate
   */
  function extractFromMarkdownLinks(text, citations) {
    // Match markdown-style links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let position = citations.length + 1;
    
    while ((match = markdownLinkRegex.exec(text))) {
      const [_, linkText, url] = match;
      // Normalize and clean URL
      try {
        const cleanedUrl = cleanUrl(url);
        // Check if we already have this URL
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
        console.warn(`Skipping invalid URL: ${url}`);
      }
    }
  }
  
  /**
   * Helper function to extract plain URLs from text
   * @param {string} text - The text to extract URLs from
   * @param {Array} citations - The citations array to populate
   */
  function extractFromPlainUrls(text, citations) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let match;
    let position = citations.length + 1;
    
    while ((match = urlRegex.exec(text))) {
      const [url] = match;
      // Clean up the URL (remove trailing punctuation)
      let cleanUrlStr = url;
      if (cleanUrlStr.endsWith('.') || cleanUrlStr.endsWith(',') || cleanUrlStr.endsWith(')') || cleanUrlStr.endsWith('"') || cleanUrlStr.endsWith("'")) {
        cleanUrlStr = cleanUrlStr.slice(0, -1);
      }
      
      // Fix URLs with special formats that might cause issues
      cleanUrlStr = cleanUrlStr.replace(/\]\[.*$/, '').replace(/\]\(.*$/, '');
      
      try {
        const normalizedUrl = cleanUrl(cleanUrlStr);
        
        // Check if we already have this URL
        const exists = citations.some(citation => citation.url === normalizedUrl);
        if (!exists) {
          const domainName = new URL(normalizedUrl).hostname;
          citations.push({
            title: `Source from ${domainName}`,
            url: normalizedUrl,
            position: position++,
            source: 'plain_url'
          });
        }
      } catch (e) {
        console.warn(`Skipping invalid URL: ${cleanUrlStr}`);
      }
    }
  }
  
  module.exports = {
    cleanUrl,
    extractCitationsFromChatGPT,
    extractCitationsFromText
  };