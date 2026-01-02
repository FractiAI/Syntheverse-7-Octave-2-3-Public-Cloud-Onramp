/**
 * Blockchain Integration (Legacy - Hardhat)
 * 
 * ⚠️ DEPRECATED: This file contains legacy Hardhat integration code.
 * For Base mainnet/testnet integration, see: utils/blockchain/base-mainnet-integration.ts
 * 
 * Registers PoC on blockchain after Stripe payment confirmation
 * Returns transaction hash for storage in database
 */

import { debug, debugError } from '@/utils/debug'
import { ethers } from 'ethers'
import POCRegistryABI from './POCRegistry.abi.json'

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
 * Register PoC on Hard Hat L1 blockchain
 * 
 * This function creates a blockchain transaction to register the PoC
 * on the Hard Hat L1 network. The transaction includes:
 * - Submission hash
 * - Contributor address (derived from email)
 * - Metal type (first metal from array)
 * - Allocated amount (0 if allocations not yet created)
 * - Epoch number
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
    debug('RegisterPoCBlockchain', 'Initiating blockchain registration', {
        submissionHash,
        contributor,
        metals,
        hasSubmissionText: !!submissionText && submissionText.trim().length > 0
    })
    
    // Compute a stable content hash for anchoring (text-only submissions)
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
    
    try {
        // Check if Hard Hat RPC URL is configured
        const hardhatRpcUrl = process.env.HARDHAT_RPC_URL || process.env.NEXT_PUBLIC_HARDHAT_RPC_URL
        const contractAddress = process.env.POC_REGISTRY_ADDRESS
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY
        
        if (!hardhatRpcUrl) {
            debugError('RegisterPoCBlockchain', 'Hard Hat RPC URL not configured', {
                submissionHash,
                note: 'Set HARDHAT_RPC_URL or NEXT_PUBLIC_HARDHAT_RPC_URL environment variable'
            })
            return {
                success: false,
                error: 'Hard Hat RPC URL not configured'
            }
        }
        
        if (!contractAddress) {
            debugError('RegisterPoCBlockchain', 'POC Registry contract address not configured', {
                submissionHash,
                note: 'Set POC_REGISTRY_ADDRESS environment variable'
            })
            return {
                success: false,
                error: 'POC Registry contract address not configured'
            }
        }
        
        if (!privateKey) {
            debugError('RegisterPoCBlockchain', 'Blockchain private key not configured', {
                submissionHash,
                note: 'Set BLOCKCHAIN_PRIVATE_KEY environment variable (owner wallet private key)'
            })
            return {
                success: false,
                error: 'Blockchain private key not configured'
            }
        }
        
        // Connect to Hardhat network
        debug('RegisterPoCBlockchain', 'Connecting to Hardhat network', {
            rpcUrl: hardhatRpcUrl.substring(0, 30) + '...',
            contractAddress: contractAddress.substring(0, 20) + '...'
        })
        
        const provider = new ethers.JsonRpcProvider(hardhatRpcUrl)
        const wallet = new ethers.Wallet(privateKey, provider)
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, POCRegistryABI, wallet)
        
        // Prepare contract parameters
        // submissionHash is hex string (64 chars), convert to bytes32
        const submissionHashWithPrefix = submissionHash.startsWith('0x') ? submissionHash : '0x' + submissionHash
        const submissionHashBytes32 = ethers.zeroPadValue(submissionHashWithPrefix, 32)
        
        // Derive contributor address from email (placeholder - in production use wallet addresses)
        const contributorAddress = await deriveAddressFromEmail(contributor)
        
        // Use first metal from array (contract takes single string)
        const metal = metals && metals.length > 0 ? metals[0] : 'copper'
        
        // Allocated amount - use 0 as default since allocations may not be created yet
        // Contract can be updated later via updateContribution if needed
        const allocatedAmount = 0
        
        // Get epoch number (default to founder if not specified)
        const epochStr = metadata.qualified_epoch || 'founder'
        const epochNumber = epochToNumber(epochStr)
        
        debug('RegisterPoCBlockchain', 'Calling registerContribution', {
            submissionHash: submissionHash.substring(0, 20) + '...',
            contributorAddress,
            metal,
            allocatedAmount,
            epoch: epochNumber,
            epochStr
        })
        
        // Call registerContribution function
        const tx = await contract.registerContribution(
            submissionHashBytes32,
            contributorAddress,
            metal,
            allocatedAmount,
            epochNumber,
            {
                // Gas limit (adjust if needed)
                gasLimit: 500000
            }
        )
        
        debug('RegisterPoCBlockchain', 'Transaction sent, waiting for confirmation', {
            txHash: tx.hash,
            submissionHash: submissionHash.substring(0, 20) + '...'
        })
        
        // Wait for transaction confirmation
        const receipt = await tx.wait()
        
        debug('RegisterPoCBlockchain', 'Transaction confirmed', {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString(),
            submissionHash: submissionHash.substring(0, 20) + '...'
        })
        
        return {
            success: true,
            transaction_hash: receipt.hash,
            block_number: receipt.blockNumber
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
            }
        }
        
        return {
            success: false,
            error: errorMessage
        }
    }
}

/**
 * Verify blockchain transaction
 * 
 * Checks if a transaction hash exists on Hard Hat L1 blockchain
 */
export async function verifyBlockchainTransaction(txHash: string): Promise<boolean> {
    try {
        const hardhatRpcUrl = process.env.HARDHAT_RPC_URL || process.env.NEXT_PUBLIC_HARDHAT_RPC_URL
        
        if (!hardhatRpcUrl) {
            debug('VerifyBlockchainTransaction', 'Hard Hat RPC URL not configured, skipping verification')
            return false
        }
        
        debug('VerifyBlockchainTransaction', 'Verifying transaction', { txHash })
        
        const provider = new ethers.JsonRpcProvider(hardhatRpcUrl)
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
