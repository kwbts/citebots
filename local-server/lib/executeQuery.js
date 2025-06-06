import OpenAI from 'openai';

// Function to query ChatGPT with better citation handling
async function queryChatGPT(query) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Querying ChatGPT with:', query.substring(0, 100) + '...');

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources using [1], [2], etc. format. Include the actual URLs for your citations.'
      },
      {
        role: 'user',
        content: query
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  const content = response.choices[0].message.content;
  
  // Extract citations from content
  const citations = extractChatGPTCitations(content);
  
  return {
    content,
    citations
  };
}

// Function to query Perplexity
async function queryPerplexity(query) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured');
  }

  console.log('Querying Perplexity with:', query.substring(0, 100) + '...');

  const requestBody = {
    model: 'sonar',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Provide detailed information with citations.'
      },
      {
        role: 'user',
        content: query
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    return_citations: true
  };
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract citations from content and merge with API citations if provided
  let citations = [];
  
  // Check if Perplexity provided citations in the response
  if (data.citations && Array.isArray(data.citations)) {
    console.log('Found Perplexity API citations:', data.citations.length);
    citations = data.citations.map((citation, index) => ({
      citation: `[${index + 1}]`,
      citation_number: index + 1,
      url: citation.url || citation,
      domain: citation.url ? new URL(citation.url).hostname : new URL(citation).hostname,
      title: citation.title || ''
    }));
  }
  
  // Also extract from content
  const contentCitations = extractPerplexityCitations(content);
  
  // Merge and deduplicate
  if (contentCitations.length > 0 && citations.length === 0) {
    citations = contentCitations;
  }
  
  return {
    content,
    citations
  };
}

// Clean and validate URL
function cleanAndValidateUrl(rawUrl) {
  if (!rawUrl) return null;

  // Remove common trailing characters that break URLs
  let cleanUrl = rawUrl.trim()
    .replace(/[.,;!?\])}]+$/, '') // Remove trailing punctuation
    .replace(/\s+$/, '') // Remove trailing whitespace
    .replace(/[<>"`']+/g, ''); // Remove quotes and brackets

  // Ensure URL has protocol
  if (!cleanUrl.match(/^https?:\/\//)) {
    if (cleanUrl.startsWith('www.') || cleanUrl.includes('.')) {
      cleanUrl = 'https://' + cleanUrl;
    } else {
      return null; // Not a valid URL format
    }
  }

  try {
    const urlObj = new URL(cleanUrl);

    // Basic validation checks
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return null;
    }

    // Skip obviously invalid domains
    const invalidPatterns = [
      'localhost',
      '127.0.0.1',
      'example.com',
      'test.com',
      '.local'
    ];

    if (invalidPatterns.some(pattern => urlObj.hostname.includes(pattern))) {
      return null;
    }

    return {
      url: cleanUrl,
      domain: urlObj.hostname
    };
  } catch (e) {
    console.warn('Invalid URL after cleaning:', cleanUrl, e.message);
    return null;
  }
}

// Extract citations from ChatGPT response
function extractChatGPTCitations(content) {
  const citations = [];

  console.log('Extracting citations from ChatGPT content');

  // Pattern 1: [1] with URL immediately after or at end
  const citationWithUrlPattern = /\[(\d+)\](?:.*?)(https?:\/\/[^\s\]<>"`']+)/g;
  let matches = [...content.matchAll(citationWithUrlPattern)];

  for (const match of matches) {
    const citationNumber = parseInt(match[1]);
    const rawUrl = match[2];

    const urlData = cleanAndValidateUrl(rawUrl);
    if (urlData) {
      citations.push({
        citation: `[${citationNumber}]`,
        citation_number: citationNumber,
        url: urlData.url,
        domain: urlData.domain
      });
    } else {
      console.warn('Skipping invalid URL from ChatGPT citation:', rawUrl);
    }
  }
  
  // Pattern 2: Look for references section at the end
  const referencesPattern = /(?:References|Sources|Citations):?\s*([\s\S]*?)$/i;
  const referencesMatch = content.match(referencesPattern);
  
  if (referencesMatch) {
    const referencesText = referencesMatch[1];
    const refPattern = /\[(\d+)\]\s*(https?:\/\/[^\s\]]+)/g;
    const refMatches = [...referencesText.matchAll(refPattern)];
    
    for (const match of refMatches) {
      const citationNumber = parseInt(match[1]);
      const rawUrl = match[2];

      const urlData = cleanAndValidateUrl(rawUrl);
      if (urlData) {
        // Check if we already have this citation
        const exists = citations.some(c => c.citation_number === citationNumber);
        if (!exists) {
          citations.push({
            citation: `[${citationNumber}]`,
            citation_number: citationNumber,
            url: urlData.url,
            domain: urlData.domain
          });
        }
      } else {
        console.warn('Skipping invalid reference URL:', rawUrl);
      }
    }
  }
  
  // Pattern 3: Just look for any URLs if no citations found
  if (citations.length === 0) {
    console.log('No bracketed citations found, looking for plain URLs');
    const urlPattern = /https?:\/\/[^\s\]<>"`']+/g;
    const urls = content.match(urlPattern) || [];

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];
      const urlData = cleanAndValidateUrl(rawUrl);
      if (urlData) {
        citations.push({
          citation: `[${i + 1}]`,
          citation_number: i + 1,
          url: urlData.url,
          domain: urlData.domain
        });
      } else {
        console.warn('Skipping invalid plain URL:', rawUrl);
      }
    }
  }
  
  console.log(`Extracted ${citations.length} citations from ChatGPT`);
  return citations;
}

