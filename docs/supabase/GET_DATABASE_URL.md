# 🔍 How to Get DATABASE_URL from Supabase

## Method 1: Get Connection String (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.io/
   - Sign in and select your project: `jfbgdxeumzqzigptbmvp`

2. **Navigate to Database Settings**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **Database** in the settings menu

3. **Get Connection String**
   - Scroll down to **"Connection string"** section
   - You'll see several tabs: **URI**, **JDBC**, **Connection pooling**, etc.
   - Click on the **"URI"** tab

4. **Copy the Connection String**
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
     ```
   - If you see `[YOUR-PASSWORD]`, you need to either:
     - Replace it with your password (if you remember it)
     - OR reset your password (see Method 2 below)
   - Some Supabase projects show the password directly in the connection string
   - Copy the entire string - this is your `DATABASE_URL`

---

## Method 2: Reset Database Password (If You Don't Remember It)

If you don't remember your database password:

1. **Go to Supabase Dashboard**
   - Settings → Database

2. **Find "Database Password" section**
   - Look for **"Database password"** or **"Reset database password"** button

3. **Reset the Password**
   - Click **"Reset database password"** or **"Generate new password"**
   - Copy the new password that appears
   - **Important:** Save this password - you'll need it!

4. **Build the Connection String**
   - Format: `postgresql://postgres:[NEW-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`
   - Replace `[NEW-PASSWORD]` with the password you just generated
   - Make sure to URL-encode any special characters in the password

---

## Method 3: Use Connection Pooling (Alternative)

Supabase also provides a **Connection Pooling** connection string that uses a different port (6543 instead of 5432):

1. **Go to Settings → Database**
2. **Click "Connection pooling" tab** under Connection string
3. **Copy the connection string** (it uses port 6543)
4. **This should work too!** The format will be:
   ```
   postgresql://postgres.jfbgdxeumzqzigptbmvp:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

---

## URL Encoding Password

If your password contains special characters, you need to URL-encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `=` becomes `%3D`
- `+` becomes `%2B`
- ` ` (space) becomes `%20`

---

## Quick Checklist

- [ ] Go to Supabase Dashboard → Settings → Database
- [ ] Find "Connection string" section
- [ ] Click "URI" tab
- [ ] Copy the connection string
- [ ] If password is shown as `[YOUR-PASSWORD]`, either:
  - [ ] Replace with your known password
  - [ ] OR reset password and use the new one
- [ ] Use this as your `DATABASE_URL` in Vercel

---

## Example

Your final `DATABASE_URL` should look like:

```
postgresql://postgres:your-actual-password-here@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
```

Or with connection pooling:

```
postgresql://postgres.jfbgdxeumzqzigptbmvp:your-actual-password-here@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## Still Can't Find It?

If you're having trouble:

1. **Check Supabase Project Settings**
   - Make sure you're the project owner or have admin access
   - Some connection info is only visible to project owners

2. **Check Email**
   - When you created the Supabase project, you may have received an email with the password

3. **Use Supabase SQL Editor**
   - Go to SQL Editor in Supabase
   - You might see connection info there

4. **Contact Support**
   - Supabase has helpful support - they can help you reset or find your database password

---

## For Vercel

Once you have the connection string:

1. Copy it completely
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Add new variable:
   - **Key:** `DATABASE_URL`
   - **Value:** `[paste your connection string here]`
   - **Environments:** Select all three (Production, Preview, Development)
