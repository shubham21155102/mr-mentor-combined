/**
 * Helper script to get OAuth 2.0 tokens for Google Drive
 * Run: node get-oauth-tokens.js
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const { exec } = require('child_process');

const credentials = JSON.parse(fs.readFileSync('service-account-key.json', 'utf8'));

const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  'http://localhost:3000/api/auth/google/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getTokens() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n🔐 OAuth Token Generator for Google Drive\n');
  console.log('📋 Please copy and paste this URL in your browser:\n');
  console.log('   ' + authUrl + '\n');
  console.log('⏳ Waiting for authorization...\n');

  const server = http.createServer(async (req, res) => {
    if (req.url.indexOf('/api/auth/google/callback') > -1) {
      const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
      const code = qs.get('code');
      
      res.writeHead(302, {
        'Location': `http://localhost:3000/api/auth/google/callback?code=${code}`
      });
      res.end();

      server.close();
      
      console.log('\n🔄 Redirecting to Next.js API route to handle the callback...\n');
      console.log('✅ The callback route will display the tokens in your browser.\n');
      console.log('📋 Copy them from the browser and add to your .env.local file.\n');
      
      // Give some time for redirect to complete
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }
  }).listen(3001, () => {
    // Try to open browser on macOS
    exec(`open "${authUrl}"`, (error) => {
      if (error) {
        console.log('⚠️  Could not open browser automatically. Please open the URL manually.\n');
      } else {
        console.log('🌐 Browser opened automatically\n');
      }
    });
  });
}

getTokens().catch(console.error);
