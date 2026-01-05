import { SectionWrapper } from './shared/SectionWrapper';
import { ExpandablePanel } from './shared/ExpandablePanel';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function SectionTechnical() {
  return (
    <SectionWrapper
      id="technical-signals"
      eyebrow="VALIDATION"
      title="What Powers Syntheverse"
      background="muted"
    >
      <p className="cockpit-text mb-8 text-base opacity-90">
        Built on SynthScan MRI, a new holographic hydrogen fractal MRI based on the same hydrogen
        spin physics that today&apos;s MRIs use, but instead of biological flesh, it scans coherence
        patterns across domains.
      </p>

      <div className="cockpit-panel bg-[var(--hydrogen-amber)]/5 mb-8 border-l-4 border-[var(--hydrogen-amber)] p-6">
        <p className="cockpit-text text-sm opacity-90">
          <strong>HHF-AI MRI Science & Technology:</strong> Our hydrogen spin MRI-based PoC protocol
          on the blockchain liberates contributions from traditional gatekeeping. Every contribution
          becomes <strong>visible and demonstrable to all</strong> through transparent, verifiable
          evaluation—no barriers, no hidden processes, complete transparency.
        </p>
      </div>

      <div className="space-y-4">
        <ExpandablePanel label="Physics & Holographic Hydrogen" title="Hydrogen Coherence Lens">
          <p className="mb-3">
            Uses hydrogen holographic framing as a coherence lens — detects measurable patterns
            conceptually and empirically.
          </p>

          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>CERN Data Analysis (ALICE):</strong> Event-type bifurcation (5.8σ)
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Fractal Dimension:</strong> Measurements (2.73 ± 0.11)
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Cross-Validation:</strong> Multi-detector coherence detection
            </div>
          </div>

          <Link
            href="https://github.com/FractiAI/Hydrogen-Holographic-Emprical-Validations-Using-IBM-Quantum-Qiskit"
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
          >
            View Validation Report
            <ExternalLink className="h-4 w-4" />
          </Link>
        </ExpandablePanel>

        <ExpandablePanel label="Biological & Fractal Structure" title="Self-Similar Organization">
          <p className="mb-3">
            Fractal self-similarity as a compression signal — organizational patterns that repeat
            across scales.
          </p>

          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Biological Proxy:</strong> PFD 1.024, HFD 0.871
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Genome Model:</strong> Conditions for awareness-driven emergence (not
              instructions)
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Cross-Scale:</strong> Pattern detection across biological systems
            </div>
          </div>

          <Link
            href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation"
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
          >
            View Biological Validation
            <ExternalLink className="h-4 w-4" />
          </Link>
        </ExpandablePanel>

        <ExpandablePanel
          label="Materials & Cross-Domain Systems"
          title="Universal Constants & Fingerprints"
        >
          <p className="mb-3">
            Universal constants and equation structure as contribution fingerprints — detecting
            alignment across fields.
          </p>

          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Isotopologue Scaling:</strong> Deviation &lt; 2.4%
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Molecular/Photonic:</strong> Relative error &lt; 10⁻⁶
            </div>
            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>PEFF Seismic/EEG:</strong> PFD ~1.02 coherence
            </div>
          </div>

          <Link
            href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation"
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
          >
            View Materials Validation
            <ExternalLink className="h-4 w-4" />
          </Link>
        </ExpandablePanel>
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/fractiai/syntheverse" className="cockpit-lever inline-flex items-center gap-2">
          Read the Short Paper (2-3 min)
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
