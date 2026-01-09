/**
 * SynthChat Room Page
 * Dedicated page for WhatsApp/iPhone-style chat interface
 * Route: /synthchat/[roomId]
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SynthChatRoomInterface } from '@/components/SynthChatRoomInterface';

interface SynthChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function SynthChatRoomPage({ params, searchParams }: SynthChatRoomPageProps) {
  console.log('[SynthChat Page] === PAGE LOAD START ===');
  
  try {
    const supabase = createClient();
    console.log('[SynthChat Page] Supabase client created');

    const { data, error } = await supabase.auth.getUser();
    console.log('[SynthChat Page] Auth result:', { hasUser: !!data?.user, error: error?.message });
    
    if (error || !data?.user) {
      console.log('[SynthChat Page] Redirecting to login');
      redirect('/login');
    }

    const resolvedParams = await params;
    const { roomId } = resolvedParams;
    console.log('[SynthChat Page] Room ID:', roomId);
    
    const resolvedSearchParams = await searchParams;
    const searchTerm = resolvedSearchParams.search || '';
    console.log('[SynthChat Page] Search term:', searchTerm);

    console.log('[SynthChat Page] Rendering SynthChatRoomInterface');
    
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <SynthChatRoomInterface 
          roomId={roomId} 
          userEmail={data.user.email!}
          searchTerm={searchTerm}
        />
      </div>
    );
  } catch (err) {
    console.error('[SynthChat Page] Error:', err);
    throw err;
  }
}

