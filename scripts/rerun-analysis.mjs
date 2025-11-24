#!/usr/bin/env node

/**
 * Rerun Analysis Script
 *
 * This script fetches queries from previous analysis runs and resubmits them
 * as new query-only analysis runs (to avoid API costs for comprehensive analysis)
 *
 * Usage:
 *   node scripts/rerun-analysis.mjs <analysis_run_id_1> <analysis_run_id_2> ...
 *
 * Or run all 4 CrashPlan analyses:
 *   node scripts/rerun-analysis.mjs --crashplan
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
)

// The 4 CrashPlan analysis run IDs
const CRASHPLAN_RUNS = [
  '202a6de4-777d-4692-afd3-b0f5409cc558', // Comparison & Buying Prompts (48 queries)
  '26354a9e-ef6c-417a-bcbd-138affa0f3ff', // Feature-Oriented Prompts (44 queries)
  '9f3fa69f-8c67-451c-b70d-8ed01571807c', // Category / Industry Prompts (44 queries)
  '80b06e92-f04f-4f98-bb0f-6fb17b6d7631'  // Problem-Oriented Prompts (40 queries)
]

/**
 * Fetch queries from an analysis run
 */
async function fetchQueriesFromRun(analysisRunId) {
  console.log(`\n📊 Fetching queries for analysis run: ${analysisRunId}`)

  // Get analysis run details
  const { data: run, error: runError } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('id', analysisRunId)
    .single()

  if (runError) {
    console.error(`❌ Error fetching analysis run:`, runError.message)
    throw runError
  }

  console.log(`   ✓ Found run: "${run.name || 'Unnamed'}"`)
  console.log(`   ✓ Client ID: ${run.client_id}`)
  console.log(`   ✓ Platform: ${run.platform}`)
  console.log(`   ✓ Total queries: ${run.queries_total}`)

  // Get all queries for this run
  const { data: queries, error: queriesError } = await supabase
    .from('analysis_queries')
    .select('*')
    .eq('analysis_run_id', analysisRunId)
    .order('created_at', { ascending: true })

  if (queriesError) {
    console.error(`❌ Error fetching queries:`, queriesError.message)
    throw queriesError
  }

  console.log(`   ✓ Retrieved ${queries.length} queries`)

  return {
    run,
    queries
  }
}

/**
 * Format queries for resubmission
 */
function formatQueriesForResubmission(queries) {
  return queries.map(q => ({
    query_text: q.query_text,
    keyword: q.query_keyword || '',
    intent: q.query_intent || '',
    platform: q.data_source,
    is_custom: q.is_custom || false
  }))
}

/**
 * Submit queries to the queue for processing
 */
async function submitAnalysisToQueue(clientId, platforms, queries, reportName, analysisType = 'query-only') {
  console.log(`\n🚀 Submitting new analysis to queue...`)
  console.log(`   - Client ID: ${clientId}`)
  console.log(`   - Platforms: ${platforms.join(', ')}`)
  console.log(`   - Queries: ${queries.length}`)
  console.log(`   - Analysis Type: ${analysisType}`)
  console.log(`   - Report Name: ${reportName}`)

  // Use the database function to submit analysis
  const { data, error } = await supabase.rpc('submit_analysis_to_queue', {
    p_client_id: clientId,
    p_platforms: platforms,
    p_queries: queries,
    p_report_name: reportName,
    p_analysis_type: analysisType
  })

  if (error) {
    console.error(`❌ Error submitting to queue:`, error.message)
    throw error
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to submit analysis to queue')
  }

  console.log(`   ✅ Success! Analysis run ID: ${data.analysis_run_id}`)
  console.log(`   ✅ Queued ${data.queries_queued} queries for processing`)

  return data
}

/**
 * Rerun a single analysis run
 */
