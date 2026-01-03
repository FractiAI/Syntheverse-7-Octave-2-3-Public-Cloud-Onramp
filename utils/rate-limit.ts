/**
 * Rate Limiting Utility
 * 
 * Uses Upstash Redis for serverless-friendly rate limiting.
 * Perfect for Vercel serverless functions.
 * 
 * Environment Variables Required:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * Get these from: https://console.upstash.com/
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { debug, debugError } from './debug'

// Initialize Redis client (uses environment variables)
let redisClient: Redis | null = null
let rateLimiter: Ratelimit | null = null

/**
 * Initialize rate limiter (lazy initialization)
 */
function getRateLimiter(): Ratelimit | null {
    if (rateLimiter) {
        return rateLimiter
    }

    try {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

        if (!redisUrl || !redisToken) {
            debug('RateLimit', 'Upstash Redis not configured, rate limiting disabled', {
                hasUrl: !!redisUrl,
                hasToken: !!redisToken
            })
            return null
        }

        redisClient = new Redis({
            url: redisUrl,
            token: redisToken,
        })

        rateLimiter = new Ratelimit({
            redis: redisClient,
            limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
            analytics: true,
        })

        debug('RateLimit', 'Rate limiter initialized successfully')
        return rateLimiter
    } catch (error) {
        debugError('RateLimit', 'Failed to initialize rate limiter', error)
        return null
    }
}

/**
 * Rate limit configuration for different endpoint types
 */
export const RateLimitConfig = {
    // Submission endpoint - prevent spam
    SUBMIT: {
        limit: 5, // 5 submissions per minute
        window: '1 m',
    },
    // Evaluation endpoint - prevent abuse
    EVALUATE: {
        limit: 10, // 10 evaluations per minute
        window: '1 m',
    },
    // Registration endpoint - prevent gas drain
    REGISTER: {
        limit: 3, // 3 registrations per minute (more restrictive due to gas costs)
        window: '1 m',
    },
    // Default for other endpoints
    DEFAULT: {
        limit: 20, // 20 requests per minute
        window: '1 m',
    },
} as const

/**
 * Create a rate limiter instance with custom configuration
 */
function createRateLimiter(limit: number, window: string): Ratelimit | null {
    const baseLimiter = getRateLimiter()
    if (!baseLimiter) {
        return null
    }

    try {
        return new Ratelimit({
            redis: redisClient!,
            limiter: Ratelimit.slidingWindow(limit, window as any),
            analytics: true,
        })
    } catch (error) {
        debugError('RateLimit', 'Failed to create custom rate limiter', error)
        return null
    }
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

/**
 * Check rate limit for an identifier (IP, user ID, etc.)
 * 
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
    identifier: string,
    config: { limit: number; window: string } = RateLimitConfig.DEFAULT
): Promise<RateLimitResult> {
    const limiter = createRateLimiter(config.limit, config.window)
    
    if (!limiter) {
        // If rate limiting is not configured, allow the request
        debug('RateLimit', 'Rate limiting disabled, allowing request', { identifier })
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit,
            reset: Date.now() + 60000, // 1 minute from now
        }
    }

    try {
        const result = await limiter.limit(identifier)
        
        debug('RateLimit', 'Rate limit check', {
            identifier: identifier.substring(0, 20) + '...',
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        })

        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        }
    } catch (error) {
        debugError('RateLimit', 'Rate limit check failed', error)
        // On error, allow the request (fail open) to avoid blocking legitimate users
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit,
            reset: Date.now() + 60000,
        }
    }
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getRateLimitIdentifier(request: Request): string {
    // Try to get IP from headers (Vercel sets this)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // For authenticated requests, we could also use user ID
    // For now, using IP is sufficient
    return ip
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.reset.toString())
    return headers
}

