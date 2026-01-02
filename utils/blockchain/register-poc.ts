/**
 * Blockchain Integration - Base Mainnet/Testnet
 * 
 * Registers PoC on Base blockchain using Syntheverse Genesis contracts:
 * - SyntheverseGenesisLensKernel: Emits events for PoC registration
 * - SyntheverseGenesisSYNTH90T: Allocates tokens (if amount provided)
 * 
 * For Base mainnet/testnet integration, see: utils/blockchain/base-mainnet-integration.ts
 */

import { debug, debugError } from '@/utils/debug'
import { ethers } from 'ethers'
import { 
    getBaseMainnetConfig, 
    createBaseProvider, 
    emitLensEvent, 
    allocateTokens 
} from './base-mainnet-integration'

export interface BlockchainRegistrationResult {
    success: boolean
    transaction_hash?: string
    block_number?: number
    error?: string
}

/**
 * Map epoch string to number for contract
 */
function epochToNumber(epoch: string): number {
    const epochMap: Record<string, number> = {
        'founder': 1,
        'pioneer': 2,
        'community': 3,
        'ecosystem': 4
    }
    return epochMap[epoch.toLowerCase()] || 1 // Default to founder if unknown
}

/**
 * Derive Ethereum address from contributor email
 * Uses a deterministic hash-based approach
 * Note: In production, users should connect wallets for real addresses
 */
async function deriveAddressFromEmail(email: string): Promise<string> {
    // Create a deterministic address from email hash
    // This is a placeholder - in production, users should connect wallets
    const crypto = await import('crypto')
    const hash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
    // Use first 20 bytes (40 hex chars) to create a valid Ethereum address
    // This creates a deterministic but non-standard address
    // For production, consider: zero address, or require wallet connection
    return '0x' + hash.substring(0, 40)
}

/**
 * Register PoC on Base blockchain (defaults to Sepolia testnet)
 * 
 * This function registers the PoC on Base using Syntheverse Genesis contracts:
 * - Emits a Lens event via SyntheverseGenesisLensKernel to record the PoC registration
 * - Optionally allocates tokens via SyntheverseGenesisSYNTH90T (if amount provided)
 * 
 * Default network: Base Sepolia Testnet (Chain ID: 84532)
 * Set BLOCKCHAIN_NETWORK=base_mainnet to use mainnet
 * 
 * @param submissionHash - PoC submission hash
 * @param contributor - Contributor email/address
 * @param metadata - PoC metadata including scores
 * @param metals - Metal types (gold, silver, copper)
 * @param submissionText - Submitted text content (optional but recommended)
 * @returns Blockchain transaction result
 */
