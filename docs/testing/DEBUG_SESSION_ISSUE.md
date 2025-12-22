# Debug Session Persistence Issue

## How to Open Browser DevTools

### On Mac:
- **Chrome/Edge**: `Cmd + Option + I` (or `Cmd + Shift + C` for inspector)
- **Safari**: `Cmd + Option + I` (enable Developer menu first in Preferences → Advanced)
- **Firefox**: `Cmd + Option + I`

### On Windows/Linux:
- **Chrome/Edge/Firefox**: `F12` or `Ctrl + Shift + I`
- **Right-click** on page → "Inspect" or "Inspect Element"

---

## Steps to Check Cookies

1. **Open DevTools** (use one of the methods above)

2. **Go to Application tab** (Chrome/Edge) or **Storage tab** (Firefox)
   - If you don't see tabs, click the `>>` icon to see more

3. **In the left sidebar, expand "Cookies"**
   - Click on your domain: `syntheverse-poc.vercel.app`

4. **Sign in with Google/OAuth**

5. **Look for cookies starting with:**
   - `sb-jfbgdxeumzqzigptbmvp-auth-token`
   - `sb-jfbgdxeumzqzigptbmvp-auth-token-code-verifier`
   - Any other cookies starting with `sb-`

6. **Check these details for each cookie:**
   - **Name**: Should start with `sb-`
   - **Value**: Should have a long string
   - **Domain**: Should be `.vercel.app` or `syntheverse-poc.vercel.app`
   - **Path**: Should be `/`
   - **Expires**: Should be a future date (not "Session")
   - **HttpOnly**: Might be checked
   - **Secure**: Should be checked (for HTTPS)

---

## What to Report

Please tell me:
1. **Do you see any cookies starting with `sb-` after signing in?**
   - Yes / No

2. **If yes, what is the "Expires" value?**
   - A date/time in the future
   - "Session" (expires when browser closes)
   - Other: ________

3. **What domain are the cookies set for?**
   - `.vercel.app`
   - `syntheverse-poc.vercel.app`
   - Other: ________

---

## Alternative: Check Network Tab

1. Open DevTools → **Network** tab
2. Sign in with OAuth
3. Look for the request to `/auth/callback`
4. Click on it
5. Check the **Response Headers**
6. Look for `Set-Cookie` headers
7. Are there any `Set-Cookie` headers? Yes/No

---

## Quick Test

Try this in the browser console (DevTools → Console tab):

```javascript
document.cookie
```

This will show all cookies. Do you see any `sb-` cookies after signing in?


