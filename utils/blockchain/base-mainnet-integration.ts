/**
 * Base Mainnet Blockchain Integration
 * 
 * Integrates with Syntheverse Genesis contracts on Base mainnet:
 * - SyntheverseGenesisSYNTH90T: Token allocations (Gold/Silver/Copper)
 * - SyntheverseGenesisLensKernel: Event emission for protocol events
 * 
 * Network: Base Mainnet (Chain ID: 8453)
 * RPC: https://mainnet.base.org
 */

import { debug, debugError } from '@/utils/debug'
import { ethers } from 'ethers'
import SyntheverseGenesisSYNTH90TABI from './SyntheverseGenesisSYNTH90T.abi.json'
import SyntheverseGenesisLensKernelABI from './SyntheverseGenesisLensKernel.abi.json'

export interface BaseMainnetConfig {
    rpcUrl: string
    chainId: number
    synth90TAddress: string
    lensKernelAddress: string
    privateKey: string
}

export interface TokenAllocationResult {
    success: boolean
    transaction_hash?: string
    block_number?: number
    amount?: string
    metal?: string
    error?: string
}

export interface OnChainFacts {
    contractAddress: string
    transactionHash: string
    blockNumber: number
    timestamp: number
    metal?: string
    allocatedAmount?: string
}

/**
 * Get Base mainnet configuration from environment variables
 */
export function getBaseMainnetConfig(): BaseMainnetConfig | null {
    const network = process.env.BLOCKCHAIN_NETWORK || 'base_mainnet'
    
    // Determine RPC URL based on network
    let rpcUrl: string
    let chainId: number
    
    if (network === 'base_sepolia') {
        rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
        chainId = 84532
    } else {
        rpcUrl = process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
        chainId = 8453
    }
    
    const synth90TAddress = process.env.SYNTH90T_CONTRACT_ADDRESS || '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3'
    const lensKernelAddress = process.env.LENS_KERNEL_CONTRACT_ADDRESS || '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8'
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
    
    if (!privateKey) {
        debugError('BaseMainnetConfig', 'BLOCKCHAIN_PRIVATE_KEY not configured', new Error('Missing BLOCKCHAIN_PRIVATE_KEY environment variable'))
        return null
    }
    
    return {
        rpcUrl,
        chainId,
        synth90TAddress,
        lensKernelAddress,
        privateKey
    }
}

/**
 * Create Base mainnet provider and wallet
 */
export function createBaseProvider(config: BaseMainnetConfig): {
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
} {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
        chainId: config.chainId,
        name: config.chainId === 8453 ? 'base-mainnet' : 'base-sepolia'
    })
    
    const wallet = new ethers.Wallet(config.privateKey, provider)
    
    return { provider, wallet }
}

/**
 * Allocate tokens to a contributor using SyntheverseGenesisSYNTH90T
 * 
 * @param submissionHash - PoC submission hash
 * @param contributorAddress - Contributor's Ethereum address
 * @param metal - Metal type: "gold", "silver", or "copper"
 * @param amount - Amount to allocate (in wei, with 18 decimals)
 * @returns Token allocation result
 */
export async function allocateTokens(
    submissionHash: string,
    contributorAddress: string,
    metal: 'gold' | 'silver' | 'copper',
    amount: string // Amount in wei (with 18 decimals)
): Promise<TokenAllocationResult> {
    debug('AllocateTokens', 'Initiating token allocation', {
        submissionHash: submissionHash.substring(0, 20) + '...',
        contributorAddress,
        metal,
        amount
    })
    
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return {
                success: false,
                error: 'Base mainnet configuration not available'
            }
        }
        
        const { provider, wallet } = createBaseProvider(config)
        
        // Create contract instance
        const synthContract = new ethers.Contract(
            config.synth90TAddress,
            SyntheverseGenesisSYNTH90TABI,
            wallet
        )
        
        // Prepare parameters
        const submissionHashBytes32 = ethers.zeroPadValue(
            submissionHash.startsWith('0x') ? submissionHash : '0x' + submissionHash,
            32
        )
        
        // Convert amount to BigInt
        const amountBigInt = BigInt(amount)
        
        debug('AllocateTokens', 'Calling allocateMetal', {
            submissionHash: submissionHash.substring(0, 20) + '...',
            contributorAddress,
            metal,
            amount: amountBigInt.toString()
        })
        
        // Estimate gas
        const gasEstimate = await synthContract.allocateMetal.estimateGas(
            submissionHashBytes32,
            contributorAddress,
            metal,
            amountBigInt
        )
        
        // Call allocateMetal function
        const tx = await synthContract.allocateMetal(
            submissionHashBytes32,
            contributorAddress,
            metal,
            amountBigInt,
            {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
            }
        )
        
        debug('AllocateTokens', 'Transaction sent, waiting for confirmation', {
            txHash: tx.hash,
            submissionHash: submissionHash.substring(0, 20) + '...'
        })
        
        // Wait for transaction confirmation
        const receipt = await tx.wait()
        
        debug('AllocateTokens', 'Token allocation confirmed', {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString(),
            submissionHash: submissionHash.substring(0, 20) + '...'
        })
        
        return {
            success: true,
            transaction_hash: receipt.hash,
            block_number: receipt.blockNumber,
            amount: amountBigInt.toString(),
            metal
        }
        
    } catch (error) {
        debugError('AllocateTokens', 'Token allocation failed', error)
        
        let errorMessage = 'Unknown token allocation error'
        if (error instanceof Error) {
            errorMessage = error.message
            
            if (errorMessage.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds in wallet for gas fees'
            } else if (errorMessage.includes('Insufficient epoch balance')) {
                errorMessage = 'Insufficient epoch balance for this metal type'
            } else if (errorMessage.includes('Invalid metal type')) {
                errorMessage = 'Invalid metal type (must be gold, silver, or copper)'
            }
        }
        
        return {
            success: false,
            error: errorMessage
        }
    }
}

