/**
 * PoC Archive Component
 * Displays My Submissions and All Submissions with scores and status
 * Clickable rows to view details, with register button for qualified PoCs
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog'
import { Loader2, RefreshCw, FileText, CheckCircle2, XCircle, Clock, CreditCard, ExternalLink, Link2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { debug, debugError } from '@/utils/debug'

interface PoCSubmission {
    submission_hash: string
    title: string
    contributor: string
    category: string | null
    status: string
    metals: string[]
    pod_score: number | null
    novelty: number | null
    density: number | null
    coherence: number | null
    alignment: number | null
    redundancy: number | null // Redundancy percentage (0-100)
    redundancy_overlap_percent?: number | null
    qualified: boolean | null
    qualified_epoch: string | null
    registered: boolean | null
    registration_date: string | null
    registration_tx_hash: string | null
    stripe_payment_id: string | null
    allocated: boolean | null
    allocation_amount: number | null // Total SYNTH amount recorded (legacy field)
    created_at: string
    updated_at: string
    text_content?: string
    metadata?: any
    grok_evaluation_details?: {
        base_novelty?: number
        base_density?: number
        redundancy_overlap_percent?: number
        density_penalty_percent?: number
        full_evaluation?: any
        raw_grok_response?: string // Raw Grok API response text/markdown
    }
}

interface PoCArchiveProps {
    userEmail: string
}

type ViewMode = 'my' | 'qualified' | 'all'

export function PoCArchive({ userEmail }: PoCArchiveProps) {
    const [allSubmissions, setAllSubmissions] = useState<PoCSubmission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<PoCSubmission | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [registering, setRegistering] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('my')
    const [onChainDialogOpen, setOnChainDialogOpen] = useState(false)
    const [onChainLoading, setOnChainLoading] = useState(false)
    const [onChainData, setOnChainData] = useState<any>(null)
    const [onChainError, setOnChainError] = useState<string | null>(null)

    const mySubmissions = allSubmissions.filter(s => s.contributor === userEmail)
    const qualifiedSubmissions = allSubmissions.filter(s => s.qualified === true)
    const otherSubmissions = allSubmissions.filter(s => s.contributor !== userEmail)
    
    // Get submissions based on current view mode
    const getFilteredSubmissions = (): PoCSubmission[] => {
        switch (viewMode) {
            case 'my':
                return mySubmissions
            case 'qualified':
                return qualifiedSubmissions
            case 'all':
                return allSubmissions
            default:
                return mySubmissions
        }
    }
    
    const getViewTitle = (): string => {
        switch (viewMode) {
            case 'my':
                return 'My Submissions'
            case 'qualified':
                return 'Qualified Submissions'
            case 'all':
                return 'All Submissions'
            default:
                return 'My Submissions'
        }
    }

    useEffect(() => {
        let isMounted = true
        
        async function loadData() {
            try {
                await fetchSubmissions()
            } catch (err) {
                console.error('Error loading PoC archive:', err)
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load submissions')
                    setLoading(false)
                }
            }
        }
        
        loadData()
        
        // Check if we're returning from a successful registration
        const params = new URLSearchParams(window.location.search)
        const registrationStatus = params.get('registration')
        const registrationHash = params.get('hash')
        
        if (registrationStatus === 'success' && registrationHash) {
            // Poll for registration status update (webhook may take a few seconds)
            let pollCount = 0
            const maxPolls = 20 // Poll for up to 20 seconds (1 second intervals) - webhooks can take time
            let pollInterval: NodeJS.Timeout | null = null
            let hasAllocation = false
            
            const pollForRegistration = async () => {
                pollCount++
                
                try {
                    // Check registration status endpoint first (faster than fetching all submissions)
                    const statusResponse = await fetch(`/api/poc/${registrationHash}/registration-status?t=${Date.now()}`)
                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json()
                        console.log(`[Poll ${pollCount}/${maxPolls}] Registration status:`, statusData)
                        
                        // Check if registered AND has allocation
                        if (statusData.registered) {
                            // Also check for allocation
                            try {
                                const allocResponse = await fetch(`/api/allocations/${registrationHash}?t=${Date.now()}`)
                                if (allocResponse.ok) {
                                    const allocData = await allocResponse.json()
                                    hasAllocation = allocData.count > 0 && allocData.total_reward > 0
                                    console.log(`[Poll ${pollCount}] Allocation check:`, {
                                        hasAllocation,
                                        count: allocData.count,
                                        total: allocData.total_reward
                                    })
                                }
                            } catch (allocErr) {
                                console.warn(`[Poll ${pollCount}] Error checking allocation:`, allocErr)
                            }
                            
                            // If registered and we've checked a few times, refresh and stop
                            // (allocation might still be processing, but registration is confirmed)
                            if (pollCount >= 3) {
                                if (pollInterval) {
                                    clearInterval(pollInterval)
                                    pollInterval = null
                                }
                                // Fetch fresh submission data with cache bust
                                await fetchSubmissions()
                                // Clean up URL params
                                window.history.replaceState({}, '', window.location.pathname)
                                console.log(`[Poll] Registration confirmed after ${pollCount} attempts, refreshing dashboard`)
                                return true // Signal that registration was confirmed
                            }
                        }
                    } else {
                        console.error(`[Poll ${pollCount}] Status check failed:`, statusResponse.status, statusResponse.statusText)
                    }
                    
                    // Fetch all submissions every 2 polls to ensure we get allocation updates
                    if (pollCount % 2 === 0) {
                        await fetchSubmissions()
                    }
                } catch (err) {
                    console.error(`[Poll ${pollCount}] Error polling for registration status:`, err)
                }
                
                // Stop polling after max attempts
                if (pollCount >= maxPolls) {
                    if (pollInterval) {
                        clearInterval(pollInterval)
                        pollInterval = null
                    }
                    console.warn(`[Poll] Stopped polling after ${maxPolls} attempts. Registration may still be processing.`)
                    // Final refresh attempt with cache bust
                    await fetchSubmissions()
                    // Clean up URL params even if registration not confirmed yet
                    window.history.replaceState({}, '', window.location.pathname)
                    return true // Signal that polling should stop
                }
                
                return false // Continue polling
            }
            
            // Start polling immediately and continue every second
            pollForRegistration() // Immediate check
            pollInterval = setInterval(async () => {
                const shouldStop = await pollForRegistration()
                if (shouldStop && pollInterval) {
                    clearInterval(pollInterval)
                    pollInterval = null
                }
            }, 1000)
            
            // Cleanup function to clear interval if component unmounts
            return () => {
                isMounted = false
                if (pollInterval) {
                    clearInterval(pollInterval)
                }
            }
        } else {
            // Cleanup function when not polling
            return () => {
                isMounted = false
            }
        }
    }, [userEmail])

    const fetchOnChainPoCs = async () => {
        setOnChainLoading(true)
        setOnChainError(null)
        setOnChainDialogOpen(true)
        
        try {
            const response = await fetch('/api/blockchain/on-chain-pocs')
            const data = await response.json()
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || 'Failed to fetch on-chain PoCs')
            }
            
            setOnChainData(data)
        } catch (error) {
            debugError('PoCArchive', 'Failed to fetch on-chain PoCs', error)
            setOnChainError(error instanceof Error ? error.message : 'Unknown error')
        } finally {
            setOnChainLoading(false)
        }
    }
    
    async function fetchSubmissions() {
        setLoading(true)
        setError(null)
        try {
            // Add cache bust parameter to ensure fresh data
            const response = await fetch(`/api/archive/contributions?limit=200&t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Archive API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                })
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            
            if (!data || !Array.isArray(data.contributions)) {
                console.error('Invalid API response:', data)
                throw new Error('Invalid response format from server')
            }
            
            setAllSubmissions(data.contributions || [])
        } catch (err) {
            console.error('Error fetching submissions:', err)
            setError(err instanceof Error ? err.message : 'Failed to load submissions')
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister(hash: string) {
        setRegistering(hash)
        try {
            const response = await fetch(`/api/poc/${hash}/register`, {
                method: 'POST'
            })
            
            // Try to parse response as JSON
            let data: any
            try {
                const text = await response.text()
                if (!text) {
                    throw new Error(`Empty response from server (status: ${response.status})`)
                }
                data = JSON.parse(text)
            } catch (parseError) {
                console.error('Failed to parse response:', parseError)
                throw new Error(`Invalid response from server (status: ${response.status}). Please check server logs.`)
            }
            
            // Check if response indicates an error
            if (!response.ok) {
                const errorMessage = data.message || data.error || `Failed to initiate registration (${response.status})`
                const errorType = data.error_type ? ` (${data.error_type})` : ''
                const errorDetails = data.details ? ` - ${data.details}` : ''
                const errorCode = data.errorDetails?.code ? ` [Code: ${data.errorDetails.code}]` : ''
                const revertReason = data.errorDetails?.revertReason ? `\nRevert Reason: ${data.errorDetails.revertReason}` : ''
                const fullError = `${errorMessage}${errorType}${errorCode}${errorDetails}${revertReason}`
                console.error('Registration API Error:', {
                    status: response.status,
                    data,
                    fullError
                })
                throw new Error(fullError)
            }
            
            // Registration is now free - directly registered on blockchain
            if (data.success && data.registered) {
                // Registration successful - show success and redirect to dashboard
                alert(`PoC registered successfully on blockchain!\nTransaction Hash: ${data.registration_tx_hash || 'N/A'}`)
                // Redirect to dashboard
                window.location.href = '/dashboard'
            } else {
                throw new Error(data?.message || data?.error || 'Registration failed')
            }
        } catch (err) {
            console.error('Registration error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to register PoC'
            // Show detailed error in alert
            alert(`Registration Error:\n\n${errorMessage}\n\nCheck browser console for more details.`)
        } finally {
            setRegistering(null)
        }
    }

    async function handleRowClick(submission: PoCSubmission) {
        // Fetch full details including registration info
        try {
            const response = await fetch(`/api/archive/contributions/${submission.submission_hash}`)
            if (response.ok) {
                const details = await response.json()
                // Merge submission with fetched details, ensuring registration fields are included
                setSelectedSubmission({ 
                    ...submission, 
                    ...details,
                    registration_date: details.registration_date || submission.registration_date || null,
                    registration_tx_hash: details.registration_tx_hash || submission.registration_tx_hash || null,
                    stripe_payment_id: details.stripe_payment_id || submission.stripe_payment_id || null,
                    registered: details.registered !== undefined ? details.registered : submission.registered,
                    allocation_amount: details.allocation_amount !== undefined ? details.allocation_amount : submission.allocation_amount
                })
            } else {
                setSelectedSubmission(submission)
            }
        } catch (err) {
            setSelectedSubmission(submission)
        }
        setIsDetailOpen(true)
    }

    const formatScore = (score: number | null) => {
        if (score === null) return 'N/A'
        return score.toLocaleString()
    }

    const formatRedundancy = (redundancy: number | null) => {
        if (redundancy === null || redundancy === undefined) return '—'
        return `${redundancy.toFixed(1)}%`
    }

    const formatAllocation = (amount: number | null) => {
        if (amount === null || amount === undefined) return '—'
        if (amount >= 1_000_000_000_000) {
            return `${(amount / 1_000_000_000_000).toFixed(2)}T SYNTH`
        }
        if (amount >= 1_000_000_000) {
            return `${(amount / 1_000_000_000).toFixed(2)}B SYNTH`
        }
        if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(2)}M SYNTH`
        }
        return `${amount.toLocaleString()} SYNTH`
    }

    const getStatusBadge = (submission: PoCSubmission) => {
        // Only statuses shown in UI: Not Qualified, Qualified, Registered
        // Treat "allocated" as "Registered" (same terminal state in UI).
        if (submission.registered || submission.allocated) {
            // Use metal color for registered status
            const primaryMetal = submission.metals && submission.metals.length > 0 
                ? submission.metals[0].toLowerCase() 
                : 'copper'
            const metalColors: Record<string, string> = {
                gold: 'bg-yellow-500',
                silver: 'bg-gray-400',
                copper: 'bg-orange-600',
                hybrid: 'bg-blue-500'
            }
            const colorClass = metalColors[primaryMetal] || 'bg-blue-500'
            return <Badge variant="default" className={`${colorClass} text-white`}>Registered</Badge>
        }
        if (submission.qualified) {
            return <Badge variant="default" className="bg-purple-500">Qualified</Badge>
        }
        return <Badge variant="outline" className="bg-gray-500 text-white">Not Qualified</Badge>
    }

    const getMetalBadges = (metals: string[]) => {
        if (!metals || metals.length === 0) return null
        return (
            <div className="flex gap-1">
                {metals.map((metal, idx) => {
                    const colors: Record<string, string> = {
                        gold: 'bg-yellow-500',
                        silver: 'bg-gray-400',
                        copper: 'bg-orange-600'
                    }
                    return (
                        <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`${colors[metal.toLowerCase()] || 'bg-gray-500'} text-white border-0`}
                        >
                            {metal}
                        </Badge>
                    )
                })}
            </div>
        )
    }

    const getEpochBadge = (epoch: string | null) => {
        if (!epoch) return <span className="text-muted-foreground text-sm">—</span>
        
        const epochColors: Record<string, string> = {
            founder: 'bg-yellow-500',
            pioneer: 'bg-gray-400',
            community: 'bg-blue-500',
            ecosystem: 'bg-green-500'
        }
        
        const epochLower = epoch.toLowerCase()
        const colorClass = epochColors[epochLower] || 'bg-gray-500'
        
        return (
            <Badge variant="default" className={`${colorClass} text-white capitalize`}>
                {epoch}
            </Badge>
        )
    }

    const renderTable = (submissions: PoCSubmission[], title: string) => {
        if (submissions.length === 0) return null

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-semibold">Title</th>
                                    <th className="text-left p-2 font-semibold">Status</th>
                                    <th className="text-left p-2 font-semibold">Epoch</th>
                                    <th className="text-left p-2 font-semibold">Metals</th>
                                    <th className="text-right p-2 font-semibold">PoC Score</th>
                                    <th className="text-right p-2 font-semibold">Novelty</th>
                                    <th className="text-right p-2 font-semibold">Density</th>
                                    <th className="text-right p-2 font-semibold">Coherence</th>
                                    <th className="text-right p-2 font-semibold">Overlap</th>
                                    <th className="text-right p-2 font-semibold">SYNTH Allocation</th>
                                    <th className="text-left p-2 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission) => (
                                    <tr 
                                        key={submission.submission_hash} 
                                        className="border-b hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleRowClick(submission)}
                                    >
                                        <td className="p-2">
                                            <div className="font-medium">{submission.title}</div>
                                            {submission.category && (
                                                <div className="text-xs text-muted-foreground capitalize">
                                                    {submission.category}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            {getStatusBadge(submission)}
                                        </td>
                                        <td className="p-2">
                                            {getEpochBadge(submission.qualified_epoch)}
                                        </td>
                                        <td className="p-2">
                                            {getMetalBadges(submission.metals)}
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            {formatScore(submission.pod_score)}
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            {formatScore(submission.novelty)}
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            {formatScore(submission.density)}
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            {formatScore(submission.coherence)}
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            <span
                                                className={
                                                    submission.redundancy && submission.redundancy > 0
                                                        ? 'text-green-600'
                                                        : submission.redundancy && submission.redundancy < 0
                                                          ? 'text-orange-600'
                                                          : ''
                                                }
                                                title={
                                                    submission.redundancy !== null && submission.redundancy !== undefined
                                                        ? `${submission.redundancy > 0 ? 'Bonus' : 'Penalty'}: ${submission.redundancy > 0 ? '+' : ''}${submission.redundancy.toFixed(1)}%`
                                                        : undefined
                                                }
                                            >
                                                {formatRedundancy(submission.redundancy)}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-mono text-sm">
                                            {formatAllocation(submission.allocation_amount)}
                                        </td>
                                        <td className="p-2 text-sm text-muted-foreground">
                                            {new Date(submission.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <div className="text-destructive">{error}</div>
                    <Button onClick={fetchSubmissions} className="mt-4">
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const hasSubmissions = allSubmissions.length > 0

    const filteredSubmissions = getFilteredSubmissions()
    const showContributorColumn = viewMode === 'all' || viewMode === 'qualified'

    return (
        <>
            <div className="space-y-6">
                {/* View Selector */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>PoC Submissions Archive</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={fetchOnChainPoCs}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                >
                                    <Link2 className="h-4 w-4 mr-2" />
                                    View On-Chain
                                </Button>
                                <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={viewMode === 'my' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('my')}
                            >
                                My Submissions
                            </Button>
                            <Button
                                variant={viewMode === 'qualified' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('qualified')}
                            >
                                Qualified Submissions
                            </Button>
                            <Button
                                variant={viewMode === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('all')}
                            >
                                All Submissions
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtered Submissions Table */}
                {hasSubmissions && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{getViewTitle()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredSubmissions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No {getViewTitle().toLowerCase()} found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2 font-semibold">Title</th>
                                                {showContributorColumn && (
                                                    <th className="text-left p-2 font-semibold">Contributor</th>
                                                )}
                                                <th className="text-left p-2 font-semibold">Status</th>
                                                <th className="text-left p-2 font-semibold">Epoch</th>
                                                <th className="text-left p-2 font-semibold">Metals</th>
                                                <th className="text-right p-2 font-semibold">PoC Score</th>
                                                <th className="text-right p-2 font-semibold">Novelty</th>
                                                <th className="text-right p-2 font-semibold">Density</th>
                                                <th className="text-right p-2 font-semibold">Coherence</th>
                                                <th className="text-right p-2 font-semibold">Overlap</th>
                                                <th className="text-right p-2 font-semibold">SYNTH Allocation</th>
                                                <th className="text-left p-2 font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubmissions.map((submission) => (
                                                <tr 
                                                    key={submission.submission_hash} 
                                                    className="border-b hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => handleRowClick(submission)}
                                                >
                                                    <td className="p-2">
                                                        <div className="font-medium">{submission.title}</div>
                                                        {submission.category && (
                                                            <div className="text-xs text-muted-foreground capitalize">
                                                                {submission.category}
                                                            </div>
                                                        )}
                                                    </td>
                                                    {showContributorColumn && (
                                                        <td className="p-2 text-sm text-muted-foreground">
                                                            {submission.contributor}
                                                        </td>
                                                    )}
                                                    <td className="p-2">
                                                        {getStatusBadge(submission)}
                                                    </td>
                                                    <td className="p-2">
                                                        {getEpochBadge(submission.qualified_epoch)}
                                                    </td>
                                                    <td className="p-2">
                                                        {getMetalBadges(submission.metals)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        {formatScore(submission.pod_score)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        {formatScore(submission.novelty)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        {formatScore(submission.density)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        {formatScore(submission.coherence)}
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        <span
                                                            className={
                                                                submission.redundancy && submission.redundancy > 0
                                                                    ? 'text-green-600'
                                                                    : submission.redundancy && submission.redundancy < 0
                                                                      ? 'text-orange-600'
                                                                      : ''
                                                            }
                                                            title={
                                                                submission.redundancy !== null && submission.redundancy !== undefined
                                                                    ? `${submission.redundancy > 0 ? 'Bonus' : 'Penalty'}: ${submission.redundancy > 0 ? '+' : ''}${submission.redundancy.toFixed(1)}%`
                                                                    : undefined
                                                            }
                                                        >
                                                            {formatRedundancy(submission.redundancy)}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-right font-mono text-sm">
                                                        {formatAllocation(submission.allocation_amount)}
                                                    </td>
                                                    <td className="p-2 text-sm text-muted-foreground">
                                                        {new Date(submission.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!hasSubmissions && (
                    <Card>
                        <CardHeader>
                            <CardTitle>PoC Submissions Archive</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No submissions yet</p>
                                <p className="text-sm mt-2">
                                    <Link href="/submit" className="text-primary hover:underline">
                                        Submit your first contribution
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedSubmission?.title}</DialogTitle>
                        <DialogDescription>
                            Submission Details
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedSubmission && (
                        <div className="space-y-4">
                            {/* Status and Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-semibold mb-2">Status</div>
                                    {getStatusBadge(selectedSubmission)}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold mb-2">Metals</div>
                                    {getMetalBadges(selectedSubmission.metals)}
                                </div>
                                {selectedSubmission.qualified_epoch && (
                                    <div>
                                        <div className="text-sm font-semibold mb-2">Qualified Epoch</div>
                                        {getEpochBadge(selectedSubmission.qualified_epoch)}
                                    </div>
                                )}
                            </div>

                            {/* Scores */}
                            <div>
                                <div className="text-sm font-semibold mb-2">Scores</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground">PoC Score</div>
                                        <div className="font-mono font-semibold">{formatScore(selectedSubmission.pod_score)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Novelty</div>
                                        <div className="font-mono">{formatScore(selectedSubmission.novelty)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Density</div>
                                        <div className="font-mono">{formatScore(selectedSubmission.density)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Coherence</div>
                                        <div className="font-mono">{formatScore(selectedSubmission.coherence)}</div>
                                    </div>
                                    {selectedSubmission.alignment !== null && (
                                        <div>
                                            <div className="text-xs text-muted-foreground">Alignment</div>
                                            <div className="font-mono">{formatScore(selectedSubmission.alignment)}</div>
                                        </div>
                                    )}
                                    {selectedSubmission.redundancy !== null && (
                                        <div>
                                            <div className="text-xs text-muted-foreground">Overlap</div>
                                            <div
                                                className={`font-mono ${
                                                    selectedSubmission.redundancy && selectedSubmission.redundancy > 0
                                                        ? 'text-green-600'
                                                        : selectedSubmission.redundancy && selectedSubmission.redundancy < 0
                                                          ? 'text-orange-600'
                                                          : ''
                                                }`}
                                            >
                                                {formatRedundancy(selectedSubmission.redundancy)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Evaluation Report - Review and Scoring */}
                            {selectedSubmission.metadata && (
                                <div className="pt-4 border-t">
                                    <div className="text-sm font-semibold mb-3">Detailed Evaluation Report</div>
                                    <div className="space-y-4 text-sm">
                                        {/* Evaluation Review Text */}
                                        {selectedSubmission.metadata.redundancy_analysis && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="font-semibold mb-2 text-muted-foreground">Evaluation Review</div>
                                                <div className="text-foreground whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.redundancy_analysis}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Metal Justification */}
                                        {selectedSubmission.metadata.metal_justification && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="font-semibold mb-2 text-muted-foreground">Metal Assignment</div>
                                                <div className="text-foreground whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.metal_justification}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Scoring Breakdown */}
                                        {selectedSubmission.metadata.grok_evaluation_details && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="font-semibold mb-3 text-muted-foreground">Scoring Breakdown</div>
                                                <div className="space-y-2 text-sm">
                                                    {/* Base Scores */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedSubmission.metadata.grok_evaluation_details.base_novelty !== undefined && (
                                                            <div className="p-2 bg-background rounded border">
                                                                <div className="text-xs text-muted-foreground mb-1">Base Novelty</div>
                                                                <div className="font-semibold">{selectedSubmission.metadata.grok_evaluation_details.base_novelty.toLocaleString()} / 2,500</div>
                                                                <div className="text-xs text-muted-foreground mt-1">Final: {selectedSubmission.novelty?.toLocaleString() || 'N/A'} / 2,500</div>
                                                            </div>
                                                        )}
                                                        {selectedSubmission.metadata.grok_evaluation_details.base_density !== undefined && (
                                                            <div className="p-2 bg-background rounded border">
                                                                <div className="text-xs text-muted-foreground mb-1">Base Density</div>
                                                                <div className="font-semibold">{selectedSubmission.metadata.grok_evaluation_details.base_density.toLocaleString()} / 2,500</div>
                                                                <div className="text-xs text-muted-foreground mt-1">Final: {selectedSubmission.density?.toLocaleString() || 'N/A'} / 2,500</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Coherence and Alignment */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-2 bg-background rounded border">
                                                            <div className="text-xs text-muted-foreground mb-1">Coherence</div>
                                                            <div className="font-semibold">{selectedSubmission.coherence?.toLocaleString() || 'N/A'} / 2,500</div>
                                                        </div>
                                                        <div className="p-2 bg-background rounded border">
                                                            <div className="text-xs text-muted-foreground mb-1">Alignment</div>
                                                            <div className="font-semibold">{selectedSubmission.alignment?.toLocaleString() || 'N/A'} / 2,500</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Overlap Effect */}
                                                    {selectedSubmission.redundancy !== null && selectedSubmission.redundancy !== 0 && (
                                                        <div className="pt-2 border-t">
                                                            <div className="text-xs text-muted-foreground mb-2">Overlap Effect</div>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-muted-foreground">Overlap Impact:</span>
                                                                    <span className={`font-semibold ${selectedSubmission.redundancy > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                        {selectedSubmission.redundancy > 0 ? '+' : ''}{selectedSubmission.redundancy.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                {selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent !== undefined && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-muted-foreground">Density Penalty:</span>
                                                                        <span className="font-semibold text-orange-600">
                                                                            {selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Final PoD Score */}
                                                    <div className="pt-2 border-t">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground font-medium">Final PoD Score</span>
                                                            <span className="font-bold text-lg">{selectedSubmission.pod_score?.toLocaleString() || 'N/A'} / 10,000</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Tokenomics Recommendation */}
                                        {selectedSubmission.metadata.tokenomics_recommendation?.allocation_notes && (
                                            <div className="p-3 bg-muted rounded-lg">
                                                <div className="font-semibold mb-2 text-muted-foreground">Allocation Recommendation</div>
                                                <div className="text-foreground whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.tokenomics_recommendation.allocation_notes}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Founder Certificate */}
                                        {selectedSubmission.metadata.founder_certificate && (
                                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <div className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Founder Certificate</div>
                                                <div className="text-yellow-900 dark:text-yellow-100 whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.founder_certificate}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Full Grok API Response - Markdown/Text */}
                                        {(() => {
                                            const raw =
                                                selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response ||
                                                selectedSubmission.metadata.grok_evaluation_details?.full_evaluation?.raw_grok_response ||
                                                ''
                                            if (!raw || raw.trim().length === 0) return null
                                            return (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                                    View Full Response
                                                </summary>
                                                <div className="mt-3 p-4 bg-muted border rounded-lg">
                                                    <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 font-mono text-foreground">
                                                        {raw}
                                                    </pre>
                                                </div>
                                            </details>
                                            )
                                        })()}
                                        
                                        {/* Fallback to JSON if raw response not available */}
                                        {(() => {
                                            const raw =
                                                selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response ||
                                                selectedSubmission.metadata.grok_evaluation_details?.full_evaluation?.raw_grok_response ||
                                                ''
                                            if (raw && raw.trim().length > 0) return null
                                            if (!selectedSubmission.metadata.grok_evaluation_details?.full_evaluation) return null
                                            return (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                                    View Parsed Evaluation (JSON)
                                                </summary>
                                                <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-xs overflow-auto max-h-96">
                                                    {JSON.stringify(selectedSubmission.metadata.grok_evaluation_details.full_evaluation, null, 2)}
                                                </pre>
                                            </details>
                                            )
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Contributor</div>
                                    <div>{selectedSubmission.contributor}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Category</div>
                                    <div className="capitalize">{selectedSubmission.category || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Submitted</div>
                                    <div>{new Date(selectedSubmission.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Hash</div>
                                    <div className="font-mono text-xs break-all">{selectedSubmission.submission_hash}</div>
                                </div>
                            </div>

                            {/* Content Preview */}
                            {selectedSubmission.text_content && (
                                <div>
                                    <div className="text-sm font-semibold mb-2">Content Preview</div>
                                    <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto p-3 bg-muted rounded">
                                        {selectedSubmission.text_content.substring(0, 500)}
                                        {selectedSubmission.text_content.length > 500 && '...'}
                                    </div>
                                </div>
                            )}

                            {/* Blockchain Registration Certificate */}
                            {selectedSubmission.registered && (
                                <div className="pt-4 border-t">
                                    <div className="text-sm font-semibold mb-3">Registration & Allocation</div>
                                    <div className="space-y-2 text-sm">
                                        {selectedSubmission.allocation_amount !== null && selectedSubmission.allocation_amount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">SYNTH Token Allocation:</span>
                                                <span className="font-mono font-semibold text-foreground">
                                                    {formatAllocation(selectedSubmission.allocation_amount)}
                                                </span>
                                            </div>
                                        )}
                                        {selectedSubmission.registration_tx_hash && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Transaction Hash:</span>
                                                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                                    {selectedSubmission.registration_tx_hash}
                                                </code>
                                            </div>
                                        )}
                                        {selectedSubmission.registration_date && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Registered:</span>
                                                <span>{new Date(selectedSubmission.registration_date).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedSubmission.stripe_payment_id && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Payment ID:</span>
                                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                                    {selectedSubmission.stripe_payment_id}
                                                </code>
                                            </div>
                                        )}
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                ✓ On‑chain anchoring recorded
                                            </div>
                                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                                This record indicates an optional on‑chain anchoring event was completed and a transaction hash was stored for verification.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedSubmission.contributor === userEmail && (
                                <div className="pt-4 border-t">
                                    {selectedSubmission.qualified && !selectedSubmission.registered && (
                                        <Button 
                                            onClick={() => handleRegister(selectedSubmission.submission_hash)}
                                            disabled={registering === selectedSubmission.submission_hash}
                                            size="lg"
                                            variant="default"
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-primary/20"
                                        >
                                            {registering === selectedSubmission.submission_hash ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    Processing Registration...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-5 w-5 mr-2" />
                                                    ⚡ Anchor PoC on‑chain
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {(selectedSubmission.registered || selectedSubmission.allocated) && (
                                        <div className="text-sm text-muted-foreground">
                                            PoC is registered.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* On-Chain PoCs Dialog */}
            <Dialog open={onChainDialogOpen} onOpenChange={setOnChainDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            PoCs Registered on Base Mainnet
                        </DialogTitle>
                        <DialogDescription>
                            View and sync PoC registrations from Base Mainnet blockchain
                        </DialogDescription>
                    </DialogHeader>
                    
                    {onChainLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Fetching on-chain PoCs...</span>
                        </div>
                    )}
                    
                    {onChainError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-semibold">Error</span>
                            </div>
                            <p className="text-red-700 mt-2">{onChainError}</p>
                        </div>
                    )}
                    
                    {onChainData && !onChainLoading && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Sync Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <div className="text-blue-600 font-medium">On-Chain</div>
                                        <div className="text-2xl font-bold text-blue-900">{onChainData.summary.onChainCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-blue-600 font-medium">In Database</div>
                                        <div className="text-2xl font-bold text-blue-900">{onChainData.summary.databaseCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-green-600 font-medium">Synced</div>
                                        <div className="text-2xl font-bold text-green-900">{onChainData.summary.syncedCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-amber-600 font-medium">Missing from DB</div>
                                        <div className="text-2xl font-bold text-amber-900">{onChainData.summary.missingFromDb}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* On-Chain Registrations */}
                            <div>
                                <h3 className="font-semibold mb-3">On-Chain PoC Registrations</h3>
                                {onChainData.onChainRegistrations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No PoCs found on Base Mainnet
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {onChainData.onChainRegistrations.map((reg: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                On-Chain
                                                            </Badge>
                                                            <Badge variant="outline">{reg.metal}</Badge>
                                                        </div>
                                                        <div className="text-sm space-y-1">
                                                            <div><span className="font-medium">Hash:</span> <code className="text-xs bg-gray-100 px-1 rounded">{reg.submissionHash.substring(0, 16)}...</code></div>
                                                            <div><span className="font-medium">Contributor:</span> {reg.contributorEmail}</div>
                                                            <div><span className="font-medium">Block:</span> {reg.blockNumber.toLocaleString()}</div>
                                                            <div><span className="font-medium">Timestamp:</span> {new Date(reg.timestamp).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <a
                                                            href={reg.baseScanUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            View on BaseScan
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Sync Status */}
                            {onChainData.syncStatus.missingFromDb.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-amber-900 mb-2">⚠️ Missing from Database</h3>
                                    <p className="text-sm text-amber-800 mb-2">
                                        {onChainData.syncStatus.missingFromDb.length} PoC(s) found on-chain but not in database
                                    </p>
                                    <div className="text-xs text-amber-700 space-y-1">
                                        {onChainData.syncStatus.missingFromDb.slice(0, 5).map((m: any, i: number) => (
                                            <div key={i} className="font-mono">{m.submissionHash.substring(0, 32)}...</div>
                                        ))}
                                        {onChainData.syncStatus.missingFromDb.length > 5 && (
                                            <div>... and {onChainData.syncStatus.missingFromDb.length - 5} more</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {onChainData.syncStatus.missingFromChain.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-900 mb-2">⚠️ Missing from Blockchain</h3>
                                    <p className="text-sm text-red-800 mb-2">
                                        {onChainData.syncStatus.missingFromChain.length} PoC(s) marked as registered in database but not found on-chain
                                    </p>
                                    <div className="text-xs text-red-700 space-y-1">
                                        {onChainData.syncStatus.missingFromChain.slice(0, 5).map((m: any, i: number) => (
                                            <div key={i} className="font-mono">{m.submissionHash.substring(0, 32)}...</div>
                                        ))}
                                        {onChainData.syncStatus.missingFromChain.length > 5 && (
                                            <div>... and {onChainData.syncStatus.missingFromChain.length - 5} more</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
