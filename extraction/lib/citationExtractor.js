/**
 * Citation Extraction Library
 * 
 * Supports extracting citations from multiple AI platforms:
 * - ChatGPT (OpenAI API responses)
 * - Perplexity (API responses with citations)
 * - Claude (Anthropic API responses)
 * - Generic text parsing for other platforms
 */

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
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} - Domain name
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.warn(`Error extracting domain from ${url}: ${error.message}`);
    return url;
  }
}

/**
 * Main citation extraction function - routes to appropriate extractor
 * @param {Object|string} response - AI response object or text
 * @param {string} platform - Platform type: 'chatgpt', 'perplexity', 'claude', 'text'
 * @returns {Array} - Array of extracted citations
 */
function extractCitations(response, platform = 'text') {
  console.log(`🔍 Extracting citations from ${platform} response`);
  
  switch (platform.toLowerCase()) {
    case 'chatgpt':
    case 'openai':
      return extractCitationsFromChatGPT(response);
    case 'perplexity':
      return extractCitationsFromPerplexity(response);
    case 'claude':
    case 'anthropic':
      return extractCitationsFromClaude(response);
    case 'text':
    default:
      return extractCitationsFromText(typeof response === 'string' ? response : JSON.stringify(response));
  }
}

/**
 * Extract citations from ChatGPT API response
 * @param {Object} chatGptResponse - The response from ChatGPT API
 * @returns {Array} - Array of extracted citations
 */
function extractCitationsFromChatGPT(chatGptResponse) {
  const citations = [];
  let position = 1;
  
  if (!chatGptResponse) {
    console.warn('Empty ChatGPT response');
    return citations;
  }

  console.log('Analyzing ChatGPT response format...');
  
  try {
    // Format 1: Chat Completions API response with tool_calls for web_search
    if (chatGptResponse.choices && chatGptResponse.choices[0]?.message?.tool_calls) {
      console.log('Detected Chat Completions API response with tool_calls');
      const toolCalls = chatGptResponse.choices[0].message.tool_calls;
      
      for (const toolCall of toolCalls) {
        // Handle web search tool calls
        if (toolCall.type === 'web_search' || (toolCall.function && toolCall.function.name === 'search_web')) {
          try {
            let searchInfo = {};
            if (toolCall.function) {
              searchInfo = JSON.parse(toolCall.function.arguments);
            } else if (toolCall.web_search) {
              searchInfo = toolCall.web_search;
            }
            
            if (searchInfo.urls && Array.isArray(searchInfo.urls)) {
              for (const url of searchInfo.urls) {
                const cleanedUrl = cleanUrl(url);
                citations.push({
                  title: `Search Result ${position}`,
                  url: cleanedUrl,
                  domain: extractDomain(cleanedUrl),
                  citation_number: position++,
                  source: 'web_search_tool'
                });
              }
            }
          } catch (e) {
            console.warn('Error processing web search tool call:', e.message);
          }
        }
      }
    }

    // Format 2: Standard response with message content
    if (citations.length === 0 && chatGptResponse.choices && chatGptResponse.choices[0]?.message?.content) {
      const messageContent = chatGptResponse.choices[0].message.content;
      console.log('Extracting citations from message content');
      
      // Try markdown links first
      const markdownCitations = extractFromMarkdownLinks(messageContent);
      if (markdownCitations.length > 0) {
        citations.push(...markdownCitations);
      } else {
        // Fall back to plain URLs
        const urlCitations = extractFromPlainUrls(messageContent);
        citations.push(...urlCitations);
      }
    }

    // Format 3: Direct text content
    if (citations.length === 0 && typeof chatGptResponse === 'string') {
      console.log('Processing as plain text response');
      const textCitations = extractCitationsFromText(chatGptResponse);
      citations.push(...textCitations);
    }

  } catch (error) {
    console.error('Error extracting ChatGPT citations:', error);
  }
  
  console.log(`Extracted ${citations.length} citations from ChatGPT`);
  return citations;
}

/**
 * Extract citations from Perplexity API response
 * @param {Object} perplexityResponse - The response from Perplexity API
 * @returns {Array} - Array of extracted citations
 */
