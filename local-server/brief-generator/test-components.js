#!/usr/bin/env node

/**
 * Test the core brief generation components without database dependency
 * This tests: LLM Research, Web Scraping, and Claude Insights
 */

require('dotenv').config();
const { queryChatGPT, queryPerplexity } = require('./lib/llmResearcher');
const { scrapeUrls } = require('./lib/contentScraper');
const { generateInsights } = require('./lib/claudeInsightGenerator');

async function testLLMResearch() {
  console.log('\n🤖 Testing LLM Research...');
  
  const testQueries = ['What are the benefits of AI automation in marketing?'];
  
  try {
    // Test ChatGPT
    console.log('Testing ChatGPT...');
    const chatGptResults = await queryChatGPT(testQueries);
    console.log(`✅ ChatGPT: ${chatGptResults.length} responses, first response length: ${chatGptResults[0]?.content?.length || 0} chars`);
    
    // Test Perplexity
    console.log('Testing Perplexity...');
    const perplexityResults = await queryPerplexity(testQueries);
    console.log(`✅ Perplexity: ${perplexityResults.length} responses, first response length: ${perplexityResults[0]?.content?.length || 0} chars`);
    
    return { chatGptResults, perplexityResults };
  } catch (error) {
    console.error('❌ LLM Research failed:', error.message);
    return { chatGptResults: [], perplexityResults: [] };
  }
}

async function testWebScraping() {
  console.log('\n🕷️ Testing Web Scraping...');
  
  const testUrls = [
    'https://blog.hubspot.com/marketing/ai-automation',
    'https://www.salesforce.com/resources/articles/marketing-automation/'
  ];
  
  try {
    const scrapeResults = await scrapeUrls(testUrls);
    console.log(`✅ Web Scraping: ${scrapeResults.length} pages scraped`);
    scrapeResults.forEach((result, index) => {
      console.log(`   Page ${index + 1}: ${result.title} (${result.text?.length || 0} chars)`);
    });
    
    return scrapeResults;
  } catch (error) {
    console.error('❌ Web Scraping failed:', error.message);
    return [];
  }
}

async function testClaudeInsights(llmData, scrapedData) {
  console.log('\n🧠 Testing Claude Insights...');
  
  const testData = {
    llmResponses: llmData.chatGptResults.concat(llmData.perplexityResults),
    scrapedContent: scrapedData,
    searchResults: []
  };
  
  const clientData = {
    name: 'Test Company',
    domain: 'testcompany.com',
    description: 'A marketing technology company',
    competitors: [
      { name: 'HubSpot', domain: 'hubspot.com' },
      { name: 'Salesforce', domain: 'salesforce.com' }
    ]
  };
  
  const briefParams = {
    title: 'AI Marketing Automation Best Practices',
    keywords: ['AI automation', 'marketing automation', 'artificial intelligence'],
    purpose: 'Educational guide',
    audience: 'Marketing professionals'
  };
  
  try {
    const insights = await generateInsights(testData, clientData, briefParams);
    console.log('✅ Claude Insights generated:');
    console.log(`   - Strategic Overview: ${insights.strategicPositioning ? 'Present' : 'Missing'}`);
    console.log(`   - Competitive Analysis: ${insights.competitiveLandscapeAnalysis ? 'Present' : 'Missing'}`);
    console.log(`   - Quotable Statistics: ${insights.quotableStatistics?.length || 0} stats`);
    console.log(`   - Brand Voice Guidelines: ${insights.brandVoiceGuidelines ? 'Present' : 'Missing'}`);
    
    return insights;
  } catch (error) {
    console.error('❌ Claude Insights failed:', error.message);
    return {};
  }
}

async function runComponentTests() {
  console.log('🧪 Brief Generator Component Tests 🧪');
  console.log('=====================================');
  
  try {
    // Test each component
    const llmData = await testLLMResearch();
    const scrapedData = await testWebScraping();
    const insights = await testClaudeInsights(llmData, scrapedData);
    
    console.log('\n📊 Test Summary:');
    console.log(`ChatGPT: ${llmData.chatGptResults.length > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Perplexity: ${llmData.perplexityResults.length > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Web Scraping: ${scrapedData.length > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Claude Insights: ${Object.keys(insights).length > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    
    const workingComponents = [
      llmData.chatGptResults.length > 0,
      llmData.perplexityResults.length > 0,
      scrapedData.length > 0,
      Object.keys(insights).length > 0
    ].filter(Boolean).length;
    
    console.log(`\n🎯 Overall: ${workingComponents}/4 components working`);
    
    if (workingComponents === 4) {
      console.log('🎉 All core components are working! The API issue has been resolved.');
    } else if (workingComponents >= 3) {
      console.log('⚠️ Most components working. Brief generation should succeed.');
    } else {
      console.log('❌ Multiple components failing. Check API keys and network connectivity.');
    }
    
  } catch (error) {
    console.error('❌ Component test failed:', error);
  }
}

// Run the tests
runComponentTests().catch(error => {
  console.error('Error running component tests:', error);
});