/**
 * CORS Configuration Utility
 * 
 * Provides CORS headers for API routes with environment-based origin restrictions.
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_SITE_URL: Allowed origin in production
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (optional)
 */

import { debug } from './debug'

/**
 * Get allowed origins from environment variables
 */
function getAllowedOrigins(): string[] {
    const origins: string[] = []

    // Add site URL if configured
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL
    if (siteUrl) {
        origins.push(siteUrl.trim())
    }

    // Add additional allowed origins if configured
    const allowedOrigins = process.env.ALLOWED_ORIGINS
    if (allowedOrigins) {
        const additionalOrigins = allowedOrigins.split(',').map(origin => origin.trim()).filter(Boolean)
        origins.push(...additionalOrigins)
    }

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
        origins.push('http://localhost:3000', 'http://127.0.0.1:3000')
    }

    return [...new Set(origins)] // Remove duplicates
}

/**
 * CORS configuration
 */
export interface CorsConfig {
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
    exposeHeaders?: string[]
    maxAge?: number
    credentials?: boolean
}

/**
 * Default CORS configuration
 */
const DEFAULT_CORS_CONFIG: Required<CorsConfig> = {
    allowedOrigins: getAllowedOrigins(),
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
    credentials: true,
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) {
        return false
    }

    // Allow all origins in development (for local testing)
    if (process.env.NODE_ENV === 'development' && allowedOrigins.length === 0) {
        return true
    }

    return allowedOrigins.includes(origin)
}

/**
 * Create CORS headers for a request
 * 
 * @param request - Request object
 * @param config - CORS configuration (optional)
 * @returns Headers object with CORS headers
 */
export function createCorsHeaders(
    request: Request,
    config: CorsConfig = {}
): Headers {
    const headers = new Headers()
    const corsConfig = { ...DEFAULT_CORS_CONFIG, ...config }
    const origin = request.headers.get('origin')

    // Check if origin is allowed
    if (isOriginAllowed(origin, corsConfig.allowedOrigins)) {
        headers.set('Access-Control-Allow-Origin', origin!)
        headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString())
    } else if (corsConfig.allowedOrigins.length > 0) {
        // If we have specific origins configured, use the first one
        headers.set('Access-Control-Allow-Origin', corsConfig.allowedOrigins[0])
    } else {
        // Fallback: allow all origins (not recommended for production)
        headers.set('Access-Control-Allow-Origin', origin || '*')
    }

    headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '))
    headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '))
    headers.set('Access-Control-Expose-Headers', corsConfig.exposeHeaders.join(', '))
    headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString())

    return headers
}

/**
 * Handle OPTIONS preflight request
 * 
 * @param request - Request object
 * @param config - CORS configuration (optional)
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflight(
    request: Request,
    config: CorsConfig = {}
): Response | null {
    if (request.method !== 'OPTIONS') {
        return null
    }

    const headers = createCorsHeaders(request, config)
    return new Response(null, {
        status: 204,
        headers,
    })
}

/**
 * Apply CORS headers to a response
 * 
 * @param request - Request object
 * @param response - Response object (optional)
 * @param config - CORS configuration (optional)
 * @returns Response with CORS headers
 */
export function applyCorsHeaders(
    request: Request,
    response?: Response,
    config: CorsConfig = {}
): Response {
    const corsHeaders = createCorsHeaders(request, config)
    
    if (response) {
        // Merge CORS headers with existing response headers
        corsHeaders.forEach((value, key) => {
            response.headers.set(key, value)
        })
        return response
    }

    // Create new response with CORS headers
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    })
}

