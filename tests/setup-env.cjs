/**
 * Test Environment Setup
 * Loads environment variables and configures path aliases before tests run
 */

const dotenv = require('dotenv')
const { resolve } = require('path')

// Register tsconfig-paths for path alias resolution
require('tsconfig-paths').register({
    baseUrl: process.cwd(),
    paths: {
        '@/*': ['./*']
    }
})

// Load environment variables from multiple files (in order of priority)
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })
dotenv.config({ path: resolve(process.cwd(), '.env.vercel') })

// Log loaded variables (without exposing secrets)
console.log('🔧 Test Environment Setup')
console.log('Environment files loaded')
if (process.env.DATABASE_URL) {
    console.log('✓ DATABASE_URL: Set')
} else {
    console.log('⚠ DATABASE_URL: Not set')
}

if (process.env.NEXT_PUBLIC_GROK_API_KEY) {
    console.log('✓ NEXT_PUBLIC_GROK_API_KEY: Set')
} else {
    console.log('⚠ NEXT_PUBLIC_GROK_API_KEY: Not set')
}

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('✓ NEXT_PUBLIC_SUPABASE_URL: Set')
} else {
    console.log('⚠ NEXT_PUBLIC_SUPABASE_URL: Not set')
}

console.log('')

