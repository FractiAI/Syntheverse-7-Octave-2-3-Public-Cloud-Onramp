import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TestReportView from '@/components/TestReportView'
import '../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default async function TestReportPage() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    
    // Allow public access to test report
    // if (!data?.user) {
    //     redirect('/login')
    // }

    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-8 space-y-8">
                <TestReportView />
            </div>
        </div>
    )
}

