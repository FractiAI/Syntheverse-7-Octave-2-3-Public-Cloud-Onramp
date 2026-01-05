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

export function CreatorArchiveManagement() {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
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
          mode: 'hard',
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
      <div className="cockpit-panel p-6 border-l-4 border-amber-500">
        <div className="flex items-start gap-3 mb-4">
          <Database className="h-6 w-6 text-amber-500" />
          <div className="flex-1">
            <div className="cockpit-label mb-2">PoC ARCHIVE MANAGEMENT</div>
            <h2 className="cockpit-title text-xl mb-2">Archive Reset Controls</h2>
            <p className="cockpit-text text-sm opacity-80">
              Hard reset permanently deletes archived PoC records. On-chain registrations are always
              preserved. This action cannot be undone.
            </p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="cockpit-panel p-4 bg-[var(--cockpit-carbon)]">
              <div className="cockpit-label text-xs mb-1">Registered</div>
              <div className="cockpit-number text-2xl">{stats.registered}</div>
              <div className="cockpit-text text-xs opacity-60">On-chain (preserved)</div>
            </div>
            <div className="cockpit-panel p-4 bg-[var(--cockpit-carbon)]">
              <div className="cockpit-label text-xs mb-1">Resettable</div>
              <div className="cockpit-number text-2xl">{stats.archived_resettable}</div>
              <div className="cockpit-text text-xs opacity-60">Archived (not on-chain)</div>
            </div>
            {stats.by_status.map((s) => (
              <div key={s.status} className="cockpit-panel p-4 bg-[var(--cockpit-carbon)]">
                <div className="cockpit-label text-xs mb-1">{s.status}</div>
                <div className="cockpit-number text-2xl">{s.count}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleReset}
            variant="destructive"
            className="cockpit-lever bg-red-600 hover:bg-red-700"
            disabled={resetting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset Archive
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={resetMode !== null} onOpenChange={() => setResetMode(null)}>
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
            <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded">
              <Label className="cockpit-label text-sm mb-2 block">
                Step 1: Confirm Safety Acknowledgment
              </Label>
              <Button
                onClick={() => setSafetyConfirmed(!safetyConfirmed)}
                variant={safetyConfirmed ? 'default' : 'outline'}
                className={`w-full ${
                  safetyConfirmed
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-red-500 text-red-400'
                }`}
              >
                {safetyConfirmed ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Safety Acknowledged
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
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
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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

