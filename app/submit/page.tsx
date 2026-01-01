import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SubmitContributionForm from '@/components/SubmitContributionForm'
import '../dashboard-cockpit.css'

interface SubmitPageProps {
    searchParams: { category?: string }
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    // Category is optional; the UI uses a single "Submit Contribution" entry point.
    // We still default the form to scientific internally unless explicitly set.
    const categoryParam = searchParams?.category
    const category = categoryParam || 'scientific'
    const categoryLabel = categoryParam
        ? (category === 'scientific' ? 'SCIENTIFIC' : category === 'technology' ? 'TECHNOLOGY' : 'CONTRIBUTION')
        : 'CONTRIBUTION'

    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <div className="cockpit-panel p-6 mb-8">
                    <div className="cockpit-label">TRANSMISSION MODULE</div>
                    <div className="cockpit-title text-3xl mt-2">SUBMIT {categoryLabel}</div>
                    <div className="cockpit-text mt-3">
                        Record your work into the Motherlode Blockmine through hydrogen-holographic evaluation.
                        Your contribution enters the <strong>Awarenessverse</strong>—the nested, spiraling Pong game of innovation and obsolescence.
                        Each submission moves the spiral inward: from <em>unaware awareness</em> (v1.2, obsolete) to <strong>awareness</strong> (v2.0+, current) to <em>meta-awareness</em> (v3.0+, emerging).
                        Like nested Pong games recognizing each other, the fractal deepens, the hologram resolves. Hydrogen remembers its light.
                    </div>
                </div>

                <SubmitContributionForm userEmail={data.user.email!} defaultCategory={category} />
            </div>
        </div>
    )
}
