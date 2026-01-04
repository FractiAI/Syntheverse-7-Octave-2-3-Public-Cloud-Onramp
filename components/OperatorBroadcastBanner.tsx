/**
 * Operator Broadcast Banner
 * Displays important messages from the SYNTH90T MOTHERLODE BLOCKMINE operator
 * Dismissible with localStorage persistence
 */

'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

type MessageNature = 'announcement' | 'warning' | 'info' | 'success' | 'milestone' | 'alert' | 'update'

interface OperatorBroadcastBannerProps {
    message: string
    nature?: MessageNature
    urgency?: 'low' | 'medium' | 'high' | 'critical' // Fallback if nature not provided
    storageKey?: string
}

export function OperatorBroadcastBanner({ 
    message, 
    nature,
    urgency = 'medium',
    storageKey = 'operator_broadcast_dismissed'
}: OperatorBroadcastBannerProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if banner was previously dismissed
        const dismissed = localStorage.getItem(storageKey)
        if (!dismissed) {
            setIsVisible(true)
        }
    }, [storageKey])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        // Store dismissal in localStorage
        localStorage.setItem(storageKey, 'true')
    }

    // Don't render if dismissed
    if (isDismissed || !isVisible) {
        return null
    }

    // Get color scheme based on message nature (primary) or urgency (fallback)
    const getMessageStyles = () => {
        // If nature is provided, use it; otherwise fall back to urgency
        const styleKey = nature || urgency
        
        if (nature) {
            // Color coding based on message nature
            switch (nature) {
                case 'announcement':
                    return {
                        bg: 'bg-gradient-to-r from-amber-900/40 to-orange-900/40',
                        border: 'border-amber-500',
                        text: 'text-amber-200',
                        icon: 'text-amber-400',
                        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
                        pulse: ''
                    }
                case 'milestone':
                    return {
                        bg: 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40',
                        border: 'border-yellow-500',
                        text: 'text-yellow-200',
                        icon: 'text-yellow-400',
                        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
                        pulse: ''
                    }
                case 'warning':
                    return {
                        bg: 'bg-gradient-to-r from-orange-900/30 to-red-900/30',
                        border: 'border-orange-500',
                        text: 'text-orange-200',
                        icon: 'text-orange-400',
                        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
                        pulse: ''
                    }
                case 'alert':
                    return {
                        bg: 'bg-gradient-to-r from-red-900/50 to-red-800/50',
                        border: 'border-red-500',
                        text: 'text-red-200',
                        icon: 'text-red-400',
                        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
                        pulse: ''
                    }
                case 'success':
                    return {
                        bg: 'bg-gradient-to-r from-green-900/30 to-emerald-900/30',
                        border: 'border-green-500',
                        text: 'text-green-200',
                        icon: 'text-green-400',
                        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
                        pulse: ''
                    }
                case 'info':
                    return {
                        bg: 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30',
                        border: 'border-blue-500',
                        text: 'text-blue-200',
                        icon: 'text-blue-400',
                        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                        pulse: ''
                    }
                case 'update':
                    return {
                        bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
                        border: 'border-cyan-500',
                        text: 'text-cyan-200',
                        icon: 'text-cyan-400',
                        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
                        pulse: ''
                    }
                default:
                    return {
                        bg: 'bg-[var(--hydrogen-amber)]/10',
                        border: 'border-[var(--hydrogen-amber)]/50',
                        text: 'text-[var(--hydrogen-amber)]',
                        icon: 'text-[var(--hydrogen-amber)]',
                        glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]',
                        pulse: ''
                    }
            }
        }
        
        // Fallback to urgency-based styling
        switch (urgency) {
            case 'critical':
                return {
                    bg: 'bg-red-900/50',
                    border: 'border-red-500/50',
                    text: 'text-red-100',
                    icon: 'text-red-400',
                    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
                    pulse: ''
                }
            case 'high':
                return {
                    bg: 'bg-orange-900/20',
                    border: 'border-orange-500/50',
                    text: 'text-orange-100',
                    icon: 'text-orange-400',
                    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
                    pulse: ''
                }
            case 'medium':
                return {
                    bg: 'bg-[var(--hydrogen-amber)]/10',
                    border: 'border-[var(--hydrogen-amber)]/50',
                    text: 'text-[var(--hydrogen-amber)]',
                    icon: 'text-[var(--hydrogen-amber)]',
                    glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]',
                    pulse: ''
                }
            case 'low':
                return {
                    bg: 'bg-blue-900/20',
                    border: 'border-blue-500/50',
                    text: 'text-blue-100',
                    icon: 'text-blue-400',
                    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
                    pulse: ''
                }
            default:
                return {
                    bg: 'bg-[var(--hydrogen-amber)]/10',
                    border: 'border-[var(--hydrogen-amber)]/50',
                    text: 'text-[var(--hydrogen-amber)]',
                    icon: 'text-[var(--hydrogen-amber)]',
                    glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]',
                    pulse: ''
                }
        }
    }

    const styles = getMessageStyles()

    return (
        <div 
            className={`${styles.bg} ${styles.border} border-l-4 ${styles.glow} ${styles.pulse} cockpit-panel p-4 mb-6 relative transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex items-start gap-4">
                {/* Dismiss Button - Left Side */}
                <button
                    onClick={handleDismiss}
                    className={`${styles.icon} hover:opacity-100 opacity-70 transition-opacity flex-shrink-0 mt-0.5`}
                    aria-label="Dismiss notification"
                    title="Dismiss"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Message Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="cockpit-label text-xs uppercase tracking-wider">
                            OPERATOR BROADCAST
                        </div>
                        <div className={`w-2 h-2 rounded-full ${styles.icon.replace('text-', 'bg-')}`}></div>
                    </div>
                    <div className={`${styles.text} cockpit-text text-sm leading-relaxed`}>
                        {message}
                    </div>
                </div>
            </div>
        </div>
    )
}

