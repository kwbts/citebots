import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryRequest {
  query_text: string
  keyword: string
  platform: 'chatgpt' | 'perplexity'
  brand_name: string
  brand_domain: string
  competitors: any[]
}

// Function to query ChatGPT
async function queryChatGPT(query: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`ChatGPT API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Function to query Perplexity
async function queryPerplexity(query: string) {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!apiKey) {
    throw new Error('Perplexity API key not configured')
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      return_citations: true
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    citations: data.citations || []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as QueryRequest
    const { query_text, platform, brand_name } = body

    let response
    let citations = []

    // Execute query based on platform
    if (platform === 'chatgpt') {
      const content = await queryChatGPT(query_text)
      response = content
      // Extract citations from ChatGPT response (simplified)
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const urls = content.match(urlRegex) || []
      citations = urls.map((url, index) => ({
        url,
        position: index + 1
      }))
    } else if (platform === 'perplexity') {
      const result = await queryPerplexity(query_text)
      response = result.content
      citations = result.citations.map((cite: any, index: number) => ({
        url: cite.url,
        position: index + 1,
        title: cite.title
      }))
    } else {
      throw new Error('Invalid platform')
    }

    // Basic brand mention detection
    const brandMentioned = response.toLowerCase().includes(brand_name.toLowerCase())

    return new Response(
      JSON.stringify({
        success: true,
        response: response,
        citations: citations,
        citation_count: citations.length,
        brand_mentioned: brandMentioned
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Query execution error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})