function extractCitationsFromPerplexity(perplexityResponse) {
  const citations = [];
  
  if (!perplexityResponse) {
    console.warn('Empty Perplexity response');
    return citations;
  }

  console.log('Analyzing Perplexity response format...');
  
  try {
    // Format 1: API response with citations array
    if (perplexityResponse.citations && Array.isArray(perplexityResponse.citations)) {
      console.log(`Found Perplexity API citations: ${perplexityResponse.citations.length}`);
      
      perplexityResponse.citations.forEach((citation, index) => {
        const url = citation.url || citation;
        citations.push({
          citation: `[${index + 1}]`,
          citation_number: index + 1,
          url: cleanUrl(url),
          domain: extractDomain(url),
          title: citation.title || `Citation ${index + 1}`,
          source: 'perplexity_api'
        });
      });
    }

    // Format 2: Response with choices containing content
    if (citations.length === 0 && perplexityResponse.choices && perplexityResponse.choices[0]?.message?.content) {
      const content = perplexityResponse.choices[0].message.content;
      console.log('Extracting citations from Perplexity content');
      
      const contentCitations = extractCitationsFromText(content);
      citations.push(...contentCitations);
    }

    // Format 3: Direct text content
    if (citations.length === 0 && typeof perplexityResponse === 'string') {
      const textCitations = extractCitationsFromText(perplexityResponse);
      citations.push(...textCitations);
    }

  } catch (error) {
    console.error('Error extracting Perplexity citations:', error);
  }
  
  console.log(`Extracted ${citations.length} citations from Perplexity`);
  return citations;
}

/**
 * Extract citations from Claude API response
 * @param {Object} claudeResponse - The response from Claude API
 * @returns {Array} - Array of extracted citations
 */
function extractCitationsFromClaude(claudeResponse) {
  const citations = [];
  
  if (!claudeResponse) {
    console.warn('Empty Claude response');
    return citations;
  }

  console.log('Analyzing Claude response format...');
  
  try {
    // Format 1: Anthropic API response format
    if (claudeResponse.content && Array.isArray(claudeResponse.content)) {
      for (const contentBlock of claudeResponse.content) {
        if (contentBlock.type === 'text' && contentBlock.text) {
          const textCitations = extractCitationsFromText(contentBlock.text);
          citations.push(...textCitations);
        }
      }
    }

    // Format 2: Simple content field
    if (citations.length === 0 && claudeResponse.content && typeof claudeResponse.content === 'string') {
      const textCitations = extractCitationsFromText(claudeResponse.content);
      citations.push(...textCitations);
    }

    // Format 3: Direct text
    if (citations.length === 0 && typeof claudeResponse === 'string') {
      const textCitations = extractCitationsFromText(claudeResponse);
      citations.push(...textCitations);
    }

  } catch (error) {
    console.error('Error extracting Claude citations:', error);
  }
  
  console.log(`Extracted ${citations.length} citations from Claude`);
  return citations;
}

/**
 * Extract citations from plain text content
 * @param {string} text - Text content to analyze
 * @returns {Array} - Array of extracted citations
 */
function extractCitationsFromText(text) {
  const citations = [];
  
  if (!text || typeof text !== 'string') {
    return citations;
  }

  console.log('Extracting citations from text content');

  // Strategy 1: Numbered citations with URLs [1] https://...
  const numberedPattern = /\[(\d+)\](?:.*?)(https?:\/\/[^\s\]<>\)]+)/g;
  let matches = [...text.matchAll(numberedPattern)];
  
  for (const match of matches) {
    const citationNumber = parseInt(match[1]);
    const url = cleanUrl(match[2]);
    
    citations.push({
      citation: `[${citationNumber}]`,
      citation_number: citationNumber,
      url: url,
      domain: extractDomain(url),
      title: `Citation ${citationNumber}`,
      source: 'numbered_citation'
    });
  }

  // Strategy 2: References section at the end
  if (citations.length === 0) {
    const referencesPattern = /(?:References|Sources|Citations|Bibliography):?\s*([\s\S]*?)(?:\n\n|\n\s*\n|$)/i;
    const referencesMatch = text.match(referencesPattern);
    
    if (referencesMatch) {
      const referencesText = referencesMatch[1];
      const refPattern = /(?:\[(\d+)\]|\d+\.)?\s*(https?:\/\/[^\s\]<>\)]+)/g;
      const refMatches = [...referencesText.matchAll(refPattern)];
      
      for (let i = 0; i < refMatches.length; i++) {
        const match = refMatches[i];
        const citationNumber = match[1] ? parseInt(match[1]) : i + 1;
        const url = cleanUrl(match[2]);
        
        citations.push({
          citation: `[${citationNumber}]`,
          citation_number: citationNumber,
          url: url,
          domain: extractDomain(url),
          title: `Reference ${citationNumber}`,
          source: 'references_section'
        });
      }
    }
  }

  // Strategy 3: Markdown-style links
  if (citations.length === 0) {
    const markdownCitations = extractFromMarkdownLinks(text);
    citations.push(...markdownCitations);
  }

  // Strategy 4: Plain URLs as fallback
  if (citations.length === 0) {
    const urlCitations = extractFromPlainUrls(text);
    citations.push(...urlCitations);
  }

  console.log(`Extracted ${citations.length} citations from text`);
  return citations;
}

/**
 * Extract citations from markdown-style links
 * @param {string} text - Text to search
 * @returns {Array} - Citations found
 */
