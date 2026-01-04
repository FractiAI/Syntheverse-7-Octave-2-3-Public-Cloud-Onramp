# Base Mainnet Migration Plan

## Syntheverse PoC Contributor Dashboard - Hardhat to Base Migration

**Document Version**: 1.0  
**Date**: 2025-01-XX  
**Status**: Planning Phase  
**Target**: Base Mainnet (Chain ID 8453)

---

## Executive Summary

This document outlines the comprehensive migration plan for upgrading the Syntheverse PoC Contributor Dashboard from Hardhat test environments to Base mainnet, integrating the newly deployed Syntheverse Genesis contracts.

### Current State

- **Network**: Hardhat (local/testnet)
- **Contracts**: Custom SYNTH, SyntheverseLens, POCRegistry
- **Solidity Version**: 0.8.19
- **Hardhat Version**: v2.22.18
- **Integration**: Basic PoC registration via POCRegistry

### Target State

- **Network**: Base Mainnet (Chain ID 8453)
- **Contracts**: SyntheverseGenesisSYNTH90T, SyntheverseGenesisLensKernel (already deployed)
- **Solidity Version**: 0.8.24
- **Hardhat Version**: v2.22.18
- **Integration**: Full Genesis contract integration with event subscriptions

---

## 1. Genesis Contract References

### Deployed Contracts (Base Mainnet)

- **SyntheverseGenesisSYNTH90T**: `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3`
- **SyntheverseGenesisLensKernel**: `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8`
- **Motherlode Vault**: `0x3563388d0e1c2d66a004e5e57717dc6d7e568be3`

### Network Configuration

- **Base Mainnet RPC**: `https://mainnet.base.org`
- **Base Sepolia RPC**: `https://sepolia.base.org`
- **Chain ID**: 8453 (mainnet), 84532 (Sepolia)
- **Block Explorer**: https://basescan.org

---

## 2. Migration Phases

### Phase 1: Infrastructure & Configuration ✅

**Status**: In Progress  
**Timeline**: Week 1

#### 2.1 Hardhat Configuration Updates

- [x] Update Solidity version to 0.8.24
- [x] Verify Base mainnet network configuration
- [x] Update Base Sepolia testnet configuration
- [x] Configure BaseScan API keys for contract verification
- [x] Update gas price settings for Base network

#### 2.2 Environment Variables

- [ ] Update environment variable documentation
- [ ] Add `BASE_MAINNET_RPC_URL` (default: `https://mainnet.base.org`)
- [ ] Add `BASE_SEPOLIA_RPC_URL` (default: `https://sepolia.base.org`)
- [ ] Add `BASESCAN_API_KEY` for contract verification
- [ ] Update `POC_REGISTRY_ADDRESS` → Use Genesis contracts
- [ ] Add `SYNTH90T_CONTRACT_ADDRESS` = `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3`
- [ ] Add `LENS_KERNEL_CONTRACT_ADDRESS` = `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8`
- [ ] Add `MOTHERLODE_VAULT_ADDRESS` = `0x3563388d0e1c2d66a004e5e57717dc6d7e568be3`
- [ ] Update `BLOCKCHAIN_PRIVATE_KEY` security documentation

#### 2.3 Deployment Scripts

- [ ] Create deployment script for SyntheverseGenesisSYNTH90T (reference only - already deployed)
- [ ] Create deployment script for SyntheverseGenesisLensKernel (reference only - already deployed)
- [ ] Update deployment scripts to use Base mainnet
- [ ] Add deployment verification scripts
- [ ] Create deployment documentation

---

### Phase 2: Contract Integration 🔄

**Status**: Pending  
**Timeline**: Week 2

#### 2.1 Contract ABIs

- [ ] Generate/obtain SyntheverseGenesisSYNTH90T ABI
- [ ] Generate/obtain SyntheverseGenesisLensKernel ABI
- [ ] Store ABIs in `utils/blockchain/` directory
- [ ] Create TypeScript interfaces for contract interactions

#### 2.2 Blockchain Integration Updates

- [ ] Update `utils/blockchain/register-poc.ts` for Base mainnet
- [ ] Integrate SyntheverseGenesisSYNTH90T for token allocations
- [ ] Integrate SyntheverseGenesisLensKernel for event emission
- [ ] Update RPC provider initialization for Base
- [ ] Add network switching logic (testnet/mainnet)
- [ ] Implement gas estimation for Base network
- [ ] Add transaction retry logic with exponential backoff

#### 2.3 Event Subscription

