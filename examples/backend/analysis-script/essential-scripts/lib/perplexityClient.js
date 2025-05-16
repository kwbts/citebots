// src/lib/perplexityClient.js
const axios = require('axios');
const config = require('../config');

/**
 * Send a query to the Perplexity API
 * @param {string} query - The query text to send to Perplexity
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The Perplexity API response
 */
async function queryPerplexity(query, options = {}) {
  try {
    const model = options.model || config.perplexity.model;
    
    console.log(`Calling Perplexity API with query: "${query.substring(0, 100)}..."`);
    
    // Check if we should wrap the query to encourage citations
    const actualQuery = options.enhanceQuery !== false ? 
      `${query}\n\nPlease provide specific citations with functional URLs to authoritative sources that support your answer.` : 
      query;
    
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: model,
        messages: [
          { 
            role: 'system', 
            content: options.systemPrompt || 'You are a knowledgeable assistant that always cites your sources with working URLs.' 
          },
          { role: 'user', content: actualQuery }
        ],
        temperature: options.temperature || 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.perplexity.apiKey}`
        },
        timeout: config.app.requestTimeoutMs
      }
    );
    
    console.log('Response received from Perplexity');
    return response.data;
  } catch (error) {
    console.error('Perplexity API error:', error.response?.data || error.message);
    throw new Error(`Perplexity API error: ${error.message}`);
  }
}

module.exports = {
  queryPerplexity
};