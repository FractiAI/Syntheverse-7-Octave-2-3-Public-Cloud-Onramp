/**
 * PoC Archive Component
 * Displays My Submissions and All Submissions with scores and status
 * Clickable rows to view details, with register button for qualified PoCs
 */

'use client';

import { useState, useEffect } from 'react';
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
import {
  Loader2,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Link2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { debug, debugError } from '@/utils/debug';

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
  redundancy: number | null; // Redundancy percentage (0-100)
  redundancy_overlap_percent?: number | null;
  qualified: boolean | null;
  qualified_epoch: string | null;
  registered: boolean | null;
  registration_date: string | null;
  registration_tx_hash: string | null;
  stripe_payment_id: string | null;
  allocated: boolean | null;
  allocation_amount: number | null; // Total SYNTH amount recorded (legacy field)
  created_at: string;
  updated_at: string;
  text_content?: string;
  metadata?: any;
  // Note: Field name uses "grok" for database backwards compatibility (refers to Groq AI provider)
  grok_evaluation_details?: {
    base_novelty?: number;
    base_density?: number;
    redundancy_overlap_percent?: number;
    density_penalty_percent?: number;
    full_evaluation?: any;
    raw_grok_response?: string; // Raw Groq API response text/markdown (stored as "grok" for legacy reasons)
  };
}

interface PoCArchiveProps {
  userEmail: string;
}

type ViewMode = 'my' | 'qualified' | 'all';

