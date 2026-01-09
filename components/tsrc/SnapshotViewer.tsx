'use client';

import React from 'react';
import { Database, Check, Copy, ExternalLink, Calendar, Hash, Layers } from 'lucide-react';
import { useState } from 'react';

interface SnapshotViewerProps {
  snapshotId: string;
  itemCount?: number;
  createdAt?: string;
  contentHash?: string;
  promptHash?: string;
  modelVersion?: string;
  temperature?: number;
  variant?: 'compact' | 'full' | 'inline';
  showReproducibilityBadge?: boolean;
}

/**
 * SnapshotViewer - Displays TSRC content-addressed snapshot information
 * 
 * Automatically shows snapshot details for deterministic, auditable evaluations.
 * Users don't need to do anything - snapshots are created automatically.
 */
export function SnapshotViewer({
  snapshotId,
  itemCount,
  createdAt,
  contentHash,
  promptHash,
  modelVersion,
  temperature,
  variant = 'compact',
  showReproducibilityBadge = true
}: SnapshotViewerProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateHash = (hash: string, length: number = 12) => {
    return hash.length > length ? `${hash.slice(0, length)}...` : hash;
  };

  // Inline variant - just the snapshot ID badge
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-xs">
        <Database className="w-3 h-3 text-cyan-400" />
        <span className="text-cyan-300 font-mono">{truncateHash(snapshotId, 8)}</span>
        <button
          onClick={() => copyToClipboard(snapshotId)}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // Compact variant - single line with key info
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
        <Database className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2 text-xs">
          <span className="text-gray-400">Snapshot:</span>
          <span className="text-cyan-300 font-mono">{truncateHash(snapshotId)}</span>
          <button
            onClick={() => copyToClipboard(snapshotId)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {showReproducibilityBadge && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/40 rounded-md">
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-green-300 text-xs font-medium">Reproducible</span>
          </div>
        )}
      </div>
    );
  }

  // Full variant - detailed card with all metadata
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-cyan-500/30 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-300">Content-Addressed Snapshot</h3>
            <p className="text-xs text-gray-400 mt-0.5">Immutable archive state for reproducibility</p>
          </div>
        </div>
        {showReproducibilityBadge && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/20 border border-green-500/40 rounded-lg">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-xs font-semibold">Reproducible</span>
          </div>
        )}
      </div>

      {/* Snapshot ID */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Hash className="w-3 h-3" />
          <span>Snapshot ID</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 bg-black/30 border border-cyan-500/20 rounded-lg">
          <span className="text-cyan-300 font-mono text-xs flex-1 break-all">{snapshotId}</span>
          <button
            onClick={() => copyToClipboard(snapshotId)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3">
        {itemCount !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Layers className="w-3 h-3" />
              <span>Archive Items</span>
            </div>
            <div className="text-sm font-semibold text-cyan-300">{itemCount.toLocaleString()}</div>
          </div>
        )}

        {createdAt && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Created</span>
            </div>
            <div className="text-sm font-semibold text-cyan-300">
              {new Date(createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {temperature !== undefined && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Temperature</div>
            <div className="text-sm font-semibold text-cyan-300">{temperature.toFixed(1)}</div>
          </div>
        )}

        {modelVersion && (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Model Version</div>
            <div className="text-sm font-semibold text-cyan-300 truncate">{modelVersion}</div>
          </div>
        )}
      </div>

      {/* Hashes */}
      {(contentHash || promptHash) && (
        <div className="space-y-2 pt-2 border-t border-cyan-500/20">
          {contentHash && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Content Hash (SHA-256)</div>
              <div className="text-xs font-mono text-cyan-300/70 break-all">{contentHash}</div>
            </div>
          )}
          {promptHash && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Prompt Hash (SHA-256)</div>
              <div className="text-xs font-mono text-cyan-300/70 break-all">{promptHash}</div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/90 leading-relaxed">
          This snapshot creates a permanent, content-addressed binding to the exact archive state used for evaluation. 
          Any evaluation with the same snapshot ID is guaranteed to be reproducible.
        </p>
      </div>
    </div>
  );
}

