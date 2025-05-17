// Test script for the enhance-client-with-ai edge function
// Run with: node scripts/test-edge-function.js

const https = require('https');

// Replace with your actual Supabase project details
const SUPABASE_PROJECT_ID = 'trmaeodthlywcjwfzdka';
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY;

const testPayload = {
  clientId: 'test-client-id',
  clientName: 'Test Company',
  clientDomain: 'testcompany.com'
};

const options = {
  hostname: `${SUPABASE_PROJECT_ID}.supabase.co`,
  path: '/functions/v1/enhance-client-with-ai',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Length': JSON.stringify(testPayload).length
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    console.log('Response Data:', data);
    
    try {
      const parsedData = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Write data to request body
req.write(JSON.stringify(testPayload));
req.end();

console.log('Sending test request to edge function...');
console.log('Payload:', JSON.stringify(testPayload, null, 2));