/**
 * Verify Base Setup
 * 
 * This script verifies that the Base blockchain setup is correct:
 * 1. Environment variables are configured
 * 2. Private key derives to the correct address (contract owner)
 * 3. Contract ownership is verified
 */

import { ethers } from 'ethers'
import { config } from 'dotenv'
import { getBaseMainnetConfig } from '../utils/blockchain/base-mainnet-integration'
import SyntheverseGenesisLensKernelABI from '../utils/blockchain/SyntheverseGenesisLensKernel.abi.json'

config()

const EXPECTED_OWNER = '0x3563388d0E1c2D66A004E5E57717dc6D7e568BE3'

async function verifySetup() {
    console.log('🔍 Verifying Base blockchain setup...\n')
    
    try {
        // 1. Check environment variables
        console.log('📋 Step 1: Checking environment variables...')
        const blockchainKey = process.env.BLOCKCHAIN_PRIVATE_KEY?.trim()
        const deployerKey = process.env.DEPLOYER_PRIVATE_KEY?.trim()
        const privateKey = blockchainKey || deployerKey
        
        if (!privateKey) {
            console.error('❌ ERROR: Neither BLOCKCHAIN_PRIVATE_KEY nor DEPLOYER_PRIVATE_KEY is set')
            console.error('   Please set BLOCKCHAIN_PRIVATE_KEY in your .env file or Vercel environment variables')
            process.exit(1)
        }
        
        const keySource = blockchainKey ? 'BLOCKCHAIN_PRIVATE_KEY' : 'DEPLOYER_PRIVATE_KEY'
        console.log(`   ✅ Found private key from: ${keySource}`)
        
        // 2. Derive address from private key
        console.log('\n📋 Step 2: Deriving wallet address from private key...')
        const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : '0x' + privateKey)
        const walletAddress = await wallet.getAddress()
        console.log(`   Wallet Address: ${walletAddress}`)
        console.log(`   Expected Owner: ${EXPECTED_OWNER}`)
        
        if (walletAddress.toLowerCase() !== EXPECTED_OWNER.toLowerCase()) {
            console.error(`\n❌ ERROR: Wallet address does not match contract owner!`)
            console.error(`   Your wallet: ${walletAddress}`)
            console.error(`   Expected:    ${EXPECTED_OWNER}`)
            console.error(`\n   Please update BLOCKCHAIN_PRIVATE_KEY to the contract owner's private key`)
            process.exit(1)
        }
        
        console.log('   ✅ Wallet address matches contract owner!')
        
        // 3. Get Base configuration
        console.log('\n📋 Step 3: Getting Base configuration...')
        const baseConfig = getBaseMainnetConfig()
        if (!baseConfig) {
            console.error('❌ ERROR: Failed to get Base configuration')
            process.exit(1)
        }
        
        console.log(`   Network: ${baseConfig.chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}`)
        console.log(`   RPC: ${baseConfig.rpcUrl}`)
        console.log(`   LensKernel: ${baseConfig.lensKernelAddress}`)
        console.log(`   SYNTH90T: ${baseConfig.synth90TAddress}`)
        
        // 4. Verify contract ownership
        console.log('\n📋 Step 4: Verifying contract ownership...')
        const provider = new ethers.JsonRpcProvider(baseConfig.rpcUrl, {
            chainId: baseConfig.chainId,
            name: baseConfig.chainId === 8453 ? 'base-mainnet' : 'base-sepolia'
        })
        
        const lensContract = new ethers.Contract(
            baseConfig.lensKernelAddress,
            SyntheverseGenesisLensKernelABI,
            provider
        )
        
        const contractOwner = await lensContract.owner()
        console.log(`   Contract Owner: ${contractOwner}`)
        
        if (contractOwner.toLowerCase() !== walletAddress.toLowerCase()) {
            console.error(`\n❌ ERROR: Contract owner does not match wallet!`)
            console.error(`   Contract Owner: ${contractOwner}`)
            console.error(`   Your Wallet:    ${walletAddress}`)
            process.exit(1)
        }
        
        console.log('   ✅ Contract ownership verified!')
        
        // 5. Get contract info
        console.log('\n📋 Step 5: Getting contract information...')
        const [name, purpose, version, genesis] = await lensContract.getLensInfo()
        console.log(`   Name: ${name}`)
        console.log(`   Purpose: ${purpose}`)
        console.log(`   Version: ${version.toString()}`)
        console.log(`   Genesis: ${genesis.toString()}`)
        
        // 6. Summary
        console.log('\n✅ Setup Verification Complete!')
        console.log('\n📊 Summary:')
        console.log(`   ✅ Environment variables configured`)
        console.log(`   ✅ Private key derives to correct address`)
        console.log(`   ✅ Contract ownership verified`)
        console.log(`   ✅ Ready to call extendLens()`)
        
        return true
        
    } catch (error) {
        console.error('\n❌ Error during setup verification:', error)
        if (error instanceof Error) {
            console.error('   Message:', error.message)
            if (error.stack) {
                console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
            }
        }
        process.exit(1)
    }
}

verifySetup()
    .then(success => {
        process.exit(success ? 0 : 1)
    })
    .catch(error => {
        console.error('Fatal error:', error)
        process.exit(1)
    })

