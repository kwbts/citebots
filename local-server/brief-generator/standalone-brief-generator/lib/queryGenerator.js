const logger = require('./logger');
const openai = require('./axiosOpenAI');

/**
 * Generates research queries based on the brief parameters
 * @param {Object} params - The brief parameters
 * @param {string} params.title - The brief title
 * @param {Array<string>} params.keywords - The brief keywords
 * @param {string} params.purpose - The content purpose
 * @param {string} params.audience - The target audience
 * @param {Object} [params.clientData] - Optional client data
 * @param {number} params.maxQueries - Maximum number of queries to generate (default: 3)
 * @returns {Promise<Array<string>>} - The generated queries
 */
async function generateQueries(params) {
  const startTime = Date.now();
  logger.info('Starting query generation', { 
    title: params.title,
    keywordsCount: params.keywords.length,
    maxQueries: params.maxQueries
  });

  try {
    // Construct prompt based on parameters
    const prompt = constructPrompt(params);
    logger.debug('Generated prompt for query generation', { prompt });

    // Call OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content researcher specializing in creating highly effective research queries for in-depth content briefs. Your queries should be diverse, covering different aspects of the topic, and optimized for extracting useful information from LLMs and search engines.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    // Process response
    const content = response.data.choices[0].message.content;
    logger.debug('Received OpenAI response', {
      responseTime: Date.now() - startTime,
      contentLength: content.length,
      tokenUsage: response.data.usage
    });

    // Parse the response to extract queries
    const queries = parseQueries(content);
    
    // Limit to maxQueries
    const limitedQueries = queries.slice(0, params.maxQueries || 3);
    
    logger.info('Successfully generated queries', { 
      queryCount: limitedQueries.length,
      queries: limitedQueries
    });

    return limitedQueries;
  } catch (error) {
    logger.error('Error generating queries', { 
      error: error.message,
      stack: error.stack
    });
    
    // Fallback: Generate basic queries from keywords
    logger.info('Using fallback query generation');
    return generateFallbackQueries(params);
  }
}

/**
 * Constructs the prompt for query generation
 * @param {Object} params - The brief parameters
 * @returns {string} - The constructed prompt
 */
function constructPrompt(params) {
  const { title, keywords, purpose, audience, clientData, maxQueries = 3 } = params;
  
  let clientContext = '';
  if (clientData) {
    clientContext = `
Client Information:
- Name: ${clientData.name}
- Domain: ${clientData.domain}
- Industry: ${clientData.industry_primary || 'Not specified'}
${clientData.target_audience ? `- Target Audience: ${Array.isArray(clientData.target_audience) ? clientData.target_audience.join(', ') : clientData.target_audience}` : ''}
${clientData.key_products ? `- Key Products: ${Array.isArray(clientData.key_products) ? clientData.key_products.join(', ') : clientData.key_products}` : ''}
${clientData.competitors && clientData.competitors.length > 0 ? `- Competitors: ${clientData.competitors.map(c => c.name).join(', ')}` : ''}
`;
  }

  // Map purpose to research focus
  const purposeMap = {
    'inform': 'factual information and educational content',
    'convert': 'persuasive content with clear value propositions',
    'awareness': 'broad industry trends and brand positioning',
    'authority': 'in-depth expertise and thought leadership',
    'seo': 'search-optimized content with keyword focus'
  };

  // Map audience to research approach
  const audienceMap = {
    'beginners': 'foundational concepts and introductory explanations',
    'intermediate': 'practical applications and implementation details',
    'advanced': 'technical details, advanced strategies, and expert perspectives',
    'decision-makers': 'business impact, ROI, and strategic considerations'
  };

  const purposeFocus = purposeMap[purpose] || 'comprehensive information';
  const audienceFocus = audienceMap[audience] || 'general audience content';

  return `Generate exactly ${maxQueries} highly effective research queries for creating a content brief titled "${title}". These queries will be used to research content for ${purposeFocus}, targeting ${audienceFocus}.

Keywords: ${keywords.join(', ')}

${clientContext}

Create ${maxQueries} distinct research queries that:
1. Focus on different aspects of the topic to ensure comprehensive coverage
2. Are optimized for extracting useful information from LLMs and search engines
3. Will yield information needed to create a high-quality content brief
4. Are phrased as clear, direct questions that will yield detailed responses
5. Will help outperform competitor content on this topic

Format your response as a numbered list of ${maxQueries} queries only, with no additional text.`;
}

/**
 * Parses the OpenAI response to extract queries
 * @param {string} content - The OpenAI response content
 * @returns {Array<string>} - The extracted queries
 */
function parseQueries(content) {
  // Split the content by newlines and filter out empty lines
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  // Extract queries (lines that look like "1. Query text")
  const queries = [];
  const queryRegex = /^\d+\.\s+(.+)$/;
  
  for (const line of lines) {
    const match = line.match(queryRegex);
    if (match && match[1]) {
      queries.push(match[1].trim());
    }
  }
  
  // If no queries were extracted, try using the whole content
  if (queries.length === 0 && content.trim() !== '') {
    return [content.trim()];
  }
  
  return queries;
}

/**
 * Generates fallback queries if the OpenAI call fails
 * @param {Object} params - The brief parameters
 * @returns {Array<string>} - The fallback queries
 */
function generateFallbackQueries(params) {
  const { title, keywords, purpose, audience, maxQueries = 3 } = params;
  
  // Generate basic queries based on the title and keywords
  const queries = [];
  
  // Query 1: Title-based query
  queries.push(`What are the most important aspects to cover in a comprehensive guide about "${title}"?`);
  
  // Query 2: Keyword-based query (use first keyword)
  if (keywords.length > 0) {
    queries.push(`What is the latest research and best practices regarding ${keywords[0]}?`);
  }
  
  // Query 3: Purpose and audience based query
  const purposeTerms = {
    'inform': 'educational content',
    'convert': 'conversion-focused content',
    'awareness': 'brand awareness content',
    'authority': 'authoritative content',
    'seo': 'SEO-optimized content'
  };
  
  const audienceTerms = {
    'beginners': 'beginners',
    'intermediate': 'intermediate users',
    'advanced': 'advanced professionals',
    'decision-makers': 'business decision-makers'
  };
  
  const purposeTerm = purposeTerms[purpose] || 'comprehensive content';
  const audienceTerm = audienceTerms[audience] || 'general audience';
  
  queries.push(`How to create effective ${purposeTerm} about ${keywords.join(', ')} for ${audienceTerm}?`);
  
  // Return limited number of queries
  return queries.slice(0, maxQueries);
}

module.exports = {
  generateQueries
};