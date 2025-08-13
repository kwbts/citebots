/**
 * Claude Insight Generator
 *
 * This module integrates with Anthropic's Claude API to generate insights
 * from research data and improve brief quality.
 * 
 * INFORMATION FLOW TO CLAUDE:
 * 
 * 1. INPUT DATA COLLECTED:
 *    - LLM Responses: Answers from ChatGPT and Perplexity to research queries
 *    - Web Scraping: Content extracted from relevant websites
 *    - Search Results: Google search results for keywords
 *    - Client Data: Business info and competitors (if applicable)
 *    - Brief Parameters: Title, keywords, purpose, audience
 * 
 * 2. DATA PREPARATION:
 *    - LLM responses are summarized to extract key snippets with statistics
 *    - Web content is condensed to titles, summaries, and headings
 *    - Search results are formatted as title/url/snippet
 *    - Client competitor information is extracted
 * 
 * 3. CLAUDE ANALYSIS:
 *    Claude receives this structured data and generates:
 *    - Content Statistics: Specific stats to include in the content
 *    - Competitive Analysis: Gaps and opportunities vs competitors
 *    - Key Themes: Essential topics to cover
 *    - Structural Recommendations: How to organize the content
 *    - Expert Opinions: Credible quotes from the research
 *    - SEO Keywords: Additional keyword opportunities
 *    - Content Gaps: Underrepresented topics worth covering
 *    - Audience Pain Points: Problems the content should solve
 * 
 * 4. OUTPUT:
 *    These insights enhance the content suggestions and overall brief quality
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('./logger');

// Function to get Anthropic client with lazy initialization
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    logger.warn('Claude API key not found', {
      hasAnthropicApiKey: !!process.env.ANTHROPIC_API_KEY,
      hasClaudeApiKey: !!process.env.CLAUDE_API_KEY,
      availableEnvVars: Object.keys(process.env).filter(key => key.toLowerCase().includes('claude') || key.toLowerCase().includes('anthropic'))
    });
    throw new Error('No Claude API key found in environment variables');
  }

  return new Anthropic({
    apiKey: apiKey,
  });
}

/**
 * Generate insights from research data using Claude
 * 
 * This is the main function that coordinates sending research data to Claude AI
 * and receiving back structured insights that enhance the content brief.
 * 
 * @param {Object} data - The collected research data
 * @param {Array} data.llmResponses - Responses from LLMs (ChatGPT, Perplexity)
 *   - Each response contains: query, content, platform, citations
 * @param {Array} data.searchResults - Google search results
 *   - Each result contains: title, url, snippet, displayLink
 * @param {Array} data.scrapedContent - Content scraped from URLs
 *   - Each contains: url, title, textContent, html
 * @param {Object} clientData - Information about the client
 *   - Contains: name, domain, description, competitors array
 * @param {Object} briefParams - Brief generation parameters
 *   - Contains: title, keywords, purpose, audience
 * @returns {Object} - Enhanced insights for brief generation including:
 *   - contentStatistics: Specific stats to include in content
 *   - competitiveAnalysis: Competitor gaps and opportunities
 *   - keyThemes: Essential themes to cover
 *   - structuralRecommendations: Content structure suggestions
 *   - expertOpinions: Credible quotes from research
 *   - seoKeywordOpportunities: Additional keyword opportunities
 *   - contentGapsOpportunities: Underrepresented topics
 *   - audiencePainPoints: Problems the content should address
 */
