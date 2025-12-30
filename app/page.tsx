import FractiAILanding from '@/components/FractiAILanding'
import './dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  return (
    <FractiAILanding
      variant="home"
      cta={{
        primaryHref: '/signup',
        primaryLabel: 'Join the Frontier',
        secondaryHref: '/login',
        secondaryLabel: 'Log in',
      }}
    />
  )
}
