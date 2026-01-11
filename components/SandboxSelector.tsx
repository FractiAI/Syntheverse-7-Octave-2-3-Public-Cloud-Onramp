'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, Layers, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleSandboxSelect = (sandboxId: string) => {
    setSelectedSandbox(sandboxId);
    setIsOpen(false);
  };

  const selectedSandboxName =
    selectedSandbox === 'syntheverse'
      ? 'Syntheverse'
      : sandboxes.find((s) => s.id === selectedSandbox)?.name || 'Select Sandbox';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cockpit-lever">
          <Layers className="mr-2 h-4 w-4" />
          {selectedSandboxName}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="cockpit-panel min-w-[320px] border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-0"
        sideOffset={8}
        style={{
          maxHeight: '80vh',
          height: 'auto',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 border-b border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3">
          <DropdownMenuLabel className="cockpit-label mb-2 flex items-center gap-2 text-xs">
            <Layers className="h-4 w-4" />
            SELECT CLOUD
          </DropdownMenuLabel>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
            <Input
              placeholder="Search sandboxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="cockpit-input bg-[var(--cockpit-obsidian)] pl-10 text-sm"
            />
          </div>

          {/* Filter by Tier */}
          {tiers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterTier === null ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterTier(null);
                }}
                className="text-xs"
              >
                All
              </Button>
              {tiers.map((tier) => (
                <Button
                  key={tier}
                  variant={filterTier === tier ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterTier(tier);
                  }}
                  className="text-xs"
                >
                  {tier}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content Section - Safari fixes with explicit height */}
        <div
          style={{
            height: '400px',
            maxHeight: '400px',
            overflow: 'scroll',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--hydrogen-amber) var(--cockpit-carbon)',
          }}
        >
          {/* Syntheverse (Default) */}
          <DropdownMenuItem
            onClick={() => handleSandboxSelect('syntheverse')}
            className="cursor-pointer p-3 hover:bg-[var(--cockpit-carbon)] focus:bg-[var(--cockpit-carbon)]"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hydrogen-amber)]/30 to-purple-500/30 text-xs font-semibold">
                S
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Syntheverse</div>
                <div className="text-xs opacity-75">
                  Main Syntheverse Protocol
                </div>
              </div>
              {selectedSandbox === 'syntheverse' && (
                <Check className="h-4 w-4 text-[var(--hydrogen-amber)] flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="border-[var(--keyline-primary)]" />

          {/* Enterprise Sandboxes */}
          {loading ? (
            <div className="p-4 text-center text-sm opacity-60">
              Loading sandboxes...
            </div>
          ) : filteredSandboxes.length === 0 ? (
            <div className="p-4 text-center text-sm opacity-60">
              {searchTerm ? 'No sandboxes found' : 'No enterprise sandboxes available'}
            </div>
          ) : (
            filteredSandboxes.map((sandbox) => (
              <DropdownMenuItem
                key={sandbox.id}
                onClick={() => handleSandboxSelect(sandbox.id)}
                className="cursor-pointer p-3 hover:bg-[var(--cockpit-carbon)] focus:bg-[var(--cockpit-carbon)]"
              >
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-xs font-semibold">
                    {sandbox.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {sandbox.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {sandbox.subscription_tier || 'Enterprise'} · {sandbox.contribution_count || 0}{' '}
                      contributions
                    </div>
                  </div>
                  {selectedSandbox === sandbox.id && (
                    <Check className="h-4 w-4 text-[var(--hydrogen-amber)] flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

