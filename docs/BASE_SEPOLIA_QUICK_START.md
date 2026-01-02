# Base Sepolia Quick Start Guide

## Current Setup Status

✅ **Network**: Base Sepolia (Chain ID: 84532)  
✅ **RPC URL**: https://sepolia.base.org  
✅ **Configuration**: Updated in `.env` file

---

## Next Steps

### 1. Get Sepolia ETH for Testing

You need ETH on Base Sepolia for gas fees:

1. Go to Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet (MetaMask, etc.)
3. Request Sepolia ETH (usually 0.1-0.5 ETH per request)
4. Wait for the transaction to confirm

**Your wallet address**: Check your `.env` file `DEPLOYER_ADDRESS` or run the test script to see it.

---

### 2. Deploy Contracts to Base Sepolia (If Needed)

The Genesis contracts are deployed on Base **mainnet**. For testing on Sepolia, you have two options:

#### Option A: Deploy Test Contracts to Sepolia

If you want to test the full functionality, deploy the contracts to Base Sepolia:

```bash
cd syntheverse-ui/src/blockchain/contracts
npx hardhat deploy --network base_sepolia
```

This will deploy:
- SyntheverseGenesisSYNTH90T
- SyntheverseGenesisLensKernel

Then update your `.env` with the new Sepolia contract addresses.

#### Option B: Test Network Connection Only

You can test the network connection, wallet balance, and gas estimation without deploying contracts. The test script will verify:
- ✅ Network connectivity
- ✅ Wallet balance
- ✅ Gas estimation
- ⚠️ Contract addresses (will show as not deployed if using mainnet addresses)

---

### 3. Run the Test Script

Test your Base Sepolia setup:

```bash
npx tsx scripts/test-base-sepolia.ts
```

This will check:
- ✅ Environment variables
- ✅ Network connection
- ✅ Wallet balance
- ✅ Gas prices
- ✅ Contract access (if deployed)

---

### 4. Test Checklist

Before testing on Sepolia, ensure:

- [ ] `BLOCKCHAIN_NETWORK=base_sepolia` in `.env`
- [ ] `BLOCKCHAIN_PRIVATE_KEY` is set in `.env`
- [ ] Wallet has Sepolia ETH (check balance in test script)
- [ ] Contracts deployed to Sepolia (if testing full functionality)
- [ ] Sepolia contract addresses updated in `.env` (if deployed)

---

## Testing Workflow

### Step 1: Network & Balance Check
```bash
npx tsx scripts/test-base-sepolia.ts
```

### Step 2: Deploy Contracts (if needed)
```bash
cd syntheverse-ui/src/blockchain/contracts
npx hardhat deploy --network base_sepolia
```

### Step 3: Update Contract Addresses
Update `.env` with Sepolia contract addresses from deployment output.

### Step 4: Test Integration
Test the blockchain integration functions:
- Token allocation
- Event querying
- Transaction verification

---

## Base Sepolia Resources

- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **RPC**: https://sepolia.base.org
- **Chain ID**: 84532

---

## Troubleshooting

### "Insufficient funds"
- Get Sepolia ETH from the faucet
- Check balance: https://sepolia.basescan.org/address/YOUR_ADDRESS

### "Contract not found"
- Contracts may not be deployed on Sepolia yet
- Deploy contracts or use mainnet addresses for network testing only

### "Network error"
- Verify RPC URL is correct: `https://sepolia.base.org`
- Check internet connection
- Try alternative RPC provider if needed

---

## Ready to Test?

Run the test script now:
```bash
npx tsx scripts/test-base-sepolia.ts
```

This will show you:
- Your wallet address
- Current balance
- Whether you have enough gas
- Network connectivity status

