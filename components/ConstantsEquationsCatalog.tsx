'use client';

import { useState, useEffect } from 'react';
import { Calculator, Hash, ExternalLink, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface ConstantEquation {
  id: string;
  value: string;
  type: 'constant' | 'equation';
  description?: string;
  source_title: string;
  source_hash: string;
  source_contributor: string;
  first_seen: string;
  usage_count: number;
}

interface ConstantsEquationsData {
  constants: ConstantEquation[];
  equations: ConstantEquation[];
  total_constants: number;
  total_equations: number;
}

export function ConstantsEquationsCatalog() {
  const [data, setData] = useState<ConstantsEquationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'constant' | 'equation'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await fetch('/api/constants-equations');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to load constants and equations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text opacity-60">Loading constants and equations catalog...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text text-red-400">Failed to load constants and equations</div>
      </div>
    );
  }

  // Combine and filter
  const allItems = [
    ...data.constants.map((c) => ({ ...c, type: 'constant' as const })),
    ...data.equations.map((e) => ({ ...e, type: 'equation' as const })),
  ];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cockpit-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="cockpit-label mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              NOVEL CONSTANTS & EQUATIONS CATALOG
            </div>
            <h2 className="cockpit-title text-2xl">SynthScan MRI Calibration Library</h2>
            <p className="cockpit-text mt-2 text-sm opacity-80">
              Discovered constants and equations from qualified PoC submissions, used to tune and
              calibrate SynthScan™ MRI evaluation parameters.
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="cockpit-lever ml-4 flex items-center gap-2 px-4 py-2 text-sm"
            aria-label={isExpanded ? 'Collapse catalog' : 'Expand catalog'}
          >
            {isExpanded ? (
              <>
                Hide <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show All <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                <Input
                  placeholder="Search constants, equations, or sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cockpit-input pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`cockpit-lever text-xs ${filterType === 'all' ? 'bg-[var(--hydrogen-amber)]/20' : ''}`}
                >
                  All ({data.total_constants + data.total_equations})
                </button>
                <button
                  onClick={() => setFilterType('constant')}
                  className={`cockpit-lever text-xs ${filterType === 'constant' ? 'bg-purple-500/20' : ''}`}
                >
                  Constants ({data.total_constants})
                </button>
                <button
                  onClick={() => setFilterType('equation')}
                  className={`cockpit-lever text-xs ${filterType === 'equation' ? 'bg-blue-500/20' : ''}`}
                >
                  Equations ({data.total_equations})
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Items List - Only show when expanded */}
      {isExpanded && (
        <>
          {filteredItems.length === 0 ? (
            <div className="cockpit-panel p-6 text-center">
              <div className="cockpit-text opacity-60">
                {searchTerm ? 'No matching constants or equations found.' : 'No constants or equations cataloged yet.'}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`cockpit-panel border-l-4 p-4 ${
                    item.type === 'constant' ? 'border-purple-500' : 'border-blue-500'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'constant' ? (
                        <Hash className="h-4 w-4 text-purple-400" />
                      ) : (
                        <Calculator className="h-4 w-4 text-blue-400" />
                      )}
                      <span className="cockpit-badge text-xs">
                        {item.type === 'constant' ? 'CONSTANT' : 'EQUATION'}
                      </span>
                    </div>
                    {item.usage_count > 1 && (
                      <span className="cockpit-text text-xs opacity-60">Used {item.usage_count}×</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="cockpit-title mb-1 font-mono text-sm">{item.value}</div>
                    {item.description && (
                      <div className="cockpit-text mt-2 text-xs opacity-80">{item.description}</div>
                    )}
                  </div>

                  <div className="mt-3 border-t border-[var(--keyline-primary)] pt-3">
                    <div className="cockpit-text mb-1 text-xs opacity-60">Source:</div>
                    <div className="cockpit-text mb-2 text-xs font-semibold">{item.source_title}</div>
                    <div className="cockpit-text mb-3 text-xs opacity-75">by {item.source_contributor}</div>
                    <Link
                      href={`/dashboard?hash=${item.source_hash}`}
                      className="cockpit-lever inline-flex items-center gap-1 text-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Source PoC
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

