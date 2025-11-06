// Simple HTTP server to run the profile creation tool
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3030;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Serve the HTML file
    const htmlPath = path.join(__dirname, 'create-profile.html');
    fs.readFile(htmlPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading HTML: ${err.message}`);
        return;
      }
      
      // Extract Firebase config from .env.local if exists
      try {
        const envPath = path.join(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extract Firebase config variables
        const apiKey = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_API_KEY');
        const authDomain = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
        const projectId = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        const storageBucket = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
        const messagingSenderId = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
        const appId = extractEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_APP_ID');
        
        // Create Firebase config object
        const firebaseConfig = {
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId
        };
        
        // Replace placeholder with actual config
        let modifiedContent = content.toString();
        modifiedContent = modifiedContent.replace(
          /const firebaseConfig = \{[^}]+\};/,
          `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 4)};`
        );
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(modifiedContent);
      } catch (error) {
        // If can't read .env.local, just serve the original file
        console.error('Could not load Firebase config from .env.local:', error.message);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Helper function to extract environment variable
function extractEnvVar(content, varName) {
  const match = content.match(new RegExp(`${varName}=([^\\r\\n]+)`));
  return match ? match[1].trim() : '';
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Use this tool to create the admin user profile');
  console.log('Press Ctrl+C to stop the server');
});
