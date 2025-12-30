#!/bin/bash

echo "🌐 Deploying source code directly to Vercel..."
echo "Vercel will handle building and dependencies"

# Deploy source code only - Vercel builds it
VERCEL_TOKEN="Fd9bCTAseZ8AhTwGMgEL1IbX" npx vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo "Vercel will:"
echo "  1. Pull your source code"
echo "  2. Install dependencies (including pdfreader)"
echo "  3. Build the application"
echo "  4. Deploy to production"
echo ""
echo "Monitor deployment at: https://vercel.com/dashboard"
echo ""
echo "🎉 Your PDF extraction will work once deployment completes!"
