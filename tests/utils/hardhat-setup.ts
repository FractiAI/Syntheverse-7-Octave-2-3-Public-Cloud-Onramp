/**
 * Hardhat Test Setup
 * Sets up Hardhat network FORKING Base Mainnet (emulates Base)
 * Hardhat forks Base Mainnet to provide Base-compatible testing environment
 */

import { ethers } from 'ethers'
import { getTestConfig } from './test-config'

export interface HardhatTestSetup {
    provider: ethers.JsonRpcProvider
    signers: ethers.Wallet[]
    deployer: ethers.Wallet
    accounts: string[]
    network: string
    chainId: number
    isForking: boolean
    forkUrl: string
}

/**
 * Initialize Hardhat network FORKING Base Mainnet
 * Hardhat emulates Base Mainnet by forking the actual Base Mainnet
 * This provides Base-compatible testing without using actual Base Mainnet
 */
export async function setupHardhatNetwork(): Promise<HardhatTestSetup> {
    const config = getTestConfig()
    
    // HARDHAT FORKING BASE MAINNET (Emulating Base)
    // Hardhat forks Base Mainnet to emulate Base for testing
    const rpcUrl = config.hardhat.rpcUrl // http://127.0.0.1:8545 (Hardhat local)
    const forkUrl = config.hardhat.forkUrl // Base Mainnet RPC to fork from
    const chainId = config.hardhat.chainId // 8453 (Base Mainnet chain ID)
    const network = config.hardhat.network // 'hardhat'
    
    console.log(`🔗 Hardhat EMULATING Base Mainnet (forking)`)
    console.log(`📍 Hardhat RPC: ${rpcUrl}`)
    console.log(`🍴 Forking from: ${forkUrl}`)
    console.log(`🔢 Chain ID: ${chainId} (Base Mainnet)`)
    console.log(`✅ Hardhat emulates Base Mainnet for testing`)
    
    // Connect to Hardhat local network (which forks Base Mainnet)
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // HARDHAT: Use Hardhat default accounts (forked Base Mainnet state)
    // Hardhat provides default accounts with ETH when forking
    const signers: ethers.Wallet[] = []
    const accounts: string[] = []
    
    // Hardhat default accounts (from hardhat.config.js or default)
    // These accounts work with forked Base Mainnet
    const privateKeys = [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
        '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
        '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
        '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
        '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
        '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
        '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
    ]
    
    for (const pk of privateKeys) {
        const wallet = new ethers.Wallet(pk, provider)
        signers.push(wallet)
        accounts.push(wallet.address)
    }
    
    const deployer = signers[0]
    
    // Verify Hardhat network connection (forking Base Mainnet)
    try {
        const blockNumber = await provider.getBlockNumber()
        const networkName = await provider.getNetwork()
        const chainIdNum = Number(networkName.chainId)
        console.log(`✓ Connected to Hardhat network (emulating Base Mainnet) at block ${blockNumber}`)
        console.log(`✓ Chain ID: ${chainIdNum} (Base Mainnet - emulated by Hardhat)`)
        console.log(`✓ Hardhat is forking Base Mainnet from: ${forkUrl}`)
    } catch (error) {
        throw new Error(`Failed to connect to Hardhat network (forking Base): ${error}`)
    }
    
    // Verify account has balance (on forked network)
    try {
        const balance = await provider.getBalance(deployer.address)
        console.log(`✓ Deployer address: ${deployer.address}`)
        console.log(`✓ Deployer balance: ${ethers.formatEther(balance)} ETH (on forked Base Mainnet)`)
        
        if (balance === BigInt(0)) {
            console.warn('⚠️  WARNING: Deployer account has zero balance. Hardhat should provide default accounts with ETH.')
        }
    } catch (error) {
        console.warn(`⚠️  Could not check balance: ${error}`)
    }
    
    return {
        provider,
        signers,
        deployer,
        accounts,
        network,
        chainId,
        isForking: config.hardhat.useForking,
        forkUrl,
    }
}

/**
 * Reset Hardhat network state (snapshot/restore if needed)
 */
export async function resetHardhatNetwork(provider: ethers.JsonRpcProvider): Promise<void> {
    // Hardhat automatically resets state between tests
    // But we can force a reset if needed
    try {
        await provider.send('evm_snapshot', [])
        await provider.send('evm_revert', ['0x0']) // Revert to genesis
    } catch (error) {
        console.warn('Failed to reset Hardhat network:', error)
    }
}