// Extract citations from Perplexity response content
function extractPerplexityCitations(content) {
  const citations = [];
  
  console.log('Extracting citations from Perplexity content');
  
  // Perplexity often uses [1], [2] format with URLs
  const citationPattern = /\[(\d+)\](?:.*?)(https?:\/\/[^\s\]<>"`']+)/g;
  const matches = [...content.matchAll(citationPattern)];

  for (const match of matches) {
    const citationNumber = parseInt(match[1]);
    const rawUrl = match[2];

    const urlData = cleanAndValidateUrl(rawUrl);
    if (urlData) {
      citations.push({
        citation: `[${citationNumber}]`,
        citation_number: citationNumber,
        url: urlData.url,
        domain: urlData.domain
      });
    } else {
      console.warn('Skipping invalid Perplexity URL:', rawUrl);
    }
  }

  // If no bracketed citations, look for URLs
  if (citations.length === 0) {
    console.log('No bracketed citations found in Perplexity, looking for plain URLs');
    const urlPattern = /https?:\/\/[^\s\]<>"`']+/g;
    const urls = content.match(urlPattern) || [];

    for (let i = 0; i < urls.length; i++) {
      const rawUrl = urls[i];
      const urlData = cleanAndValidateUrl(rawUrl);
      if (urlData) {
        citations.push({
          citation: `[${i + 1}]`,
          citation_number: i + 1,
          url: urlData.url,
          domain: urlData.domain
        });
      } else {
        console.warn('Skipping invalid Perplexity plain URL:', rawUrl);
      }
    }
  }
  
  console.log(`Extracted ${citations.length} citations from Perplexity content`);
  return citations;
}

// AI-powered brand mention and competitor context analysis
async function analyzeBrandMentionContext(response, brandName, competitors) {
  if (!process.env.OPENAI_API_KEY) {
    return { brand_mention_type: 'secondary', competitor_context: 'none' };
  }

  try {
    const competitorNames = competitors.map(c => c.name).join(', ');
    const prompt = `
Analyze how "${brandName}" is mentioned in this LLM response. Consider the context and positioning.

Response: "${response.substring(0, 1500)}"
Brand: "${brandName}"
Competitors mentioned: ${competitorNames || 'None'}

Return JSON with these exact fields:
{
  "brand_mention_type": Choose ONE: "primary", "secondary", "implicit", "featured", "none"
  "competitor_context": Choose ONE: "comparative", "listed", "exclusive", "alternative", "leader", "follower", "none"
}

Definitions:
- primary: Brand is the main subject of response
- secondary: Brand mentioned among others but not focus
- implicit: Brand concepts mentioned without explicit naming
- featured: Brand highlighted or given prominence
- none: No brand mention detected

- comparative: Directly compared to competitors
- listed: Mentioned in list with competitors without comparison
- exclusive: Mentioned without any competitors in context
- alternative: Mentioned as alternative to another solution
- leader: Positioned as market leader or best-in-class
- follower: Positioned as secondary to competitor solutions
- none: No competitive context established`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a brand positioning analyst. Return only valid JSON with exact field names and values from the provided options.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(aiResponse.choices[0].message.content);
    return {
      brand_mention_type: result.brand_mention_type || 'secondary',
      competitor_context: result.competitor_context || 'none'
    };
  } catch (error) {
    console.error('Error in AI brand mention analysis:', error);
    return { brand_mention_type: 'secondary', competitor_context: 'none' };
  }
}

// Analyze competitor mentions
async function analyzeCompetitorMentions(response, brandName, brandDomain, competitors, citations) {
  console.log('Analyzing competitor mentions for brand:', brandName);

  // Helper function to escape special regex characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const competitorAnalysis = [];
  const mentionedCompetitors = new Set();
  
  // Ensure citations is an array before processing
  const citationsList = Array.isArray(citations) ? citations : [];
  const competitorsList = Array.isArray(competitors) ? competitors : [];

  // Check citations for brand and competitor domains
  let brandInCitations = false;
  for (const citation of citationsList) {
    if (!citation || !citation.domain) continue;

    const domain = citation.domain.toLowerCase();

    // Check if it's the brand domain
    if (brandDomain && domain.includes(brandDomain.toLowerCase())) {
      brandInCitations = true;
    }

    // Check if it's a competitor domain
    for (const comp of competitorsList) {
      if (!comp || !comp.domain) continue;

      const compDomain = comp.domain.toLowerCase();
      if (domain.includes(compDomain)) {
        mentionedCompetitors.add(comp.name);
      }
    }
  }

  // Check for brand and competitor names in response text
  const responseLower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();

  // Count brand mentions in the response text
  const escapedBrandName = escapeRegExp(brandLower);
  const brandRegex = new RegExp(`\\b${escapedBrandName}\\b`, 'gi');
  const brandMatches = response.match(brandRegex) || [];
  const brandMentionCount = brandMatches.length;

  // Use AI-powered analysis for brand mention type and competitor context
  let aiAnalysis = { brand_mention_type: 'none', competitor_context: 'none' };

  if (brandMentionCount > 0 || brandInCitations) {
    // Get AI analysis for more sophisticated classification
    aiAnalysis = await analyzeBrandMentionContext(response, brandName, competitorsList);

    // Fall back to rule-based analysis if AI fails
    if (!aiAnalysis.brand_mention_type || aiAnalysis.brand_mention_type === 'none') {
      if (responseLower.includes(`${brandLower} is the best`) ||
          responseLower.includes(`${brandLower} is a leading`) ||
          (brandMentionCount >= 3 && mentionedCompetitors.size === 0)) {
        aiAnalysis.brand_mention_type = 'primary';
      } else if (responseLower.includes(`recommend ${brandLower}`) ||
                 responseLower.includes(`${brandLower} stands out`)) {
        aiAnalysis.brand_mention_type = 'featured';
      } else if (brandInCitations && brandMentionCount === 0) {
        aiAnalysis.brand_mention_type = 'implicit';
      } else {
        aiAnalysis.brand_mention_type = 'secondary';
      }
    }

    // Ensure competitor context is set appropriately
    if (mentionedCompetitors.size === 0 && aiAnalysis.brand_mention_type !== 'none') {
      aiAnalysis.competitor_context = 'exclusive';
    }
  }

  const brandMentionType = aiAnalysis.brand_mention_type;
  const competitorContext = aiAnalysis.competitor_context;

  // Analyze each competitor
  for (const comp of competitorsList) {
    if (!comp || !comp.name) continue;

    const namePattern = comp.name.toLowerCase();
    if (responseLower.includes(namePattern)) {
      mentionedCompetitors.add(comp.name);
    }
  }
  
  // Build competitor analysis
  for (const compName of mentionedCompetitors) {
    const compLower = compName.toLowerCase();
    const escapedCompName = escapeRegExp(compLower);
    const compRegex = new RegExp(escapedCompName, 'gi');
    const compMatches = response.match(compRegex);
    const mentionCount = compMatches ? compMatches.length : 1;
    
    let mentionType = 'mentioned';
    if (responseLower.includes(`recommend ${compLower}`) || 
        responseLower.includes(`${compLower} is the best`)) {
      mentionType = 'recommendation';
    } else if (responseLower.includes(`${compLower} is`) || 
               responseLower.includes(`${compLower} offers`)) {
      mentionType = 'featured';
    }
    
    competitorAnalysis.push({
      name: compName,
      mentions: mentionCount,
      type: mentionType
    });
  }
  
  return {
    brand_mention_type: brandMentionType,
    brand_mention_count: brandMentionCount,
    competitor_context: competitorContext,
    competitors_mentioned: competitorAnalysis,
    competitor_names: Array.from(mentionedCompetitors),
    total_competitor_mentions: competitorAnalysis.reduce((sum, comp) => sum + comp.mentions, 0),
    competitive_landscape: competitorAnalysis.length > 0 ? 'competitive' : 'uncontested'
  };
}

// Extract query metadata using OpenAI
async function extractQueryMetadata(query, response, intent) {
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key, using defaults');
    return getDefaultMetadata(query, intent);
  }

  // Truncate response if too long to avoid token limits
  const truncatedResponse = response.length > 2000 ? response.substring(0, 2000) + '...' : response;

  const prompt = `
Analyze this query and AI response. Return a JSON object with these exact fields and choose ONLY from the specified values.

Query: "${query}"
Response excerpt: "${truncatedResponse}"

Required JSON structure:
{
  "query_category": Choose ONE: "general", "product", "service", "comparison", "troubleshooting", "educational", "pricing", "features"
  "query_topic": Main topic in 2-4 words (e.g., "workforce management", "construction software", "email tools")
  "query_type": Choose ONE: "question", "command", "research", "conversational", "comparison", "definition", "how_to", "example"
  "funnel_stage": Choose ONE: "awareness", "consideration", "decision", "retention"
  "query_complexity": Choose ONE: "simple", "moderate", "complex"
  "response_match": Choose ONE: "direct", "partial", "tangential"
  "response_outcome": Choose ONE: "answer", "recommendation", "comparison", "explanation"
  "action_orientation": Choose ONE: "passive", "suggestive", "directive", "interactive", "transactional", "referral", "educational"
  "query_competition": Choose ONE: "defending", "opportunity", "competitive", "competitor_advantage"
}

IMPORTANT: Return ONLY valid JSON with these exact fields.`;

  try {
    console.log('Extracting metadata for query:', query.substring(0, 100));

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a metadata extraction assistant. Return only valid JSON with the exact fields requested. Choose values ONLY from the options provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const metadata = JSON.parse(response.choices[0].message.content);

    console.log('Extracted metadata:', JSON.stringify(metadata, null, 2));

    // Validate required fields
    const requiredFields = [
      'query_category', 'query_topic', 'query_type', 'funnel_stage',
      'query_complexity', 'response_match', 'response_outcome',
      'action_orientation', 'query_competition'
    ];

    for (const field of requiredFields) {
      if (!metadata[field]) {
        console.warn(`Missing field ${field}, using default`);
        metadata[field] = getDefaultMetadata(query, intent)[field];
      }
    }

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    console.log('Falling back to default metadata');
    return getDefaultMetadata(query, intent);
  }
}

