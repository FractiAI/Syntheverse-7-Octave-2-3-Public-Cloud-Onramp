# Hardhat Blockchain Integration Setup

> ⚠️ **DEPRECATED**: This document describes the old Hardhat integration. The dashboard has been migrated to **Base Mainnet/Testnet**.  
> **See**: [`docs/BASE_MAINNET_ENV_SETUP.md`](BASE_MAINNET_ENV_SETUP.md) for current Base mainnet setup.  
> **See**: [`docs/BASE_SEPOLIA_QUICK_START.md`](BASE_SEPOLIA_QUICK_START.md) for Base Sepolia testnet setup.

This document describes how to configure the actual Hardhat blockchain integration for PoC registration.

## Environment Variables Required

Add these environment variables to your Vercel project (or `.env.local` for local development):

### 1. HARDHAT_RPC_URL
**Required**: Hardhat network RPC endpoint URL

**Example values**:
- Local Hardhat node: `http://localhost:8545`
- Hardhat network (fork): `https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY`
- Custom RPC: `https://your-rpc-endpoint.com`

**How to get**:
- If running local Hardhat node: Use `http://localhost:8545` (default Hardhat port)
- For deployed Hardhat node: Use your node's RPC endpoint URL
- For testing: You can use a forked mainnet via Alchemy/Infura

### 2. POC_REGISTRY_ADDRESS
**Required**: Deployed POCRegistry contract address

**Example**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

**How to get**:
1. Deploy the POCRegistry contract using Hardhat:
   ```bash
   cd syntheverse-ui/src/blockchain/contracts
   npx hardhat deploy --network hardhat
   ```
2. Copy the deployed contract address from the deployment output
3. Set this as `POC_REGISTRY_ADDRESS` in your environment variables

### 3. BLOCKCHAIN_PRIVATE_KEY
**Required**: Private key of the wallet that owns the POCRegistry contract

**Security Warning**: 
- ⚠️ **NEVER commit this to git**
- ⚠️ Store securely in Vercel environment variables
- ⚠️ This wallet must be the owner of the POCRegistry contract (contract deployer)
- ⚠️ Ensure the wallet has sufficient ETH for gas fees

**Example**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Hardhat default account #0)

**How to get**:
- For local testing: Use Hardhat's default accounts (in `hardhat.config.js` or `hardhat.config.ts`)
- For production: Generate a secure wallet and use its private key
- The wallet must be funded with ETH to pay for gas fees

**Format**: Private key as hex string (with or without `0x` prefix)

## Deployment Steps

### 1. Deploy POCRegistry Contract

```bash
cd syntheverse-ui/src/blockchain/contracts
npx hardhat deploy --network hardhat
```

This will deploy the contract and output the contract address.

### 2. Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the three variables above:
   - `HARDHAT_RPC_URL`
   - `POC_REGISTRY_ADDRESS`
   - `BLOCKCHAIN_PRIVATE_KEY`
3. Set them for all environments (Production, Preview, Development)

### 3. Verify Configuration

The integration will automatically:
- ✅ Connect to Hardhat network
- ✅ Create transactions to register PoCs
- ✅ Wait for transaction confirmation
- ✅ Return transaction hash and block number

## Testing the Integration

### Local Testing

1. Start local Hardhat node:
   ```bash
   cd syntheverse-ui/src/blockchain/contracts
   npx hardhat node
   ```

2. Deploy contract to local node:
   ```bash
   npx hardhat deploy --network localhost
   ```

3. Set environment variables in `.env.local`:
   ```env
   HARDHAT_RPC_URL=http://localhost:8545
   POC_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

4. Test PoC registration via Stripe webhook or API

### Production Testing

1. Deploy contract to your production Hardhat network
2. Set environment variables in Vercel
3. Test with a real Stripe payment
4. Verify transaction on blockchain explorer (if available)

## How It Works

1. **PoC Registration Flow**:
   - User pays $500 fee via Stripe
   - Stripe webhook triggers `registerPoCOnBlockchain()`
   - Function connects to Hardhat network
   - Calls `registerContribution()` on POCRegistry contract
   - Waits for transaction confirmation
   - Returns transaction hash for database storage

2. **Contract Parameters**:
   - `submissionHash`: bytes32 (converted from hex string)
   - `contributor`: address (derived from email hash - see note below)
   - `metal`: string (first metal from array: "gold", "silver", or "copper")
   - `allocatedAmount`: uint256 (currently 0, can be updated later)
   - `epoch`: uint256 (1=founder, 2=pioneer, 3=community, 4=ecosystem)

3. **Contributor Address**:
   - Currently derived deterministically from email hash
   - This is a placeholder approach
   - **Future improvement**: Users should connect wallets for real addresses

## Troubleshooting

### Error: "Hard Hat RPC URL not configured"
- Set `HARDHAT_RPC_URL` environment variable
- Verify the URL is accessible from your deployment

### Error: "POC Registry contract address not configured"
- Set `POC_REGISTRY_ADDRESS` environment variable
- Verify the contract is deployed at this address

### Error: "Blockchain private key not configured"
- Set `BLOCKCHAIN_PRIVATE_KEY` environment variable
- Ensure the wallet is the contract owner

### Error: "Transaction reverted"
- Check contract owner permissions
- Verify contract is deployed correctly
- Check gas limit (default: 500000)

### Error: "Insufficient funds"
- Ensure wallet has ETH for gas fees
- Check gas price on network

### Error: "Network error"
- Verify RPC URL is correct and accessible
- Check network connectivity
- For local testing, ensure Hardhat node is running

## Security Considerations

1. **Private Key Security**:
   - Store `BLOCKCHAIN_PRIVATE_KEY` only in environment variables
   - Never commit to git
   - Use separate wallets for testnet/mainnet
   - Consider using a hardware wallet for production

2. **Contract Ownership**:
   - The wallet used must be the contract owner
   - Consider multi-sig for production deployments
   - Document ownership transfers

3. **Gas Management**:
   - Monitor gas costs
   - Set appropriate gas limits
   - Consider gas price optimization

## Future Improvements

1. **Wallet Connection**: Allow users to connect wallets for real addresses
2. **Multi-chain Support**: Support multiple blockchain networks
3. **Gas Optimization**: Optimize contract and transaction gas usage
4. **Event Indexing**: Index contract events for faster queries
5. **Transaction Monitoring**: Add monitoring/alerting for failed transactions

