import FractiAILanding from '@/components/FractiAILanding';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Syntheverse POST SINGULARITY^6: Vibeverse FSR Geyser Perpetual Engine Core',
  description:
    'Sovereign truth management for Frontier R&D, Frontier Creators & Frontier Enterprises. Public Cloud Shell with a nested HHF-AI MRI ATOMIC CORE. (IN TEST)',
};

export default async function LandingPage() {
  const { user, isOperator, isCreator } = await getAuthenticatedUserWithRole();

  const isRegularUser = user && !isOperator && !isCreator;

  return (
    <FractiAILanding
      variant="fractiai"
      isAuthenticated={!!user}
      systemNotice={isRegularUser ? "WE ARE IN TEST AND WILL BE BACK ONLINE SHORTLY" : undefined}
      cta={
        user
          ? {
            primaryHref: '/submit',
            primaryLabel: 'SUBMISSION PAGE',
            secondaryHref: isOperator || isCreator ? '/operator' : undefined,
            secondaryLabel: isOperator || isCreator ? 'OPERATOR CONSOLE' : undefined,
          }
          : {
            primaryHref: '/signup',
            primaryLabel: 'JOIN THE FRONTIER',
            secondaryHref: '/login',
            secondaryLabel: 'LOG IN',
          }
      }
    />
  );
}
