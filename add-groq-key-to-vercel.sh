#!/bin/bash
# Add Groq API Key to Vercel Environment Variables
# Run this script after authenticating with: vercel login

set -e

# Get API key from environment variable or prompt user
if [ -z "$GROQ_API_KEY" ]; then
    echo "Enter your Groq API Key:"
    read -r API_KEY
else
    API_KEY="$GROQ_API_KEY"
fi

echo "Adding GROQ_API_KEY to Vercel environment variables..."
echo ""

# Add to Production
echo "✓ Adding to Production environment..."
echo "$API_KEY" | vercel env add GROQ_API_KEY production

# Add to Preview
echo "✓ Adding to Preview environment..."
echo "$API_KEY" | vercel env add GROQ_API_KEY preview

# Add to Development
echo "✓ Adding to Development environment..."
echo "$API_KEY" | vercel env add GROQ_API_KEY development

echo ""
echo "✅ GROQ_API_KEY successfully added to all Vercel environments!"
echo ""
echo "Next steps:"
echo "1. Test with a new submission at https://syntheverse-poc.vercel.app/submit"
echo "2. Check logs to verify evaluation completes successfully"
