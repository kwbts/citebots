const axios = require('axios');
const logger = require('./logger');
const fallbackGenerator = require('./fallbackGenerator');
const openai = require('./axiosOpenAI');

/**
 * Assembles the final content brief
 * @param {Object} params - Brief parameters
 * @param {string} params.title - The brief title
 * @param {Array<string>} params.keywords - The keywords
 * @param {string} params.purpose - The content purpose
 * @param {string} params.audience - The target audience
 * @param {Object} [params.clientData] - Client data
 * @param {string} [params.styleGuide] - Style guide
 * @param {string} [params.customInstructions] - Custom instructions
 * @param {Object} params.analysisResults - Analysis results
 * @param {Object} params.researchResults - Research results
 * @returns {Promise<Object>} - The assembled brief
 */
async function assembleBrief(params) {
  logger.info('Starting brief assembly', {
    title: params.title,
    keywords: params.keywords,
    purpose: params.purpose,
    audience: params.audience
  });

  // Execute assembly tasks in parallel
  const [
    tableOfContents,
    researchLinks
  ] = await Promise.all([
    generateTableOfContents(params),
    generateResearchLinks(params)
  ]);

  // Assemble the final brief with strategic insights for writers
  const brief = {
    id: generateBriefId(),
    title: params.title,
    client: params.clientData ? {
      id: params.clientData.id,
      name: params.clientData.name,
      domain: params.clientData.domain
    } : null,
    keywords: params.keywords,
    purpose: params.purpose,
    audience: params.audience,
    generated_at: new Date().toISOString(),
    
    // STRATEGIC OVERVIEW (replaces summary) - opinionated direction for writers
    strategic_overview: params.analysisResults.strategicPositioning || params.analysisResults.summary,
    
    // CONTENT DIFFERENTIATION - how to position against competitors
    content_differentiation: params.analysisResults.contentDifferentiation || '',
    
    // SPECIFICITY REQUIREMENTS - exact targeting guidelines
    specificity_requirements: params.analysisResults.specificityRequirements || '',
    
    // BRAND VOICE GUIDELINES - tone and style direction
    brand_voice_guidelines: params.analysisResults.brandVoiceGuidelines || '',
    
    // COMPETITIVE LANDSCAPE ANALYSIS - enhanced competitor insights with source tracking
    competitive_landscape_analysis: params.analysisResults.competitiveLandscapeAnalysis || '',
    
    // TABLE OF CONTENTS - content structure
    table_of_contents: tableOfContents,
    
    // QUOTABLE STATISTICS - ready-to-use stats with sources
    quotable_statistics: params.analysisResults.quotableStatistics || [],
    
    // RESEARCH LINKS - supporting sources
    research_links: researchLinks,
    
    // UNIQUE VALUE PROPOSITIONS - key insights to emphasize
    unique_value_propositions: params.analysisResults.uniqueValuePropositions || [],
    
    // Legacy fields for backward compatibility
    summary: params.analysisResults.summary, // Keep for existing integrations
    statistics: params.analysisResults.statistics || [],
    key_themes: params.analysisResults.keyThemes || [],
    seo_keywords: params.analysisResults.seoKeywords || [],
    audience_pain_points: params.analysisResults.audiencePainPoints || [],
    process_notes: {
      // Legacy format for backward compatibility
      llm_responses: params.researchResults.llmResponses.map(r => r.query),
      search_results: params.researchResults.searchResults.map(r => `${r.title} (${r.displayLink})`),
      competitor_insights: params.analysisResults.competitorInsights,
      
      // Enhanced debugging information
      debug_info: {
        generation_timestamp: new Date().toISOString(),
        processing_steps: [
          {
            step: 'research_collection',
            status: 'completed',
            timing: {
              llm_queries_ms: params.researchResults.timingData?.llm_queries_ms || 0,
              search_queries_ms: params.researchResults.timingData?.search_queries_ms || 0,
              web_scraping_ms: params.researchResults.timingData?.web_scraping_ms || 0
            },
            details: {
              llm_queries_executed: params.researchResults.llmResponses.length,
              search_queries_executed: new Set(params.researchResults.searchResults.map(r => r.keyword)).size,
              pages_scraped: params.researchResults.scrapedContent.length
            }
          },
          {
            step: 'ai_analysis',
            status: params.analysisResults.claudeEnhanced ? 'completed_with_claude' : 'completed_fallback',
            timing: {
              analysis_ms: params.analysisResults.timingData?.analysis_ms || 0
            },
            details: {
              claude_model: params.analysisResults.claudeModel || 'claude-sonnet-4-20250514',
              insights_generated: Object.keys(params.analysisResults).filter(key => 
                !['timingData', 'claudeEnhanced', 'claudeModel'].includes(key)
              ).length
            }
          },
          {
            step: 'brief_assembly',
            status: 'completed',
            timing: {
              assembly_ms: Date.now() - (params.startTime || Date.now())
            }
          }
        ],
        
        // Detailed page analysis results
        page_analysis: params.researchResults.scrapedContent.map(page => ({
          url: page.url,
          status: determinePageStatus(page),
          title: page.title || 'No title extracted',
          content_length: page.text ? page.text.length : (page.textContent ? page.textContent.length : 0),
          headings_extracted: page.headings ? page.headings.length : 0,
          error: page.error || page.metadata?.error || null,
          processing_time_ms: page.processingTime || 0
        })),
        
        // Full LLM responses for debugging
        full_llm_responses: params.researchResults.llmResponses.map(response => ({
          platform: response.source || response.platform,
          query: response.query,
          response_length: response.content ? response.content.length : (response.text ? response.text.length : 0),
          citations_count: response.citations ? response.citations.length : 0,
          success: !response.error && (!!response.content || !!response.text),
          error: response.error || null,
          processing_time_ms: response.processingTime || 0,
          // Include full response text for debugging (can be large)
          full_response: response.content || response.text || '',
          citations: response.citations || []
        })),
        
        // Search result analysis
        search_analysis: {
          total_results: params.researchResults.searchResults.length,
          unique_domains: new Set(params.researchResults.searchResults.map(r => {
            try {
              return new URL(r.url).hostname.replace('www.', '');
            } catch {
              return r.displayLink || 'unknown';
            }
          })).size,
          keywords_searched: [...new Set(params.researchResults.searchResults.map(r => r.keyword))],
          top_ranking_domains: params.researchResults.searchResults.slice(0, 5).map((r, index) => ({
            position: index + 1,
            domain: r.displayLink || 'unknown',
            title: r.title,
            url: r.url
          }))
        }
      }
    },
    meta: {
      style_guide: params.styleGuide,
      custom_instructions: params.customInstructions,
      client_info: params.clientData ? {
        industry: params.clientData.industry_primary,
        audience: params.clientData.target_audience
      } : null,
      research_stats: {
        llm_queries_executed: params.researchResults.llmResponses.length,
        google_searches_performed: new Set(params.researchResults.searchResults.map(r => r.keyword)).size,
        pages_analyzed: params.researchResults.scrapedContent.length,
        competitor_pages_analyzed: params.clientData && params.clientData.competitors ?
          countCompetitorPages(params.researchResults.scrapedContent, params.clientData.competitors) : 0
      },
      // Add Claude generation info
      claude_enhanced: true,
      claude_model: "claude-sonnet-4-20250514"
    }
  };

  logger.info('Brief assembly completed', {
    tocSections: brief.table_of_contents.length,
    researchLinks: brief.research_links.length,
    quotableStatistics: brief.quotable_statistics.length,
    uniqueValuePropositions: brief.unique_value_propositions.length,
    hasStrategicOverview: !!brief.strategic_overview,
    hasContentDifferentiation: !!brief.content_differentiation,
    hasSpecificityRequirements: !!brief.specificity_requirements,
    hasBrandVoiceGuidelines: !!brief.brand_voice_guidelines,
    hasCompetitiveLandscapeAnalysis: !!brief.competitive_landscape_analysis,
    claudeEnhanced: brief.meta.claude_enhanced
  });

  return brief;
}

