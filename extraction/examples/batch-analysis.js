#!/usr/bin/env node

/**
 * Batch Analysis Example
 * 
 * Demonstrates how to analyze multiple URLs in parallel with rate limiting
 * Includes progress tracking, error handling, and results aggregation
 */

import { analyzePage } from '../lib/pageAnalyzer.js';
import { batchCrawl } from '../lib/scraper.js';
import { RateLimiter, ProgressTracker, formatDuration } from '../lib/utils.js';

// Example URLs to analyze
const EXAMPLE_URLS = [
  'https://monday.com/project-management/',
  'https://asana.com/product',
  'https://trello.com/tour',
  'https://basecamp.com/features',
  'https://clickup.com/features'
];

// Analysis configuration
const BATCH_CONFIG = {
  query_text: 'best project management software',
  keyword: 'project management',
  brand_name: 'YourTool',
  brand_domain: 'yourtool.com',
  competitors: [
    { name: 'Monday.com', domain: 'monday.com' },
    { name: 'Asana', domain: 'asana.com' },
    { name: 'Trello', domain: 'trello.com' },
    { name: 'Basecamp', domain: 'basecamp.com' },
    { name: 'ClickUp', domain: 'clickup.com' }
  ],
  options: {
    concurrency: 3,  // Process 3 URLs at a time
    delay: 1000,     // 1 second delay between batches
    enable_fallback: true
  }
};

/**
 * Analyze multiple URLs with rate limiting and progress tracking
 * @param {string[]} urls - URLs to analyze
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} - Batch analysis results
 */
async function batchAnalyze(urls, config = BATCH_CONFIG) {
  console.log('🚀 Starting Batch Analysis');
  console.log(`📄 URLs: ${urls.length}`);
  console.log(`🔍 Query: "${config.query_text}"`);
  console.log(`⚡ Concurrency: ${config.options.concurrency}`);
  
  const startTime = Date.now();
  const results = [];
  const errors = [];
  
  // Initialize rate limiter and progress tracker
  const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  const progress = new ProgressTracker(urls.length, 'Page Analysis');
  
  // Process URLs in chunks for controlled concurrency
  const chunkSize = config.options.concurrency || 3;
  
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    console.log(`\n📦 Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(urls.length/chunkSize)}`);
    
    // Process chunk in parallel
    const chunkPromises = chunk.map(async (url, index) => {
      const globalIndex = i + index;
      
      try {
        // Rate limiting
        await rateLimiter.waitIfNeeded();
        
        console.log(`🔄 [${globalIndex + 1}/${urls.length}] Starting: ${url}`);
        
        // Create analysis request
        const analysisRequest = {
          citation_url: url,
          citation_position: globalIndex + 1,
          ...config
        };
        
        // Run analysis
        const result = await analyzePage(analysisRequest);
        
        console.log(`✅ [${globalIndex + 1}/${urls.length}] Completed: ${url}`);
        progress.increment();
        
        return {
          url,
          success: true,
          result,
          index: globalIndex
        };
        
      } catch (error) {
        console.error(`❌ [${globalIndex + 1}/${urls.length}] Failed: ${url} - ${error.message}`);
        progress.increment(true);
        
        return {
          url,
          success: false,
          error: error.message,
          index: globalIndex
        };
      }
    });
    
    // Wait for chunk to complete
    const chunkResults = await Promise.all(chunkPromises);
    
    // Separate successful results from errors
    for (const result of chunkResults) {
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    }
    
    // Rate limiting delay between chunks
    if (i + chunkSize < urls.length && config.options.delay) {
      console.log(`⏱️ Rate limiting delay: ${config.options.delay}ms`);
      await new Promise(resolve => setTimeout(resolve, config.options.delay));
    }
  }
  
  progress.complete();
  
  const duration = Date.now() - startTime;
  const successRate = (results.length / urls.length) * 100;
  
  console.log(`\n📊 BATCH ANALYSIS SUMMARY`);
  console.log(`⏱️ Total time: ${formatDuration(duration)}`);
  console.log(`✅ Successful: ${results.length}/${urls.length} (${successRate.toFixed(1)}%)`);
  console.log(`❌ Failed: ${errors.length}/${urls.length}`);
  
  return {
    results,
    errors,
    duration,
    successRate,
    totalUrls: urls.length,
    summary: generateBatchSummary(results)
  };
}

