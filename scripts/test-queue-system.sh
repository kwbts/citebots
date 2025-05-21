#!/bin/bash

# Test Queue System Script
# This script tests the queue-based analysis processing

echo "Testing Queue System..."

# Set your Supabase credentials
SUPABASE_URL="https://trmaeodthlywcjwfzdka.supabase.co"
ANON_KEY="YOUR_ANON_KEY"  # Replace with your anon key
SERVICE_KEY="YOUR_SERVICE_KEY"  # Replace with your service key

# Test 1: Check if queue table exists
echo "Test 1: Checking queue table..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/claim_queue_batch" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"p_batch_size": 1}'

echo -e "\n\nTest 2: Testing worker function..."
# Test 2: Test worker function
curl -X POST \
  "${SUPABASE_URL}/functions/v1/process-queue-worker" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"batch_size": 1}'

echo -e "\n\nTest 3: Testing run-custom-analysis with queue flag..."
# Test 3: Test run-custom-analysis with queue flag (will fail without valid data, but should respond)
curl -X POST \
  "${SUPABASE_URL}/functions/v1/run-custom-analysis" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Use-Queue: true" \
  -d '{}'

echo -e "\n\nQueue system test complete!"