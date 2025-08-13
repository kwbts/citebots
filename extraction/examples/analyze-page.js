#!/usr/bin/env node

/**
 * Single Page Analysis Example
 * 
 * Demonstrates how to analyze a single web page with the extraction library
 * Includes brand analysis, competitor detection, and comprehensive SEO metrics
 */

import { analyzePage } from '../lib/pageAnalyzer.js';
import { extractCitations } from '../lib/citationExtractor.js';
import { formatBytes, formatDuration } from '../lib/utils.js';

// Example configuration
const EXAMPLE_CONFIG = {
  citation_url: 'https://blog.monday.com/project-management-software/',
  citation_position: 1,
  query_text: 'best project management software for teams',
  keyword: 'project management software',
  brand_name: 'WorkflowMax',
  brand_domain: 'workflowmax.com',
  competitors: [
    { name: 'Monday.com', domain: 'monday.com' },
    { name: 'Asana', domain: 'asana.com' },
    { name: 'Trello', domain: 'trello.com' },
    { name: 'Jira', domain: 'atlassian.com' }
  ],
  options: {
    // Enable JavaScript rendering if needed
    render_js: false,
    // Use premium proxy if basic fails
    enable_fallback: true
  }
};

/**
 * Format analysis results for display
 * @param {Object} result - Analysis result
 * @returns {Object} - Formatted result
 */
function formatResults(result) {
  return {
    // Basic Information
    url: result.citation_url,
    title: result.page_title,
    domain: result.domain_name,
    
    // Classification
    is_client_domain: result.is_client_domain,
    is_competitor_domain: result.is_competitor_domain,
    
    // Content Metrics
    word_count: result.on_page_seo?.word_count || 0,
    content_type: result.on_page_seo?.content_type || 'Unknown',
    
    // Quality Scores (1-10 scale)
    scores: {
      content_depth: result.content_quality?.content_depth_score || 0,
      content_uniqueness: result.content_quality?.content_uniqueness || 0,
      eeat_score: result.eeat_score || 0,
      citation_match: result.content_quality?.citation_match_quality || 0,
      relevance: result.relevance_score || 0,
      html_structure: result.technical_seo?.html_structure_score || 0
    },
    
    // SEO Elements
    seo: {
      has_schema: result.technical_seo?.schema_markup_present || false,
      mobile_friendly: result.technical_seo?.mobile_friendly || false,
      has_meta_description: result.technical_seo?.meta_description_present || false,
      heading_structure: result.on_page_seo?.heading_count_type || {},
      keyword_matches: result.on_page_seo?.keyword_match || []
    },
    
    // Brand & Competitor Analysis
    brand_analysis: {
      brand_mentioned: result.brand_mentioned,
      brand_mention_count: result.brand_mention_count,
      brand_in_title: result.brand_in_title
    },
    
    competitor_analysis: {
      competitor_mentioned: result.competitor_mentioned,
      competitor_names: result.competitor_names || [],
      total_competitors: (result.competitor_names || []).length
    },
    
    // Content Classification
    content_analysis: {
      rock_paper_scissors: result.content_quality?.rock_paper_scissors || 'Unknown',
      topical_cluster: result.content_quality?.topical_cluster || 'General',
      has_statistics: result.content_quality?.has_statistics || false,
      has_research: result.content_quality?.has_research || false
    },
    
    // Technical Details
    crawl_info: {
      method: result.crawl_result?.method || 'unknown',
      status_code: result.crawl_result?.status_code || 0,
      html_size: result.crawl_result?.html_length || 0,
      duration: result.crawl_result?.duration || 0,
      success: result.crawl_result?.success || false,
      error: result.crawl_error || null
    }
  };
}

/**
 * Display results in a formatted table
 * @param {Object} formatted - Formatted results
 */
