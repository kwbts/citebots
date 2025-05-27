fetch('https://trmaeodthlywcjwfzdka.supabase.co/rest/v1/rpc/claim_queue_batch_optimized', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWFlb2R0aGx5d2Nqd2Z6ZGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQzNDg1NCwiZXhwIjoyMDYzMDEwODU0fQ.vsCoNS_Cc-iCAw99AAAkDTTS829HWd4xnypVlBKHGZ0',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWFlb2R0aGx5d2Nqd2Z6ZGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQzNDg1NCwiZXhwIjoyMDYzMDEwODU0fQ.vsCoNS_Cc-iCAw99AAAkDTTS829HWd4xnypVlBKHGZ0'
  },
  body: JSON.stringify({
    p_batch_size: 1,
    p_processor_id: 'test-' + Date.now()
  })
})
.then(response => response.json())
.then(data => {
  console.log('Claim result:', data);
  if (data && data[0]) {
    console.log('Item details:', JSON.stringify(data[0], null, 2));
  }
})
.catch(error => console.error('Claim error:', error))