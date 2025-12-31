import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requireEnvironmentVariables } from '@/utils/env-validation';

// Validate all required environment variables at startup
try {
    requireEnvironmentVariables();
} catch (error) {
    console.error('Environment validation failed:', error instanceof Error ? error.message : error);
    // In production, fail fast. In development, warn but continue.
    if (process.env.NODE_ENV === 'production') {
        throw error;
    } else {
        console.warn('Continuing in development mode despite validation failures');
    }
}

// Validate DATABASE_URL before creating connection
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
}

// Parse and validate the connection string
let databaseUrl = process.env.DATABASE_URL
try {
    const url = new URL(databaseUrl)
    if (!url.hostname || !url.port) {
        throw new Error('Invalid DATABASE_URL format: missing hostname or port')
    }
} catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error instanceof Error ? error.message : String(error)}`)
}

// Disable prefetch as it is not supported for "Transaction" pool mode
// Add connection timeout and error handling
const maxConnections =
    (() => {
        const raw = (process.env.DATABASE_POOL_MAX || '').trim()
        const parsed = raw ? Number(raw) : NaN
        if (!Number.isFinite(parsed) || parsed <= 0) {
            // Default to a small pool to prevent request starvation/timeouts under concurrency.
            // In serverless, each warm instance has its own pool; keeping this modest avoids DB overload.
            return process.env.NODE_ENV === 'production' ? 5 : 2
        }
        return Math.floor(parsed)
    })()

const client = postgres(databaseUrl, { 
    prepare: false,
    connect_timeout: 10, // 10 second connection timeout
    max: maxConnections, // Prevent global request starvation; configurable via DATABASE_POOL_MAX
    idle_timeout: 20,
    max_lifetime: 60 * 30
})

export const db = drizzle(client);
