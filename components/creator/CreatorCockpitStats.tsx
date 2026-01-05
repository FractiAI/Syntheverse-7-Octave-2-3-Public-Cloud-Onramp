'use client';

import { useState, useEffect } from 'react';
import { Database, Users, FileText, Link as LinkIcon, Activity, Coins } from 'lucide-react';

interface CockpitStats {
  blockchain: {
    network: string;
    chainId: number;
    registeredPocs: number;
    totalTransactions: number;
    contractAddresses: {
      lens: string;
      synth90t: string;
      vault: string;
    };
  };
  archive: {
    total: number;
    active: number;
    archived: number;
    qualified: number;
    onChain: number;
  };
  users: {
    total: number;
    active: number;
    operators: number;
    deleted: number;
  };
  database: {
    contributions: number;
    allocations: number;
    auditLogs: number;
    enterpriseSandboxes: number;
  };
}

export function CreatorCockpitStats() {
  const [stats, setStats] = useState<CockpitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      // Fetch archive stats
      const archiveRes = await fetch('/api/creator/archive/reset');
      const archiveData = archiveRes.ok ? await archiveRes.json() : null;

      // Fetch user stats
      const usersRes = await fetch('/api/creator/users?limit=1000');
      const usersData = usersRes.ok ? await usersRes.json() : null;

      // Fetch database stats
      const allocationsRes = await fetch('/api/creator/database/allocations?limit=1');
      const allocationsData = allocationsRes.ok ? await allocationsRes.json() : null;
      
      const auditLogsRes = await fetch('/api/creator/database/audit_log?limit=1');
      const auditLogsData = auditLogsRes.ok ? await auditLogsRes.json() : null;
      
      const sandboxesRes = await fetch('/api/creator/database/enterprise_sandboxes?limit=1');
      const sandboxesData = sandboxesRes.ok ? await sandboxesRes.json() : null;

      // Fetch blockchain data
      const blockchainRes = await fetch('/api/creator/blockchain-stats');
      const blockchainData = blockchainRes.ok ? await blockchainRes.json() : null;

      // Calculate stats
      const archiveStats = archiveData?.statistics || {};
      const userPagination = usersData?.pagination || { total: 0 };
      const users = usersData?.users || [];

      const operators = users.filter((u: any) => u.role === 'operator').length;
      const deleted = users.filter((u: any) => u.deleted_at).length;

      setStats({
        blockchain: blockchainData || {
          network: 'Base Mainnet',
          chainId: 8453,
          registeredPocs: archiveStats.registered || 0,
          totalTransactions: blockchainData?.totalTransactions || archiveStats.registered || 0,
          contractAddresses: blockchainData?.contractAddresses || {
            lens: '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
            synth90t: '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
            vault: '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
          },
        },
        archive: {
          total: Object.values(archiveStats.by_status || {}).reduce((sum: number, s: any) => sum + (s.count || 0), 0),
          active: archiveStats.by_status?.find((s: any) => s.status === 'evaluating')?.count || 0,
          archived: archiveStats.archived_resettable || 0,
          qualified: archiveStats.by_status?.find((s: any) => s.status === 'qualified')?.count || 0,
          onChain: archiveStats.registered || 0,
        },
        users: {
          total: userPagination.total || 0,
          active: userPagination.total - deleted,
          operators,
          deleted,
        },
        database: {
          contributions: archiveStats.total || 0,
          allocations: allocationsData?.pagination?.total || 0,
          auditLogs: auditLogsData?.pagination?.total || 0,
          enterpriseSandboxes: sandboxesData?.pagination?.total || 0,
        },
      });
    } catch (error) {
      console.error('Failed to load cockpit stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text">Loading cockpit statistics...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Blockchain Stats */}
      <div className="cockpit-panel p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-2">
          <div className="cockpit-label text-xs flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            BLOCKCHAIN
          </div>
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
        </div>
        <div className="cockpit-title text-lg mb-1">{stats.blockchain.network}</div>
        <div className="cockpit-text text-xs opacity-75 mb-2">Chain ID: {stats.blockchain.chainId}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Registered PoCs:</span>
            <span className="cockpit-number">{stats.blockchain.registeredPocs}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Transactions:</span>
            <span className="cockpit-number">{stats.blockchain.totalTransactions}</span>
          </div>
        </div>
      </div>

      {/* Archive Stats */}
      <div className="cockpit-panel p-4 border-l-4 border-amber-500">
        <div className="flex items-center justify-between mb-2">
          <div className="cockpit-label text-xs flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ARCHIVE
          </div>
        </div>
        <div className="cockpit-title text-lg mb-1">{stats.archive.total}</div>
        <div className="cockpit-text text-xs opacity-75 mb-2">Total Contributions</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Active:</span>
            <span className="cockpit-number">{stats.archive.active}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">On-Chain:</span>
            <span className="cockpit-number text-green-400">{stats.archive.onChain}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Archived:</span>
            <span className="cockpit-number">{stats.archive.archived}</span>
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="cockpit-panel p-4 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-2">
          <div className="cockpit-label text-xs flex items-center gap-2">
            <Users className="h-4 w-4" />
            AUTHORIZED USERS
          </div>
        </div>
        <div className="cockpit-title text-lg mb-1">{stats.users.total}</div>
        <div className="cockpit-text text-xs opacity-75 mb-2">Total Accounts</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Active:</span>
            <span className="cockpit-number">{stats.users.active}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Operators:</span>
            <span className="cockpit-number text-purple-400">{stats.users.operators}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Deleted:</span>
            <span className="cockpit-number text-red-400">{stats.users.deleted}</span>
          </div>
        </div>
      </div>

      {/* Database Stats */}
      <div className="cockpit-panel p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-2">
          <div className="cockpit-label text-xs flex items-center gap-2">
            <Database className="h-4 w-4" />
            DATABASE
          </div>
        </div>
        <div className="cockpit-title text-lg mb-1">{stats.database.contributions}</div>
        <div className="cockpit-text text-xs opacity-75 mb-2">Contributions Table</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Allocations:</span>
            <span className="cockpit-number">{stats.database.allocations}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Audit Logs:</span>
            <span className="cockpit-number">{stats.database.auditLogs}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="cockpit-text opacity-60">Sandboxes:</span>
            <span className="cockpit-number">{stats.database.enterpriseSandboxes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

