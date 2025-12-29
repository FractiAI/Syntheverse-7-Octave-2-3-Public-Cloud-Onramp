import CockpitHeader from "@/components/CockpitHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { debug, debugError } from '@/utils/debug';
import './dashboard-cockpit.css';

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
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // Redirect to login if no authenticated user
        if (authError || !user || !user.email) {
            debug('DashboardLayout', 'No authenticated user, redirecting to login');
            redirect('/login')
        }

        // Optionally check user in database (non-blocking)
        try {
            const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);
            debug('DashboardLayout', 'User record found', { 
                exists: userRecord.length > 0,
                plan: userRecord[0]?.plan 
            });
        } catch (dbError) {
            // Non-fatal: Allow dashboard access even if DB check fails
            // Individual components will handle their own database queries
            debugError('DashboardLayout', 'Database check failed (non-fatal)', dbError);
        }
    } catch (error) {
        // Fatal errors should trigger error boundary
        debugError('DashboardLayout', 'Fatal error in dashboard layout', error);
        throw error;
    }

    return (
        <>
            <CockpitHeader />
            {children}
        </>
    );
}
