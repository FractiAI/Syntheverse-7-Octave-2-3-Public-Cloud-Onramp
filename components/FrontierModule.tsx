/**
 * Frontier Module Component
 * PoC Submissions Archive with Avionics Panel Styling
 * Holographic Hydrogen Fractal Frontier Noir
 */

'use client';

import { useState, useEffect } from 'react';
import { IntegrityValidator } from '@/utils/validation/IntegrityValidator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RefreshCw, CreditCard, ExternalLink, FileText, Sprout, Zap } from 'lucide-react';
import Link from 'next/link';

interface PoCSubmission {
  submission_hash: string;
  title: string;
  contributor: string;
  category: string | null;
  status: string;
  metals: string[];
  pod_score: number | null;
  novelty: number | null;
  density: number | null;
  coherence: number | null;
  alignment: number | null;
  redundancy: number | null;
  redundancy_overlap_percent?: number | null;
  qualified: boolean | null;
  qualified_epoch: string | null;
  registered: boolean | null;
  registration_date: string | null;
  registration_tx_hash: string | null;
  stripe_payment_id: string | null;
  allocated: boolean | null; // Legacy; treated as Registered in UI
  allocation_amount: number | null;
  created_at: string;
  updated_at: string;
  text_content?: string;
  metadata?: any;
  grok_evaluation_details?: {
    base_novelty?: number;
    base_density?: number;
    redundancy_penalty_percent?: number;
    density_penalty_percent?: number;
    full_evaluation?: any;
    raw_grok_response?: string;
  };
  // Seed and Edge Detection (content-based) + Sweet Spot (overlap-based)
  is_seed?: boolean | null;
  is_edge?: boolean | null;
  has_sweet_spot_edges?: boolean | null;
  overlap_percent?: number | null;
}

interface FrontierModuleProps {
  userEmail: string;
}

type ViewMode = 'my' | 'qualified' | 'all';

