'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Brain, Award, Coins, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface SubmitContributionFormProps {
    userEmail: string
    defaultCategory?: string
}

export default function SubmitContributionForm({ userEmail, defaultCategory = 'scientific' }: SubmitContributionFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [submissionHash, setSubmissionHash] = useState<string | null>(null)
    const [evaluationStatus, setEvaluationStatus] = useState<{
        completed?: boolean
        podScore?: number
        qualified?: boolean
        error?: string
        notice?: string
        evaluation?: any // Full evaluation result for detailed report
    } | null>(null)
    
    const [formData, setFormData] = useState({
        title: '',
        category: defaultCategory,
        text_content: '' as string,
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)
        setEvaluationStatus(null)
        setSubmissionHash(null)

        if (!formData.title.trim()) {
            setError('Title is required')
            setLoading(false)
            return
        }

        if (!formData.text_content.trim()) {
            setError('Submission text is required')
            setLoading(false)
            return
        }

        try {
            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            // Text-only submission (copy/paste)
            submitFormData.append('text_content', formData.text_content)
            submitFormData.append('category', formData.category)
            submitFormData.append('contributor', userEmail)

            // Create an AbortController for timeout handling
            // Increased timeout to 120 seconds to allow for Grok API evaluation which can take time
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout (2 minutes)

            let response: Response
            try {
                response = await fetch('/api/submit', {
                    method: 'POST',
                    body: submitFormData,
                    signal: controller.signal
                })
            } catch (fetchError) {
                clearTimeout(timeoutId)
                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    throw new Error('Request timed out after 2 minutes. The submission may have been processed - please check your dashboard. If not, try submitting again with a smaller PDF or contact support.')
                } else if (fetchError instanceof Error && fetchError.message.includes('Failed to fetch')) {
                    throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.')
                }
                throw fetchError
            }
            clearTimeout(timeoutId)

            // Try to parse JSON, but handle cases where response might not be JSON
            let result
            try {
                const text = await response.text()
                result = text ? JSON.parse(text) : {}
            } catch (parseError) {
                // If JSON parsing fails, use the raw text or a default error
                throw new Error(`Server error (${response.status}): Failed to parse response. Please try again.`)
            }

            if (!response.ok) {
                const errorMsg = result.error || result.message || 'Failed to submit contribution'
                const details = result.details ? `: ${result.details}` : ''
                const fullError = `${errorMsg}${details}`
                console.error('Submission error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: result,
                    fullError
                })
                throw new Error(fullError)
            }

            // Check if submission was successful
            if (result.success !== false && result.submission_hash) {
                setSubmissionHash(result.submission_hash)
                setSuccess(true)
                
                // Show evaluation dialog immediately while evaluation is in progress
                // The dialog will display loading state, then update with results when ready
                if (result.evaluation) {
                    // Evaluation completed synchronously - show results immediately
                    // Log full evaluation for debugging
                    console.log('Evaluation completed:', result.evaluation)
                    console.log('Density value:', result.evaluation.density)
                    console.log('Base density:', result.evaluation.base_density)
                    
                    // Use base_density as fallback if density is 0
                    const evaluationData = { ...result.evaluation }
                    if (evaluationData.density === 0 && evaluationData.base_density && evaluationData.base_density > 0) {
                        console.warn('Density is 0, using base_density as fallback:', evaluationData.base_density)
                        evaluationData.density = evaluationData.base_density
                    }
                    
                    setEvaluationStatus({
                        completed: true,
                        podScore: result.evaluation.pod_score,
                        qualified: result.evaluation.qualified || result.evaluation.qualified_founder,
                        notice: result.evaluation_notice || undefined,
                        evaluation: evaluationData // Store full evaluation for detailed report
                    })
                } else if (result.evaluation_error) {
                    // Evaluation error occurred - show error in dialog
                    setEvaluationStatus({
                        completed: false,
                        error: result.evaluation_error
                    })
                    console.warn('Evaluation error (submission succeeded):', result.evaluation_error)
                } else {
                    // Evaluation is in progress - show loading dialog
                    setEvaluationStatus({
                        completed: false
                    })
                }
                // Don't auto-redirect - let user close dialog when ready
            } else {
                throw new Error(result.message || 'Submission failed. Please try again.')
            }
        } catch (err) {
            console.error('Submission error caught:', err)
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'An error occurred while submitting. Please try again.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Contribution Process Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="cockpit-module cockpit-panel p-6">
                    <div className="cockpit-label mb-3">PROCESS MODULE 01</div>
                    <div className="cockpit-title text-xl mb-2">Prepare Your Work</div>
                    <div className="cockpit-text space-y-2">
                        <p className="text-sm">
                            Scientific papers, technical documentation, research findings,
                            or any intellectual contribution that advances human knowledge.
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Text-only submission (copy/paste)</li>
                            <li>• Include context, citations, and key details</li>
                            <li>• Ensure this is original work (or clearly attributed)</li>
                        </ul>
                    </div>
                </div>

                <div className="cockpit-module cockpit-panel p-6">
                    <div className="cockpit-label mb-3">PROCESS MODULE 02</div>
                    <div className="cockpit-title text-xl mb-2">AI Evaluation</div>
                    <div className="cockpit-text space-y-2">
                        <p className="text-sm mb-2">
                            Hydrogen-holographic fractal scoring across four dimensions:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• <strong>Novelty:</strong> Originality and innovation (0-2,500)</li>
                            <li>• <strong>Density:</strong> Information richness (0-2,500)</li>
                            <li>• <strong>Coherence:</strong> Logical consistency (0-2,500)</li>
                            <li>• <strong>Alignment:</strong> Syntheverse objectives (0-2,500)</li>
                        </ul>
                        <p className="text-xs mt-3 pt-3 border-t border-[var(--keyline-primary)]">
                            Total score: 0-10,000. Founder qualification: ≥8,000
                        </p>
                        <p className="text-xs mt-2 pt-2 border-t border-[var(--keyline-primary)]">
                            <strong>Redundancy Penalty:</strong> Applied based on 3D vector similarity to archived contributions.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Step 3: Metallic Qualification
                        </CardTitle>
                        <CardDescription>
                            Gold, Silver, or Copper ranking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Based on evaluation scores, receive metallic qualifications. Certain combinations produce amplifications:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm"><strong>Gold:</strong> Research contributions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-sm"><strong>Silver:</strong> Technology contributions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span className="text-sm"><strong>Copper:</strong> Alignment contributions</span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-border">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Combination Amplifications:</p>
                                <div className="text-xs space-y-1 text-muted-foreground">
                                    <div>• Gold + Silver + Copper: <strong>1.5×</strong></div>
                                    <div>• Gold + Silver: <strong>1.25×</strong></div>
                                    <div>• Gold + Copper: <strong>1.2×</strong></div>
                                    <div>• Silver + Copper: <strong>1.15×</strong></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Step 4: Registration
                        </CardTitle>
                        <CardDescription>
                            Qualified PoCs and optional on-chain registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Qualified contributions can be optionally registered on-chain to anchor permanently:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Proof-of-Contribution evaluation across dimensions</li>
                            <li>• Epoch qualification thresholds</li>
                            <li>• Internal coordination primitives are protocol-discretionary (no promises)</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                            Statuses used in the UI: Not Qualified, Qualified, Registered.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Submission Form */}
            <div className="cockpit-module cockpit-panel p-8">
                <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
                    <div className="cockpit-label">TRANSMISSION PROTOCOL</div>
                    <div className="cockpit-title text-2xl mt-2">Submit Your Contribution</div>
                    <div className="cockpit-text mt-2">
                        Fill in the details below to transmit your work for evaluation
                    </div>
                </div>
                <div>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && !evaluationStatus && (
                        <Alert className="mb-4 border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Submission Successful!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Your contribution has been submitted successfully.
                                <br />
                                <strong>Submission Hash:</strong> {submissionHash}
                                <br />
                                <br />
                                <span className="text-sm">
                                    The Grok evaluation dialog will show the evaluation progress and results.
                                </span>
                                <br />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSuccess(false)
                                        setSubmissionHash(null)
                                        setError(null)
                                            setFormData({ title: '', category: defaultCategory, text_content: '' })
                                    }}
                                    className="mt-2"
                                >
                                    Submit Another Contribution
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Grok Evaluation Status Dialog - Shows automatically while evaluation is in progress */}
                    {evaluationStatus && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={(e) => {
                            // Close dialog when clicking backdrop (only if evaluation completed or errored)
                            if (evaluationStatus.completed || evaluationStatus.error) {
                                if (e.target === e.currentTarget) {
                                    setEvaluationStatus(null)
                                    router.push('/dashboard')
                                }
                            }
                        }}>
                            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Grok AI Evaluation Status
                                    </CardTitle>
                                    <CardDescription>
                                        PoC Evaluation Engine - {evaluationStatus.completed ? 'Results Ready' : evaluationStatus.error ? 'Evaluation Error' : 'Processing...'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {evaluationStatus.notice ? (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm font-semibold text-blue-800">ℹ️ Evaluation Notice</div>
                                            <div className="text-sm text-blue-700 mt-1">{evaluationStatus.notice}</div>
                                        </div>
                                    ) : null}
                                    {evaluationStatus.completed && evaluationStatus.podScore !== undefined ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="text-lg font-semibold text-green-700">✅ Evaluation Complete</div>
                                                
                                                {/* PoC Score */}
                                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                                    <div className="text-sm text-muted-foreground mb-1">PoC Score</div>
                                                    <div className="text-3xl font-bold text-primary">
                                                        {evaluationStatus.podScore.toLocaleString()} / 10,000
                                                    </div>
                                                </div>

                                                {/* Qualification Status */}
                                                {evaluationStatus.qualified && (
                                                    <div className="p-4 bg-green-100 border border-green-500 rounded-lg">
                                                        <div className="font-semibold text-green-800 flex items-center gap-2">
                                                            <Award className="h-5 w-5" />
                                                            ✅ Qualified for {evaluationStatus.evaluation?.qualified_epoch ? evaluationStatus.evaluation.qualified_epoch.charAt(0).toUpperCase() + evaluationStatus.evaluation.qualified_epoch.slice(1) : 'Open'} Epoch!
                                                        </div>
                                                        <div className="text-sm text-green-700 mt-2">
                                                            {evaluationStatus.evaluation?.qualified_epoch ? (
                                                                <>Your contribution qualifies for the <strong>{evaluationStatus.evaluation.qualified_epoch.charAt(0).toUpperCase() + evaluationStatus.evaluation.qualified_epoch.slice(1)}</strong> epoch (PoC Score: {evaluationStatus.podScore.toLocaleString()})</>
                                                            ) : (
                                                                <>Your contribution has met the qualification threshold (≥8,000 points)</>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Grok API Evaluation Report - Detailed Analysis */}
                                                {evaluationStatus.evaluation && (
                                                    <div className="space-y-4">
                                                        {/* Dimension Scores Grid */}
                                                        <div className="p-4 bg-muted rounded-lg">
                                                            <div className="text-sm font-semibold mb-3">Dimension Scores</div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {evaluationStatus.evaluation.novelty !== undefined && (
                                                                    <div className="p-2 bg-background rounded border">
                                                                        <div className="text-xs text-muted-foreground">Novelty</div>
                                                                        <div className="text-lg font-bold">{evaluationStatus.evaluation.novelty.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">/ 2,500</div>
                                                                    </div>
                                                                )}
                                                                {evaluationStatus.evaluation.density !== undefined && (
                                                                    <div className="p-2 bg-background rounded border">
                                                                        <div className="text-xs text-muted-foreground">Density</div>
                                                                        <div className="text-lg font-bold">{evaluationStatus.evaluation.density.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">/ 2,500</div>
                                                                    </div>
                                                                )}
                                                                {evaluationStatus.evaluation.coherence !== undefined && (
                                                                    <div className="p-2 bg-background rounded border">
                                                                        <div className="text-xs text-muted-foreground">Coherence</div>
                                                                        <div className="text-lg font-bold">{evaluationStatus.evaluation.coherence.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">/ 2,500</div>
                                                                    </div>
                                                                )}
                                                                {evaluationStatus.evaluation.alignment !== undefined && (
                                                                    <div className="p-2 bg-background rounded border">
                                                                        <div className="text-xs text-muted-foreground">Alignment</div>
                                                                        <div className="text-lg font-bold">{evaluationStatus.evaluation.alignment.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">/ 2,500</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Classification */}
                                                        {evaluationStatus.evaluation.classification && evaluationStatus.evaluation.classification.length > 0 && (
                                                            <div className="p-4 bg-muted rounded-lg">
                                                                <div className="text-sm font-semibold mb-2">Classification</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {evaluationStatus.evaluation.classification.map((cls: string, idx: number) => (
                                                                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                                            {cls}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Metal Alignment with Justification */}
                                                        {evaluationStatus.evaluation.metals && evaluationStatus.evaluation.metals.length > 0 && (
                                                            <div className="p-4 bg-muted rounded-lg">
                                                                <div className="text-sm font-semibold mb-2">Metal Alignment</div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 rounded-full text-sm font-semibold capitalize">
                                                                        {evaluationStatus.evaluation.metals.join(', ')}
                                                                    </span>
                                                                </div>
                                                                {evaluationStatus.evaluation.metal_justification && (
                                                                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-background rounded border-l-2 border-primary/30">
                                                                        {evaluationStatus.evaluation.metal_justification}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Qualified Epoch */}
                                                        {evaluationStatus.evaluation.qualified_epoch && (
                                                            <div className="p-4 bg-muted rounded-lg">
                                                                <div className="text-sm font-semibold mb-2">Qualified Epoch</div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-700 rounded-full text-sm font-semibold capitalize">
                                                                        {evaluationStatus.evaluation.qualified_epoch}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground mt-2">
                                                                    Based on composite score (PoD Score): {evaluationStatus.podScore?.toLocaleString() || 'N/A'} / 10,000
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Redundancy Analysis - Grok's Analysis */}
                                                        {evaluationStatus.evaluation.redundancy_analysis && (
                                                            <div className="p-4 bg-muted rounded-lg">
                                                                <div className="text-sm font-semibold mb-2">Redundancy Analysis</div>
                                                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                                    {evaluationStatus.evaluation.redundancy_analysis}
                                                                </div>
                                                                {evaluationStatus.evaluation.redundancy !== undefined && (
                                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                                        Redundancy Penalty: {evaluationStatus.evaluation.redundancy.toFixed(1)}%
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Founder Certificate - Grok Generated */}
                                                        {evaluationStatus.evaluation.founder_certificate && evaluationStatus.qualified && (
                                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                                <div className="text-sm font-semibold text-green-800 mb-2">Founder Certificate</div>
                                                                <div className="text-sm text-green-700 whitespace-pre-wrap prose prose-sm max-w-none">
                                                                    {evaluationStatus.evaluation.founder_certificate}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Homebase Introduction - Grok Generated */}
                                                        {evaluationStatus.evaluation.homebase_intro && (
                                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="text-sm font-semibold text-blue-800 mb-2">Homebase v2.0 Introduction</div>
                                                                <div className="text-sm text-blue-700 whitespace-pre-wrap">
                                                                    {evaluationStatus.evaluation.homebase_intro}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Detailed Evaluation Report - Review and Scoring */}
                                                        {evaluationStatus.evaluation && (
                                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                                <div className="text-sm font-semibold text-slate-800 mb-3">Detailed Evaluation Report</div>
                                                                <div className="space-y-4 text-sm">
                                                                    {/* Evaluation Review */}
                                                                    {evaluationStatus.evaluation.redundancy_analysis && (
                                                                        <div className="p-3 bg-white rounded-lg border">
                                                                            <div className="font-semibold mb-2 text-slate-700">Evaluation Review</div>
                                                                            <div className="text-slate-800 whitespace-pre-wrap">
                                                                                {evaluationStatus.evaluation.redundancy_analysis}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Metal Justification */}
                                                                    {evaluationStatus.evaluation.metal_justification && (
                                                                        <div className="p-3 bg-white rounded-lg border">
                                                                            <div className="font-semibold mb-2 text-slate-700">Metal Assignment</div>
                                                                            <div className="text-slate-800 whitespace-pre-wrap">
                                                                                {evaluationStatus.evaluation.metal_justification}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Scoring Breakdown */}
                                                                    {evaluationStatus.evaluation.grok_evaluation_details && (
                                                                        <div className="p-3 bg-white rounded-lg border">
                                                                            <div className="font-semibold mb-3 text-slate-700">Scoring Breakdown</div>
                                                                            <div className="space-y-2 text-sm">
                                                                                {/* Base Scores */}
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    {evaluationStatus.evaluation.grok_evaluation_details.base_novelty !== undefined && (
                                                                                        <div className="p-2 bg-slate-50 rounded border">
                                                                                            <div className="text-xs text-slate-600 mb-1">Base Novelty</div>
                                                                                            <div className="font-semibold">{evaluationStatus.evaluation.grok_evaluation_details.base_novelty.toLocaleString()} / 2,500</div>
                                                                                            <div className="text-xs text-slate-600 mt-1">Final: {evaluationStatus.evaluation.novelty?.toLocaleString() || 'N/A'} / 2,500</div>
                                                                                        </div>
                                                                                    )}
                                                                                    {evaluationStatus.evaluation.grok_evaluation_details.base_density !== undefined && (
                                                                                        <div className="p-2 bg-slate-50 rounded border">
                                                                                            <div className="text-xs text-slate-600 mb-1">Base Density</div>
                                                                                            <div className="font-semibold">{evaluationStatus.evaluation.grok_evaluation_details.base_density.toLocaleString()} / 2,500</div>
                                                                                            <div className="text-xs text-slate-600 mt-1">Final: {evaluationStatus.evaluation.density?.toLocaleString() || 'N/A'} / 2,500</div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                {/* Coherence and Alignment */}
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    <div className="p-2 bg-slate-50 rounded border">
                                                                                        <div className="text-xs text-slate-600 mb-1">Coherence</div>
                                                                                        <div className="font-semibold">{evaluationStatus.evaluation.coherence?.toLocaleString() || 'N/A'} / 2,500</div>
                                                                                    </div>
                                                                                    <div className="p-2 bg-slate-50 rounded border">
                                                                                        <div className="text-xs text-slate-600 mb-1">Alignment</div>
                                                                                        <div className="font-semibold">{evaluationStatus.evaluation.alignment?.toLocaleString() || 'N/A'} / 2,500</div>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Penalties Applied */}
                                                                                {(evaluationStatus.evaluation.grok_evaluation_details.redundancy_penalty_percent !== undefined || 
                                                                                  evaluationStatus.evaluation.grok_evaluation_details.density_penalty_percent !== undefined) && (
                                                                                    <div className="pt-2 border-t">
                                                                                        <div className="text-xs text-slate-600 mb-2">Penalties Applied</div>
                                                                                        <div className="space-y-1">
                                                                                            {evaluationStatus.evaluation.grok_evaluation_details.redundancy_penalty_percent !== undefined && (
                                                                                                <div className="flex justify-between items-center text-xs">
                                                                                                    <span className="text-slate-600">Redundancy Penalty:</span>
                                                                                                    <span className="font-semibold text-orange-600">
                                                                                                        {evaluationStatus.evaluation.grok_evaluation_details.redundancy_penalty_percent.toFixed(1)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            {evaluationStatus.evaluation.grok_evaluation_details.density_penalty_percent !== undefined && (
                                                                                                <div className="flex justify-between items-center text-xs">
                                                                                                    <span className="text-slate-600">Density Penalty:</span>
                                                                                                    <span className="font-semibold text-orange-600">
                                                                                                        {evaluationStatus.evaluation.grok_evaluation_details.density_penalty_percent.toFixed(1)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* Final PoD Score */}
                                                                                <div className="pt-2 border-t">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-slate-700 font-medium">Final PoD Score</span>
                                                                                        <span className="font-bold text-lg">{evaluationStatus.podScore?.toLocaleString() || 'N/A'} / 10,000</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Full Grok API Response - Markdown/Text */}
                                                                    {evaluationStatus.evaluation.grok_evaluation_details?.raw_grok_response && 
                                                                     evaluationStatus.evaluation.grok_evaluation_details.raw_grok_response.trim().length > 0 && (
                                                                        <details className="mt-3">
                                                                            <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800">
                                                                                View Full Response
                                                                            </summary>
                                                                            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                                                <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 font-mono text-slate-900">
                                                                                    {evaluationStatus.evaluation.grok_evaluation_details.raw_grok_response}
                                                                                </pre>
                                                                            </div>
                                                                        </details>
                                                                    )}
                                                                    
                                                                    {/* Fallback to JSON if raw response not available */}
                                                                    {!evaluationStatus.evaluation.grok_evaluation_details?.raw_grok_response && 
                                                                     evaluationStatus.evaluation.grok_evaluation_details?.full_evaluation && (
                                                                        <details className="mt-3">
                                                                            <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                                                                                View Full Response (JSON)
                                                                            </summary>
                                                                            <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-xs overflow-auto max-h-96">
                                                                                {JSON.stringify(evaluationStatus.evaluation.grok_evaluation_details.full_evaluation, null, 2)}
                                                                            </pre>
                                                                        </details>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : evaluationStatus.error ? (
                                        <div className="p-4 bg-yellow-100 border border-yellow-500 rounded-lg">
                                            <div className="font-semibold text-yellow-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                ⚠️ Evaluation Status
                                            </div>
                                            <div className="text-sm text-yellow-700 mt-2">
                                                {evaluationStatus.error}
                                            </div>
                                            <div className="text-xs text-yellow-600 mt-3">
                                                Your submission was saved successfully. Evaluation may complete later. 
                                                You can check the status on your dashboard.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Grok Evaluation Dialog - Loading State */}
                                            <div className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative">
                                                        <Brain className="h-8 w-8 text-primary animate-pulse" />
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary absolute -top-1 -right-1" />
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="font-semibold text-lg text-primary">Grok AI Evaluation Engine</div>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                Syntheverse PoC Evaluation in Progress
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                                                <span>Analyzing contribution content...</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                                <span>Checking redundancy against archived PoCs...</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                                                <span>Scoring dimensions (Novelty, Density, Coherence, Alignment)...</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                                                                <span>Determining metal alignment and Founder qualification...</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                                                                <span>Generating evaluation report...</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-3 border-t border-primary/20">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                <span>This may take a few moments. Please wait...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        {evaluationStatus.completed || evaluationStatus.error ? (
                                            <>
                                                <Button 
                                                    onClick={() => {
                                                        setEvaluationStatus(null)
                                                        setSuccess(false)
                                                        setSubmissionHash(null)
                                                        setFormData({ title: '', category: defaultCategory, text_content: '' })
                                                        router.push('/dashboard')
                                                    }}
                                                    variant="outline"
                                                >
                                                    Close
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        setEvaluationStatus(null)
                                                        setSuccess(false)
                                                        setSubmissionHash(null)
                                                        setFormData({ title: '', category: defaultCategory, text_content: '' })
                                                        router.push('/dashboard')
                                                    }}
                                                >
                                                    View on Dashboard
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Evaluation in progress... (this may take up to 2 minutes)
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="cockpit-label">Title *</Label>
                            <input
                                id="title"
                                type="text"
                                className="cockpit-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter contribution title"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="cockpit-label">Category *</Label>
                            <select
                                id="category"
                                className="cockpit-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                disabled={loading}
                            >
                                <option value="scientific">Scientific Discovery</option>
                                <option value="tech">Technological Innovation</option>
                                <option value="alignment">Alignment Research</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="text_content" className="cockpit-label">Submission Text *</Label>
                            <textarea
                                id="text_content"
                                className="cockpit-input"
                                value={formData.text_content}
                                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                placeholder="Paste your contribution here (paper text, technical write-up, results, notes, links, citations, etc.)"
                                required
                                disabled={loading}
                                rows={10}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Tip: include enough detail for evaluation (methods, results, claims, novelty).</span>
                                <span>{formData.text_content.length.toLocaleString()} chars</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-[var(--keyline-primary)]">
                            <Link href="/dashboard" className="flex-1">
                                <button type="button" className="cockpit-lever w-full" disabled={loading}>
                                    Cancel
                                </button>
                            </Link>
                            <button type="submit" className="cockpit-transmission flex-1" disabled={loading || !formData.title.trim() || !formData.text_content.trim()}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Transmitting...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">◎</span>
                                        Transmit Contribution
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

