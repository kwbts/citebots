#!/usr/bin/env node

/**
 * Direct Server Test
 * Tests the running server directly to see what's different from our workflow test
 */

const axios = require('axios');

async function testServerDirectly() {
  console.log('🌐 DIRECT SERVER TEST');
  console.log('=' .repeat(50));
  
  const testPayload = {
    title: "AI automation in customer service",
    keywords: ["AI automation", "customer service", "chatbots"],
    purpose: "Educational guide",
    audience: "Marketing professionals",
    styleGuide: "Professional, informative",
    customInstructions: "Include statistics and expert quotes",
    researchDepth: "comprehensive",
    platforms: {
      chatGpt: true,
      perplexity: true,
      google: true
    },
    userId: "492541a8-daf0-42a3-885a-8a3788718d0b"
  };
  
  try {
    console.log('📤 Sending brief generation request to server...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post('http://localhost:3001/generate-brief', testPayload, {
      timeout: 10000
    });
    
    console.log('\n✅ Server Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.briefId) {
      console.log('\n🔄 Waiting for brief processing...');
      
      // Wait and check the brief status
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const briefResponse = await axios.get(`http://localhost:3001/brief/${response.data.briefId}`);
        console.log('\n📊 Brief Status Check:');
        console.log('Status:', briefResponse.data.brief?.status);
        console.log('Title:', briefResponse.data.brief?.title);
        console.log('Strategic Overview length:', briefResponse.data.brief?.strategic_overview?.length || 0);
        console.log('Process Notes available:', !!briefResponse.data.brief?.process_notes);
        
        if (briefResponse.data.brief?.process_notes?.debug_info) {
          console.log('\n🔍 Debug Info from Server:');
          const debugInfo = briefResponse.data.brief.process_notes.debug_info;
          
          if (debugInfo.llm_responses) {
            console.log('LLM Responses:');
            debugInfo.llm_responses.forEach((resp, i) => {
              console.log(`  ${i+1}. Platform: ${resp.platform}, Status: ${resp.success ? 'Success' : 'Failed'}, Length: ${resp.response_length || 0} chars`);
              if (!resp.success && resp.error) {
                console.log(`      Error: ${resp.error}`);
              }
            });
          }
          
          if (debugInfo.page_analysis) {
            console.log('Page Analysis:');
            debugInfo.page_analysis.slice(0, 3).forEach((page, i) => {
              console.log(`  ${i+1}. URL: ${page.url}, Status: ${page.status}, Length: ${page.content_length || 0}`);
            });
          }
        }
        
        // Wait longer if still processing
        if (briefResponse.data.brief?.status === 'processing') {
          console.log('\n⏳ Still processing, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 more seconds
          
          const finalResponse = await axios.get(`http://localhost:3001/brief/${response.data.briefId}`);
          console.log('\n📊 Final Brief Status:');
          console.log('Status:', finalResponse.data.brief?.status);
          console.log('Strategic Overview length:', finalResponse.data.brief?.strategic_overview?.length || 0);
        }
        
      } catch (briefError) {
        console.log('❌ Error fetching brief:', briefError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Server request failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testServerDirectly().catch(error => {
  console.error('❌ Test failed:', error);
});