- [ ] Implement event listener for `MetalAllocated` events
- [ ] Implement event listener for `LensExtended` events
- [ ] Create event indexing service
- [ ] Add event filtering by contributor address
- [ ] Store event data in database for fast queries

---

### Phase 3: Dashboard UI/UX 🎨

**Status**: Pending  
**Timeline**: Week 3

#### 3.1 On-Chain Facts Display

- [ ] Create `OnChainFacts` component
- [ ] Display contract addresses (read-only, public)
- [ ] Display transaction hashes (submission-specific, private)
- [ ] Display block numbers and timestamps
- [ ] Show Motherlode allocation events (Gold/Silver/Copper)
- [ ] Add BaseScan explorer links

#### 3.2 Wallet Integration

- [ ] Integrate wallet connection (MetaMask, WalletConnect, Coinbase Wallet)
- [ ] Add wallet connection UI component
- [ ] Implement ETH balance display
- [ ] Add gas fee estimation display
- [ ] Create transaction approval flow
- [ ] Handle wallet switching/network switching

#### 3.3 Submission Privacy

- [ ] Implement user-specific transaction hash visibility
- [ ] Add access control for on-chain data
- [ ] Create "My Submissions" view with private transaction data
- [ ] Add public/private data separation in UI

#### 3.4 Token Allocation Display

- [ ] Create token allocation component
- [ ] Display Gold/Silver/Copper allocations
- [ ] Show epoch-based allocations
- [ ] Add allocation history timeline
- [ ] Integrate with SyntheverseGenesisSYNTH90T balance queries

---

### Phase 4: Testing & Validation 🧪

**Status**: Pending  
**Timeline**: Week 4

#### 4.1 Base Sepolia Testnet Testing

- [ ] Deploy test contracts to Base Sepolia
- [ ] Test PoC submission workflow
- [ ] Test token allocation flow
- [ ] Test event subscription
- [ ] Test wallet integration
- [ ] Test gas fee payments
- [ ] Validate transaction confirmations

#### 4.2 Integration Testing

- [ ] End-to-end PoC submission test
- [ ] Blockchain registration verification
- [ ] Event emission verification
- [ ] Token allocation verification
- [ ] UI component rendering tests
- [ ] Error handling tests

#### 4.3 Security Audit

- [ ] Private key security review
- [ ] Contract interaction security review
- [ ] Gas limit validation
- [ ] Transaction replay protection
- [ ] Access control verification

---

### Phase 5: Production Deployment 🚀

**Status**: Pending  
**Timeline**: Week 5

#### 5.1 Pre-Deployment Checklist

- [ ] All tests passing on Base Sepolia
- [ ] Security audit complete
- [ ] Environment variables configured
- [ ] Contract addresses verified
- [ ] Documentation complete
- [ ] Team training complete

#### 5.2 Mainnet Deployment

- [ ] Deploy to Base mainnet (contracts already deployed)
- [ ] Verify contract addresses
- [ ] Update production environment variables
- [ ] Enable event subscriptions
- [ ] Monitor initial transactions
- [ ] Validate on-chain data

#### 5.3 Post-Deployment

- [ ] Monitor transaction success rates
- [ ] Monitor gas costs
- [ ] Monitor event emissions
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Plan iterative improvements

---

## 3. Technical Specifications

### 3.1 Contract Integration Points

#### SyntheverseGenesisSYNTH90T (ERC-20)

**Address**: `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3`

**Key Functions**:

- `allocateMetal(bytes32 submissionHash, address contributor, string metal, uint256 amount)`
- `getMetalBalance(string metal)`
- `getTotalAllocated()`
- `balanceOf(address account)`

**Key Events**:

- `MetalAllocated(bytes32 indexed submissionHash, address indexed contributor, string metal, uint256 amount, uint256 epochBalance, uint256 timestamp)`
- `GenesisInitialized(address indexed deployer, uint256 totalSupply, uint256 timestamp)`

#### SyntheverseGenesisLensKernel

**Address**: `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8`

**Key Functions**:

- `getLensInfo()` - Returns protocol metadata
- `verifyLens()` - Verifies lens integrity
- `extendLens(string extensionType, bytes data)` - Extends lens functionality

**Key Events**:

- `LensExtended(string indexed extensionType, bytes data, uint256 timestamp)`
- `LensInitialized(address indexed deployer, uint256 version, uint256 timestamp, string lensName, string purpose)`

### 3.2 Network Configuration

```javascript
// Base Mainnet
{
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  explorer: "https://basescan.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  }
}

// Base Sepolia (Testnet)
{
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  }
}
```

### 3.3 Gas Configuration

