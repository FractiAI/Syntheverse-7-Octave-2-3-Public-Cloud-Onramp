# 📍 Step-by-Step: Find Database Connection String in Supabase UI

## Exact Navigation Path

### Step 1: Open Supabase Dashboard
1. Open your web browser
2. Go to: **https://app.supabase.io/**
3. **Sign in** to your account

### Step 2: Select Your Project
1. You'll see a list of your projects
2. Look for project: **`jfbgdxeumzqzigptbmvp`**
   - OR look for your project name if you named it differently
3. **Click on the project** to open it

### Step 3: Open Settings
1. Look at the **left sidebar** (vertical menu on the left side)
2. Scroll down if needed
3. Find and click the **⚙️ Settings** icon (gear/cog icon)
   - Usually near the bottom of the sidebar
   - May be labeled "Settings" or just be an icon

### Step 4: Click "Database"
1. In the Settings page, you'll see multiple options/tabs:
   - General
   - API
   - **Database** ← **Click this one**
   - Auth
   - Storage
   - etc.
2. **Click on "Database"**

### Step 5: Scroll to Connection String Section
1. The Database settings page will load
2. **Scroll down** on the page
3. Look for a section called one of these:
   - **"Connection string"**
   - **"Connection info"**
   - **"Connection parameters"**
   - **"Database connection"**

### Step 6: Look for Tabs
1. Above the connection string box, you should see **tabs** like:
   - **URI** (this is what we need!)
   - JDBC
   - **Connection pooling** (alternative option)
   - Node.js
   - Python
   - etc.

2. **Click on the "URI" tab** first

### Step 7: Copy the Connection String
1. You should see a connection string in a text box that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[HOSTNAME]:5432/postgres
   ```
   
   OR it might show:
   ```
   postgresql://postgres:your-actual-password@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
   ```

2. **Copy the entire connection string** (click in the box, select all, copy)

3. **Important:** Note what the **hostname** is - it should be visible in the connection string
   - It might be `db.jfbgdxeumzqzigptbmvp.supabase.co`
   - OR it might be something different like a pooler hostname

### Step 8 (Alternative): Try Connection Pooling Tab
If the URI tab doesn't work or you want to try connection pooling:

1. Click on the **"Connection pooling"** tab
2. You'll see a different connection string format like:
   ```
   postgresql://postgres.jfbgdxeumzqzigptbmvp:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
3. **Copy this one instead** if the direct connection doesn't work

---

## Visual Guide (What You Should See)

```
Supabase Dashboard Layout:

┌─────────────────────────────────────────────┐
│  Supabase Logo                    [Profile] │
├──────────┬──────────────────────────────────┤
│          │  Project: jfbgdxeumzqzigptbmvp   │
│ Table    │                                  │
│ Editor   │  ┌──────────────────────────┐   │
│ SQL      │  │ Settings → Database      │   │
│ Auth     │  │                          │   │
│ Storage  │  │  Connection string       │   │
│ ...      │  │  [URI] [JDBC] [Pooling] │   │
│          │  │  ┌────────────────────┐  │   │
│ ⚙️       │  │  │ postgresql://... │  │ ← Copy this!
│ Settings │  │  └────────────────────┘  │   │
└──────────┴──────────────────────────────────┘
```

---

## Direct Link (May Work)

Try this direct link to go straight to Database settings:
**https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/database**

---

## What If You Don't See "Connection string"?

If you don't see a "Connection string" section:

1. **Look for "Database Password"** section
   - You can reset your password here
   - Then build the connection string manually

2. **Check "Connection Pooling"** section
   - Might be a separate section
   - Has its own connection string

3. **Check "Connection Info"** or **"Connection Parameters"**
   - Might be labeled differently

---

## Once You Find It

**Copy the ENTIRE connection string** including:
- The protocol: `postgresql://`
- The username: `postgres`
- The password: (whatever is shown)
- The hostname: (the @ symbol followed by the hostname)
- The port: `:5432` or `:6543`
- The database: `/postgres`

**Example of what to copy:**
```
postgresql://postgres:7XGuw9RZyd2gG6JZ@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
```

OR if using pooling:
```
postgresql://postgres.jfbgdxeumzqzigptbmvp:7XGuw9RZyd2gG6JZ@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## Quick Checklist

- [ ] Opened https://app.supabase.io/
- [ ] Selected project `jfbgdxeumzqzigptbmvp`
- [ ] Clicked ⚙️ Settings in left sidebar
- [ ] Clicked "Database" in settings
- [ ] Scrolled to "Connection string" section
- [ ] Clicked "URI" tab (or "Connection pooling" tab)
- [ ] Copied the entire connection string
- [ ] Noted what hostname is shown

---

**Once you have the connection string, paste it here and I'll update it in Vercel!**


