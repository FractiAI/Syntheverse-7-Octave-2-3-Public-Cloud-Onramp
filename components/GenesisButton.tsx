'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GenesisInfoModal } from './GenesisInfoModal';

export function GenesisButton() {
  const [showGenesisModal, setShowGenesisModal] = useState(false);

  return (
    <>
      <GenesisInfoModal isOpen={showGenesisModal} onClose={() => setShowGenesisModal(false)} />
      <button
        onClick={() => setShowGenesisModal(true)}
        className="cockpit-lever inline-flex items-center justify-center py-1.5 px-3 text-xs whitespace-nowrap"
      >
        <span className="mr-1.5">🔗</span>
        <span className="hidden sm:inline">Check out Genesis</span>
        <span className="sm:hidden">Genesis</span>
        <ArrowRight className="ml-1.5 h-3 w-3" />
      </button>
    </>
  );
}
