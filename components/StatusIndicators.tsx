/**
 * Status Indicators Component
 * Shows Syntheverse component status: Whole Brain AI, SynthScan MRI, PoC Sandbox, ERC-20 MOTHERLODE VAULT
 * Also shows Syntheverse and current sandbox deployment status
 */

'use client';

import { useState, useEffect } from 'react';
import { Brain, Scan, Layers, Network, Box, Radio } from 'lucide-react';

interface ComponentStatus {
  name: string;
  label: string;
  icon: React.ReactNode;
}

const syntheverseComponents: ComponentStatus[] = [
  {
    name: 'awareness-bridge',
    label: 'Awareness Bridge/Router',
    icon: <Radio className="h-3 w-3" />,
  },
  {
    name: 'whole-brain-ai',
    label: 'Whole Brain AI',
    icon: <Brain className="h-3 w-3" />,
  },
  {
    name: 'synthscan-mri',
    label: 'SynthScan MRI',
    icon: <Scan className="h-3 w-3" />,
  },
  {
    name: 'poc-sandbox',
    label: 'PoC Sandbox',
    icon: <Layers className="h-3 w-3" />,
  },
  {
    name: 'erc20-motherlode-vault',
    label: 'ERC-20 MOTHERLODE VAULT',
    icon: <Network className="h-3 w-3" />,
  },
];

interface SandboxInfo {
  id: string;
  name: string;
  synth_activated: boolean;
}

export function StatusIndicators() {
  const [currentSandbox, setCurrentSandbox] = useState<SandboxInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime(); // Initial update
    const timeInterval = setInterval(updateTime, 1000);
    
    // Read selected sandbox from localStorage
    if (typeof window === 'undefined') return () => clearInterval(timeInterval);
    const selectedSandboxId = localStorage.getItem('selectedSandbox') || 'syntheverse';
    
    if (selectedSandboxId === 'syntheverse') {
      // Syntheverse is always deployed
      setCurrentSandbox({
        id: 'syntheverse',
        name: 'Syntheverse',
        synth_activated: true,
      });
      setLoading(false);
    } else {
      // Fetch sandbox info from API
      fetch(`/api/enterprise/sandboxes`)
        .then((res) => res.json())
        .then((data) => {
          const sandbox = data.sandboxes?.find((s: any) => s.id === selectedSandboxId);
          if (sandbox) {
            setCurrentSandbox({
              id: sandbox.id,
              name: sandbox.name,
              synth_activated: sandbox.synth_activated || false,
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching sandbox info:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // Listen for storage changes to update when sandbox is selected
    const handleStorageChange = () => {
      const newSandboxId = localStorage.getItem('selectedSandbox') || 'syntheverse';
      updateSandboxInfo(newSandboxId);
    };

    // Handle custom event from SandboxNavigator
    const handleSandboxChanged = (event: CustomEvent) => {
      const newSandboxId = event.detail?.sandboxId || localStorage.getItem('selectedSandbox') || 'syntheverse';
      updateSandboxInfo(newSandboxId);
    };

    const updateSandboxInfo = (sandboxId: string) => {
      if (sandboxId === 'syntheverse') {
        setCurrentSandbox({
          id: 'syntheverse',
          name: 'Syntheverse',
          synth_activated: true,
        });
      } else {
        fetch(`/api/enterprise/sandboxes`)
          .then((res) => res.json())
          .then((data) => {
            const sandbox = data.sandboxes?.find((s: any) => s.id === sandboxId);
            if (sandbox) {
              setCurrentSandbox({
                id: sandbox.id,
                name: sandbox.name,
                synth_activated: sandbox.synth_activated || false,
              });
            }
          })
          .catch((error) => {
            console.error('Error fetching sandbox info:', error);
          });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      // Listen for custom event that is dispatched when sandbox changes
      window.addEventListener('sandboxChanged', handleSandboxChanged as EventListener);

      return () => {
        clearInterval(timeInterval);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('sandboxChanged', handleSandboxChanged as EventListener);
      };
    }
    
    return () => clearInterval(timeInterval);
  }, [mounted]);

  return (
    <div className="flex flex-wrap items-center gap-3 w-full justify-between bg-black/20 p-2 rounded border border-[#4169E1]/20 shadow-inner">
      {/* System Component Status Lights - NSPFRP v17 FSR layer */}
      <div className="flex items-center gap-3 border-r border-[#4169E1]/30 pr-4">
        <div className="cockpit-label text-[9px] font-black tracking-[0.2em] text-[#4169E1] whitespace-nowrap">
          SYSTEM_FLUX
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* System Components */}
          {syntheverseComponents.map((component) => (
            <div
              key={component.name}
              className="group relative flex items-center gap-1.5"
              title={component.label}
            >
              <div
                className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-green-500"
                style={{ 
                  boxShadow: '0 0 10px #22c55e, 0 0 20px rgba(34, 197, 94, 0.4)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              ></div>
              <div className="hidden items-center gap-1 text-[8px] font-bold text-green-400/80 md:flex uppercase tracking-tighter">
                {component.icon}
                <span className="whitespace-nowrap">{component.label}</span>
              </div>
            </div>
          ))}

          {/* Current Sandbox - Green if deployed */}
          {!loading && currentSandbox && (
            <div
              className="group relative flex items-center gap-1"
              title={`${currentSandbox.name} ${currentSandbox.synth_activated ? '(Deployed)' : '(Not Deployed)'}`}
            >
              <div
                className={`h-3 w-3 flex-shrink-0 rounded-full ${
                  currentSandbox.synth_activated
                    ? 'animate-pulse bg-green-500'
                    : 'bg-gray-500'
                }`}
                style={
                  currentSandbox.synth_activated
                    ? { boxShadow: '0 0 8px #22c55e, 0 0 12px rgba(34, 197, 94, 0.5)' }
                    : { boxShadow: '0 0 4px #6b7280' }
                }
              ></div>
              <div className="hidden items-center gap-1 text-[9px] text-green-400 md:flex">
                <Box className="h-3 w-3" />
                <span className="whitespace-nowrap">{currentSandbox.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local Time & Beta Active Indicator - Far Right */}
      <div className="ml-auto flex items-center gap-2">
        {currentTime && (
          <span className="cockpit-text text-[10px] opacity-70 whitespace-nowrap">
            {currentTime}
          </span>
        )}
        <span className="cockpit-badge cockpit-badge-amber">BETA ACTIVE</span>
      </div>
    </div>
  );
}
