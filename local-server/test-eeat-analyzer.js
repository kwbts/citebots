#!/usr/bin/env node

/**
 * Test script for EEAT analyzer
 *
 * Usage:
 *   node test-eeat-analyzer.js <url> [options]
 *
 * Options:
 *   --save        Save results to eeat-results.json
 *   --verbose     Show detailed debug information
 *   --help        Show this help message
 *
 * Example:
 *   node test-eeat-analyzer.js https://knak.com/blog/email-template-builders-scale-personalization/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { crawlPage, extractTextContent, extractPageInfo, 
         extractTechnicalSeoData, extractOnPageSeoData, 
         analyzeContentQuality, analyzePageContext } from './lib/pageAnalyzer.js';
import { analyzeEEAT } from './lib/eeatAnalyzer.js';

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

// Show help message if requested
if (options.help) {
  console.log(`
  Test script for EEAT analyzer
  
  Usage:
    node test-eeat-analyzer.js <url> [options]
  
  Options:
    --save        Save results to eeat-results.json
    --verbose     Show detailed debug information
    --help        Show this help message
  
  Example:
    node test-eeat-analyzer.js https://knak.com/blog/email-template-builders-scale-personalization/
  `);
  process.exit(0);
}

// Validate URL
if (!url) {
  console.error('Error: URL is required');
  console.log('Usage: node test-eeat-analyzer.js <url> [options]');
  console.log('Use --help for more information');
  process.exit(1);
}

// Check for required environment variables
if (!process.env.SCRAPINGBEE_API_KEY) {
  console.warn('Warning: SCRAPINGBEE_API_KEY not found in environment');
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not found in environment');
}

// Main execution
async function main() {
  try {
    console.log(`Analyzing EEAT for page: ${url}`);
    console.log('Options:', options);

    // First crawl the page
    console.log('\nCrawling page...');
    const crawlResult = await crawlPage(url);
    const html = crawlResult.html;

    // Extract text content
    const textContent = extractTextContent(html);
    console.log(`Extracted ${textContent.length} characters of text content`);

    // Check for content extraction issues
    if (textContent.length < 500) {
      console.log(`\n⚠️ WARNING: Very little content extracted (${textContent.length} characters)`);
      console.log('This may indicate a JavaScript-heavy page where content is not being properly rendered.');
      console.log('The EEAT analysis may be less accurate as a result.');
      console.log('Consider using the main page analyzer which has better JS rendering support.');
    }

    // Extract basic information
    console.log('\nExtracting basic page information...');
    const pageInfo = extractPageInfo(html, url);
    console.log(`Page title: ${pageInfo.title}`);
    console.log(`Word count: ${pageInfo.wordCount}`);

    // Extract technical SEO data
    console.log('\nExtracting technical SEO data...');
    const technicalSeo = extractTechnicalSeoData(html, url);

    // Extract on-page SEO data
    console.log('\nExtracting on-page SEO data...');
    const onPageSeo = extractOnPageSeoData(html, url, pageInfo, '');

    // Analyze content quality
    console.log('\nAnalyzing content quality...');
    const contentQuality = await analyzeContentQuality(html, url, 'Test query', null);

    // Analyze page context
    console.log('\nAnalyzing page context...');
    const pageAnalysis = await analyzePageContext(html, url, 'Test query', 'Test brand', [], null);

    // Set up default values for domain authority and page performance
    const domainAuthority = {
      domain_name: new URL(url).hostname,
      domain_authority: 30,
      page_authority: 20
    };

    const pagePerformance = {
      page_speed_score: 50
    };

    // Now analyze EEAT
    console.log('\nAnalyzing EEAT...');
    const eeatAnalysis = await analyzeEEAT({
      url,
      html,
      textContent,
      technicalSeo,
      onPageSeo,
      contentQuality,
      pagePerformance,
      domainAuthority,
      pageAnalysis
    });

    // Display results
    console.log('\nEEAT Analysis completed!\n');

    // Display a summary
    console.log('=== EEAT ANALYSIS SUMMARY ===');
    console.log(`Overall EEAT Score: ${eeatAnalysis.eeat_score}/10`);
    console.log(`Experience Score: ${eeatAnalysis.experience.score}/10`);
    console.log(`Expertise Score: ${eeatAnalysis.expertise.score}/10`);
    console.log(`Authoritativeness Score: ${eeatAnalysis.authoritativeness.score}/10`);
    console.log(`Trustworthiness Score: ${eeatAnalysis.trustworthiness.score}/10`);

    // Display key strengths
    if (eeatAnalysis.strengths && eeatAnalysis.strengths.length > 0) {
      console.log('\nKey EEAT Strengths:');
      eeatAnalysis.strengths.forEach((strength, index) => {
        console.log(`  ${index + 1}. ${strength}`);
      });
    }

    // Display improvement areas
    if (eeatAnalysis.improvement_areas && eeatAnalysis.improvement_areas.length > 0) {
      console.log('\nEEAT Improvement Areas:');
      eeatAnalysis.improvement_areas.forEach((area, index) => {
        console.log(`  ${index + 1}. ${area}`);
      });
    }

    // Display detailed analysis
    if (options.verbose) {
      console.log('\n=== DETAILED EEAT ANALYSIS ===');
      
      console.log('\nEXPERIENCE DIMENSION:');
      console.log(`Evidence: ${eeatAnalysis.experience.evidence}`);
      console.log(`Real world application: ${eeatAnalysis.experience.real_world_application}`);
      console.log(`Case studies: ${eeatAnalysis.experience.case_studies}`);
      console.log(`Expert commentary: ${eeatAnalysis.experience.expert_commentary}`);
      console.log(`Temporal markers: ${eeatAnalysis.experience.temporal_markers}`);
      
      console.log('\nEXPERTISE DIMENSION:');
      console.log(`Technical depth: ${eeatAnalysis.expertise.technical_depth}`);
      console.log(`Terminology usage: ${eeatAnalysis.expertise.terminology_usage}`);
      console.log(`Explanation quality: ${eeatAnalysis.expertise.explanation_quality}`);
      console.log(`Research references: ${eeatAnalysis.expertise.research_references}`);
      console.log(`Detail level: ${eeatAnalysis.expertise.detail_level}`);
      console.log(`Industry knowledge: ${eeatAnalysis.expertise.industry_knowledge}`);
      
      console.log('\nAUTHORITATIVENESS DIMENSION:');
      console.log(`Domain credibility: ${eeatAnalysis.authoritativeness.domain_credibility}`);
      console.log(`Industry recognition: ${eeatAnalysis.authoritativeness.industry_recognition}`);
      console.log(`Comprehensiveness: ${eeatAnalysis.authoritativeness.comprehensiveness}`);
      console.log(`Citation quality: ${eeatAnalysis.authoritativeness.citation_quality}`);
      console.log(`Content depth: ${eeatAnalysis.authoritativeness.content_depth}`);
      console.log(`Credentials: ${eeatAnalysis.authoritativeness.credentials}`);
      
      console.log('\nTRUSTWORTHINESS DIMENSION:');
      console.log(`Information balance: ${eeatAnalysis.trustworthiness.information_balance}`);
      console.log(`Limitation transparency: ${eeatAnalysis.trustworthiness.limitation_transparency}`);
      console.log(`Fact/opinion distinction: ${eeatAnalysis.trustworthiness.fact_opinion_distinction}`);
      console.log(`Information currency: ${eeatAnalysis.trustworthiness.information_currency}`);
      console.log(`Attribution practices: ${eeatAnalysis.trustworthiness.attribution_practices}`);
      console.log(`Accuracy indicators: ${eeatAnalysis.trustworthiness.accuracy_indicators}`);
      console.log(`Citation presence: ${eeatAnalysis.trustworthiness.citation_presence}`);
    }

    // Save results if requested
    if (options.save) {
      const outputPath = path.join(__dirname, 'eeat-results.json');
      await fs.promises.writeFile(outputPath, JSON.stringify(eeatAnalysis, null, 2));
      console.log(`\nResults saved to: ${outputPath}`);
    }

  } catch (error) {
    console.error('Error during EEAT analysis:', error.message);
    if (options.verbose && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the analysis
main();