function displayResults(formatted) {
  console.log('\n📊 ANALYSIS RESULTS');
  console.log('='.repeat(50));
  
  // Basic Info
  console.log(`\n🌐 PAGE INFORMATION`);
  console.log(`URL: ${formatted.url}`);
  console.log(`Title: ${formatted.title}`);
  console.log(`Domain: ${formatted.domain}`);
  console.log(`Content Type: ${formatted.content_type}`);
  console.log(`Word Count: ${formatted.word_count.toLocaleString()}`);
  
  // Classification
  console.log(`\n🏷️ CLASSIFICATION`);
  console.log(`Client Domain: ${formatted.is_client_domain ? '✅ Yes' : '❌ No'}`);
  console.log(`Competitor Domain: ${formatted.is_competitor_domain ? '✅ Yes' : '❌ No'}`);
  
  // Quality Scores
  console.log(`\n📈 QUALITY SCORES (1-10 scale)`);
  Object.entries(formatted.scores).forEach(([key, value]) => {
    const emoji = value >= 8 ? '🟢' : value >= 6 ? '🟡' : '🔴';
    console.log(`${emoji} ${key.replace('_', ' ').toUpperCase()}: ${value}/10`);
  });
  
  // SEO Analysis
  console.log(`\n🔧 SEO ANALYSIS`);
  console.log(`Schema Markup: ${formatted.seo.has_schema ? '✅' : '❌'}`);
  console.log(`Mobile Friendly: ${formatted.seo.mobile_friendly ? '✅' : '❌'}`);
  console.log(`Meta Description: ${formatted.seo.has_meta_description ? '✅' : '❌'}`);
  console.log(`Heading Structure: H1=${formatted.seo.heading_structure.h1}, H2=${formatted.seo.heading_structure.h2}, H3=${formatted.seo.heading_structure.h3}`);
  console.log(`Keyword Matches: ${formatted.seo.keyword_matches.join(', ') || 'None'}`);
  
  // Brand Analysis
  console.log(`\n🏢 BRAND ANALYSIS`);
  console.log(`Brand Mentioned: ${formatted.brand_analysis.brand_mentioned ? '✅ Yes' : '❌ No'}`);
  if (formatted.brand_analysis.brand_mentioned) {
    console.log(`Mention Count: ${formatted.brand_analysis.brand_mention_count}`);
    console.log(`In Title: ${formatted.brand_analysis.brand_in_title ? '✅ Yes' : '❌ No'}`);
  }
  
  // Competitor Analysis
  console.log(`\n🥇 COMPETITOR ANALYSIS`);
  console.log(`Competitors Mentioned: ${formatted.competitor_analysis.competitor_mentioned ? '✅ Yes' : '❌ No'}`);
  if (formatted.competitor_analysis.competitor_mentioned) {
    console.log(`Competitor Count: ${formatted.competitor_analysis.total_competitors}`);
    console.log(`Competitors: ${formatted.competitor_analysis.competitor_names.join(', ')}`);
  }
  
  // Content Analysis
  console.log(`\n📝 CONTENT ANALYSIS`);
  console.log(`Content Type: ${formatted.content_analysis.rock_paper_scissors}`);
  console.log(`Topic Cluster: ${formatted.content_analysis.topical_cluster}`);
  console.log(`Has Statistics: ${formatted.content_analysis.has_statistics ? '✅' : '❌'}`);
  console.log(`Has Research: ${formatted.content_analysis.has_research ? '✅' : '❌'}`);
  
  // Technical Details
  console.log(`\n⚙️ CRAWL INFORMATION`);
  console.log(`Method: ${formatted.crawl_info.method.toUpperCase()}`);
  console.log(`Status: ${formatted.crawl_info.status_code} ${formatted.crawl_info.success ? '✅' : '❌'}`);
  console.log(`Size: ${formatBytes(formatted.crawl_info.html_size)}`);
  console.log(`Duration: ${formatDuration(formatted.crawl_info.duration)}`);
  
  if (formatted.crawl_info.error) {
    console.log(`⚠️ Crawl Error: ${formatted.crawl_info.error}`);
  }
}

/**
 * Main analysis function
 */
async function runAnalysis(config = EXAMPLE_CONFIG) {
  console.log('🚀 Starting Single Page Analysis');
  console.log(`📄 Analyzing: ${config.citation_url}`);
  console.log(`🔍 Query: "${config.query_text}"`);
  console.log(`🏷️ Keyword: "${config.keyword}"`);
  console.log(`🏢 Brand: ${config.brand_name} (${config.brand_domain})`);
  console.log(`🥇 Competitors: ${config.competitors.map(c => c.name).join(', ')}`);
  
  const startTime = Date.now();
  
  try {
    // Run page analysis
    console.log('\n⏳ Running comprehensive page analysis...');
    const result = await analyzePage(config);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Analysis completed in ${formatDuration(duration)}`);
    
    // Format and display results
    const formatted = formatResults(result);
    displayResults(formatted);
    
    // Return full result for programmatic use
    return {
      success: true,
      result,
      formatted,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Analysis failed after ${formatDuration(duration)}: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      duration
    };
  }
}

/**
 * Citation extraction example
 */
async function citationExample() {
  console.log('\n🔗 CITATION EXTRACTION EXAMPLE');
  console.log('='.repeat(50));
  
  // Example ChatGPT response
  const chatGptResponse = {
    choices: [{
      message: {
        content: `Here are the best project management tools for teams:

1. **Monday.com** - Great for visual project tracking [1]
2. **Asana** - Excellent for task management [2]  
3. **Trello** - Simple kanban-style boards [3]

References:
[1] https://monday.com/features
[2] https://asana.com/product
[3] https://trello.com/tour`
      }
    }]
  };
  
  const citations = extractCitations(chatGptResponse, 'chatgpt');
  
  console.log(`Found ${citations.length} citations:`);
  citations.forEach((citation, index) => {
    console.log(`${index + 1}. ${citation.title}`);
    console.log(`   URL: ${citation.url}`);
    console.log(`   Domain: ${citation.domain}`);
    console.log(`   Source: ${citation.source}`);
    console.log('');
  });
}

// Run examples if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 EXTRACTION LIBRARY EXAMPLES');
  console.log('='.repeat(50));
  
  // Check environment variables
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.error('❌ SCRAPINGBEE_API_KEY environment variable is required');
    console.log('💡 Set your API key: export SCRAPINGBEE_API_KEY="your_key_here"');
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not found - AI analysis will use default values');
  }
  
  // Run page analysis example
  runAnalysis()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Page analysis example completed successfully!');
        
        // Run citation extraction example
        return citationExample();
      } else {
        console.error('\n💥 Page analysis example failed');
        process.exit(1);
      }
    })
    .then(() => {
      console.log('\n✨ All examples completed!');
      console.log('\n📚 Next steps:');
      console.log('   - Try batch-analysis.js for multiple URLs');
      console.log('   - Customize the configuration for your use case');
      console.log('   - Integrate the library into your project');
    })
    .catch(error => {
      console.error('\n💥 Example failed:', error.message);
      process.exit(1);
    });
}

export { runAnalysis, citationExample, formatResults, EXAMPLE_CONFIG };