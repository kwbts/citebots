const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS with specific options to debug issues
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add a simple endpoint to check if the server is accessible
app.get('/test-cors', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS test successful',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
});
