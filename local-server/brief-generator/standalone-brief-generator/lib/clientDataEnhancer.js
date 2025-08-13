/**
 * Client Data Enhancer
 * 
 * This module enhances client data for use in brief generation by:
 * - Enriching client and competitor information
 * - Formatting data for optimal AI consumption
 * - Adding context for better content personalization
 */

const logger = require('./logger');

/**
 * Enhances client data for AI processing
 * @param {Object} clientData - Raw client data from database
 * @returns {Object} - Enhanced client data
 */
async function enhanceClientData(clientData) {
  if (!clientData) {
    logger.info('No client data to enhance');
    return null;
  }

  logger.info('Enhancing client data', {
    clientId: clientData.id,
    clientName: clientData.name,
    hasCompetitors: !!clientData.competitors && clientData.competitors.length > 0
  });

  try {
    // Create a structured representation of the client
    const enhancedData = {
      id: clientData.id,
      name: clientData.name,
      domain: clientData.domain,
      description: clientData.description || `${clientData.name} is a company in the ${clientData.industry_primary || 'business'} industry.`,
      industry: {
        primary: clientData.industry_primary,
        secondary: clientData.industry_secondary
      },
      audience: clientData.target_audience || 'general audience',
      competitors: processCompetitors(clientData.competitors),
      marketPosition: determineMarketPosition(clientData),
      differentiators: extractDifferentiators(clientData),
      // Add structured context for AI prompts
      aiContext: createAIContext(clientData)
    };

    logger.info('Client data enhancement completed', {
      clientId: clientData.id,
      enhancedDataPoints: Object.keys(enhancedData).length,
      competitorsProcessed: enhancedData.competitors.length
    });

    return enhancedData;
  } catch (error) {
    logger.error('Error enhancing client data', {
      clientId: clientData.id,
      error: error.message,
      stack: error.stack
    });

    // Return original data as fallback
    return clientData;
  }
}

/**
 * Processes competitor data for enhanced context
 * @param {Array<Object>} competitors - Raw competitor data from database
 * @returns {Array<Object>} - Enhanced competitor data
 */
function processCompetitors(competitors) {
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    return [];
  }

  return competitors.map(competitor => {
    // Extract domain name without TLD for pattern matching
    const domainPattern = competitor.domain.split('.')[0].toLowerCase();

    return {
      id: competitor.id,
      name: competitor.name,
      domain: competitor.domain,
      // Add pattern field for easier content matching
      pattern: domainPattern,
      description: competitor.description || `${competitor.name} is a competitor operating at ${competitor.domain}`
    };
  });
}

/**
 * Determines market position based on client data
 * @param {Object} clientData - Raw client data
 * @returns {Object} - Market position information
 */
function determineMarketPosition(clientData) {
  // Default to generic position if no specific data
  if (!clientData) return { type: 'unknown', description: 'Position not specified' };

  // Extract keywords from description and other fields for analysis
  const descriptionKeywords = extractKeywordsFromText(clientData.description || '');
  const industryKeywords = [clientData.industry_primary, clientData.industry_secondary].filter(Boolean);
  
  // Check for keywords indicating market position
  const leaderKeywords = ['leader', 'leading', 'top', 'premier', 'best'];
  const challengerKeywords = ['innovative', 'disruptive', 'emerging', 'challenger', 'alternative'];
  const nicheKeywords = ['specialized', 'niche', 'focused', 'boutique', 'custom'];
  
  // Detect possible position based on keywords
  if (hasKeywordMatch(descriptionKeywords, leaderKeywords)) {
    return { 
      type: 'leader', 
      description: 'Market leader or established player',
      confidence: 'medium'
    };
  } else if (hasKeywordMatch(descriptionKeywords, challengerKeywords)) {
    return { 
      type: 'challenger', 
      description: 'Challenger or innovative disruptor',
      confidence: 'medium'
    };
  } else if (hasKeywordMatch(descriptionKeywords, nicheKeywords)) {
    return { 
      type: 'niche', 
      description: 'Specialized niche provider',
      confidence: 'medium'
    };
  }
  
  // If competitors exist, estimate position based on number
  if (clientData.competitors && clientData.competitors.length > 0) {
    if (clientData.competitors.length > 5) {
      return { 
        type: 'competitive', 
        description: 'Operating in a crowded market with many competitors',
        confidence: 'low'
      };
    } else {
      return { 
        type: 'focused', 
        description: 'Operating in a defined market with several key competitors',
        confidence: 'low'
      };
    }
  }
  
  return { 
    type: 'generic', 
    description: `Business in the ${clientData.industry_primary || 'general'} industry`,
    confidence: 'low'
  };
}

