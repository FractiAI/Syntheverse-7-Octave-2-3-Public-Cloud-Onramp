/**
 * Footer Component
 * Commercial contact information for Syntheverse
 */

import { Mail, Globe, Youtube, FileText, Github, Twitter } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] mt-auto">
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <div className="cockpit-label mb-3">Contact</div>
                        <div className="cockpit-text text-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:info@fractiai.com" className="hover:text-[var(--hydrogen-amber)]">
                                    info@fractiai.com
                                </a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="cockpit-label mb-3">Resources</div>
                        <div className="cockpit-text text-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <a href="http://fractiai.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--hydrogen-amber)]">
                                    Website
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" />
                                <a href="https://www.youtube.com/@FractiAI" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--hydrogen-amber)]">
                                    Presentations and Videos
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <a href="https://zenodo.org/records/17873279" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--hydrogen-amber)]">
                                    Whitepapers
                                </a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="cockpit-label mb-3">Code & Community</div>
                        <div className="cockpit-text text-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                <a href="https://github.com/FractiAI" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--hydrogen-amber)]">
                                    GitHub
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Twitter className="h-4 w-4" />
                                <a href="https://x.com/FractiAi" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--hydrogen-amber)]">
                                    X (Twitter)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[var(--keyline-primary)] pt-6">
                    <div className="cockpit-text text-xs text-center">
                        © {new Date().getFullYear()} FractiAI / Syntheverse. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    )
}

