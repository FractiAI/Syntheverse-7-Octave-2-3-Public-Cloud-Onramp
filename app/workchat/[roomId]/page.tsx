/**
 * WorkChat Room Page
 * Dedicated page for WhatsApp/iPhone-style chat interface
 * Route: /workchat/[roomId]
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { WorkChatRoomInterface } from '@/components/WorkChatRoomInterface';

interface WorkChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function WorkChatRoomPage({ params, searchParams }: WorkChatRoomPageProps) {
  console.log('[WorkChat Page] === PAGE LOAD START ===');
  
  try {
    const supabase = createClient();
    console.log('[WorkChat Page] Supabase client created');

    const { data, error } = await supabase.auth.getUser();
    console.log('[WorkChat Page] Auth result:', { hasUser: !!data?.user, error: error?.message });
    
    if (error || !data?.user) {
      console.log('[WorkChat Page] Redirecting to login');
      redirect('/login');
    }

    const resolvedParams = await params;
    const { roomId } = resolvedParams;
    console.log('[WorkChat Page] Room ID:', roomId);
    
    const resolvedSearchParams = await searchParams;
    const searchTerm = resolvedSearchParams.search || '';
    console.log('[WorkChat Page] Search term:', searchTerm);

    console.log('[WorkChat Page] Rendering WorkChatRoomInterface');
    
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <WorkChatRoomInterface 
          roomId={roomId} 
          userEmail={data.user.email!}
          searchTerm={searchTerm}
        />
      </div>
    );
  } catch (err) {
    console.error('[WorkChat Page] Error:', err);
    throw err;
  }
}

