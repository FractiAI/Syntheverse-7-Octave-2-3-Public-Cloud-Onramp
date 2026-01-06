'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ArchiveStats {
  by_status: Array<{ status: string; count: number }>;
  registered: number;
  archived_resettable: number;
}

interface PoCEntry {
  submission_hash: string;
  title: string;
  contributor: string;
  status: string;
  pod_score: number | null;
  registered: boolean;
  created_at: string;
}

export function CreatorArchiveManagement() {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [pocs, setPocs] = useState<PoCEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pocsLoading, setPocsLoading] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [resetMode, setResetMode] = useState<'hard' | null>(null);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/creator/archive/reset');
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (err) {
      console.error('Failed to load archive stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPoCs = async () => {
    setPocsLoading(true);
    try {
      const response = await fetch('/api/archive/contributions?limit=100');
      if (response.ok) {
        const data = await response.json();
        setPocs(data.contributions || []);
      }
    } catch (err) {
      console.error('Failed to load PoCs:', err);
    } finally {
      setPocsLoading(false);
    }
  };

  useEffect(() => {
    if (showEntries) {
      loadPoCs();
    }
  }, [showEntries]);

  const handleReset = () => {
    setResetMode('hard');
    setConfirmationPhrase('');
    setSafetyConfirmed(false);
    setError(null);
  };

  const confirmReset = async () => {
    if (!resetMode || !safetyConfirmed) return;

    const requiredPhrase = 'RESET ARCHIVE';
    if (confirmationPhrase !== requiredPhrase) {
      setError(`Confirmation phrase must be exactly: ${requiredPhrase}`);
      return;
    }

    setResetting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/archive/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation_phrase: confirmationPhrase,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetMode(null);
        setConfirmationPhrase('');
        setSafetyConfirmed(false);
        await loadStats();
        alert(`Archive reset completed. ${data.affected_count} records affected.`);
      } else {
        setError(data.error || 'Failed to reset archive');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset archive');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text">Loading archive statistics...</div>
      </div>
    );
  }

  return (
    <>
      <div className="cockpit-panel border-l-4 border-amber-500 p-6">
        <div className="mb-4 flex items-start gap-3">
          <Database className="h-6 w-6 text-amber-500" />
          <div className="flex-1">
            <div className="cockpit-label mb-2">PoC ARCHIVE MANAGEMENT</div>
            <h2 className="cockpit-title mb-2 text-xl">Archive Reset Controls</h2>
            <p className="cockpit-text text-sm opacity-80">
              Hard reset permanently deletes archived PoC records. On-chain registrations are always
              preserved. This action cannot be undone.
            </p>
          </div>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Registered</div>
              <div className="cockpit-number text-2xl">{stats.registered}</div>
              <div className="cockpit-text text-xs opacity-60">On-chain (preserved)</div>
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-1 text-xs">Resettable</div>
              <div className="cockpit-number text-2xl">{stats.archived_resettable}</div>
              <div className="cockpit-text text-xs opacity-60">Archived (not on-chain)</div>
            </div>
            {stats.by_status
              .filter((s) => s.status === 'qualified' || s.status === 'unqualified')
              .map((s) => (
                <div key={s.status} className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
                  <div className="cockpit-label mb-1 text-xs">{s.status}</div>
                  <div className="cockpit-number text-2xl">{s.count}</div>
                </div>
              ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              setShowEntries(!showEntries);
              if (!showEntries) {
                loadPoCs();
              }
            }}
            variant="outline"
            className="cockpit-lever"
          >
            <Database className="mr-2 h-4 w-4" />
            {showEntries ? 'Hide' : 'Show'} Entries
          </Button>
          <Button
            onClick={handleReset}
            variant="destructive"
            className="cockpit-lever bg-red-600 hover:bg-red-700"
            disabled={resetting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset Archive
          </Button>
        </div>

        {/* PoC Entries List */}
        {showEntries && (
          <div className="mt-6 border-t border-[var(--keyline-primary)] pt-6">
            <div className="cockpit-label mb-4">PoC ENTRIES</div>
            {pocsLoading ? (
              <div className="cockpit-text py-8 text-center opacity-60">Loading entries...</div>
            ) : pocs.length === 0 ? (
              <div className="cockpit-text py-8 text-center opacity-60">No PoC entries found</div>
            ) : (
              <div className="space-y-2">
                {pocs.map((poc) => (
                  <div
                    key={poc.submission_hash}
                    className="cockpit-panel bg-[var(--cockpit-carbon)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="cockpit-title mb-1 truncate text-sm">{poc.title}</div>
                        <div className="cockpit-text mb-2 text-xs opacity-75">
                          {poc.contributor}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="cockpit-text opacity-60">
                            Status: <span className="opacity-100">{poc.status}</span>
                          </span>
                          {poc.pod_score !== null && (
                            <span className="cockpit-text opacity-60">
                              Score: <span className="opacity-100">{poc.pod_score}</span>
                            </span>
                          )}
                          {poc.registered && (
                            <span className="cockpit-text text-green-400">On-Chain</span>
                          )}
                          <span className="cockpit-text opacity-60">
                            {new Date(poc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="cockpit-text font-mono text-xs opacity-50">
                          {poc.submission_hash.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog 
        open={resetMode !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setResetMode(null);
            setConfirmationPhrase('');
            setSafetyConfirmed(false);
            setError(null);
          }
        }}
      >
        <DialogContent className="cockpit-panel border-red-500">
          <DialogHeader>
            <DialogTitle className="cockpit-title flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Archive Reset
            </DialogTitle>
            <DialogDescription className="cockpit-text">
              <strong className="text-red-500">WARNING:</strong> This will permanently delete
              archived PoC records. On-chain registrations, audit logs, and aggregate metrics are
              preserved. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Safety Confirmation Button */}
            <div className="rounded border-2 border-red-500/50 bg-red-500/10 p-4">
              <Label className="cockpit-label mb-2 block text-sm">
                Step 1: Confirm Safety Acknowledgment
              </Label>
              <Button
                onClick={() => setSafetyConfirmed(!safetyConfirmed)}
                variant={safetyConfirmed ? 'default' : 'outline'}
                className={`w-full ${
                  safetyConfirmed
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'border-red-500 text-red-400'
                }`}
              >
                {safetyConfirmed ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Safety Acknowledged
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Click to Acknowledge Safety Warning
                  </>
                )}
              </Button>
            </div>

            {/* Confirmation Phrase */}
            {safetyConfirmed && (
              <div>
                <Label htmlFor="confirmation" className="cockpit-label">
                  Step 2: Type &quot;RESET ARCHIVE&quot; to confirm:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationPhrase}
                  onChange={(e) => setConfirmationPhrase(e.target.value)}
                  placeholder="RESET ARCHIVE"
                  className="cockpit-input mt-2"
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetMode(null);
                setConfirmationPhrase('');
                setSafetyConfirmed(false);
                setError(null);
              }}
              disabled={resetting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReset}
              variant="destructive"
              disabled={resetting || !safetyConfirmed || confirmationPhrase !== 'RESET ARCHIVE'}
              className="bg-red-600 hover:bg-red-700"
            >
              {resetting ? 'Resetting...' : 'Confirm Reset Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
