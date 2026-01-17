import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

// GET: Retrieve current multiplier config
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

    // Only creators and operators can access this endpoint
    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Forbidden - Creator/Operator only' }, { status: 403 });
    }

    // Check if config exists in database
    const { data: configData, error: configError } = await supabase
      .from('scoring_config')
      .select('*')
      .eq('config_key', 'multiplier_toggles')
      .single();

    if (configError || !configData) {
      // Return default config if not found
      return NextResponse.json({
        seed_enabled: true,
        edge_enabled: true,
        overlap_enabled: true,
      });
    }

    return NextResponse.json(configData.config_value);
  } catch (error) {
    console.error('Error fetching multiplier config:', error);
    return NextResponse.json(
      {
        seed_enabled: true,
        edge_enabled: true,
        overlap_enabled: true,
      },
      { status: 200 }
    );
  }
}

// POST: Update multiplier config (with mode transition logging per Marek/Simba)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator, role } = await getAuthenticatedUserWithRole();

    // Only creators and operators can update this config
    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Forbidden - Creator/Operator only' }, { status: 403 });
    }

    const body = await request.json();
    const { seed_enabled, edge_enabled, overlap_enabled } = body;

    // Validate input
    if (typeof seed_enabled !== 'boolean' || typeof edge_enabled !== 'boolean' || typeof overlap_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
    }

    // Fetch current state BEFORE update (for mode transition logging)
    const { data: currentConfig } = await supabase
      .from('scoring_config')
      .select('*')
      .eq('config_key', 'multiplier_toggles')
      .single();

    const modeStateBefore = currentConfig ? {
      seed_on: currentConfig.config_value.seed_enabled ?? true,
      edge_on: currentConfig.config_value.edge_enabled ?? true,
      overlap_on: currentConfig.config_value.overlap_enabled ?? true,
      metal_policy_on: currentConfig.config_value.metal_policy_enabled ?? true,
      score_config_version: currentConfig.version || 'v1.0.0',
    } : null;

    // Preserve existing sweet spot parameters and overlap operator
    const configValue = {
      ...currentConfig?.config_value,
      seed_enabled,
      edge_enabled,
      overlap_enabled,
    };

    const modeStateAfter = {
      seed_on: seed_enabled,
      edge_on: edge_enabled,
      overlap_on: overlap_enabled,
      metal_policy_on: configValue.metal_policy_enabled ?? true,
      score_config_version: currentConfig?.version || 'v1.1.0',
    };

    // Upsert the config
    const { error: upsertError } = await supabase
      .from('scoring_config')
      .upsert(
        {
          config_key: 'multiplier_toggles',
          config_value: configValue,
          updated_at: new Date().toISOString(),
          updated_by: data.user.email,
        },
        {
          onConflict: 'config_key',
        }
      );

    if (upsertError) {
      console.error('Error upserting multiplier config:', upsertError);
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }

    // Mode Transition Logging (Marek/Simba requirement: explicit state machine tracking)
    await supabase.from('audit_log').insert({
      id: `mode_transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actor_email: data.user.email || 'unknown',
      actor_role: role || 'unknown',
      action_type: 'mode_transition',
      action_mode: 'manual', // Manual toggle (vs 'automatic' stability trigger)
      target_type: 'scoring_config',
      target_identifier: 'multiplier_toggles',
      affected_count: 1,
      metadata: {
        mode_state_before: modeStateBefore,
        mode_state_after: modeStateAfter,
        changes: {
          seed: modeStateBefore?.seed_on !== seed_enabled,
          edge: modeStateBefore?.edge_on !== edge_enabled,
          overlap: modeStateBefore?.overlap_on !== overlap_enabled,
        },
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, config: configValue });
  } catch (error) {
    console.error('Error updating multiplier config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

