#!/bin/bash

# Setup Vercel Environment Variables for Base Sepolia
# Usage: ./scripts/setup-vercel-env.sh

set -e

VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"

echo "🚀 Setting up Vercel environment variables..."
echo ""

# Base Network Configuration
echo "📡 Adding Base network RPC URLs..."
echo "https://mainnet.base.org" | vercel env add BASE_MAINNET_RPC_URL production --token="$VERCEL_TOKEN"
echo "https://mainnet.base.org" | vercel env add BASE_MAINNET_RPC_URL preview --token="$VERCEL_TOKEN"
echo "https://mainnet.base.org" | vercel env add BASE_MAINNET_RPC_URL development --token="$VERCEL_TOKEN"

echo "https://sepolia.base.org" | vercel env add BASE_SEPOLIA_RPC_URL production --token="$VERCEL_TOKEN"
echo "https://sepolia.base.org" | vercel env add BASE_SEPOLIA_RPC_URL preview --token="$VERCEL_TOKEN"
echo "https://sepolia.base.org" | vercel env add BASE_SEPOLIA_RPC_URL development --token="$VERCEL_TOKEN"

# Network Selection
echo ""
echo "🌐 Adding network selection..."
echo "base_mainnet" | vercel env add BLOCKCHAIN_NETWORK production --token="$VERCEL_TOKEN"
echo "base_sepolia" | vercel env add BLOCKCHAIN_NETWORK preview --token="$VERCEL_TOKEN"
echo "base_sepolia" | vercel env add BLOCKCHAIN_NETWORK development --token="$VERCEL_TOKEN"

# Genesis Contract Addresses
echo ""
echo "📝 Adding Genesis contract addresses..."
echo "0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3" | vercel env add SYNTH90T_CONTRACT_ADDRESS production --token="$VERCEL_TOKEN"
echo "0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3" | vercel env add SYNTH90T_CONTRACT_ADDRESS preview --token="$VERCEL_TOKEN"
echo "0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3" | vercel env add SYNTH90T_CONTRACT_ADDRESS development --token="$VERCEL_TOKEN"

echo "0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8" | vercel env add LENS_KERNEL_CONTRACT_ADDRESS production --token="$VERCEL_TOKEN"
echo "0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8" | vercel env add LENS_KERNEL_CONTRACT_ADDRESS preview --token="$VERCEL_TOKEN"
echo "0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8" | vercel env add LENS_KERNEL_CONTRACT_ADDRESS development --token="$VERCEL_TOKEN"

echo "0x3563388d0e1c2d66a004e5e57717dc6d7e568be3" | vercel env add MOTHERLODE_VAULT_ADDRESS production --token="$VERCEL_TOKEN"
echo "0x3563388d0e1c2d66a004e5e57717dc6d7e568be3" | vercel env add MOTHERLODE_VAULT_ADDRESS preview --token="$VERCEL_TOKEN"
echo "0x3563388d0e1c2d66a004e5e57717dc6d7e568be3" | vercel env add MOTHERLODE_VAULT_ADDRESS development --token="$VERCEL_TOKEN"

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "⚠️  IMPORTANT: You still need to add manually:"
echo "   - BLOCKCHAIN_PRIVATE_KEY (use: vercel env add BLOCKCHAIN_PRIVATE_KEY <environment> --token=\"\$VERCEL_TOKEN\")"
echo "   - DEPLOYER_ADDRESS (use: vercel env add DEPLOYER_ADDRESS <environment> --token=\"\$VERCEL_TOKEN\")"
echo "   - BASESCAN_API_KEY (optional)"
echo ""
echo "To add private key (example for preview):"
echo "  echo 'your_private_key_here' | vercel env add BLOCKCHAIN_PRIVATE_KEY preview --token=\"\$VERCEL_TOKEN\""

