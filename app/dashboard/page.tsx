import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from "next/link"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { FrontierModule } from '@/components/FrontierModule'
import { ReactorCore } from '@/components/ReactorCore'
import { BootSequenceIndicators } from '@/components/BootSequenceIndicators'
// Optional ecosystem support is intentionally not placed in the primary beta cockpit.
// The reference client stays protocol-first and avoids any "package" framing in the main dashboard.
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const user = data.user

    // Get user data from database
    let dbUser = null
    
    try {
        const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        if (userResult.length > 0) {
            dbUser = userResult[0]
        }
    } catch (dbError) {
        console.error("Error fetching user data:", dbError)
    }

    // Get display name: prefer database name, fallback to email username, then full email
    const displayName = dbUser?.name || user.email?.split('@')[0] || user.email || 'User'

    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Command Zone - Welcome & Action Control */}
                <div className="cockpit-panel p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="cockpit-label">SYNTHEVERSE PROTOCOL (PUBLIC) · FRACTIAI REFERENCE CLIENT</div>
                                {/* Boot Sequence Indicator Lights */}
                                <BootSequenceIndicators />
                            </div>
                            <div className="cockpit-title text-2xl mt-1">{displayName.toUpperCase()}</div>
                            <div className="cockpit-text mt-2">
                                You are using the FractiAI reference client to interact with the public Syntheverse protocol.
                                Records are verifiable and permanent; this UI does not represent protocol ownership, centralized
                                governance, or financial promises.
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <Link href="/fractiai" className="cockpit-lever inline-block">
                                <span className="mr-2">◎</span>
                                FractiAI
                            </Link>
                            <Link href="/onboarding" className="cockpit-lever inline-block">
                                <BookOpen className="inline h-4 w-4 mr-2" />
                                Onboarding Navigator
                            </Link>
                            <Link href="/submit" className="cockpit-lever inline-block">
                                <span className="mr-2">✎</span>
                                Submit Contribution
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Core Instrument Panel - Reactor Core */}
                <ReactorCore />

                {/* Frontier Modules - PoC Archive */}
                <FrontierModule userEmail={user.email!} />
            </div>
        </div>
    )
}
