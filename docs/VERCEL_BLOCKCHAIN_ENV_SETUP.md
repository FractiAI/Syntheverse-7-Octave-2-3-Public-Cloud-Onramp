# Vercel Blockchain Environment Variables Setup

> ⚠️ **DEPRECATED**: This document describes the old Hardhat setup. The dashboard now uses **Base Mainnet/Testnet**.  
> **See**: [`docs/VERCEL_BASE_SEPOLIA_SETUP.md`](VERCEL_BASE_SEPOLIA_SETUP.md) for current Vercel setup.  
> **See**: [`docs/BASE_MAINNET_ENV_SETUP.md`](BASE_MAINNET_ENV_SETUP.md) for Base mainnet environment variables.

## ✅ Environment Variables Added (Historical - Hardhat)

The following blockchain-related environment variables were used for Hardhat integration (now deprecated):

### 1. HARDHAT_RPC_URL
- **Value**: `http://localhost:8545`
- **Environment**: Production
- **Status**: ⚠️ **NOTE**: `localhost:8545` will NOT work for Vercel deployments!

**Important**: Vercel deployments run in the cloud and cannot access `localhost`. You need to:
- Use a remote Hardhat node (e.g., deployed to a server)
- Use a public RPC endpoint (Infura, Alchemy, etc.)
- Use a tunnel service (ngrok, etc.) for testing

**To update**: Run:
```bash
export VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"
vercel env rm HARDHAT_RPC_URL production --token="$VERCEL_TOKEN"
echo "https://your-remote-rpc-endpoint.com" | vercel env add HARDHAT_RPC_URL production --token="$VERCEL_TOKEN"
```

### 2. POC_REGISTRY_ADDRESS
- **Value**: `0x0000000000000000000000000000000000000000` (PLACEHOLDER)
- **Environment**: Production
- **Status**: ⚠️ **NEEDS UPDATE** - Set to actual deployed contract address

**To get the actual address**:
1. Deploy POCRegistry contract:
   ```bash
   cd syntheverse-ui/src/blockchain/contracts
   npx hardhat deploy --network hardhat
   ```
2. Copy the contract address from the deployment output
3. Update the environment variable:
   ```bash
   export VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"
   vercel env rm POC_REGISTRY_ADDRESS production --token="$VERCEL_TOKEN"
   echo "0x..." | vercel env add POC_REGISTRY_ADDRESS production --token="$VERCEL_TOKEN"
   ```

### 3. BLOCKCHAIN_PRIVATE_KEY
- **Value**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Environment**: Production
- **Status**: ⚠️ **WARNING**: This is Hardhat's default test account #0 private key

**Security Warning**: 
- ⚠️ This is a **known public test key** - NOT SECURE for production!
- ⚠️ Anyone with this key can control your contract!
- ⚠️ **Generate a new secure wallet for production**

**To update with a secure key**:
1. Generate a new wallet:
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Fund the wallet with ETH for gas fees
3. Deploy contract with this wallet
4. Update environment variable:
   ```bash
   export VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"
   vercel env rm BLOCKCHAIN_PRIVATE_KEY production --token="$VERCEL_TOKEN"
   echo "0x..." | vercel env add BLOCKCHAIN_PRIVATE_KEY production --token="$VERCEL_TOKEN"
   ```

## 🔧 Next Steps

### 1. Deploy POCRegistry Contract

```bash
cd syntheverse-ui/src/blockchain/contracts

# Start local Hardhat node (in separate terminal)
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat deploy --network localhost --tags POCRegistry
```

Copy the contract address from the output.

### 2. Update POC_REGISTRY_ADDRESS

```bash
export VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"
vercel env rm POC_REGISTRY_ADDRESS production --token="$VERCEL_TOKEN"
echo "YOUR_CONTRACT_ADDRESS" | vercel env add POC_REGISTRY_ADDRESS production --token="$VERCEL_TOKEN"
```

### 3. Set Up Remote RPC (Required for Vercel)

**Option A: Use a Public RPC Service**
- Sign up for Infura (https://infura.io) or Alchemy (https://alchemy.com)
- Create a new project
- Get your RPC endpoint URL
- Update `HARDHAT_RPC_URL`

**Option B: Deploy Hardhat Node**
- Deploy Hardhat node to a server (AWS, DigitalOcean, etc.)
- Expose RPC endpoint
- Update `HARDHAT_RPC_URL`

**Option C: Use a Tunnel (Testing Only)**
- Use ngrok: `ngrok http 8545`
- Use the ngrok URL as `HARDHAT_RPC_URL`
- ⚠️ Only for testing - not production!

### 4. Update BLOCKCHAIN_PRIVATE_KEY (Production)

Generate a secure private key and update it in Vercel.

## 📋 Verification

Check all environment variables are set:

```bash
export VERCEL_TOKEN="wugxCXxebp2Qr1XyiqAngVGJ"
vercel env ls --token="$VERCEL_TOKEN" | grep -E "(HARDHAT|POC_REGISTRY|BLOCKCHAIN)"
```

## ⚠️ Important Notes

1. **localhost won't work**: Vercel deployments cannot access localhost
2. **Private key security**: Never commit private keys to git
3. **Test vs Production**: Use different keys for testing and production
4. **Gas fees**: Ensure wallet has ETH for transaction gas fees
5. **Contract ownership**: The private key must be the contract owner

## 🔗 Related Documentation

- `docs/HARDHAT_BLOCKCHAIN_SETUP.md` - Detailed blockchain setup guide
- `docs/HARDHAT_IMPLEMENTATION_SUMMARY.md` - Implementation summary

