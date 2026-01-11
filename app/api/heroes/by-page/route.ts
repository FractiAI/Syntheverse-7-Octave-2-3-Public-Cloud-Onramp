/**
 * API Route: Fetch Hero by Page Context
 * Returns the appropriate hero character for a given page
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { heroCatalogTable } from '@/utils/db/hero-schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json(
        { error: 'Page context is required' },
        { status: 400 }
      );
    }

    // Map page context to hero ID
    const heroIdMap: Record<string, string> = {
      onboarding: 'hero-humboldt-explorer',
      fractiai: 'hero-turing-architect',
      dashboard: 'hero-leonardo-artisan',
      operator: 'hero-faraday-experimenter',
      creator: 'hero-fuller-designer',
    };

    const heroId = heroIdMap[page];

    if (!heroId) {
      return NextResponse.json(
        { error: 'Invalid page context' },
        { status: 400 }
      );
    }

    // Fetch hero from database
    const heroes = await db
      .select()
      .from(heroCatalogTable)
      .where(eq(heroCatalogTable.id, heroId))
      .limit(1);

    if (heroes.length === 0) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    const hero = heroes[0];

    return NextResponse.json({
      id: hero.id,
      name: hero.name,
      tagline: hero.tagline,
      icon: hero.icon,
      role: hero.role,
      default_system_prompt: hero.default_system_prompt,
      metadata: hero.metadata,
    });
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    );
  }
}