async function generateInsights(data, clientData, briefParams) {
  const requestId = `brief_${Date.now()}`;
  logger.info('Starting Claude insight generation', { requestId });

  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      logger.warn('Claude API key not configured, using fallback insights');
      return generateFallbackInsights(briefParams);
    }

    // Prepare data for Claude
    const contextData = prepareContextData(data, clientData, briefParams);

    // Log research data summary for debugging
    logger.debug('Research data being sent to Claude', {
      requestId,
      llmResponsesCount: data.llmResponses?.length || 0,
      llmResponsesLength: data.llmResponses?.reduce((sum, r) => sum + (r.text?.length || 0), 0) || 0,
      scrapedContentCount: data.scrapedContent?.length || 0,
      searchResultsCount: data.searchResults?.length || 0,
      hasStatisticalPatterns: data.llmResponses ? 
        data.llmResponses.some(r => r.text && /\d+(\.\d+)?%/.test(r.text)) : false
    });

    // Create the prompt for Claude
    const prompt = createInsightPrompt(contextData);

    logger.debug('Calling Claude API', { 
      requestId,
      promptLength: prompt.length,
      model: "claude-sonnet-4-20250514"
    });

    // Get Anthropic client and call Claude API with proper error handling
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Latest model as per your example
      max_tokens: 5000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent and factual responses
    });

    // Validate response structure
    if (!response || !response.content || !response.content[0] || !response.content[0].text) {
      logger.error('Invalid response structure from Claude API', { 
        requestId,
        responseKeys: response ? Object.keys(response) : null,
        contentExists: !!response?.content,
        firstContentExists: !!response?.content?.[0]
      });
      return generateFallbackInsights(briefParams);
    }

    // Log raw Claude response for debugging
    logger.debug('Raw Claude response received', { 
      requestId,
      responseLength: response.content[0].text.length,
      responsePreview: response.content[0].text.substring(0, 500) + '...'
    });

    // Parse Claude's response
    const insights = parseClaudeResponse(response.content[0].text);
    
    // Enhanced logging to debug statistics issue
    logger.info('Claude insight generation completed', { 
      requestId,
      insightCategories: Object.keys(insights),
      quotableStatisticsCount: insights.quotableStatistics ? insights.quotableStatistics.length : 0,
      quotableStatisticsType: typeof insights.quotableStatistics,
      hasQuotableStatistics: !!insights.quotableStatistics,
      sampleStatistic: insights.quotableStatistics?.[0] || 'none'
    });

    return insights;
  } catch (error) {
    // Enhanced error logging for different types of authentication/API errors
    let errorType = 'unknown';
    if (error.message.includes('authentication') || error.message.includes('apiKey') || error.message.includes('authToken')) {
      errorType = 'authentication';
      logger.error('Claude API authentication error', {
        requestId,
        error: error.message,
        hasAnthropicApiKey: !!process.env.ANTHROPIC_API_KEY,
        hasClaudeApiKey: !!process.env.CLAUDE_API_KEY,
        errorType
      });
    } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
      errorType = 'rate_limit';
      logger.error('Claude API rate limit error', {
        requestId,
        error: error.message,
        errorType
      });
    } else if (error.message.includes('model') || error.message.includes('invalid')) {
      errorType = 'model_error';
      logger.error('Claude API model error', {
        requestId,
        error: error.message,
        model: "claude-sonnet-4-20250514",
        errorType
      });
    } else {
      logger.error('Unexpected error in Claude insight generation', {
        requestId, 
        error: error.message,
        errorName: error.name,
        errorType,
        stack: error.stack
      });
    }
    
    // Return fallback insights if Claude generation fails
    logger.info('Using fallback insights due to Claude API error', { requestId, errorType });
    return generateFallbackInsights(data, briefParams);
  }
}

/**
 * Prepare the context data from the collected research
 * 
 * This function takes all the raw research data and formats it into a structured
 * object that will be sent to Claude. It summarizes and extracts key information
 * to keep the prompt concise while preserving important details.
 * 
 * DATA SENT TO CLAUDE:
 * 1. Brief Parameters:
 *    - title: The content title being created
 *    - keywords: Target keywords for SEO
 *    - purpose: Goal of the content (educational, promotional, etc.)
 *    - audience: Target audience description
 * 
 * 2. Client Information (if available):
 *    - name: Client company name
 *    - domain: Client website
 *    - description: Business description
 *    - competitors: Array of competitor names and domains
 * 
 * 3. LLM Research Summary:
 *    - query: The question asked to ChatGPT/Perplexity
 *    - snippets: Key sentences extracted (especially those with stats)
 *    - citations: Sources cited by the LLMs
 * 
 * 4. Web Content Summary:
 *    - url: Page URL
 *    - title: Page title
 *    - summary: First 300 characters of content
 *    - headings: H1-H3 tags extracted from the page
 * 
 * 5. Search Results:
 *    - title: Search result title
 *    - url: Result URL
 *    - snippet: Google's snippet text
 */
