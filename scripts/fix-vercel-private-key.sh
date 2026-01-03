#!/bin/bash

# Fix Vercel Private Key - Add 0x prefix if missing
# This script updates the BLOCKCHAIN_PRIVATE_KEY in Vercel to ensure it has 0x prefix

set -e

VERCEL_TOKEN="${VERCEL_TOKEN:-6oAJ9BkBmd2e9PCTxzBD4EX8}"

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is required"
    echo "   Usage: PRIVATE_KEY=your_key_here ./scripts/fix-vercel-private-key.sh"
    exit 1
fi

echo "🔧 Fixing private key in Vercel..."
echo ""

# Ensure private key has 0x prefix
PRIVATE_KEY_FIXED="$PRIVATE_KEY"
if [[ ! "$PRIVATE_KEY_FIXED" =~ ^0x ]]; then
    PRIVATE_KEY_FIXED="0x$PRIVATE_KEY_FIXED"
    echo "📝 Added 0x prefix to private key"
fi

# Environments to update
ENVIRONMENTS=("production" "preview" "development")

for env in "${ENVIRONMENTS[@]}"; do
    echo "📝 Updating $env environment..."
    
    # Remove old private key (if exists)
    vercel env rm BLOCKCHAIN_PRIVATE_KEY "$env" --token="$VERCEL_TOKEN" --yes 2>/dev/null || true
    
    # Add new private key with 0x prefix
    echo "$PRIVATE_KEY_FIXED" | vercel env add BLOCKCHAIN_PRIVATE_KEY "$env" --token="$VERCEL_TOKEN"
    echo "  ✅ Updated BLOCKCHAIN_PRIVATE_KEY (with 0x prefix)"
    
    echo ""
done

echo "✅ Private key updated successfully!"
echo ""
echo "⚠️  Note: Vercel deployments will automatically pick up the new environment variable."
echo "   You may need to trigger a new deployment for changes to take effect."

