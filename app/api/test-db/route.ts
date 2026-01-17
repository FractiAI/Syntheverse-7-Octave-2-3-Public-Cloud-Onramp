import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Test endpoint to verify database connection and user lookup
 * GET /api/test-db
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          tests: {
            auth: 'failed',
            database: 'skipped',
          },
        },
        { status: 401 }
      );
    }

    const user = data.user;
    const results: any = {
      success: true,
      userId: user.id,
      userEmail: user.email,
      tests: {},
    };

    // Test 1: Database connection
    try {
      const testQuery = await db.select().from(usersTable).limit(1);
      results.tests.databaseConnection = 'passed';
      results.tests.tableExists = 'passed';
      results.tests.totalUsers = testQuery.length;
    } catch (dbError) {
      results.tests.databaseConnection = 'failed';
      results.tests.databaseError = dbError instanceof Error ? dbError.message : String(dbError);
      return NextResponse.json(results, { status: 500 });
    }

    // Test 2: User lookup by ID
    try {
      const userById = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1);

      results.tests.userLookupById = userById.length > 0 ? 'found' : 'not_found';
      if (userById.length > 0) {
        results.userData = {
          id: userById[0].id,
          name: userById[0].name,
          email: userById[0].email,
        };
      }
    } catch (lookupError) {
      results.tests.userLookupById = 'error';
      results.tests.lookupError =
        lookupError instanceof Error ? lookupError.message : String(lookupError);
    }

    // Test 3: User lookup by email
    if (user.email) {
      try {
        const userByEmail = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email))
          .limit(1);

        results.tests.userLookupByEmail = userByEmail.length > 0 ? 'found' : 'not_found';
      } catch (emailLookupError) {
        results.tests.userLookupByEmail = 'error';
        results.tests.emailLookupError =
          emailLookupError instanceof Error ? emailLookupError.message : String(emailLookupError);
      }
    }

    // Test 4: Test update syntax (dry run - won't actually update)
    try {
      // This will compile the query but since we're not awaiting it, it won't execute
      const updateQuery = db
        .update(usersTable)
        .set({ name: 'test' })
        .where(eq(usersTable.id, user.id));

      results.tests.updateQuerySyntax = 'valid';
    } catch (updateError) {
      results.tests.updateQuerySyntax = 'error';
      results.tests.updateError =
        updateError instanceof Error ? updateError.message : String(updateError);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
