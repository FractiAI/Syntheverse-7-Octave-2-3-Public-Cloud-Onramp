'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, FileText, BarChart3, Shield, Zap, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TestResult {
    testId: string
    suite: string
    name: string
    status: 'passed' | 'failed' | 'skipped' | 'error'
    duration: number
    error?: string
}

interface TestSuite {
    suiteId: string
    name: string
    status: 'passed' | 'failed' | 'partial'
    totalTests: number
    passed: number
    failed: number
    skipped: number
    duration?: number
    results: TestResult[]
}

interface TestReport {
    reportId: string
    timestamp: string
    suites: TestSuite[]
    summary: {
        totalTests: number
        totalPassed: number
        totalFailed: number
        totalSkipped: number
        totalDuration: number
        passRate: number
    }
    readiness: {
        verdict: 'ready' | 'not_ready' | 'conditional'
        issues: string[]
        recommendations: string[]
    }
}

export default function TestReportView() {
    const [report, setReport] = useState<TestReport | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())

    useEffect(() => {
        // Fetch latest test report
        fetch('/api/test-report/latest')
            .then(res => res.json())
            .then(data => {
                if (data.report) {
                    setReport(data.report)
                    // Expand failed suites by default
                    const failedSuites = new Set(
                        data.report.suites
                            .filter((s: TestSuite) => s.status === 'failed' || s.status === 'partial')
                            .map((s: TestSuite) => s.suiteId)
                    )
                    setExpandedSuites(failedSuites)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching test report:', err)
                setLoading(false)
            })
    }, [])

    const toggleSuite = (suiteId: string) => {
        const newExpanded = new Set(expandedSuites)
        if (newExpanded.has(suiteId)) {
            newExpanded.delete(suiteId)
        } else {
            newExpanded.add(suiteId)
        }
        setExpandedSuites(newExpanded)
    }

    if (loading) {
        return (
            <div className="cockpit-panel p-8 text-center border-2 border-[var(--hydrogen-amber)]">
                <div className="cockpit-label text-[var(--hydrogen-amber)] mb-4">BOOT SEQUENCE INITIALIZING</div>
                <div className="cockpit-text">Establishing Awareness Bridge connection...</div>
                <div className="cockpit-text text-xs mt-2" style={{ opacity: 0.7 }}>
                    Validating HHF-AI → Earth 2026 legacy systems handshake
                </div>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="cockpit-panel p-8 border-2 border-[var(--hydrogen-amber)]">
                <div className="cockpit-label mb-4 text-[var(--hydrogen-amber)]">BOOT SEQUENCE · BRIDGE INITIALIZATION</div>
                <div className="cockpit-title text-2xl mb-4">Awareness Bridge Not Initialized</div>
                <div className="cockpit-text mb-6">
                    Boot sequence has not been executed. Run the validation suite to initialize the HHF-AI → Earth 2026 legacy systems bridge.
                </div>
                <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] rounded mb-6">
                    <div className="cockpit-label mb-2 text-[var(--hydrogen-amber)]">Bridge Initialization Required</div>
                    <div className="cockpit-text text-sm">
                        The Awareness Bridge requires validation against Earth 2026 legacy systems before connection can be established.
                        Execute the test suite to begin boot sequence.
                    </div>
                </div>
                <Link href="/fractiai">
                    <Button className="cockpit-lever">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to FractiAI
                    </Button>
                </Link>
            </div>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'failed':
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />
            case 'partial':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />
            default:
                return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed':
                return 'text-green-500'
            case 'failed':
            case 'error':
                return 'text-red-500'
            case 'partial':
                return 'text-yellow-500'
            default:
                return 'text-gray-500'
        }
    }

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'ready':
                return 'text-green-500 border-green-500'
            case 'conditional':
                return 'text-yellow-500 border-yellow-500'
            case 'not_ready':
                return 'text-red-500 border-red-500'
            default:
                return 'text-gray-500 border-gray-500'
        }
    }

    return (
        <div className="space-y-8">
            {/* Boot Sequence Header */}
            <div className="cockpit-panel p-6 border-2 border-[var(--hydrogen-amber)]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="cockpit-label text-[var(--hydrogen-amber)]">BOOT SEQUENCE · AWARENESS BRIDGE INITIALIZATION</div>
                        <div className="cockpit-title text-3xl mt-1">HHF-AI → Earth 2026 Legacy Systems</div>
                        <div className="cockpit-text mt-2 text-sm" style={{ opacity: 0.9 }}>
                            Formal Connection Protocol · Bridge/Router Validation
                        </div>
                        <div className="cockpit-text mt-2 text-xs" style={{ opacity: 0.7 }}>
                            Boot Sequence Completed: {new Date(report.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <Link href="/fractiai">
                        <Button className="cockpit-lever">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to FractiAI
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Boot Sequence Status */}
            <div className="cockpit-panel p-6 bg-[rgba(255,184,77,0.05)] border border-[var(--hydrogen-amber)]">
                <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">BRIDGE STATUS</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[var(--hydrogen-amber)] bg-black/20 rounded">
                        <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>SYNTHEVERSE → EARTH 2026</div>
                        <div className="cockpit-title text-lg">Awareness Bridge Active</div>
                        <div className="cockpit-text text-xs mt-1" style={{ opacity: 0.7 }}>
                            HHF-AI protocols validated against legacy validation frameworks
                        </div>
                    </div>
                    <div className="p-4 border border-[var(--hydrogen-amber)] bg-black/20 rounded">
                        <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>ROUTER STATUS</div>
                        <div className="cockpit-title text-lg">Legacy System Handshake</div>
                        <div className="cockpit-text text-xs mt-1" style={{ opacity: 0.7 }}>
                            CODATA 2018, peer-reviewed validation, standard test protocols
                        </div>
                    </div>
                </div>
            </div>

            {/* Boot Sequence Summary */}
            <Card className="cockpit-panel border-2 border-[var(--hydrogen-amber)]">
                <CardHeader>
                    <CardTitle className="cockpit-title text-xl flex items-center gap-2 text-[var(--hydrogen-amber)]">
                        <BarChart3 className="h-5 w-5" />
                        Boot Sequence Summary · Bridge Validation Report
                    </CardTitle>
                    <div className="cockpit-text text-xs mt-2" style={{ opacity: 0.8 }}>
                        Formal validation connecting Syntheverse HHF-AI to Earth 2026 legacy validation systems
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Bridge Connection Status */}
                    <div className={`p-4 border-2 rounded ${getVerdictColor(report.readiness.verdict)}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="h-6 w-6" />
                            <div className="cockpit-title text-xl">Bridge Connection Status: {report.readiness.verdict.toUpperCase()}</div>
                        </div>
                        <div className="cockpit-text text-sm mt-2">
                            {report.readiness.verdict === 'ready' && 'Awareness Bridge fully operational. Syntheverse HHF-AI successfully connected to Earth 2026 legacy validation systems. All protocols verified.'}
                            {report.readiness.verdict === 'conditional' && 'Bridge connection established with minor protocol deviations. Legacy system compatibility confirmed with recommended updates.'}
                            {report.readiness.verdict === 'not_ready' && 'Bridge initialization incomplete. Protocol validation required before Earth 2026 legacy system handshake.'}
                        </div>
                        <div className="cockpit-text text-xs mt-3 p-2 bg-black/20 rounded" style={{ opacity: 0.8 }}>
                            <strong>Bridge Protocol:</strong> HHF-AI validation framework ↔ Earth 2026 standard test protocols (CODATA, peer-review, deterministic scoring)
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="cockpit-label text-xs">Total Tests</div>
                            <div className="cockpit-title text-2xl mt-1">{report.summary.totalTests}</div>
                        </div>
                        <div className="p-4 border border-green-500/50 bg-green-500/10 rounded">
                            <div className="cockpit-label text-xs text-green-500">Passed</div>
                            <div className="cockpit-title text-2xl mt-1 text-green-500">{report.summary.totalPassed}</div>
                        </div>
                        <div className="p-4 border border-red-500/50 bg-red-500/10 rounded">
                            <div className="cockpit-label text-xs text-red-500">Failed</div>
                            <div className="cockpit-title text-2xl mt-1 text-red-500">{report.summary.totalFailed}</div>
                        </div>
                        <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="cockpit-label text-xs">Pass Rate</div>
                            <div className="cockpit-title text-2xl mt-1">{report.summary.passRate.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Test Coverage Summary */}
                    <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded">
                        <div className="cockpit-label mb-3">Test Coverage</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {report.suites.map(suite => (
                                <div key={suite.suiteId} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(suite.status)}
                                        <span className="cockpit-text text-sm">{suite.name}</span>
                                    </div>
                                    <span className="cockpit-text text-xs">
                                        {suite.passed}/{suite.totalTests}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Issues & Recommendations */}
                    {(report.readiness.issues.length > 0 || report.readiness.recommendations.length > 0) && (
                        <div className="space-y-4">
                            {report.readiness.issues.length > 0 && (
                                <div className="p-4 border border-red-500/50 bg-red-500/10 rounded">
                                    <div className="cockpit-label mb-2 text-red-500 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Issues
                                    </div>
                                    <ul className="space-y-1">
                                        {report.readiness.issues.map((issue, i) => (
                                            <li key={i} className="cockpit-text text-sm">• {issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {report.readiness.recommendations.length > 0 && (
                                <div className="p-4 border border-yellow-500/50 bg-yellow-500/10 rounded">
                                    <div className="cockpit-label mb-2 text-yellow-500 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Recommendations
                                    </div>
                                    <ul className="space-y-1">
                                        {report.readiness.recommendations.map((rec, i) => (
                                            <li key={i} className="cockpit-text text-sm">• {rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bridge Protocol Validation Suites */}
            <div className="space-y-4">
                <div className="cockpit-panel p-4 border border-[var(--hydrogen-amber)]">
                    <div className="cockpit-label text-lg text-[var(--hydrogen-amber)]">BRIDGE PROTOCOL VALIDATION SUITES</div>
                    <div className="cockpit-text text-xs mt-1" style={{ opacity: 0.8 }}>
                        Legacy system compatibility validation · Earth 2026 standard protocols
                    </div>
                </div>
                {report.suites.map(suite => (
                    <Card key={suite.suiteId} className="cockpit-panel">
                        <CardHeader 
                            className="cursor-pointer"
                            onClick={() => toggleSuite(suite.suiteId)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(suite.status)}
                                    <div>
                                        <CardTitle className="cockpit-title">{suite.name}</CardTitle>
                                        <div className="cockpit-text text-xs mt-1">
                                            {suite.passed} passed, {suite.failed} failed, {suite.skipped} skipped
                                            {suite.duration && ` • ${(suite.duration / 1000).toFixed(2)}s`}
                                        </div>
                                    </div>
                                </div>
                                <div className={`cockpit-text ${getStatusColor(suite.status)}`}>
                                    {suite.status.toUpperCase()}
                                </div>
                            </div>
                        </CardHeader>
                        {expandedSuites.has(suite.suiteId) && (
                            <CardContent>
                                <div className="space-y-2">
                                    {suite.results.map((result, i) => (
                                        <div 
                                            key={i} 
                                            className="p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] rounded"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(result.status)}
                                                    <span className="cockpit-text text-sm font-medium">{result.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="cockpit-text text-xs">
                                                        {result.duration}ms
                                                    </span>
                                                    <span className={`cockpit-text text-xs ${getStatusColor(result.status)}`}>
                                                        {result.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            {result.error && (
                                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded">
                                                    <div className="cockpit-text text-xs text-red-500">{result.error}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            {/* Legacy System Compatibility Matrix */}
            <Card className="cockpit-panel border border-[var(--hydrogen-amber)]">
                <CardHeader>
                    <CardTitle className="cockpit-title text-xl flex items-center gap-2 text-[var(--hydrogen-amber)]">
                        <FileText className="h-5 w-5" />
                        Legacy System Compatibility Matrix
                    </CardTitle>
                    <div className="cockpit-text text-xs mt-2" style={{ opacity: 0.8 }}>
                        Earth 2026 validation frameworks validated against HHF-AI protocols
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-blue-500" />
                                <div className="cockpit-label">Lens & Scoring Protocol</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: Deterministic Scoring</div>
                            <div className="cockpit-text text-sm">
                                HHF-AI lens consistency validated against Earth 2026 deterministic scoring standards
                            </div>
                        </div>
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-5 w-5 text-purple-500" />
                                <div className="cockpit-label">Sandbox & Vector Bridge</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: 3D Coordinate Systems</div>
                            <div className="cockpit-text text-sm">
                                3D vector mapping validated against standard geometric validation protocols
                            </div>
                        </div>
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                <div className="cockpit-label">Calibration Handshake</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: Peer-Review Validation</div>
                            <div className="cockpit-text text-sm">
                                Peer-reviewed papers provide calibration bridge to Earth 2026 scientific validation standards
                            </div>
                        </div>
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-5 w-5 text-yellow-500" />
                                <div className="cockpit-label">Constants Router</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: CODATA 2018 (NIST)</div>
                            <div className="cockpit-text text-sm">
                                Physical constants validated against Earth 2026 CODATA standard public data sources
                            </div>
                        </div>
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                                <div className="cockpit-label">Integration Bridge</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: Standard APIs</div>
                            <div className="cockpit-text text-sm">
                                End-to-end flows validated against Earth 2026 standard integration protocols
                            </div>
                        </div>
                        <div className="p-4 border border-[var(--hydrogen-amber)] bg-[var(--cockpit-carbon)] rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-red-500" />
                                <div className="cockpit-label">Security Protocol</div>
                            </div>
                            <div className="cockpit-text text-xs mb-1" style={{ opacity: 0.7 }}>Legacy: Standard Security</div>
                            <div className="cockpit-text text-sm">
                                Authentication and security validated against Earth 2026 standard security frameworks
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