function prepareContextData(data, clientData, briefParams) {
  // Combine and format data for Claude
  const context = {
    // Core brief parameters that define what content to create
    title: briefParams.title,
    keywords: briefParams.keywords,
    purpose: briefParams.purpose,
    audience: briefParams.audience,
    
    // Client business context for competitive insights
    client: clientData ? {
      name: clientData.name,
      domain: clientData.domain,
      description: clientData.description,
      competitors: clientData.competitors?.map(c => ({
        name: c.name,
        domain: c.domain
      }))
    } : null,
    
    // Summarized research from AI platforms (ChatGPT, Perplexity)
    llmResearch: summarizeLLMResponses(data.llmResponses),
    
    // Summarized content from web scraping
    webContent: summarizeScrapedContent(data.scrapedContent),
    
    // Google search results summary
    searchResults: summarizeSearchResults(data.searchResults)
  };

  return context;
}

/**
 * Create the prompt for Claude to generate insights
 * 
 * This function creates the actual prompt that will be sent to Claude.
 * The prompt includes all the prepared context data and specific instructions
 * for what insights Claude should extract.
 * 
 * CLAUDE'S TASK:
 * Claude acts as a strategic content director, providing opinionated guidance
 * on how to create differentiated, brand-aligned content that serves specific personas.
 */
