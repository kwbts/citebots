import OpenAI from 'openai'

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
    const openai = new OpenAI({
      apiKey: config.openaiApiKey
    })
    
    // Enhance query with context
    let enhancedQuery = query
    if (context?.brandName) {
      enhancedQuery += ` Please include information about ${context.brandName} if relevant.`
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible."
        },
        {
          role: "user",
          content: enhancedQuery
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    
    return {
      success: true,
      content: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model
    }
    
  } catch (error) {
    console.error('ChatGPT API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to query ChatGPT'
    })
  }
})