- **Base Mainnet**: ~0.1 gwei (very low gas costs)
- **Base Sepolia**: ~0.1 gwei
- **Gas Limit**: 500,000 (for PoC registration)
- **Gas Price**: Auto-estimate or 0.1 gwei minimum

---

## 4. Environment Variables

### Required Variables

```bash
# Base Network Configuration
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key

# Genesis Contract Addresses (Base Mainnet)
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
MOTHERLODE_VAULT_ADDRESS=0x3563388d0e1c2d66a004e5e57717dc6d7e568be3

# Deployment Wallet (SECURE - NEVER COMMIT)
BLOCKCHAIN_PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...

# Network Selection
BLOCKCHAIN_NETWORK=base_mainnet  # or base_sepolia for testing
```

### Deprecated Variables (to be removed)

- `HARDHAT_RPC_URL` → Replace with `BASE_MAINNET_RPC_URL`
- `POC_REGISTRY_ADDRESS` → Replace with Genesis contract addresses

---

## 5. Code Changes Required

### 5.1 Hardhat Configuration

**File**: `syntheverse-ui/src/blockchain/contracts/hardhat.config.js`

**Changes**:

- Update Solidity version to 0.8.24
- Set default network to `base_mainnet`
- Update gas price settings
- Add BaseScan verification configuration

### 5.2 Blockchain Integration

**File**: `utils/blockchain/register-poc.ts`

**Changes**:

- Replace Hardhat RPC with Base RPC
- Integrate SyntheverseGenesisSYNTH90T for allocations
- Integrate SyntheverseGenesisLensKernel for events
- Add network detection and switching
- Update error handling for Base network

### 5.3 API Routes

**Files**:

- `app/api/poc/[hash]/register/route.ts`
- `app/webhook/stripe/route.ts`

**Changes**:

- Update blockchain registration calls
- Add token allocation calls
- Add event emission calls
- Update error handling

### 5.4 UI Components

**New Files**:

- `components/OnChainFacts.tsx` - Display on-chain immutable facts
- `components/WalletConnection.tsx` - Wallet integration
- `components/TokenAllocation.tsx` - Token allocation display
- `components/BlockchainNetworkSelector.tsx` - Network switching

**Modified Files**:

- `components/PoCDashboardStats.tsx` - Add on-chain data display
- `components/OnboardingNavigator.tsx` - Update blockchain section

---

## 6. Security Considerations

### 6.1 Private Key Management

- ⚠️ **NEVER** commit private keys to git
- Store in Vercel environment variables only
- Use separate wallets for testnet/mainnet
- Consider hardware wallet for production
- Implement key rotation policy

### 6.2 Gas Management

- Monitor gas costs on Base (very low, but still monitor)
- Implement gas price estimation
- Add gas limit validation
- Handle insufficient gas errors gracefully

### 6.3 Access Control

- Verify user ownership before showing transaction hashes
- Implement proper authentication checks
- Validate contributor addresses
- Add rate limiting for blockchain calls

### 6.4 Contract Security

- Verify all contract addresses before interaction
- Validate contract ABIs match deployed contracts
- Implement contract upgrade detection
- Add contract verification on BaseScan

---

## 7. Testing Strategy

### 7.1 Unit Tests

- Contract interaction functions
- Event parsing and filtering
- Address validation
- Gas estimation

### 7.2 Integration Tests

- End-to-end PoC submission
- Token allocation flow
- Event subscription
- Wallet connection

### 7.3 Testnet Testing (Base Sepolia)

- Deploy test contracts
- Test all workflows
- Validate gas costs
- Test error scenarios

### 7.4 Mainnet Testing

- Small-scale production testing
- Monitor transaction success rates
- Validate on-chain data accuracy
- Collect performance metrics

---

## 8. Rollback Plan

### 8.1 If Migration Fails

1. Revert environment variables to Hardhat configuration
2. Update code to use Hardhat RPC
3. Restore previous contract addresses
4. Notify users of temporary service interruption

### 8.2 Partial Rollback

- Keep Base mainnet contracts deployed
- Revert dashboard to Hardhat for PoC registration
- Maintain Genesis contracts for reference
- Plan gradual re-migration

---

## 9. Success Criteria

### 9.1 Technical Success

- ✅ All contracts deployed and verified on Base mainnet
- ✅ Dashboard successfully connects to Base mainnet
- ✅ PoC registrations working on Base
- ✅ Token allocations functioning correctly
- ✅ Event subscriptions active
- ✅ All tests passing

### 9.2 User Experience Success

