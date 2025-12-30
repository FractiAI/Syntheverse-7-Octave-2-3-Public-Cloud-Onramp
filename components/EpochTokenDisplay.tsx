/**
 * Epoch and Token Display Component
 * Displays open epochs and available SYNTH token balances at the top of the dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, TrendingUp, Loader2 } from 'lucide-react'

interface EpochInfo {
    current_epoch: string
    epochs: Record<string, {
        balance: number
        threshold: number
        distribution_amount: number
        distribution_percent: number
        available_tiers: string[]
    }>
    epoch_metals?: Record<string, Record<string, {
        balance: number
        threshold: number
        distribution_amount: number
        distribution_percent: number
    }>>
}

export function EpochTokenDisplay() {
    const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchEpochInfo()
        
        // Refresh epoch info when returning from Stripe checkout
        const params = new URLSearchParams(window.location.search)
        const registrationStatus = params.get('registration')
        
        if (registrationStatus === 'success') {
            // Poll for updated epoch balances (webhook may take a few seconds)
            let pollCount = 0
            const maxPolls = 20 // Poll for up to 20 seconds - webhooks can take time
            
            const pollInterval = setInterval(() => {
                pollCount++
                console.log(`[EpochInfo Poll ${pollCount}/${maxPolls}] Refreshing epoch info (silent)`)
                // Use silent=true to avoid showing loading state during polling
                fetchEpochInfo(true)
                
                // Stop polling after max attempts
                if (pollCount >= maxPolls) {
                    console.log('[EpochInfo Poll] Stopped polling after max attempts')
                    clearInterval(pollInterval)
                    // Final refresh without silent flag to ensure UI updates
                    fetchEpochInfo(false)
                }
            }, 1000)
            
            // Cleanup function to clear interval if component unmounts
            return () => {
                clearInterval(pollInterval)
            }
        }
    }, [])

    async function fetchEpochInfo(silent = false) {
        if (!silent) {
            setLoading(true)
        }
        setError(null)
        try {
            // Add timeout to prevent hanging (10 seconds)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)
            
            try {
                // Add cache bust parameter to ensure fresh data
                const response = await fetch(`/api/tokenomics/epoch-info?t=${Date.now()}`, {
                    signal: controller.signal
                })
                clearTimeout(timeoutId)
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`)
                }
                const data = await response.json()
                setEpochInfo(data)
            } catch (fetchErr) {
                clearTimeout(timeoutId)
                if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
                    throw new Error('Request timed out after 10 seconds')
                }
                throw fetchErr
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load epoch information'
            setError(errorMessage)
            console.error('Error fetching epoch info:', err)
            
            // If not silent, show error state after a delay
            if (!silent) {
                // Set loading to false immediately on error
                setLoading(false)
            }
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    const formatTokens = (tokens: number): string => {
        if (tokens >= 1_000_000_000_000) {
            return `${(tokens / 1_000_000_000_000).toFixed(2)}T`
        }
        if (tokens >= 1_000_000_000) {
            return `${(tokens / 1_000_000_000).toFixed(2)}B`
        }
        if (tokens >= 1_000_000) {
            return `${(tokens / 1_000_000).toFixed(2)}M`
        }
        return tokens.toLocaleString()
    }

    const getEpochBadge = (epoch: string, isCurrent: boolean) => {
        const epochColors: Record<string, string> = {
            founder: 'bg-yellow-500',
            pioneer: 'bg-gray-400',
            community: 'bg-blue-500',
            ecosystem: 'bg-green-500'
        }
        
        const colorClass = epochColors[epoch.toLowerCase()] || 'bg-gray-500'
        
        return (
            <Badge variant="default" className={`${colorClass} text-white capitalize ${isCurrent ? 'ring-2 ring-offset-2 ring-yellow-300' : ''}`}>
                {epoch}
                {isCurrent && ' (Current)'}
            </Badge>
        )
    }

    const getOpenEpochs = (): string[] => {
        if (!epochInfo) return []
        
        // Only show the current epoch - when current_epoch is 'founder', only founder should be open
        // Epochs open progressively as we transition: founder -> pioneer -> community -> ecosystem
        const currentEpoch = (epochInfo.current_epoch || 'founder').toLowerCase().trim()
        
        // For founder epoch (or if current epoch is not set), only show founder
        if (currentEpoch === 'founder' || !currentEpoch) {
            return ['founder']
        }
        
        // For other epochs, show all epochs up to and including current
        const epochOrder = ['founder', 'pioneer', 'community', 'ecosystem']
        const currentIndex = epochOrder.indexOf(currentEpoch)
        
        if (currentIndex === -1 || currentIndex < 0) {
            // Fallback: if current_epoch is unknown or invalid, default to founder only
            console.warn('EpochTokenDisplay: Unknown current_epoch value:', epochInfo.current_epoch, '- defaulting to founder only')
            return ['founder']
        }
        
        return epochOrder.slice(0, currentIndex + 1)
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading epoch information...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <span className="text-sm text-destructive">Failed to load epoch information</span>
                        <span className="text-xs text-muted-foreground">{error}</span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                setError(null)
                                fetchEpochInfo()
                            }}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    if (!epochInfo) {
        return null // Fail silently if no data and no error
    }

    const openEpochs = getOpenEpochs()
    const totalAvailable = openEpochs.reduce((sum, epoch) => {
        const epochTotal = epochInfo.epochs[epoch]?.balance || 0
        return sum + epochTotal
    }, 0)

    return (
        <Card>
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                        Open Epochs & Available SYNTH Tokens (Gold / Silver / Copper)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Open Epochs */}
                    <div>
                        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Open Epochs ({openEpochs.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {openEpochs.map((epoch) => (
                                <div key={epoch}>
                                    {getEpochBadge(epoch, epoch === epochInfo.current_epoch)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Token Balances */}
                    <div>
                        <div className="text-sm font-semibold mb-3">
                            Available SYNTH Tokens (per epoch)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {openEpochs.map((epoch) => {
                                const epochData = epochInfo.epochs[epoch]
                                if (!epochData) return null

                                const metalData = epochInfo.epoch_metals?.[epoch] || {}
                                
                                return (
                                    <div 
                                        key={epoch}
                                        className={`p-4 rounded-lg border-2 ${
                                            epoch === epochInfo.current_epoch 
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' 
                                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold capitalize">
                                                {epoch}
                                            </span>
                                            {epoch === epochInfo.current_epoch && (
                                                <Badge variant="outline" className="text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {formatTokens(epochData.balance)}
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                            <div className="p-2 rounded border bg-background">
                                                <div className="font-semibold" style={{ color: '#ffb84d' }}>Gold</div>
                                                <div>{formatTokens(Number(metalData.gold?.balance || 0))}</div>
                                            </div>
                                            <div className="p-2 rounded border bg-background">
                                                <div className="font-semibold" style={{ color: '#94a3b8' }}>Silver</div>
                                                <div>{formatTokens(Number(metalData.silver?.balance || 0))}</div>
                                            </div>
                                            <div className="p-2 rounded border bg-background">
                                                <div className="font-semibold" style={{ color: '#d97706' }}>Copper</div>
                                                <div>{formatTokens(Number(metalData.copper?.balance || 0))}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {epochData.distribution_percent.toFixed(1)}% of total supply
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Total Available */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Total Available for Allocation</span>
                            <span className="text-2xl font-bold">{formatTokens(totalAvailable)} SYNTH</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
