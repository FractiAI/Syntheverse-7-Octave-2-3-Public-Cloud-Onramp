#!/bin/bash
# Script to apply PoC database migrations to Supabase
# Usage: ./scripts/apply_supabase_migrations.sh

set -e

PROJECT_REF="jfbgdxeumzqzigptbmvp"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
MIGRATION_FILE="supabase/migrations/combined_poc_migrations.sql"

echo "📦 Applying PoC database migrations to Supabase..."
echo "Project: ${PROJECT_REF}"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""
echo "📝 To apply these migrations, you have two options:"
echo ""
echo "Option 1: Use Supabase Dashboard (Recommended)"
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo "2. Copy and paste the contents of: $MIGRATION_FILE"
echo "3. Click 'Run' to execute"
echo ""
echo "Option 2: Use Supabase CLI (if you have database password)"
echo "1. Run: supabase db push"
echo "   (You'll be prompted for your database password)"
echo ""
echo "The migration file contains:"
echo "  - allocations table"
echo "  - contributions table"
echo "  - epoch_balances table"
echo "  - tokenomics table"
echo "  - poc_log table"
echo "  - Indexes for performance"
echo "  - Default data initialization"
echo ""



