#!/usr/bin/env node

/**
 * Debug what URLs are being scraped and where it's failing
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { scrapeUrls } = require('./lib/contentScraper');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function debugScraping(briefId) {
  console.log(`🔍 DEBUGGING SCRAPING FOR BRIEF: ${briefId}`);
  console.log('=' .repeat(60));
  
  try {
    // Get the brief data
    const { data: brief, error } = await supabase
      .from('content_briefs')
      .select('*')
      .eq('id', briefId)
      .single();
    
    if (error) {
      console.log('❌ Error fetching brief:', error.message);
      return;
    }
    
    console.log('📊 Brief:', brief.title);
    console.log('Status:', brief.status);
    
    // Check if we have research data to extract URLs from
    if (brief.research_data) {
      console.log('\n📋 Research Data Available:');
      const researchData = brief.research_data;
      
      // Extract URLs that would be scraped
      const urlsToScrape = [];
      
      // From LLM responses
      if (researchData.llm_responses) {
        console.log(`LLM Responses: ${researchData.llm_responses.length}`);
        researchData.llm_responses.forEach((response, i) => {
          console.log(`  Response ${i+1}: ${response.platform}, ${response.citations?.length || 0} citations`);
          if (response.citations) {
            response.citations.forEach(citation => {
              if (citation.url && !urlsToScrape.includes(citation.url)) {
                urlsToScrape.push(citation.url);
              }
            });
          }
        });
      }
      
      // From search results
      if (researchData.search_results) {
        console.log(`Search Results: ${researchData.search_results.length}`);
        researchData.search_results.forEach(result => {
          if (result.url && !urlsToScrape.includes(result.url)) {
            urlsToScrape.push(result.url);
          }
        });
      }
      
      console.log(`\n🌐 Total URLs to scrape: ${urlsToScrape.length}`);
      
      if (urlsToScrape.length > 0) {
        console.log('\nURLs:');
        urlsToScrape.slice(0, 10).forEach((url, i) => {
          console.log(`  ${i+1}. ${url}`);
        });
        if (urlsToScrape.length > 10) {
          console.log(`  ... and ${urlsToScrape.length - 10} more`);
        }
        
        // Test scraping a small sample
        console.log('\n🧪 Testing scraping first 3 URLs...');
        const testUrls = urlsToScrape.slice(0, 3);
        
        try {
          const scrapingStart = Date.now();
          const scrapedContent = await scrapeUrls(testUrls);
          const scrapingTime = Date.now() - scrapingStart;
          
          console.log(`✅ Scraping completed in ${scrapingTime}ms`);
          console.log('Results:');
          scrapedContent.forEach((content, i) => {
            console.log(`  ${i+1}. ${content.url}`);
            console.log(`      Title: ${content.title}`);
            console.log(`      Content: ${content.text?.length || 0} chars`);
            console.log(`      Method: ${content.method}`);
            if (content.error) {
              console.log(`      ❌ Error: ${content.error}`);
            }
          });
          
        } catch (scrapingError) {
          console.log(`❌ Scraping failed: ${scrapingError.message}`);
          console.log(`Stack: ${scrapingError.stack}`);
        }
      }
    } else {
      console.log('\n❌ No research data found - brief may not have completed LLM research phase');
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

// Use the stuck brief ID
const briefId = process.argv[2] || "db9ae15d-7581-41fc-8600-ab068ab93a99";
debugScraping(briefId).catch(error => {
  console.error('❌ Debug failed:', error);
});