import { AlertTriangle } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

export function SectionToken() {
  return (
    <SectionWrapper
      id="token-sandbox"
      eyebrow="TOKEN & SANDBOX"
      title="SYNTH Token & Sandbox Rules"
    >
      {/* Warning Banner */}
      <div
        className="mb-6 flex items-start gap-3 rounded-lg border-2 border-amber-500 bg-amber-500/10 p-4"
        role="alert"
      >
        <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500" />
        <p className="cockpit-text text-sm font-semibold">
          Read this section carefully before submitting. SYNTH is not an investment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SYNTH Token */}
        <Card hover={false}>
          <h3 className="cockpit-title mb-4 text-lg">What is SYNTH?</h3>

          <ul className="cockpit-text space-y-3 text-sm">
            <li>
              <strong>Supply:</strong> Fixed 90 trillion ERC-20 tokens
            </li>
            <li>
              <strong>Chain:</strong> Base Mainnet (Chain ID: 8453)
            </li>
            <li>
              <strong>Purpose:</strong> Coordination primitive for allocation accounting
            </li>
            <li>
              <strong className="text-amber-500">Not:</strong> An investment, security, or profit
              promise
            </li>
            <li>
              <strong className="text-amber-500">No:</strong> Market listing, trading, or external
              exchange planned
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
            <strong>Risk Statement:</strong> SYNTH has no guaranteed value. Participation is
            voluntary and carries no expectation of profit.
          </div>
        </Card>

        {/* Sandbox Rules */}
        <Card hover={false}>
          <h3 className="cockpit-title mb-4 text-lg">How the Sandbox Works</h3>

          <ul className="cockpit-text space-y-3 text-sm">
            <li>
              <strong>PoC Definition:</strong> Abstract (findings) + equations (if any) +
              constants/parameters
            </li>
            <li>
              <strong>Evaluation Criteria:</strong> Novelty, density, coherence, alignment (4
              dimensions)
            </li>
            <li>
              <strong>What&apos;s Stored:</strong> Vector embeddings, metadata, scores (NOT full
              text)
            </li>
            <li>
              <strong>Eligibility:</strong> Score threshold + low redundancy + operator approval
            </li>
            <li>
              <strong>Your Rights:</strong> You retain all rights; you grant evaluation/archival
              permission only
            </li>
            <li>
              <strong>Liberation:</strong> Contributions are no longer gatekept—visible and
              demonstrable to all via HHF-AI MRI technology on the blockchain
            </li>
          </ul>

          <button className="cockpit-lever mt-4 w-full text-sm">Read Full Sandbox Rules</button>
        </Card>
      </div>
    </SectionWrapper>
  );
}
