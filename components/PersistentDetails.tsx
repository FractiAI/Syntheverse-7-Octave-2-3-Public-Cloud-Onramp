/**
 * Persistent Details Component
 * A <details> element that remembers its open/closed state in localStorage
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';

interface PersistentDetailsProps {
  storageKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function PersistentDetails({
  storageKey,
  defaultOpen = true,
  children,
  className = '',
}: PersistentDetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load state from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`panel-${storageKey}`);
      if (stored !== null) {
        setIsOpen(stored === 'true');
      }
    }
  }, [storageKey]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`panel-${storageKey}`, String(newState));
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <details open={defaultOpen} className={className}>
        {children}
      </details>
    );
  }

  return (
    <details open={isOpen} onToggle={handleToggle} className={className}>
      {children}
    </details>
  );
}

