export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query, context } = body
    
    if (!query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Query is required'
      })
    }
    
    const config = useRuntimeConfig()
    
    // Enhance query with context
    let enhancedQuery = query
    if (context?.brandName) {
      enhancedQuery += ` Please include information about ${context.brandName} if relevant.`
    }
    
    // Make request to Perplexity API
    const response = await $fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible.'
          },
          {
            role: 'user',
            content: enhancedQuery
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        return_citations: true
      }
    })
    
    return {
      success: true,
      content: response.choices[0].message.content,
      citations: response.citations || [],
      usage: response.usage,
      model: response.model
    }
    
  } catch (error) {
    console.error('Perplexity API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to query Perplexity'
    })
  }
})