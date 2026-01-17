/**
 * Stories API - CRUD operations for stories within a hero
 * GET: List stories for a hero
 * POST: Create new story (creators only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: List stories for hero
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('story_catalog')
      .select('*')
      .eq('hero_id', params.id)
      .order('display_order', { ascending: true });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: only show active stories for non-creators
      const { isCreator } = await getAuthenticatedUserWithRole();
      if (!isCreator) {
        query = query.eq('status', 'active');
      }
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data: stories, error } = await query;

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stories: stories || [],
      count: stories?.length || 0,
    });
  } catch (error) {
    console.error('Error in stories GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new story
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is creator
    const { isCreator } = await getAuthenticatedUserWithRole();
    if (!isCreator) {
      return NextResponse.json({ error: 'Forbidden - Creators only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      story_prompt,
      story_context,
      interaction_goals = [],
      ai_model = 'llama-3.3-70b-versatile',
      temperature = 0.7,
      max_tokens = 500,
      metadata = {},
      status = 'draft',
      is_featured = false,
      display_order = 0,
    } = body;

    // Validation
    if (!title || !description || !story_prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, story_prompt' },
        { status: 400 }
      );
    }

    // Generate story ID
    const storyId = `story-${crypto.randomUUID()}`;

    // Insert story
    const { data: story, error } = await supabase
      .from('story_catalog')
      .insert({
        id: storyId,
        hero_id: params.id,
        title,
        description,
        category,
        story_prompt,
        story_context,
        interaction_goals,
        ai_model,
        temperature,
        max_tokens,
        metadata,
        status,
        is_featured,
        display_order,
        created_by: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating story:', error);
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      story,
      message: 'Story created successfully',
    });
  } catch (error) {
    console.error('Error in story POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

