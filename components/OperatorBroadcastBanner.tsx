/**
 * Operator Broadcast Banner
 * Displays important messages from the SYNTH90T MOTHERLODE BLOCKMINE operator
 * Dismissible with localStorage persistence
 * Now supports both hardcoded messages (backward compatibility) and API-fetched broadcasts
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type MessageNature =
  | 'announcement'
  | 'warning'
  | 'info'
  | 'success'
  | 'milestone'
  | 'alert'
  | 'update';

interface Broadcast {
  id: string;
  message: string;
  nature: MessageNature;
}

interface OperatorBroadcastBannerProps {
  message?: string; // Optional: for backward compatibility with hardcoded messages
  nature?: MessageNature;
  urgency?: 'low' | 'medium' | 'high' | 'critical'; // Fallback if nature not provided
  storageKey?: string;
}

export function OperatorBroadcastBanner({
  message: propMessage,
  nature: propNature,
  urgency = 'medium',
  storageKey: propStorageKey,
}: OperatorBroadcastBannerProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [propVisible, setPropVisible] = useState(false);
  const [propDismissed, setPropDismissed] = useState(false);

  // Handle prop-based message (backward compatibility)
  useEffect(() => {
    if (propMessage) {
      const storageKey = propStorageKey || 'operator_broadcast_dismissed';
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setPropVisible(true);
      }
    }
  }, [propMessage, propStorageKey]);

  // Fetch broadcasts from API if no prop message
  useEffect(() => {
    if (propMessage) {
      return; // Don't fetch if using prop message
    }

    const fetchBroadcasts = async () => {
      try {
        const response = await fetch('/api/broadcasts');
        if (response.ok) {
          const data = await response.json();
          setBroadcasts(data.broadcasts || []);
        }
      } catch (err) {
        console.error('Failed to fetch broadcasts:', err);
      }
    };

    fetchBroadcasts();
  }, [propMessage]);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    if (propMessage) {
      return; // Don't load dismissed IDs for prop messages
    }

    const dismissed = new Set<string>();
    broadcasts.forEach((broadcast) => {
      const key = `broadcast_dismissed_${broadcast.id}`;
      if (localStorage.getItem(key)) {
        dismissed.add(broadcast.id);
      }
    });
    setDismissedIds(dismissed);
  }, [broadcasts, propMessage]);

  const handlePropDismiss = () => {
    setPropVisible(false);
    setPropDismissed(true);
    const storageKey = propStorageKey || 'operator_broadcast_dismissed';
    localStorage.setItem(storageKey, 'true');
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    localStorage.setItem(`broadcast_dismissed_${id}`, 'true');
  };

  // Render prop-based message (backward compatibility)
  if (propMessage) {
    if (propDismissed || !propVisible) {
      return null;
    }
    return renderBanner(propMessage, propNature || 'info', handlePropDismiss);
  }

  // Filter out dismissed broadcasts
  const activeBroadcasts = broadcasts.filter((b) => !dismissedIds.has(b.id));

  // Don't render if no active broadcasts
  if (activeBroadcasts.length === 0) {
    return null;
  }

  // Render all active broadcasts
  return (
    <>
      {activeBroadcasts.map((broadcast) =>
        renderBanner(
          broadcast.message,
          broadcast.nature,
          () => handleDismiss(broadcast.id),
          broadcast.id
        )
      )}
    </>
  );
}

function renderBanner(
  message: string,
  nature: MessageNature,
  onDismiss: () => void,
  key?: string
) {
  const styles = getMessageStyles(nature);

  return (
    <div
      key={key}
      className={`${styles.bg} ${styles.border} border-l-4 ${styles.glow} ${styles.pulse} cockpit-panel relative mb-6 p-4 transition-all duration-300 opacity-100`}
    >
      <div className="flex items-start gap-4">
        {/* Dismiss Button - Left Side */}
        <button
          onClick={onDismiss}
          className={`${styles.icon} mt-0.5 flex-shrink-0 opacity-70 transition-opacity hover:opacity-100`}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Message Content */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`${styles.bg} ${styles.border} cockpit-label rounded border px-3 py-1.5 text-xs font-bold uppercase tracking-wider`}
            >
              SYSTEM BROADCAST
            </div>
            <div className={`h-2 w-2 rounded-full ${styles.icon.replace('text-', 'bg-')}`}></div>
          </div>
          <div className={`${styles.text} cockpit-text text-sm leading-relaxed`}>{message}</div>
        </div>
      </div>
    </div>
  );
}

function getMessageStyles(nature: MessageNature) {
  // Color coding based on message nature
  switch (nature) {
    case 'announcement':
      return {
        bg: 'bg-gradient-to-r from-amber-900/60 to-orange-900/60',
        border: 'border-amber-500',
        text: 'text-amber-200',
        icon: 'text-amber-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        pulse: '',
      };
    case 'milestone':
      return {
        bg: 'bg-gradient-to-r from-yellow-900/60 to-amber-900/60',
        border: 'border-yellow-500',
        text: 'text-yellow-200',
        icon: 'text-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
        pulse: '',
      };
    case 'warning':
      return {
        bg: 'bg-gradient-to-r from-orange-900/60 to-red-900/60',
        border: 'border-orange-500',
        text: 'text-orange-200',
        icon: 'text-orange-400',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
        pulse: '',
      };
    case 'alert':
      return {
        bg: 'bg-gradient-to-r from-red-900/70 to-red-800/70',
        border: 'border-red-500',
        text: 'text-red-200',
        icon: 'text-red-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
        pulse: '',
      };
    case 'success':
      return {
        bg: 'bg-gradient-to-r from-green-900/60 to-emerald-900/60',
        border: 'border-green-500',
        text: 'text-green-200',
        icon: 'text-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        pulse: '',
      };
    case 'info':
      return {
        bg: 'bg-gradient-to-r from-blue-900/60 to-cyan-900/60',
        border: 'border-blue-500',
        text: 'text-blue-200',
        icon: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        pulse: '',
      };
    case 'update':
      return {
        bg: 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60',
        border: 'border-cyan-500',
        text: 'text-cyan-200',
        icon: 'text-cyan-400',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
        pulse: '',
      };
    default:
      return {
        bg: 'bg-[var(--hydrogen-amber)]/10',
        border: 'border-[var(--hydrogen-amber)]/50',
        text: 'text-[var(--hydrogen-amber)]',
        icon: 'text-[var(--hydrogen-amber)]',
        glow: 'shadow-[0_0_20px_rgba(255,184,77,0.2)]',
        pulse: '',
      };
  }
}