function extractFromMarkdownLinks(text) {
  const citations = [];
  
  // Pattern: [Link Text](URL) or [Link Text](URL "Title")
  const markdownPattern = /\[([^\]]+)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g;
  let position = 1;
  let match;
  
  while ((match = markdownPattern.exec(text)) !== null) {
    const linkText = match[1];
    const url = cleanUrl(match[2]);
    const title = match[3] || linkText;
    
    // Skip if URL looks like an anchor link or email
    if (url.startsWith('#') || url.startsWith('mailto:')) {
      continue;
    }
    
    citations.push({
      citation: `[${position}]`,
      citation_number: position++,
      url: url,
      domain: extractDomain(url),
      title: title,
      source: 'markdown_link'
    });
  }
  
  return citations;
}

/**
 * Extract citations from plain URLs in text
 * @param {string} text - Text to search
 * @returns {Array} - Citations found
 */
function extractFromPlainUrls(text) {
  const citations = [];
  
  // Pattern for URLs
  const urlPattern = /https?:\/\/[^\s\]<>\)]+/g;
  const urls = text.match(urlPattern) || [];
  
  // Deduplicate URLs
  const uniqueUrls = [...new Set(urls.map(url => cleanUrl(url)))];
  
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    citations.push({
      citation: `[${i + 1}]`,
      citation_number: i + 1,
      url: url,
      domain: extractDomain(url),
      title: `URL ${i + 1}`,
      source: 'plain_url'
    });
  }
  
  return citations;
}

/**
 * Batch extract citations from multiple responses
 * @param {Array} responses - Array of response objects
 * @param {string} platform - Platform type
 * @returns {Array} - Combined citations with metadata
 */
function batchExtractCitations(responses, platform = 'text') {
  const allCitations = [];
  
  console.log(`🚀 Batch extracting citations from ${responses.length} ${platform} responses`);
  
  responses.forEach((response, index) => {
    try {
      const citations = extractCitations(response, platform);
      
      // Add batch metadata to each citation
      const batchCitations = citations.map(citation => ({
        ...citation,
        batch_index: index,
        batch_source: platform
      }));
      
      allCitations.push(...batchCitations);
      console.log(`✅ [${index + 1}/${responses.length}] Extracted ${citations.length} citations`);
      
    } catch (error) {
      console.error(`❌ [${index + 1}/${responses.length}] Error extracting citations:`, error.message);
    }
  });
  
  console.log(`🎯 Batch extraction completed: ${allCitations.length} total citations`);
  return allCitations;
}

/**
 * Validate and normalize citations
 * @param {Array} citations - Citations to validate
 * @returns {Array} - Validated and normalized citations
 */
function validateCitations(citations) {
  const validCitations = [];
  
  for (const citation of citations) {
    try {
      // Validate required fields
      if (!citation.url) {
        console.warn('Citation missing URL, skipping');
        continue;
      }
      
      // Validate URL format
      new URL(citation.url);
      
      // Normalize citation object
      const normalizedCitation = {
        citation: citation.citation || `[${citation.citation_number || validCitations.length + 1}]`,
        citation_number: citation.citation_number || validCitations.length + 1,
        url: cleanUrl(citation.url),
        domain: citation.domain || extractDomain(citation.url),
        title: citation.title || `Citation ${citation.citation_number || validCitations.length + 1}`,
        source: citation.source || 'unknown'
      };
      
      // Add optional fields if present
      if (citation.batch_index !== undefined) normalizedCitation.batch_index = citation.batch_index;
      if (citation.batch_source) normalizedCitation.batch_source = citation.batch_source;
      
      validCitations.push(normalizedCitation);
      
    } catch (error) {
      console.warn(`Invalid citation URL: ${citation.url}, skipping`);
    }
  }
  
  console.log(`✅ Validated ${validCitations.length}/${citations.length} citations`);
  return validCitations;
}

/**
 * Deduplicate citations by URL
 * @param {Array} citations - Citations to deduplicate
 * @returns {Array} - Deduplicated citations
 */
function deduplicateCitations(citations) {
  const seen = new Set();
  const deduplicated = [];
  
  for (const citation of citations) {
    const urlKey = cleanUrl(citation.url);
    
    if (!seen.has(urlKey)) {
      seen.add(urlKey);
      deduplicated.push(citation);
    }
  }
  
  console.log(`🎯 Deduplicated: ${deduplicated.length}/${citations.length} unique citations`);
  return deduplicated;
}

export {
  extractCitations,
  extractCitationsFromChatGPT,
  extractCitationsFromPerplexity,
  extractCitationsFromClaude,
  extractCitationsFromText,
  batchExtractCitations,
  validateCitations,
  deduplicateCitations,
  cleanUrl,
  extractDomain
};