import LandingPageOptimized from '@/components/LandingPageOptimized';
import './dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse: Proof-of-Contribution for Frontier R&D, Creators & Enterprises',
  description:
    'Turn research into verifiable on-chain records — no gatekeeping, measured by coherence. Contributions are no longer gatekept. Visible and demonstrable to all via HHF-AI MRI science and technology on the blockchain. An evaluation system that scores novelty, density, coherence, and alignment — then anchors proofs on Base through our hydrogen spin MRI-based PoC protocol.',
};

export default async function LandingPage() {
  return <LandingPageOptimized />;
}
