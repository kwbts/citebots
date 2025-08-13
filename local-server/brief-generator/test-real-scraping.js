#!/usr/bin/env node

/**
 * Test scraping with URLs similar to what the brief generator would encounter
 * Using the same workflow as the server
 */

require('dotenv').config();
const { scrapeUrls } = require('./lib/contentScraper');
const llmResearcher = require('./lib/llmResearcher');
const webSearcher = require('./lib/webSearcher');

async function testRealScraping() {
  console.log('🌐 TESTING REAL SCRAPING WORKFLOW');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Generate some queries like the server does
    const queries = [
      "What are the emerging trends in martech that are shaping future careers in the field?",
      "How can one prepare and upskill for a future-proof career in marketing technology?",
      "What are the anticipated job roles and opportunities in the martech industry for the next decade?"
    ];
    
    console.log('🔍 Step 1: Getting LLM citations...');
    const chatGptResults = await llmResearcher.queryChatGPT(queries.slice(0, 1)); // Just 1 query for testing
    
    console.log('ChatGPT Results:');
    chatGptResults.forEach((result, i) => {
      console.log(`  Query ${i+1}: ${result.content?.length || 0} chars, ${result.citations?.length || 0} citations`);
      if (result.citations && result.citations.length > 0) {
        console.log('  Citations:');
        result.citations.forEach((citation, j) => {
          console.log(`    ${j+1}. ${citation.url}`);
        });
      }
    });
    
    // Step 2: Get search results  
    console.log('\n🔍 Step 2: Getting Google search results...');
    const searchResults = await webSearcher.googleSearch(['martech careers'], null);
    console.log(`Google search: ${searchResults.length} results`);
    searchResults.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i+1}. ${result.title} - ${result.url}`);
    });
    
    // Step 3: Extract URLs to scrape (like server does)
    console.log('\n🔍 Step 3: Collecting URLs to scrape...');
    const urlsToScrape = [];
    
    // From LLM citations
    chatGptResults.forEach(response => {
      if (response.citations) {
        response.citations.forEach(citation => {
          if (citation.url && !urlsToScrape.includes(citation.url)) {
            urlsToScrape.push(citation.url);
          }
        });
      }
    });
    
    // From search results
    searchResults.forEach(result => {
      if (result.url && !urlsToScrape.includes(result.url)) {
        urlsToScrape.push(result.url);
      }
    });
    
    console.log(`Total URLs to scrape: ${urlsToScrape.length}`);
    urlsToScrape.forEach((url, i) => {
      console.log(`  ${i+1}. ${url}`);
    });
    
    // Step 4: Scrape URLs with detailed monitoring
    if (urlsToScrape.length > 0) {
      console.log('\n🕷️ Step 4: Starting content scraping...');
      console.log('This is where the server gets stuck. Let\'s see what happens...');
      
      const scrapingStart = Date.now();
      let scrapingCompleted = false;
      
      // Set up a monitor to track progress
      const progressInterval = setInterval(() => {
        if (!scrapingCompleted) {
          const elapsed = Date.now() - scrapingStart;
          console.log(`  ⏱️ Scraping in progress... ${Math.floor(elapsed / 1000)}s elapsed`);
        }
      }, 10000); // Log every 10 seconds
      
      try {
        const scrapedContent = await scrapeUrls(urlsToScrape);
        scrapingCompleted = true;
        clearInterval(progressInterval);
        
        const scrapingTime = Date.now() - scrapingStart;
        console.log(`\n✅ Scraping completed in ${Math.floor(scrapingTime / 1000)}s`);
        
        console.log('\n📊 Scraping Results:');
        console.log(`Total results: ${scrapedContent.length}`);
        
        const successful = scrapedContent.filter(content => content.text && content.text.length > 0);
        const failed = scrapedContent.filter(content => !content.text || content.text.length === 0);
        
        console.log(`Successful: ${successful.length}`);
        console.log(`Failed: ${failed.length}`);
        
        console.log('\nSuccessful scrapes:');
        successful.forEach((content, i) => {
          console.log(`  ${i+1}. ${content.url}`);
          console.log(`      Title: ${content.title}`);
          console.log(`      Content: ${content.text.length} chars`);
          console.log(`      Method: ${content.method}`);
        });
        
        if (failed.length > 0) {
          console.log('\nFailed scrapes:');
          failed.forEach((content, i) => {
            console.log(`  ${i+1}. ${content.url}`);
            console.log(`      Error: ${content.error || 'No content retrieved'}`);
            console.log(`      Method: ${content.method}`);
          });
        }
        
      } catch (error) {
        scrapingCompleted = true;
        clearInterval(progressInterval);
        console.log(`\n❌ Scraping failed: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRealScraping().catch(error => {
  console.error('❌ Test failed:', error);
});