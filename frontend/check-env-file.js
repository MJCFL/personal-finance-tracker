// Simple script to check the .env.local file content
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '.env.local');

try {
  // Check if file exists
  if (fs.existsSync(envFilePath)) {
    console.log('✅ .env.local file exists');
    
    // Read file content
    const content = fs.readFileSync(envFilePath, 'utf8');
    
    // Check if file is empty
    if (content.trim() === '') {
      console.log('❌ .env.local file is empty');
    } else {
      // Check for MONGODB_URI
      if (content.includes('MONGODB_URI=')) {
        console.log('✅ MONGODB_URI is defined in the file');
        
        // Show format (without revealing password)
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('MONGODB_URI=')) {
            // Sanitize the connection string to hide password
            const sanitized = line.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@.+)/, '$1*****$2');
            console.log('Connection string format:', sanitized);
            
            // Check for common format issues
            if (!line.includes('mongodb+srv://')) {
              console.log('⚠️ Warning: Connection string might not be in the correct format');
            }
            
            // Check for whitespace issues
            if (line.includes(' ') && !line.includes('"') && !line.includes("'")) {
              console.log('⚠️ Warning: Connection string contains spaces but no quotes');
            }
          }
        }
      } else {
        console.log('❌ MONGODB_URI is not defined in the file');
      }
      
      // Count number of variables
      const varCount = content.split('\n')
        .filter(line => line.trim() !== '' && line.includes('='))
        .length;
      console.log(`Total environment variables found: ${varCount}`);
    }
  } else {
    console.log('❌ .env.local file does not exist');
  }
} catch (error) {
  console.error('Error checking .env.local file:', error);
}
