# Manual Queue Worker Test

Run this in your browser console (F12) while on your site:

```javascript
fetch('https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SESSION_TOKEN'
  },
  body: JSON.stringify({ batch_size: 1 })
})
.then(response => response.json())
.then(data => console.log('Worker response:', data))
.catch(error => console.error('Worker error:', error));
```

To get your session token:
1. Open browser console (F12)
2. Go to Application tab > Local Storage > your site
3. Look for 'sb-trmaeodthlywcjwfzdka-auth-token'
4. Copy the access_token value

Or try this simpler version:

```javascript
// Get token from Supabase
const authData = JSON.parse(localStorage.getItem('sb-trmaeodthlywcjwfzdka-auth-token'))
const token = authData?.access_token

if (token) {
  fetch('https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ batch_size: 1 })
  })
  .then(response => response.json())
  .then(data => console.log('Worker response:', data))
} else {
  console.log('No auth token found')
}
```