/**
 * Base Sepolia Test API Endpoint
 *
 * Tests Base Sepolia network connectivity, wallet balance, and configuration
 * Access at: /api/test/base-sepolia
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const results: any = {
    timestamp: new Date().toISOString(),
    network: 'Base Sepolia',
    tests: {},
    errors: [],
    summary: {},
  };

  try {
    // Check environment variables
    const baseSepoliaRpc = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    const blockchainNetwork = process.env.BLOCKCHAIN_NETWORK || 'base_mainnet';
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    const synth90TAddress = process.env.SYNTH90T_CONTRACT_ADDRESS;
    const lensKernelAddress = process.env.LENS_KERNEL_CONTRACT_ADDRESS;

    results.config = {
      baseSepoliaRpc: baseSepoliaRpc.substring(0, 30) + '...',
      blockchainNetwork,
      hasPrivateKey: !!privateKey,
      synth90TAddress: synth90TAddress || 'NOT SET',
      lensKernelAddress: lensKernelAddress || 'NOT SET',
    };

    if (!privateKey) {
      results.errors.push('BLOCKCHAIN_PRIVATE_KEY is not set');
      results.summary.status = 'ERROR';
      results.summary.message = 'Private key not configured';
      return NextResponse.json(results, { status: 400 });
    }

    // Test 1: Network Connection
    try {
      const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
        chainId: 84532,
        name: 'base-sepolia',
      });

      const network = await provider.getNetwork();
      results.tests.networkConnection = {
        status: 'PASS',
        chainId: Number(network.chainId),
        expectedChainId: 84532,
        networkName: network.name,
        isCorrect: Number(network.chainId) === 84532,
      };

      if (Number(network.chainId) !== 84532) {
        results.errors.push(`Chain ID mismatch: expected 84532, got ${network.chainId}`);
      }
    } catch (error) {
      results.tests.networkConnection = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push('Network connection failed');
    }

    // Test 2: Wallet Balance
    try {
      const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
        chainId: 84532,
        name: 'base-sepolia',
      });
      const wallet = new ethers.Wallet(privateKey, provider);
      const address = wallet.address;
      const balance = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balance);
      const minBalance = ethers.parseEther('0.01');

      results.tests.walletBalance = {
        status: 'PASS',
        address,
        balance: balanceEth,
        balanceWei: balance.toString(),
        hasSufficientBalance: balance >= minBalance,
        recommendedMin: '0.01 ETH',
        explorer: `https://sepolia.basescan.org/address/${address}`,
      };

      if (balance < minBalance) {
        results.warnings = results.warnings || [];
        results.warnings.push(
          'Balance is low. Get Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet'
        );
      }
    } catch (error) {
      results.tests.walletBalance = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push('Wallet balance check failed');
    }

    // Test 3: Gas Estimation
    try {
      const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
        chainId: 84532,
        name: 'base-sepolia',
      });
      const feeData = await provider.getFeeData();

      if (feeData.gasPrice) {
        const estimatedCost = feeData.gasPrice * BigInt(500000); // 500k gas estimate
        const costEth = ethers.formatEther(estimatedCost);

        results.tests.gasEstimation = {
          status: 'PASS',
          gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei',
          estimatedCost500kGas: costEth + ' ETH',
          maxFeePerGas: feeData.maxFeePerGas
            ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei'
            : 'N/A',
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
            ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei'
            : 'N/A',
        };
      } else {
        results.tests.gasEstimation = {
          status: 'WARNING',
          message: 'Gas price data not available',
        };
      }
    } catch (error) {
      results.tests.gasEstimation = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push('Gas estimation failed');
    }

    // Test 4: Contract Access (if addresses are set)
    if (synth90TAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
          chainId: 84532,
          name: 'base-sepolia',
        });
        const code = await provider.getCode(synth90TAddress);

        results.tests.synth90TContract = {
          status: code === '0x' ? 'NOT_DEPLOYED' : 'DEPLOYED',
          address: synth90TAddress,
          hasCode: code !== '0x',
          explorer: `https://sepolia.basescan.org/address/${synth90TAddress}`,
          note:
            code === '0x'
              ? 'Contract not deployed on Sepolia. This is expected if using mainnet addresses.'
              : 'Contract found on Sepolia',
        };
      } catch (error) {
        results.tests.synth90TContract = {
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    if (lensKernelAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
          chainId: 84532,
          name: 'base-sepolia',
        });
        const code = await provider.getCode(lensKernelAddress);

        results.tests.lensKernelContract = {
          status: code === '0x' ? 'NOT_DEPLOYED' : 'DEPLOYED',
          address: lensKernelAddress,
          hasCode: code !== '0x',
          explorer: `https://sepolia.basescan.org/address/${lensKernelAddress}`,
          note:
            code === '0x'
              ? 'Contract not deployed on Sepolia. This is expected if using mainnet addresses.'
              : 'Contract found on Sepolia',
        };
      } catch (error) {
        results.tests.lensKernelContract = {
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Test 5: Transaction Capability
    try {
      const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
        chainId: 84532,
        name: 'base-sepolia',
      });
      const wallet = new ethers.Wallet(privateKey, provider);
      const nonce = await provider.getTransactionCount(wallet.address);

      results.tests.transactionCapability = {
        status: 'PASS',
        address: wallet.address,
        nonce,
        canSendTransactions: true,
      };
    } catch (error) {
      results.tests.transactionCapability = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push('Transaction capability check failed');
    }

    // Summary
    const passedTests = Object.values(results.tests).filter((t: any) => t.status === 'PASS').length;
    const totalTests = Object.keys(results.tests).length;
    const hasErrors = results.errors.length > 0;

    results.summary = {
      status: hasErrors ? 'ERROR' : 'SUCCESS',
      passedTests,
      totalTests,
      hasErrors,
      hasWarnings: !!results.warnings,
      executionTime: `${Date.now() - startTime}ms`,
      readyForTesting: !hasErrors && passedTests >= totalTests * 0.8,
    };

    if (!hasErrors && results.tests.walletBalance?.hasSufficientBalance) {
      results.summary.message = '✅ Ready for testing on Base Sepolia!';
    } else if (hasErrors) {
      results.summary.message = '❌ Some tests failed. Check errors above.';
    } else if (!results.tests.walletBalance?.hasSufficientBalance) {
      results.summary.message =
        '⚠️ Network connected but balance is low. Get Sepolia ETH from faucet.';
    }
  } catch (error) {
    results.summary = {
      status: 'ERROR',
      message: 'Fatal error during testing',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    results.errors.push(error instanceof Error ? error.message : 'Unknown fatal error');
  }

  const statusCode =
    results.summary.status === 'ERROR' ? 500 : results.summary.status === 'SUCCESS' ? 200 : 400;

  return NextResponse.json(results, { status: statusCode });
}
