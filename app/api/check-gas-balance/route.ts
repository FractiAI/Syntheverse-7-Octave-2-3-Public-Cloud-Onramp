import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  getBaseMainnetConfig,
  createBaseProvider,
} from '@/utils/blockchain/base-mainnet-integration';

/**
 * Check Base Sepolia Testnet Gas Balance
 * GET /api/check-gas-balance
 */
export async function GET(request: NextRequest) {
  try {
    const config = getBaseMainnetConfig();

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Base blockchain configuration not available',
          message: 'Check environment variables: BLOCKCHAIN_PRIVATE_KEY, BASE_SEPOLIA_RPC_URL',
        },
        { status: 500 }
      );
    }

    const { provider, wallet } = createBaseProvider(config);
    const address = wallet.address;

    // Get balance
    const balance = await provider.getBalance(address);
    const balanceEth = parseFloat(ethers.formatEther(balance));

    // Get network info
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    // Get gas price
    let gasPriceGwei = '0';
    let estimatedCostEth = '0';
    try {
      const feeData = await provider.getFeeData();
      if (feeData.gasPrice) {
        gasPriceGwei = ethers.formatUnits(feeData.gasPrice, 'gwei');
        const estimatedGas = BigInt(200000); // Typical contract interaction
        const estimatedCost = feeData.gasPrice * estimatedGas;
        estimatedCostEth = ethers.formatEther(estimatedCost);
      }
    } catch (gasError) {
      // Non-fatal
    }

    // Check if sufficient (minimum 0.001 ETH recommended)
    const minRecommended = 0.001;
    const sufficient = balanceEth >= minRecommended;

    return NextResponse.json({
      success: true,
      network: config.chainId === 8453 ? 'base_mainnet' : 'base_sepolia',
      chainId: config.chainId,
      wallet: {
        address,
        balance: {
          wei: balance.toString(),
          eth: balanceEth.toFixed(6),
          formatted: `${balanceEth.toFixed(6)} ETH`,
        },
      },
      gas: {
        priceGwei: gasPriceGwei,
        estimatedCostPerTx: estimatedCostEth,
        sufficient: sufficient,
        minRecommended: minRecommended.toString(),
      },
      networkStatus: {
        connected: true,
        latestBlock: blockNumber,
        networkName: network.name,
      },
      status: sufficient ? 'sufficient' : 'low_balance',
      message: sufficient
        ? 'Sufficient balance for transactions'
        : config.chainId === 8453
          ? `Low balance! You need Base Mainnet ETH. Transfer ETH to: ${address}`
          : `Low balance! Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`,
    });
  } catch (error) {
    console.error('Gas balance check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message:
          'Failed to check gas balance. Check network connectivity and environment variables.',
      },
      { status: 500 }
    );
  }
}
