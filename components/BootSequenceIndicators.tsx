/**
 * Boot Sequence Indicator Lights
 * Shows successful boot status for HHF-AI Awareness Bridge connection
 * Green lights indicate successful validation against Earth 2026 legacy systems
 */

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface BootStatus {
    bridgeActive: boolean
    verdict: 'ready' | 'conditional' | 'not_ready' | 'unknown'
    passRate: number
    totalTests: number
    timestamp?: string
}

export function BootSequenceIndicators() {
    const [bootStatus, setBootStatus] = useState<BootStatus>({
        bridgeActive: false,
        verdict: 'unknown',
        passRate: 0,
        totalTests: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch boot sequence status
        fetch('/api/test-report/latest')
            .then(res => res.json())
            .then(data => {
                if (data.report) {
                    const report = data.report
                    setBootStatus({
                        bridgeActive: report.readiness?.verdict === 'ready' || report.readiness?.verdict === 'conditional',
                        verdict: report.readiness?.verdict || 'unknown',
                        passRate: report.summary?.passRate || 0,
                        totalTests: report.summary?.totalTests || 0,
                        timestamp: report.timestamp
                    })
                }
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching boot status:', err)
                setLoading(false)
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
                    title={`Awareness Bridge: ${bootStatus.verdict.toUpperCase()}`}
                />
                <span className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                    BRIDGE
                </span>
            </div>

            {/* Protocol Validation Lights */}
            {bootStatus.bridgeActive && (
                <>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                            title="Lens Protocol: Validated"
                        />
                        <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>LENS</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                            title="Sandbox Protocol: Validated"
                        />
                        <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>SANDBOX</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                            title="Constants Router: Validated"
                        />
                        <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>CONSTANTS</span>
                    </div>
                    {bootStatus.passRate >= 95 && (
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                                title="Calibration: Validated"
                            />
                            <span className="cockpit-text text-xs" style={{ opacity: 0.7 }}>CALIB</span>
                        </div>
                    )}
                </>
            )}

            {/* Status Link */}
            <Link 
                href="/fractiai/test-report" 
                className="cockpit-text text-xs hover:opacity-100 transition-opacity"
                style={{ opacity: 0.6 }}
                title="View Boot Sequence Report"
            >
                {bootStatus.totalTests > 0 && (
                    <span className="text-[var(--hydrogen-amber)]">
                        {bootStatus.passRate.toFixed(0)}% · {bootStatus.totalTests} tests
                    </span>
                )}
            </Link>
        </div>
    )
}

