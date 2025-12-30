import FractiAILanding from '@/components/FractiAILanding'
import { createClient } from '@/utils/supabase/server'
import '../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default async function FractiAIPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <FractiAILanding
      variant="fractiai"
      cta={
        user
          ? { primaryHref: '/dashboard', primaryLabel: 'Go to Dashboard' }
          : { primaryHref: '/signup', primaryLabel: 'Join the Frontier', secondaryHref: '/login', secondaryLabel: 'Log in' }
      }
    />
  )
}