/**
 * Generates a table of contents based on the brief parameters and research
 * @param {Object} params - Brief parameters
 * @returns {Promise<Array<Object>>} - The table of contents
 */
async function generateTableOfContents(params) {
  const startTime = Date.now();
  logger.debug('Generating table of contents');

  try {
    // Prepare prompt for TOC generation, enhanced with Claude insights if available
    let enhancedContext = '';

    // Add Claude insights if available
    if (params.analysisResults.statistics && params.analysisResults.statistics.length > 0) {
      enhancedContext += `\nKey statistics from research:\n- ${params.analysisResults.statistics.join('\n- ')}`;
    }

    if (params.analysisResults.keyThemes && params.analysisResults.keyThemes.length > 0) {
      enhancedContext += `\nKey themes identified:\n- ${params.analysisResults.keyThemes.join('\n- ')}`;
    }

    if (params.analysisResults.seoKeywords && params.analysisResults.seoKeywords.length > 0) {
      enhancedContext += `\nSEO keyword opportunities:\n- ${params.analysisResults.seoKeywords.join('\n- ')}`;
    }

    if (params.analysisResults.audiencePainPoints && params.analysisResults.audiencePainPoints.length > 0) {
      enhancedContext += `\nAudience pain points to address:\n- ${params.analysisResults.audiencePainPoints.join('\n- ')}`;
    }

    // Use structural recommendations from Claude if available
    let structuralRecommendations = '';
    if (params.analysisResults.structuralRecommendations) {
      const structRecs = params.analysisResults.structuralRecommendations;

      if (structRecs.introduction) {
        structuralRecommendations += `\nIntroduction recommendation: ${structRecs.introduction}`;
      }

      if (structRecs.sections && Array.isArray(structRecs.sections)) {
        structuralRecommendations += `\nRecommended sections to include:\n- ${structRecs.sections.join('\n- ')}`;
      }

      if (structRecs.conclusion) {
        structuralRecommendations += `\nConclusion recommendation: ${structRecs.conclusion}`;
      }
    }

    const prompt = `Create a detailed table of contents for a content piece titled "${params.title}" targeting ${params.audience} audience with purpose: ${params.purpose}.

Keywords: ${params.keywords.join(', ')}

Summary of research findings:
${params.analysisResults.summary}

Strategic positioning:
${params.analysisResults.strategicPositioning || 'Using strategic approach based on research findings'}

${params.analysisResults.competitorInsights.length > 0 ? `
Competitor insights:
${params.analysisResults.competitorInsights.join('\n')}
` : ''}
${enhancedContext}
${structuralRecommendations}

${params.styleGuide ? `Style guide: ${params.styleGuide}` : ''}
${params.customInstructions ? `Custom instructions: ${params.customInstructions}` : ''}

Create a creative, narrative-driven table of contents that:
1. Has a logical story arc with a clear beginning, middle, and end that closes content gaps
2. Contains 5-7 main sections (H2 level) that build on each other strategically
3. Each main section should have 2-4 sub-bullet points that specifically integrate research sources
4. Sub-bullets should indicate WHEN and WHERE to use specific research findings, statistics, or expert quotes
5. Follows a structure appropriate for ${params.purpose} content targeting ${params.audience}
6. Balances SEO-friendly structure with unique, differentiated content approach
7. Creatively addresses content gaps identified in competitor analysis
8. Suggests specific research integration points (e.g., "Use the 2025 industry report statistics here" or "Integrate expert quote from [source] to support this point")

**Be creative and strategic - this is a roadmap for closing content gaps and leveraging research effectively, not a generic outline.**

Return the TOC as a JSON array with this format:
[
  {
    "title": "1. Section Title",
    "points": [
      "First point explaining what to cover",
      "Second point explaining what to cover",
      "Third point explaining what to cover"
    ]
  },
  {
    "title": "2. Next Section Title",
    "points": ["..."]
  }
]`;

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist who creates well-structured, narrative-driven tables of contents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1500,
      // Removed response_format parameter as it's not supported by gpt-4
    });

    // Parse the response
    const content = response.data.choices[0].message.content;
    let toc = [];

    try {
      // Look for JSON array in the content
      const jsonStartIdx = content.indexOf('[');
      const jsonEndIdx = content.lastIndexOf(']') + 1;

      if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
        // Extract the JSON portion
        const jsonStr = content.substring(jsonStartIdx, jsonEndIdx);
        const parsed = JSON.parse(jsonStr);

        if (Array.isArray(parsed)) {
          toc = parsed;
        } else {
          throw new Error('Parsed JSON is not an array');
        }
      } else {
        // Try to parse the entire content as JSON object
        const parsed = JSON.parse(content);
        toc = Array.isArray(parsed) ? parsed : parsed.table_of_contents || [];
      }
    } catch (parseError) {
      logger.error('Error parsing TOC JSON', {
        error: parseError.message,
        content
      });

      // Try to extract TOC using regex as fallback
      toc = extractTocWithRegex(content);
    }

    // Ensure we have at least one section
    if (toc.length === 0) {
      toc = generateFallbackToc(params);
    }

    logger.debug('Table of contents generated', {
      responseTime: Date.now() - startTime,
      sectionCount: toc.length
    });

    return toc;

  } catch (error) {
    logger.error('Error generating table of contents', {
      error: error.message,
      stack: error.stack
    });

    // Return fallback TOC
    return generateFallbackToc(params);
  }
}

