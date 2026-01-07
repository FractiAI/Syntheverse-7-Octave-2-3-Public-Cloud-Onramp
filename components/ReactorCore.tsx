/**
 * Reactor Core / Core Instrument Panel
 * Central display for SYNTH token availability
 * Holographic Hydrogen Fractal Frontier Noir styling
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface EpochInfo {
  current_epoch: string;
  epochs: Record<
    string,
    {
      balance: number;
      threshold: number;
      distribution_amount: number;
      distribution_percent: number;
      available_tiers: string[];
    }
  >;
  epoch_metals?: Record<
    string,
    Record<
      string,
      {
        balance: number;
        threshold: number;
        distribution_amount: number;
        distribution_percent: number;
      }
    >
  >;
}

export function ReactorCore() {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEpochInfo();

    const params = new URLSearchParams(window.location.search);
    const registrationStatus = params.get('registration');
    // Back-compat: support both legacy (?financial_alignment=success) and new (?financial_support=success)
    const financialSupportStatus =
      params.get('financial_support') || params.get('financial_alignment');
    const shouldPoll = registrationStatus === 'success' || financialSupportStatus === 'success';

    // Poll for updates after successful registration or ecosystem support payment
    if (shouldPoll) {
      // Show success message
      if (financialSupportStatus === 'success') {
        console.log('✅ Ecosystem support payment successful - polling for status update...');
      }

      // Immediately remove URL params so other widgets don't start their own polling loops.
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('registration');
      newUrl.searchParams.delete('financial_alignment');
      newUrl.searchParams.delete('financial_support');
      newUrl.searchParams.delete('product_id');
      window.history.replaceState({}, '', newUrl.toString());

      let pollCount = 0;
      const maxPolls = 15; // 15 * 2s = 30s
      const pollEveryMs = 2000;
      let inFlight = false;
      let pollTimer: ReturnType<typeof setTimeout> | null = null;

      const poll = async () => {
        if (inFlight) return;
        inFlight = true;
        pollCount++;
        console.log(`Polling for epoch balance update (${pollCount}/${maxPolls})...`);
        try {
          await fetchEpochInfo(true);
        } finally {
          inFlight = false;
        }

        if (pollCount >= maxPolls) {
          await fetchEpochInfo(false);
          console.log('✅ Polling complete - balance should be updated');
          return;
        }

        pollTimer = setTimeout(poll, pollEveryMs);
      };

      poll();

      return () => {
        if (pollTimer) clearTimeout(pollTimer);
      };
    }
  }, []);

  async function fetchEpochInfo(silent = false) {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`/api/tokenomics/epoch-info?t=${Date.now()}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setEpochInfo(data);

        // Debug log to verify balance updates
        if (data.epochs?.founder) {
          console.log('ReactorCore: Epoch info updated', {
            founderBalance: data.epochs.founder.balance,
            totalAvailable: data.epochs
              ? Object.values(data.epochs).reduce(
                  (sum: number, epoch: any) => sum + (epoch.balance || 0),
                  0
                )
              : 0,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds');
        }
        throw fetchErr;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load epoch information';
      setError(errorMessage);
      console.error('Error fetching epoch info:', err);

      if (!silent) {
        setLoading(false);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000_000_000) {
      return `${(tokens / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (tokens >= 1_000_000_000) {
      return `${(tokens / 1_000_000_000).toFixed(2)}B`;
    }
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(2)}M`;
    }
    return tokens.toLocaleString();
  };

  const getOpenEpochs = (): string[] => {
    if (!epochInfo) return [];

    const currentEpoch = (epochInfo.current_epoch || 'founder').toLowerCase().trim();

    if (currentEpoch === 'founder' || !currentEpoch) {
      return ['founder'];
    }

    const epochOrder = ['founder', 'pioneer', 'community', 'ecosystem'];
    const currentIndex = epochOrder.indexOf(currentEpoch);

    if (currentIndex === -1 || currentIndex < 0) {
      return ['founder'];
    }

    return epochOrder.slice(0, currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="reactor-core cockpit-panel">
        <div className="flex min-h-[300px] items-center justify-center gap-4">
          <div className="fractal-spiral"></div>
          <div className="cockpit-text">Initializing reactor core...</div>
        </div>
      </div>
    );
  }

  // If we have stale data, don't hard-fail the whole panel; show a soft warning instead.
  if (error && !epochInfo) {
    return (
      <div className="reactor-core cockpit-panel">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
          <div className="cockpit-label text-red-400">Core Instrument Error</div>
          <div className="cockpit-text text-sm">{error}</div>
          <button onClick={() => fetchEpochInfo()} className="cockpit-lever mt-4">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!epochInfo) {
    return null;
  }

  const openEpochs = getOpenEpochs();
  // Total remaining across ALL epochs (reflects current remaining supply).
  const totalAvailable = Object.values(epochInfo.epochs || {}).reduce((sum: number, e: any) => {
    return sum + (e?.balance || 0);
  }, 0);
  // Liquidity available across currently open epochs only (useful but not the headline number).
  const openEpochAvailable = openEpochs.reduce((sum, epoch) => {
    return sum + (epochInfo.epochs?.[epoch]?.balance || 0);
  }, 0);

  const totalSupplyGold = 45_000_000_000_000;
  const totalSupplySilver = 22_500_000_000_000;
  const totalSupplyCopper = 22_500_000_000_000;
  const totalSupply = totalSupplyGold + totalSupplySilver + totalSupplyCopper;

  return (
    <div className="reactor-core cockpit-panel holographic-depth">
      {/* Header */}
      <div className="mb-6 border-b border-[var(--keyline-primary)] pb-3 md:mb-8 md:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="cockpit-label">CORE INSTRUMENT PANEL</div>
            <div className="cockpit-title mt-2 text-lg leading-tight md:text-3xl">SYNTH 90T ERC-20 MOTHERLODE BLOCKMINE</div>
            <div className="mt-2">
              <div className="cockpit-label mb-1 text-xs">AWARENESS KEY</div>
              <div className="cockpit-text text-xs font-semibold" style={{ opacity: 0.95 }}>
                AWARENESSVERSE v2.0 · Fractal Holographic Hydrogen Awareness · Outcast Hero Story
              </div>
            </div>
            <div
              className="cockpit-text mt-2 border-l-2 border-amber-500 bg-amber-500/10 px-3 py-2 text-xs"
              style={{ color: '#fbbf24' }}
            >
              <strong>ERC-20 BOUNDARY:</strong> SYNTH tokens are internal coordination units for
              protocol accounting only. Not an investment, security, or financial instrument. No
              guaranteed value, no profit expectation, no external exchange planned.
            </div>
            {error ? (
              <div
                className="cockpit-text mt-2 text-xs"
                style={{ opacity: 0.85, color: '#fca5a5' }}
              >
                Live status delayed: {error}. Showing last known values.
              </div>
            ) : null}
          </div>
          <div className="text-right">
            <div className="cockpit-label">Total Supply</div>
            <div className="cockpit-number cockpit-number-medium mt-1">90T SYNTH</div>
            <div className="cockpit-text mt-1 text-xs">
              <span style={{ color: '#ffb84d' }}>Gold 45T</span> ·{' '}
              <span style={{ color: '#94a3b8' }}>Silver 22.5T</span> ·{' '}
              <span style={{ color: '#d97706' }}>Copper 22.5T</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central Display - Available SYNTH */}
      <div className="mb-6 text-center md:mb-8">
        <div className="cockpit-label mb-2">SYNTH 90T MOTHERLODE RESERVE REMAINING</div>
        <div className="cockpit-number cockpit-number-large">{formatTokens(totalAvailable)}</div>
        <div className="cockpit-text mt-2">
          {((totalAvailable / totalSupply) * 100).toFixed(2)}% of total supply
        </div>
        <div className="cockpit-text mt-1 text-xs" style={{ opacity: 0.8 }}>
          Open epoch capacity: {formatTokens(openEpochAvailable)}
        </div>
      </div>

      {/* Epoch Breakdown - Centered */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 max-w-7xl">
          {openEpochs.map((epoch) => {
          const epochData = epochInfo.epochs[epoch];
          if (!epochData) return null;

          const isCurrent = epoch === epochInfo.current_epoch;
          const metalData = epochInfo.epoch_metals?.[epoch] || {};

          return (
            <div
              key={epoch}
              className={`cockpit-module p-4 md:p-6 ${isCurrent ? 'epoch-badge current' : ''}`}
            >
              <div className="cockpit-label mb-2 uppercase">{epoch}</div>
              <div className="cockpit-number cockpit-number-medium mb-1">
                {formatTokens(epochData.balance)}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="border border-[var(--keyline-accent)] p-2">
                  <div className="cockpit-label">Gold</div>
                  <div className="cockpit-text" style={{ color: '#ffb84d' }}>
                    {formatTokens(Number(metalData.gold?.balance || 0))}
                  </div>
                </div>
                <div className="border border-[var(--keyline-accent)] p-2">
                  <div className="cockpit-label">Silver</div>
                  <div className="cockpit-text" style={{ color: '#94a3b8' }}>
                    {formatTokens(Number(metalData.silver?.balance || 0))}
                  </div>
                </div>
                <div className="border border-[var(--keyline-accent)] p-2">
                  <div className="cockpit-label">Copper</div>
                  <div className="cockpit-text" style={{ color: '#d97706' }}>
                    {formatTokens(Number(metalData.copper?.balance || 0))}
                  </div>
                </div>
              </div>
              <div className="cockpit-text text-xs">
                {epochData.distribution_percent.toFixed(1)}% of Motherlode
              </div>
              {isCurrent && (
                <div className="mt-2">
                  <span className="cockpit-badge cockpit-badge-amber text-xs">Active</span>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="mt-6 border-t border-[var(--keyline-primary)] pt-3 md:mt-8 md:pt-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--hydrogen-amber)]"></div>
            <span className="cockpit-text">System Operational</span>
          </div>
          <div className="cockpit-label">Epoch: {epochInfo.current_epoch.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}
