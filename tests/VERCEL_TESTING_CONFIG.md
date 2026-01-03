# Vercel Server Testing Configuration

## Overview

All tests are configured to run on the **Vercel server**, not locally. Tests use **Hardhat emulating Base Mainnet** by forking Base Mainnet (not actual Base Mainnet, but emulated).

---

## Configuration

### Test Execution Environment

- **Location**: Vercel server (production/preview environments)
- **Network**: Hardhat emulating Base Mainnet (Chain ID: 8453)
- **Blockchain**: Hardhat forks Base Mainnet (emulates Base, not actual Base)
- **Hardhat**: Uses Hardhat local network forking Base Mainnet

### Environment Variables Required on Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Base Mainnet RPC (for actual blockchain)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
# OR for testing:
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Private key for actual blockchain transactions
PRIVATE_KEY=0x... (your actual private key)

# Database (Vercel Postgres)
DATABASE_URL=postgresql://... (Vercel provides this)
POSTGRES_URL=postgresql://... (Vercel provides this)

# Grok API for evaluation tests
NEXT_PUBLIC_GROK_API_KEY=... (your Grok API key)
```

---

## Hardhat Configuration

### Hardhat Emulating Base Mainnet (Forking)

The test suite is configured to use **Hardhat forking Base Mainnet** (emulates Base):

```typescript
// tests/utils/test-config.ts
hardhat: {
    network: 'hardhat', // Hardhat network
    rpcUrl: 'http://127.0.0.1:8545', // Hardhat local RPC
    forkUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org', // Base to fork
    chainId: 8453, // Base Mainnet chain ID (emulated)
    useForking: true, // Hardhat forks Base Mainnet
}
```

```javascript
// hardhat.config.js
hardhat: {
  chainId: 8453, // Emulate Base Mainnet
  forking: {
    url: "https://mainnet.base.org", // Fork from Base Mainnet
    enabled: true,
  },
}
```

### Network Selection Logic

1. **All Environments**: Uses `hardhat` network forking Base Mainnet
2. **Forking**: Hardhat forks Base Mainnet to emulate Base
3. **Chain ID**: 8453 (Base Mainnet chain ID, emulated by Hardhat)
4. **Always Forking**: `useForking: true` ensures Hardhat forks Base Mainnet

---

## Test Execution on Vercel

### Running Tests

Tests run automatically on Vercel:

1. **Build Time**: Tests can run during Vercel build
2. **API Route**: Tests can be triggered via API endpoint
3. **Cron Job**: Tests can run on schedule via Vercel Cron

### Test Report Storage

- **Location**: `/tmp/tests/reports` (Vercel writable directory)
- **Format**: JSON and HTML reports
- **Access**: Via API route `/api/test-report/latest`

---

## Hardhat Actual Network Setup

### Connection to Hardhat (Forking Base Mainnet)

```typescript
// tests/utils/hardhat-setup.ts
export async function setupHardhatNetwork() {
    // Connects to Hardhat local RPC (which forks Base Mainnet)
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
    
    // Uses Hardhat default accounts (work with forked Base)
    const wallet = new ethers.Wallet(HARDHAT_DEFAULT_PRIVATE_KEY, provider)
    
    // Verifies Hardhat network connection (forking Base)
    const blockNumber = await provider.getBlockNumber()
    console.log(`Connected to Hardhat (emulating Base Mainnet) at block ${blockNumber}`)
}
```

### Key Differences from Local Testing

| Aspect | Local (Old) | Vercel (Current) |
|--------|------------|------------------|
| **Network** | `localhost:8545` | `localhost:8545` (Hardhat) |
| **Forking** | None | Base Mainnet fork |
| **Chain ID** | 31337 | 8453 (Base Mainnet, emulated) |
| **Accounts** | Hardhat defaults | Hardhat defaults |
| **Responses** | Simulated | Base Mainnet state (forked) |
| **Execution** | Local machine | Vercel server |

---

## Verification

### Confirming Actual Network Usage

Tests will log:
```
🔗 Connecting to ACTUAL blockchain network: base_mainnet
📍 RPC URL: https://mainnet.base.org
🔢 Chain ID: 8453
✅ Using ACTUAL network responses (not simulated)
✓ Connected to ACTUAL Base Mainnet network at block 12345678
✓ Chain ID: 8453 (Base Mainnet)
```

### Confirming Vercel Execution

Check test logs for:
- Vercel environment variables loaded
- Base Mainnet RPC connection
- Actual blockchain block numbers
- Real transaction hashes (if applicable)

---

## Important Notes

### ⚠️ Hardhat Forking Base Mainnet

- **Forked State**: Tests use Base Mainnet state (forked by Hardhat)
- **No Real Transactions**: Transactions are on Hardhat local network (not actual Base)
- **No Gas Costs**: No real gas fees (Hardhat local network)
- **Account Balance**: Hardhat provides default accounts with ETH
- **Rate Limits**: Only for initial fork (one-time Base Mainnet RPC call)

### ✅ Benefits of Hardhat Forking

1. **Base-Compatible**: Tests validate against Base Mainnet state (forked)
2. **Fast Testing**: No real blockchain delays
3. **Deterministic**: Fork from specific block for consistency
4. **Contract Verification**: Tests verify actual deployed contracts (from fork)
5. **No Costs**: No real gas fees or transaction costs

### 🔒 Security

- **Private Keys**: Stored securely in Vercel environment variables
- **Never Committed**: Private keys never in code or git
- **Read-Only Tests**: Most tests are read-only (no transactions)
- **Test Accounts**: Use dedicated test accounts, not production

---

## Migration from Local Testing

### Before (Local, No Fork)
```typescript
// Local Hardhat node (no fork)
rpcUrl: 'http://127.0.0.1:8545'
network: 'hardhat'
chainId: 31337
```

### After (Vercel, Forking Base)
```typescript
// Hardhat forking Base Mainnet
rpcUrl: 'http://127.0.0.1:8545' // Hardhat local
network: 'hardhat'
forkUrl: 'https://mainnet.base.org' // Base to fork
chainId: 8453 // Base Mainnet (emulated)
useForking: true
```

---

## Troubleshooting

### Issue: Tests fail to connect

**Solution**: Verify `BASE_MAINNET_RPC_URL` is set in Vercel environment variables

### Issue: "PRIVATE_KEY required"

**Solution**: Set `PRIVATE_KEY` in Vercel environment variables (for tests that need signing)

### Issue: Tests timeout

**Solution**: Base Mainnet RPC may be rate-limited. Use a dedicated RPC provider (Alchemy, Infura)

### Issue: Account has no balance

**Solution**: Fund the test account with ETH on Base Mainnet (for gas fees)

---

## Summary

✅ **All tests run on Vercel server** (not locally)  
✅ **Hardhat emulates Base Mainnet** (forking Base Mainnet)  
✅ **Base-compatible testing** (forked Base Mainnet state)  
✅ **Fast, deterministic testing** (no real blockchain delays)

---

**Last Updated**: January 2025  
**Status**: ✅ Configured for Vercel server with actual Base Mainnet