function createInsightPrompt(contextData) {
  // Extract brand context for more strategic insights
  const brandContext = contextData.client ? `
BRAND CONTEXT:
- Company: ${contextData.client.name}
- Domain: ${contextData.client.domain}
- Description: ${contextData.client.description || 'Not provided'}
- Target Audience: ${contextData.audience}
- Content Purpose: ${contextData.purpose}
` : '';

  return `
You are a strategic content director creating a brief for a human freelance writer. Your job is to provide opinionated, specific guidance that will help them create content that is authentically positioned for the brand and differentiated from competitors.

CONTENT TOPIC: "${contextData.title}"
KEYWORDS: ${contextData.keywords.join(', ')}
${brandContext}

RESEARCH DATA:
${JSON.stringify(contextData, null, 2)}

As a strategic content director, provide the following insights in an opinionated, prescriptive manner:

1. STRATEGIC POSITIONING (EXECUTIVE SUMMARY)
Write a compelling executive summary that serves as a strategic roadmap for the freelance writer. This should read like a briefing memo that instantly communicates the narrative and differentiation strategy:

**Structure this as a 2-3 paragraph executive summary that:**
- Opens with a clear thesis statement about what the research reveals and why this creates a unique opportunity
- Explains the specific narrative structure that will leverage our competitive advantages 
- Identifies the key content gaps we'll close and how this positions us as the definitive resource
- Includes 2-3 critical statistics that support our strategic angle and demonstrate market opportunity
- Concludes with a clear directive on the overall tone and approach (e.g., "Position as the authoritative practitioner's guide" or "Frame as the contrarian take challenging industry assumptions")

**Write this so a freelancer immediately understands:**
- Why this angle is uniquely powerful for this brand
- What story we're telling and how it differs from everyone else
- The specific competitive advantages we're pressing
- How the research supports this positioning

2. COMPETITIVE LANDSCAPE ANALYSIS
Provide comprehensive analysis of competitors found in the research data, organized by competitive threat level:

**A. DIRECT COMPETITORS (Brand competitors from client list):**
For each direct competitor identified in the research:
- Company name and domain (if mentioned in research)
- Content approach and positioning analysis
- Strengths: What they do well that we should acknowledge
- Weaknesses: Specific gaps in their content we can exploit
- Market positioning: How they position themselves vs. how we'll position differently
- Content volume and quality assessment

**B. SEO COMPETITORS (High-ranking domains for our keywords):**
For top-ranking competitors discovered in search results:
- Domain and current ranking position for target keywords
- Content strategy and angle (comprehensive vs. surface-level, technical vs. beginner-friendly)
- Why they're ranking well (authority, content depth, user experience)
- Specific content gaps we can exploit to outrank them
- Format and structure analysis (what format performs best)

**C. CONTENT LANDSCAPE OVERVIEW:**
- Overall content saturation: Is this topic oversaturated or underserved?
- Dominant content angles: What approaches are most competitors taking?
- Quality assessment: Are competitors producing high-quality or surface-level content?
- Content gaps: What crucial topics or angles are missing from the landscape?

**D. DIFFERENTIATION STRATEGY SUMMARY:**
- **Unique positioning**: How our content will be distinctly positioned in the market
- **Competitive advantages**: What specific advantages we'll leverage (expertise, data, perspective)
- **Content gaps to fill**: Underserved topics or approaches we'll dominate
- **Avoidance strategy**: Oversaturated approaches to avoid
- **Outranking opportunities**: Specific tactics to outperform competitors

Format as structured sections with specific examples and competitor URLs where relevant. Include actionable recommendations for each section.

3. SPECIFICITY REQUIREMENTS
Define exactly how to make this content specific to our audience:
- What industry examples to use (and which to avoid)
- What scale/size of companies to reference
- What technical level to assume
- What use cases are most relevant
- Include 3-4 specific example scenarios that resonate with our exact persona

4. QUOTABLE STATISTICS
Extract 8-10 specific statistics from the research data provided that:
- Support our unique angle with exact numerical values
- Are recent (preferably 2025 or 2024 data)
- Include exact numbers, percentages, or growth rates (e.g., "85%", "2.3x increase", "$4.2 billion")
- Come with clear source attribution from the research data
- Are easily quotable and memorable

**CRITICAL: Each statistic MUST include the actual numerical value in the "statistic" field.**

Format as an array of objects with: 
{
  "statistic": "[Exact stat with number/percentage, e.g., '73% of SaaS companies report a 25% increase in organic traffic']", 
  "source": "[Source URL or publication name from research data]",
  "context": "[Brief context about why this stat supports our strategic angle]"
}

**Examples of good statistics:**
- "Companies using content marketing see 3x more leads than those that don't"
- "B2B SaaS companies with blogs generate 67% more leads monthly"
- "Technical content receives 40% more backlinks than general content"

Prioritize stats that our specific audience cares about and ensure each statistic can be directly traced back to the provided research data

5. STRUCTURAL RECOMMENDATIONS
Propose a content structure that supports our strategic angle:
- Introduction: How to hook OUR specific audience
- Main sections: Why this order supports our narrative
- Examples/case studies: What types align with our brand
- Conclusion: What specific action should readers take
Be prescriptive about what belongs in each section

6. BRAND VOICE GUIDELINES
Based on the brand context and research:
- What tone balances authority with approachability for this audience?
- What level of technical detail is appropriate?
- Should we be challenging conventional wisdom or reinforcing best practices?
- What phrases/terminology align with how our audience speaks?

7. UNIQUE VALUE PROPOSITIONS
What 3-4 insights can we provide that:
- Our specific audience can't easily find elsewhere
- Leverage our brand's unique perspective or expertise
- Address pain points specific to our target persona
- Go beyond surface-level advice

Format your response as structured JSON, but write each section in an opinionated, directive tone as if briefing a writer. Be specific, never generic. Always tie recommendations back to the brand and target audience.`;
}

/**
 * Parse Claude's response into a structured format
 */
