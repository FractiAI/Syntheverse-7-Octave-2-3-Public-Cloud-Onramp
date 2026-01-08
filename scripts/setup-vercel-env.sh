#!/bin/bash

# ============================================
# Setup Vercel Environment Variables via CLI
# ============================================

set -e  # Exit on error

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Vercel token
export VERCEL_TOKEN="sFGpBCc64T0Qn5aGCOksY7zm"

# Groq API Key (replace with your actual key)
GROQ_API_KEY="gsk_[YOUR_GROQ_API_KEY_HERE]"

echo "📝 Setting NEXT_PUBLIC_GROQ_API_KEY (primary - correct spelling)..."

# Set for Production
vercel env add NEXT_PUBLIC_GROQ_API_KEY production --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

# Set for Preview
vercel env add NEXT_PUBLIC_GROQ_API_KEY preview --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

# Set for Development
vercel env add NEXT_PUBLIC_GROQ_API_KEY development --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

echo "✅ NEXT_PUBLIC_GROQ_API_KEY set for all environments"
echo ""

echo "📝 Setting NEXT_PUBLIC_GROK_API_KEY (legacy - backwards compatibility)..."

# Set for Production
vercel env add NEXT_PUBLIC_GROK_API_KEY production --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

# Set for Preview
vercel env add NEXT_PUBLIC_GROK_API_KEY preview --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

# Set for Development
vercel env add NEXT_PUBLIC_GROK_API_KEY development --token=$VERCEL_TOKEN <<EOF
$GROQ_API_KEY
EOF

echo "✅ NEXT_PUBLIC_GROK_API_KEY set for all environments"
echo ""

echo "📋 Listing all environment variables..."
vercel env ls --token=$VERCEL_TOKEN

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Trigger a redeploy: vercel --prod --token=$VERCEL_TOKEN"
echo "   2. Or git push to trigger automatic deployment"
echo "   3. Test submission after deployment"
echo ""