export function PoCArchive({ userEmail }: PoCArchiveProps) {
  const [allSubmissions, setAllSubmissions] = useState<PoCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<PoCSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const [onChainDialogOpen, setOnChainDialogOpen] = useState(false);
  const [onChainLoading, setOnChainLoading] = useState(false);
  const [onChainData, setOnChainData] = useState<any>(null);
  const [onChainError, setOnChainError] = useState<string | null>(null);

  const mySubmissions = allSubmissions.filter((s) => s.contributor === userEmail);
  const qualifiedSubmissions = allSubmissions.filter((s) => s.qualified === true);
  const otherSubmissions = allSubmissions.filter((s) => s.contributor !== userEmail);

  // Get submissions based on current view mode
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
        await fetchSubmissions();
      } catch (err) {
        console.error('Error loading PoC archive:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load submissions');
          setLoading(false);
        }
      }
    }

    loadData();

    // Check if we're returning from a successful registration
    const params = new URLSearchParams(window.location.search);
    const registrationStatus = params.get('registration');
    const registrationHash = params.get('hash');

    if (registrationStatus === 'success' && registrationHash) {
      // Poll for registration status update (webhook may take a few seconds)
      let pollCount = 0;
      const maxPolls = 20; // Poll for up to 20 seconds (1 second intervals) - webhooks can take time
      let pollInterval: NodeJS.Timeout | null = null;
      let hasAllocation = false;

      const pollForRegistration = async () => {
        pollCount++;

        try {
          // Check registration status endpoint first (faster than fetching all submissions)
          const statusResponse = await fetch(
            `/api/poc/${registrationHash}/registration-status?t=${Date.now()}`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log(`[Poll ${pollCount}/${maxPolls}] Registration status:`, statusData);

            // Check if registered AND has allocation
            if (statusData.registered) {
              // Also check for allocation
              try {
                const allocResponse = await fetch(
                  `/api/allocations/${registrationHash}?t=${Date.now()}`
                );
                if (allocResponse.ok) {
                  const allocData = await allocResponse.json();
                  hasAllocation = allocData.count > 0 && allocData.total_reward > 0;
                  console.log(`[Poll ${pollCount}] Allocation check:`, {
                    hasAllocation,
                    count: allocData.count,
                    total: allocData.total_reward,
                  });
                }
              } catch (allocErr) {
                console.warn(`[Poll ${pollCount}] Error checking allocation:`, allocErr);
              }

              // If registered and we've checked a few times, refresh and stop
              // (allocation might still be processing, but registration is confirmed)
              if (pollCount >= 3) {
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
                // Fetch fresh submission data with cache bust
                await fetchSubmissions();
                // Clean up URL params
                window.history.replaceState({}, '', window.location.pathname);
                console.log(
                  `[Poll] Registration confirmed after ${pollCount} attempts, refreshing dashboard`
                );
                return true; // Signal that registration was confirmed
              }
            }
          } else {
            console.error(
              `[Poll ${pollCount}] Status check failed:`,
              statusResponse.status,
              statusResponse.statusText
            );
          }

          // Fetch all submissions every 2 polls to ensure we get allocation updates
          if (pollCount % 2 === 0) {
            await fetchSubmissions();
          }
        } catch (err) {
          console.error(`[Poll ${pollCount}] Error polling for registration status:`, err);
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          console.warn(
            `[Poll] Stopped polling after ${maxPolls} attempts. Registration may still be processing.`
          );
          // Final refresh attempt with cache bust
          await fetchSubmissions();
          // Clean up URL params even if registration not confirmed yet
          window.history.replaceState({}, '', window.location.pathname);
          return true; // Signal that polling should stop
        }

        return false; // Continue polling
      };

      // Start polling immediately and continue every second
      pollForRegistration(); // Immediate check
      pollInterval = setInterval(async () => {
        const shouldStop = await pollForRegistration();
        if (shouldStop && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }, 1000);

      // Cleanup function to clear interval if component unmounts
      return () => {
        isMounted = false;
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      };
    } else {
      // Cleanup function when not polling
      return () => {
        isMounted = false;
      };
    }
  }, [userEmail]);

  const fetchOnChainPoCs = async () => {
    setOnChainLoading(true);
    setOnChainError(null);
    setOnChainDialogOpen(true);

    try {
      const response = await fetch('/api/blockchain/on-chain-pocs');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to fetch on-chain PoCs');
      }

      setOnChainData(data);
    } catch (error) {
      debugError('PoCArchive', 'Failed to fetch on-chain PoCs', error);
      setOnChainError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setOnChainLoading(false);
    }
  };

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);
    try {
      // Add cache bust parameter to ensure fresh data
      const response = await fetch(`/api/archive/contributions?limit=200&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch contributions' }));
        if (response.status === 401) {
          setError('You must be logged in to view the PoC Archive. Please log in and try again.');
        } else if (response.status === 403) {
          setError('You do not have permission to view the PoC Archive.');
        } else {
          console.error('Archive API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData,
          });
          setError(errorData.error || `Failed to fetch: ${response.status} ${response.statusText}`);
        }
        setAllSubmissions([]); // Set empty array on error
        return;
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.contributions)) {
        console.error('Invalid API response:', data);
        setError('Invalid response format from server');
        setAllSubmissions([]);
        return;
      }

      setAllSubmissions(data.contributions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
      setAllSubmissions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(hash: string) {
    setRegistering(hash);
    try {
      const response = await fetch(`/api/poc/${hash}/register`, {
        method: 'POST',
      });

      // Try to parse response as JSON
      let data: any;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error(`Empty response from server (status: ${response.status})`);
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(
          `Invalid response from server (status: ${response.status}). Please check server logs.`
        );
      }

      // Check if response indicates an error
      if (!response.ok) {
        const errorMessage =
          data.message || data.error || `Failed to initiate registration (${response.status})`;
        const errorType = data.error_type ? ` (${data.error_type})` : '';
        const errorDetails = data.details ? ` - ${data.details}` : '';
        const errorCode = data.errorDetails?.code ? ` [Code: ${data.errorDetails.code}]` : '';
        const revertReason = data.errorDetails?.revertReason
          ? `\nRevert Reason: ${data.errorDetails.revertReason}`
          : '';
        const fullError = `${errorMessage}${errorType}${errorCode}${errorDetails}${revertReason}`;
        console.error('Registration API Error:', {
          status: response.status,
          data,
          fullError,
        });
        throw new Error(fullError);
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
      // Show detailed error in alert
      alert(`Registration Error:\n\n${errorMessage}\n\nCheck browser console for more details.`);
    } finally {
      setRegistering(null);
    }
  }

  async function handleRowClick(submission: PoCSubmission) {
    // Fetch full details including registration info
    try {
      const response = await fetch(`/api/archive/contributions/${submission.submission_hash}`);
      if (response.ok) {
        const details = await response.json();
        // Merge submission with fetched details, ensuring registration fields are included
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
    if (score === null) return 'N/A';
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
      // Use metal color for registered status
      const primaryMetal =
        submission.metals && submission.metals.length > 0
          ? submission.metals[0].toLowerCase()
          : 'copper';
      const metalColors: Record<string, string> = {
        gold: 'bg-yellow-500',
        silver: 'bg-gray-400',
        copper: 'bg-orange-600',
        hybrid: 'bg-blue-500',
      };
      const colorClass = metalColors[primaryMetal] || 'bg-blue-500';
      return (
        <Badge variant="default" className={`${colorClass} text-white`}>
          Registered
        </Badge>
      );
    }
    if (submission.qualified) {
      return (
        <Badge variant="default" className="bg-purple-500">
          Qualified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-500 text-white">
        Not Qualified
      </Badge>
    );
  };

  const getMetalBadges = (metals: string[]) => {
    if (!metals || metals.length === 0) return null;
    return (
      <div className="flex gap-1">
        {metals.map((metal, idx) => {
          const colors: Record<string, string> = {
            gold: 'bg-yellow-500',
            silver: 'bg-gray-400',
            copper: 'bg-orange-600',
          };
          return (
            <Badge
              key={idx}
              variant="outline"
              className={`${colors[metal.toLowerCase()] || 'bg-gray-500'} border-0 text-white`}
            >
              {metal}
            </Badge>
          );
        })}
      </div>
    );
  };

  const getEpochBadge = (epoch: string | null) => {
    if (!epoch) return <span className="text-sm text-muted-foreground">—</span>;

    const epochColors: Record<string, string> = {
      founder: 'bg-yellow-500',
      pioneer: 'bg-gray-400',
      community: 'bg-blue-500',
      ecosystem: 'bg-green-500',
    };

    const epochLower = epoch.toLowerCase();
    const colorClass = epochColors[epochLower] || 'bg-gray-500';

    return (
      <Badge variant="default" className={`${colorClass} capitalize text-white`}>
        {epoch}
      </Badge>
    );
  };

  const renderTable = (submissions: PoCSubmission[], title: string) => {
    if (submissions.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold">Title</th>
                  <th className="p-2 text-left font-semibold">Status</th>
                  <th className="p-2 text-left font-semibold">Epoch</th>
                  <th className="p-2 text-left font-semibold">Metals</th>
                  <th className="p-2 text-right font-semibold">PoC Score</th>
                  <th className="p-2 text-right font-semibold">Novelty</th>
                  <th className="p-2 text-right font-semibold">Density</th>
                  <th className="p-2 text-right font-semibold">Coherence</th>
                  <th className="p-2 text-right font-semibold">Overlap</th>
                  <th className="p-2 text-right font-semibold">SYNTH Allocation</th>
                  <th className="p-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.submission_hash}
                    className="cursor-pointer border-b hover:bg-muted/50"
                    onClick={() => handleRowClick(submission)}
                  >
                    <td className="p-2">
                      <div className="font-medium">{submission.title}</div>
                      {submission.category && (
                        <div className="text-xs capitalize text-muted-foreground">
                          {submission.category}
                        </div>
                      )}
                    </td>
                    <td className="p-2">{getStatusBadge(submission)}</td>
                    <td className="p-2">{getEpochBadge(submission.qualified_epoch)}</td>
                    <td className="p-2">{getMetalBadges(submission.metals)}</td>
                    <td className="p-2 text-right font-mono text-sm">
                      {formatScore(submission.pod_score)}
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      {formatScore(submission.novelty)}
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      {formatScore(submission.density)}
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      {formatScore(submission.coherence)}
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      <span
                        className={
                          submission.redundancy && submission.redundancy > 0
                            ? 'text-green-600'
                            : submission.redundancy && submission.redundancy < 0
                              ? 'text-orange-600'
                              : ''
                        }
                        title={
                          submission.redundancy !== null && submission.redundancy !== undefined
                            ? `${submission.redundancy > 0 ? 'Bonus' : 'Penalty'}: ${submission.redundancy > 0 ? '+' : ''}${submission.redundancy.toFixed(1)}%`
                            : undefined
                        }
                      >
                        {formatRedundancy(submission.redundancy)}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-sm">
                      {formatAllocation(submission.allocation_amount)}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-destructive">{error}</div>
          <Button onClick={fetchSubmissions} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasSubmissions = allSubmissions.length > 0;

  const filteredSubmissions = getFilteredSubmissions();
  const showContributorColumn = viewMode === 'all' || viewMode === 'qualified';

  return (
    <>
      <div className="space-y-6">
        {/* View Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>PoC Submissions Archive</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOnChainPoCs}
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  View On-Chain
                </Button>
                <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button
                variant={viewMode === 'my' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('my')}
              >
                My Submissions
              </Button>
              <Button
                variant={viewMode === 'qualified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('qualified')}
              >
                Qualified Submissions
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                All Submissions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtered Submissions Table */}
        {hasSubmissions && (
          <Card>
            <CardHeader>
              <CardTitle>{getViewTitle()}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No {getViewTitle().toLowerCase()} found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left font-semibold">Title</th>
                        {showContributorColumn && (
                          <th className="p-2 text-left font-semibold">Contributor</th>
                        )}
                        <th className="p-2 text-left font-semibold">Status</th>
                        <th className="p-2 text-left font-semibold">Epoch</th>
                        <th className="p-2 text-left font-semibold">Metals</th>
                        <th className="p-2 text-right font-semibold">PoC Score</th>
                        <th className="p-2 text-right font-semibold">Novelty</th>
                        <th className="p-2 text-right font-semibold">Density</th>
                        <th className="p-2 text-right font-semibold">Coherence</th>
                        <th className="p-2 text-right font-semibold">Overlap</th>
                        <th className="p-2 text-right font-semibold">SYNTH Allocation</th>
                        <th className="p-2 text-left font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr
                          key={submission.submission_hash}
                          className="cursor-pointer border-b hover:bg-muted/50"
                          onClick={() => handleRowClick(submission)}
                        >
                          <td className="p-2">
                            <div className="font-medium">{submission.title}</div>
                            {submission.category && (
                              <div className="text-xs capitalize text-muted-foreground">
                                {submission.category}
                              </div>
                            )}
                          </td>
                          {showContributorColumn && (
                            <td className="p-2 text-sm text-muted-foreground">
                              {submission.contributor}
                            </td>
                          )}
                          <td className="p-2">{getStatusBadge(submission)}</td>
                          <td className="p-2">{getEpochBadge(submission.qualified_epoch)}</td>
                          <td className="p-2">{getMetalBadges(submission.metals)}</td>
                          <td className="p-2 text-right font-mono text-sm">
                            {formatScore(submission.pod_score)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            {formatScore(submission.novelty)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            {formatScore(submission.density)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            {formatScore(submission.coherence)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            <span
                              className={
                                submission.redundancy && submission.redundancy > 0
                                  ? 'text-green-600'
                                  : submission.redundancy && submission.redundancy < 0
                                    ? 'text-orange-600'
                                    : ''
                              }
                              title={
                                submission.redundancy !== null &&
                                submission.redundancy !== undefined
                                  ? `${submission.redundancy > 0 ? 'Bonus' : 'Penalty'}: ${submission.redundancy > 0 ? '+' : ''}${submission.redundancy.toFixed(1)}%`
                                  : undefined
                              }
                            >
                              {formatRedundancy(submission.redundancy)}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            {formatAllocation(submission.allocation_amount)}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!hasSubmissions && (
          <Card>
            <CardHeader>
              <CardTitle>PoC Submissions Archive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <p>No submissions yet</p>
                <p className="mt-2 text-sm">
                  <Link href="/submit" className="text-primary hover:underline">
                    Submit your first contribution
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.title}</DialogTitle>
            <DialogDescription>Submission Details</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Status and Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 text-sm font-semibold">Status</div>
                  {getStatusBadge(selectedSubmission)}
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold">Metals</div>
                  {getMetalBadges(selectedSubmission.metals)}
                </div>
                {selectedSubmission.qualified_epoch && (
                  <div>
                    <div className="mb-2 text-sm font-semibold">Qualified Epoch</div>
                    {getEpochBadge(selectedSubmission.qualified_epoch)}
                  </div>
                )}
              </div>

              {/* Scores */}
              <div>
                <div className="mb-2 text-sm font-semibold">Scores</div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-xs text-muted-foreground">PoC Score</div>
                    <div className="font-mono font-semibold">
                      {formatScore(selectedSubmission.pod_score)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Novelty</div>
                    <div className="font-mono">{formatScore(selectedSubmission.novelty)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Density</div>
                    <div className="font-mono">{formatScore(selectedSubmission.density)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Coherence</div>
                    <div className="font-mono">{formatScore(selectedSubmission.coherence)}</div>
                  </div>
                  {selectedSubmission.alignment !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground">Alignment</div>
                      <div className="font-mono">{formatScore(selectedSubmission.alignment)}</div>
                    </div>
                  )}
                  {selectedSubmission.redundancy !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground">Overlap</div>
                      <div
                        className={`font-mono ${
                          selectedSubmission.redundancy && selectedSubmission.redundancy > 0
                            ? 'text-green-600'
                            : selectedSubmission.redundancy && selectedSubmission.redundancy < 0
                              ? 'text-orange-600'
                              : ''
                        }`}
                      >
                        {formatRedundancy(selectedSubmission.redundancy)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Evaluation Report - Review and Scoring */}
              {selectedSubmission.metadata && (
                <div className="border-t pt-4">
                  <div className="mb-3 text-sm font-semibold">Detailed Evaluation Report</div>
                  <div className="space-y-4 text-sm">
                    {/* Evaluation Review Text */}
                    {selectedSubmission.metadata.redundancy_analysis && (
                      <div className="rounded-lg bg-muted p-3">
                        <div className="mb-2 font-semibold text-muted-foreground">
                          Evaluation Review
                        </div>
                        <div className="whitespace-pre-wrap text-foreground">
                          {selectedSubmission.metadata.redundancy_analysis}
                        </div>
                      </div>
                    )}

                    {/* Metal Justification */}
                    {selectedSubmission.metadata.metal_justification && (
                      <div className="rounded-lg bg-muted p-3">
                        <div className="mb-2 font-semibold text-muted-foreground">
                          Metal Assignment
                        </div>
                        <div className="whitespace-pre-wrap text-foreground">
                          {selectedSubmission.metadata.metal_justification}
                        </div>
                      </div>
                    )}

                    {/* Scoring Breakdown */}
                    {selectedSubmission.metadata.grok_evaluation_details && (
                      <div className="rounded-lg bg-muted p-3">
                        <div className="mb-3 font-semibold text-muted-foreground">
                          Scoring Breakdown
                        </div>
                        <div className="space-y-2 text-sm">
                          {/* Base Scores */}
                          <div className="grid grid-cols-2 gap-3">
                            {selectedSubmission.metadata.grok_evaluation_details.base_novelty !==
                              undefined && (
                              <div className="rounded border bg-background p-2">
                                <div className="mb-1 text-xs text-muted-foreground">
                                  Base Novelty
                                </div>
                                <div className="font-semibold">
                                  {selectedSubmission.metadata.grok_evaluation_details.base_novelty.toLocaleString()}{' '}
                                  / 2,500
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Final: {selectedSubmission.novelty?.toLocaleString() || 'N/A'} /
                                  2,500
                                </div>
                              </div>
                            )}
                            {selectedSubmission.metadata.grok_evaluation_details.base_density !==
                              undefined && (
                              <div className="rounded border bg-background p-2">
                                <div className="mb-1 text-xs text-muted-foreground">
                                  Base Density
                                </div>
                                <div className="font-semibold">
                                  {selectedSubmission.metadata.grok_evaluation_details.base_density.toLocaleString()}{' '}
                                  / 2,500
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Final: {selectedSubmission.density?.toLocaleString() || 'N/A'} /
                                  2,500
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Coherence and Alignment */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded border bg-background p-2">
                              <div className="mb-1 text-xs text-muted-foreground">Coherence</div>
                              <div className="font-semibold">
                                {selectedSubmission.coherence?.toLocaleString() || 'N/A'} / 2,500
                              </div>
                            </div>
                            <div className="rounded border bg-background p-2">
                              <div className="mb-1 text-xs text-muted-foreground">Alignment</div>
                              <div className="font-semibold">
                                {selectedSubmission.alignment?.toLocaleString() || 'N/A'} / 2,500
                              </div>
                            </div>
                          </div>

                          {/* Overlap Effect */}
                          {selectedSubmission.redundancy !== null &&
                            selectedSubmission.redundancy !== 0 && (
                              <div className="border-t pt-2">
                                <div className="mb-2 text-xs text-muted-foreground">
                                  Overlap Effect
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Overlap Impact:</span>
                                    <span
                                      className={`font-semibold ${selectedSubmission.redundancy > 0 ? 'text-green-600' : 'text-orange-600'}`}
                                    >
                                      {selectedSubmission.redundancy > 0 ? '+' : ''}
                                      {selectedSubmission.redundancy.toFixed(1)}%
                                    </span>
                                  </div>
                                  {selectedSubmission.metadata.grok_evaluation_details
                                    .density_penalty_percent !== undefined && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        Density Penalty:
                                      </span>
                                      <span className="font-semibold text-orange-600">
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
                          <div className="border-t pt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-muted-foreground">
                                Final PoC Score
                              </span>
                              <span className="text-lg font-bold">
                                {selectedSubmission.pod_score?.toLocaleString() || 'N/A'} / 10,000
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tokenomics Recommendation */}
                    {selectedSubmission.metadata.tokenomics_recommendation?.allocation_notes && (
                      <div className="rounded-lg bg-muted p-3">
                        <div className="mb-2 font-semibold text-muted-foreground">
                          Allocation Recommendation
                        </div>
                        <div className="whitespace-pre-wrap text-foreground">
                          {selectedSubmission.metadata.tokenomics_recommendation.allocation_notes}
                        </div>
                      </div>
                    )}

                    {/* Founder Certificate */}
                    {selectedSubmission.metadata.founder_certificate && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                        <div className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                          Founder Certificate
                        </div>
                        <div className="whitespace-pre-wrap text-yellow-900 dark:text-yellow-100">
                          {selectedSubmission.metadata.founder_certificate}
                        </div>
                      </div>
                    )}

                    {/* SynthScan™ MRI Evaluation Report */}
                    {(() => {
                      const raw =
                        selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response ||
                        selectedSubmission.metadata.grok_evaluation_details?.full_evaluation
                          ?.raw_grok_response ||
                        '';
                      if (!raw || raw.trim().length === 0) return null;
                      return (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                            View SynthScan™ MRI Evaluation Report
                          </summary>
                          <div className="mt-3 rounded-lg border bg-muted p-4">
                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap font-mono text-sm text-foreground">
                              {raw}
                            </pre>
                          </div>
                        </details>
                      );
                    })()}

                    {/* Fallback to JSON if raw response not available */}
                    {(() => {
                      const raw =
                        selectedSubmission.metadata.grok_evaluation_details?.raw_grok_response ||
                        selectedSubmission.metadata.grok_evaluation_details?.full_evaluation
                          ?.raw_grok_response ||
                        '';
                      if (raw && raw.trim().length > 0) return null;
                      if (!selectedSubmission.metadata.grok_evaluation_details?.full_evaluation)
                        return null;
                      return (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            View Parsed Evaluation (JSON)
                          </summary>
                          <pre className="mt-2 max-h-96 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                            {JSON.stringify(
                              selectedSubmission.metadata.grok_evaluation_details.full_evaluation,
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Contributor</div>
                  <div>{selectedSubmission.contributor}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Category</div>
                  <div className="capitalize">{selectedSubmission.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Submitted</div>
                  <div>{new Date(selectedSubmission.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Hash</div>
                  <div className="break-all font-mono text-xs">
                    {selectedSubmission.submission_hash}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {selectedSubmission.text_content && (
                <div>
                  <div className="mb-2 text-sm font-semibold">Content Preview</div>
                  <div className="max-h-40 overflow-y-auto rounded bg-muted p-3 text-sm text-muted-foreground">
                    {selectedSubmission.text_content.substring(0, 500)}
                    {selectedSubmission.text_content.length > 500 && '...'}
                  </div>
                </div>
              )}

              {/* Blockchain Registration Certificate */}
              {selectedSubmission.registered && (
                <div className="border-t pt-4">
                  <div className="mb-3 text-sm font-semibold">Registration & Allocation</div>
                  <div className="space-y-2 text-sm">
                    {selectedSubmission.allocation_amount !== null &&
                      selectedSubmission.allocation_amount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">SYNTH Token Allocation:</span>
                          <span className="font-mono font-semibold text-foreground">
                            {formatAllocation(selectedSubmission.allocation_amount)}
                          </span>
                        </div>
                      )}
                    {selectedSubmission.registration_tx_hash && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Transaction Hash:</span>
                        <code className="break-all rounded bg-muted px-2 py-1 text-xs">
                          {selectedSubmission.registration_tx_hash}
                        </code>
                      </div>
                    )}
                    {selectedSubmission.registration_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Registered:</span>
                        <span>
                          {new Date(selectedSubmission.registration_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedSubmission.stripe_payment_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Payment ID:</span>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {selectedSubmission.stripe_payment_id}
                        </code>
                      </div>
                    )}
                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                      <div className="mb-1 text-xs font-semibold text-blue-900 dark:text-blue-100">
                        ✓ On‑chain anchoring recorded
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        This record indicates an optional on‑chain anchoring event was completed and
                        a transaction hash was stored for verification.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.contributor === userEmail && (
                <div className="border-t pt-4">
                  {selectedSubmission.qualified && !selectedSubmission.registered && (
                    <Button
                      onClick={() => handleRegister(selectedSubmission.submission_hash)}
                      disabled={registering === selectedSubmission.submission_hash}
                      size="lg"
                      variant="default"
                      className="w-full border-2 border-primary/20 bg-primary py-6 text-lg font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl"
                    >
                      {registering === selectedSubmission.submission_hash ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Registration...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />⚡ Anchor PoC on‑chain
                        </>
                      )}
                    </Button>
                  )}
                  {(selectedSubmission.registered || selectedSubmission.allocated) && (
                    <div className="text-sm text-muted-foreground">PoC is registered.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* On-Chain PoCs Dialog */}
      <Dialog open={onChainDialogOpen} onOpenChange={setOnChainDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              PoCs Registered on Base Mainnet
            </DialogTitle>
            <DialogDescription>
              View and sync PoC registrations from Base Mainnet blockchain
            </DialogDescription>
          </DialogHeader>

          {onChainLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Fetching on-chain PoCs...</span>
            </div>
          )}

          {onChainError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="mt-2 text-red-700">{onChainError}</p>
            </div>
          )}

          {onChainData && !onChainLoading && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">Sync Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <div className="font-medium text-blue-600">On-Chain</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {onChainData.summary.onChainCount}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">In Database</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {onChainData.summary.databaseCount}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-green-600">Synced</div>
                    <div className="text-2xl font-bold text-green-900">
                      {onChainData.summary.syncedCount}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-amber-600">Missing from DB</div>
                    <div className="text-2xl font-bold text-amber-900">
                      {onChainData.summary.missingFromDb}
                    </div>
                  </div>
                </div>
              </div>

              {/* On-Chain Registrations */}
              <div>
                <h3 className="mb-3 font-semibold">On-Chain PoC Registrations</h3>
                {onChainData.onChainRegistrations.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No PoCs found on Base Mainnet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {onChainData.onChainRegistrations.map((reg: any, index: number) => (
                      <div key={index} className="rounded-lg border p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-green-200 bg-green-50 text-green-700"
                              >
                                On-Chain
                              </Badge>
                              <Badge variant="outline">{reg.metal}</Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium">Hash:</span>{' '}
                                <code className="rounded bg-gray-100 px-1 text-xs">
                                  {reg.submissionHash.substring(0, 16)}...
                                </code>
                              </div>
                              <div>
                                <span className="font-medium">Contributor:</span>{' '}
                                {reg.contributorEmail}
                              </div>
                              <div>
                                <span className="font-medium">Block:</span>{' '}
                                {reg.blockNumber.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Timestamp:</span>{' '}
                                {new Date(reg.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <a
                              href={reg.baseScanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              View on BaseScan
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sync Status */}
              {onChainData.syncStatus.missingFromDb.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="mb-2 font-semibold text-amber-900">⚠️ Missing from Database</h3>
                  <p className="mb-2 text-sm text-amber-800">
                    {onChainData.syncStatus.missingFromDb.length} PoC(s) found on-chain but not in
                    database
                  </p>
                  <div className="space-y-1 text-xs text-amber-700">
                    {onChainData.syncStatus.missingFromDb.slice(0, 5).map((m: any, i: number) => (
                      <div key={i} className="font-mono">
                        {m.submissionHash.substring(0, 32)}...
                      </div>
                    ))}
                    {onChainData.syncStatus.missingFromDb.length > 5 && (
                      <div>... and {onChainData.syncStatus.missingFromDb.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {onChainData.syncStatus.missingFromChain.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 font-semibold text-red-900">⚠️ Missing from Blockchain</h3>
                  <p className="mb-2 text-sm text-red-800">
                    {onChainData.syncStatus.missingFromChain.length} PoC(s) marked as registered in
                    database but not found on-chain
                  </p>
                  <div className="space-y-1 text-xs text-red-700">
                    {onChainData.syncStatus.missingFromChain
                      .slice(0, 5)
                      .map((m: any, i: number) => (
                        <div key={i} className="font-mono">
                          {m.submissionHash.substring(0, 32)}...
                        </div>
                      ))}
                    {onChainData.syncStatus.missingFromChain.length > 5 && (
                      <div>... and {onChainData.syncStatus.missingFromChain.length - 5} more</div>
                    )}
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
