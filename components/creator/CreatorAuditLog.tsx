'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  actor_email: string;
  actor_role: string;
  action_type: string;
  action_mode: string | null;
  target_type: string | null;
  target_identifier: string | null;
  affected_count: number | null;
  metadata: any;
  created_at: string;
}

export function CreatorAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/creator/audit-logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="cockpit-panel p-6 border-l-4 border-blue-500">
      <div className="flex items-start gap-3 mb-4">
        <FileText className="h-6 w-6 text-blue-500" />
        <div className="flex-1">
          <div className="cockpit-label mb-2">AUDIT LOG</div>
          <h2 className="cockpit-title text-xl mb-2">Action History</h2>
          <p className="cockpit-text text-sm opacity-80">
            Complete audit trail of all Creator actions. All destructive operations are logged with
            timestamps and metadata.
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="cockpit-text text-center py-8 opacity-60">No audit logs yet</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="cockpit-panel p-4 bg-[var(--cockpit-carbon)] border-l-2 border-blue-500/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="cockpit-title text-sm">{formatActionType(log.action_type)}</span>
                    {log.action_mode && (
                      <Badge variant="outline" className="text-xs">
                        {log.action_mode}
                      </Badge>
                    )}
                    <Badge
                      variant={log.actor_role === 'creator' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {log.actor_role}
                    </Badge>
                  </div>
                  <div className="cockpit-text text-xs opacity-80">
                    Actor: {log.actor_email} • Target: {log.target_identifier || 'N/A'}
                  </div>
                  {log.affected_count !== null && (
                    <div className="cockpit-text text-xs opacity-60">
                      Affected: {log.affected_count} record(s)
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs opacity-60">
                  <Clock className="h-3 w-3" />
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="mt-2">
                  <summary className="cockpit-text text-xs cursor-pointer opacity-60">
                    View metadata
                  </summary>
                  <pre className="cockpit-text text-xs mt-2 p-2 bg-[var(--cockpit-bg)] rounded overflow-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

