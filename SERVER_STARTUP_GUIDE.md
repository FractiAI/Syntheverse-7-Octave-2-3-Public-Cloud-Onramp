# 🚀 Complete Server Startup Guide

## Step 1: Kill Any Existing Processes
```bash
# Kill all Node.js processes
pkill -f node

# Kill specific port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Kill Next.js processes
pkill -f next

# Check what's running on port 3000
lsof -i :3000 2>/dev/null || echo 'Port 3000 is free'
```

## Step 2: Clean Install (if needed)
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

## Step 3: Verify Environment
```bash
# Check environment file
cat .env.local

# Should contain:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Start Development Server
```bash
npm run dev
```

## Step 5: Verify Server is Running
```bash
# Check if server responds
curl -s http://localhost:3000 | head -10

# Should see HTML content
```

## Expected Output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local
- Ready in 2.3s
✔ Compiled successfully
```

## Test URLs:
- Landing: http://localhost:3000
- Signup: http://localhost:3000/signup  
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

## If Issues:
- Check port 3000 isn't used: `netstat -tulpn | grep :3000`
- Clear Next.js cache: `rm -rf .next`
- Check Node version: `node --version` (should be 18+)
