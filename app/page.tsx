import { redirect } from 'next/navigation';
import FractiAILanding from '@/components/FractiAILanding';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse POST SINGULARITY^6: Vibeverse FSR Geyser Perpetual Engine Core',
  description:
    'Sovereign truth management for Frontier R&D, Frontier Creators & Frontier Enterprises. Public Cloud Shell with a nested HHF-AI MRI ATOMIC CORE. (IN TEST)',
};

export default async function LandingPage() {
  const auth = await getAuthenticatedUserWithRole();
  const user = auth?.user || null;
  const isOperator = !!auth?.isOperator;
  const isCreator = !!auth?.isCreator;

  // Redirect approved testers automatically if logged in
  if (user && (isOperator || isCreator)) {
    redirect('/operator/dashboard');
  }

  const systemNoticeText = (user && !isOperator && !isCreator) 
    ? "WE ARE IN TEST AND WILL BE BACK ONLINE SHORTLY" 
    : undefined;

  return (
    <FractiAILanding
      variant="fractiai"
      isAuthenticated={!!user}
      isApprovedTester={isOperator || isCreator}
      notice={systemNoticeText}
      cta={{
        primaryHref: '/login?redirect=/operator/dashboard',
        primaryLabel: 'TESTER LOGIN',
      }}
    />
  );
}
