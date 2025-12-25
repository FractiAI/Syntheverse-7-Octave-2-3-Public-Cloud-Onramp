#!/bin/bash

# Check Supabase schema using Supabase CLI
# Usage: ./scripts/check_schema_supabase_cli.sh

PROJECT_REF="jfbgdxeumzqzigptbmvp"
DB_PASSWORD="hcGw8smzTB5NXvel"

# URL encode password
ENCODED_PW=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASSWORD'))")

# Build connection string  
DB_URL="postgresql://postgres:${ENCODED_PW}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require"

echo "🔍 Checking contributions table schema for registration fields..."
echo ""

# Query registration columns
QUERY="SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'contributions' AND table_schema = 'public' AND (column_name LIKE 'registration%' OR column_name = 'stripe_payment_id' OR column_name = 'registered') ORDER BY column_name;"

echo "$QUERY" | supabase db remote query --db-url "$DB_URL" 2>&1

echo ""
echo "📋 Full contributions table structure:"
echo ""

QUERY2="SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contributions' AND table_schema = 'public' ORDER BY ordinal_position;"
echo "$QUERY2" | supabase db remote query --db-url "$DB_URL" 2>&1

