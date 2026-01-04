import { getStripePlan } from './api'
import { debug, debugError } from '@/utils/debug'

/**
 * Check if user has an active subscription (non-free plan)
 * Returns true if user has any active subscription, false otherwise
 */
export async function hasActiveSubscription(email: string): Promise<boolean> {
    try {
        const plan = await getStripePlan(email)
        debug('hasActiveSubscription', 'Subscription check result', { email, plan })
        
        // If plan is "Free" or empty, user has no active subscription
        return plan !== "Free" && plan !== "" && plan !== null && plan !== undefined
    } catch (error) {
        debugError('hasActiveSubscription', 'Error checking subscription', error)
        return false
    }
}

