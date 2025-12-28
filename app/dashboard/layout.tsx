import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { debug, debugError, debugWarn } from '@/utils/debug';

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: "Syntheverse PoC Dashboard",
    description: "Syntheverse Proof of Contribution Dashboard",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    debug('DashboardLayout', 'Starting layout render');
    
    try {
        // Check if user has plan selected. If not redirect to subscribe
        const supabase = createClient()
        debug('DashboardLayout', 'Supabase client created');

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        
        debug('DashboardLayout', 'Auth getUser completed', { 
            hasUser: !!user, 
            hasEmail: !!user?.email,
            authError: authError?.message 
        });

        // If no user, redirect to login
        if (authError || !user || !user.email) {
            debugWarn('DashboardLayout', 'No user or auth error, redirecting to login', { authError });
            redirect('/login')
        }

        try {
            debug('DashboardLayout', 'Querying database for user plan', { email: user.email });
            // check user plan in db
            const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email))
            
            debug('DashboardLayout', 'Database query completed', { 
                found: checkUserInDB?.length > 0,
                plan: checkUserInDB?.[0]?.plan 
            });
            
            // If user doesn't exist in DB yet, create them (shouldn't happen, but handle gracefully)
            if (!checkUserInDB || checkUserInDB.length === 0) {
                debug('DashboardLayout', 'User not found in database, but allowing access - will be created if needed');
                // Don't redirect - allow user to access dashboard
                // The user will be created in the callback or can be created on-demand
            }

            // Allow users with plan 'none' to access dashboard
            // Plan selection is not required for basic dashboard access
            // Users can still submit PoCs and view their contributions
            if (checkUserInDB && checkUserInDB.length > 0 && checkUserInDB[0].plan === "none") {
                debug('DashboardLayout', 'User has no plan selected, but allowing dashboard access');
                // Don't redirect - allow access to dashboard
            }
            
            debug('DashboardLayout', 'User plan check passed', { plan: checkUserInDB[0].plan });
        } catch (dbError) {
            // If database query fails, log error but don't crash
            // This might be a connection issue, so we'll allow the user to continue
            // The dashboard page will handle its own database queries gracefully
            debugError('DashboardLayout', 'Database error in dashboard layout (non-fatal)', dbError);
            // Don't redirect - let the user see the dashboard even if this check fails
            // Individual components will handle their own error states
        }
        
        debug('DashboardLayout', 'Layout render successful, rendering children');
    } catch (error) {
        debugError('DashboardLayout', 'Fatal error in dashboard layout', error);
        throw error; // Re-throw to trigger error boundary
    }

    return (
        <>
            <DashboardHeader />
            {children}
        </>
    );
}
