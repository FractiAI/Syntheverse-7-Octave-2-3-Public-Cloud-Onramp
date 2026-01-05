/**
 * Permission utilities for Creator/Operator/User role checking
 *
 * Roles:
 * - Creator: info@fractiai.com (hard-coded)
 * - Operator: Users with role='operator' in database
 * - User: Standard users (default)
 */

import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Hard-coded Creator email
export const CREATOR_EMAIL = 'info@fractiai.com';

export type UserRole = 'creator' | 'operator' | 'user';

/**
 * Get the current user's role from database
 */
export async function getUserRole(email: string): Promise<UserRole> {
  if (!email) {
    return 'user';
  }

  // Creator is hard-coded
  if (email.toLowerCase() === CREATOR_EMAIL.toLowerCase()) {
    return 'creator';
  }

  // Check database for operator role
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (users.length > 0) {
      const role = users[0].role as string;
      if (role === 'operator' || role === 'creator') {
        return role as UserRole;
      }
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
  }

  return 'user';
}

/**
 * Check if current user is Creator
 */
export async function isCreator(email?: string): Promise<boolean> {
  if (!email) {
    return false;
  }
  return email.toLowerCase() === CREATOR_EMAIL.toLowerCase();
}

/**
 * Check if current user is Operator or Creator
 */
export async function isOperatorOrCreator(email?: string): Promise<boolean> {
  if (!email) {
    return false;
  }
  const role = await getUserRole(email);
  return role === 'operator' || role === 'creator';
}

/**
 * Get authenticated user and their role
 */
export async function getAuthenticatedUserWithRole(): Promise<{
  user: { email: string; id: string } | null;
  role: UserRole;
  isCreator: boolean;
  isOperator: boolean;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return {
      user: null,
      role: 'user',
      isCreator: false,
      isOperator: false,
    };
  }

  const role = await getUserRole(user.email);
  const isCreatorRole = role === 'creator';
  const isOperatorRole = role === 'operator' || isCreatorRole;

  return {
    user: { email: user.email, id: user.id },
    role,
    isCreator: isCreatorRole,
    isOperator: isOperatorRole,
  };
}

/**
 * Require Creator role - throws error if not Creator
 */
export async function requireCreator(email?: string): Promise<void> {
  const isCreatorUser = await isCreator(email);
  if (!isCreatorUser) {
    throw new Error('Unauthorized: Creator access required');
  }
}

/**
 * Require Operator or Creator role - throws error if neither
 */
export async function requireOperatorOrCreator(email?: string): Promise<void> {
  const isOperator = await isOperatorOrCreator(email);
  if (!isOperator) {
    throw new Error('Unauthorized: Operator or Creator access required');
  }
}
