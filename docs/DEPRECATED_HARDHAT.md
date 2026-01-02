# Deprecated: Hardhat Integration

> ⚠️ **This integration has been deprecated and replaced with Base Mainnet/Testnet**

## Migration Status

The Syntheverse PoC Contributor Dashboard has been migrated from Hardhat to **Base Mainnet** and **Base Sepolia Testnet**.

**Migration Date**: January 2025  
**Status**: Phase 1 Complete

## Current Setup

- **Network**: Base Mainnet (Chain ID: 8453) for production
- **Testnet**: Base Sepolia (Chain ID: 84532) for testing
- **RPC**: `https://mainnet.base.org` / `https://sepolia.base.org`
- **Block Explorer**: https://basescan.org

## New Documentation

For current setup instructions, see:

- **Base Mainnet Setup**: [`docs/BASE_MAINNET_ENV_SETUP.md`](BASE_MAINNET_ENV_SETUP.md)
- **Base Sepolia Quick Start**: [`docs/BASE_SEPOLIA_QUICK_START.md`](BASE_SEPOLIA_QUICK_START.md)
- **Migration Plan**: [`docs/BASE_MAINNET_MIGRATION_PLAN.md`](BASE_MAINNET_MIGRATION_PLAN.md)
- **Migration Summary**: [`docs/BASE_MAINNET_MIGRATION_SUMMARY.md`](BASE_MAINNET_MIGRATION_SUMMARY.md)

## Deprecated Files

The following files are kept for historical reference but are no longer used:

- `docs/HARDHAT_BLOCKCHAIN_SETUP.md` - Old Hardhat setup (deprecated)
- `docs/HARDHAT_IMPLEMENTATION_SUMMARY.md` - Old implementation summary (deprecated)
- `docs/VERCEL_BLOCKCHAIN_ENV_SETUP.md` - Old Vercel setup (deprecated)

## Environment Variables Changed

### Old (Hardhat)
```env
HARDHAT_RPC_URL=http://localhost:8545
POC_REGISTRY_ADDRESS=0x...
```

### New (Base)
```env
BLOCKCHAIN_NETWORK=base_mainnet  # or base_sepolia
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
```

## Why Base?

- ✅ **Public Mainnet**: Contracts deployed on public blockchain
- ✅ **Low Gas Costs**: ~0.1 gwei (very low fees)
- ✅ **Production Ready**: Real blockchain with public explorers
- ✅ **Genesis Contracts**: Using official Syntheverse Genesis contracts
- ✅ **Scalability**: Base L2 provides high throughput
- ✅ **Ecosystem**: Part of Coinbase's Base ecosystem

## Questions?

See the migration documentation or open an issue on GitHub.

