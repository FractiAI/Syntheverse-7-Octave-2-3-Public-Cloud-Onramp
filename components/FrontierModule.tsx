/**
 * Frontier Module Component
 * PoC Submissions Archive with Avionics Panel Styling
 * Holographic Hydrogen Fractal Frontier Noir
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
import { Loader2, RefreshCw, CreditCard, ExternalLink, FileText } from 'lucide-react'
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
    redundancy: number | null
    qualified: boolean | null
    qualified_epoch: string | null
    registered: boolean | null
    registration_date: string | null
    registration_tx_hash: string | null
    stripe_payment_id: string | null
    allocated: boolean | null
    allocation_amount: number | null
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
        raw_grok_response?: string
    }
}

interface FrontierModuleProps {
    userEmail: string
}

type ViewMode = 'my' | 'qualified' | 'all'

export function FrontierModule({ userEmail }: FrontierModuleProps) {
    const [allSubmissions, setAllSubmissions] = useState<PoCSubmission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<PoCSubmission | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [registering, setRegistering] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('my')
    const [showFullReport, setShowFullReport] = useState(false)

    const mySubmissions = allSubmissions.filter(s => s.contributor === userEmail)
    const qualifiedSubmissions = allSubmissions.filter(s => s.qualified === true)
    
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
                await fetchSubmissions(false)
            } catch (err) {
                console.error('Error loading PoC archive:', err)
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load submissions')
                    setLoading(false)
                }
            }
        }
        
        loadData()
        
        const params = new URLSearchParams(window.location.search)
        const registrationStatus = params.get('registration')
        const registrationHash = params.get('hash')
        
        if (registrationStatus === 'success' && registrationHash) {
            // Immediately remove URL params so other widgets don't start their own polling loops.
            // Keep the hash locally for this effect.
            window.history.replaceState({}, '', window.location.pathname)

            let pollCount = 0
            const maxPolls = 15 // 15 * 2s = 30s max
            const pollEveryMs = 2000
            let inFlight = false
            let pollTimer: ReturnType<typeof setTimeout> | null = null

            const pollForRegistration = async (): Promise<boolean> => {
                if (inFlight) return false
                inFlight = true
                pollCount++

                try {
                    const statusResponse = await fetch(`/api/poc/${registrationHash}/registration-status?t=${Date.now()}`)
                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json()

                        // Once registered, refresh submissions (silently) and stop polling.
                        if (statusData.registered && pollCount >= 2) {
                            await fetchSubmissions(true)
                            return true
                        }
                    }

                    // Silent refresh occasionally to pick up allocation changes without UI flicker.
                    if (pollCount % 3 === 0) {
                        await fetchSubmissions(true)
                    }
                } catch (err) {
                    console.error(`[Poll ${pollCount}] Error polling:`, err)
                } finally {
                    inFlight = false
                }

                if (pollCount >= maxPolls) {
                    await fetchSubmissions(true)
                    return true
                }

                return false
            }

            const scheduleNext = async () => {
                const shouldStop = await pollForRegistration()
                if (shouldStop) return
                pollTimer = setTimeout(scheduleNext, pollEveryMs)
            }

            // Kick off immediately (no overlap due to inFlight guard + chained setTimeout).
            scheduleNext()
            
            return () => {
                isMounted = false
                if (pollTimer) clearTimeout(pollTimer)
            }
        } else {
            return () => {
                isMounted = false
            }
        }
    }, [userEmail])

    async function fetchSubmissions(silent = false) {
        if (!silent) {
            setLoading(true)
        }
        setError(null)
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s safety timeout
            const response = await fetch(`/api/archive/contributions?limit=200&t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId))
            
            if (!response.ok) {
                const errorText = await response.text()
                if (response.status === 401) {
                    throw new Error('Session expired. Please refresh and log in again.')
                }
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            
            if (!data || !Array.isArray(data.contributions)) {
                throw new Error('Invalid response format from server')
            }
            
            setAllSubmissions(data.contributions || [])
        } catch (err) {
            console.error('Error fetching submissions:', err)
            const message =
                err instanceof Error && err.name === 'AbortError'
                    ? 'Submissions request timed out. Please try again.'
                    : err instanceof Error
                      ? err.message
                      : 'Failed to load submissions'
            setError(message)
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    async function handleRegister(hash: string) {
        setRegistering(hash)
        try {
            const response = await fetch(`/api/poc/${hash}/register`, {
                method: 'POST'
            })
            
            let data: any
            try {
                const text = await response.text()
                if (!text) {
                    throw new Error(`Empty response from server (status: ${response.status})`)
                }
                data = JSON.parse(text)
            } catch (parseError) {
                throw new Error(`Invalid response from server (status: ${response.status})`)
            }
            
            if (!response.ok) {
                const errorMessage = data.message || data.error || `Failed to initiate registration (${response.status})`
                throw new Error(errorMessage)
            }
            
            if (!data.checkout_url || typeof data.checkout_url !== 'string') {
                throw new Error('Invalid checkout URL received from server')
            }
            
            if (!data.checkout_url.startsWith('http://') && !data.checkout_url.startsWith('https://')) {
                throw new Error(`Invalid checkout URL format`)
            }
            
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
        setShowFullReport(false) // Reset full report view when opening a new submission
        try {
            const response = await fetch(`/api/archive/contributions/${submission.submission_hash}`)
            if (response.ok) {
                const details = await response.json()
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
        if (score === null) return '—'
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
            return <span className="cockpit-badge cockpit-badge-amber">Allocated</span>
        }
        if (submission.registered) {
            const primaryMetal = submission.metals && submission.metals.length > 0 
                ? submission.metals[0].toLowerCase() 
                : 'copper'
            const metalColors: Record<string, string> = {
                gold: 'var(--hydrogen-amber)',
                silver: 'rgba(214, 214, 214, 0.8)',
                copper: 'rgba(205, 127, 50, 0.8)',
                hybrid: 'rgba(100, 149, 237, 0.8)'
            }
            const color = metalColors[primaryMetal] || 'var(--hydrogen-amber)'
            return <span className="cockpit-badge" style={{ borderColor: color, color }}>Registered</span>
        }
        if (submission.qualified) {
            return <span className="cockpit-badge" style={{ borderColor: 'rgba(147, 51, 234, 0.8)', color: 'rgba(147, 51, 234, 0.8)' }}>Qualified</span>
        }
        if (submission.status === 'evaluating') {
            return <span className="cockpit-badge">Evaluating</span>
        }
        return <span className="cockpit-badge">Pending</span>
    }

    if (loading) {
        return (
            <div className="cockpit-module cockpit-panel p-8">
                <div className="flex items-center justify-center min-h-[200px] gap-4">
                    <div className="fractal-spiral"></div>
                    <div className="cockpit-text">Loading submission data...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="cockpit-module cockpit-panel p-8">
                <div className="text-center">
                    <div className="cockpit-label text-red-400 mb-4">Module Error</div>
                    <div className="cockpit-text mb-4">{error}</div>
                    <button onClick={() => fetchSubmissions(false)} className="cockpit-lever">
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    const filteredSubmissions = getFilteredSubmissions()
    const showContributorColumn = viewMode === 'all' || viewMode === 'qualified'

    return (
        <>
            <div className="cockpit-module cockpit-panel">
                <div className="p-6">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-6 border-b border-[var(--keyline-primary)] pb-4">
                        <div>
                            <div className="cockpit-label">FRONTIER MODULE</div>
                            <div className="cockpit-title text-2xl mt-1">PoC SUBMISSIONS ARCHIVE</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => fetchSubmissions(false)}
                                className="cockpit-lever text-sm py-2 px-4"
                            >
                                <RefreshCw className="inline w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* View Mode Selector */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setViewMode('my')}
                            className={`cockpit-lever text-sm py-2 px-4 ${viewMode === 'my' ? 'border-[var(--hydrogen-amber)]' : ''}`}
                        >
                            My Submissions
                        </button>
                        <button
                            onClick={() => setViewMode('qualified')}
                            className={`cockpit-lever text-sm py-2 px-4 ${viewMode === 'qualified' ? 'border-[var(--hydrogen-amber)]' : ''}`}
                        >
                            Qualified
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`cockpit-lever text-sm py-2 px-4 ${viewMode === 'all' ? 'border-[var(--hydrogen-amber)]' : ''}`}
                        >
                            All Submissions
                        </button>
                    </div>

                    {/* Table */}
                    {filteredSubmissions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="cockpit-text mb-4">No {getViewTitle().toLowerCase()} found</div>
                            <Link href="/submit" className="cockpit-lever inline-block">
                                Submit First Contribution
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="cockpit-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        {showContributorColumn && <th>Contributor</th>}
                                        <th>Status</th>
                                        <th>Epoch</th>
                                        <th>Metals</th>
                                        <th className="text-right">PoC Score</th>
                                        <th className="text-right">Allocation</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmissions.map((submission) => (
                                        <tr 
                                            key={submission.submission_hash} 
                                            onClick={() => handleRowClick(submission)}
                                            className="cursor-pointer"
                                        >
                                            <td>
                                                <div className="font-medium">{submission.title}</div>
                                                {submission.category && (
                                                    <div className="cockpit-text text-xs mt-1 capitalize">
                                                        {submission.category}
                                                    </div>
                                                )}
                                            </td>
                                            {showContributorColumn && (
                                                <td className="cockpit-text text-sm">
                                                    {submission.contributor}
                                                </td>
                                            )}
                                            <td>{getStatusBadge(submission)}</td>
                                            <td className="uppercase text-sm">
                                                {submission.qualified_epoch || '—'}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {submission.metals?.slice(0, 3).map((metal, idx) => (
                                                        <span key={idx} className="cockpit-badge text-xs">
                                                            {metal}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-right font-mono cockpit-number">
                                                {formatScore(submission.pod_score)}
                                            </td>
                                            <td className="text-right font-mono cockpit-number">
                                                {formatAllocation(submission.allocation_amount)}
                                            </td>
                                            <td className="cockpit-text text-sm">
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Dialog - Maintain existing functionality */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--cockpit-obsidian)] border-[var(--keyline-primary)]">
                    <DialogHeader>
                        <DialogTitle className="cockpit-title text-xl">{selectedSubmission?.title}</DialogTitle>
                        <DialogDescription className="cockpit-text">
                            Submission Details
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedSubmission && (
                        <div className="space-y-4 mt-4">
                            {/* Status and Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="cockpit-label mb-2">Status</div>
                                    {getStatusBadge(selectedSubmission)}
                                </div>
                                <div>
                                    <div className="cockpit-label mb-2">Metals</div>
                                    <div className="flex gap-2">
                                        {selectedSubmission.metals?.map((metal, idx) => (
                                            <span key={idx} className="cockpit-badge">{metal}</span>
                                        ))}
                                    </div>
                                </div>
                                {selectedSubmission.qualified_epoch && (
                                    <div>
                                        <div className="cockpit-label mb-2">Qualified Epoch</div>
                                        <div className="uppercase text-sm">{selectedSubmission.qualified_epoch}</div>
                                    </div>
                                )}
                            </div>

                            {/* Actions (moved to top for visibility) */}
                            {selectedSubmission.contributor === userEmail && (
                                <div className="pt-4 border-t border-[var(--keyline-primary)]">
                                    {selectedSubmission.qualified && !selectedSubmission.registered && (
                                        <button 
                                            onClick={() => handleRegister(selectedSubmission.submission_hash)}
                                            disabled={registering === selectedSubmission.submission_hash}
                                            className="cockpit-lever w-full"
                                        >
                                            {registering === selectedSubmission.submission_hash ? (
                                                <>
                                                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="inline h-4 w-4 mr-2" />
                                                    Register PoC - $200
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {selectedSubmission.registered && !selectedSubmission.allocated && (
                                        <div className="cockpit-text text-sm">
                                            PoC is registered. Allocation can be processed.
                                        </div>
                                    )}
                                    {selectedSubmission.allocated && (
                                        <div className="cockpit-text text-sm text-green-400">
                                            Tokens allocated
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Scores */}
                            <div>
                                <div className="cockpit-label mb-3">Evaluation Scores</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">PoC Score</div>
                                        <div className="cockpit-number cockpit-number-medium">{formatScore(selectedSubmission.pod_score)}</div>
                                        <div className="cockpit-text text-xs mt-1">/ 10,000</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Novelty</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.novelty)}</div>
                                        <div className="cockpit-text text-xs mt-1">/ 2,500</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Density</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.density)}</div>
                                        <div className="cockpit-text text-xs mt-1">/ 2,500</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Coherence</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.coherence)}</div>
                                        <div className="cockpit-text text-xs mt-1">/ 2,500</div>
                                    </div>
                                    {selectedSubmission.alignment !== null && (
                                        <div>
                                            <div className="cockpit-text text-xs mb-1">Alignment</div>
                                            <div className="cockpit-number">{formatScore(selectedSubmission.alignment)}</div>
                                            <div className="cockpit-text text-xs mt-1">/ 2,500</div>
                                        </div>
                                    )}
                                    {selectedSubmission.redundancy !== null && (
                                        <div>
                                            <div className="cockpit-text text-xs mb-1">Redundancy</div>
                                            <div className={`cockpit-number ${selectedSubmission.redundancy > 50 ? 'text-orange-400' : selectedSubmission.redundancy > 25 ? 'text-yellow-400' : ''}`}>
                                                {formatRedundancy(selectedSubmission.redundancy)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Evaluation Report */}
                            {selectedSubmission.metadata && (
                                <div className="pt-4 border-t border-[var(--keyline-primary)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="cockpit-label">Detailed Evaluation Report</div>
                                        {(selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response || 
                                          selectedSubmission.metadata.grok_evaluation_details?.full_evaluation) && (
                                            <button
                                                onClick={() => setShowFullReport(!showFullReport)}
                                                className="cockpit-lever text-sm py-2 px-4"
                                            >
                                                <FileText className="inline h-4 w-4 mr-2" />
                                                {showFullReport ? 'Hide Full Report' : 'View Full Report'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4 text-sm">
                                        {/* Evaluation Review Text */}
                                        {selectedSubmission.metadata.redundancy_analysis && (
                                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                                <div className="cockpit-label mb-2">Evaluation Review</div>
                                                <div className="cockpit-text whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.redundancy_analysis}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Metal Justification */}
                                        {selectedSubmission.metadata.metal_justification && (
                                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                                <div className="cockpit-label mb-2">Metal Assignment</div>
                                                <div className="cockpit-text whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.metal_justification}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Scoring Breakdown */}
                                        {selectedSubmission.metadata.grok_evaluation_details && (
                                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                                <div className="cockpit-label mb-3">Scoring Breakdown</div>
                                                <div className="space-y-3 text-sm">
                                                    {/* Base Scores */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedSubmission.metadata.grok_evaluation_details.base_novelty !== undefined && (
                                                            <div className="p-3 bg-[var(--cockpit-obsidian)] rounded border border-[var(--keyline-primary)]">
                                                                <div className="cockpit-text text-xs mb-1">Base Novelty</div>
                                                                <div className="cockpit-number">{selectedSubmission.metadata.grok_evaluation_details.base_novelty.toLocaleString()} / 2,500</div>
                                                                <div className="cockpit-text text-xs mt-1">Final: {selectedSubmission.novelty?.toLocaleString() || 'N/A'} / 2,500</div>
                                                            </div>
                                                        )}
                                                        {selectedSubmission.metadata.grok_evaluation_details.base_density !== undefined && (
                                                            <div className="p-3 bg-[var(--cockpit-obsidian)] rounded border border-[var(--keyline-primary)]">
                                                                <div className="cockpit-text text-xs mb-1">Base Density</div>
                                                                <div className="cockpit-number">{selectedSubmission.metadata.grok_evaluation_details.base_density.toLocaleString()} / 2,500</div>
                                                                <div className="cockpit-text text-xs mt-1">Final: {selectedSubmission.density?.toLocaleString() || 'N/A'} / 2,500</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Coherence and Alignment */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 bg-[var(--cockpit-obsidian)] rounded border border-[var(--keyline-primary)]">
                                                            <div className="cockpit-text text-xs mb-1">Coherence</div>
                                                            <div className="cockpit-number">{selectedSubmission.coherence?.toLocaleString() || 'N/A'} / 2,500</div>
                                                        </div>
                                                        <div className="p-3 bg-[var(--cockpit-obsidian)] rounded border border-[var(--keyline-primary)]">
                                                            <div className="cockpit-text text-xs mb-1">Alignment</div>
                                                            <div className="cockpit-number">{selectedSubmission.alignment?.toLocaleString() || 'N/A'} / 2,500</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Penalties Applied */}
                                                    {(selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent !== undefined || 
                                                      selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent !== undefined) && (
                                                        <div className="pt-3 border-t border-[var(--keyline-primary)]">
                                                            <div className="cockpit-text text-xs mb-2">Penalties Applied</div>
                                                            <div className="space-y-1">
                                                                {selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent !== undefined && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="cockpit-text">Redundancy Penalty:</span>
                                                                        <span className="cockpit-number text-orange-400">
                                                                            {selectedSubmission.metadata.grok_evaluation_details.redundancy_penalty_percent.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent !== undefined && (
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="cockpit-text">Density Penalty:</span>
                                                                        <span className="cockpit-number text-orange-400">
                                                                            {selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Final PoD Score */}
                                                    <div className="pt-3 border-t border-[var(--keyline-primary)]">
                                                        <div className="flex justify-between items-center">
                                                            <span className="cockpit-text font-medium">Final PoD Score</span>
                                                            <span className="cockpit-number cockpit-number-medium">{selectedSubmission.pod_score?.toLocaleString() || 'N/A'} / 10,000</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Tokenomics Recommendation */}
                                        {selectedSubmission.metadata.tokenomics_recommendation?.allocation_notes && (
                                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                                <div className="cockpit-label mb-2">Allocation Recommendation</div>
                                                <div className="cockpit-text whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.tokenomics_recommendation.allocation_notes}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Founder Certificate */}
                                        {selectedSubmission.metadata.founder_certificate && (
                                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,215,0,0.1)] rounded">
                                                <div className="cockpit-label mb-2 text-[var(--hydrogen-amber)]">Founder Certificate</div>
                                                <div className="cockpit-text whitespace-pre-wrap">
                                                    {selectedSubmission.metadata.founder_certificate}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Full Grok API Response - Toggleable */}
                                        {showFullReport && (
                                            <div className="mt-3 pt-3 border-t border-[var(--keyline-primary)]">
                                                {selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response && 
                                                 selectedSubmission.metadata.grok_evaluation_details.raw_grok_response.trim().length > 0 ? (
                                                    <div>
                                                        <div className="cockpit-label mb-2">Full Grok API Response</div>
                                                        <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] rounded">
                                                            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96 font-mono cockpit-text">
                                                                {selectedSubmission.metadata.grok_evaluation_details.raw_grok_response}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ) : selectedSubmission.metadata.grok_evaluation_details?.full_evaluation ? (
                                                    <div>
                                                        <div className="cockpit-label mb-2">Full Grok API Response (JSON)</div>
                                                        <pre className="p-3 bg-[var(--cockpit-obsidian)] border border-[var(--keyline-primary)] rounded text-xs overflow-auto max-h-96 font-mono cockpit-text">
                                                            {JSON.stringify(selectedSubmission.metadata.grok_evaluation_details.full_evaluation, null, 2)}
                                                        </pre>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm border-t border-[var(--keyline-primary)] pt-4">
                                <div>
                                    <div className="cockpit-label mb-1">Contributor</div>
                                    <div className="cockpit-text">{selectedSubmission.contributor}</div>
                                </div>
                                <div>
                                    <div className="cockpit-label mb-1">Category</div>
                                    <div className="cockpit-text capitalize">{selectedSubmission.category || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="cockpit-label mb-1">Submitted</div>
                                    <div className="cockpit-text">{new Date(selectedSubmission.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="cockpit-label mb-1">Hash</div>
                                    <div className="cockpit-text text-xs font-mono break-all">{selectedSubmission.submission_hash}</div>
                                </div>
                            </div>

                            {/* Content Preview */}
                            {selectedSubmission.text_content && (
                                <div className="border-t border-[var(--keyline-primary)] pt-4">
                                    <div className="cockpit-label mb-2">Content Preview</div>
                                    <div className="cockpit-text text-sm max-h-40 overflow-y-auto p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                        {selectedSubmission.text_content.substring(0, 500)}
                                        {selectedSubmission.text_content.length > 500 && '...'}
                                    </div>
                                </div>
                            )}

                            {/* Blockchain Registration Certificate */}
                            {selectedSubmission.registered && (
                                <div className="pt-4 border-t border-[var(--keyline-primary)]">
                                    <div className="cockpit-label mb-3">Registration & Allocation</div>
                                    <div className="space-y-2 text-sm p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                                        {selectedSubmission.allocation_amount !== null && selectedSubmission.allocation_amount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="cockpit-text">SYNTH Token Allocation:</span>
                                                <span className="cockpit-number">
                                                    {formatAllocation(selectedSubmission.allocation_amount)}
                                                </span>
                                            </div>
                                        )}
                                        {selectedSubmission.registration_tx_hash && (
                                            <div>
                                                <div className="cockpit-text mb-1">Transaction Hash:</div>
                                                <div className="cockpit-text text-xs font-mono break-all">
                                                    {selectedSubmission.registration_tx_hash}
                                                </div>
                                            </div>
                                        )}
                                        {selectedSubmission.registration_date && (
                                            <div className="flex items-center justify-between">
                                                <span className="cockpit-text">Registered:</span>
                                                <span className="cockpit-text">{new Date(selectedSubmission.registration_date).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {selectedSubmission.stripe_payment_id && (
                                            <div className="flex items-center justify-between">
                                                <span className="cockpit-text">Payment ID:</span>
                                                <span className="cockpit-text text-xs font-mono">
                                                    {selectedSubmission.stripe_payment_id}
                                                </span>
                                            </div>
                                        )}
                                        <div className="mt-3 p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] rounded">
                                            <div className="text-xs cockpit-label mb-1">
                                                ✓ Registered on Hard Hat L1 Blockchain
                                            </div>
                                            <div className="text-xs cockpit-text">
                                                This PoC has been registered in the Syntheverse SYNTH90T Motherlode Blockmine on the Hard Hat blockchain.
                                            </div>
                                        </div>
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

