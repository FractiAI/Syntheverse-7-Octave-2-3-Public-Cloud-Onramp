#!/bin/bash
echo "🚀 Syntheverse PoC Local Testing Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "⚠️  Please edit .env.local with your actual API keys"
else
    echo "ℹ️  .env.local already exists"
fi

echo "🗄️  Setting up database..."
npm run db:migrate

echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://localhost:3000"
echo ""
echo "⚠️  IMPORTANT: Before running, make sure to:"
echo "   1. Set up a Supabase project and add the keys to .env.local"
echo "   2. Set up Stripe test account and add keys to .env.local"
echo "   3. Configure OAuth providers (optional)"
