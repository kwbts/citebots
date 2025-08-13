const axios = require('axios');
const logger = require('./logger');
const openai = require('./axiosOpenAI');
const claudeInsightGenerator = require('./claudeInsightGenerator');

/**
 * Analyzes content from various sources to generate brief components
 * @param {Object} params - Analysis parameters
 * @param {string} params.title - Brief title
 * @param {Array<string>} params.keywords - Keywords
 * @param {string} params.purpose - Content purpose
 * @param {string} params.audience - Target audience
 * @param {Object} [params.clientData] - Client data
 * @param {Array<Object>} params.llmResponses - LLM research responses
 * @param {Array<Object>} params.searchResults - Search results
 * @param {Array<Object>} params.scrapedContent - Scraped content
 * @param {string} params.depth - Research depth (standard/comprehensive)
 * @returns {Promise<Object>} - The analysis results
 */
async function analyzeContent(params) {
  logger.info('Starting content analysis', {
    title: params.title,
    keywords: params.keywords,
    purpose: params.purpose,
    audience: params.audience,
    llmResponseCount: params.llmResponses?.length || 0,
    searchResultCount: params.searchResults?.length || 0,
    scrapedContentCount: params.scrapedContent?.length || 0,
    depth: params.depth,
    // Debug info
    llmResponsesType: typeof params.llmResponses,
    searchResultsType: typeof params.searchResults,
    scrapedContentType: typeof params.scrapedContent,
    paramsKeys: Object.keys(params)
  });

  // Step 1: Generate Claude insights for enhanced analysis
  let claudeInsights = null;
  try {
    logger.info('Generating Claude insights');

    // Prepare research data for Claude
    const researchData = {
      llmResponses: params.llmResponses,
      searchResults: params.searchResults,
      scrapedContent: params.scrapedContent
    };

    // Generate enhanced insights using Claude
    claudeInsights = await claudeInsightGenerator.generateInsights(
      researchData,
      params.clientData,
      {
        title: params.title,
        keywords: params.keywords,
        purpose: params.purpose,
        audience: params.audience
      }
    );

    logger.info('Claude insights generated successfully', {
      categories: claudeInsights ? Object.keys(claudeInsights).length : 0,
      claudeInsightsType: typeof claudeInsights,
      claudeInsightsKeys: claudeInsights ? Object.keys(claudeInsights) : [],
      quotableStatsType: typeof claudeInsights?.quotableStatistics,
      quotableStatsLength: claudeInsights?.quotableStatistics?.length || 0,
      strategicPositioning: !!claudeInsights?.strategicPositioning
    });
  } catch (error) {
    logger.error('Error generating Claude insights', {
      error: error.message,
      stack: error.stack
    });
    claudeInsights = null;
  }

  // Step 2: Execute traditional analysis tasks in parallel, enhanced with Claude insights
  const analysisParams = { ...params, claudeInsights };
  const [summary, competitorInsights] = await Promise.all([
    generateSummary(analysisParams),
    generateCompetitorInsights(analysisParams)
    // Note: Content suggestions removed - redundant for blog content
  ]);

  // Extract strategic insights from Claude (new structure)
  const strategicPositioning = claudeInsights?.strategicPositioning || '';
  const contentDifferentiation = claudeInsights?.contentDifferentiation || '';
  const specificityRequirements = claudeInsights?.specificityRequirements || '';
  const quotableStatistics = claudeInsights?.quotableStatistics || [];
  const brandVoiceGuidelines = claudeInsights?.brandVoiceGuidelines || '';
  const uniqueValuePropositions = claudeInsights?.uniqueValuePropositions || [];
  
  // Maintain backward compatibility for legacy fields
  const statistics = quotableStatistics; // Use new quotable stats
  const keyThemes = uniqueValuePropositions; // Use unique value props as themes
  const seoKeywords = claudeInsights?.seoKeywordOpportunities || [];
  const audiencePainPoints = claudeInsights?.audiencePainPoints || [];

  logger.info('Content analysis completed', {
    summaryLength: summary?.length || 0,
    competitorInsightsCount: competitorInsights?.length || 0,
    quotableStatsCount: quotableStatistics?.length || 0,
    strategicInsightsGenerated: !!strategicPositioning,
    // Debug detailed types
    summaryType: typeof summary,
    competitorInsightsType: typeof competitorInsights,
    quotableStatsType: typeof quotableStatistics,
    strategicPositioningType: typeof strategicPositioning,
    contentDifferentiationType: typeof contentDifferentiation,
    specificityRequirementsType: typeof specificityRequirements,
    brandVoiceGuidelinesType: typeof brandVoiceGuidelines,
    uniqueValuePropositionsType: typeof uniqueValuePropositions,
    statisticsType: typeof statistics,
    keyThemesType: typeof keyThemes,
    seoKeywordsType: typeof seoKeywords,
    audiencePainPointsType: typeof audiencePainPoints
  });

  return {
    summary,
    competitorInsights,
    
    // New strategic insights from Claude
    strategicPositioning,
    contentDifferentiation,
    specificityRequirements,
    quotableStatistics,
    brandVoiceGuidelines,
    uniqueValuePropositions,
    
    // Legacy fields for backward compatibility
    statistics,
    keyThemes,
    seoKeywords,
    audiencePainPoints,
    structuralRecommendations: claudeInsights?.structuralRecommendations || ''
  };
}