// Get default metadata when AI extraction fails
function getDefaultMetadata(query, intent) {
  const queryLower = query.toLowerCase();
  const wordCount = query.split(' ').length;
  
  // Detect query category
  let category = 'general';
  if (queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('difference')) {
    category = 'comparison';
  } else if (queryLower.includes('how') || queryLower.includes('why') || queryLower.includes('what')) {
    category = 'educational';
  } else if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('pricing')) {
    category = 'pricing';
  } else if (queryLower.includes('best') || queryLower.includes('top')) {
    category = 'product';
  }
  
  // Detect topic from keywords
  let topic = 'general';
  if (queryLower.includes('construction')) topic = 'construction software';
  else if (queryLower.includes('workforce')) topic = 'workforce management';
  else if (queryLower.includes('email')) topic = 'email tools';
  else if (queryLower.includes('marketing')) topic = 'marketing tools';
  else if (queryLower.includes('project')) topic = 'project management';
  
  // Detect query type using fixed list
  let queryType = 'question'; // Default
  if (queryLower.includes('how to') || queryLower.includes('how do i') || queryLower.includes('how can i')) {
    queryType = 'how_to';
  } else if (queryLower.includes('what is') || queryLower.includes('define') || queryLower.includes('definition')) {
    queryType = 'definition';
  } else if (queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('versus')) {
    queryType = 'comparison';
  } else if (queryLower.includes('example') || queryLower.includes('examples') || queryLower.includes('show me')) {
    queryType = 'example';
  } else if (queryLower.includes('research') || queryLower.includes('study') || queryLower.includes('analysis')) {
    queryType = 'research';
  } else if (queryLower.includes('please') || queryLower.includes('can you') || queryLower.includes('help me')) {
    queryType = 'command';
  } else if (queryLower.includes('i want') || queryLower.includes('i need') || queryLower.includes('looking for')) {
    queryType = 'conversational';
  }
  
  // Detect funnel stage
  let funnelStage = 'awareness';
  if (queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('alternative')) {
    funnelStage = 'consideration';
  } else if (queryLower.includes('buy') || queryLower.includes('price') || queryLower.includes('demo')) {
    funnelStage = 'decision';
  }
  
  return {
    query_category: category,
    query_topic: topic,
    query_type: queryType,
    funnel_stage: funnelStage,
    query_complexity: wordCount > 15 ? 'complex' : wordCount > 8 ? 'moderate' : 'simple',
    response_match: 'direct',
    response_outcome: 'answer',
    action_orientation: queryType === 'command' ? 'directive' : queryType === 'how_to' ? 'educational' : 'passive',
    query_competition: 'opportunity'
  };
}

