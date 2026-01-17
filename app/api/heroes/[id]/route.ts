/**
 * Hero by ID API - Single hero operations
 * GET: Get hero details
 * PUT: Update hero (creators only)
 * DELETE: Delete hero (creators only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Get hero by ID
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

    const { data: hero, error } = await supabase
      .from('hero_catalog')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
    }

    // Check if user can view this hero
    const { isCreator } = await getAuthenticatedUserWithRole();
    if (!hero.is_public && hero.created_by !== user.email && !isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get associated stories
    const { data: stories } = await supabase
      .from('story_catalog')
      .select('*')
      .eq('hero_id', params.id)
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    return NextResponse.json({
      success: true,
      hero,
      stories: stories || [],
    });
  } catch (error) {
    console.error('Error in hero GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update hero
export async function PUT(
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
    const updates = {
      ...body,
      updated_by: user.email,
      updated_at: new Date().toISOString(),
    };

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_by;
    delete updates.created_at;
    delete updates.total_interactions;
    delete updates.total_sessions;
    delete updates.average_rating;

    const { data: hero, error } = await supabase
      .from('hero_catalog')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hero:', error);
      return NextResponse.json({ error: 'Failed to update hero' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hero,
      message: 'Hero updated successfully',
    });
  } catch (error) {
    console.error('Error in hero PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete hero
export async function DELETE(
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

    const { error } = await supabase
      .from('hero_catalog')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting hero:', error);
      return NextResponse.json({ error: 'Failed to delete hero' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Hero deleted successfully',
    });
  } catch (error) {
    console.error('Error in hero DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

