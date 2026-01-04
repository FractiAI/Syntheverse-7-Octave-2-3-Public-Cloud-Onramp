# Vercel Base Sepolia Setup Guide

## Setting Up Environment Variables in Vercel

To test Base Sepolia from your deployed Vercel server, you need to configure environment variables in the Vercel dashboard.

---

## Step 1: Access Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

---

## Step 2: Add Required Environment Variables

Add the following environment variables:

### Base Network Configuration

| Variable Name          | Value                      | Environment                            |
| ---------------------- | -------------------------- | -------------------------------------- |
| `BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` | All (Production, Preview, Development) |
| `BASE_MAINNET_RPC_URL` | `https://mainnet.base.org` | Production only                        |
| `BLOCKCHAIN_NETWORK`   | `base_sepolia`             | Preview, Development                   |
| `BLOCKCHAIN_NETWORK`   | `base_mainnet`             | Production                             |

### Genesis Contract Addresses

| Variable Name                  | Value                                        | Environment |
| ------------------------------ | -------------------------------------------- | ----------- |
| `SYNTH90T_CONTRACT_ADDRESS`    | `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3` | All         |
| `LENS_KERNEL_CONTRACT_ADDRESS` | `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8` | All         |
| `MOTHERLODE_VAULT_ADDRESS`     | `0x3563388d0e1c2d66a004e5e57717dc6d7e568be3` | All         |

### Deployment Wallet (SECURE)

| Variable Name            | Value   | Environment | Notes                                           |
| ------------------------ | ------- | ----------- | ----------------------------------------------- |
| `BLOCKCHAIN_PRIVATE_KEY` | `0x...` | All         | ⚠️ **SECURE** - Use test wallet for Preview/Dev |
| `DEPLOYER_ADDRESS`       | `0x...` | All         | Public address (for reference)                  |

### Optional

| Variable Name      | Value      | Environment |
| ------------------ | ---------- | ----------- |
| `BASESCAN_API_KEY` | `your_key` | All         |

---

## Step 3: Environment-Specific Configuration

### For Preview/Development (Base Sepolia Testing)

```
BLOCKCHAIN_NETWORK=base_sepolia
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BLOCKCHAIN_PRIVATE_KEY=<test_wallet_private_key>
DEPLOYER_ADDRESS=<test_wallet_address>
```

**Important**: Use a **test wallet** with Sepolia ETH for Preview/Development environments.

### For Production (Base Mainnet)

```
BLOCKCHAIN_NETWORK=base_mainnet
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BLOCKCHAIN_PRIVATE_KEY=<production_wallet_private_key>
DEPLOYER_ADDRESS=<production_wallet_address>
```

**Important**: Use a **secure production wallet** with mainnet ETH for Production.

---

## Step 4: Test the Setup

After adding environment variables, redeploy your application and test:

### Test Endpoint

Access the test endpoint at:

```
https://your-app.vercel.app/api/test/base-sepolia
```

Or for preview deployments:

```
https://your-app-git-branch.vercel.app/api/test/base-sepolia
```

### Expected Response

The endpoint returns a JSON response with:

- Network connection status
- Wallet balance
- Gas estimation
- Contract access
- Transaction capability

Example successful response:

```json
{
  "timestamp": "2025-01-XX...",
  "network": "Base Sepolia",
  "tests": {
    "networkConnection": { "status": "PASS", ... },
    "walletBalance": { "status": "PASS", "balance": "0.5 ETH", ... },
    "gasEstimation": { "status": "PASS", ... },
    ...
  },
  "summary": {
    "status": "SUCCESS",
    "message": "✅ Ready for testing on Base Sepolia!",
    "readyForTesting": true
  }
}
```

---

## Step 5: Verify Environment Variables

You can verify your environment variables are set correctly by checking the test endpoint response. It will show:

- Which variables are set
- Network configuration
- Connection status

---

## Security Best Practices

1. **Separate Wallets**:
   - Use different wallets for testnet (Preview/Dev) and mainnet (Production)
   - Never use production wallet private keys in test environments

2. **Private Key Security**:
   - Never commit private keys to git
   - Only store in Vercel environment variables
   - Use test wallets with minimal funds for testing

3. **Environment Isolation**:
   - Set different `BLOCKCHAIN_NETWORK` values per environment
   - Use testnet for Preview/Development
   - Use mainnet only for Production

---

## Troubleshooting

### "BLOCKCHAIN_PRIVATE_KEY is not set"

- Add the private key to Vercel environment variables
- Ensure it's set for the correct environment (Preview/Production)

### "Network connection failed"

- Verify `BASE_SEPOLIA_RPC_URL` is correct
- Check if RPC endpoint is accessible
- Try alternative RPC provider if needed

### "Insufficient balance"

- Get Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Verify wallet address in test response
- Check balance on BaseScan Sepolia

### "Contract not deployed"

- This is expected if using mainnet contract addresses on Sepolia
- Deploy contracts to Sepolia if you need full functionality testing
- Or test network connectivity only

---

## Quick Checklist

Before testing on Vercel:

- [ ] Environment variables added to Vercel
- [ ] `BLOCKCHAIN_NETWORK=base_sepolia` for Preview/Dev
- [ ] `BLOCKCHAIN_PRIVATE_KEY` set (test wallet)
- [ ] `DEPLOYER_ADDRESS` set (test wallet address)
- [ ] Test wallet has Sepolia ETH
- [ ] Application redeployed after adding variables
- [ ] Test endpoint accessible: `/api/test/base-sepolia`

---

## Next Steps

1. Add environment variables to Vercel
2. Redeploy your application
3. Access `/api/test/base-sepolia` endpoint
4. Review test results
5. Fix any issues
6. Proceed with testing PoC submission workflow

---

## Test Endpoint Details

**URL**: `/api/test/base-sepolia`  
**Method**: GET  
**Authentication**: None (public endpoint for testing)  
**Response**: JSON with test results

**Note**: Consider adding authentication to this endpoint in production to prevent unauthorized access.
