/**
 * Boot Sequence Indicator Lights
 * Shows successful boot status for HHF-AI Awareness Bridge connection
 * Green lights indicate successful validation against Earth 2026 legacy systems
 */

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface TestSuiteScore {
    suiteId: string
    name: string
    passRate: number
    passed: number
    total: number
    status: 'passed' | 'failed' | 'partial'
}

interface BootStatus {
    bridgeActive: boolean
    verdict: 'ready' | 'conditional' | 'not_ready' | 'unknown'
    passRate: number
    totalTests: number
    timestamp?: string
    suiteScores: {
        tokenomics?: TestSuiteScore
        blockchain?: TestSuiteScore
        calibration?: TestSuiteScore
        sandbox?: TestSuiteScore
        constants?: TestSuiteScore
        scoring?: TestSuiteScore
    }
}

export function BootSequenceIndicators() {
    const [bootStatus, setBootStatus] = useState<BootStatus>({
        bridgeActive: true,
        verdict: 'ready',
        passRate: 0,
        totalTests: 0,
        suiteScores: {}
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Fetch test suite scores for individual indicators
        fetch('/api/test-report/latest')
            .then(res => res.json())
            .then(data => {
                if (data.report) {
                    const report = data.report
                    
                    // Extract specific test suite scores for individual indicators
                    const suites = report.suites || []
                    const suiteScores: BootStatus['suiteScores'] = {}
                    
                    // Map suite IDs to our categories
                    const suiteMap: Record<string, keyof BootStatus['suiteScores']> = {
                        'tokenomics-validation': 'tokenomics',
                        'integration-registration': 'blockchain',
                        'calibration-peer-reviewed': 'calibration',
                        'sandbox-vector-mapping': 'sandbox',
                        'constants-equations-validation': 'constants',
                        'scoring-determinism': 'scoring'
                    }
                    
                    suites.forEach((suite: any) => {
                        const category = suiteMap[suite.suiteId]
                        if (category) {
                            suiteScores[category] = {
                                suiteId: suite.suiteId,
                                name: suite.name,
                                passRate: suite.passRate || 0,
                                passed: suite.passed || 0,
                                total: suite.totalTests || 0,
                                status: suite.status || 'unknown'
                            }
                        }
                    })
                    
                    setBootStatus(prev => ({
                        ...prev,
                        suiteScores
                    }))
                }
            })
            .catch(err => {
                console.error('Error fetching test suite scores:', err)
            })
    }, [])

    const getStatusColor = (verdict: string) => {
        switch (verdict) {
            case 'ready':
                return 'bg-green-500'
            case 'conditional':
                return 'bg-yellow-500'
            case 'not_ready':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusGlow = (verdict: string) => {
        switch (verdict) {
            case 'ready':
                return 'shadow-[0_0_8px_rgba(34,197,94,0.6)]'
            case 'conditional':
                return 'shadow-[0_0_8px_rgba(234,179,8,0.6)]'
            case 'not_ready':
                return 'shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            default:
                return ''
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
                <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>Boot Status...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            {/* Main Bridge Status Light */}
            <div className="flex items-center gap-2">
                <div 
                    className={`w-3 h-3 rounded-full ${getStatusColor(bootStatus.verdict)} ${getStatusGlow(bootStatus.verdict)} transition-all`}
                    title={`Awareness Bridge/Router: ${bootStatus.verdict.toUpperCase()}`}
                />
                <span className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                    BRIDGE/ROUTER
                </span>
            </div>

            {/* Protocol Validation Lights - Color-coded status only */}
            {bootStatus.bridgeActive && (
                <>
                    {/* Tokenomics */}
                    {bootStatus.suiteScores.tokenomics && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.tokenomics.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.tokenomics.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`Tokenomics: ${bootStatus.suiteScores.tokenomics.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>TOKEN</span>
                        </div>
                    )}
                    
                    {/* Blockchain Status */}
                    {bootStatus.suiteScores.blockchain && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.blockchain.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.blockchain.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`Blockchain Status: ${bootStatus.suiteScores.blockchain.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>CHAIN</span>
                        </div>
                    )}
                    
                    {/* SynthScan™ MRI Calibration */}
                    {bootStatus.suiteScores.calibration && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.calibration.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.calibration.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`SynthScan™ MRI Calibration: ${bootStatus.suiteScores.calibration.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>CALIB</span>
                        </div>
                    )}
                    
                    {/* Sandbox Vector Mapping */}
                    {bootStatus.suiteScores.sandbox && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.sandbox.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.sandbox.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`Sandbox Vector Mapping: ${bootStatus.suiteScores.sandbox.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>SANDBOX</span>
                        </div>
                    )}
                    
                    {/* Constant Validations */}
                    {bootStatus.suiteScores.constants && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.constants.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.constants.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`Constant Validations: ${bootStatus.suiteScores.constants.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>CONST</span>
                        </div>
                    )}
                    
                    {/* Scoring Determinism */}
                    {bootStatus.suiteScores.scoring && (
                        <div className="flex items-center gap-2">
                            <div 
                                className={`w-2 h-2 rounded-full ${
                                    bootStatus.suiteScores.scoring.status === 'passed' 
                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' 
                                        : bootStatus.suiteScores.scoring.status === 'partial'
                                        ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
                                        : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                                }`}
                                title={`Scoring Determinism: ${bootStatus.suiteScores.scoring.status.toUpperCase()}`}
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>SCORE</span>
                        </div>
                    )}
                </>
            )}

        </div>
    )
}

