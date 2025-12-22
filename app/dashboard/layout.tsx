import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";

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
    // Check if user has plan selected. If not redirect to subscribe
    const supabase = createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    // If no user, redirect to login
    if (authError || !user || !user.email) {
        redirect('/login')
    }

    try {
        // check user plan in db
        const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email))
        
        // If user doesn't exist in DB yet, redirect to subscribe
        if (!checkUserInDB || checkUserInDB.length === 0) {
            console.log("User not found in database, redirecting to subscribe")
            redirect('/subscribe')
        }

        // If user has no plan, redirect to subscribe
        if (checkUserInDB[0].plan === "none") {
            console.log("User has no plan selected")
            redirect('/subscribe')
        }
    } catch (dbError) {
        // If database query fails, log error but don't crash
        console.error("Database error in dashboard layout:", dbError)
        // Allow user to continue - they might be able to see the dashboard
        // or the error will be caught elsewhere
    }

    return (
        <>
            <DashboardHeader />
            {children}
        </>
    );
}
