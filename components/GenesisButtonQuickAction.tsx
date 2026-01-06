'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GenesisInfoModal } from './GenesisInfoModal';

export function GenesisButtonQuickAction() {
  const [showGenesisModal, setShowGenesisModal] = useState(false);

  return (
    <>
      <GenesisInfoModal isOpen={showGenesisModal} onClose={() => setShowGenesisModal(false)} />
      <button
        onClick={() => setShowGenesisModal(true)}
        className="cockpit-lever block w-full text-left py-2 px-3 text-xs"
      >
        <span className="mr-2">🔗</span>
        <span className="hidden md:inline">Check out our Syntheverse Genesis on Base Mainnet</span>
        <span className="md:hidden">Genesis on Base</span>
        <ArrowRight className="ml-2 inline h-3 w-3" />
      </button>
    </>
  );
}

