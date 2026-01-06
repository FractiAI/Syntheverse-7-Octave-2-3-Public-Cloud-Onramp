'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, Layers, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnterpriseSandbox {
  id: string;
  name: string;
  description: string | null;
  operator: string;
  subscription_tier: string | null;
  contribution_count?: number;
  qualified_count?: number;
}

export function SandboxSelector() {
  const [selectedSandbox, setSelectedSandbox] = useState<string>('syntheverse');
  const [sandboxes, setSandboxes] = useState<EnterpriseSandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSandboxes();
  }, []);

  async function fetchSandboxes() {
    try {
      const res = await fetch('/api/enterprise/sandboxes');
      if (res.ok) {
        const data = await res.json();
        setSandboxes(data.sandboxes || []);
      }
    } catch (error) {
      console.error('Error fetching sandboxes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSandboxes = sandboxes.filter((sandbox) => {
    const matchesSearch = sandbox.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = !filterTier || sandbox.subscription_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const tiers = Array.from(new Set(sandboxes.map((s) => s.subscription_tier).filter(Boolean)));

  const handleSandboxSelect = (sandboxId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedSandbox(sandboxId);
    // Close dialog after a brief delay to ensure state updates
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cockpit-lever">
          <Layers className="mr-2 h-4 w-4" />
          {selectedSandbox === 'syntheverse'
            ? 'Syntheverse'
            : sandboxes.find((s) => s.id === selectedSandbox)?.name || 'Select Sandbox'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="cockpit-panel max-w-md border-[var(--keyline-primary)] p-0 max-h-[80vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-[var(--keyline-primary)] flex-shrink-0">
          <DialogTitle className="cockpit-label flex items-center gap-2">
            <Layers className="h-4 w-4" />
            SELECT SANDBOX
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a sandbox to view and manage contributions
          </DialogDescription>
        </DialogHeader>

        {/* Fixed Header Section */}
        <div className="p-4 flex-shrink-0 border-b border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
            <Input
              placeholder="Search sandboxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cockpit-input bg-[var(--cockpit-bg)] pl-10"
            />
          </div>

          {/* Filter by Tier */}
          {tiers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterTier === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier(null)}
                className="text-xs"
              >
                All
              </Button>
              {tiers.map((tier) => (
                <Button
                  key={tier}
                  variant={filterTier === tier ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTier(tier)}
                  className="text-xs"
                >
                  {tier}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Syntheverse (Default) */}
          <button
            type="button"
            onClick={(e) => handleSandboxSelect('syntheverse', e)}
            className={`w-full text-left cockpit-text cursor-pointer p-4 hover:bg-[var(--cockpit-carbon)] transition-colors border-b border-[var(--keyline-primary)] ${
              selectedSandbox === 'syntheverse' ? 'bg-[var(--cockpit-carbon)]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hydrogen-amber)]/30 to-purple-500/30 text-sm font-semibold">
                S
              </div>
              <div className="flex-1">
                <div className="cockpit-title text-sm font-medium">Syntheverse</div>
                <div className="cockpit-text text-xs opacity-75">
                  Main Syntheverse Protocol
                </div>
              </div>
              {selectedSandbox === 'syntheverse' && (
                <Check className="h-4 w-4 text-[var(--hydrogen-amber)] flex-shrink-0" />
              )}
            </div>
          </button>

          {/* Enterprise Sandboxes */}
          {loading ? (
            <div className="cockpit-text p-4 text-center text-xs opacity-60">
              Loading sandboxes...
            </div>
          ) : filteredSandboxes.length === 0 ? (
            <div className="cockpit-text p-4 text-center text-xs opacity-60">
              {searchTerm ? 'No sandboxes found' : 'No enterprise sandboxes available'}
            </div>
          ) : (
            filteredSandboxes.map((sandbox) => (
              <button
                key={sandbox.id}
                type="button"
                onClick={(e) => handleSandboxSelect(sandbox.id, e)}
                className={`w-full text-left cockpit-text cursor-pointer p-4 hover:bg-[var(--cockpit-carbon)] transition-colors border-b border-[var(--keyline-primary)] ${
                  selectedSandbox === sandbox.id ? 'bg-[var(--cockpit-carbon)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-xs font-semibold">
                    {sandbox.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="cockpit-title truncate text-sm font-medium">
                      {sandbox.name}
                    </div>
                    <div className="cockpit-text text-xs opacity-75">
                      {sandbox.subscription_tier || 'Enterprise'} · {sandbox.contribution_count || 0}{' '}
                      contributions
                    </div>
                  </div>
                  {selectedSandbox === sandbox.id && (
                    <Check className="h-4 w-4 text-[var(--hydrogen-amber)] flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