export function FrontierModule({ userEmail }: FrontierModuleProps) {
  const [allSubmissions, setAllSubmissions] = useState<PoCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<PoCSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const [showFullReport, setShowFullReport] = useState(false);

  const mySubmissions = allSubmissions.filter((s) => s.contributor === userEmail);
  const qualifiedSubmissions = allSubmissions.filter((s) => s.qualified === true);

  const getFilteredSubmissions = (): PoCSubmission[] => {
    switch (viewMode) {
      case 'my':
        return mySubmissions;
      case 'qualified':
        return qualifiedSubmissions;
      case 'all':
        return allSubmissions;
      default:
        return mySubmissions;
    }
  };

  const getViewTitle = (): string => {
    switch (viewMode) {
      case 'my':
        return 'My Submissions';
      case 'qualified':
        return 'Qualified Submissions';
      case 'all':
        return 'All Submissions';
      default:
        return 'My Submissions';
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        await fetchSubmissions(false);
      } catch (err) {
        console.error('Error loading PoC archive:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load submissions');
          setLoading(false);
        }
      }
    }

    loadData();

    const params = new URLSearchParams(window.location.search);
    const registrationStatus = params.get('registration');
    const registrationHash = params.get('hash');

    if (registrationStatus === 'success' && registrationHash) {
      // Immediately remove URL params so other widgets don't start their own polling loops.
      // Keep the hash locally for this effect.
      window.history.replaceState({}, '', window.location.pathname);

      let pollCount = 0;
      const maxPolls = 15; // 15 * 2s = 30s max
      const pollEveryMs = 2000;
      let inFlight = false;
      let pollTimer: ReturnType<typeof setTimeout> | null = null;

      const pollForRegistration = async (): Promise<boolean> => {
        if (inFlight) return false;
        inFlight = true;
        pollCount++;

        try {
          const statusResponse = await fetch(
            `/api/poc/${registrationHash}/registration-status?t=${Date.now()}`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            // Once registered, refresh submissions (silently) and stop polling.
            if (statusData.registered && pollCount >= 2) {
              await fetchSubmissions(true);
              return true;
            }
          }

          // Silent refresh occasionally to pick up allocation changes without UI flicker.
          if (pollCount % 3 === 0) {
            await fetchSubmissions(true);
          }
        } catch (err) {
          console.error(`[Poll ${pollCount}] Error polling:`, err);
        } finally {
          inFlight = false;
        }

        if (pollCount >= maxPolls) {
          await fetchSubmissions(true);
          return true;
        }

        return false;
      };

      const scheduleNext = async () => {
        const shouldStop = await pollForRegistration();
        if (shouldStop) return;
        pollTimer = setTimeout(scheduleNext, pollEveryMs);
      };

      // Kick off immediately (no overlap due to inFlight guard + chained setTimeout).
      scheduleNext();

      return () => {
        isMounted = false;
        if (pollTimer) clearTimeout(pollTimer);
      };
    } else {
      return () => {
        isMounted = false;
      };
    }
  }, [userEmail]);

  async function fetchSubmissions(silent = false) {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s safety timeout
      const response = await fetch(`/api/archive/contributions?limit=200&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('Session expired. Please refresh and log in again.');
        }
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.contributions)) {
        throw new Error('Invalid response format from server');
      }

      setAllSubmissions(data.contributions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'Submissions request timed out. Please try again.'
          : err instanceof Error
            ? err.message
            : 'Failed to load submissions';
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function handleRegister(hash: string) {
    setRegistering(hash);
    try {
      const response = await fetch(`/api/poc/${hash}/register`, {
        method: 'POST',
      });

      let data: any;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error(`Empty response from server (status: ${response.status})`);
        }
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid response from server (status: ${response.status})`);
      }

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || `Failed to initiate registration (${response.status})`;
        throw new Error(errorMessage);
      }

      // Registration is now free - directly registered on blockchain
      if (data.success && data.registered) {
        // Registration successful - show success and redirect to dashboard
        alert(
          `PoC registered successfully on blockchain!\nTransaction Hash: ${data.registration_tx_hash || 'N/A'}`
        );
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error(data?.message || data?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to register PoC';
      alert(`Registration Error: ${errorMessage}`);
    } finally {
      setRegistering(null);
    }
  }

  async function handleRowClick(submission: PoCSubmission) {
    setShowFullReport(false); // Reset full report view when opening a new submission
    try {
      const response = await fetch(`/api/archive/contributions/${submission.submission_hash}`);
      if (response.ok) {
        const details = await response.json();
        setSelectedSubmission({
          ...submission,
          ...details,
          registration_date: details.registration_date || submission.registration_date || null,
          registration_tx_hash:
            details.registration_tx_hash || submission.registration_tx_hash || null,
          stripe_payment_id: details.stripe_payment_id || submission.stripe_payment_id || null,
          registered: details.registered !== undefined ? details.registered : submission.registered,
          allocation_amount:
            details.allocation_amount !== undefined
              ? details.allocation_amount
              : submission.allocation_amount,
        });
      } else {
        setSelectedSubmission(submission);
      }
    } catch (err) {
      setSelectedSubmission(submission);
    }
    setIsDetailOpen(true);
  }

  const formatScore = (score: number | null) => {
    if (score === null) return '—';
    return score.toLocaleString();
  };

  const formatRedundancy = (redundancy: number | null) => {
    if (redundancy === null || redundancy === undefined) return '—';
    return `${redundancy.toFixed(1)}%`;
  };

  const formatAllocation = (amount: number | null) => {
    if (amount === null || amount === undefined) return '—';
    if (amount >= 1_000_000_000_000) {
      return `${(amount / 1_000_000_000_000).toFixed(2)}T SYNTH`;
    }
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(2)}B SYNTH`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(2)}M SYNTH`;
    }
    return `${amount.toLocaleString()} SYNTH`;
  };

  const getStatusBadge = (submission: PoCSubmission) => {
    // Only statuses shown in UI: Not Qualified, Qualified, Registered
    // Treat "allocated" as "Registered" (same terminal state in UI).
    if (submission.registered || submission.allocated) {
      const primaryMetal =
        submission.metals && submission.metals.length > 0
          ? submission.metals[0].toLowerCase()
          : 'copper';
      const metalColors: Record<string, string> = {
        gold: 'var(--hydrogen-amber)',
        silver: 'rgba(214, 214, 214, 0.8)',
        copper: 'rgba(205, 127, 50, 0.8)',
        hybrid: 'rgba(100, 149, 237, 0.8)',
      };
      const color = metalColors[primaryMetal] || 'var(--hydrogen-amber)';
      return (
        <span className="cockpit-badge" style={{ borderColor: color, color }}>
          Registered
        </span>
      );
    }
    if (submission.qualified) {
      return (
        <span
          className="cockpit-badge"
          style={{ borderColor: 'rgba(147, 51, 234, 0.8)', color: 'rgba(147, 51, 234, 0.8)' }}
        >
          Qualified
        </span>
      );
    }
    return <span className="cockpit-badge">Not Qualified</span>;
  };

  if (loading) {
    return (
      <div className="cockpit-module cockpit-panel p-4 md:p-8">
        <div className="flex min-h-[200px] items-center justify-center gap-3 md:gap-4">
          <div className="fractal-spiral"></div>
          <div className="cockpit-text">Loading submission data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cockpit-module cockpit-panel p-4 md:p-8">
        <div className="text-center">
          <div className="cockpit-label mb-4 text-red-400">Module Error</div>
          <div className="cockpit-text mb-4">{error}</div>
          <button onClick={() => fetchSubmissions(false)} className="cockpit-lever">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const filteredSubmissions = getFilteredSubmissions();
  const showContributorColumn = viewMode === 'all' || viewMode === 'qualified';

  return (
    <>
      <div className="cockpit-module cockpit-panel">
        <div className="p-4 md:p-6">
          {/* Module Header */}
          <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
            <div>
              <div className="cockpit-label">PoC NAVIGATOR</div>
              <div className="cockpit-title mt-1 text-2xl">PoC SUBMISSIONS ARCHIVE</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchSubmissions(false)}
                className="cockpit-lever px-4 py-2 text-sm"
              >
                <RefreshCw className="mr-2 inline h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="mb-4 flex gap-2 md:mb-6">
            <button
              onClick={() => setViewMode('my')}
              className={`cockpit-lever px-4 py-2 text-sm ${viewMode === 'my' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              My Submissions
            </button>
            <button
              onClick={() => setViewMode('qualified')}
              className={`cockpit-lever px-4 py-2 text-sm ${viewMode === 'qualified' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              Qualified
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`cockpit-lever px-4 py-2 text-sm ${viewMode === 'all' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              All Submissions
            </button>
          </div>

          {/* Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="cockpit-text mb-4">No {getViewTitle().toLowerCase()} found</div>
              <Link href="/submit" className="cockpit-lever inline-block">
                Submit First Contribution
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cockpit-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    {showContributorColumn && <th>Contributor</th>}
                    <th>Status</th>
                    <th>Epoch</th>
                    <th>Metals</th>
                    <th className="text-right">PoC Score</th>
                    <th className="text-right">Overlap</th>
                    <th className="text-right">Allocation</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.submission_hash}
                      onClick={() => handleRowClick(submission)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{submission.title}</div>
                          {submission.is_seed && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              title="Seed Submission - Defines irreducible primitives (S₀-S₈) (+15% multiplier)"
                            >
                              <Sprout className="h-3 w-3" />
                              SEED
                            </span>
                          )}
                          {submission.is_edge && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              title="Edge Submission - Defines boundary operators (E₀-E₆) (+15% multiplier)"
                            >
                              <Zap className="h-3 w-3" />
                              EDGE
                            </span>
                          )}
                          {submission.has_sweet_spot_edges && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              title="Sweet Spot Overlap - Optimal redundancy (9.2%-19.2%) - Different from edge detection"
                            >
                              <Zap className="h-3 w-3" />
                              SWEET SPOT
                            </span>
                          )}
                        </div>
                        {submission.category && (
                          <div className="cockpit-text mt-1 text-xs capitalize">
                            {submission.category}
                          </div>
                        )}
                      </td>
                      {showContributorColumn && (
                        <td className="cockpit-text text-sm">{submission.contributor}</td>
                      )}
                      <td>{getStatusBadge(submission)}</td>
                      <td className="text-sm uppercase">{submission.qualified_epoch || '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          {submission.metals?.slice(0, 3).map((metal, idx) => (
                            <span key={idx} className="cockpit-badge text-xs">
                              {metal}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="cockpit-number text-right font-mono">
                        {formatScore(submission.pod_score)}
                      </td>
                      <td className="cockpit-number text-right font-mono">
                        <span
                          className={
                            submission.redundancy && submission.redundancy > 0
                              ? 'text-green-400'
                              : submission.redundancy && submission.redundancy < 0
                                ? 'text-orange-400'
                                : ''
                          }
                        >
                          {formatRedundancy(submission.redundancy)}
                        </span>
                      </td>
                      <td className="cockpit-number text-right font-mono">
                        {formatAllocation(submission.allocation_amount)}
                      </td>
                      <td className="cockpit-text text-sm">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog - Maintain existing functionality */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)]">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="cockpit-title text-xl">{selectedSubmission?.title}</DialogTitle>
              {selectedSubmission?.is_seed && (
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  title="Seed Submission - Defines irreducible primitives (S₀-S₈) (+15% multiplier)"
                >
                  <Sprout className="h-3.5 w-3.5" />
                  SEED
                </span>
              )}
              {selectedSubmission?.is_edge && (
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  title="Edge Submission - Defines boundary operators (E₀-E₆) (+15% multiplier)"
                >
                  <Zap className="h-3.5 w-3.5" />
                  EDGE
                </span>
              )}
              {selectedSubmission?.has_sweet_spot_edges && (
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  title="Sweet Spot Overlap - Optimal redundancy (9.2%-19.2%) - Different from edge detection"
                >
                  <Zap className="h-3.5 w-3.5" />
                  SWEET SPOT
                </span>
              )}
            </div>
            <DialogDescription className="cockpit-text">Submission Details</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="mt-4 space-y-4">
              {/* Status and Metadata */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <div className="cockpit-label mb-2">Status</div>
                  {getStatusBadge(selectedSubmission)}
                </div>
                <div>
                  <div className="cockpit-label mb-2">Metals</div>
                  <div className="flex gap-2">
                    {selectedSubmission.metals?.map((metal, idx) => (
                      <span key={idx} className="cockpit-badge">
                        {metal}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedSubmission.qualified_epoch && (
                  <div>
                    <div className="cockpit-label mb-2">Qualified Epoch</div>
                    <div className="text-sm uppercase">{selectedSubmission.qualified_epoch}</div>
                  </div>
                )}
              </div>

              {/* Actions (moved to top for visibility) */}
              {selectedSubmission.contributor === userEmail && (
                <div className="border-t border-[var(--keyline-primary)] pt-4">
                  {selectedSubmission.qualified && !selectedSubmission.registered && (
                    <button
                      onClick={() => handleRegister(selectedSubmission.submission_hash)}
                      disabled={registering === selectedSubmission.submission_hash}
                      className="cockpit-lever hover:bg-[var(--hydrogen-amber)]/90 border-[var(--hydrogen-amber)]/50 w-full rounded-md border-2 bg-[var(--hydrogen-amber)] py-6 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:shadow-xl"
                    >
                      {registering === selectedSubmission.submission_hash ? (
                        <>
                          <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
                          Processing Registration...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 inline h-5 w-5" />⚡ Anchor PoC on‑chain
                        </>
                      )}
                    </button>
                  )}
                  {(selectedSubmission.registered || selectedSubmission.allocated) && (
                    <div className="cockpit-text text-sm">PoC is registered.</div>
                  )}
                </div>
              )}

              {/* Scores */}
              <div>
                <div className="cockpit-label mb-3">Evaluation Scores</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  <div>
                    <div className="cockpit-text mb-1 text-xs">PoC Score</div>
                    <div className="cockpit-number cockpit-number-medium">
                      {formatScore(selectedSubmission.pod_score)}
                    </div>
                    <div className="cockpit-text mt-1 text-xs">/ 10,000</div>
                  </div>
                  <div>
                    <div className="cockpit-text mb-1 text-xs">Novelty</div>
                    <div className="cockpit-number">{formatScore(selectedSubmission.novelty)}</div>
                    <div className="cockpit-text mt-1 text-xs">/ 2,500</div>
                  </div>
                  <div>
                    <div className="cockpit-text mb-1 text-xs">Density</div>
                    <div className="cockpit-number">{formatScore(selectedSubmission.density)}</div>
                    <div className="cockpit-text mt-1 text-xs">/ 2,500</div>
                  </div>
                  <div>
                    <div className="cockpit-text mb-1 text-xs">Coherence</div>
                    <div className="cockpit-number">
                      {formatScore(selectedSubmission.coherence)}
                    </div>
                    <div className="cockpit-text mt-1 text-xs">/ 2,500</div>
                  </div>
                  {selectedSubmission.alignment !== null && (
                    <div>
                      <div className="cockpit-text mb-1 text-xs">Alignment</div>
                      <div className="cockpit-number">
                        {formatScore(selectedSubmission.alignment)}
                      </div>
                      <div className="cockpit-text mt-1 text-xs">/ 2,500</div>
                    </div>
                  )}
                  {selectedSubmission.redundancy !== null && (
                    <div>
                      <div className="cockpit-text mb-1 text-xs">Redundancy</div>
                      <div
                        className={`cockpit-number ${selectedSubmission.redundancy > 50 ? 'text-orange-400' : selectedSubmission.redundancy > 25 ? 'text-yellow-400' : ''}`}
                      >
                        {formatRedundancy(selectedSubmission.redundancy)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Evaluation Report */}
              {selectedSubmission.metadata && (
                <div className="border-t border-[var(--keyline-primary)] pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="cockpit-label">Detailed Evaluation Report</div>
                    {(selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response ||
                      selectedSubmission.metadata.grok_evaluation_details?.full_evaluation) && (
                      <button
                        onClick={() => setShowFullReport(!showFullReport)}
                        className="cockpit-lever px-4 py-2 text-sm"
                      >
                        <FileText className="mr-2 inline h-4 w-4" />
                        {showFullReport ? 'Hide Full Report' : 'View Full Report'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-4 text-sm">
                    {/* Evaluation Review Text */}
                    {selectedSubmission.metadata.redundancy_analysis && (
                      <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 md:p-4">
                        <div className="cockpit-label mb-2">Evaluation Review</div>
                        <div className="cockpit-text whitespace-pre-wrap">
                          {selectedSubmission.metadata.redundancy_analysis}
                        </div>
                      </div>
                    )}

                    {/* Metal Justification */}
                    {selectedSubmission.metadata.metal_justification && (
                      <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 md:p-4">
                        <div className="cockpit-label mb-2">Metal Assignment</div>
                        <div className="cockpit-text whitespace-pre-wrap">
                          {selectedSubmission.metadata.metal_justification}
                        </div>
                      </div>
                    )}

                    {/* Scoring Breakdown */}
                    {selectedSubmission.metadata.grok_evaluation_details && (
                      <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 md:p-4">
                        <div className="cockpit-label mb-3">Scoring Breakdown</div>
                        <div className="space-y-3 text-sm">
                          {/* Base Scores */}
                          <div className="grid grid-cols-2 gap-3">
                            {selectedSubmission.metadata.grok_evaluation_details.base_novelty !==
                              undefined && (
                              <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3">
                                <div className="cockpit-text mb-1 text-xs">Base Novelty</div>
                                <div className="cockpit-number">
                                  {selectedSubmission.metadata.grok_evaluation_details.base_novelty.toLocaleString()}{' '}
                                  / 2,500
                                </div>
                                <div className="cockpit-text mt-1 text-xs">
                                  Final: {selectedSubmission.novelty?.toLocaleString() || 'N/A'} /
                                  2,500
                                </div>
                              </div>
                            )}
                            {selectedSubmission.metadata.grok_evaluation_details.base_density !==
                              undefined && (
                              <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3">
                                <div className="cockpit-text mb-1 text-xs">Base Density</div>
                                <div className="cockpit-number">
                                  {selectedSubmission.metadata.grok_evaluation_details.base_density.toLocaleString()}{' '}
                                  / 2,500
                                </div>
                                <div className="cockpit-text mt-1 text-xs">
                                  Final: {selectedSubmission.density?.toLocaleString() || 'N/A'} /
                                  2,500
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Coherence and Alignment */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3">
                              <div className="cockpit-text mb-1 text-xs">Coherence</div>
                              <div className="cockpit-number">
                                {selectedSubmission.coherence?.toLocaleString() || 'N/A'} / 2,500
                              </div>
                            </div>
                            <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3">
                              <div className="cockpit-text mb-1 text-xs">Alignment</div>
                              <div className="cockpit-number">
                                {selectedSubmission.alignment?.toLocaleString() || 'N/A'} / 2,500
                              </div>
                            </div>
                          </div>

                          {/* Overlap Effect */}
                          {selectedSubmission.redundancy !== null &&
                            selectedSubmission.redundancy !== 0 && (
                              <div className="border-t border-[var(--keyline-primary)] pt-3">
                                <div className="cockpit-text mb-2 text-xs">Overlap Effect</div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="cockpit-text">Overlap Impact:</span>
                                    <span
                                      className={`cockpit-number ${selectedSubmission.redundancy > 0 ? 'text-green-400' : 'text-orange-400'}`}
                                    >
                                      {selectedSubmission.redundancy > 0 ? '+' : ''}
                                      {selectedSubmission.redundancy.toFixed(1)}%
                                    </span>
                                  </div>
                                  {selectedSubmission.metadata.grok_evaluation_details
                                    .density_penalty_percent !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="cockpit-text">Density Penalty:</span>
                                      <span className="cockpit-number text-orange-400">
                                        {selectedSubmission.metadata.grok_evaluation_details.density_penalty_percent.toFixed(
                                          1
                                        )}
                                        %
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Final PoC Score */}
                          <div className="border-t border-[var(--keyline-primary)] pt-3">
                            <div className="flex items-center justify-between">
                              <span className="cockpit-text font-medium">Final PoC Score</span>
                              <span className="cockpit-number cockpit-number-medium">
                                {/* THALET PROTOCOL: Use validated atomic score */}
                                {(() => {
                                  try {
                                    if (selectedSubmission.metadata?.atomic_score) {
                                      return IntegrityValidator.getValidatedScore(selectedSubmission.metadata.atomic_score).toLocaleString();
                                    } else if (selectedSubmission.metadata?.score_trace?.final_score) {
                                      return (selectedSubmission.metadata.score_trace.final_score).toLocaleString();
                                    } else {
                                      return (selectedSubmission.pod_score ?? 0).toLocaleString();
                                    }
                                  } catch (error) {
                                    console.error('[THALET] Validation failed:', error);
                                    return 'INVALID';
                                  }
                                })()} / 10,000
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tokenomics Recommendation */}
                    {selectedSubmission.metadata.tokenomics_recommendation?.allocation_notes && (
                      <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 md:p-4">
                        <div className="cockpit-label mb-2">Allocation Recommendation</div>
                        <div className="cockpit-text whitespace-pre-wrap">
                          {selectedSubmission.metadata.tokenomics_recommendation.allocation_notes}
                        </div>
                      </div>
                    )}

                    {/* Founder Certificate */}
                    {selectedSubmission.metadata.founder_certificate && (
                      <div className="rounded border border-[var(--hydrogen-amber)] bg-[rgba(255,215,0,0.1)] p-3 md:p-4">
                        <div className="cockpit-label mb-2 text-[var(--hydrogen-amber)]">
                          Founder Certificate
                        </div>
                        <div className="cockpit-text whitespace-pre-wrap">
                          {selectedSubmission.metadata.founder_certificate}
                        </div>
                      </div>
                    )}

                    {/* Full SynthScan MRI Evaluation Report - Toggleable */}
                    {showFullReport && (
                      <div className="mt-3 border-t border-[var(--keyline-primary)] pt-3">
                        {(() => {
                          const raw =
                            selectedSubmission.metadata.grok_evaluation_details
                              ?.raw_grok_response ||
                            selectedSubmission.metadata.grok_evaluation_details?.full_evaluation
                              ?.raw_grok_response ||
                            '';
                          if (raw && raw.trim().length > 0) {
                            return (
                              <div>
                                <div className="cockpit-label mb-2">SynthScan™ MRI Evaluation Report</div>
                                <div className="rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3 md:p-4">
                                  <pre className="cockpit-text max-h-96 overflow-auto whitespace-pre-wrap font-mono text-xs">
                                    {raw}
                                  </pre>
                                </div>
                              </div>
                            );
                          }
                          if (
                            selectedSubmission.metadata.grok_evaluation_details?.full_evaluation
                          ) {
                            return (
                              <div>
                                <div className="cockpit-label mb-2">Parsed Evaluation (JSON)</div>
                                <pre className="cockpit-text max-h-96 overflow-auto rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3 font-mono text-xs">
                                  {JSON.stringify(
                                    selectedSubmission.metadata.grok_evaluation_details
                                      .full_evaluation,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--keyline-primary)] pt-3 text-sm md:gap-4 md:pt-4">
                <div>
                  <div className="cockpit-label mb-1">Contributor</div>
                  <div className="cockpit-text">{selectedSubmission.contributor}</div>
                </div>
                <div>
                  <div className="cockpit-label mb-1">Category</div>
                  <div className="cockpit-text capitalize">
                    {selectedSubmission.category || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1">Submitted</div>
                  <div className="cockpit-text">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1">HHF-AI HASH</div>
                  <div className="cockpit-text break-all font-mono text-xs">
                    {selectedSubmission.submission_hash}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {selectedSubmission.text_content && (
                <div className="border-t border-[var(--keyline-primary)] pt-4">
                  <div className="cockpit-label mb-2">Content Preview</div>
                  <div className="cockpit-text max-h-40 overflow-y-auto rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 text-sm">
                    {selectedSubmission.text_content.substring(0, 500)}
                    {selectedSubmission.text_content.length > 500 && '...'}
                  </div>
                </div>
              )}

              {/* Blockchain Registration Certificate */}
              {selectedSubmission.registered && (
                <div className="border-t border-[var(--keyline-primary)] pt-4">
                  <div className="cockpit-label mb-3">Registration & Allocation</div>
                  <div className="space-y-2 rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3 text-sm md:p-4">
                    {selectedSubmission.allocation_amount !== null &&
                      selectedSubmission.allocation_amount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="cockpit-text">SYNTH Token Allocation:</span>
                          <span className="cockpit-number">
                            {formatAllocation(selectedSubmission.allocation_amount)}
                          </span>
                        </div>
                      )}
                    {selectedSubmission.registration_tx_hash && (
                      <div>
                        <div className="cockpit-text mb-1">Transaction Hash:</div>
                        <div className="cockpit-text break-all font-mono text-xs">
                          {selectedSubmission.registration_tx_hash}
                        </div>
                      </div>
                    )}
                    {selectedSubmission.registration_date && (
                      <div className="flex items-center justify-between">
                        <span className="cockpit-text">Registered:</span>
                        <span className="cockpit-text">
                          {new Date(selectedSubmission.registration_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedSubmission.stripe_payment_id && (
                      <div className="flex items-center justify-between">
                        <span className="cockpit-text">Payment ID:</span>
                        <span className="cockpit-text font-mono text-xs">
                          {selectedSubmission.stripe_payment_id}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-obsidian)] p-3">
                      <div className="cockpit-label mb-1 text-xs">
                        ✓ On‑chain anchoring recorded
                      </div>
                      <div className="cockpit-text text-xs">
                        This record indicates an optional on‑chain anchoring event was completed and
                        a transaction hash was stored for verification.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