/**
 * Extracts potential differentiators from client data
 * @param {Object} clientData - Raw client data
 * @returns {Array<string>} - Potential differentiators
 */
function extractDifferentiators(clientData) {
  const differentiators = [];
  
  // Check for potential differentiators in description
  if (clientData.description) {
    const description = clientData.description.toLowerCase();
    
    // Common differentiator phrases
    const differentiatorPhrases = [
      { phrase: 'unique', label: 'Unique approach or methodology' },
      { phrase: 'special', label: 'Special capabilities or features' },
      { phrase: 'only', label: 'Exclusive offering or capability' },
      { phrase: 'patented', label: 'Proprietary technology or method' },
      { phrase: 'leading', label: 'Industry leadership' },
      { phrase: 'first', label: 'First-mover advantage' },
      { phrase: 'experience', label: 'Experience and expertise' },
      { phrase: 'quality', label: 'Superior quality' },
      { phrase: 'service', label: 'Outstanding customer service' },
      { phrase: 'custom', label: 'Customized solutions' }
    ];
    
    // Extract potential differentiators based on keywords
    differentiatorPhrases.forEach(({ phrase, label }) => {
      if (description.includes(phrase)) {
        differentiators.push(label);
      }
    });
  }
  
  // Add industry as potential differentiator if uncommon
  const nicheSectors = ['aerospace', 'biotechnology', 'renewable', 'sustainable', 'quantum'];
  if (clientData.industry_primary && 
      nicheSectors.some(sector => clientData.industry_primary.toLowerCase().includes(sector))) {
    differentiators.push('Specialized industry focus');
  }
  
  // Ensure we have at least one generic differentiator
  if (differentiators.length === 0) {
    differentiators.push(`Established presence in the ${clientData.industry_primary || 'business'} industry`);
  }
  
  return differentiators;
}

/**
 * Creates structured context for AI prompts
 * @param {Object} clientData - Raw client data
 * @returns {Object} - Structured context for AI
 */
function createAIContext(clientData) {
  const competitorNames = clientData.competitors && Array.isArray(clientData.competitors) 
    ? clientData.competitors.map(c => c.name).join(', ')
    : 'no specified competitors';
    
  const competitorDomains = clientData.competitors && Array.isArray(clientData.competitors) 
    ? clientData.competitors.map(c => c.domain).join(', ')
    : '';
  
  return {
    // Structured data for AI processing
    companyProfile: {
      name: clientData.name,
      industry: clientData.industry_primary || 'general business',
      domain: clientData.domain,
      targetAudience: clientData.target_audience || 'general audience'
    },
    
    // Competition context
    competitiveContext: {
      competes_with: competitorNames,
      competitor_domains: competitorDomains,
      market_positioning: clientData.market_position || 'not specified'
    },
    
    // Text prompts for AI models
    prompts: {
      competitor_analysis: `Analyze content from competitors (${competitorNames}) to identify gaps and opportunities for ${clientData.name}.`,
      industry_context: `Consider the specific context of the ${clientData.industry_primary || 'general business'} industry when generating insights.`,
      audience_targeting: `Content should be tailored for ${clientData.target_audience || 'a general audience'}.`
    }
  };
}

/**
 * Helper function to extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} - Extracted keywords
 */
function extractKeywordsFromText(text) {
  if (!text) return [];
  
  // Convert to lowercase and split into words
  const words = text.toLowerCase().split(/\\W+/);
  
  // Filter out common stop words and short words
  const stopWords = ['the', 'and', 'or', 'in', 'at', 'of', 'to', 'a', 'an', 'for', 'with', 'by'];
  return words.filter(word => !stopWords.includes(word) && word.length > 2);
}

/**
 * Helper function to check if any keywords match
 * @param {Array<string>} sourceKeywords - Keywords to check
 * @param {Array<string>} targetKeywords - Keywords to match against
 * @returns {boolean} - Whether any keywords match
 */
function hasKeywordMatch(sourceKeywords, targetKeywords) {
  return sourceKeywords.some(keyword => 
    targetKeywords.some(target => keyword.includes(target) || target.includes(keyword))
  );
}

module.exports = {
  enhanceClientData
};