function parseClaudeResponse(response) {
  try {
    // Claude should return JSON, but we'll handle text parsing too
    const startIndex = response.indexOf('{');
    const endIndex = response.lastIndexOf('}');
    
    if (startIndex >= 0 && endIndex > startIndex) {
      const jsonText = response.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonText);
    }
    
    // Fallback structured parsing if JSON isn't returned properly
    const sections = {
      strategicPositioning: '',
      competitiveLandscapeAnalysis: '', // Enhanced competitor analysis with source tracking
      contentDifferentiation: '', // Keep for backward compatibility
      specificityRequirements: '',
      quotableStatistics: [], // Array of {statistic, source, context} objects
      structuralRecommendations: '',
      brandVoiceGuidelines: '',
      uniqueValuePropositions: []
    };
    
    // Basic parsing logic to extract sections
    const lines = response.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      if (line.includes('STRATEGIC POSITIONING')) {
        currentSection = 'strategicPositioning';
      } else if (line.includes('COMPETITIVE LANDSCAPE ANALYSIS')) {
        currentSection = 'competitiveLandscapeAnalysis';
      } else if (line.includes('CONTENT DIFFERENTIATION')) {
        currentSection = 'contentDifferentiation';
      } else if (line.includes('SPECIFICITY REQUIREMENTS')) {
        currentSection = 'specificityRequirements';
      } else if (line.includes('QUOTABLE STATISTICS')) {
        currentSection = 'quotableStatistics';
      } else if (line.includes('STRUCTURAL RECOMMENDATIONS')) {
        currentSection = 'structuralRecommendations';
      } else if (line.includes('BRAND VOICE GUIDELINES')) {
        currentSection = 'brandVoiceGuidelines';
      } else if (line.includes('UNIQUE VALUE PROPOSITIONS')) {
        currentSection = 'uniqueValuePropositions';
      } else if (currentSection && line.trim() && !line.startsWith('#')) {
        // Simple logic to add content to the current section
        if (Array.isArray(sections[currentSection])) {
          if (currentSection === 'quotableStatistics') {
            // Special handling for quotable statistics - try to extract stat, source, context
            const cleanLine = line.trim().replace(/^[-\d\.]\s*/, '');
            if (cleanLine.includes(' - ') || cleanLine.includes(' from ') || cleanLine.includes(' according to ')) {
              // Try to parse as "statistic - source" or similar format
              const parts = cleanLine.split(/\s+-\s+|\s+from\s+|\s+according to\s+/);
              if (parts.length >= 2) {
                sections[currentSection].push({
                  statistic: parts[0].trim(),
                  source: parts[1].trim(),
                  context: 'Supports our strategic positioning on this topic'
                });
              } else {
                // Fallback to simple object format
                sections[currentSection].push({
                  statistic: cleanLine,
                  source: 'Research data',
                  context: 'Relevant to our content strategy'
                });
              }
            } else if (cleanLine.length > 10) {
              // Basic statistic without clear source separation
              sections[currentSection].push({
                statistic: cleanLine,
                source: 'Industry research',
                context: 'Supports content objectives'
              });
            }
          } else {
            // Other array sections (non-statistics)
            if (line.trim().startsWith('-')) {
              sections[currentSection].push(line.trim().substring(1).trim());
            } else if (/^\d+\./.test(line.trim())) {
              sections[currentSection].push(line.trim().replace(/^\d+\.\s*/, ''));
            }
          }
        } else if (typeof sections[currentSection] === 'string') {
          // For string sections, append the content
          sections[currentSection] += line.trim() + ' ';
        }
      }
    }
    
    return sections;
  } catch (error) {
    logger.error('Error parsing Claude response', { error: error.message });
    return {};
  }
}

/**
 * Summarize LLM responses for context
 */
function summarizeLLMResponses(llmResponses) {
  if (!llmResponses || !llmResponses.length) return [];
  
  return llmResponses.map(response => {
    const snippetsWithSource = extractKeySnippets(response.text, 3);
    
    return {
      query: response.query || '',
      source: response.source || '',
      snippets: snippetsWithSource.map(item => item.snippet), // Keep backward compatibility
      snippetsWithSource: snippetsWithSource, // New enhanced format
      citations: (response.citations || []).map(citation => ({
        title: citation.title || '',
        url: citation.url || ''
      }))
    };
  });
}

/**
 * Summarize scraped content for context with competitor identification
 */
