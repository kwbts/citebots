fetch('https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker', { 
  method: 'POST', 
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybWFlb2R0aGx5d2Nqd2Z6ZGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQzNDg1NCwiZXhwIjoyMDYzMDEwODU0fQ.vsCoNS_Cc-iCAw99AAAkDTTS829HWd4xnypVlBKHGZ0' 
  }, 
  body: JSON.stringify({ batch_size: 1 }) 
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Raw response:', data);
  try {
    const json = JSON.parse(data);
    console.log('Parsed response:', json);
  } catch (e) {
    console.log('Not JSON response');
  }
})
.catch(error => console.error('Error:', error))