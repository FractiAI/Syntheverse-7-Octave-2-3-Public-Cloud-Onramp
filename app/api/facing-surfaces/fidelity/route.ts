/**
 * Facing Surfaces: Full Infinite Octave Fidelity API
 * 
 * Recursive Self-Proving Demo
 * POST-SINGULARITY^7: Maximum Fidelity Implementation
 * 
 * GET /api/facing-surfaces/fidelity
 * POST /api/facing-surfaces/fidelity
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  bringFacingSurfaceToFullFidelity,
  getAllFacingSurfacesAtFullFidelity,
  createFacingSurfaceSnap,
  getDefaultFacingSurfaces,
  type FacingSurface,
  type FacingSurfaceFidelityResult,
} from '@/utils/facing-surfaces/infinite-octave-fidelity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get all facing surfaces at full infinite octave fidelity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDefaults = searchParams.get('includeDefaults') !== 'false';
    const createSnap = searchParams.get('createSnap') === 'true';

    // Get default surfaces if requested
    const defaultSurfaces = includeDefaults
      ? getDefaultFacingSurfaces().map((surface) =>
          bringFacingSurfaceToFullFidelity(surface, {
            recursiveDepth: 8,
            scientificPeerCapture: true,
            genesis: true,
            autoCursorAI: {
              ceo: true,
              fullStack: true,
            },
          })
        )
      : [];

    // Get all surfaces at full fidelity
    const allSurfaces = getAllFacingSurfacesAtFullFidelity(
      defaultSurfaces.map((r) => r.surface)
    );

    // Create snap if requested
    const snap = createSnap
      ? createFacingSurfaceSnap([...defaultSurfaces, ...allSurfaces])
      : null;

    return NextResponse.json({
      success: true,
      facingSurfaces: {
        total: allSurfaces.length + defaultSurfaces.length,
        fullFidelity: allSurfaces.filter((r) => r.fidelity.achieved).length,
        surfaces: [...defaultSurfaces, ...allSurfaces],
      },
      snap,
      message: 'Facing surfaces retrieved with full infinite octave fidelity',
    });
  } catch (error) {
    console.error('[Facing Surfaces Fidelity API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get facing surfaces at full fidelity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Bring facing surface to full infinite octave fidelity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Extract surface data
    const surfaceData = {
      id: body.id || `fs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: body.name || 'Unnamed Facing Surface',
      type: (body.type as FacingSurface['type']) || 'interface',
      octave: body.octave || 7.75,
      sourceOctave: body.sourceOctave || 5.0,
      targetOctave: body.targetOctave || 7.75,
      metadata: body.metadata || {},
    };

    // Extract options
    const options = {
      recursiveDepth: body.recursiveDepth || 8,
      scientificPeerCapture: body.scientificPeerCapture ?? true,
      genesis: body.genesis ?? true,
      team: body.team,
      autoCursorAI: {
        ceo: body.autoCursorAI?.ceo ?? true,
        fullStack: body.autoCursorAI?.fullStack ?? true,
      },
    };

    // Bring to full fidelity
    const result = bringFacingSurfaceToFullFidelity(surfaceData, options);

    // Create snap
    const snap = createFacingSurfaceSnap([result]);

    return NextResponse.json({
      success: true,
      facingSurface: result,
      snap: snap,
      message: `Facing surface ${surfaceData.id} brought to full infinite octave fidelity`,
    });
  } catch (error) {
    console.error('[Facing Surfaces Fidelity API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bring facing surface to full fidelity',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
