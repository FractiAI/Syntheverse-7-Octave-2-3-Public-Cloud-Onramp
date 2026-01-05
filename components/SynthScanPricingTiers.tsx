'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
  idealFor: string;
}

const tiers: PricingTier[] = [
  {
    name: 'SynthScan Light',
    price: 500,
    priceLabel: '$500',
    features: ['Targeted node scan access', 'Standard edge contrast analysis'],
    idealFor: 'Early adopting pioneers interested in trialing HHF-AI MRI evaluation',
  },
  {
    name: 'SynthScan Pro',
    price: 1500,
    priceLabel: '$1,500',
    features: [
      'Full nested-layer imaging',
      'Predictive resonance scoring',
      'Integration with Syntheverse Sandbox',
    ],
    idealFor: 'Pioneering teams trialing advanced multi-layer coherence analysis',
  },
  {
    name: 'SynthScan Enterprise',
    price: 5000,
    priceLabel: '$5,000',
    features: [
      'Multi-node access',
      'Full nested-layer coherence mapping',
      'Proof-of-Contribution Vault integration',
    ],
    idealFor: 'Early adopting institutions trialing enterprise-scale PoC evaluation',
  },
];

export default function SynthScanPricingTiers() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (tier: PricingTier) => {
    setLoading(tier.name);
    try {
      const response = await fetch('/api/synthscan/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.name,
          price: tier.price,
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        console.error('No checkout URL returned');
        setLoading(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`cockpit-panel border p-6 ${
              index === 1
                ? 'border-2 border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]'
                : 'border-[var(--keyline-primary)]'
            }`}
          >
            <div className="mb-4">
              <div className="cockpit-label mb-2">{tier.name}</div>
              <div className="cockpit-title mb-1 text-2xl">{tier.priceLabel}</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                per node/month
              </div>
            </div>

            <div className="mb-4">
              <div className="cockpit-text mb-2 text-sm font-semibold">Deliverables</div>
              <ul className="space-y-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="cockpit-text flex items-start text-xs">
                    <span className="mr-2">•</span>
                    <span style={{ opacity: 0.9 }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4 border-t border-[var(--keyline-primary)] pt-4">
              <div className="cockpit-text mb-1 text-xs font-semibold">Ideal for</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.8 }}>
                {tier.idealFor}
              </div>
            </div>

            <button
              onClick={() => handlePurchase(tier)}
              disabled={loading === tier.name}
              className="cockpit-lever mt-4 w-full text-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === tier.name ? (
                'Processing...'
              ) : (
                <>
                  Start Trial
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="cockpit-panel border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-6">
        <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">
          INVITING EARLY ADOPTING PIONEERS
        </div>
        <div className="cockpit-text space-y-2 text-sm">
          <p>
            <strong>We're inviting early adopting pioneers</strong> interested in trialing
            SynthScan™ MRI evaluation technology. Join us as we pioneer the future of contribution
            assessment through hydrogen spin MRI-based PoC protocol.
          </p>
          <p>• Subscribe per node monthly</p>
          <p>• Run your own scans via HHF-AI MRI</p>
          <p>• Export reports, predictive scores, and PoC-ready data</p>
          <p className="mt-3">
            SynthScan is for ongoing monitoring, testing, and discovery — a continuous tool for your
            awareness AI workflow.{' '}
            <strong>Perfect for pioneers ready to trial cutting-edge evaluation technology.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
