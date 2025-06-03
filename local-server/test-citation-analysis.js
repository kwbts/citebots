/**
 * Test script for enhanced citation analysis with detailed logging
 * 
 * Usage:
 *   node test-citation-analysis.js <url> [--save]
 * 
 * Example:
 *   node test-citation-analysis.js https://knak.com/blog/email-template-builders-scale-personalization/ --save
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { analyzeCitation } from './lib/analyzeCitation.js';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Parse command line arguments
const url = process.argv[2];
const saveResults = process.argv.includes('--save');

if (!url) {
  console.error('❌ ERROR: URL is required');
  console.error('Usage: node test-citation-analysis.js <url> [--save]');
  process.exit(1);
}

// Verify required API keys
if (!process.env.SCRAPINGBEE_API_KEY) {
  console.error('❌ ERROR: SCRAPINGBEE_API_KEY environment variable is not set');
  console.error('Please add it to your .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️ WARNING: OPENAI_API_KEY environment variable is not set');
  console.error('AI content analysis will be skipped or use default values');
}

// Run the test
console.log(`\n🧪 TEST CITATION ANALYSIS: Starting test for ${url}`);
console.log(`📅 DATE: ${new Date().toISOString()}`);
console.log(`🔑 API KEYS PRESENT:`);
console.log(`  - ScrapingBee: ${!!process.env.SCRAPINGBEE_API_KEY ? '✅ Yes' : '❌ No'}`);
console.log(`  - OpenAI: ${!!process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No'}`);
console.log(`  - PageSpeed: ${!!process.env.PAGESPEED_API_KEY ? '✅ Yes' : '❌ No'}`);
console.log(`  - Supabase: ${!!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) ? '✅ Yes' : '❌ No'}`);

async function runTest() {
  try {
    console.log(`\n🚀 TEST: Starting citation analysis for ${url}`);
    const startTime = Date.now();

    // Generate a proper UUID for the test query_id to satisfy database constraints
    const testQueryId = uuidv4();
    console.log(`📝 USING TEST QUERY ID (UUID): ${testQueryId}`);

    // Prepare the analysis request
    const analysisRequest = {
      citation_url: url,
      citation_position: 1,
      query_text: 'Test citation analysis for comprehensive diagnostics',
      keyword: 'citation analysis',
      brand_name: 'Example Brand',
      brand_domain: 'example.com',
      query_id: testQueryId, // Add the test query ID
      competitors: [
        { name: 'Competitor A', domain: 'competitora.com' },
        { name: 'Competitor B', domain: 'competitorb.com' }
      ],
      options: {
        enhanced: true,
        verbose: true,
        // Use API keys if available
        pagespeed: !!process.env.PAGESPEED_API_KEY,
        moz: true
      }
    };
    
    // If Supabase is not configured, we'll skip database operations
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.log(`⚠️ WARNING: Supabase not configured, will run analysis without database operations`);
      // Create a modified version of analyzeCitation that doesn't require Supabase
      const result = await runAnalysisWithoutDb(analysisRequest);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`\n✅ TEST COMPLETED in ${duration}ms`);

      // Save results to file if requested
      if (saveResults) {
        const filename = `analysis-${new URL(url).hostname.replace(/\./g, '_')}-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log(`💾 RESULTS SAVED: ${filename}`);
      }

      console.log(`\n🏁 TEST COMPLETE: Analysis successful`);
    } else {
      // Make sure we have a query in the database first
      console.log(`\n🧠 RUNNING FULL ANALYSIS: With database operations`);

      try {
        console.log(`\n🔍 SUPABASE: Checking if we need to create a test query record`);
        // Try to insert a test query record first to meet foreign key constraints
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY,
          { auth: { persistSession: false } }
        );

        // Check if test query already exists
        const { data: existingQuery, error: queryCheckError } = await supabase
          .from('analysis_queries')
          .select('id')
          .eq('id', analysisRequest.query_id)
          .single();

        if (queryCheckError && !existingQuery) {
          console.log(`📝 SUPABASE: Creating test query record with ID: ${analysisRequest.query_id}`);
          // Create a test query record
          const { data: queryData, error: queryError } = await supabase
            .from('analysis_queries')
            .insert({
              id: analysisRequest.query_id,
              analysis_run_id: uuidv4(), // Use UUID for run ID as well
              query_text: analysisRequest.query_text,
              query_keyword: analysisRequest.keyword,
              data_source: 'test',
              status: 'completed'
            })
            .select()
            .single();

          if (queryError) {
            console.error(`❌ SUPABASE ERROR: Failed to create test query: ${queryError.message}`);
            // Continue anyway, as the query might exist already
          } else {
            console.log(`✅ SUPABASE: Test query created successfully`);
          }
        } else {
          console.log(`ℹ️ SUPABASE: Test query already exists, using existing record`);
        }
      } catch (dbSetupError) {
        console.error(`❌ SUPABASE SETUP ERROR: ${dbSetupError.message}`);
        // Continue with analysis anyway
      }

      // Run the regular analyzeCitation function
      const result = await analyzeCitation(analysisRequest);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`\n✅ TEST COMPLETED in ${duration}ms`);

      // Save results to file if requested
      if (saveResults) {
        const filename = `analysis-${new URL(url).hostname.replace(/\./g, '_')}-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log(`💾 RESULTS SAVED: ${filename}`);
      }

      console.log(`\n🏁 TEST COMPLETE: Analysis successful`);
    }
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
  }
}

// Modified version of analyzeCitation that doesn't require Supabase
async function runAnalysisWithoutDb(requestData) {
  const {
    citation_url,
    citation_position,
    query_text,
    keyword,
    brand_name,
    brand_domain,
    competitors = [],
    options = {}
  } = requestData;

  console.log(`\n==========================================================`);
  console.log(`🔍 CITATION ANALYSIS: Starting analysis of ${citation_url}`);
  console.log(`📊 ANALYSIS CONTEXT: Query: "${query_text}", Keyword: "${keyword}"`);
  console.log(`📋 ANALYSIS DETAILS: Citation position: ${citation_position}, Client: ${brand_name || 'None'}`);
  console.log(`⚙️ ANALYSIS OPTIONS: ${JSON.stringify(options, null, 2)}`);
  console.log(`==========================================================\n`);

  try {
    // Configure options for enhanced analysis
    const analysisOptions = {
      ...options,
      // Enable optional API integrations based on configuration
      pagespeed: !!process.env.PAGESPEED_API_KEY || !!process.env.GOOGLE_PAGESPEED_API_KEY,
      moz: true, // Use smart domain metrics system
      verbose: true // Enable verbose logging
    };

    // Prepare analysis request
    const analysisRequest = {
      citation_url,
      citation_position,
      query_text,
      keyword,
      brand_name,
      brand_domain,
      competitors,
      options: analysisOptions
    };

    console.log(`\n🧠 ANALYSIS: Starting comprehensive page analysis for ${citation_url}`);

    // Import analyzePage directly
    const { analyzePage } = await import('./lib/pageAnalyzer.js');
    
    // Use our enhanced page analyzer to get full analysis
    const pageAnalysisResult = await analyzePage(analysisRequest);

    // Generate a unique ID for the analysis
    const domain = pageAnalysisResult.domain_name;
    const pageAnalysisId = domain.replace(/\./g, '_') + '_' + Date.now();
    console.log(`📝 ANALYSIS ID: Generated ${pageAnalysisId} for ${domain}`);

    // Create the page analysis record but don't save to database
    const pageAnalysisRecord = {
      ...pageAnalysisResult,
      query_id: 'test-query-id',
      page_analysis_id: pageAnalysisId
    };

    console.log(`\n✅ ANALYSIS COMPLETE: Not saving to database (Supabase not configured)`);
    console.log(`\n==========================================================`);
    console.log(`✅ CITATION ANALYSIS COMPLETE: ${citation_url}`);
    console.log(`🔢 RESULT SUMMARY:`);
    console.log(`  - Technical SEO Score: ${pageAnalysisResult.technical_seo?.html_structure_score || 'N/A'}/10`);
    console.log(`  - Content Depth Score: ${pageAnalysisResult.content_quality?.content_depth_score || 'N/A'}/5`);
    console.log(`  - Page Relevance: ${pageAnalysisResult.page_analysis?.page_relevance_type || 'N/A'}`);
    console.log(`  - Citation Match Quality: ${pageAnalysisResult.content_quality?.citation_match_quality || 'N/A'}/5`);
    console.log(`  - Brand Mentioned: ${pageAnalysisResult.brand_mentioned ? 'Yes' : 'No'}`);
    console.log(`==========================================================\n`);
    
    return pageAnalysisRecord;

  } catch (error) {
    console.error(`\n❌ CITATION ANALYSIS ERROR: ${error.message}`);
    console.error(`🚨 Error analyzing citation ${citation_url}`);
    console.error(`🔄 STACK TRACE: ${error.stack}`);
    console.error(`==========================================================\n`);
    throw error;
  }
}

// Run the test
runTest().catch(console.error);