'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Link as LinkIcon,
  Database,
  Archive,
  Settings,
  Eye,
  Edit,
  Trash2,
  Shield,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { CreatorArchiveManagement } from './CreatorArchiveManagement';
import { CreatorUserManagement } from './CreatorUserManagement';
import { CreatorAuditLog } from './CreatorAuditLog';
import { SynthChat } from '@/components/SynthChat';
import { BlogPostCreator } from '@/components/BlogPostCreator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type NavigationTab = 'archive' | 'users' | 'blockchain' | 'database' | 'chat' | 'blog';

export function CreatorCockpitNavigation() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('archive');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'archive' as NavigationTab, label: 'PoC Archive', icon: Archive, color: 'amber' },
    { id: 'users' as NavigationTab, label: 'Operators', icon: Users, color: 'purple' },
    { id: 'blockchain' as NavigationTab, label: 'On-Chain Proofs', icon: LinkIcon, color: 'blue' },
    { id: 'database' as NavigationTab, label: 'System', icon: Database, color: 'green' },
    { id: 'chat' as NavigationTab, label: 'Chat', icon: MessageCircle, color: 'cyan' },
    { id: 'blog' as NavigationTab, label: 'Blog', icon: FileText, color: 'amber' },
  ];

  return (
    <div className="cockpit-panel p-6">
      {/* Navigation Header */}
      <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
        <div className="cockpit-label mb-2">CONTROL PANELS</div>
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cockpit-lever inline-flex items-center gap-2 px-4 py-2 text-sm ${
                  isActive
                    ? `border-${tab.color}-500 bg-${tab.color}-500/10 text-${tab.color}-400`
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: `var(--${tab.color === 'amber' ? 'hydrogen-amber' : tab.color === 'purple' ? 'purple-500' : tab.color === 'blue' ? 'blue-500' : tab.color === 'green' ? 'green-500' : 'cyan-500'})`,
                        backgroundColor: `rgba(${tab.color === 'amber' ? '255,184,77' : tab.color === 'purple' ? '147,51,234' : tab.color === 'blue' ? '59,130,246' : tab.color === 'green' ? '34,197,94' : '6,182,212'}, 0.1)`,
                        color: `var(--${tab.color === 'amber' ? 'hydrogen-amber' : tab.color === 'purple' ? 'purple-400' : tab.color === 'blue' ? 'blue-400' : tab.color === 'green' ? 'green-400' : 'cyan-400'})`,
                      }
                    : {}
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform opacity-50" />
          <Input
            placeholder={`Search ${activeTab === 'archive' ? 'PoCs' : activeTab === 'users' ? 'operators' : activeTab === 'blockchain' ? 'on-chain proofs' : activeTab === 'chat' ? 'chat rooms' : 'system data'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cockpit-input pl-10"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'archive' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <Archive className="h-4 w-4" />
              PoC ARCHIVE MANAGEMENT
            </div>
            <CreatorArchiveManagement />
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              AUTHORIZED USER MANAGEMENT
            </div>
            <CreatorUserManagement />
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              BASE MAINNET SYNTHEVERSE CONTENTS
            </div>
            <BlockchainContentPanel />
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <Database className="h-4 w-4" />
              DATABASE NAVIGATION & EDIT/RESET
            </div>
            <DatabaseNavigationPanel />
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              SYNTHCHAT - COLLABORATIVE SANDBOX CHAT
            </div>
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-0 overflow-hidden">
              <SynthChat embedded={true} />
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              BLOG POST CREATOR
            </div>
            <BlogCreatorPanel />
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCreatorPanel() {
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="space-y-4">
      {!showCreator ? (
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-6">
          <div className="cockpit-label mb-4">CREATE BLOG POST</div>
          <p className="cockpit-text mb-4 text-sm opacity-80">
            Create blog posts for the main Syntheverse blog. Posts can be published immediately or saved as drafts.
          </p>
          <Button onClick={() => setShowCreator(true)} className="cockpit-lever">
            <FileText className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
          <div className="mt-4">
            <a href="/blog" className="cockpit-lever inline-block text-sm">
              View Blog →
            </a>
          </div>
        </div>
      ) : (
        <BlogPostCreator
          sandboxId={null}
          onSave={() => {
            setShowCreator(false);
          }}
          onCancel={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}

function BlockchainContentPanel() {
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onChainPocs, setOnChainPocs] = useState<any[]>([]);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  async function loadBlockchainData() {
    try {
      // Fetch on-chain PoCs
      const res = await fetch('/api/creator/blockchain-contents');
      if (res.ok) {
        const data = await res.json();
        setBlockchainData(data);
        setOnChainPocs(data?.onChainPocs || []);
      }
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="cockpit-text">Loading Base Mainnet contents...</div>;
  }

  const lensAddress = '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8';
  const synthAddress = '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3';
  const vaultAddress = '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3';

  return (
    <div className="space-y-4">
      <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
        <div className="cockpit-label mb-3 text-xs">CONTRACT ADDRESSES</div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded bg-[var(--cockpit-bg)] p-2">
            <span className="cockpit-text opacity-60">Lens Kernel:</span>
            <div className="flex items-center gap-2">
              <code className="cockpit-text font-mono text-xs">
                {lensAddress.slice(0, 10)}...{lensAddress.slice(-8)}
              </code>
              <a
                href={`https://basescan.org/address/${lensAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between rounded bg-[var(--cockpit-bg)] p-2">
            <span className="cockpit-text opacity-60">SYNTH90T:</span>
            <div className="flex items-center gap-2">
              <code className="cockpit-text font-mono text-xs">
                {synthAddress.slice(0, 10)}...{synthAddress.slice(-8)}
              </code>
              <a
                href={`https://basescan.org/address/${synthAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between rounded bg-[var(--cockpit-bg)] p-2">
            <span className="cockpit-text opacity-60">MOTHERLODE VAULT:</span>
            <div className="flex items-center gap-2">
              <code className="cockpit-text font-mono text-xs">
                {vaultAddress.slice(0, 10)}...{vaultAddress.slice(-8)}
              </code>
              <a
                href={`https://basescan.org/address/${vaultAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
        <div className="cockpit-label mb-3 text-xs">ON-CHAIN PoCs</div>
        <div className="cockpit-text mb-4 text-sm opacity-75">
          Registered contributions on Base Mainnet. All on-chain PoCs are permanent and cannot be
          deleted.
        </div>
        {onChainPocs.length > 0 ? (
          <div className="space-y-2">
            {onChainPocs.map((poc: any) => (
              <div
                key={poc.submission_hash}
                className="flex items-center justify-between rounded bg-[var(--cockpit-bg)] p-3"
              >
                <div>
                  <div className="cockpit-text text-sm">{poc.title}</div>
                  <div className="cockpit-text font-mono text-xs opacity-60">
                    {poc.registration_tx_hash?.slice(0, 16)}...
                  </div>
                </div>
                <a
                  href={`https://basescan.org/tx/${poc.registration_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="cockpit-text py-4 text-center text-sm opacity-60">
            No on-chain PoCs yet. PoCs will appear here after registration.
          </div>
        )}
      </div>
    </div>
  );
}

function DatabaseNavigationPanel() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const tables = [
    { name: 'contributions', label: 'Contributions', count: 0 },
    { name: 'users_table', label: 'Users', count: 0 },
    { name: 'allocations', label: 'Allocations', count: 0 },
    { name: 'audit_log', label: 'Audit Log', count: 0 },
    { name: 'enterprise_sandboxes', label: 'Enterprise Sandboxes', count: 0 },
    { name: 'enterprise_contributions', label: 'Enterprise Contributions', count: 0 },
  ];

  async function loadTableData(tableName: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/creator/database/${tableName}?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data.rows || []);
        setSelectedTable(tableName);
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-3 text-xs">DATABASE TABLES</div>
          <div className="space-y-2 text-sm">
            {tables.map((table) => (
              <div
                key={table.name}
                className="flex items-center justify-between rounded bg-[var(--cockpit-bg)] p-2 transition-colors hover:bg-[var(--cockpit-carbon)]"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 opacity-50" />
                  <span className="cockpit-text">{table.label}</span>
                  <span className="cockpit-text font-mono text-xs opacity-40">({table.name})</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="cockpit-lever text-xs"
                  onClick={() => loadTableData(table.name)}
                  disabled={loading}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="cockpit-panel border-l-4 border-red-500 bg-[var(--cockpit-carbon)] p-4">
          <div className="cockpit-label mb-3 text-xs text-red-400">DATABASE OPERATIONS</div>
          <div className="space-y-2">
            <div className="cockpit-text rounded bg-[var(--cockpit-bg)] p-3 text-xs opacity-80">
              <strong>Note:</strong> All destructive operations require confirmation phrases and are
              logged in the audit_log table. Use the <strong>Archive</strong> tab above for archive resets.
            </div>
          </div>
        </div>
      </div>

      {/* Table Data Viewer */}
      {selectedTable && (
        <div className="cockpit-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="cockpit-label text-xs">
              TABLE: {selectedTable.toUpperCase()} ({tableData.length} rows)
            </div>
            <Button
              size="sm"
              variant="outline"
              className="cockpit-lever text-xs"
              onClick={() => {
                setSelectedTable(null);
                setTableData([]);
              }}
            >
              Close
            </Button>
          </div>
          {loading ? (
            <div className="cockpit-text py-8 text-center">Loading table data...</div>
          ) : tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--keyline-primary)]">
                    {Object.keys(tableData[0]).map((key) => (
                      <th key={key} className="cockpit-label p-2 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(0, 50).map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-[var(--keyline-primary)]/50 border-b hover:bg-[var(--cockpit-carbon)]"
                    >
                      {Object.values(row).map((value: any, colIdx) => (
                        <td key={colIdx} className="cockpit-text p-2">
                          {typeof value === 'object' ? (
                            <code className="text-xs opacity-60">
                              {JSON.stringify(value).slice(0, 50)}...
                            </code>
                          ) : (
                            String(value || '').slice(0, 100)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableData.length > 50 && (
                <div className="cockpit-text mt-2 text-center text-xs opacity-60">
                  Showing first 50 of {tableData.length} rows
                </div>
              )}
            </div>
          ) : (
            <div className="cockpit-text py-8 text-center opacity-60">No data available</div>
          )}
        </div>
      )}

      {/* Audit Log Viewer */}
      <div className="cockpit-panel p-4">
        <div className="cockpit-label mb-3 text-xs">AUDIT LOG VIEWER</div>
        <CreatorAuditLog />
      </div>
    </div>
  );
}