/**
 * Generates a summary of research findings
 * @param {Object} params - Analysis parameters
 * @returns {Promise<string>} - The generated summary
 */
async function generateSummary(params) {
  const startTime = Date.now();
  logger.debug('Generating summary');

  try {
    // Prepare data for summary generation
    const researchSummaries = [];

    // Add LLM response summaries
    if (params.llmResponses && Array.isArray(params.llmResponses)) {
      params.llmResponses.forEach(response => {
        if (response.content && !response.error) {
          const platform = response.platform === 'chatgpt' ? 'ChatGPT' : 'Perplexity';
          researchSummaries.push(`${platform} on "${response.query}": ${truncateText(response.content, 300)}`);
        }
      });
    }

    // Add search result summaries
    const searchDomains = new Set();
    if (params.searchResults && Array.isArray(params.searchResults)) {
      params.searchResults.forEach(result => {
        searchDomains.add(result.displayLink);
      });
    }

    const keywords = params.keywords && Array.isArray(params.keywords) ? params.keywords : [];
    researchSummaries.push(`Search results from ${searchDomains.size} domains for keywords: ${keywords.join(', ')}`);

    // Add scraped content summaries
    const scrapedDomains = new Set();
    const scrapedContentArray = params.scrapedContent && Array.isArray(params.scrapedContent) ? params.scrapedContent : [];
    scrapedContentArray.forEach(content => {
      if (content.url) {
        try {
          const domain = new URL(content.url).hostname;
          scrapedDomains.add(domain);
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });

    researchSummaries.push(`Analyzed content from ${scrapedDomains.size} websites with total of ${scrapedContentArray.length} pages`);

    // Identify competitor presence
    let competitorText = '';
    if (params.clientData && params.clientData.competitors && params.clientData.competitors.length > 0) {
      const competitorDomains = params.clientData.competitors.map(c => c.domain);
      const foundCompetitors = new Set();

      // Check if competitor domains appear in scraped content
      params.scrapedContent.forEach(content => {
        if (content.url) {
          const domain = new URL(content.url).hostname;
          competitorDomains.forEach(compDomain => {
            if (domain.includes(compDomain)) {
              foundCompetitors.add(compDomain);
            }
          });
        }
      });

      if (foundCompetitors.size > 0) {
        competitorText = `Found content from ${foundCompetitors.size} competitors: ${Array.from(foundCompetitors).join(', ')}`;
      } else {
        competitorText = 'No direct competitor content found in the research';
      }
    }

    // Create prompt for summary generation, enhanced with Claude insights if available
    let additionalContext = '';

    // Add Claude insights if available
    if (params.claudeInsights) {
      const insights = params.claudeInsights;

      if (insights.keyThemes && insights.keyThemes.length > 0) {
        additionalContext += `\nKey themes identified by AI analysis:\n- ${insights.keyThemes.join('\n- ')}`;
      }

      if (insights.competitiveAnalysis && Object.keys(insights.competitiveAnalysis).length > 0) {
        additionalContext += `\n\nCompetitive analysis insights:\n`;
        for (const [key, value] of Object.entries(insights.competitiveAnalysis)) {
          additionalContext += `- ${key}: ${value}\n`;
        }
      }

      if (insights.contentGapsOpportunities && insights.contentGapsOpportunities.length > 0) {
        additionalContext += `\nContent gaps and opportunities:\n- ${insights.contentGapsOpportunities.join('\n- ')}`;
      }
    }

    const prompt = `Generate a summary of findings from research on "${params.title}" targeting ${params.audience} audience with purpose: ${params.purpose}.

Keywords: ${keywords.join(', ')}

Research sources:
${researchSummaries.join('\n')}
${competitorText}
${additionalContext}

Write a comprehensive 2-paragraph summary of findings that:
1. Describes the main insights and trends from research
2. Highlights content gaps and opportunities
3. Notes any competitor approaches and how to differentiate
4. Provides strategic direction for creating content on this topic

The summary should be detailed, insightful, and focus on specific findings rather than generic observations. Include specific statistics or data points when available.`;

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who creates insightful summaries from research findings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const summary = response.data.choices[0].message.content;

    logger.debug('Summary generated', {
      responseTime: Date.now() - startTime,
      length: summary.length
    });

    return summary;

  } catch (error) {
    logger.error('Error generating summary', {
      error: error.message,
      stack: error.stack
    });

    // Return fallback summary
    return `Research on "${params.title}" analyzed content from multiple sources targeting ${params.audience} audience with keywords: ${params.keywords.join(', ')}. Content should address key aspects of the topic with a focus on ${params.purpose}.`;
  }
}

/**
 * DEPRECATED: Content suggestions removed for blog content focus
 * Generates content suggestions based on research
 * @param {Object} params - Analysis parameters
 * @returns {Promise<Array<Object>>} - The generated content suggestions
 */
/* COMMENTED OUT - Content suggestions removed as redundant for blog content
async function generateContentSuggestions(params) {
  const startTime = Date.now();
  logger.debug('Generating content suggestions');

  try {
    // Gather insights from research
    const insights = [];

    // Gather insights from LLM responses
    params.llmResponses.forEach(response => {
      if (response.content && !response.error) {
        // Extract key points (simplified approach)
        const sentences = response.content.split(/[.!?]+/);
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i].trim();
          if (sentence.length > 50 && sentence.length < 200) {
            insights.push(sentence);
          }
        }
      }
    });

    // Limit insights to avoid token limits
    const limitedInsights = insights.slice(0, 20);

    // Create prompt for suggestion generation, enhanced with Claude insights if available
    let enhancedContext = '';
    let statisticsContext = '';

    // Add Claude insights if available
    if (params.claudeInsights) {
      const insights = params.claudeInsights;

      if (insights.contentStatistics && insights.contentStatistics.length > 0) {
        statisticsContext = `\nRelevant statistics from research:\n- ${insights.contentStatistics.join('\n- ')}`;
      }

      if (insights.audiencePainPoints && insights.audiencePainPoints.length > 0) {
        enhancedContext += `\nAudience pain points:\n- ${insights.audiencePainPoints.join('\n- ')}`;
      }

      if (insights.seoKeywordOpportunities && insights.seoKeywordOpportunities.length > 0) {
        enhancedContext += `\nSEO keyword opportunities:\n- ${insights.seoKeywordOpportunities.join('\n- ')}`;
      }
    }

    const prompt = `Based on research for "${params.title}" targeting ${params.audience} audience with purpose: ${params.purpose}, generate 5 specific, high-importance content suggestions.

Keywords: ${keywords.join(', ')}

Research insights:
${limitedInsights.join('\n')}
${statisticsContext}
${enhancedContext}

For each suggestion:
1. Provide a specific, actionable content element to include
2. Explain why it's important (the rationale)
3. Rate its importance on a scale of 9.5-10
4. Try to incorporate specific statistics or data points when relevant

Format each suggestion as:
- Suggestion: [The specific content element to include]
- Rationale: [Why this is important]
- Importance: [9.5-10.0]

Return ONLY a JSON array with exactly 5 suggestions, each with the fields "suggestion", "rationale", and "importance":
[{"suggestion": "...", "rationale": "...", "importance": 9.8}, ...]`;

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who provides specific, actionable content suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      // Removed response_format parameter as it's not supported by gpt-4
    });

    // Parse the response
    const content = response.data.choices[0].message.content;
    let suggestions = [];

    try {
      // Look for JSON array in the content
      const jsonStartIdx = content.indexOf('[');
      const jsonEndIdx = content.lastIndexOf(']') + 1;

      if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
        // Extract the JSON portion
        const jsonStr = content.substring(jsonStartIdx, jsonEndIdx);
        const parsed = JSON.parse(jsonStr);

        if (Array.isArray(parsed)) {
          suggestions = parsed;
        } else {
          throw new Error('Parsed JSON is not an array');
        }
      } else {
        // Try to parse the entire content as JSON object
        const parsed = JSON.parse(content);
        suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
      }
    } catch (parseError) {
      logger.error('Error parsing suggestions JSON', {
        error: parseError.message,
        content
      });

      // Try to extract suggestions using regex as fallback
      suggestions = extractSuggestionsWithRegex(content);
    }

    // Ensure we have at least one suggestion
    if (suggestions.length === 0) {
      suggestions = generateFallbackSuggestions(params);
    }

    logger.debug('Content suggestions generated', {
      responseTime: Date.now() - startTime,
      count: suggestions.length
    });

    return suggestions;

  } catch (error) {
    logger.error('Error generating content suggestions', {
      error: error.message,
      stack: error.stack
    });

    // Return fallback suggestions
    return generateFallbackSuggestions(params);
  }
}
*/ // END COMMENTED OUT SECTION

/**
 * Generates competitor insights
 * @param {Object} params - Analysis parameters
 * @returns {Promise<Array<string>>} - The generated competitor insights
 */
async function generateCompetitorInsights(params) {
  // Skip if no client data or no competitors
  if (!params.clientData || !params.clientData.competitors || params.clientData.competitors.length === 0) {
    logger.debug('Skipping competitor insights - no client data or competitors');
    return [];
  }

  const startTime = Date.now();
  logger.debug('Generating competitor insights');

  // Ensure keywords is safely defined
  const keywords = params.keywords && Array.isArray(params.keywords) ? params.keywords : [];

  // Identify competitor content
  const competitorDomains = params.clientData.competitors.map(c => c.domain);
  const competitorContent = [];

  // Check scraped content for competitor domains
  if (params.scrapedContent && Array.isArray(params.scrapedContent)) {
    params.scrapedContent.forEach(content => {
      if (content.url) {
        try {
          const domain = new URL(content.url).hostname;
          competitorDomains.forEach(compDomain => {
            if (domain.includes(compDomain)) {
              competitorContent.push({
                domain,
                url: content.url,
                title: content.title,
                text: truncateText(content.text, 500)
              });
            }
          });
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });
  }

  // If no competitor content found, return empty array
  if (competitorContent.length === 0) {
    logger.debug('No competitor content found for analysis');
    return [];
  }

  try {
    // Create prompt for competitor analysis, enhanced with Claude insights if available
    let competitiveContext = '';

    // Add Claude insights if available
    if (params.claudeInsights) {
      const insights = params.claudeInsights;

      if (insights.competitiveAnalysis && Object.keys(insights.competitiveAnalysis).length > 0) {
        competitiveContext += `\nCompetitive analysis insights:\n`;
        for (const [key, value] of Object.entries(insights.competitiveAnalysis)) {
          competitiveContext += `- ${key}: ${value}\n`;
        }
      }
    }

    const prompt = `Analyze competitor content for "${params.title}" targeting ${params.audience} audience with purpose: ${params.purpose}.

Keywords: ${keywords.join(', ')}

Competitor content:
${competitorContent.map(c => `Domain: ${c.domain}\nTitle: ${c.title}\nExcerpt: ${c.text}`).join('\n\n')}
${competitiveContext}

Provide 3-5 specific insights about the competitor content, focusing on:
1. Content gaps and weaknesses in competitor approaches
2. Opportunities to create superior content
3. Specific strategies to differentiate from competitors
4. Elements worth emulating or improving upon
5. Specific data points or statistics you could add that competitors are missing

Return each insight as a separate paragraph with specific, actionable information.`;

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who analyzes competitor content to identify opportunities.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.data.choices[0].message.content;

    // Split into separate insights
    const insights = content.split('\n\n').filter(insight => insight.trim().length > 0);

    logger.debug('Competitor insights generated', {
      responseTime: Date.now() - startTime,
      count: insights.length
    });

    return insights;

  } catch (error) {
    logger.error('Error generating competitor insights', {
      error: error.message,
      stack: error.stack
    });

    // Return empty array
    return [];
  }
}

// COMMENTED OUT - Content suggestions helper functions removed
// /**
//  * DEPRECATED: Content suggestions helper functions removed
//  * Helper function to extract suggestions from text using regex
//  * @param {string} text - The text to extract suggestions from
//  * @returns {Array<Object>} - The extracted suggestions
//  */
// function extractSuggestionsWithRegex(text) {
//   const suggestions = [];
//   const suggestionRegex = /Suggestion:?\s*([^\n]+).*?Rationale:?\s*([^\n]+).*?Importance:?\s*(\d+\.?\d*)/gs;
// 
//   let match;
//   while ((match = suggestionRegex.exec(text)) !== null) {
//     if (match.length >= 4) {
//       suggestions.push({
//         suggestion: match[1].trim(),
//         rationale: match[2].trim(),
//         importance: parseFloat(match[3]) || 9.5
//       });
//     }
//   }
// 
//   return suggestions;
// }
// 
// /**
//  * Generates fallback content suggestions
//  * @param {Object} params - Analysis parameters
//  * @returns {Array<Object>} - The fallback suggestions
//  */
// function generateFallbackSuggestions(params) {
//   // Generate basic suggestions based on title and keywords
//   return [
//     {
//       suggestion: `Include a comprehensive section addressing "${params.keywords[0] || params.title}"`,
//       rationale: "Research indicates this is a primary concern for the target audience",
//       importance: 9.8
//     },
//     {
//       suggestion: `Create a comparison table or visual showing different aspects of ${params.title}`,
//       rationale: "Visual elements increase comprehension and engagement with complex topics",
//       importance: 9.7
//     },
//     {
//       suggestion: `Add specific case studies or examples demonstrating successful implementation`,
//       rationale: "Real-world examples provide credibility and practical context",
//       importance: 9.6
//     },
//     {
//       suggestion: `Include actionable steps or a framework for implementing the concepts discussed`,
//       rationale: "Practical guidance increases the value and utility of the content",
//       importance: 9.5
//     },
//     {
//       suggestion: `Address common misconceptions or challenges related to ${params.keywords[0] || params.title}`,
//       rationale: "Addressing pain points directly demonstrates expertise and builds trust",
//       importance: 9.5
//     }
//   ];
// }
// END COMMENTED OUT HELPER FUNCTIONS

/**
 * Helper function to truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

module.exports = {
  analyzeContent
};