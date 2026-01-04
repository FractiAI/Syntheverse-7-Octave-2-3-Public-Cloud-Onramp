# Base Sepolia Testing Plan

**Purpose**: Test Base mainnet migration on Base Sepolia testnet before production deployment  
**Network**: Base Sepolia (Chain ID: 84532)  
**Status**: Ready for Testing

---

## Overview

This testing plan outlines the steps to validate the Base mainnet migration on Base Sepolia testnet. All tests should pass before deploying to Base mainnet.

---

## Prerequisites

### 1. Environment Setup

- [ ] Base Sepolia RPC URL configured
- [ ] Testnet contract addresses (if different from mainnet)
- [ ] Test wallet with Sepolia ETH
- [ ] BaseScan Sepolia explorer access

### 2. Test Wallet Setup

1. Create or use existing test wallet
2. Get Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
3. Ensure wallet has at least 0.1 ETH for testing
4. Export private key (for testing only - never use in production)

### 3. Environment Variables

```bash
BLOCKCHAIN_NETWORK=base_sepolia
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SYNTH90T_CONTRACT_ADDRESS=<testnet_address_if_different>
LENS_KERNEL_CONTRACT_ADDRESS=<testnet_address_if_different>
BLOCKCHAIN_PRIVATE_KEY=<test_wallet_private_key>
```

---

## Test Cases

### Test 1: Network Connection

**Objective**: Verify connection to Base Sepolia network

**Steps**:

1. Set `BLOCKCHAIN_NETWORK=base_sepolia`
2. Set `BASE_SEPOLIA_RPC_URL=https://sepolia.base.org`
3. Call `getBaseMainnetConfig()` from integration code
4. Verify configuration is correct

**Expected Result**:

- Configuration returns Base Sepolia settings
- Chain ID is 84532
- RPC URL is correct

**Status**: ⏳ Pending

---

### Test 2: Contract Address Verification

**Objective**: Verify Genesis contract addresses are accessible

**Steps**:

1. Connect to Base Sepolia network
2. Verify `SYNTH90T_CONTRACT_ADDRESS` is a valid contract
3. Verify `LENS_KERNEL_CONTRACT_ADDRESS` is a valid contract
4. Check contract code on BaseScan Sepolia

**Expected Result**:

- Both contracts are verified on BaseScan
- Contract ABIs match expected interfaces
- Contracts are accessible via RPC

**Status**: ⏳ Pending

---

### Test 3: Token Balance Queries

**Objective**: Test reading token balances from contracts

**Steps**:

1. Call `getMetalBalance('gold')`
2. Call `getMetalBalance('silver')`
3. Call `getMetalBalance('copper')`
4. Call `getContributorBalance(testAddress)`

**Expected Result**:

- All balance queries succeed
- Returns correct balance values
- Handles errors gracefully

**Status**: ⏳ Pending

---

### Test 4: Token Allocation

**Objective**: Test allocating tokens to a contributor

**Steps**:

1. Prepare test submission hash
2. Use test contributor address
3. Call `allocateTokens()` with small amount (e.g., 1000 tokens)
4. Wait for transaction confirmation
5. Verify transaction on BaseScan Sepolia
6. Verify token balance increased

**Expected Result**:

- Transaction succeeds
- Transaction hash returned
- Block number returned
- Token balance increases correctly
- Transaction visible on BaseScan

**Status**: ⏳ Pending

---

### Test 5: Event Querying

**Objective**: Test querying MetalAllocated events

**Steps**:

1. Allocate tokens (from Test 4)
2. Query events with contributor filter
3. Query events without filter
4. Verify event data matches allocation

**Expected Result**:

- Events are queryable
- Event data is correct
- Filters work correctly
- Events match allocations

**Status**: ⏳ Pending

---

### Test 6: Lens Event Emission

**Objective**: Test emitting events via LensKernel

**Steps**:

1. Call `emitLensEvent()` with test data
2. Wait for transaction confirmation
3. Verify transaction on BaseScan
4. Query events from contract

**Expected Result**:

- Transaction succeeds
- Event is emitted
- Event data is correct
- Transaction visible on BaseScan

**Status**: ⏳ Pending

---

### Test 7: Lens Info Retrieval

