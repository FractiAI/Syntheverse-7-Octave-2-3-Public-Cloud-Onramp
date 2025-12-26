'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Brain, Award, Coins, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface SubmitContributionFormProps {
    userEmail: string
}

export default function SubmitContributionForm({ userEmail }: SubmitContributionFormProps) {
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
        evaluation?: any // Full evaluation result for detailed report
    } | null>(null)
    
    const [formData, setFormData] = useState({
        title: '',
        text_content: '',
        category: 'scientific',
        file: null as File | null
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

        if (!formData.text_content.trim() && !formData.file) {
            setError('Please provide either text content or upload a file')
            setLoading(false)
            return
        }

        try {
            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            submitFormData.append('text_content', formData.text_content)
            submitFormData.append('category', formData.category)
            submitFormData.append('contributor', userEmail)
            
            if (formData.file) {
                submitFormData.append('file', formData.file)
            }

            // Create an AbortController for timeout handling
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

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
                    throw new Error('Request timed out. Please try again. The submission may have been processed - check your dashboard.')
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] })
        }
    }

    return (
        <div className="space-y-6">
            {/* Contribution Process Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Step 1: Prepare Your Work
                        </CardTitle>
                        <CardDescription>
                            Create or identify your contribution for evaluation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Scientific papers, technical documentation, research findings,
                            or any intellectual contribution that advances human knowledge.
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• PDF format preferred</li>
                            <li>• Include metadata and context</li>
                            <li>• Ensure original work</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Step 2: AI Evaluation
                        </CardTitle>
                        <CardDescription>
                            Hydrogen-holographic fractal scoring
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Your contribution is evaluated across four dimensions:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• <strong>Novelty:</strong> Originality and innovation (0-2,500)</li>
                            <li>• <strong>Density:</strong> Information richness (0-2,500)</li>
                            <li>• <strong>Coherence:</strong> Logical consistency (0-2,500)</li>
                            <li>• <strong>Alignment:</strong> Syntheverse objectives (0-2,500)</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-2">
                            Total score: 0-10,000. Founder qualification: ≥8,000
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                            <strong>Redundancy Penalty:</strong> A penalty is applied to the total score based on 3D vector similarity to existing archived contributions, ensuring unique contributions are prioritized.
                        </p>
                    </CardContent>
                </Card>

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
                            Step 4: Token Rewards
                        </CardTitle>
                        <CardDescription>
                            SYNTH tokens and blockchain registration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Approved contributions earn SYNTH tokens allocated at registration time based on:
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Base reward + metallic amplification</li>
                            <li>• Evaluation scores across dimensions</li>
                            <li>• Current epoch allocation and available tokens</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tokens are allocated when your PoC is approved by admin and registered on-chain.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Submission Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Submit Your Contribution</CardTitle>
                    <CardDescription>
                        Fill in the details below to submit your work for evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    {evaluationStatus.completed && evaluationStatus.podScore !== undefined ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="text-lg font-semibold text-green-700">✅ Evaluation Complete</div>
                                                
                                                {/* Pod Score */}
                                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                                    <div className="text-sm text-muted-foreground mb-1">Pod Score</div>
                                                    <div className="text-3xl font-bold text-primary">
                                                        {evaluationStatus.podScore.toLocaleString()} / 10,000
                                                    </div>
                                                </div>

                                                {/* Qualification Status */}
                                                {evaluationStatus.qualified && (
                                                    <div className="p-4 bg-green-100 border border-green-500 rounded-lg">
                                                        <div className="font-semibold text-green-800 flex items-center gap-2">
                                                            <Award className="h-5 w-5" />
                                                            ✅ Qualified as Open Epoch Founder!
                                                        </div>
                                                        <div className="text-sm text-green-700 mt-2">
                                                            Your contribution has met the Founder qualification threshold (≥8,000 points)
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
                                                        router.push('/dashboard')
                                                    }}
                                                    variant="outline"
                                                >
                                                    Close
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        setEvaluationStatus(null)
                                                        router.push('/dashboard')
                                                    }}
                                                >
                                                    View on Dashboard
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Evaluation in progress...
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter contribution title"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                disabled={loading}
                            >
                                <option value="scientific">Scientific Discovery</option>
                                <option value="tech">Technological Innovation</option>
                                <option value="alignment">Alignment Research</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="text_content">Content *</Label>
                            <textarea
                                id="text_content"
                                value={formData.text_content}
                                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                placeholder="Enter your contribution content, research findings, or description..."
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required={!formData.file}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide the text content of your contribution. This will be evaluated by the Syntheverse PoC Evaluation Engine.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File Upload (Optional)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf,.txt,.md"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload a PDF, text file, or markdown file. File name will be stored for reference.
                            </p>
                            {formData.file && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Link href="/dashboard" className="flex-1">
                                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading || (!formData.text_content.trim() && !formData.file)}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Submit Contribution
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

