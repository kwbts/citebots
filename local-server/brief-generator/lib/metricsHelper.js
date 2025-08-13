/**
 * Metrics Helper
 * 
 * This module provides utility functions for tracking and calculating metrics
 * for brief generation process.
 */
const logger = require('./logger');

/**
 * Estimates tokens used by Claude API
 * @param {Object} brief - The generated brief
 * @returns {number} - Estimated tokens used
 */
function estimateClaudeTokensUsed(brief) {
  try {
    // Convert brief content to string for token estimation
    const briefContent = JSON.stringify(brief);
    
    // Estimate tokens (approx 4 chars per token for English text)
    return Math.ceil(briefContent.length / 4) + 500; // 500 token buffer
  } catch (error) {
    logger.error('Error estimating Claude tokens', { error: error.message });
    return 1000; // Default estimate
  }
}

/**
 * Estimates tokens used by GPT API
 * @param {Object} brief - The generated brief
 * @returns {number} - Estimated tokens used
 */
function estimateGptTokensUsed(brief) {
  try {
    // Convert brief sections to string for token estimation
    const sections = [
      brief.summary || '',
      ...((brief.content_suggestions || []).map(s => `${s.suggestion}\n${s.rationale}`)),
      ...((brief.table_of_contents || []).map(t => `${t.title}\n${t.points?.join('\n')}`)),
      ...((brief.research_links || []).map(l => `${l.title}\n${l.description}`))
    ];
    
    const totalChars = sections.join('\n').length;
    
    // Estimate tokens (approx 4 chars per token for English text)
    return Math.ceil(totalChars / 4) + 1000; // 1000 token buffer for prompts
  } catch (error) {
    logger.error('Error estimating GPT tokens', { error: error.message });
    return 2000; // Default estimate
  }
}

/**
 * Estimates tokens used by Perplexity API
 * @param {Object} researchResults - The research results
 * @returns {number} - Estimated tokens used
 */
function estimatePerplexityTokensUsed(researchResults) {
  try {
    // Get all Perplexity responses
    const perplexityResponses = (researchResults.llmResponses || [])
      .filter(r => r.platform === 'perplexity' && r.content);
    
    // Calculate total characters
    const totalChars = perplexityResponses.reduce((sum, r) => sum + (r.content?.length || 0), 0);
    
    // Estimate tokens (approx 4 chars per token for English text)
    return Math.ceil(totalChars / 4) + 500; // 500 token buffer for prompts
  } catch (error) {
    logger.error('Error estimating Perplexity tokens', { error: error.message });
    return 1000; // Default estimate
  }
}

/**
 * Counts expert quotes in brief content
 * @param {Object} brief - The generated brief
 * @returns {number} - Count of expert quotes
 */
function countExpertQuotes(brief) {
  try {
    // Get all text content from brief
    const textContent = [
      brief.summary || '',
      ...((brief.content_suggestions || []).map(s => s.rationale || '')),
      ...((brief.table_of_contents || []).map(t => t.points?.join(' ') || ''))
    ].join(' ');
    
    // Count patterns that likely indicate expert quotes
    const patterns = [
      /according to .*expert/gi,
      /said.*professor/gi,
      /according to .*research/gi,
      /stated.*analyst/gi,
      /"[^"]{15,}"/g, // Quoted text at least 15 chars long
      /noted.*expert/gi,
      /researcher.*found/gi
    ];
    
    return patterns.reduce((count, pattern) => {
      const matches = textContent.match(pattern) || [];
      return count + matches.length;
    }, 0);
  } catch (error) {
    logger.error('Error counting expert quotes', { error: error.message });
    return 0;
  }
}

/**
 * Counts total words in brief content
 * @param {Object} brief - The generated brief
 * @returns {number} - Total word count
 */
function countTotalWords(brief) {
  try {
    // Get all text content from brief
    const textContent = [
      brief.summary || '',
      ...((brief.content_suggestions || []).map(s => `${s.suggestion} ${s.rationale}`)),
      ...((brief.table_of_contents || []).map(t => `${t.title} ${t.points?.join(' ')}`)),
      ...((brief.research_links || []).map(l => `${l.title} ${l.description}`))
    ].join(' ');
    
    // Split by whitespace and count non-empty words
    return textContent.split(/\s+/).filter(w => w.trim().length > 0).length;
  } catch (error) {
    logger.error('Error counting words', { error: error.message });
    return 0;
  }
}

/**
 * Counts competitor URLs in scraped content
 * @param {Array<Object>} scrapedContent - The scraped content
 * @param {Array<Object>} competitors - The competitors
 * @returns {number} - Count of competitor URLs
 */
function countCompetitorUrls(scrapedContent, competitors) {
  if (!scrapedContent || !competitors) return 0;
  
  const competitorDomains = competitors.map(c => c.domain);
  let count = 0;
  
  scrapedContent.forEach(content => {
    if (content.url) {
      try {
        const domain = new URL(content.url).hostname;
        if (competitorDomains.some(compDomain => domain.includes(compDomain))) {
          count++;
        }
      } catch (error) {
        // Skip invalid URLs
      }
    }
  });
  
  return count;
}

/**
 * Extracts unique domains from LLM responses
 * @param {Array<Object>} llmResponses - The LLM responses
 * @returns {Array<string>} - Unique domains
 */
function extractUniqueDomains(llmResponses) {
  if (!llmResponses) return [];
  
  const domains = new Set();
  
  llmResponses.forEach(response => {
    if (response.citations) {
      response.citations.forEach(citation => {
        if (citation.url) {
          try {
            const domain = new URL(citation.url).hostname;
            domains.add(domain);
          } catch (error) {
            // Skip invalid URLs
          }
        }
      });
    }
  });
  
  return Array.from(domains);
}

module.exports = {
  estimateClaudeTokensUsed,
  estimateGptTokensUsed,
  estimatePerplexityTokensUsed,
  countExpertQuotes,
  countTotalWords,
  countCompetitorUrls,
  extractUniqueDomains
};