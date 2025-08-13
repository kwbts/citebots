#!/usr/bin/env node

/**
 * Workflow Diagnostic Script
 * Simulates the exact server workflow to identify where API calls are failing
 */

require('dotenv').config();
const logger = require('./lib/logger');

// Import the same modules as server.js
const queryGenerator = require('./lib/queryGenerator');
const llmResearcher = require('./lib/llmResearcher');
const webSearcher = require('./lib/webSearcher');

async function debugWorkflow() {
  console.log('🔄 WORKFLOW DIAGNOSTICS');
  console.log('=' .repeat(50));
  
  // Simulate the exact same data structure as the server
  const briefData = {
    title: "Future-proof martech careers",
    keywords: ["martech", "marketing technology", "future careers"],
    purpose: "Educational guide",
    audience: "Marketing professionals",
    platforms: {
      chatGpt: true,
      perplexity: true,
      google: true
    }
  };
  
  const clientData = null; // Generic brief like the one that failed
  
  try {
    // Step 1: Query Generation (like server.js line 347)
    console.log('\n1️⃣ QUERY GENERATION:');
    const queryParams = {
      title: briefData.title,
      keywords: briefData.keywords,
      purpose: briefData.purpose,
      audience: briefData.audience,
      clientData,
      maxQueries: 3
    };
    
    const queryGenStart = Date.now();
    let queries;
    try {
      queries = await queryGenerator.generateQueries(queryParams);
      console.log('✅ Queries generated:', queries.length);
      queries.forEach((q, i) => console.log(`   ${i+1}. ${q.substring(0, 80)}...`));
    } catch (error) {
      console.log('❌ Query generation failed:', error.message);
      return;
    }
    const queryGenTime = Date.now() - queryGenStart;
    console.log(`   Time taken: ${queryGenTime}ms`);
    
    // Step 2: Research Execution (like server.js lines 388-445)
    console.log('\n2️⃣ RESEARCH EXECUTION:');
    const llmResearchStart = Date.now();
    const researchPromises = [];
    const researchResults = {
      llmResponses: [],
      searchResults: [],
      scrapedContent: []
    };
    
    // 2.1: ChatGPT Research
    if (briefData.platforms.chatGpt) {
      console.log('\n   📤 Starting ChatGPT research...');
      const chatGptPromise = llmResearcher.queryChatGPT(queries, clientData)
        .then(results => {
          const successCount = results.filter(r => !r.error).length;
          console.log(`   ✅ ChatGPT completed: ${successCount}/${results.length} successful`);
          
          // Log detailed results
          results.forEach((result, i) => {
            if (result.error) {
              console.log(`      Query ${i+1}: ❌ ERROR - ${result.error}`);
            } else {
              console.log(`      Query ${i+1}: ✅ ${result.content?.length || 0} chars, ${result.citations?.length || 0} citations`);
            }
          });
          
          researchResults.llmResponses.push(...results);
          return results;
        })
        .catch(err => {
          console.log(`   ❌ ChatGPT research failed: ${err.message}`);
          console.log(`   Stack: ${err.stack}`);
          throw err;
        });
      
      researchPromises.push(chatGptPromise);
    }
    
    // 2.2: Perplexity Research
    if (briefData.platforms.perplexity) {
      console.log('\n   📤 Starting Perplexity research...');
      const perplexityPromise = llmResearcher.queryPerplexity(queries, clientData)
        .then(results => {
          const successCount = results.filter(r => !r.error).length;
          console.log(`   ✅ Perplexity completed: ${successCount}/${results.length} successful`);
          
          // Log detailed results
          results.forEach((result, i) => {
            if (result.error) {
              console.log(`      Query ${i+1}: ❌ ERROR - ${result.error}`);
            } else {
              console.log(`      Query ${i+1}: ✅ ${result.content?.length || 0} chars, ${result.citations?.length || 0} citations`);
            }
          });
          
          researchResults.llmResponses.push(...results);
          return results;
        })
        .catch(err => {
          console.log(`   ❌ Perplexity research failed: ${err.message}`);
          console.log(`   Stack: ${err.stack}`);
          throw err;
        });
      
      researchPromises.push(perplexityPromise);
    }
    
    // 2.3: Google Search
    if (briefData.platforms.google) {
      console.log('\n   📤 Starting Google search...');
      const searchKeywords = briefData.keywords.slice(0, 3);
      const googlePromise = webSearcher.googleSearch(searchKeywords, clientData)
        .then(results => {
          console.log(`   ✅ Google search completed: ${results.length} results`);
          researchResults.searchResults = results;
          return results;
        })
        .catch(err => {
          console.log(`   ❌ Google search failed: ${err.message}`);
          console.log(`   Stack: ${err.stack}`);
          throw err;
        });
      
      researchPromises.push(googlePromise);
    }
    
    // Step 3: Wait for all research (like server.js line 474)
    console.log('\n3️⃣ WAITING FOR ALL RESEARCH:');
    console.log(`   Waiting for ${researchPromises.length} research tasks...`);
    
    try {
      await Promise.all(researchPromises);
      const llmResearchTime = Date.now() - llmResearchStart;
      console.log(`   ✅ All research completed in ${llmResearchTime}ms`);
      
      console.log('\n📊 FINAL RESULTS:');
      console.log(`   LLM Responses: ${researchResults.llmResponses.length}`);
      console.log(`   Search Results: ${researchResults.searchResults.length}`);
      
      // Summary of actual content
      const successfulLLM = researchResults.llmResponses.filter(r => !r.error && r.content && r.content.length > 0);
      const totalChars = successfulLLM.reduce((sum, r) => sum + (r.content?.length || 0), 0);
      const totalCitations = researchResults.llmResponses.reduce((sum, r) => sum + (r.citations?.length || 0), 0);
      
      console.log(`   Successful LLM responses: ${successfulLLM.length}`);
      console.log(`   Total content characters: ${totalChars}`);
      console.log(`   Total citations: ${totalCitations}`);
      
      if (totalChars === 0) {
        console.log('\n🚨 CRITICAL: All LLM responses returned 0 characters!');
        console.log('   This matches the failing brief generation behavior.');
      } else {
        console.log('\n🎉 SUCCESS: Content was successfully retrieved!');
        console.log('   The workflow is working correctly.');
      }
      
    } catch (error) {
      console.log(`   ❌ Promise.all failed: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }
    
  } catch (error) {
    console.log(`❌ Workflow failed: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Run the workflow diagnostics
debugWorkflow().catch(error => {
  console.error('❌ Diagnostic script failed:', error);
});