async function rerunAnalysis(analysisRunId, options = {}) {
  try {
    // Fetch original run and queries
    const { run, queries } = await fetchQueriesFromRun(analysisRunId)

    // Format queries for resubmission
    const formattedQueries = formatQueriesForResubmission(queries)

    // Determine platforms
    const platforms = run.platform.split(',').map(p => p.trim())

    // Create new report name
    const originalName = run.name || `Analysis from ${new Date(run.created_at).toLocaleDateString()}`
    const newReportName = options.reportName || `[RERUN] ${originalName}`

    // Submit to queue
    const result = await submitAnalysisToQueue(
      run.client_id,
      platforms,
      formattedQueries,
      newReportName,
      options.analysisType || 'query-only'
    )

    return result

  } catch (error) {
    console.error(`\n❌ Failed to rerun analysis:`, error.message)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔄 RERUN ANALYSIS SCRIPT`)
  console.log(`${'='.repeat(60)}`)

  const args = process.argv.slice(2)

  let analysisRunIds = []
  let options = {}

  // Parse arguments
  if (args.includes('--crashplan')) {
    console.log(`\n📋 Running all 4 CrashPlan analyses`)
    analysisRunIds = CRASHPLAN_RUNS
  } else if (args.includes('--help') || args.length === 0) {
    console.log(`
Usage:
  node scripts/rerun-analysis.mjs <analysis_run_id_1> <analysis_run_id_2> ...
  node scripts/rerun-analysis.mjs --crashplan

Options:
  --crashplan          Rerun all 4 CrashPlan analysis runs
  --comprehensive      Use comprehensive analysis type (default: query-only)
  --help              Show this help message

Examples:
  # Rerun a single analysis
  node scripts/rerun-analysis.mjs 202a6de4-777d-4692-afd3-b0f5409cc558

  # Rerun multiple analyses
  node scripts/rerun-analysis.mjs run-id-1 run-id-2 run-id-3

  # Rerun all CrashPlan analyses with query-only mode (fast, no API costs)
  node scripts/rerun-analysis.mjs --crashplan

  # Rerun with comprehensive analysis (includes web scraping - costs money!)
  node scripts/rerun-analysis.mjs --crashplan --comprehensive
`)
    process.exit(0)
  } else {
    analysisRunIds = args.filter(arg => !arg.startsWith('--'))
  }

  // Parse options
  if (args.includes('--comprehensive')) {
    options.analysisType = 'comprehensive'
    console.log(`\n⚠️  WARNING: Using COMPREHENSIVE analysis type (will use APIs and cost money!)`)
  } else {
    options.analysisType = 'query-only'
    console.log(`\n⚡ Using QUERY-ONLY analysis type (fast, no API costs)`)
  }

  if (analysisRunIds.length === 0) {
    console.error(`\n❌ No analysis run IDs provided`)
    process.exit(1)
  }

  console.log(`\n📊 Total runs to process: ${analysisRunIds.length}`)

  // Process each run
  const results = []
  for (const runId of analysisRunIds) {
    try {
      const result = await rerunAnalysis(runId, options)
      results.push({
        originalRunId: runId,
        newRunId: result.analysis_run_id,
        success: true
      })

      // Add delay between submissions to avoid overwhelming the system
      if (analysisRunIds.indexOf(runId) < analysisRunIds.length - 1) {
        console.log(`\n⏱️  Waiting 2 seconds before next submission...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      results.push({
        originalRunId: runId,
        error: error.message,
        success: false
      })
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 SUMMARY`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Total runs processed: ${results.length}`)
  console.log(`Successful: ${results.filter(r => r.success).length}`)
  console.log(`Failed: ${results.filter(r => !r.success).length}`)

  console.log(`\n📋 Results:`)
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`  ${index + 1}. ✅ ${result.originalRunId} → ${result.newRunId}`)
    } else {
      console.log(`  ${index + 1}. ❌ ${result.originalRunId} - ${result.error}`)
    }
  })

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ DONE!`)
  console.log(`${'='.repeat(60)}\n`)

  // Trigger local server to process the queue
  console.log(`\n🔄 Triggering local server to process queue...`)
  try {
    const response = await fetch('http://localhost:3002/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Local server triggered:`, data.message)
    } else {
      console.log(`⚠️  Could not trigger local server (may not be running)`)
    }
  } catch (error) {
    console.log(`⚠️  Local server not available at http://localhost:3002`)
    console.log(`   Start it with: npm run queue:start`)
  }
}

// Run the script
main().catch(error => {
  console.error(`\n❌ Fatal error:`, error)
  process.exit(1)
})
