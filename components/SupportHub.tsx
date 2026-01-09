/**
 * Support Hub - Unified Access to All Support & Subscription Options
 * Elegant, cockpit-style interface for financial alignment, subscriptions, and imaging support
 */

'use client';

import { useState } from 'react';
import { X, Heart, Zap, Microscope, Camera, ArrowRight, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SupportHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportHub({ isOpen, onClose }: SupportHubProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="border-b border-[var(--keyline-primary)] p-6 pb-4" style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255, 184, 77, 0.15)'}}>
                  <Sparkles className="w-6 h-6" style={{color: 'var(--hydrogen-amber)'}} />
                </div>
                <DialogTitle className="text-2xl font-bold" style={{color: 'hsl(var(--text-primary))'}}>
                  Plans & Financial Support
                </DialogTitle>
              </div>
              <p className="text-sm opacity-80 ml-11" style={{color: 'hsl(var(--text-secondary))'}}>
                Monthly access plans and one-time contributions to support the frontier
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--keyline-primary)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Monthly Access Plans */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Microscope className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-beta))'}} />
              <h3 className="text-lg font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
                Monthly Access Plans
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Unlock advanced features and unlimited access to SynthScan™ MRI evaluation systems.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* SynthScan Monthly Access */}
              <Link
                href="/synthscan/monthly-access"
                onClick={onClose}
                className="group p-5 rounded-lg border-2 border-[var(--keyline-primary)] hover:border-[var(--hydrogen-beta)] transition-all hover:shadow-lg hover:shadow-[var(--hydrogen-beta)]/20"
                style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-beta) / 0.15)'}}>
                      <Microscope className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-beta))'}} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{color: 'hsl(var(--text-primary))'}}>SynthScan™</h4>
                      <div className="text-xs opacity-70">Monthly Access</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm opacity-80 mb-3">
                  Unlimited PoC evaluations with advanced HHF-AI MRI scanning and redundancy detection.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>$99</span>
                  <span className="text-xs opacity-60">/month</span>
                </div>
              </Link>

              {/* FieldScan Enterprise */}
              <Link
                href="/fractiai/synthscan-field-imaging"
                onClick={onClose}
                className="group p-5 rounded-lg border-2 border-[var(--keyline-primary)] hover:border-[var(--hydrogen-gamma)] transition-all hover:shadow-lg hover:shadow-[var(--hydrogen-gamma)]/20"
                style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-gamma) / 0.15)'}}>
                      <Camera className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-gamma))'}} />
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{color: 'hsl(var(--text-primary))'}}>FieldScan™</h4>
                      <div className="text-xs opacity-70">Field Imaging</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm opacity-80 mb-3">
                  Advanced field imaging and real-time coherence mapping for enterprise deployments.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{color: 'hsl(var(--hydrogen-gamma))'}}>$499</span>
                  <span className="text-xs opacity-60">/month</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--keyline-primary)]" />

          {/* Financial Support */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
              <h3 className="text-lg font-bold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                Support the Frontier
              </h3>
            </div>
            <p className="text-sm opacity-80 mb-4">
              One-time contributions to help maintain infrastructure, advance research, and keep the protocol accessible.
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Copper */}
              <Link
                href="/support?tier=copper"
                onClick={onClose}
                className="group p-4 rounded-lg border border-[var(--metal-copper)] hover:bg-[var(--metal-copper)]/10 transition-all text-center"
              >
                <Sparkles className="w-5 h-5 mx-auto mb-2" style={{color: 'hsl(var(--metal-copper))'}} />
                <div className="text-xs font-semibold mb-1" style={{color: 'hsl(var(--metal-copper))'}}>Copper</div>
                <div className="text-xl font-bold mb-1">$25</div>
                <div className="text-xs opacity-60">Foundation</div>
              </Link>

              {/* Silver */}
              <Link
                href="/support?tier=silver"
                onClick={onClose}
                className="group p-4 rounded-lg border-2 border-[var(--metal-silver)] hover:bg-[var(--metal-silver)]/10 transition-all text-center relative"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{backgroundColor: 'hsl(var(--metal-silver))', color: '#000'}}>
                  POPULAR
                </div>
                <Zap className="w-5 h-5 mx-auto mb-2" style={{color: 'hsl(var(--metal-silver))'}} />
                <div className="text-xs font-semibold mb-1" style={{color: 'hsl(var(--metal-silver))'}}>Silver</div>
                <div className="text-xl font-bold mb-1">$100</div>
                <div className="text-xs opacity-60">Accelerated</div>
              </Link>

              {/* Gold */}
              <Link
                href="/support?tier=gold"
                onClick={onClose}
                className="group p-4 rounded-lg border-2 border-[var(--metal-gold)] hover:bg-[var(--metal-gold)]/10 transition-all text-center"
              >
                <Heart className="w-5 h-5 mx-auto mb-2" style={{color: 'hsl(var(--metal-gold))'}} />
                <div className="text-xs font-semibold mb-1" style={{color: 'hsl(var(--metal-gold))'}}>Gold</div>
                <div className="text-xl font-bold mb-1">$500</div>
                <div className="text-xs opacity-60">Champion</div>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/support"
                onClick={onClose}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-2"
              >
                View all support options
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--keyline-primary)]" />

          {/* Info Footer */}
          <div className="flex items-start gap-3 p-4 rounded-lg" style={{backgroundColor: 'hsl(var(--cockpit-carbon) / 0.5)'}}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
            <div className="text-xs opacity-70 space-y-1">
              <p>
                <strong>All transactions are secure</strong> and processed through Stripe. Monthly subscriptions can be canceled anytime.
              </p>
              <p>
                SYNTH token recognition (if enabled) is optional, post-hoc, and discretionary. Not an investment or security.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

