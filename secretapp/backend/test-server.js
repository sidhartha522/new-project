const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
