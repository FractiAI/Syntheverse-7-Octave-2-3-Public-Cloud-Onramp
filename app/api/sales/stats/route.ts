import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  enterpriseSandboxesTable,
  enterpriseContributionsTable,
  usersTable,
} from '@/utils/db/schema';
import { eq, sql, and, isNotNull, gte } from 'drizzle-orm';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

interface SalesStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byProduct: {
      enterprise: number;
      synthscan: number;
      fieldscan: number;
      pocRegistration: number;
      enterpriseSubmission: number;
      financialAlignment: number;
    };
  };
  subscriptions: {
    total: number;
    active: number;
    canceled: number;
    byTier: {
      pioneer: number;
      tradingPost: number;
      settlement: number;
      metropolis: number;
    };
  };
  payments: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
}

async function getStripeClient(): Promise<Stripe | null> {
  try {
    // Import the module to access the internal stripe instance
    const stripeModule = await import('@/utils/stripe/api');
    // The module exports getStripeClient but we need to access the internal instance
    // For now, we'll create a new instance using the same logic
    if (process.env.STRIPE_SECRET_KEY) {
      const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
      if (sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)) {
        return new Stripe(sanitizedKey, {
          apiVersion: '2024-06-20',
        });
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isOperator && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stripe = await getStripeClient();

    // Get revenue from database (payments with stripe_payment_id)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Count payments from contributions (PoC registrations)
    const pocPaymentsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(contributionsTable)
      .where(isNotNull(contributionsTable.stripe_payment_id));
    const pocPaymentsCount = pocPaymentsResult[0]?.count || 0;

    // Count enterprise sandbox subscriptions
    const enterpriseSubsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(enterpriseSandboxesTable)
      .where(isNotNull(enterpriseSandboxesTable.stripe_subscription_id));
    const enterpriseSubsCount = enterpriseSubsResult[0]?.count || 0;

    // Count enterprise submission payments
    const enterprisePaymentsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(enterpriseContributionsTable)
      .where(isNotNull(enterpriseContributionsTable.stripe_payment_id));
    const enterprisePaymentsCount = enterprisePaymentsResult[0]?.count || 0;

    // Get Stripe data if available
    let stripeRevenue = {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      subscriptions: {
        total: 0,
        active: 0,
        canceled: 0,
        byTier: {
          pioneer: 0,
          tradingPost: 0,
          settlement: 0,
          metropolis: 0,
        },
      },
    };

    if (stripe) {
      try {
        // Get all subscriptions
        const subscriptions = await stripe.subscriptions.list({ limit: 100 });
        const activeSubs = subscriptions.data.filter((sub) => sub.status === 'active');
        const canceledSubs = subscriptions.data.filter((sub) => sub.status === 'canceled');

        // Calculate subscription revenue
        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;

        for (const sub of subscriptions.data) {
          const amount = sub.items.data[0]?.price?.unit_amount || 0;
          const monthlyAmount = amount / 100; // Convert cents to dollars

          totalRevenue += monthlyAmount;

          const created = new Date(sub.created * 1000);
          if (created >= startOfMonth) {
            thisMonthRevenue += monthlyAmount;
          } else if (created >= startOfLastMonth && created < startOfMonth) {
            lastMonthRevenue += monthlyAmount;
          }

          // Categorize by tier from metadata
          const tier = sub.metadata?.tier || sub.metadata?.subscription_tier || '';
          if (tier.toLowerCase().includes('pioneer')) {
            stripeRevenue.subscriptions.byTier.pioneer++;
          } else if (tier.toLowerCase().includes('trading')) {
            stripeRevenue.subscriptions.byTier.tradingPost++;
          } else if (tier.toLowerCase().includes('settlement')) {
            stripeRevenue.subscriptions.byTier.settlement++;
          } else if (tier.toLowerCase().includes('metropolis')) {
            stripeRevenue.subscriptions.byTier.metropolis++;
          }
        }

        // Get payment intents for one-time payments
        const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });
        for (const pi of paymentIntents.data) {
          if (pi.status === 'succeeded') {
            const amount = pi.amount / 100;
            totalRevenue += amount;

            const created = new Date(pi.created * 1000);
            if (created >= startOfMonth) {
              thisMonthRevenue += amount;
            } else if (created >= startOfLastMonth && created < startOfMonth) {
              lastMonthRevenue += amount;
            }
          }
        }

        stripeRevenue = {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          subscriptions: {
            total: subscriptions.data.length,
            active: activeSubs.length,
            canceled: canceledSubs.length,
            byTier: stripeRevenue.subscriptions.byTier,
          },
        };
      } catch (stripeError) {
        console.error('Error fetching Stripe data:', stripeError);
        // Continue with database-only stats
      }
    }

    // Get customer stats
    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(sql`${usersTable.deleted_at} IS NULL`);

    const usersWithStripe = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(
        and(
          sql`${usersTable.deleted_at} IS NULL`,
          sql`${usersTable.stripe_id} IS NOT NULL`,
          sql`${usersTable.stripe_id} != 'pending'`,
          sql`${usersTable.stripe_id} NOT LIKE 'free_%'`,
          sql`${usersTable.stripe_id} NOT LIKE 'placeholder_%'`
        )
      );

    const newUsersThisMonth = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(
        and(sql`${usersTable.deleted_at} IS NULL`, gte(usersTable.id, startOfMonth.toISOString()))
      );

    const stats: SalesStats = {
      revenue: {
        total: stripeRevenue.total,
        thisMonth: stripeRevenue.thisMonth,
        lastMonth: stripeRevenue.lastMonth,
        byProduct: {
          enterprise: stripeRevenue.total * 0.6, // Estimate - would need product tracking
          synthscan: stripeRevenue.total * 0.2,
          fieldscan: stripeRevenue.total * 0.1,
          pocRegistration: pocPaymentsCount * 20, // $20 per registration
          enterpriseSubmission: enterprisePaymentsCount * 30, // Average $30
          financialAlignment: stripeRevenue.total * 0.1,
        },
      },
      subscriptions: {
        total: stripeRevenue.subscriptions.total || enterpriseSubsCount,
        active: stripeRevenue.subscriptions.active,
        canceled: stripeRevenue.subscriptions.canceled,
        byTier: stripeRevenue.subscriptions.byTier,
      },
      payments: {
        total: pocPaymentsCount + enterprisePaymentsCount,
        thisMonth: 0, // Would need date tracking
        lastMonth: 0,
        average: stripeRevenue.total / Math.max(1, pocPaymentsCount + enterprisePaymentsCount),
      },
      customers: {
        total: totalUsers[0]?.count || 0,
        active: usersWithStripe[0]?.count || 0,
        newThisMonth: newUsersThisMonth[0]?.count || 0,
      },
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching sales stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sales stats' },
      { status: 500 }
    );
  }
}
