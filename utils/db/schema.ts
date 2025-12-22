import { integer, pgTable, text, timestamp, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    plan: text('plan').notNull(),
    stripe_id: text('stripe_id').notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

// PoC Contribution Archive Table
export const contributionsTable = pgTable('contributions', {
    submission_hash: text('submission_hash').primaryKey(),
    title: text('title').notNull(),
    contributor: text('contributor').notNull(),
    content_hash: text('content_hash').notNull(),
    text_content: text('text_content'),
    pdf_path: text('pdf_path'),
    status: text('status').notNull().default('draft'), // draft, submitted, evaluating, qualified, unqualified, archived, superseded
    category: text('category'), // scientific, tech, alignment
    metals: jsonb('metals').$type<string[]>(), // Array of metal types: gold, silver, copper
    metadata: jsonb('metadata').$type<{
        coherence?: number;
        density?: number;
        redundancy?: number;
        pod_score?: number;
        [key: string]: any;
    }>(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// PoC Tokenomics State Table
export const tokenomicsTable = pgTable('tokenomics', {
    id: text('id').primaryKey().default('main'),
    total_supply: numeric('total_supply', { precision: 20, scale: 0 }).notNull().default('90000000000000'), // 90T
    total_distributed: numeric('total_distributed', { precision: 20, scale: 0 }).notNull().default('0'),
    current_epoch: text('current_epoch').notNull().default('founder'),
    founder_halving_count: integer('founder_halving_count').notNull().default(0),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Epoch Balances Table
export const epochBalancesTable = pgTable('epoch_balances', {
    id: text('id').primaryKey(),
    epoch: text('epoch').notNull(), // founder, pioneer, community, ecosystem
    balance: numeric('balance', { precision: 20, scale: 0 }).notNull(),
    threshold: numeric('threshold', { precision: 20, scale: 0 }).notNull(),
    distribution_amount: numeric('distribution_amount', { precision: 20, scale: 0 }).notNull(),
    distribution_percent: numeric('distribution_percent', { precision: 5, scale: 2 }).notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Token Allocations Table (tracks individual allocations per contribution)
export const allocationsTable = pgTable('allocations', {
    id: text('id').primaryKey(),
    submission_hash: text('submission_hash').notNull(),
    contributor: text('contributor').notNull(),
    metal: text('metal').notNull(), // gold, silver, copper
    epoch: text('epoch').notNull(),
    tier: text('tier'), // Optional tier information
    reward: numeric('reward', { precision: 20, scale: 0 }).notNull(),
    tier_multiplier: numeric('tier_multiplier', { precision: 10, scale: 4 }).notNull().default('1.0'),
    epoch_balance_before: numeric('epoch_balance_before', { precision: 20, scale: 0 }).notNull(),
    epoch_balance_after: numeric('epoch_balance_after', { precision: 20, scale: 0 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