/**
 * Generates research links based on the brief parameters and research
 * @param {Object} params - Brief parameters
 * @returns {Promise<Array<Object>>} - The research links
 */
async function generateResearchLinks(params) {
  const startTime = Date.now();
  logger.debug('Generating research links');

  try {
    // Extract potential sources from research
    const potentialSources = [];
    
    // Add sources from LLM responses
    params.researchResults.llmResponses.forEach(response => {
      if (response.citations) {
        response.citations.forEach(citation => {
          if (citation.url) {
            potentialSources.push({
              url: citation.url,
              context: citation.context,
              source: response.platform
            });
          }
        });
      }
    });
    
    // Add sources from search results
    params.researchResults.searchResults.forEach(result => {
      if (result.url) {
        potentialSources.push({
          url: result.url,
          title: result.title,
          snippet: result.snippet,
          source: 'search',
          isClientContent: result.isClientContent
        });
      }
    });
    
    // Filter out duplicate URLs
    const uniqueUrls = new Set();
    const uniqueSources = [];
    
    potentialSources.forEach(source => {
      if (!uniqueUrls.has(source.url)) {
        uniqueUrls.add(source.url);
        uniqueSources.push(source);
      }
    });
    
    // Filter out competitor domains if client data is available
    let filteredSources = uniqueSources;
    if (params.clientData && params.clientData.competitors) {
      const competitorDomains = params.clientData.competitors.map(c => c.domain);
      filteredSources = uniqueSources.filter(source => {
        if (!source.url) return false;
        
        const domain = new URL(source.url).hostname;
        return !competitorDomains.some(compDomain => domain.includes(compDomain));
      });
    }
    
    // Limit to 10 sources for analysis
    const limitedSources = filteredSources.slice(0, 10);
    
    // Create prompt for research links selection
    const prompt = `Select the 5 best research sources for "${params.title}" targeting ${params.audience} audience with purpose: ${params.purpose}.

Keywords: ${params.keywords.join(', ')}

Potential sources:
${limitedSources.map((source, index) => {
  return `${index+1}. ${source.title || 'Source'}: ${source.url}
${source.snippet || source.context || 'No description available'}`
}).join('\n\n')}

For each selected source:
1. Provide a descriptive title that highlights the key value
2. Keep the original URL
3. Write a detailed description of why this source is valuable for the content
4. Extract 1-2 specific quotes or key insights from the source that could be used in the content
5. Categorize it as one of: research, news, academic, industry
6. Indicate specific sections of the content where this source would be most valuable

Prioritize sources that:
- Contain statistics, data, or research findings with specific quotes
- Are from authoritative domains
- Provide unique information not found in other sources
- Are directly relevant to the topic and keywords
- Have quotable content that supports our strategic angle

Return the 5 best sources as a JSON array with this format:
[
  {
    "title": "Source Title",
    "url": "https://example.com/source",
    "description": "Detailed description of why this source is valuable",
    "key_quotes": ["Specific quote from the source", "Another key insight"],
    "usage_notes": "Where and how to use this source in the content",
    "source_type": "research|news|academic|industry"
  },
  ...
]`;

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert researcher who identifies the most valuable sources for content creation.'
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
    let researchLinks = [];

    try {
      // Look for JSON array in the content
      const jsonStartIdx = content.indexOf('[');
      const jsonEndIdx = content.lastIndexOf(']') + 1;

      if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
        // Extract the JSON portion
        const jsonStr = content.substring(jsonStartIdx, jsonEndIdx);
        const parsed = JSON.parse(jsonStr);

        if (Array.isArray(parsed)) {
          researchLinks = parsed;
        } else {
          throw new Error('Parsed JSON is not an array');
        }
      } else {
        // Try to parse the entire content as JSON object
        const parsed = JSON.parse(content);
        researchLinks = Array.isArray(parsed) ? parsed : parsed.sources || [];
      }
    } catch (parseError) {
      logger.error('Error parsing research links JSON', {
        error: parseError.message,
        content
      });

      // Use first 5 sources as fallback
      researchLinks = limitedSources.slice(0, 5).map(source => ({
        title: source.title || 'Research Source',
        url: source.url,
        description: source.snippet || source.context || 'Relevant resource for this topic',
        source_type: 'research'
      }));
    }

    // Ensure we have at least one research link
    if (researchLinks.length === 0 && limitedSources.length > 0) {
      researchLinks = [{
        title: limitedSources[0].title || 'Research Source',
        url: limitedSources[0].url,
        description: limitedSources[0].snippet || limitedSources[0].context || 'Relevant resource for this topic',
        source_type: 'research'
      }];
    }

    logger.debug('Research links generated', {
      responseTime: Date.now() - startTime,
      count: researchLinks.length
    });

    return researchLinks;

  } catch (error) {
    logger.error('Error generating research links', {
      error: error.message,
      stack: error.stack
    });

    // Return empty array
    return [];
  }
}