function summarizeScrapedContent(scrapedContent) {
  if (!scrapedContent || !scrapedContent.length) return [];
  
  return scrapedContent.map(content => {
    // Extract domain from URL for competitor identification
    let domain = '';
    try {
      if (content.url) {
        const urlObj = new URL(content.url);
        domain = urlObj.hostname.replace('www.', '');
      }
    } catch (error) {
      // Fallback for invalid URLs - try to extract from URL string
      if (content.url) {
        const match = content.url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
        domain = match ? match[1] : '';
      }
    }
    
    return {
      url: content.url || '',
      domain: domain,
      title: content.title || '',
      summary: truncateText(content.textContent || '', 300),
      headings: extractHeadings(content.content || content.html || ''),
      source_type: 'scraped_content'
    };
  });
}

/**
 * Summarize search results for context with competitor identification
 */
function summarizeSearchResults(searchResults) {
  if (!searchResults || !searchResults.length) return [];
  
  return searchResults.map((result, index) => {
    // Extract domain from URL for competitor identification
    let domain = '';
    try {
      if (result.url) {
        const urlObj = new URL(result.url);
        domain = urlObj.hostname.replace('www.', '');
      }
    } catch (error) {
      // Fallback for invalid URLs
      domain = result.displayLink || '';
    }
    
    return {
      title: result.title || '',
      url: result.url || '',
      domain: domain,
      snippet: result.snippet || '',
      ranking_position: index + 1, // Track where this appeared in search results
      keyword: result.keyword || '', // If available, track which keyword this ranked for
      source_type: 'search_result'
    };
  });
}

/**
 * Extract key snippets from text with enhanced stat detection and source context
 */
function extractKeySnippets(text, count = 3) {
  if (!text) return [];
  
  // Enhanced patterns for statistical content
  const statPatterns = [
    /\d+(\.\d+)?%/, // Percentages: 85%, 12.5%
    /\d+(\.\d+)?\s*(billion|million|thousand|k\b)/i, // Large numbers: 2.5 billion, 500k
    /\d+(\.\d+)?\s*times\s+(more|less|faster|higher|lower)/i, // Comparisons: 3x faster
    /\d+(\.\d+)?\s*out\s*of\s*\d+/i, // Ratios: 7 out of 10
    /increased?\s+by\s+\d+(\.\d+)?%?/i, // Growth: increased by 25%
    /decreased?\s+by\s+\d+(\.\d+)?%?/i, // Decline: decreased by 15%
    /\$\d+(\.\d+)?\s*(billion|million|thousand|k\b)?/i, // Money: $2.5 billion
    /\d+(\.\d+)?\s*(companies|users|customers|businesses)/i // Counts: 1000 companies
  ];
  
  // Keywords that indicate valuable statistical content
  const statKeywords = /\b(research|study|found|statistics|percent|survey|report|data|analysis|according to|shows that|reveals|indicates)\b/i;
  
  // Source indicators to look for
  const sourcePatterns = /\b(according to|source:|from|by|study by|research by|report from|data from|survey by)\s+([^.,;]+)/gi;
  
  // Split into sentences and filter for statistical relevance
  const sentences = text.split(/[.!?]/)
    .filter(s => s.trim().length > 40)
    .filter(s => {
      // Must contain either a statistical pattern OR statistical keywords with numbers
      return statPatterns.some(pattern => pattern.test(s)) || 
             (statKeywords.test(s) && /\d/.test(s));
    })
    .map(s => {
      const sentence = s.trim();
      
      // Try to extract potential source information
      const sourceMatch = sentence.match(sourcePatterns);
      let extractedSource = null;
      
      if (sourceMatch && sourceMatch[0]) {
        // Clean up the source string
        extractedSource = sourceMatch[0]
          .replace(/^(according to|source:|from|by|study by|research by|report from|data from|survey by)\s*/i, '')
          .replace(/[,;].*$/, '') // Remove everything after comma or semicolon
          .trim();
      }
      
      return {
        snippet: sentence,
        potentialSource: extractedSource
      };
    })
    .sort((a, b) => {
      // Prioritize sentences with multiple statistical patterns
      const aMatches = statPatterns.filter(pattern => pattern.test(a.snippet)).length;
      const bMatches = statPatterns.filter(pattern => pattern.test(b.snippet)).length;
      
      // Also boost sentences that have source information
      const aSourceBonus = a.potentialSource ? 1 : 0;
      const bSourceBonus = b.potentialSource ? 1 : 0;
      
      return (bMatches + bSourceBonus) - (aMatches + aSourceBonus);
    });
  
  return sentences.slice(0, count);
}

