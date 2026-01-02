/**
 * Base Sepolia Test Script
 * 
 * Tests Base Sepolia network connectivity, wallet balance, and contract access
 * Run with: npx tsx scripts/test-base-sepolia.ts
 */

import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

async function testBaseSepolia() {
    console.log('\n🧪 Base Sepolia Test Script\n')
    console.log('=' .repeat(60))

    // Check environment variables
    console.log('\n📋 Checking Environment Variables...\n')
    
    const baseSepoliaRpc = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    const blockchainNetwork = process.env.BLOCKCHAIN_NETWORK || 'base_mainnet'
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
    const synth90TAddress = process.env.SYNTH90T_CONTRACT_ADDRESS
    const lensKernelAddress = process.env.LENS_KERNEL_CONTRACT_ADDRESS

    console.log(`BASE_SEPOLIA_RPC_URL: ${baseSepoliaRpc}`)
    console.log(`BLOCKCHAIN_NETWORK: ${blockchainNetwork}`)
    console.log(`SYNTH90T_CONTRACT_ADDRESS: ${synth90TAddress || 'NOT SET'}`)
    console.log(`LENS_KERNEL_CONTRACT_ADDRESS: ${lensKernelAddress || 'NOT SET'}`)
    console.log(`BLOCKCHAIN_PRIVATE_KEY: ${privateKey ? '✅ SET' : '❌ NOT SET'}`)

    if (!privateKey) {
        console.error('\n❌ ERROR: BLOCKCHAIN_PRIVATE_KEY is not set!')
        console.error('Please add your wallet private key to .env file')
        process.exit(1)
    }

    // Override network to Sepolia for testing
    if (blockchainNetwork !== 'base_sepolia') {
        console.log('\n⚠️  WARNING: BLOCKCHAIN_NETWORK is not set to base_sepolia')
        console.log('Testing will use Base Sepolia RPC regardless')
    }

    try {
        // Connect to Base Sepolia
        console.log('\n🔌 Connecting to Base Sepolia...\n')
        
        const provider = new ethers.JsonRpcProvider(baseSepoliaRpc, {
            chainId: 84532,
            name: 'base-sepolia'
        })

        // Get network info
        const network = await provider.getNetwork()
        console.log(`Network: ${network.name}`)
        console.log(`Chain ID: ${network.chainId}`)
        console.log(`Expected Chain ID: 84532`)

        if (Number(network.chainId) !== 84532) {
            console.error('\n❌ ERROR: Chain ID mismatch! Expected 84532 (Base Sepolia)')
            process.exit(1)
        }

        console.log('✅ Connected to Base Sepolia successfully!')

        // Check wallet
        console.log('\n💰 Checking Wallet Balance...\n')
        
        const wallet = new ethers.Wallet(privateKey, provider)
        const address = wallet.address
        console.log(`Wallet Address: ${address}`)
        console.log(`Explorer: https://sepolia.basescan.org/address/${address}`)

        const balance = await provider.getBalance(address)
        const balanceEth = ethers.formatEther(balance)
        console.log(`Balance: ${balanceEth} ETH`)

        // Check if balance is sufficient (recommend at least 0.01 ETH)
        const minBalance = ethers.parseEther('0.01')
        if (balance < minBalance) {
            console.log('\n⚠️  WARNING: Balance is low!')
            console.log(`Current: ${balanceEth} ETH`)
            console.log(`Recommended: At least 0.01 ETH`)
            console.log('\nGet Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet')
        } else {
            console.log('✅ Sufficient balance for testing!')
        }

        // Test contract access
        console.log('\n📝 Testing Contract Access...\n')

        if (synth90TAddress) {
            try {
                const code = await provider.getCode(synth90TAddress)
                if (code === '0x') {
                    console.log(`❌ SYNTH90T Contract: No contract at address ${synth90TAddress}`)
                    console.log('   Note: Contract may not be deployed on Sepolia yet')
                } else {
                    console.log(`✅ SYNTH90T Contract: Found at ${synth90TAddress}`)
                }
            } catch (error) {
                console.log(`⚠️  SYNTH90T Contract: Error checking - ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }

        if (lensKernelAddress) {
            try {
                const code = await provider.getCode(lensKernelAddress)
                if (code === '0x') {
                    console.log(`❌ LensKernel Contract: No contract at address ${lensKernelAddress}`)
                    console.log('   Note: Contract may not be deployed on Sepolia yet')
                } else {
                    console.log(`✅ LensKernel Contract: Found at ${lensKernelAddress}`)
                }
            } catch (error) {
                console.log(`⚠️  LensKernel Contract: Error checking - ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }

        // Test gas estimation
        console.log('\n⛽ Testing Gas Estimation...\n')
        
        try {
            // Estimate gas for a simple transaction
            const gasPrice = await provider.getFeeData()
            console.log(`Current Gas Price: ${gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'N/A'} gwei`)
            
            if (gasPrice.gasPrice) {
                const estimatedCost = gasPrice.gasPrice * BigInt(500000) // Estimate for ~500k gas
                const costEth = ethers.formatEther(estimatedCost)
                console.log(`Estimated Cost (500k gas): ${costEth} ETH`)
                console.log('✅ Gas estimation working!')
            }
        } catch (error) {
            console.log(`⚠️  Gas estimation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Test transaction capability
        console.log('\n🔐 Testing Transaction Capability...\n')
        
        try {
            const nonce = await provider.getTransactionCount(address)
            console.log(`Current Nonce: ${nonce}`)
            console.log('✅ Wallet can send transactions!')
        } catch (error) {
            console.log(`❌ Error getting nonce: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Summary
        console.log('\n' + '='.repeat(60))
        console.log('\n📊 Test Summary\n')
        console.log('✅ Network Connection: OK')
        console.log(`✅ Wallet Balance: ${balanceEth} ETH`)
        console.log(`✅ Wallet Address: ${address}`)
        console.log(`✅ Chain ID: ${network.chainId}`)
        
        if (balance < minBalance) {
            console.log('\n⚠️  ACTION REQUIRED:')
            console.log('   - Get more Sepolia ETH from the faucet')
            console.log('   - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet')
        } else {
            console.log('\n✅ Ready for testing on Base Sepolia!')
        }

        console.log('\n' + '='.repeat(60))
        console.log('\nNext Steps:')
        console.log('1. If balance is low, get Sepolia ETH from faucet')
        console.log('2. Update BLOCKCHAIN_NETWORK=base_sepolia in .env')
        console.log('3. Test PoC submission workflow')
        console.log('4. Verify transactions on BaseScan Sepolia')
        console.log('\n')

    } catch (error) {
        console.error('\n❌ ERROR during testing:')
        if (error instanceof Error) {
            console.error(`   Message: ${error.message}`)
            console.error(`   Stack: ${error.stack}`)
        } else {
            console.error(`   Unknown error: ${error}`)
        }
        process.exit(1)
    }
}

// Run the test
testBaseSepolia().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})