/**
 * Generate summary statistics from batch results
 * @param {Array} results - Successful analysis results
 * @returns {Object} - Summary statistics
 */
function generateBatchSummary(results) {
  if (results.length === 0) {
    return { message: 'No successful analyses to summarize' };
  }
  
  const analyses = results.map(r => r.result);
  
  // Aggregate scores
  const scores = {
    content_depth: [],
    content_uniqueness: [],
    eeat_scores: [],
    citation_match: [],
    relevance: []
  };
  
  // Domain classifications
  let clientDomains = 0;
  let competitorDomains = 0;
  
  // Brand mentions
  let brandMentions = 0;
  let competitorMentions = 0;
  
  // Content types
  const contentTypes = {};
  const rockPaperScissors = {};
  
  // SEO features
  let hasSchema = 0;
  let mobileFriendly = 0;
  
  for (const analysis of analyses) {
    // Collect scores
    if (analysis.content_quality?.content_depth_score) {
      scores.content_depth.push(analysis.content_quality.content_depth_score);
    }
    if (analysis.content_quality?.content_uniqueness) {
      scores.content_uniqueness.push(analysis.content_quality.content_uniqueness);
    }
    if (analysis.eeat_score) {
      scores.eeat_scores.push(analysis.eeat_score);
    }
    if (analysis.content_quality?.citation_match_quality) {
      scores.citation_match.push(analysis.content_quality.citation_match_quality);
    }
    if (analysis.relevance_score) {
      scores.relevance.push(analysis.relevance_score);
    }
    
    // Domain classifications
    if (analysis.is_client_domain) clientDomains++;
    if (analysis.is_competitor_domain) competitorDomains++;
    
    // Brand and competitor mentions
    if (analysis.brand_mentioned) brandMentions++;
    if (analysis.competitor_mentioned) competitorMentions++;
    
    // Content analysis
    const contentType = analysis.on_page_seo?.content_type || 'Unknown';
    contentTypes[contentType] = (contentTypes[contentType] || 0) + 1;
    
    const rps = analysis.content_quality?.rock_paper_scissors || 'Unknown';
    rockPaperScissors[rps] = (rockPaperScissors[rps] || 0) + 1;
    
    // SEO features
    if (analysis.technical_seo?.schema_markup_present) hasSchema++;
    if (analysis.technical_seo?.mobile_friendly) mobileFriendly++;
  }
  
  // Calculate averages
  const averages = {};
  for (const [key, values] of Object.entries(scores)) {
    if (values.length > 0) {
      averages[key] = {
        average: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }
  }
  
  return {
    total_analyzed: results.length,
    
    // Score averages
    score_averages: averages,
    
    // Domain analysis
    domain_classification: {
      client_domains: clientDomains,
      competitor_domains: competitorDomains,
      neutral_domains: results.length - clientDomains - competitorDomains
    },
    
    // Brand analysis
    brand_analysis: {
      pages_with_brand_mentions: brandMentions,
      pages_with_competitor_mentions: competitorMentions,
      brand_mention_rate: ((brandMentions / results.length) * 100).toFixed(1) + '%',
      competitor_mention_rate: ((competitorMentions / results.length) * 100).toFixed(1) + '%'
    },
    
    // Content analysis
    content_analysis: {
      content_types: contentTypes,
      content_classification: rockPaperScissors
    },
    
    // SEO analysis
    seo_analysis: {
      pages_with_schema: hasSchema,
      mobile_friendly_pages: mobileFriendly,
      schema_adoption_rate: ((hasSchema / results.length) * 100).toFixed(1) + '%',
      mobile_friendly_rate: ((mobileFriendly / results.length) * 100).toFixed(1) + '%'
    }
  };
}

/**
 * Display batch summary results
 * @param {Object} batchResult - Result from batchAnalyze
 */
function displayBatchSummary(batchResult) {
  const { summary } = batchResult;
  
  if (summary.message) {
    console.log(`\n⚠️ ${summary.message}`);
    return;
  }
  
  console.log(`\n📈 DETAILED ANALYSIS SUMMARY`);
  console.log('='.repeat(50));
  
  // Score averages
  console.log(`\n📊 AVERAGE SCORES`);
  Object.entries(summary.score_averages).forEach(([key, stats]) => {
    console.log(`${key.replace('_', ' ').toUpperCase()}: ${stats.average}/10 (range: ${stats.min}-${stats.max})`);
  });
  
  // Domain classification
  console.log(`\n🏷️ DOMAIN CLASSIFICATION`);
  const domainStats = summary.domain_classification;
  console.log(`Client domains: ${domainStats.client_domains}`);
  console.log(`Competitor domains: ${domainStats.competitor_domains}`);
  console.log(`Neutral domains: ${domainStats.neutral_domains}`);
  
  // Brand analysis
  console.log(`\n🏢 BRAND ANALYSIS`);
  const brandStats = summary.brand_analysis;
  console.log(`Pages mentioning brand: ${brandStats.pages_with_brand_mentions} (${brandStats.brand_mention_rate})`);
  console.log(`Pages mentioning competitors: ${brandStats.pages_with_competitor_mentions} (${brandStats.competitor_mention_rate})`);
  
  // Content types
  console.log(`\n📝 CONTENT TYPES`);
  Object.entries(summary.content_analysis.content_types).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
  
  // Content classification
  console.log(`\n🧩 CONTENT CLASSIFICATION`);
  Object.entries(summary.content_analysis.content_classification).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });
  
  // SEO analysis
  console.log(`\n🔧 SEO FEATURES`);
  const seoStats = summary.seo_analysis;
  console.log(`Schema markup: ${seoStats.pages_with_schema} pages (${seoStats.schema_adoption_rate})`);
  console.log(`Mobile friendly: ${seoStats.mobile_friendly_pages} pages (${seoStats.mobile_friendly_rate})`);
}

