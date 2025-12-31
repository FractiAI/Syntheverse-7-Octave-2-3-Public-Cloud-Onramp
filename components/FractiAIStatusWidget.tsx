'use client'

import { useEffect, useMemo, useState } from 'react'

type EpochInfo = {
  current_epoch: string
  epochs: Record<
    string,
    {
      balance: number
      threshold: number
      distribution_amount: number
      distribution_percent: number
      available_tiers: string[]
    }
  >
  epoch_metals?: Record<
    string,
    Record<
      string,
      {
        balance: number
        threshold: number
        distribution_amount: number
        distribution_percent: number
      }
    >
  >
}

type Qualifier = {
  submission_hash: string
  title: string
  contributor: string
  metals: string[] | null
  pod_score: number | null
  qualified_epoch: string | null
  created_at: string
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000_000) return `${(tokens / 1_000_000_000_000).toFixed(2)}T`
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(2)}B`
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`
  return tokens.toLocaleString()
}

function getOpenEpochs(currentEpochRaw: string | undefined | null): string[] {
  const currentEpoch = String(currentEpochRaw || 'founder')
    .toLowerCase()
    .trim()
  const epochOrder = ['founder', 'pioneer', 'community', 'ecosystem']
  const idx = epochOrder.indexOf(currentEpoch)
  if (idx <= 0) return ['founder']
  return epochOrder.slice(0, idx + 1)
}

function maskContributor(contributor: string): string {
  if (!contributor) return 'contributor'
  const at = contributor.indexOf('@')
  if (at > 1) return `${contributor.slice(0, at)}@…`
  if (contributor.length <= 8) return contributor
  return `${contributor.slice(0, 6)}…`
}

export default function FractiAIStatusWidget({ limit = 6 }: { limit?: number }) {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)
  const [qualifiers, setQualifiers] = useState<Qualifier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalSupply = 90_000_000_000_000

  const computed = useMemo(() => {
    const epochs = epochInfo?.epochs || {}
    const totalAvailable = Object.values(epochs).reduce((sum, e) => sum + (Number(e?.balance || 0) || 0), 0)
    const openEpochs = getOpenEpochs(epochInfo?.current_epoch)
    const openEpochAvailable = openEpochs.reduce((sum, epoch) => sum + (Number(epochs?.[epoch]?.balance || 0) || 0), 0)
    return { totalAvailable, openEpochs, openEpochAvailable }
  }, [epochInfo])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [epochRes, qualRes] = await Promise.all([
        fetch(`/api/tokenomics/epoch-info?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/public/qualifiers?limit=${encodeURIComponent(String(limit))}&t=${Date.now()}`, { cache: 'no-store' }),
      ])

      if (!epochRes.ok) throw new Error(`Epoch info failed: ${epochRes.status}`)
      if (!qualRes.ok) throw new Error(`Qualifiers failed: ${qualRes.status}`)

      const [epochJson, qualJson] = await Promise.all([epochRes.json(), qualRes.json()])
      setEpochInfo(epochJson)
      setQualifiers(Array.isArray(qualJson?.items) ? qualJson.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="cockpit-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="cockpit-label">FRONTIER STATUS</div>
          <div className="cockpit-title mt-2 text-2xl">Live SYNTH + Open Epochs</div>
        </div>
      </div>

      {loading ? (
        <div className="cockpit-text mt-4 text-sm" style={{ opacity: 0.85 }}>
          Loading live status…
        </div>
      ) : error ? (
        <div className="cockpit-text mt-4 text-sm text-red-300">{error}</div>
      ) : (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="cockpit-module p-4">
              <div className="cockpit-label">SYNTH Available</div>
              <div className="cockpit-number cockpit-number-medium mt-1">{formatTokens(computed.totalAvailable)}</div>
              <div className="cockpit-text text-xs mt-1" style={{ opacity: 0.85 }}>
                {((computed.totalAvailable / totalSupply) * 100).toFixed(2)}% of total supply
              </div>
            </div>
            <div className="cockpit-module p-4">
              <div className="cockpit-label">Open Epochs</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {computed.openEpochs.map((e) => (
                  <span key={e} className="cockpit-badge">
                    {e.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="cockpit-text text-xs mt-2" style={{ opacity: 0.85 }}>
                Open epoch capacity: {formatTokens(computed.openEpochAvailable)}
              </div>
            </div>
          </div>

          <div className="cockpit-module p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="cockpit-label">Most Recent PoC Qualifiers</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.85 }}>
                rolling feed
              </div>
            </div>

            {qualifiers.length === 0 ? (
              <div className="cockpit-text text-sm mt-3" style={{ opacity: 0.85 }}>
                No recent qualifiers found yet.
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                {qualifiers.map((q) => (
                  <div key={q.submission_hash} className="flex items-start justify-between gap-4 border border-[var(--keyline-accent)] p-3">
                    <div className="min-w-0">
                      <div className="cockpit-text text-sm font-medium truncate">{q.title || 'Untitled PoC'}</div>
                      <div className="cockpit-text text-xs mt-1" style={{ opacity: 0.85 }}>
                        {maskContributor(q.contributor)} · {q.submission_hash.slice(0, 10)}…
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.qualified_epoch ? (
                          <span className="cockpit-badge">{q.qualified_epoch.toUpperCase()}</span>
                        ) : null}
                        {typeof q.pod_score === 'number' ? (
                          <span className="cockpit-badge">PoC {Math.round(q.pod_score)}</span>
                        ) : null}
                        {(q.metals || []).map((m) => (
                          <span key={m} className="cockpit-badge">
                            {String(m).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="cockpit-text text-xs whitespace-nowrap" style={{ opacity: 0.75 }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


