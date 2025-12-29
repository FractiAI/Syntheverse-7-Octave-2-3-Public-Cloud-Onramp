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
import { Loader2, RefreshCw, CreditCard, ExternalLink } from 'lucide-react'
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
        
        const params = new URLSearchParams(window.location.search)
        const registrationStatus = params.get('registration')
        const registrationHash = params.get('hash')
        
        if (registrationStatus === 'success' && registrationHash) {
            let pollCount = 0
            const maxPolls = 20
            
            const pollForRegistration = async () => {
                pollCount++
                
                try {
                    const statusResponse = await fetch(`/api/poc/${registrationHash}/registration-status?t=${Date.now()}`)
                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json()
                        
                        if (statusData.registered && pollCount >= 3) {
                            await fetchSubmissions()
                            window.history.replaceState({}, '', window.location.pathname)
                            return true
                        }
                    }
                    
                    if (pollCount % 2 === 0) {
                        await fetchSubmissions()
                    }
                } catch (err) {
                    console.error(`[Poll ${pollCount}] Error polling:`, err)
                }
                
                if (pollCount >= maxPolls) {
                    await fetchSubmissions()
                    window.history.replaceState({}, '', window.location.pathname)
                    return true
                }
                
                return false
            }
            
            pollForRegistration()
            const pollInterval = setInterval(async () => {
                const shouldStop = await pollForRegistration()
                if (shouldStop && pollInterval) {
                    clearInterval(pollInterval)
                }
            }, 1000)
            
            return () => {
                isMounted = false
                if (pollInterval) {
                    clearInterval(pollInterval)
                }
            }
        } else {
            return () => {
                isMounted = false
            }
        }
    }, [userEmail])

    async function fetchSubmissions() {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/archive/contributions?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            
            if (!data || !Array.isArray(data.contributions)) {
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
                    <button onClick={fetchSubmissions} className="cockpit-lever">
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
                                onClick={fetchSubmissions}
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
                            </div>

                            {/* Scores */}
                            <div>
                                <div className="cockpit-label mb-3">Evaluation Scores</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">PoC Score</div>
                                        <div className="cockpit-number cockpit-number-medium">{formatScore(selectedSubmission.pod_score)}</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Novelty</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.novelty)}</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Density</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.density)}</div>
                                    </div>
                                    <div>
                                        <div className="cockpit-text text-xs mb-1">Coherence</div>
                                        <div className="cockpit-number">{formatScore(selectedSubmission.coherence)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Status */}
                            {selectedSubmission.registered && (
                                <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                    <div className="cockpit-label mb-2">Blockchain Registration</div>
                                    {selectedSubmission.allocation_amount && (
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="cockpit-text">SYNTH Allocation:</span>
                                            <span className="cockpit-number">{formatAllocation(selectedSubmission.allocation_amount)}</span>
                                        </div>
                                    )}
                                    {selectedSubmission.registration_tx_hash && (
                                        <div className="cockpit-text text-xs font-mono break-all mt-2">
                                            TX: {selectedSubmission.registration_tx_hash}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
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
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