**Objective**: Test retrieving lens information

**Steps**:

1. Call `getLensInfo()`
2. Verify returned data

**Expected Result**:

- Returns lens name, purpose, version, genesis timestamp
- Data matches contract state

**Status**: ⏳ Pending

---

### Test 8: Transaction Verification

**Objective**: Test verifying transactions on Base Sepolia

**Steps**:

1. Create a test transaction
2. Get transaction hash
3. Call `verifyBaseTransaction(txHash)`
4. Verify result

**Expected Result**:

- Transaction verification succeeds
- Returns correct status
- Handles invalid hashes gracefully

**Status**: ⏳ Pending

---

### Test 9: Error Handling

**Objective**: Test error handling for various scenarios

**Scenarios**:

1. Invalid contract address
2. Insufficient gas
3. Invalid metal type
4. Invalid contributor address
5. Network errors
6. RPC errors

**Expected Result**:

- All errors are caught
- Error messages are descriptive
- No unhandled exceptions
- Graceful degradation

**Status**: ⏳ Pending

---

### Test 10: Gas Estimation

**Objective**: Test gas estimation for transactions

**Steps**:

1. Estimate gas for token allocation
2. Estimate gas for lens event emission
3. Verify estimates are reasonable
4. Test with actual transactions

**Expected Result**:

- Gas estimates are accurate
- Transactions succeed with estimated gas
- Gas costs are low (Base has very low fees)

**Status**: ⏳ Pending

---

### Test 11: End-to-End PoC Submission

**Objective**: Test complete PoC submission workflow

**Steps**:

1. Submit PoC via dashboard
2. Complete Stripe payment (test mode)
3. Verify blockchain registration
4. Verify token allocation (if applicable)
5. Verify on-chain data display

**Expected Result**:

- Complete workflow succeeds
- All steps complete without errors
- On-chain data is correct
- UI displays correct information

**Status**: ⏳ Pending

---

### Test 12: Concurrent Transactions

**Objective**: Test handling multiple concurrent transactions

**Steps**:

1. Submit multiple PoCs simultaneously
2. Monitor transaction nonces
3. Verify all transactions succeed
4. Check for race conditions

**Expected Result**:

- All transactions succeed
- No nonce conflicts
- No race conditions
- Transactions are processed correctly

**Status**: ⏳ Pending

---

## Test Execution Checklist

### Pre-Testing

- [ ] Environment variables configured
- [ ] Test wallet funded with Sepolia ETH
- [ ] BaseScan Sepolia explorer accessible
- [ ] Test contracts deployed (if needed)

### During Testing

- [ ] Execute all test cases
- [ ] Document results
- [ ] Capture screenshots/logs
- [ ] Note any issues

### Post-Testing

- [ ] Review all test results
- [ ] Fix any issues found
- [ ] Re-run failed tests
- [ ] Document test results
- [ ] Prepare for mainnet deployment

---

## Test Results Template

```
Test Case: [Test Name]
Date: [Date]
Tester: [Name]
Status: [Pass/Fail/Blocked]
Notes: [Any notes or issues]
Transaction Hash: [If applicable]
BaseScan Link: [If applicable]
```

---

## Success Criteria

All tests must pass before proceeding to Base mainnet:

- [ ] All 12 test cases pass
- [ ] No critical errors
- [ ] Gas costs are acceptable
- [ ] Transactions are verifiable on BaseScan
- [ ] Error handling works correctly
- [ ] End-to-end workflow succeeds

---

## Known Issues

Document any issues found during testing:

1. **Issue**: [Description]
   - **Severity**: [Critical/High/Medium/Low]
   - **Status**: [Open/In Progress/Resolved]
   - **Resolution**: [If resolved]

---

## Test Environment

- **Network**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## Next Steps After Testing

1. **If All Tests Pass**:
   - Review test results
   - Update documentation
   - Prepare for Base mainnet deployment
   - Schedule production deployment

2. **If Tests Fail**:
   - Document failures
   - Fix issues
   - Re-run tests
   - Repeat until all tests pass

---

## Resources

- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Documentation**: https://docs.base.org
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Hardhat Base Guide**: https://hardhat.org/hardhat-runner/docs/guides/base-tutorial

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: Ready for Testing