- ✅ Users can submit PoCs successfully
- ✅ On-chain facts visible to users
- ✅ Token allocations displayed correctly
- ✅ Wallet integration working smoothly
- ✅ Gas fees reasonable and transparent

### 9.3 Operational Success

- ✅ Transaction success rate > 99%
- ✅ Average gas cost < $0.10 per transaction
- ✅ Event indexing working correctly
- ✅ No security incidents
- ✅ Documentation complete

---

## 10. Timeline & Milestones

| Phase                          | Duration | Start Date | End Date | Status         |
| ------------------------------ | -------- | ---------- | -------- | -------------- |
| Phase 1: Infrastructure        | 1 week   | TBD        | TBD      | 🔄 In Progress |
| Phase 2: Contract Integration  | 1 week   | TBD        | TBD      | ⏳ Pending     |
| Phase 3: Dashboard UI/UX       | 1 week   | TBD        | TBD      | ⏳ Pending     |
| Phase 4: Testing & Validation  | 1 week   | TBD        | TBD      | ⏳ Pending     |
| Phase 5: Production Deployment | 1 week   | TBD        | TBD      | ⏳ Pending     |

**Total Estimated Duration**: 5 weeks

---

## 11. Dependencies & Prerequisites

### 11.1 External Dependencies

- Base mainnet RPC access
- BaseScan API key
- Wallet provider SDKs (MetaMask, WalletConnect)
- Sufficient ETH in deployment wallet for gas

### 11.2 Internal Dependencies

- Genesis contracts already deployed (✅ Complete)
- Contract ABIs available
- Database schema supports on-chain data
- Frontend framework ready for wallet integration

---

## 12. Risk Assessment

### 12.1 High Risk

- **Private key compromise**: Mitigate with secure storage and rotation
- **Contract address errors**: Mitigate with verification and testing
- **Gas estimation failures**: Mitigate with proper error handling

### 12.2 Medium Risk

- **Network congestion**: Base has low fees, but monitor
- **Event indexing delays**: Mitigate with caching
- **Wallet connection issues**: Mitigate with multiple wallet providers

### 12.3 Low Risk

- **UI/UX issues**: Can be fixed iteratively
- **Documentation gaps**: Can be updated post-deployment

---

## 13. Post-Migration Improvements

### 13.1 Short-term (1-3 months)

- Optimize gas usage
- Improve event indexing performance
- Add more wallet providers
- Enhance UI/UX based on user feedback

### 13.2 Long-term (3-6 months)

- Multi-chain support
- Advanced analytics dashboard
- Automated token allocation strategies
- Governance integration

---

## 14. Documentation Updates Required

- [ ] Update `README.md` with Base mainnet information
- [ ] Update `docs/HARDHAT_BLOCKCHAIN_SETUP.md` → `docs/BASE_MAINNET_SETUP.md`
- [ ] Create `docs/GENESIS_CONTRACTS_INTEGRATION.md`
- [ ] Create `docs/WALLET_INTEGRATION_GUIDE.md`
- [ ] Update `docs/ENV_VARIABLES_LIST.md`
- [ ] Create `docs/BASE_DEPLOYMENT_GUIDE.md`

---

## 15. Team Responsibilities

### 15.1 Senior Full-Stack Engineer

- Lead migration planning and execution
- Review all code changes
- Ensure security best practices
- Coordinate with team members

### 15.2 Blockchain Developer

- Contract integration
- Event subscription implementation
- Gas optimization
- Contract verification

### 15.3 Frontend Developer

- UI component development
- Wallet integration
- User experience improvements
- Testing

### 15.4 DevOps Engineer

- Environment variable management
- Deployment automation
- Monitoring setup
- Rollback procedures

---

## 16. Approval & Sign-off

**Migration Plan Approved By**:

- [ ] Senior Full-Stack Engineer
- [ ] Project Lead
- [ ] Security Review
- [ ] Product Owner

**Date**: **\*\***\_\_\_**\*\***

---

## Appendix A: Contract ABIs

See separate files:

- `utils/blockchain/SyntheverseGenesisSYNTH90T.abi.json`
- `utils/blockchain/SyntheverseGenesisLensKernel.abi.json`

## Appendix B: Deployment Scripts

See:

- `syntheverse-ui/src/blockchain/contracts/deploy/01_deploy_SYNTH90T.cjs`
- `syntheverse-ui/src/blockchain/contracts/deploy/02_deploy_LensKernel.cjs`

## Appendix C: Testing Scripts

See:

- `scripts/test-base-sepolia.ts`
- `scripts/test-base-mainnet.ts`
- `scripts/verify-contracts.ts`

---

**Document End**
