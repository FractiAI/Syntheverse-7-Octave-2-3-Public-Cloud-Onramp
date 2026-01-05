/**
 * Audit logging utility for tracking destructive actions
 */

import { db } from '@/utils/db/db';
import { auditLogTable } from '@/utils/db/schema';
import crypto from 'crypto';
import { CREATOR_EMAIL, getUserRole } from '@/utils/auth/permissions';

export type AuditActionType =
  | 'archive_reset_soft'
  | 'archive_reset_hard'
  | 'user_delete_soft'
  | 'user_delete_hard'
  | 'role_grant'
  | 'role_revoke';

export interface AuditLogMetadata {
  confirmation_phrase?: string;
  ip_address?: string;
  user_agent?: string;
  affected_hashes?: string[];
  previous_role?: string;
  new_role?: string;
  [key: string]: any;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  actorEmail: string,
  actionType: AuditActionType,
  targetType: 'archive' | 'user' | 'role',
  targetIdentifier: string,
  affectedCount: number,
  metadata?: AuditLogMetadata
): Promise<void> {
  try {
    const actorRole = await getUserRole(actorEmail);
    const actionMode = actionType.includes('soft')
      ? 'soft'
      : actionType.includes('hard')
        ? 'hard'
        : null;

    await db.insert(auditLogTable).values({
      id: crypto.randomUUID(),
      actor_email: actorEmail.toLowerCase(),
      actor_role: actorRole,
      action_type: actionType,
      action_mode: actionMode,
      target_type: targetType,
      target_identifier: targetIdentifier,
      affected_count: affectedCount,
      metadata: metadata || {},
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging failures shouldn't break the operation
  }
}

/**
 * Get audit logs (Creator only)
 * Note: This function is primarily used by API routes, not directly by components
 */
export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0,
  actionType?: AuditActionType
) {
  const { db: dbClient } = await import('@/utils/db/db');
  const { auditLogTable } = await import('@/utils/db/schema');
  const { desc, eq } = await import('drizzle-orm');

  let query = dbClient.select().from(auditLogTable).orderBy(desc(auditLogTable.created_at));

  if (actionType) {
    query = query.where(eq(auditLogTable.action_type, actionType)) as any;
  }

  return query.limit(limit).offset(offset);
}
