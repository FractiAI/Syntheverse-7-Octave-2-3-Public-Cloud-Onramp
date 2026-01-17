import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { blogPermissionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Get blog permissions
export async function GET(request: NextRequest) {
  try {
    const permissions = await db
      .select()
      .from(blogPermissionsTable)
      .where(eq(blogPermissionsTable.id, 'main'))
      .limit(1);

    if (permissions.length === 0) {
      // Return defaults if not set
      return NextResponse.json({
        permissions: {
          id: 'main',
          allow_contributors: false,
          allow_operators: true,
          allow_creator: true,
        },
      });
    }

    return NextResponse.json({ permissions: permissions[0] });
  } catch (error) {
    console.error('Error fetching blog permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

// PATCH: Update blog permissions (Creator only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator } = await getAuthenticatedUserWithRole();

    if (!isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { allow_contributors, allow_operators, allow_creator } = body;

    // Ensure creator always has access
    const updatedPermissions = await db
      .update(blogPermissionsTable)
      .set({
        allow_contributors: allow_contributors ?? false,
        allow_operators: allow_operators ?? true,
        allow_creator: true, // Always true
        updated_by: user.email,
      })
      .where(eq(blogPermissionsTable.id, 'main'))
      .returning();

    // If no record exists, create it
    if (updatedPermissions.length === 0) {
      const newPermissions = await db
        .insert(blogPermissionsTable)
        .values({
          id: 'main',
          allow_contributors: allow_contributors ?? false,
          allow_operators: allow_operators ?? true,
          allow_creator: true,
          updated_by: user.email,
        })
        .returning();

      return NextResponse.json({ permissions: newPermissions[0] });
    }

    return NextResponse.json({ permissions: updatedPermissions[0] });
  } catch (error) {
    console.error('Error updating blog permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}

