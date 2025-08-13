#!/usr/bin/env node

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test configuration
const API_URL = 'http://localhost:3001';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000'; // Test user ID

async function testEndToEndWorkflow() {
  console.log('🚀 Starting end-to-end workflow test...\n');

  try {
    // Step 1: Check server health
    console.log('1️⃣ Checking server health...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is healthy:', healthResponse.data);
    console.log('');

    // Step 2: Create a test brief request
    console.log('2️⃣ Creating test brief...');
    const briefRequest = {
      title: 'Test Brief: Best Practices for Remote Work in 2025',
      keywords: ['remote work', 'productivity', 'work from home'],
      purpose: 'Educational guide for employees transitioning to remote work',
      audience: 'Corporate employees and managers',
      styleGuide: 'Professional, informative, actionable',
      customInstructions: 'Include statistics and expert quotes',
      researchDepth: 'comprehensive',
      platforms: {
        chatGpt: true,
        perplexity: true,
        google: true
      },
      userId: TEST_USER_ID
    };

    console.log('Request payload:', JSON.stringify(briefRequest, null, 2));
    console.log('');

    // Step 3: Send generation request
    console.log('3️⃣ Sending brief generation request...');
    const generateResponse = await axios.post(`${API_URL}/generate-brief`, briefRequest);
    const briefId = generateResponse.data.briefId;
    console.log('✅ Brief generation started:', generateResponse.data);
    console.log('Brief ID:', briefId);
    console.log('');

    // Step 4: Wait and check status
    console.log('4️⃣ Waiting for processing to complete...');
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const { data: briefData, error } = await supabase
        .from('content_briefs')
        .select('status, process_logs')
        .eq('id', briefId)
        .single();

      if (error) {
        console.error('❌ Error checking status:', error);
        break;
      }

      status = briefData.status;
      attempts++;
      
      // Show progress
      const dots = '.'.repeat((attempts % 4) + 1);
      process.stdout.write(`\r   Status: ${status}${dots.padEnd(4)}`);
    }
    console.log(''); // New line after progress dots

    // Step 5: Fetch the completed brief
    if (status === 'completed') {
      console.log('\n5️⃣ Fetching completed brief...');
      const { data: finalBrief, error } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('id', briefId)
        .single();

      if (error) {
        console.error('❌ Error fetching brief:', error);
        return;
      }

      console.log('✅ Brief completed successfully!');
      console.log('\n📊 Brief Metrics:');
      console.log(`   - Title: ${finalBrief.title}`);
      console.log(`   - Processing time: ${finalBrief.processing_time_seconds}s`);
      console.log(`   - Research queries: ${finalBrief.queries_executed || 0}`);
      console.log(`   - Pages analyzed: ${finalBrief.pages_analyzed || 0}`);
      console.log(`   - Content sections: ${finalBrief.content?.table_of_contents?.length || 0}`);
      console.log(`   - Research links: ${finalBrief.content?.research_links?.length || 0}`);
      console.log(`   - AI models used: ${finalBrief.ai_models_used?.join(', ') || 'None tracked'}`);

      // Step 6: Test data retrieval endpoint
      console.log('\n6️⃣ Testing brief retrieval via API...');
      const retrieveResponse = await axios.get(`${API_URL}/brief/${briefId}`);
      console.log('✅ Brief retrieved successfully');
      console.log(`   - Has summary: ${!!retrieveResponse.data.summary}`);
      console.log(`   - Has content suggestions: ${!!retrieveResponse.data.content_suggestions}`);
      console.log(`   - Has table of contents: ${!!retrieveResponse.data.table_of_contents}`);

      // Show sample content
      if (finalBrief.content?.summary) {
        console.log('\n📝 Brief Summary:');
        console.log(finalBrief.content.summary.substring(0, 200) + '...');
      }

      console.log('\n✅ End-to-end test completed successfully!');
    } else {
      console.error(`\n❌ Brief generation failed or timed out. Final status: ${status}`);
      
      // Fetch logs for debugging
      const { data: briefWithLogs } = await supabase
        .from('content_briefs')
        .select('process_logs')
        .eq('id', briefId)
        .single();
      
      if (briefWithLogs?.process_logs) {
        console.log('\n📋 Process logs:');
        console.log(briefWithLogs.process_logs);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
console.log('Brief Generator End-to-End Test');
console.log('================================\n');
testEndToEndWorkflow();