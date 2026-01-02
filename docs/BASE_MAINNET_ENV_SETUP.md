# Base Mainnet Environment Variables Setup

This document describes the environment variables required for Base mainnet integration with Syntheverse Genesis contracts.

## Overview

The dashboard has been migrated from Hardhat test environments to Base mainnet. The following environment variables are required for proper operation.

---

## Required Environment Variables

### 1. Base Network Configuration

#### `BASE_MAINNET_RPC_URL`
**Required**: Base mainnet RPC endpoint URL

**Default**: `https://mainnet.base.org`

**Example**:
```bash
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

**Alternative RPC Providers** (if needed):
- Alchemy: `https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- Infura: `https://base-mainnet.infura.io/v3/YOUR_API_KEY`
- QuickNode: `https://YOUR_ENDPOINT.base-mainnet.quiknode.pro/YOUR_API_KEY`

**How to get**:
- Use the public Base RPC: `https://mainnet.base.org` (free, rate-limited)
- For production, consider using Alchemy, Infura, or QuickNode for better reliability

---

#### `BASE_SEPOLIA_RPC_URL`
**Required for Testing**: Base Sepolia testnet RPC endpoint URL

**Default**: `https://sepolia.base.org`

**Example**:
```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

**Usage**: Use this for testing on Base Sepolia testnet before deploying to mainnet.

---

#### `BLOCKCHAIN_NETWORK`
**Optional**: Network selection (defaults to `base_mainnet`)

**Values**:
- `base_mainnet` - Base mainnet (production)
- `base_sepolia` - Base Sepolia testnet (testing)

**Example**:
```bash
BLOCKCHAIN_NETWORK=base_mainnet
```

---

### 2. Genesis Contract Addresses

#### `SYNTH90T_CONTRACT_ADDRESS`
**Required**: SyntheverseGenesisSYNTH90T contract address

**Value**: `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3`

**Example**:
```bash
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
```

**Explorer**: https://basescan.org/address/0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3

**Purpose**: ERC-20 token contract for 90T SYNTH with Gold/Silver/Copper semantics.

---

#### `LENS_KERNEL_CONTRACT_ADDRESS`
**Required**: SyntheverseGenesisLensKernel contract address

**Value**: `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8`

**Example**:
```bash
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
```

**Explorer**: https://basescan.org/address/0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8

**Purpose**: Stateless event emitter for Syntheverse Lens protocol.

---

#### `MOTHERLODE_VAULT_ADDRESS`
**Optional**: Motherlode vault address (for reference)

**Value**: `0x3563388d0e1c2d66a004e5e57717dc6d7e568be3`

**Example**:
```bash
MOTHERLODE_VAULT_ADDRESS=0x3563388d0e1c2d66a004e5e57717dc6d7e568be3
```

**Explorer**: https://basescan.org/address/0x3563388d0e1c2d66a004e5e57717dc6d7e568be3

**Purpose**: Vault address for token allocations (reference only).

---

### 3. Deployment Wallet

#### `BLOCKCHAIN_PRIVATE_KEY`
**Required**: Private key of the wallet authorized to interact with Genesis contracts

**Security Warning**: 
- ⚠️ **NEVER commit this to git**
- ⚠️ Store securely in Vercel environment variables only
- ⚠️ This wallet must be authorized (owner) for contract interactions
- ⚠️ Ensure the wallet has sufficient ETH for gas fees on Base
- ⚠️ Use separate wallets for testnet/mainnet

**Format**: Private key as hex string (with or without `0x` prefix)

**Example**:
```bash
BLOCKCHAIN_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**How to get**:
1. Generate a new secure wallet (using MetaMask, Hardhat, or other tools)
2. Export the private key (keep it secure!)
3. Fund the wallet with ETH on Base mainnet (for gas fees)
4. Set as environment variable in Vercel

**Gas Requirements**:
- Base mainnet has very low gas costs (~0.1 gwei)
- Recommended: Keep at least 0.01 ETH in wallet for gas
- Monitor gas usage and refill as needed

---

#### `DEPLOYER_ADDRESS`
**Optional**: Deployer wallet address (for reference)

**Example**:
```bash
DEPLOYER_ADDRESS=0x1234567890123456789012345678901234567890
```

**Purpose**: Public address of the deployment wallet (for reference and verification).

---

### 4. Contract Verification

#### `BASESCAN_API_KEY`
**Optional**: BaseScan API key for contract verification

**How to get**:
1. Go to https://basescan.org/
2. Create an account
3. Go to API-KEYs section
4. Generate a new API key
5. Copy the API key

**Example**:
```bash
BASESCAN_API_KEY=your_basescan_api_key_here
```

**Purpose**: Used by Hardhat for automatic contract verification on BaseScan.

---

## Environment Variable Setup

### For Local Development

Create a `.env.local` file in the project root:

