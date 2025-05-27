fetch('https://trmaeodthlywcjwfzdka.supabase.co/rest/v1/rpc/claim_queue_batch_optimized', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWFlb2R0aGx5d2Nqd2Z6ZGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQzNDg1NCwiZXhwIjoyMDYzMDEwODU0fQ.vsCoNS_Cc-iCAw99AAAkDTTS829HWd4xnypVlBKHGZ0',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWFlb2R0aGx5d2Nqd2Z6ZGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQzNDg1NCwiZXhwIjoyMDYzMDEwODU0fQ.vsCoNS_Cc-iCAw99AAAkDTTS829HWd4xnypVlBKHGZ0'
  },
  body: JSON.stringify({
    p_batch_size: 1,
    p_processor_id: 'fresh-test-' + Date.now()
  })
})
.then(response => response.json())
.then(data => {
  console.log('Fresh claim result:', data);
  if (data && data[0]) {
    console.log('New item - attempts:', data[0].attempts);
    console.log('New item - analysis_run_id:', data[0].analysis_run_id);
  }
})
.catch(error => console.error('Fresh claim error:', error))