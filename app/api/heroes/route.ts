/**
 * Heroes API - CRUD operations for hero catalog
 * GET: List all heroes (filtered by permissions)
 * POST: Create new hero (creators only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: List heroes
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const pillar = searchParams.get('pillar');

    // Build query
    let query = supabase
      .from('hero_catalog')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: only show active heroes for non-creators
      const { isCreator } = await getAuthenticatedUserWithRole();
      if (!isCreator) {
        query = query.eq('status', 'active').eq('is_public', true);
      }
    }

    // Filter by page assignment (supports both page_assignment and assigned_pages)
    if (page) {
      query = query.or(`page_assignment.eq.${page},assigned_pages.cs.["${page}"]`);
    }

    // Filter by pillar assignment (supports both pillar_assignment and assigned_pillars)
    if (pillar) {
      query = query.or(`pillar_assignment.eq.${pillar},assigned_pillars.cs.["${pillar}"]`);
    }

    const { data: heroes, error } = await query;

    if (error) {
      console.error('Error fetching heroes:', error);
      return NextResponse.json({ error: 'Failed to fetch heroes' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      heroes: heroes || [],
      count: heroes?.length || 0,
    });
  } catch (error) {
    console.error('Error in heroes GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new hero (creators only)
export async function POST(request: NextRequest) {
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
      name,
      tagline,
      icon,
      role,
      default_system_prompt,
      assigned_pages = [],
      assigned_pillars = [],
      metadata = {},
      status = 'draft',
      is_public = true,
    } = body;

    // Validation
    if (!name || !tagline || !role || !default_system_prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: name, tagline, role, default_system_prompt' },
        { status: 400 }
      );
    }

    // Generate hero ID
    const heroId = `hero-${crypto.randomUUID()}`;

    // Insert hero
    const { data: hero, error } = await supabase
      .from('hero_catalog')
      .insert({
        id: heroId,
        name,
        tagline,
        icon,
        role,
        default_system_prompt,
        prompt_version: 'v1.0.0',
        assigned_pages,
        assigned_pillars,
        metadata,
        status,
        is_public,
        created_by: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating hero:', error);
      return NextResponse.json({ error: 'Failed to create hero' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hero,
      message: 'Hero created successfully',
    });
  } catch (error) {
    console.error('Error in heroes POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

