# OAuth Redirect URI Format Error

## ❌ Error: 'redirect address is invalid - no whitespaces allowed'

## ✅ Solution: Enter URLs without any spaces or formatting

## Correct Format (copy exactly):

http://localhost:3000/auth/callback

## For Production (placeholder):
https://syntheverse-whole-brain-ai.vercel.app/auth/callback

## Common Mistakes:
❌ http://localhost:3000/auth/callback [space at end]
❌  http://localhost:3000/auth/callback [space at beginning]  
❌ http://localhost:3000/auth/callback[no space]
❌ • http://localhost:3000/auth/callback [bullet point]

## How to Fix:
1. Click in the redirect URI input field
2. Delete any existing text
3. Type or paste: http://localhost:3000/auth/callback
4. Press Enter or click Add URI
5. Repeat for production URL

## Verification:
- URLs should appear clean without extra characters
- No spaces before, after, or within the URL
- Format: protocol://domain/path

Try entering just the localhost URL first to test.
