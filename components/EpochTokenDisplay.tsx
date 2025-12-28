/**
 * Epoch and Token Display Component
 * Displays open epochs and available SYNTH token balances at the top of the dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

export function EpochTokenDisplay() {
    const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchEpochInfo()
    }, [])

    async function fetchEpochInfo() {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/tokenomics/epoch-info')
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`)
            }
            const data = await response.json()
            setEpochInfo(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load epoch information')
            console.error('Error fetching epoch info:', err)
        } finally {
            setLoading(false)
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

    if (error || !epochInfo) {
        return null // Fail silently to not break dashboard
    }

    const openEpochs = getOpenEpochs()
    const totalAvailable = openEpochs.reduce((sum, epoch) => {
        return sum + (epochInfo.epochs[epoch]?.balance || 0)
    }, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Open Epochs & Available SYNTH Tokens
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
                            Available SYNTH Tokens
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {openEpochs.map((epoch) => {
                                const epochData = epochInfo.epochs[epoch]
                                if (!epochData) return null
                                
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
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {epochData.distribution_percent}% of total supply
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Total Available */}
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Total Available for Allocation</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatTokens(totalAvailable)} SYNTH
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

