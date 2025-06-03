#!/usr/bin/env node

/**
 * Test script for page analysis
 *
 * Usage:
 *   node test-page-analysis.js <url> [options]
 *
 * Options:
 *   --pagespeed   Enable PageSpeed API testing
 *   --moz         Enable Moz API testing
 *   --save        Save results to results.json
 *   --verbose     Show detailed debug information
 *
 * Example:
 *   node test-page-analysis.js https://knak.com/blog/email-template-builders-scale-personalization/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzePage } from './lib/pageAnalyzer.js';

// Load environment variables from .env file if present
try {
  dotenv.config();
} catch (e) {
  console.log('dotenv module not found, skipping .env loading');
}

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process command line arguments
const args = process.argv.slice(2);
let url = '';
const options = {
  pagespeed: false,
  moz: false,
  save: false,
  verbose: false
};

// Parse arguments
for (const arg of args) {
  if (arg.startsWith('--')) {
    const option = arg.slice(2);
    options[option] = true;
  } else if (!url) {
    url = arg;
  }
}

// Validate URL
if (!url) {
  console.error('Error: URL is required');
  console.log('Usage: node test-page-analysis.js <url> [options]');
  process.exit(1);
}

// Default to the knak.com test URL if no URL provided
if (!url) {
  url = 'https://knak.com/blog/email-template-builders-scale-personalization/';
  console.log(`No URL provided, using default test URL: ${url}`);
}

// Check for required environment variables
if (!process.env.SCRAPINGBEE_API_KEY) {
  console.warn('Warning: SCRAPINGBEE_API_KEY not found in environment');
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not found in environment');
}

if (options.pagespeed && !process.env.PAGESPEED_API_KEY) {
  console.warn('Warning: PAGESPEED_API_KEY not found in environment, PageSpeed tests will be skipped');
  options.pagespeed = false;
}

if (options.moz && !process.env.MOZ_ACCESS_ID) {
  console.warn('Warning: MOZ_ACCESS_ID not found in environment, Moz API calls will be skipped');
  options.moz = false;
}

// Main execution
async function main() {
  try {
    console.log(`Analyzing page: ${url}`);
    console.log('Options:', options);

    // Mock request data structure similar to the main analyzeCitation function
    const requestData = {
      citation_url: url,
      citation_position: 1,
      query_text: "Example query about email template builders",
      keyword: "email template builders",
      brand_name: "Knak",
      brand_domain: "knak.com",
      competitors: [
        { name: "Stripo", domain: "stripo.email" },
        { name: "Bee", domain: "beefree.io" },
        { name: "Mailchimp", domain: "mailchimp.com" }
      ]
    };

    // Add options to the request
    requestData.options = options;

    // Run the analysis
    console.log('\nStarting analysis...');
    const result = await analyzePage(requestData);

    // Display results
    console.log('\nAnalysis completed!\n');

    // Display a summary
    console.log('=== ANALYSIS SUMMARY ===');
    console.log(`Page title: ${result.on_page_seo?.page_title || 'Unknown'}`);
    console.log(`Word count: ${result.on_page_seo?.word_count || 0}`);
    console.log(`Technical SEO score: ${result.technical_seo?.html_structure_score || 0}/10`);
    console.log(`Content quality score: ${result.content_quality?.analysis_score || 0}/5`);
    console.log(`Domain authority: ${result.domain_authority?.domain_authority || 'N/A'}`);
    console.log(`Page speed score: ${result.page_performance?.page_speed_score || 'N/A'}`);

    // Save results if requested
    if (options.save) {
      const outputPath = path.join(__dirname, 'analysis-results.json');
      await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2));
      console.log(`\nResults saved to: ${outputPath}`);
    }

  } catch (error) {
    console.error('Error during analysis:', error.message);
    if (options.verbose && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the analysis
main();