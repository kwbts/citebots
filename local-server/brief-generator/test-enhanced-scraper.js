#!/usr/bin/env node

/**
 * Test the enhanced scraper to see where it hangs
 */

require('dotenv').config();
const enhancedScraper = require('./lib/enhancedScraper');

async function testEnhancedScraper() {
  console.log('🧪 TESTING ENHANCED SCRAPER');
  console.log('=' .repeat(50));
  
  // Use the same URLs that would be generated
  const testUrls = [
    'https://www.hubspot.com/state-of-marketing',
    'https://martech.org/the-latest-jobs-in-martech/',
    'https://www.coursera.org/articles/martech'
  ];
  
  console.log('Testing URLs:');
  testUrls.forEach((url, i) => {
    console.log(`  ${i+1}. ${url}`);
  });
  
  console.log('\n🕷️ Starting enhanced scraping...');
  
  const startTime = Date.now();
  let completed = false;
  
  // Monitor progress
  const progressInterval = setInterval(() => {
    if (!completed) {
      const elapsed = Date.now() - startTime;
      console.log(`  ⏱️ Enhanced scraping in progress... ${Math.floor(elapsed / 1000)}s elapsed`);
    }
  }, 10000); // Log every 10 seconds
  
  try {
    const options = {
      extractLinks: true,
      linkDepth: 1,
      maxLinksPerPage: 3,
      sameDomainOnly: false
    };
    
    const results = await enhancedScraper.enhancedScrape(testUrls, options);
    completed = true;
    clearInterval(progressInterval);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Enhanced scraping completed in ${Math.floor(totalTime / 1000)}s`);
    
    console.log('\n📊 Results:');
    console.log(`Primary pages: ${results.crawlStats.primaryPages}`);
    console.log(`Secondary pages: ${results.crawlStats.secondaryPages}`);
    console.log(`Total pages: ${results.crawlStats.totalPages}`);
    console.log(`Extracted links: ${results.extractedLinks.length}`);
    console.log(`Total links found: ${results.crawlStats.totalLinksFound}`);
    
    console.log('\nExtracted Links:');
    results.extractedLinks.slice(0, 10).forEach((link, i) => {
      console.log(`  ${i+1}. ${link}`);
    });
    
  } catch (error) {
    completed = true;
    clearInterval(progressInterval);
    console.log(`\n❌ Enhanced scraping failed: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

testEnhancedScraper().catch(error => {
  console.error('❌ Test failed:', error);
});