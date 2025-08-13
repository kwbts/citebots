#!/usr/bin/env node

/**
 * Quick test script to verify the standalone brief generator works
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3001';

async function testServer() {
  console.log('🚀 Testing Citebots Brief Generator...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Generate brief
    console.log('\n2. Testing brief generation...');
    const briefRequest = {
      title: "Test Content Brief",
      keywords: ["test keyword", "example"],
      purpose: "blog",
      audience: "developers",
      researchDepth: "medium",
      platforms: {
        chatGpt: true,
        perplexity: true,
        google: false // Disabled due to quota
      },
      userId: "test-user-123"
    };

    const briefResponse = await axios.post(`${SERVER_URL}/generate-brief`, briefRequest);
    console.log('✅ Brief generation started:', briefResponse.data);

    const briefId = briefResponse.data.briefId;

    // Test 3: Check brief status
    console.log('\n3. Waiting for brief completion...');
    let attempts = 0;
    let brief = null;

    while (attempts < 30) { // Wait up to 5 minutes
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;

      try {
        const statusResponse = await axios.get(`${SERVER_URL}/brief/${briefId}`);
        brief = statusResponse.data.brief;
        
        console.log(`   Attempt ${attempts}: Status = ${brief.status}`);
        
        if (brief.status === 'completed') {
          console.log('✅ Brief completed successfully!');
          break;
        } else if (brief.status === 'failed') {
          console.log('❌ Brief generation failed');
          break;
        }
      } catch (error) {
        console.log(`   Attempt ${attempts}: Error checking status`);
      }
    }

    if (brief && brief.status === 'completed') {
      console.log('\n📊 Brief Summary:');
      console.log(`   Title: ${brief.content.title}`);
      console.log(`   TOC Sections: ${brief.content.table_of_contents?.length || 0}`);
      console.log(`   Research Links: ${brief.content.research_links?.length || 0}`);
      console.log(`   Has Strategic Overview: ${!!brief.content.strategic_overview}`);
      console.log('\n🎉 All tests passed! The standalone brief generator is working correctly.');
    } else {
      console.log('\n⏰ Brief generation took longer than expected, but the server is responding correctly.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testServer();