/**
 * Get token balance for a specific metal type
 * 
 * @param metal - Metal type: "gold", "silver", or "copper"
 * @returns Balance in wei (with 18 decimals)
 */
export async function getMetalBalance(metal: 'gold' | 'silver' | 'copper'): Promise<string | null> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return null
        }
        
        const { provider } = createBaseProvider(config)
        
        const synthContract = new ethers.Contract(
            config.synth90TAddress,
            SyntheverseGenesisSYNTH90TABI,
            provider
        )
        
        const balance = await synthContract.getMetalBalance(metal)
        return balance.toString()
        
    } catch (error) {
        debugError('GetMetalBalance', 'Failed to get metal balance', error)
        return null
    }
}

/**
 * Get contributor's token balance
 * 
 * @param contributorAddress - Contributor's Ethereum address
 * @returns Balance in wei (with 18 decimals)
 */
export async function getContributorBalance(contributorAddress: string): Promise<string | null> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return null
        }
        
        const { provider } = createBaseProvider(config)
        
        const synthContract = new ethers.Contract(
            config.synth90TAddress,
            SyntheverseGenesisSYNTH90TABI,
            provider
        )
        
        const balance = await synthContract.balanceOf(contributorAddress)
        return balance.toString()
        
    } catch (error) {
        debugError('GetContributorBalance', 'Failed to get contributor balance', error)
        return null
    }
}

/**
 * Emit event via SyntheverseGenesisLensKernel
 * 
 * @param extensionType - Type of extension/event
 * @param data - Event data (bytes)
 * @returns Transaction result
 */
export async function emitLensEvent(
    extensionType: string,
    data: string
): Promise<{ success: boolean; transaction_hash?: string; block_number?: number; error?: string }> {
    debug('EmitLensEvent', 'Emitting lens event', { extensionType })
    
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return {
                success: false,
                error: 'Base mainnet configuration not available'
            }
        }
        
        const { provider, wallet } = createBaseProvider(config)
        
        const lensContract = new ethers.Contract(
            config.lensKernelAddress,
            SyntheverseGenesisLensKernelABI,
            wallet
        )
        
        // Convert data to bytes
        const dataBytes = ethers.toUtf8Bytes(data)
        
        // Estimate gas
        const gasEstimate = await lensContract.extendLens.estimateGas(extensionType, dataBytes)
        
        // Call extendLens function
        const tx = await lensContract.extendLens(extensionType, dataBytes, {
            gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
        })
        
        debug('EmitLensEvent', 'Transaction sent, waiting for confirmation', { txHash: tx.hash })
        
        const receipt = await tx.wait()
        
        debug('EmitLensEvent', 'Lens event emitted', {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        })
        
        return {
            success: true,
            transaction_hash: receipt.hash,
            block_number: receipt.blockNumber
        }
        
    } catch (error) {
        debugError('EmitLensEvent', 'Failed to emit lens event', error)
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Get lens information from SyntheverseGenesisLensKernel
 */
export async function getLensInfo(): Promise<{
    name: string
    purpose: string
    version: number
    genesis: number
} | null> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return null
        }
        
        const { provider } = createBaseProvider(config)
        
        const lensContract = new ethers.Contract(
            config.lensKernelAddress,
            SyntheverseGenesisLensKernelABI,
            provider
        )
        
        const [name, purpose, version, genesis] = await lensContract.getLensInfo()
        
        return {
            name,
            purpose,
            version: Number(version),
            genesis: Number(genesis)
        }
        
    } catch (error) {
        debugError('GetLensInfo', 'Failed to get lens info', error)
        return null
    }
}

/**
 * Query MetalAllocated events from SyntheverseGenesisSYNTH90T
 * 
 * @param contributorAddress - Filter by contributor address (optional)
 * @param fromBlock - Starting block number (optional)
 * @param toBlock - Ending block number (optional)
 * @returns Array of MetalAllocated events
 */
export async function queryMetalAllocatedEvents(
    contributorAddress?: string,
    fromBlock?: number,
    toBlock?: number
): Promise<any[]> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return []
        }
        
        const { provider } = createBaseProvider(config)
        
        const synthContract = new ethers.Contract(
            config.synth90TAddress,
            SyntheverseGenesisSYNTH90TABI,
            provider
        )
        
        // Create filter
        const filter = synthContract.filters.MetalAllocated(
            null, // submissionHash (any)
            contributorAddress || null, // contributor (optional filter)
            null, // metal (any)
            null, // amount (any)
            null, // epochBalance (any)
            null  // timestamp (any)
        )
        
        // Query events
        const events = await synthContract.queryFilter(
            filter,
            fromBlock || 0,
            toBlock || 'latest'
        )
        
        return events.map(event => ({
            submissionHash: event.args[0],
            contributor: event.args[1],
            metal: event.args[2],
            amount: event.args[3].toString(),
            epochBalance: event.args[4].toString(),
            timestamp: Number(event.args[5]),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash
        }))
        
    } catch (error) {
        debugError('QueryMetalAllocatedEvents', 'Failed to query events', error)
        return []
    }
}

/**
 * Verify transaction on Base mainnet
 */
export async function verifyBaseTransaction(txHash: string): Promise<boolean> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            return false
        }
        
        const { provider } = createBaseProvider(config)
        const receipt = await provider.getTransactionReceipt(txHash)
        
        return receipt !== null && receipt.status === 1
        
    } catch (error) {
        debugError('VerifyBaseTransaction', 'Transaction verification failed', error)
        return false
    }
}


