import LandingPageOptimized from '@/components/LandingPageOptimized';
import './dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse: Proof-of-Contribution for Frontier R&D',
  description:
    'Turn research into verifiable on-chain records. No gatekeeping, measured by coherence. Contributions are no longer gatekept—visible and demonstrable to all via HHF-AI MRI science and technology on the blockchain. Submit your PoC and receive SynthScan™ MRI evaluation.',
};

export default async function LandingPage() {
  return <LandingPageOptimized />;
}
