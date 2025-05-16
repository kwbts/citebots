// src/lib/brandAnalyzer.js

/**
 * Check if competitors are mentioned
 * @param {Array} citations - List of citations
 * @param {string} responseText - The LLM response text
 * @param {Array} competitors - List of competitor objects
 * @returns {Object} - Object with mentioned flag and names
 */
function checkCompetitorMentions(citations, responseText, competitors) {
    const mentionedCompetitors = new Set();
    
    // Ensure citations is an array
    const citationsArray = Array.isArray(citations) ? citations : [];
    
    // Ensure responseText is a string
    const responseTextStr = responseText || '';
    
    // Check for competitor domains in citations
    citationsArray.forEach(citation => {
      try {
        if (!citation || !citation.url) return;
        
        const domain = new URL(citation.url).hostname.toLowerCase();
        
        for (const comp of competitors || []) {
          if (!comp || !comp.pattern) continue;
          
          const regexPattern = comp.pattern.replace('.', '\\.');
          const regex = new RegExp(regexPattern, 'i');
          
          if (regex.test(domain)) {
            mentionedCompetitors.add(comp.name);
          }
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    // Check for competitor names in response text
    const responseLower = responseTextStr.toLowerCase();
    for (const comp of competitors || []) {
      if (!comp || !comp.name) continue;
      
      const namePattern = comp.name.toLowerCase();
      if (responseLower.includes(namePattern)) {
        mentionedCompetitors.add(comp.name);
      }
    }
    
    return {
      mentioned: mentionedCompetitors.size > 0,
      names: Array.from(mentionedCompetitors)
    };
  }
  
  /**
   * Check if brand is mentioned
   * @param {Array} citations - List of citations
   * @param {string} responseText - The LLM response text
   * @param {string} brandDomain - The brand domain
   * @param {string} brandName - The brand name
   * @returns {boolean} - Whether the brand is mentioned
   */
  function checkBrandMention(citations, responseText, brandDomain, brandName) {
    // Ensure citations is an array
    const citationsArray = Array.isArray(citations) ? citations : [];
    
    // Ensure responseText, brandDomain, and brandName are strings
    const responseTextStr = responseText || '';
    const brandDomainStr = brandDomain || '';
    const brandNameStr = brandName || '';
    
    // Skip processing if either brandDomain or brandName is missing
    if (!brandDomainStr && !brandNameStr) {
      return false;
    }
    
    // Check for brand domain in citations
    for (const citation of citationsArray) {
      try {
        if (!citation || !citation.url) continue;
        
        const domain = new URL(citation.url).hostname.toLowerCase();
        if (brandDomainStr && domain.includes(brandDomainStr.toLowerCase())) {
          return true;
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
    
    // Check for brand name in response text
    if (brandNameStr && responseTextStr) {
      const responseLower = responseTextStr.toLowerCase();
      const brandLower = brandNameStr.toLowerCase();
      return responseLower.includes(brandLower);
    }
    
    return false;
  }
  
  /**
   * Analyze sentiment of brand mentions
   * @param {string} responseText - The LLM response text
   * @param {string} brandName - The brand name
   * @returns {string|null} - Sentiment (Positive, Neutral, Negative) or null if not mentioned
   */
  function analyzeBrandSentiment(responseText, brandName) {
    // Ensure arguments are valid strings
    const responseTextStr = responseText || '';
    const brandNameStr = brandName || '';
    
    // Basic implementation - could be enhanced with NLP or external API
    if (!responseTextStr || !brandNameStr || !responseTextStr.toLowerCase().includes(brandNameStr.toLowerCase())) {
      return null; // Brand not mentioned
    }
    
    // Look for positive and negative sentiment indicators near brand mentions
    const brandLower = brandNameStr.toLowerCase();
    const sentences = responseTextStr.split(/[.!?]+/);
    
    let sentencesWithBrand = sentences.filter(sentence => 
      sentence.toLowerCase().includes(brandLower)
    );
    
    // Check each sentence containing the brand for sentiment indicators
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Simple sentiment word lists
    const positiveWords = [
      'great', 'excellent', 'good', 'best', 'top', 'leading', 'remarkable', 
      'impressive', 'outstanding', 'fantastic', 'amazing', 'wonderful', 
      'innovative', 'recommended', 'trusted', 'reliable', 'superior',
      'favorite', 'love', 'quality', 'popular', 'recommend'
    ];
    
    const negativeWords = [
      'bad', 'poor', 'worst', 'terrible', 'awful', 'disappointing', 
      'inferior', 'mediocre', 'avoid', 'problem', 'issue', 'difficult',
      'overpriced', 'expensive', 'lacking', 'limited', 'drawback',
      'unreliable', 'inconsistent', 'weak', 'flaw', 'fails'
    ];
    
    sentencesWithBrand.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Count positive and negative words
      positiveWords.forEach(word => {
        if (lowerSentence.includes(word)) positiveScore++;
      });
      
      negativeWords.forEach(word => {
        if (lowerSentence.includes(word)) negativeScore++;
      });
    });
    
    // Determine overall sentiment
    if (positiveScore > negativeScore) {
      return 'Positive';
    } else if (negativeScore > positiveScore) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  }
  
  module.exports = {
    checkCompetitorMentions,
    checkBrandMention,
    analyzeBrandSentiment
  };