// Determine query competition based on brand and competitor mentions
function determineQueryCompetition(brandMentionType, competitorNames, competitorContext) {
  const hasBrand = brandMentionType && brandMentionType !== 'none';
  const hasCompetitors = competitorNames && competitorNames.length > 0;

  if (hasBrand && hasCompetitors) {
    return 'competitive'; // Both brand and competitors mentioned
  } else if (hasBrand && !hasCompetitors) {
    return 'defending'; // Brand cited, no competitors
  } else if (!hasBrand && hasCompetitors) {
    return 'competitor_advantage'; // Competitors cited but brand is not
  } else {
    return 'opportunity'; // Neither brand nor competitors mentioned
  }
}

// Analyze brand sentiment
async function analyzeBrandSentiment(response, brandName) {
  if (!process.env.OPENAI_API_KEY) {
    return 0;
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const sentimentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis assistant. Analyze the sentiment of brand mentions and return a sentiment score.'
        },
        {
          role: 'user',
          content: `Analyze the sentiment towards "${brandName}" in this text. Return ONLY a JSON object with a "sentiment" field containing a number between -1 (very negative) and 1 (very positive):\n\n${response.substring(0, 1000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 30,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(sentimentResponse.choices[0].message.content);
    return result.sentiment || 0;
  } catch (error) {
    console.error('Error analyzing brand sentiment:', error);
    return 0;
  }
}

// Main execute query function
export async function executeQuery(requestData) {
  const { 
    query_text, 
    keyword, 
    query_intent, 
    platform,
    brand_name,
    brand_domain,
    competitors = []
  } = requestData;

  console.log(`Executing query on ${platform}: "${query_text}"`);
  console.log(`Brand: ${brand_name} (${brand_domain})`);
  console.log(`Competitors: ${JSON.stringify(competitors)}`);

  // Execute query based on platform
  let response = '';
  let citations = [];
  
  if (platform === 'chatgpt') {
    const result = await queryChatGPT(query_text);
    response = result.content;
    citations = result.citations;
  } else {
    const result = await queryPerplexity(query_text);
    response = result.content;
    citations = result.citations;
  }

  console.log(`Response length: ${response.length}`);
  console.log(`Citations found: ${citations.length}`);

  // Analyze competitor mentions
  console.log('Starting competitor analysis...');
  const competitorAnalysis = await analyzeCompetitorMentions(
    response,
    brand_name,
    brand_domain,
    competitors,
    citations
  );

  // Extract metadata
  console.log('Starting metadata extraction...');
  const metadata = await extractQueryMetadata(query_text, response, query_intent);

  // Analyze brand sentiment
  console.log('Starting brand sentiment analysis...');
  const brandSentiment = await analyzeBrandSentiment(response, brand_name);

  // Determine query competition based on brand and competitor presence
  const queryCompetition = determineQueryCompetition(
    competitorAnalysis.brand_mention_type,
    competitorAnalysis.competitor_names,
    competitorAnalysis.competitor_context
  );

  // Create comprehensive result object with all fields at the top level
  const result = {
    query_text,
    keyword,
    query_intent,
    platform,
    response_content: response,
    citations,
    citation_count: citations.length,

    // Brand data
    brand_mention: competitorAnalysis.brand_mention_type !== 'none',
    brand_mentioned: competitorAnalysis.brand_mention_type !== 'none',
    brand_mention_count: competitorAnalysis.brand_mention_count || 0,
    brand_sentiment: brandSentiment || 0,
    brand_mention_type: competitorAnalysis.brand_mention_type || 'none',
    brand_positioning: competitorAnalysis.market_positioning || 'none',

    // Competitor data
    competitor_mentions: competitorAnalysis.competitors_mentioned || [],
    competitor_mentioned_names: competitorAnalysis.competitor_names || [],
    competitor_count: (competitorAnalysis.competitor_names || []).length,
    total_competitor_mentions: competitorAnalysis.total_competitor_mentions || 0,
    competitor_context: competitorAnalysis.competitor_context || 'none',
    competitor_analysis: competitorAnalysis,

    // Query metadata - bringing these to top level for direct access
    query_category: metadata.query_category || 'general',
    query_topic: metadata.query_topic || 'general',
    query_type: metadata.query_type || 'informational',
    funnel_stage: metadata.funnel_stage || 'awareness',
    query_complexity: metadata.query_complexity || 'simple',

    // Response metadata
    response_match: metadata.response_match || 'direct',
    response_outcome: metadata.response_outcome || 'answer',
    action_orientation: metadata.action_orientation || 'passive',
    query_competition: queryCompetition, // Use calculated competition instead of metadata

    // Keep metadata object for backward compatibility
    metadata: {
      ...metadata,
      ...competitorAnalysis,
      brand_sentiment: brandSentiment,
      query_competition: queryCompetition // Include calculated competition
    },

    timestamp: new Date().toISOString()
  };

  return result;
}