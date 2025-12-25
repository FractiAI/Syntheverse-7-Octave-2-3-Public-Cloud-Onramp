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

export const metadata: Metadata = {
    title: "SAAS Starter Kit",
    description: "SAAS Starter Kit with Stripe, Supabase, Postgres",
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
            
            // If user doesn't exist in DB yet, redirect to subscribe
            if (!checkUserInDB || checkUserInDB.length === 0) {
                debug('DashboardLayout', 'User not found in database, redirecting to subscribe');
                redirect('/subscribe')
            }

            // If user has no plan, redirect to subscribe
            if (checkUserInDB[0].plan === "none") {
                debug('DashboardLayout', 'User has no plan selected, redirecting to subscribe');
                redirect('/subscribe')
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
