/**
 * Base Blockchain Integration (Mainnet/Testnet)
 * 
 * Integrates with Syntheverse Genesis contracts on Base:
 * - SyntheverseGenesisSYNTH90T: Token allocations (Gold/Silver/Copper)
 * - SyntheverseGenesisLensKernel: Event emission for protocol events
 * 
 * Default: Base Mainnet (Chain ID: 8453)
 * RPC: https://mainnet.base.org
 * 
 * Testnet: Base Sepolia Testnet (Chain ID: 84532)
 * RPC: https://sepolia.base.org
 * 
 * Set BLOCKCHAIN_NETWORK=base_sepolia to use testnet
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
 * Get Base configuration from environment variables (mainnet or testnet)
 * Defaults to Base Mainnet for production
 */
export function getBaseMainnetConfig(): BaseMainnetConfig | null {
    // Default to Base Mainnet for production
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
    
    // Simple address handling - trim only, trust ethers.getAddress() for validation
    const synth90TAddress = (process.env.SYNTH90T_CONTRACT_ADDRESS || '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3').trim()
    const lensKernelAddress = (process.env.LENS_KERNEL_CONTRACT_ADDRESS || '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8').trim()
    
    // Check both BLOCKCHAIN_PRIVATE_KEY and DEPLOYER_PRIVATE_KEY (for compatibility)
    let privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY?.trim() || process.env.DEPLOYER_PRIVATE_KEY?.trim()
    
    if (!privateKey) {
        debugError('BaseMainnetConfig', 'BLOCKCHAIN_PRIVATE_KEY not configured', new Error('Missing BLOCKCHAIN_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY environment variable'))
        return null
    }
    
    // Ensure private key has 0x prefix (required by ethers.js)
    if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey
        debug('BaseMainnetConfig', 'Added 0x prefix to private key')
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
 * Create Base provider and wallet (testnet or mainnet based on config)
 * Simplified to match working Base deployment pattern
 */
export function createBaseProvider(config: BaseMainnetConfig): {
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
} {
    // Simple provider creation - ethers.js v6 handles Base network correctly
    const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
        chainId: config.chainId,
        name: config.chainId === 8453 ? 'base-mainnet' : 'base-sepolia'
    })
    
    // Simple wallet creation
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
                error: 'Base blockchain configuration not available'
            }
        }
        
        const { provider, wallet } = createBaseProvider(config)
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const synth90TAddress = ethers.getAddress(config.synth90TAddress.trim())
        
        // Create contract instance
        const synthContract = new ethers.Contract(
            synth90TAddress,
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
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const synth90TAddress = ethers.getAddress(config.synth90TAddress.trim())
        
        const synthContract = new ethers.Contract(
            synth90TAddress,
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
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const synth90TAddress = ethers.getAddress(config.synth90TAddress.trim())
        
        const synthContract = new ethers.Contract(
            synth90TAddress,
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
                error: 'Base blockchain configuration not available'
            }
        }
        
        // Simple provider creation - no ENS overrides (matches working deployment)
        const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
            chainId: config.chainId,
            name: config.chainId === 8453 ? 'base-mainnet' : 'base-sepolia'
        })
        
        // Simple wallet creation
        const wallet = new ethers.Wallet(config.privateKey, provider)
        
        // Simple address handling - only trim at config level (trust ethers.getAddress())
        const lensKernelAddress = ethers.getAddress(config.lensKernelAddress.trim())
        
        // Simple contract creation - direct pattern (matches working deployment)
        const lensContract = new ethers.Contract(
            lensKernelAddress,
            SyntheverseGenesisLensKernelABI,
            wallet
        )
        
        // Verify wallet is contract owner before calling extendLens (onlyOwner modifier)
        // Note: If owner() function is not available or reverts, we'll proceed and let the transaction fail with a clear error
        const walletAddress = await wallet.getAddress()
        try {
            const contractOwner = await lensContract.owner()
            if (contractOwner.toLowerCase() !== walletAddress.toLowerCase()) {
                debugError('EmitLensEvent', 'Wallet is not contract owner', new Error(`Wallet ${walletAddress} is not the owner. Contract owner: ${contractOwner}`))
                return {
                    success: false,
                    error: `Wallet ${walletAddress} is not the owner of the LensKernel contract. Only the contract owner can call extendLens(). Contract owner: ${contractOwner}`
                }
            }
            debug('EmitLensEvent', 'Ownership verified', { walletAddress, contractOwner })
        } catch (ownerError) {
            // If owner() call fails, log warning but proceed - the transaction will fail with a clearer error
            debug('EmitLensEvent', 'Could not verify ownership (owner() call failed)', { 
                walletAddress,
                error: ownerError instanceof Error ? ownerError.message : 'Unknown error'
            })
            // Continue - the extendLens call will fail with a clear error if wallet is not owner
        }
        
        // Convert data to bytes
        const dataBytes = ethers.toUtf8Bytes(data)
        
        // Check wallet balance before attempting transaction
        const balance = await provider.getBalance(walletAddress)
        const feeData = await provider.getFeeData()
        
        // Use a reasonable gas limit for extendLens (typically 100-150k, but use 200k for safety)
        const gasLimit = BigInt(200000)
        // Get gas price, fallback to 0 if not available
        let gasPrice: bigint = BigInt(0)
        if (feeData.gasPrice) {
            gasPrice = feeData.gasPrice
        } else {
            try {
                const fallbackFeeData = await provider.getFeeData()
                gasPrice = fallbackFeeData.gasPrice || BigInt(0)
            } catch {
                gasPrice = BigInt(0)
            }
        }
        const estimatedGasCost = gasPrice * gasLimit
        
        // Convert to USD for better understanding (Base ETH price ~$2500, but this is approximate)
        const balanceEth = parseFloat(ethers.formatEther(balance))
        const estimatedCostEth = parseFloat(ethers.formatEther(estimatedGasCost))
        
        debug('EmitLensEvent', 'Pre-transaction checks', {
            extensionType,
            dataLength: dataBytes.length,
            contractAddress: lensKernelAddress,
            walletAddress,
            balance: {
                wei: balance.toString(),
                eth: balanceEth.toFixed(6),
                usd: `~$${(balanceEth * 2500).toFixed(2)}` // Approximate USD
            },
            gas: {
                limit: gasLimit.toString(),
                priceGwei: ethers.formatUnits(gasPrice, 'gwei'),
                estimatedCost: {
                    wei: estimatedGasCost.toString(),
                    eth: estimatedCostEth.toFixed(6),
                    usd: `~$${(estimatedCostEth * 2500).toFixed(2)}` // Approximate USD
                }
            }
        })
        
        // Check if balance is sufficient (with 20% buffer for price fluctuations)
        const requiredBalance = estimatedGasCost * BigInt(120) / BigInt(100)
        if (balance < requiredBalance) {
            return {
                success: false,
                error: `Insufficient balance for gas. Balance: ${balanceEth.toFixed(6)} ETH (~$${(balanceEth * 2500).toFixed(2)}), Estimated cost: ${estimatedCostEth.toFixed(6)} ETH (~$${(estimatedCostEth * 2500).toFixed(2)}). Please add more ETH to your wallet.`
            }
        }
        
        debug('EmitLensEvent', 'Calling extendLens', {
            extensionType,
            dataLength: dataBytes.length,
            contractAddress: lensKernelAddress,
            walletAddress,
            gasLimit: gasLimit.toString()
        })
        
        // Direct call with explicit gas limit to bypass estimation issues
        // This prevents the require(false) error during estimateGas
        let tx
        try {
            tx = await lensContract.extendLens(extensionType, dataBytes, {
                gasLimit: gasLimit
            })
            debug('EmitLensEvent', 'Transaction sent', { txHash: tx.hash })
        } catch (sendError: any) {
            // If sending fails, try to get more details
            debugError('EmitLensEvent', 'Failed to send transaction', sendError)
            
            // Check if it's a revert during send
            if (sendError.reason || sendError.data) {
                return {
                    success: false,
                    error: `Transaction failed: ${sendError.reason || sendError.message || 'Unknown error'}`
                }
            }
            
            throw sendError
        }
        
        // Wait for confirmation (simple pattern)
        let receipt
        try {
            receipt = await tx.wait()
        } catch (waitError: any) {
            // If wait fails, try to get the receipt anyway
            debugError('EmitLensEvent', 'Transaction wait failed', waitError)
            
            try {
                receipt = await provider.getTransactionReceipt(tx.hash)
                if (!receipt) {
                    throw waitError
                }
            } catch {
                throw waitError
            }
        }
        
        // Validate transaction status (HIGH priority fix)
        if (receipt.status === 0) {
            debugError('EmitLensEvent', 'Transaction reverted on-chain', new Error('Transaction status is 0 (failed)'))
            
            // Try to get revert reason by calling the function again (static call)
            let revertReason = 'Unknown revert reason'
            try {
                await lensContract.extendLens.staticCall(extensionType, dataBytes)
            } catch (staticError: any) {
                revertReason = staticError.reason || staticError.message || 'Contract reverted (require(false) or similar)'
            }
            
            return {
                success: false,
                error: `Transaction reverted on-chain: ${revertReason}. Gas used: ${receipt.gasUsed.toString()}. This suggests the contract has validation that failed.`
            }
        }
        
        debug('EmitLensEvent', 'Lens event emitted', {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            status: receipt.status
        })
        
        return {
            success: true,
            transaction_hash: receipt.hash,
            block_number: receipt.blockNumber
        }
        
    } catch (error) {
        debugError('EmitLensEvent', 'Failed to emit lens event', error)
        
        // Extract error information (simple pattern)
        let errorMessage = 'Unknown error'
        
        if (error instanceof Error) {
            errorMessage = error.message
            
            // Extract ethers.js specific error information
            const ethersError = error as any
            
            if (ethersError.code) {
                errorMessage = `[${ethersError.code}] ${errorMessage}`
            }
            if (ethersError.reason) {
                errorMessage = `${errorMessage} - ${ethersError.reason}`
            }
        }
        
        return {
            success: false,
            error: errorMessage
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
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const lensKernelAddress = ethers.getAddress(config.lensKernelAddress.trim())
        
        const lensContract = new ethers.Contract(
            lensKernelAddress,
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
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const synth90TAddress = ethers.getAddress(config.synth90TAddress.trim())
        
        const synthContract = new ethers.Contract(
            synth90TAddress,
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
        
        return events.map(event => {
            // Type guard for EventLog
            if ('args' in event && event.args) {
                return {
                    submissionHash: event.args[0],
                    contributor: event.args[1],
                    metal: event.args[2],
                    amount: event.args[3].toString(),
                    epochBalance: event.args[4].toString(),
                    timestamp: Number(event.args[5]),
                    blockNumber: event.blockNumber,
                    transactionHash: event.transactionHash
                }
            }
            // Fallback for Log type
            return {
                submissionHash: '',
                contributor: '',
                metal: '',
                amount: '0',
                epochBalance: '0',
                timestamp: 0,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash
            }
        })
        
    } catch (error) {
        debugError('QueryMetalAllocatedEvents', 'Failed to query events', error)
        return []
    }
}

/**
 * Query LensExtended events from SyntheverseGenesisLensKernel
 * Filters for poc_registration extension type
 * 
 * @param fromBlock - Starting block number (optional)
 * @param toBlock - Ending block number (optional)
 * @returns Array of PoC registration events
 */
export async function queryPoCRegistrationEvents(
    fromBlock?: number,
    toBlock?: number
): Promise<Array<{
    submissionHash: string
    contributor: string
    contributorEmail: string
    metal: string
    metadata: any
    submissionTextHash: string | null
    timestamp: number
    transactionHash: string
    blockNumber: number
    extensionType: string
}>> {
    try {
        const config = getBaseMainnetConfig()
        if (!config) {
            debug('QueryPoCRegistrationEvents', 'Base configuration not available')
            return []
        }
        
        const { provider } = createBaseProvider(config)
        
        // Simple address normalization - trim only, trust ethers.getAddress()
        const lensKernelAddress = ethers.getAddress(config.lensKernelAddress.trim())
        
        const lensContract = new ethers.Contract(
            lensKernelAddress,
            SyntheverseGenesisLensKernelABI,
            provider
        )
        
        // Query LensExtended events with extensionType = 'poc_registration'
        const filter = lensContract.filters.LensExtended('poc_registration')
        
        const events = await lensContract.queryFilter(
            filter,
            fromBlock || 0,
            toBlock || 'latest'
        )
        
        debug('QueryPoCRegistrationEvents', `Found ${events.length} PoC registration events`)
        
        // Parse events and extract PoC data
        const registrations = []
        for (const event of events) {
            try {
                // Type guard for EventLog
                if (!('args' in event) || !event.args) {
                    continue
                }
                
                const eventLog = event as ethers.EventLog
                const extensionType = eventLog.args[0] as string
                const dataBytes = eventLog.args[1] as string
                const timestamp = Number(eventLog.args[2])
                
                // Decode the data bytes (should be UTF-8 JSON string)
                const dataJson = ethers.toUtf8String(dataBytes)
                const eventData = JSON.parse(dataJson)
                
                // Only process poc_registration events
                if (eventData.type === 'poc_registration') {
                    registrations.push({
                        submissionHash: eventData.submissionHash,
                        contributor: eventData.contributor,
                        contributorEmail: eventData.contributorEmail,
                        metal: eventData.metal,
                        metadata: eventData.metadata,
                        submissionTextHash: eventData.submissionTextHash,
                        timestamp: eventData.timestamp || timestamp,
                        transactionHash: eventLog.transactionHash,
                        blockNumber: eventLog.blockNumber,
                        extensionType
                    })
                }
            } catch (parseError) {
                debugError('QueryPoCRegistrationEvents', 'Failed to parse event', parseError)
                // Continue with next event
            }
        }
        
        debug('QueryPoCRegistrationEvents', `Parsed ${registrations.length} valid PoC registrations`)
        return registrations
        
    } catch (error) {
        debugError('QueryPoCRegistrationEvents', 'Failed to query PoC registration events', error)
        return []
    }
}

/**
 * Verify transaction on Base (testnet or mainnet)
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


