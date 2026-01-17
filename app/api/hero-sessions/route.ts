/**
 * Hero Sessions API - Manage AI interaction sessions
 * GET: List user's sessions
 * POST: Create new session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: List sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const heroId = searchParams.get('hero_id');

    const { isOperator, isCreator } = await getAuthenticatedUserWithRole();
    const canViewAll = isOperator || isCreator;

    // Build query
    let query = supabase
      .from('hero_sessions')
      .select('*, hero_catalog(name, icon)')
      .order('started_at', { ascending: false });

    // Non-operators can only see their own sessions
    if (!canViewAll) {
      query = query.eq('user_email', user.email);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by hero
    if (heroId) {
      query = query.eq('hero_id', heroId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      count: sessions?.length || 0,
    });
  } catch (error) {
    console.error('Error in sessions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new session
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      hero_id,
      story_id = null,
      session_type = 'free_chat',
      custom_prompt = null,
      metadata = {},
    } = body;

    // Validation
    if (!hero_id) {
      return NextResponse.json({ error: 'Missing required field: hero_id' }, { status: 400 });
    }

    // Get hero details
    const { data: hero, error: heroError } = await supabase
      .from('hero_catalog')
      .select('default_system_prompt')
      .eq('id', hero_id)
      .single();

    if (heroError || !hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
    }

    // Get story prompt if story_id provided
    let systemPrompt = hero.default_system_prompt;
    if (story_id) {
      const { data: story, error: storyError } = await supabase
        .from('story_catalog')
        .select('story_prompt, story_context')
        .eq('id', story_id)
        .single();

      if (!storyError && story) {
        systemPrompt = `${hero.default_system_prompt}\n\n${story.story_prompt}`;
        if (story.story_context) {
          systemPrompt += `\n\nContext: ${story.story_context}`;
        }
      }
    }

    // Use custom prompt if provided (operator override)
    if (custom_prompt) {
      systemPrompt = custom_prompt;
    }

    // Check if operator is launching
    const { isOperator, isCreator } = await getAuthenticatedUserWithRole();
    const isOperatorSession = isOperator || isCreator;

    // Generate session ID
    const sessionId = `session-${crypto.randomUUID()}`;

    // Create session
    const { data: session, error } = await supabase
      .from('hero_sessions')
      .insert({
        id: sessionId,
        hero_id,
        story_id,
        user_email: user.email,
        system_prompt: systemPrompt,
        session_type,
        status: 'active',
        started_at: new Date().toISOString(),
        messages: [],
        metadata,
        launched_by_operator: isOperatorSession ? user.email : null,
        is_operator_session: isOperatorSession,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Track analytics
    await supabase.from('hero_analytics').insert({
      id: `analytics-${crypto.randomUUID()}`,
      hero_id,
      story_id,
      session_id: sessionId,
      user_email: user.email,
      event_type: 'session_started',
      event_data: { session_type, page_context: metadata.page_context },
      event_timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      session,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Error in session POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

