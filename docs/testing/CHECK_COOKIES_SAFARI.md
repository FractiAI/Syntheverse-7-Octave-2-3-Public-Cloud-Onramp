# How to Check Cookies in Safari on MacBook

## Method 1: Using Safari Developer Tools (Recommended)

### Step 1: Enable Developer Menu
1. Open **Safari**
2. Click **Safari** in the menu bar (top left)
3. Click **Settings** (or **Preferences**)
4. Click the **Advanced** tab
5. ✅ Check the box: **"Show Develop menu in menu bar"**
6. Close the settings window

### Step 2: Open Web Inspector
1. Go to your site: `https://syntheverse-poc.vercel.app`
2. Sign in with Google/OAuth
3. In the menu bar, click **Develop**
4. Click **Show Web Inspector** (or press `Cmd + Option + I`)

### Step 3: View Cookies
1. In the Web Inspector window, click the **Storage** tab (at the top)
2. In the left sidebar, expand **Cookies**
3. Click on `https://syntheverse-poc.vercel.app`
4. You'll see a list of all cookies for that site

### Step 4: Look for Supabase Cookies
After signing in, look for cookies starting with:
- `sb-jfbgdxeumzqzigptbmvp-auth-token`
- `sb-jfbgdxeumzqzigptbmvp-auth-token-code-verifier`
- Any other cookies starting with `sb-`

### Step 5: Check Cookie Details
For each cookie, check:
- **Name**: Should start with `sb-`
- **Value**: Should have a long string
- **Domain**: Should be `.vercel.app` or `syntheverse-poc.vercel.app`
- **Path**: Should be `/`
- **Expires**: Should show a future date (not "Session")

---

## Method 2: Right-Click Method

1. Right-click anywhere on the page
2. Select **Inspect Element**
3. This opens Web Inspector
4. Follow Step 3 above (click Storage → Cookies)

---

## Method 3: Using Safari Settings (Limited Info)

1. Safari → **Settings** → **Privacy** tab
2. Click **Manage Website Data...**
3. Search for: `vercel.app`
4. Click on the entry
5. Click **Details**

**Note**: This method shows less detail than Web Inspector, but you can see if cookies exist.

---

## What to Look For

After signing in with OAuth, you should see:
- ✅ At least one cookie starting with `sb-`
- ✅ Cookie domain should match your site
- ✅ Cookie expiration should be in the future
- ✅ Cookie path should be `/`

If you **don't see** any `sb-` cookies after signing in, that means cookies aren't being set properly, which explains why the session doesn't persist.

---

## Quick Test

1. Before signing in: Check cookies - should see no `sb-` cookies
2. Sign in with Google
3. After redirect to dashboard: Check cookies again
4. Do you see `sb-` cookies now? **Yes / No**