export async function registerPoCOnBlockchain(
    submissionHash: string,
    contributor: string,
    metadata: {
        novelty?: number
        density?: number
        coherence?: number
        alignment?: number
        pod_score?: number
        qualified_epoch?: string
    },
    metals: string[],
    submissionText?: string | null
): Promise<BlockchainRegistrationResult> {
    debug('RegisterPoCBlockchain', 'Initiating Base blockchain registration', {
        submissionHash,
        contributor,
        metals,
        hasSubmissionText: !!submissionText && submissionText.trim().length > 0
    })
    
    try {
        // Get Base configuration
        const config = getBaseMainnetConfig()
        if (!config) {
            debugError('RegisterPoCBlockchain', 'Base blockchain configuration not available', new Error('Missing Base configuration'))
            return {
                success: false,
                error: 'Base blockchain configuration not available. Please check environment variables.'
            }
        }
        
        // Derive contributor address from email (placeholder - in production use wallet addresses)
        const contributorAddress = await deriveAddressFromEmail(contributor)
        
        // Use first metal from array
        const metal = (metals && metals.length > 0 ? metals[0] : 'copper') as 'gold' | 'silver' | 'copper'
        
        // Compute submission text hash for anchoring
        let submissionTextHash: string | null = null
        try {
            const normalized = (submissionText || '').trim()
            if (normalized.length > 0) {
                const crypto = await import('crypto')
                submissionTextHash = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex')
            }
        } catch (hashError) {
            debugError('RegisterPoCBlockchain', 'Failed to hash submission text (non-fatal)', hashError)
        }
        
        // Prepare event data for LensKernel
        // Format: JSON-encoded PoC registration data
        const eventData = {
            type: 'poc_registration',
            submissionHash,
            contributor: contributorAddress,
            contributorEmail: contributor,
            metal,
            metadata: {
                novelty: metadata.novelty,
                density: metadata.density,
                coherence: metadata.coherence,
                alignment: metadata.alignment,
                pod_score: metadata.pod_score,
                qualified_epoch: metadata.qualified_epoch || 'founder'
            },
            submissionTextHash,
            timestamp: Date.now()
        }
        
        const eventDataJson = JSON.stringify(eventData)
        const eventDataBytes = ethers.toUtf8Bytes(eventDataJson)
        
        debug('RegisterPoCBlockchain', 'Emitting Lens event for PoC registration', {
            submissionHash: submissionHash.substring(0, 20) + '...',
            contributorAddress,
            metal,
            network: config.chainId === 8453 ? 'base_mainnet' : 'base_sepolia'
        })
        
        // Emit Lens event to record PoC registration
        const lensResult = await emitLensEvent('poc_registration', ethers.hexlify(eventDataBytes))
        
        if (!lensResult.success || !lensResult.transaction_hash) {
            debugError('RegisterPoCBlockchain', 'Failed to emit Lens event', new Error(lensResult.error || 'Unknown error'))
            return {
                success: false,
                error: lensResult.error || 'Failed to emit PoC registration event'
            }
        }
        
        debug('RegisterPoCBlockchain', 'PoC registration event emitted successfully', {
            txHash: lensResult.transaction_hash,
            blockNumber: lensResult.block_number,
            submissionHash: submissionHash.substring(0, 20) + '...'
        })
        
        // Note: Token allocation is handled separately via allocateTokens()
        // This registration only records the PoC on-chain via Lens event
        
        return {
            success: true,
            transaction_hash: lensResult.transaction_hash,
            block_number: lensResult.block_number
        }
        
    } catch (error) {
        debugError('RegisterPoCBlockchain', 'Blockchain registration failed', error)
        
        // Provide more detailed error information
        let errorMessage = 'Unknown blockchain error'
        if (error instanceof Error) {
            errorMessage = error.message
            
            // Check for common errors
            if (errorMessage.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds in wallet for gas fees'
            } else if (errorMessage.includes('nonce')) {
                errorMessage = 'Transaction nonce error (try again)'
            } else if (errorMessage.includes('revert')) {
                errorMessage = `Transaction reverted: ${errorMessage}`
            } else if (errorMessage.includes('network')) {
                errorMessage = `Network error: ${errorMessage}`
            } else if (errorMessage.includes('rate limit')) {
                errorMessage = 'Rate limit exceeded (try again later)'
            }
        }
        
        return {
            success: false,
            error: errorMessage
        }
    }
}

/**
 * Verify blockchain transaction on Base
 * 
 * Checks if a transaction hash exists on Base blockchain (mainnet or testnet)
 */
export async function verifyBlockchainTransaction(txHash: string): Promise<boolean> {
    try {
        const config = getBaseMainnetConfig()
        
        if (!config) {
            debug('VerifyBlockchainTransaction', 'Base configuration not available, skipping verification')
            return false
        }
        
        debug('VerifyBlockchainTransaction', 'Verifying transaction on Base', { 
            txHash,
            network: config.chainId === 8453 ? 'base_mainnet' : 'base_sepolia'
        })
        
        const { provider } = createBaseProvider(config)
        const receipt = await provider.getTransactionReceipt(txHash)
        
        if (receipt && receipt.status === 1) {
            debug('VerifyBlockchainTransaction', 'Transaction verified successfully', {
                txHash,
                blockNumber: receipt.blockNumber,
                status: receipt.status
            })
            return true
        } else {
            debug('VerifyBlockchainTransaction', 'Transaction not found or failed', { txHash })
            return false
        }
        
    } catch (error) {
        debugError('VerifyBlockchainTransaction', 'Transaction verification failed', error)
        return false
    }
}
