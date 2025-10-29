import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Failed</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 1rem;
              }
              p {
                color: #4a5568;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">❌</div>
              <h1>Authorization Failed</h1>
              <p>Error: ${error}</p>
              <p>You can close this window and try again.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    if (!code) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Missing Authorization Code</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              .warning-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #ed8936;
                margin-bottom: 1rem;
              }
              p {
                color: #4a5568;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="warning-icon">⚠️</div>
              <h1>No Authorization Code</h1>
              <p>The authorization code is missing from the callback.</p>
              <p>Please try the authorization process again.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Load OAuth credentials
    const keyFilePath = join(process.cwd(), "service-account-key.json");
    const credentials = JSON.parse(readFileSync(keyFilePath, "utf8"));

    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      "http://localhost:3000/api/auth/google/callback"
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Return a nice success page with the tokens
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 2rem;
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 700px;
              width: 100%;
            }
            .success-icon {
              font-size: 4rem;
              text-align: center;
              margin-bottom: 1rem;
            }
            h1 {
              color: #38a169;
              text-align: center;
              margin-bottom: 1.5rem;
            }
            .instructions {
              background: #f7fafc;
              padding: 1.5rem;
              border-radius: 0.5rem;
              margin-bottom: 1.5rem;
              border-left: 4px solid #667eea;
            }
            .instructions h2 {
              color: #2d3748;
              font-size: 1.1rem;
              margin-top: 0;
            }
            .token-box {
              background: #1a202c;
              color: #68d391;
              padding: 1rem;
              border-radius: 0.5rem;
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 0.85rem;
              margin: 1rem 0;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-all;
            }
            .copy-btn {
              background: #667eea;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 0.9rem;
              margin-top: 0.5rem;
              transition: background 0.2s;
            }
            .copy-btn:hover {
              background: #5568d3;
            }
            .copy-btn:active {
              background: #4c51bf;
            }
            .success-msg {
              display: none;
              color: #38a169;
              font-size: 0.9rem;
              margin-top: 0.5rem;
            }
            .note {
              background: #fef5e7;
              padding: 1rem;
              border-radius: 0.5rem;
              border-left: 4px solid #f6ad55;
              margin-top: 1rem;
            }
            .note p {
              margin: 0.5rem 0;
              color: #744210;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Authorization Successful!</h1>
            
            <div class="instructions">
              <h2>📋 Next Steps:</h2>
              <p>Copy the following lines and add them to your <strong>.env.local</strong> file:</p>
            </div>

            <div class="token-box" id="tokenBox">GOOGLE_DRIVE_ACCESS_TOKEN="${tokens.access_token}"
GOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"</div>
            
            <button class="copy-btn" onclick="copyTokens()">📋 Copy to Clipboard</button>
            <div class="success-msg" id="successMsg">✅ Copied to clipboard!</div>

            <div class="note">
              <p><strong>⚠️ Important:</strong></p>
              <p>1. Add these tokens to your <code>.env.local</code> file in the project root</p>
              <p>2. Restart your development server after adding the tokens</p>
              <p>3. Keep these tokens secure and never commit them to version control</p>
              <p>4. You can now close this window</p>
            </div>
          </div>

          <script>
            function copyTokens() {
              const tokenBox = document.getElementById('tokenBox');
              const successMsg = document.getElementById('successMsg');
              
              navigator.clipboard.writeText(tokenBox.textContent).then(() => {
                successMsg.style.display = 'block';
                setTimeout(() => {
                  successMsg.style.display = 'none';
                }, 3000);
              }).catch(err => {
                alert('Failed to copy. Please copy manually.');
              });
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #e53e3e;
              margin-bottom: 1rem;
            }
            p {
              color: #4a5568;
              line-height: 1.6;
            }
            .error-details {
              background: #fed7d7;
              padding: 1rem;
              border-radius: 0.5rem;
              margin-top: 1rem;
              color: #742a2a;
              font-family: monospace;
              font-size: 0.85rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1>Authorization Error</h1>
            <p>Something went wrong while processing your authorization.</p>
            <div class="error-details">${error instanceof Error ? error.message : "Unknown error"}</div>
            <p style="margin-top: 1rem;">Please try the authorization process again.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}
