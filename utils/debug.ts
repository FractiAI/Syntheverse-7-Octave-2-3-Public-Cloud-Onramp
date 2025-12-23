/**
 * Debug utility for logging in development and production
 * Enable by setting NEXT_PUBLIC_DEBUG=true or DEBUG=true in environment variables
 */

const DEBUG_ENABLED = 
    process.env.NEXT_PUBLIC_DEBUG === 'true' || 
    process.env.DEBUG === 'true' ||
    process.env.NODE_ENV === 'development';

export function debug(component: string, message: string, data?: any) {
    if (DEBUG_ENABLED) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${component}] ${message}`;
        
        if (data !== undefined) {
            console.log(logMessage, data);
        } else {
            console.log(logMessage);
        }
    }
}

export function debugError(component: string, message: string, error: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${component}] ERROR: ${message}`;
    
    // Always log errors, but with more detail in debug mode
    if (DEBUG_ENABLED) {
        console.error(logMessage, {
            error,
            stack: error?.stack,
            message: error?.message,
            name: error?.name,
        });
    } else {
        console.error(logMessage, error?.message || error);
    }
}

export function debugWarn(component: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${component}] WARN: ${message}`;
    
    if (DEBUG_ENABLED) {
        if (data !== undefined) {
            console.warn(logMessage, data);
        } else {
            console.warn(logMessage);
        }
    }
}

export const isDebugEnabled = () => DEBUG_ENABLED;


