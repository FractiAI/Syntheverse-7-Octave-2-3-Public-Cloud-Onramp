'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

interface PricingTier {
  name: string
  price: number
  priceLabel: string
  deliverables: string[]
  idealFor: string
}

const tiers: PricingTier[] = [
  {
    name: 'FieldScan Light',
    price: 500,
    priceLabel: '$500',
    deliverables: [
      'Targeted system scan',
      'Standard edge contrast analysis',
      'Basic coherence metrics'
    ],
    idealFor: 'Small teams or simple PoCs needing quick insight'
  },
  {
    name: 'FieldScan Pro',
    price: 1500,
    priceLabel: '$1,500',
    deliverables: [
      'Deep nested-layer imaging',
      'Predictive resonance scoring',
      'Syntheverse Sandbox integration',
      'Detailed actionable report'
    ],
    idealFor: 'Medium complexity nodes needing predictive, multi-layer insights'
  },
  {
    name: 'FieldScan Enterprise',
    price: 5000,
    priceLabel: '$5,000',
    deliverables: [
      'Complete complex systems imaging',
      'Multi-node analysis & inter-node coherence mapping',
      'Proof-of-Contribution Vault integration',
      'Full scoring, nested-layer insights, predictive modeling, operational recommendations'
    ],
    idealFor: 'Large-scale PoCs or institutional nodes critical to system function and contribution measurement'
  }
]

export default function FieldScanPricingTiers() {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (tier: PricingTier) => {
    setLoading(tier.name)
    try {
      const response = await fetch('/api/fieldscan/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.name,
          price: tier.price,
        }),
      })

      const data = await response.json()
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        console.error('No checkout URL returned')
        setLoading(null)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`cockpit-panel p-6 border ${
              index === 2
                ? 'border-2 border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]'
                : 'border-[var(--keyline-primary)]'
            }`}
          >
            <div className="mb-4">
              <div className="cockpit-label mb-2">{tier.name}</div>
              <div className="cockpit-title text-2xl mb-1">{tier.priceLabel}</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                per session
              </div>
            </div>

            <div className="mb-4">
              <div className="cockpit-text text-sm font-semibold mb-2">Deliverables</div>
              <ul className="space-y-1">
                {tier.deliverables.map((deliverable, idx) => (
                  <li key={idx} className="cockpit-text text-xs flex items-start">
                    <span className="mr-2">•</span>
                    <span style={{ opacity: 0.9 }}>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4 pt-4 border-t border-[var(--keyline-primary)]">
              <div className="cockpit-text text-xs font-semibold mb-1">Ideal for</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                {tier.idealFor}
              </div>
            </div>

            <button
              onClick={() => handlePurchase(tier)}
              disabled={loading === tier.name}
              className="cockpit-lever w-full text-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === tier.name ? (
                'Processing...'
              ) : (
                <>
                  Request Engagement
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="cockpit-panel p-6 bg-[rgba(255,184,77,0.05)] border border-[var(--hydrogen-amber)]">
        <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">HOW IT WORKS</div>
        <div className="cockpit-text text-sm space-y-2">
          <p>• Select your tier based on node complexity and desired insights</p>
          <p>• Submit your node(s) for FieldScan</p>
          <p>• Receive full Holographic Hydrogen Fractal MRI analysis, predictive scoring, and optional integration with the Syntheverse Sandbox and PoC Vault</p>
          <p className="mt-3 font-semibold">FieldScan is full-service consulting — the experts come to you, do the scan, interpret results, and deliver actionable insights.</p>
        </div>
      </div>
    </div>
  )
}

