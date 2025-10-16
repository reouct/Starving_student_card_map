// index.js

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basic JSON parsing middleware
app.use(express.json());

// Sample endpoint to verify the server is running
app.get('/', (req, res) => {
  res.send({ message: 'Hello from the Express server!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});