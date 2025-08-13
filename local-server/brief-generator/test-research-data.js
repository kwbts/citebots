#!/usr/bin/env node

/**
 * Test to check if research data contains extractable statistics
 */

require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

// Import the database connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testResearchData() {
  console.log('Testing research data for statistics...\n');
  
  try {
    // Get the most recent brief
    const briefResult = await pool.query(`
      SELECT id, title, logs
      FROM content_briefs 
      WHERE status = 'completed'
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (briefResult.rows.length === 0) {
      console.log('No completed briefs found');
      return;
    }
    
    const brief = briefResult.rows[0];
    console.log('Latest brief:', brief.title);
    
    // Extract research data from logs
    if (!brief.logs || !brief.logs.researchData) {
      console.log('No research data found in logs');
      return;
    }
    
    const researchData = brief.logs.researchData;
    console.log('\nResearch data structure:');
    console.log('- LLM Responses:', researchData.llmResponses?.length || 0);
    console.log('- Scraped Content:', researchData.scrapedContent?.length || 0);
    console.log('- Search Results:', researchData.searchResults?.length || 0);
    
    // Test statistics extraction from LLM responses
    if (researchData.llmResponses && researchData.llmResponses.length > 0) {
      console.log('\n=== ANALYZING LLM RESPONSES FOR STATISTICS ===');
      
      researchData.llmResponses.forEach((response, i) => {
        console.log(`\nLLM Response ${i + 1}:`);
        console.log('Query:', response.query?.substring(0, 100) + '...');
        console.log('Response length:', response.text?.length || 0);
        
        if (response.text) {
          // Look for statistical patterns
          const statPatterns = [
            /\d+(\.\d+)?%/g, // Percentages
            /\d+(\.\d+)?\s*(billion|million|thousand|k\b)/gi, // Large numbers
            /\$\d+(\.\d+)?\s*(billion|million|thousand|k\b)?/gi, // Money
          ];
          
          let foundStats = [];
          statPatterns.forEach(pattern => {
            const matches = response.text.match(pattern);
            if (matches) {
              foundStats = foundStats.concat(matches);
            }
          });
          
          console.log('Statistical patterns found:', foundStats.length);
          if (foundStats.length > 0) {
            console.log('Examples:', foundStats.slice(0, 5));
            
            // Show some context for these statistics
            console.log('\nSample statistical content:');
            foundStats.slice(0, 3).forEach(stat => {
              const index = response.text.indexOf(stat);
              if (index >= 0) {
                const start = Math.max(0, index - 100);
                const end = Math.min(response.text.length, index + 200);
                const context = response.text.substring(start, end);
                console.log(`"${stat}": ...${context}...`);
                console.log('---');
              }
            });
          }
        }
      });
    }
    
    // Check if Claude insights were generated
    if (brief.logs.claudeInsights) {
      console.log('\n=== CLAUDE INSIGHTS ANALYSIS ===');
      const insights = brief.logs.claudeInsights;
      console.log('Claude insights keys:', Object.keys(insights));
      
      if (insights.quotableStatistics) {
        console.log('Quotable statistics count:', insights.quotableStatistics.length);
        console.log('Sample statistics:');
        insights.quotableStatistics.slice(0, 3).forEach((stat, i) => {
          console.log(`${i + 1}. ${stat.statistic || stat}`);
        });
      } else {
        console.log('No quotableStatistics found in Claude insights');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testResearchData();