import { redirect } from 'next/navigation'

export default async function Subscribe() {
    // Redirect to dashboard - no billing page needed
    // Stripe is only used for PoC registration fees
    redirect('/dashboard')
}