/**
 * Helper function to extract TOC from text using regex
 * @param {string} text - The text to extract TOC from
 * @returns {Array<Object>} - The extracted TOC
 */
function extractTocWithRegex(text) {
  const toc = [];
  const sectionRegex = /"title":\s*"([^"]+)"[\s,]*"points":\s*\[(.*?)\]/gs;

  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    if (match.length >= 3) {
      const title = match[1].trim();
      
      // Extract points
      const pointsStr = match[2];
      const points = [];
      const pointRegex = /"([^"]+)"/g;
      
      let pointMatch;
      while ((pointMatch = pointRegex.exec(pointsStr)) !== null) {
        points.push(pointMatch[1].trim());
      }
      
      toc.push({
        title,
        points
      });
    }
  }

  return toc;
}

/**
 * Generates a fallback table of contents
 * @param {Object} params - Brief parameters
 * @returns {Array<Object>} - The fallback TOC
 */
function generateFallbackToc(params) {
  return fallbackGenerator.generateFallbackTOC(params);
}

/**
 * Generates a unique ID for the brief
 * @returns {string} - The generated ID
 */
function generateBriefId() {
  return 'brief_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Determines the status of a scraped page based on its properties
 * @param {Object} page - The scraped page object
 * @returns {string} - The status: 'success', 'failed', or 'partial'
 */
function determinePageStatus(page) {
  // Check if the page has error information
  if (page.error || page.metadata?.error) {
    return 'failed';
  }
  
  // Check if we have meaningful content
  const hasContent = page.text && page.text.length > 50;
  const hasTitle = page.title && page.title !== 'Untitled Document';
  
  if (hasContent && hasTitle) {
    return 'success';
  } else if (hasContent || hasTitle) {
    return 'partial';
  } else {
    return 'failed';
  }
}

/**
 * Counts the number of competitor pages in the scraped content
 * @param {Array<Object>} scrapedContent - The scraped content
 * @param {Array<Object>} competitors - The competitors
 * @returns {number} - The number of competitor pages
 */
function countCompetitorPages(scrapedContent, competitors) {
  if (!scrapedContent || !competitors) return 0;
  
  const competitorDomains = competitors.map(c => c.domain);
  let count = 0;
  
  scrapedContent.forEach(content => {
    if (content.url) {
      const domain = new URL(content.url).hostname;
      if (competitorDomains.some(compDomain => domain.includes(compDomain))) {
        count++;
      }
    }
  });
  
  return count;
}

module.exports = {
  assembleBrief
};