/**
 * Export results to JSON file
 * @param {Object} batchResult - Batch analysis result
 * @param {string} filename - Output filename
 */
function exportResults(batchResult, filename = 'batch-analysis-results.json') {
  const fs = require('fs');
  
  try {
    fs.writeFileSync(filename, JSON.stringify(batchResult, null, 2));
    console.log(`\n💾 Results exported to: ${filename}`);
  } catch (error) {
    console.error(`❌ Export failed: ${error.message}`);
  }
}

// Run batch analysis if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 BATCH ANALYSIS EXAMPLE');
  console.log('='.repeat(50));
  
  // Check environment variables
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.error('❌ SCRAPINGBEE_API_KEY environment variable is required');
    console.log('💡 Set your API key: export SCRAPINGBEE_API_KEY="your_key_here"');
    process.exit(1);
  }
  
  // Run batch analysis
  batchAnalyze(EXAMPLE_URLS, BATCH_CONFIG)
    .then(result => {
      console.log('\n🎉 Batch analysis completed!');
      
      // Display summary
      displayBatchSummary(result);
      
      // Show individual errors if any
      if (result.errors.length > 0) {
        console.log(`\n❌ FAILED ANALYSES (${result.errors.length})`);
        result.errors.forEach(error => {
          console.log(`   ${error.url}: ${error.error}`);
        });
      }
      
      // Export results
      exportResults(result);
      
      console.log('\n✨ Batch analysis example completed!');
      console.log('\n📚 Next steps:');
      console.log('   - Review the exported JSON file for detailed results');
      console.log('   - Customize the URL list and configuration');
      console.log('   - Integrate batch analysis into your workflow');
    })
    .catch(error => {
      console.error('\n💥 Batch analysis failed:', error.message);
      process.exit(1);
    });
}

export { batchAnalyze, generateBatchSummary, displayBatchSummary, exportResults, EXAMPLE_URLS, BATCH_CONFIG };