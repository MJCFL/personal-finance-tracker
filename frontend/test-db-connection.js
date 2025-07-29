// Simple script to test MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Check if MongoDB URI is available
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// Sanitize URI for logging (hide password)
const sanitizedUri = process.env.MONGODB_URI.replace(/(\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
console.log('MongoDB URI format:', sanitizedUri);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // List databases
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(result => {
    console.log('Available databases:', result.databases.map(db => db.name));
    
    // Close connection
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
