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
import { Loader2, RefreshCw, FileText, CheckCircle2, XCircle, Clock, CreditCard, ExternalLink } from 'lucide-react'
import Link from 'next/link'

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
    qualified: boolean | null
    qualified_epoch: string | null
    registered: boolean | null
    registration_date: string | null
    registration_tx_hash: string | null
    stripe_payment_id: string | null
    allocated: boolean | null
    allocation_amount: number | null // Total SYNTH tokens allocated
    created_at: string
    updated_at: string
    text_content?: string
    metadata?: any
    grok_evaluation_details?: {
        base_novelty?: number
        base_density?: number
        redundancy_penalty_percent?: number
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
        fetchSubmissions()
        
        // Check if we're returning from a successful registration
        const params = new URLSearchParams(window.location.search)
        const registrationStatus = params.get('registration')
        const registrationHash = params.get('hash')
        
        if (registrationStatus === 'success' && registrationHash) {
            // Poll for registration status update (webhook may take a few seconds)
            let pollCount = 0
            const maxPolls = 10 // Poll for up to 10 seconds (1 second intervals)
            
            const pollForRegistration = setInterval(async () => {
                pollCount++
                
                try {
                    // Fetch fresh submission data
                    await fetchSubmissions()
                    
                    // Also check registration status endpoint
                    const statusResponse = await fetch(`/api/poc/${registrationHash}/registration-status`)
                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json()
                        if (statusData.registered) {
                            // Registration confirmed, stop polling and refresh
                            clearInterval(pollForRegistration)
                            await fetchSubmissions()
                            // Clean up URL params
                            window.history.replaceState({}, '', window.location.pathname)
                            return
                        }
                    }
                } catch (err) {
                    console.error('Error polling for registration status:', err)
                }
                
                // Stop polling after max attempts
                if (pollCount >= maxPolls) {
                    clearInterval(pollForRegistration)
                    // Final refresh attempt
                    fetchSubmissions()
                    // Clean up URL params even if registration not confirmed yet
                    window.history.replaceState({}, '', window.location.pathname)
                }
            }, 1000) // Poll every 1 second
            
            // Also do an immediate refresh after 2 seconds
            setTimeout(() => {
                fetchSubmissions()
            }, 2000)
        }
    }, [])

    async function fetchSubmissions() {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/archive/contributions')
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`)
            }
            const data = await response.json()
            setAllSubmissions(data.contributions || [])
        } catch (err) {
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
                throw new Error(`${errorMessage}${errorType}${errorDetails}`)
            }
            
            // Validate checkout_url is present and valid
            if (!data.checkout_url) {
                console.error('Response data:', data)
                throw new Error(data.message || data.error || 'No checkout URL received from server. Please check server configuration.')
            }
            
            if (typeof data.checkout_url !== 'string') {
                console.error('Invalid checkout_url type:', typeof data.checkout_url, data)
                throw new Error('Invalid checkout URL format received from server')
            }
            
            if (!data.checkout_url.startsWith('http://') && !data.checkout_url.startsWith('https://')) {
                console.error('Invalid checkout_url format:', data.checkout_url)
                throw new Error(`Invalid checkout URL format: ${data.checkout_url.substring(0, 50)}...`)
            }
            
            // Redirect to Stripe checkout
            window.location.href = data.checkout_url
        } catch (err) {
            console.error('Registration error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to register PoC'
            alert(`Registration Error: ${errorMessage}`)
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
        if (submission.allocated) {
            return <Badge variant="default" className="bg-green-500">Allocated</Badge>
        }
        if (submission.registered) {
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
        if (submission.status === 'evaluating') {
            return <Badge variant="secondary">Evaluating</Badge>
        }
        if (submission.status === 'unqualified') {
            return <Badge variant="outline" className="bg-gray-500 text-white">Unqualified</Badge>
        }
        // Fallback for any other status
        return <Badge variant="outline">{submission.status}</Badge>
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
                                    <th className="text-right p-2 font-semibold">Redundancy</th>
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
                                            <span className={submission.redundancy !== null && submission.redundancy > 50 ? 'text-orange-600' : submission.redundancy !== null && submission.redundancy > 25 ? 'text-yellow-600' : ''}>
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
                            <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
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
                                                <th className="text-right p-2 font-semibold">Redundancy</th>
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
                                                        {formatRedundancy(submission.redundancy)}
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
                                            <div className="text-xs text-muted-foreground">Redundancy</div>
                                            <div className={`font-mono ${selectedSubmission.redundancy > 50 ? 'text-orange-600' : selectedSubmission.redundancy > 25 ? 'text-yellow-600' : ''}`}>
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
                                                    
                                                    {/* Penalties Applied */}
                                                    {(selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent !== undefined || 
                                                      selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent !== undefined) && (
                                                        <div className="pt-2 border-t">
                                                            <div className="text-xs text-muted-foreground mb-2">Penalties Applied</div>
                                                            <div className="space-y-1">
                                                                {selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent !== undefined && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-muted-foreground">Redundancy Penalty:</span>
                                                                        <span className="font-semibold text-orange-600">
                                                                            {selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
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
                                        {selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response && 
                                         selectedSubmission.metadata.grok_evaluation_details.raw_grok_response.trim().length > 0 && (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                                    View Full Response
                                                </summary>
                                                <div className="mt-3 p-4 bg-muted border rounded-lg">
                                                    <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 font-mono text-foreground">
                                                        {selectedSubmission.metadata.grok_evaluation_details.raw_grok_response}
                                                    </pre>
                                                </div>
                                            </details>
                                        )}
                                        
                                        {/* Fallback to JSON if raw response not available */}
                                        {!selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response && 
                                         selectedSubmission.metadata.grok_evaluation_details?.full_evaluation && (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                                    View Full Response (JSON)
                                                </summary>
                                                <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-xs overflow-auto max-h-96">
                                                    {JSON.stringify(selectedSubmission.metadata.grok_evaluation_details.full_evaluation, null, 2)}
                                                </pre>
                                            </details>
                                        )}
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
                                                ✓ Registered on Hard Hat L1 Blockchain
                                            </div>
                                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                                This PoC has been registered in the Syntheverse SYNTH90T Motherlode Blockmine on the Hard Hat blockchain.
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
                                            className="w-full"
                                        >
                                            {registering === selectedSubmission.submission_hash ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Register PoC - $200
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {selectedSubmission.registered && !selectedSubmission.allocated && (
                                        <div className="text-sm text-muted-foreground">
                                            PoC is registered. Allocation can be processed.
                                        </div>
                                    )}
                                    {selectedSubmission.allocated && (
                                        <div className="text-sm text-green-600">
                                            <CheckCircle2 className="h-4 w-4 inline mr-2" />
                                            Tokens allocated
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
