import FractiAIBulletin from '@/components/FractiAIBulletin';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { HeroPanel } from '@/components/HeroPanel';
import '../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function FractiAIPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Get user role for header navigation
  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Content */}
      <div className="flex-1">
        <FractiAIBulletin isAuthenticated={!!user} />
      </div>
      
      {/* Hero Panel - The Outcast Hero (Fire & Bison) - Mission Control */}
      <HeroPanel 
        pageContext="fractiai" 
        pillarContext="contributor" 
        userEmail={user?.email || ''} 
      />
    </div>
  );
}
