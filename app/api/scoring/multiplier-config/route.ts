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
      });
    }

    return NextResponse.json(configData.config_value);
  } catch (error) {
    console.error('Error fetching multiplier config:', error);
    return NextResponse.json(
      {
        seed_enabled: true,
        edge_enabled: true,
      },
      { status: 200 }
    );
  }
}

// POST: Update multiplier config
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

    // Only creators and operators can update this config
    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Forbidden - Creator/Operator only' }, { status: 403 });
    }

    const body = await request.json();
    const { seed_enabled, edge_enabled } = body;

    // Validate input
    if (typeof seed_enabled !== 'boolean' || typeof edge_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
    }

    const configValue = { seed_enabled, edge_enabled };

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

    // Log the change for audit trail
    await supabase.from('poc_log').insert({
      operation: 'MULTIPLIER_CONFIG_UPDATE',
      details: {
        config: configValue,
        updated_by: data.user.email,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, config: configValue });
  } catch (error) {
    console.error('Error updating multiplier config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