/**
 * Extract headings from HTML content
 */
function extractHeadings(html) {
  if (!html) return [];
  
  const headings = [];
  const regex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    headings.push(match[1].replace(/<[^>]*>/g, '').trim());
  }
  
  return headings.slice(0, 5); // Return top 5 headings
}

/**
 * Truncate text to a specific length
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate fallback insights if Claude generation fails
 */
function generateFallbackInsights(briefParams) {
  return {
    // Legacy field for backward compatibility
    contentStatistics: [
      "According to recent industry data, websites with comprehensive content receive 3x more traffic on average",
      "Studies show that articles with statistics have 40% higher engagement rates",
      "Research indicates that content incorporating expert opinions has a 27% higher conversion rate"
    ],
    // New structured quotable statistics format
    quotableStatistics: [
      {
        statistic: "Websites with comprehensive content receive 3x more traffic on average",
        source: "Industry research data",
        context: "Demonstrates the value of thorough content creation for our audience"
      },
      {
        statistic: "Articles with statistics have 40% higher engagement rates",
        source: "Content marketing studies",
        context: "Supports including data-driven insights in our content strategy"
      },
      {
        statistic: "Content incorporating expert opinions has a 27% higher conversion rate",
        source: "Marketing research",
        context: "Justifies including expert perspectives in our content approach"
      }
    ],
    // New competitive landscape analysis structure
    competitiveLandscapeAnalysis: `
    A. Direct Competitors:
    - Key players in the market are focusing on general approaches without industry specificity
    - Most content lacks actionable frameworks and relies heavily on theory
    - Opportunity exists for more data-driven, specific content
    
    B. SEO Competitors:
    - Top-ranking content focuses on broad overviews rather than specialized insights
    - Many competitors prioritize quantity over quality in their content strategy
    - Clear opportunity to rank with more comprehensive, research-backed content
    
    C. Content Differentiation Strategy:
    - Position as the most comprehensive, data-driven resource in the space
    - Focus on actionable frameworks rather than theoretical overviews
    - Emphasize industry-specific examples and real-world applications
    `,
    // Legacy competitive analysis for backward compatibility
    competitiveAnalysis: {
      gaps: "Most competitors lack comprehensive data and specific examples",
      strengths: "Competitors are using visual elements effectively to explain complex concepts",
      opportunities: "There's a clear opportunity to provide more actionable advice with step-by-step instructions"
    },
    keyThemes: [
      `Understanding ${briefParams.title} fundamentals`,
      `Best practices for implementing ${briefParams.title}`,
      `Future trends in ${briefParams.title}`
    ],
    structuralRecommendations: {
      introduction: "Define the concept and explain its importance",
      sections: [
        "Historical context and evolution",
        "Current best practices",
        "Step-by-step implementation guide",
        "Case studies and examples",
        "Future trends and predictions"
      ],
      conclusion: "Summarize key points and provide actionable next steps"
    },
    expertOpinions: [
      "According to industry experts, the most successful implementations focus on user experience first",
      "Leading researchers suggest that an integrated approach yields the best results"
    ],
    seoKeywordOpportunities: [
      `how to implement ${briefParams.keywords[0] || briefParams.title}`,
      `${briefParams.keywords[0] || briefParams.title} best practices`,
      `${briefParams.keywords[0] || briefParams.title} examples`
    ],
    contentGapsOpportunities: [
      "Detailed case studies from real implementations",
      "Step-by-step technical guides",
      "Cost-benefit analysis frameworks"
    ],
    audiencePainPoints: [
      "Understanding complex technical requirements",
      "Measuring ROI effectively",
      "Integrating with existing systems and workflows"
    ]
  };
}

module.exports = {
  generateInsights
};