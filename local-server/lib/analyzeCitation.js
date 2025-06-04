import { createClient } from '@supabase/supabase-js';
import { analyzePage } from './pageAnalyzer.js';
import { crawlPage } from './crawlPage.js';

/**
 * Main citation analysis function with enhanced logging
 * @param {Object} requestData - Data for the citation analysis
 * @returns {Object} - Analysis results
 */
export async function analyzeCitation(requestData) {
  const {
    query_id,
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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );

  try {
    // Check Supabase connection
    console.log(`🔌 DATABASE: Checking Supabase connection...`);
    const { data: connectionTest, error: connectionError } = await supabase.from('page_analyses').select('id').limit(1);

    if (connectionError) {
      console.error(`❌ DATABASE ERROR: Failed to connect to Supabase: ${connectionError.message}`);
      console.error(`🛠️ RESOLUTION: Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables`);
    } else {
      console.log(`✅ DATABASE: Supabase connection successful`);
    }

    // Configure options for enhanced analysis
    const analysisOptions = {
      ...options,
      // Enable optional API integrations based on configuration
      pagespeed: !!process.env.PAGESPEED_API_KEY || !!process.env.GOOGLE_PAGESPEED_API_KEY,
      moz: true, // Use our smart domain metrics system
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

    // Use our enhanced page analyzer to get full analysis
    const pageAnalysisResult = await analyzePage(analysisRequest);

    // Generate a unique ID for the analysis
    const domain = pageAnalysisResult.domain_name;
    const pageAnalysisId = domain.replace(/\./g, '_') + '_' + Date.now();
    console.log(`📝 ANALYSIS ID: Generated ${pageAnalysisId} for ${domain}`);

    // Create the page analysis record to save to database
    const pageAnalysisRecord = {
      ...pageAnalysisResult,
      query_id,
      page_analysis_id: pageAnalysisId
    };

    console.log(`\n💾 DATABASE: Saving analysis to Supabase...`);
    // Insert into database
    const { data: insertedRecord, error: insertError } = await supabase
      .from('page_analyses')
      .insert(pageAnalysisRecord)
      .select()
      .single();

    if (insertError) {
      console.error(`❌ DATABASE ERROR: Failed to save analysis: ${insertError.message}`);
      console.error(`🛠️ RESOLUTION: Check Supabase permissions and table structure`);
      throw new Error(`Failed to save page analysis: ${insertError.message}`);
    }

    console.log(`✅ DATABASE: Analysis saved successfully with ID: ${insertedRecord.id}`);
    console.log(`\n==========================================================`);
    console.log(`✅ CITATION ANALYSIS COMPLETE: ${citation_url}`);
    console.log(`🔢 RESULT SUMMARY:`);
    console.log(`  - Technical SEO Score: ${pageAnalysisResult.technical_seo?.html_structure_score || 'N/A'}/10`);
    console.log(`  - Content Depth Score: ${pageAnalysisResult.content_quality?.content_depth_score || 'N/A'}/10`);
    console.log(`  - Page Relevance: ${pageAnalysisResult.page_analysis?.page_relevance_type || 'N/A'}`);
    console.log(`  - Citation Match Quality: ${pageAnalysisResult.content_quality?.citation_match_quality || 'N/A'}/10`);
    console.log(`  - Brand Mentioned: ${pageAnalysisResult.brand_mentioned ? 'Yes' : 'No'}`);
    console.log(`==========================================================\n`);

    return insertedRecord;

  } catch (error) {
    console.error(`\n❌ CITATION ANALYSIS ERROR: ${error.message}`);
    console.error(`🚨 Error analyzing citation ${citation_url}`);
    console.error(`🔄 STACK TRACE: ${error.stack}`);
    console.error(`==========================================================\n`);
    throw error;
  }
}