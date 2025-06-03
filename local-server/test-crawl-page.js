/**
 * Test script for enhanced crawlPage with detailed logging
 * 
 * Usage:
 *   node test-crawl-page.js <url>
 * 
 * Example:
 *   node test-crawl-page.js https://knak.com/blog/email-template-builders-scale-personalization/
 */

import dotenv from 'dotenv';
import { crawlPage } from './lib/crawlPage.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const url = process.argv[2];

if (!url) {
  console.error('❌ ERROR: URL is required');
  console.error('Usage: node test-crawl-page.js <url>');
  process.exit(1);
}

// Verify ScrapingBee API key
if (!process.env.SCRAPINGBEE_API_KEY) {
  console.error('❌ ERROR: SCRAPINGBEE_API_KEY environment variable is not set');
  console.error('Please add it to your .env file');
  process.exit(1);
}

// Run the test
console.log(`\n🧪 TEST CRAWL PAGE: Starting test for ${url}`);
console.log(`📅 DATE: ${new Date().toISOString()}`);
console.log(`🔑 API KEYS PRESENT: ScrapingBee=${!!process.env.SCRAPINGBEE_API_KEY}`);

async function runTest() {
  try {
    console.log(`\n🚀 TEST: Calling crawlPage function for ${url}`);
    const startTime = Date.now();
    
    // Call the crawlPage function
    const result = await crawlPage(url);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n✅ TEST COMPLETED in ${duration}ms`);
    console.log(`📊 RESULT SUMMARY:`);
    console.log(`  - Success: ${result.success}`);
    console.log(`  - Status code: ${result.statusCode}`);
    console.log(`  - Source: ${result.source}`);
    console.log(`  - HTML size: ${result.size} bytes`);
    console.log(`  - Text content: ${result.textContent?.length || 0} characters`);
    console.log(`  - Duration: ${result.duration}ms`);
    
    // Output HTML preview
    if (result.html) {
      const previewLength = Math.min(result.html.length, 300);
      console.log(`\n📄 HTML PREVIEW (first 300 chars):`);
      console.log(`${result.html.substring(0, previewLength)}...`);
    }
    
    // Output text content preview
    if (result.textContent) {
      const previewLength = Math.min(result.textContent.length, 300);
      console.log(`\n📝 TEXT CONTENT PREVIEW (first 300 chars):`);
      console.log(`${result.textContent.substring(0, previewLength)}...`);
    }
    
    console.log(`\n🏁 TEST COMPLETE: Crawl successful`);
    
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
  }
}

// Run the test
runTest().catch(console.error);