```bash
# Base Network Configuration
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BLOCKCHAIN_NETWORK=base_mainnet

# Genesis Contract Addresses
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
MOTHERLODE_VAULT_ADDRESS=0x3563388d0e1c2d66a004e5e57717dc6d7e568be3

# Deployment Wallet (SECURE - NEVER COMMIT)
BLOCKCHAIN_PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...

# Contract Verification (Optional)
BASESCAN_API_KEY=your_api_key_here
```

### For Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each environment variable:
   - Click "Add New"
   - Enter variable name
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click "Save"
3. Redeploy your application after adding variables

**Important**: 
- Set `BLOCKCHAIN_NETWORK=base_sepolia` for preview/development environments
- Set `BLOCKCHAIN_NETWORK=base_mainnet` for production environment
- Never commit private keys to git

---

## Deprecated Variables

The following variables are deprecated and should be removed:

### `HARDHAT_RPC_URL`
**Status**: Deprecated  
**Replacement**: `BASE_MAINNET_RPC_URL` or `BASE_SEPOLIA_RPC_URL`

### `POC_REGISTRY_ADDRESS`
**Status**: Deprecated  
**Replacement**: Use `SYNTH90T_CONTRACT_ADDRESS` and `LENS_KERNEL_CONTRACT_ADDRESS`

**Migration Note**: The old POCRegistry contract is no longer used. The dashboard now integrates directly with Genesis contracts.

---

## Network Information

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: `https://mainnet.base.org`
- **Block Explorer**: https://basescan.org
- **Native Currency**: ETH
- **Gas Price**: ~0.1 gwei (very low)
- **Average Block Time**: ~2 seconds

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: https://sepolia.basescan.org
- **Native Currency**: ETH (testnet)
- **Gas Price**: ~0.1 gwei
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## Verification Checklist

After setting up environment variables, verify:

- [ ] `BASE_MAINNET_RPC_URL` is accessible
- [ ] `SYNTH90T_CONTRACT_ADDRESS` matches deployed contract
- [ ] `LENS_KERNEL_CONTRACT_ADDRESS` matches deployed contract
- [ ] `BLOCKCHAIN_PRIVATE_KEY` is set (and secure)
- [ ] Wallet has sufficient ETH for gas fees
- [ ] `BLOCKCHAIN_NETWORK` is set correctly (base_mainnet for production)
- [ ] All variables are set in Vercel (if deploying)

---

## Testing

### Test on Base Sepolia First

1. Set `BLOCKCHAIN_NETWORK=base_sepolia`
2. Set `BASE_SEPOLIA_RPC_URL=https://sepolia.base.org`
3. Use testnet contract addresses (if different from mainnet)
4. Test all functionality
5. Verify transactions on BaseScan Sepolia
6. Once verified, switch to mainnet

### Test on Base Mainnet

1. Set `BLOCKCHAIN_NETWORK=base_mainnet`
2. Set `BASE_MAINNET_RPC_URL=https://mainnet.base.org`
3. Use mainnet contract addresses
4. Test with small amounts first
5. Monitor gas costs
6. Verify transactions on BaseScan

---

## Troubleshooting

### Error: "Base mainnet configuration not available"
- Check that `BLOCKCHAIN_PRIVATE_KEY` is set
- Verify RPC URL is correct
- Check network connectivity

### Error: "Insufficient funds in wallet for gas fees"
- Fund wallet with ETH on Base mainnet
- Check wallet balance: https://basescan.org/address/YOUR_ADDRESS
- Base gas costs are very low (~$0.01 per transaction)

### Error: "Invalid contract address"
- Verify contract addresses match deployed contracts
- Check BaseScan for contract verification
- Ensure addresses are correct for the selected network

### Error: "Transaction reverted"
- Check contract owner permissions
- Verify contract is deployed correctly
- Check gas limit (should be sufficient)
- Review contract logs on BaseScan

### Error: "Network error"
- Verify RPC URL is correct and accessible
- Check network connectivity
- Try alternative RPC provider (Alchemy, Infura)
- For Vercel deployments, ensure RPC URL is publicly accessible

---

## Security Best Practices

1. **Private Key Security**:
   - Never commit private keys to git
   - Use Vercel environment variables for production
   - Use separate wallets for testnet/mainnet
   - Consider hardware wallet for production deployments
   - Rotate keys periodically

2. **Network Security**:
   - Always test on testnet first
   - Use reputable RPC providers for production
   - Monitor gas costs and wallet balance
   - Set up alerts for low balance

3. **Contract Verification**:
   - Verify all contract addresses before use
   - Check contract source code on BaseScan
   - Verify contract owner addresses
   - Monitor contract events

---

## Additional Resources

- **Base Documentation**: https://docs.base.org
- **BaseScan Explorer**: https://basescan.org
- **Base RPC Endpoints**: https://docs.base.org/tools/network-faucets
- **Hardhat Base Guide**: https://hardhat.org/hardhat-runner/docs/guides/base-tutorial

---

## Support

For issues or questions:
1. Check Base documentation: https://docs.base.org
2. Review contract addresses on BaseScan
3. Verify environment variables are set correctly
4. Check transaction logs on BaseScan
5. Review error messages in application logs

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0


