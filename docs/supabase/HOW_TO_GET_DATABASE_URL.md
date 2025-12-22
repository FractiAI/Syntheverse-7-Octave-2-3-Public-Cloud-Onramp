# 📍 How to Find Database Connection String in Supabase UI

**Step-by-step instructions for MacBook**

---

## Step-by-Step Guide

### Step 1: Open Supabase Dashboard
1. Open your web browser (Safari, Chrome, or Firefox)
2. Go to: **https://app.supabase.io/**
3. Sign in to your account

### Step 2: Select Your Project
1. You should see your projects listed
2. Click on your project: **`jfbgdxeumzqzigptbmvp`**
   - (Or look for "Syntheverse" or your project name)

### Step 3: Navigate to Settings
1. Look at the **left sidebar** menu
2. Find and click on the **⚙️ Settings** icon (gear icon)
   - Usually at the bottom of the sidebar

### Step 4: Go to Database Settings
1. In the Settings menu, you'll see several options:
   - General
   - API
   - **Database** ← Click this one
   - Auth
   - Storage
   - etc.

### Step 5: Find Connection String Section
1. Scroll down the Database settings page
2. Look for a section called **"Connection string"** or **"Connection info"**
3. You'll see several tabs above the connection string box:
   - **URI** ← Click this tab (this is what we need!)
   - JDBC
   - Connection pooling
   - etc.

### Step 6: Copy the Connection String
1. Once you click the **URI** tab, you'll see a connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
   ```

2. **Two scenarios:**
   
   **Scenario A: Password is shown**
   - The connection string will have your actual password
   - Example: `postgresql://postgres:MyPassword123@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`
   - ✅ Just copy this entire string - it's ready to use!

   **Scenario B: Shows `[YOUR-PASSWORD]` placeholder**
   - The connection string shows: `postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`
   - You need to get/reset your database password first (see Step 7)

3. **To copy:**
   - Click on the connection string text box
   - Select all the text (Cmd+A)
   - Copy it (Cmd+C)

---

### Step 7: If Password Shows as [YOUR-PASSWORD] - Reset It

If you see `[YOUR-PASSWORD]` in the connection string:

1. **Still on the Database settings page**, scroll up a bit
2. Look for a section called **"Database password"** or **"Reset database password"**
3. Click the button: **"Reset database password"** or **"Generate new password"**
4. **IMPORTANT:** A new password will appear - copy it immediately!
   - You won't be able to see it again after you leave this page
5. Now go back to the Connection string section
6. Click the **URI** tab again
7. The connection string should now show the actual password, or:
8. **Manually build it:**
   - Take the connection string template
   - Replace `[YOUR-PASSWORD]` with the password you just copied
   - Example: If password is `abc123XYZ`, the string becomes:
     ```
     postgresql://postgres:abc123XYZ@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
     ```

---

## Visual Guide (What to Look For)

```
Supabase Dashboard Layout:

┌─────────────────────────────────────┐
│  Supabase Logo          [Your Name] │
├──────────┬──────────────────────────┤
│          │                          │
│ Projects │  [Your Project Name]     │
│          │                          │
│  ⚙️      │  Settings → Database     │
│ Settings │                          │
│          │  ┌────────────────────┐  │
│ Database │  │ Connection string  │  │
│          │  │ [URI] [JDBC] [...] │  │
│ Auth     │  │                    │  │
│ Storage  │  │ postgresql://...   │  │ ← Copy this!
│          │  │                    │  │
│ ...      │  └────────────────────┘  │
└──────────┴──────────────────────────┘
```

---

## Quick Navigation Path

**Full path in Supabase:**
1. https://app.supabase.io/
2. Click your project
3. Left sidebar → ⚙️ **Settings**
4. Click **Database**
5. Scroll to **"Connection string"**
6. Click **URI** tab
7. Copy the connection string

**Direct link** (should take you right to Database settings):
https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/database

---

## Important Notes

⚠️ **Password Security:**
- The database password is sensitive - don't share it publicly
- The connection string includes the password
- When adding to Vercel, it will be encrypted and marked as sensitive

⚠️ **URL Encoding:**
- If your password has special characters (like `@`, `#`, `%`), they may need to be URL-encoded
- Example: `@` becomes `%40`, `#` becomes `%23`
- Most of the time, Supabase handles this automatically in their UI

⚠️ **Connection Pooling:**
- You might see a "Connection pooling" tab
- For Vercel serverless functions, use the regular **URI** tab (port 5432)
- Don't use the pooling connection string unless specifically needed

---

## Once You Have It

After you copy the connection string, you can:
1. Add it to Vercel via CLI (I can help with this)
2. Or paste it here and I'll add it for you
3. Or manually add it in Vercel Dashboard → Settings → Environment Variables

---

**Need help?** Let me know what you see in your Supabase Dashboard and I'll guide you further!


