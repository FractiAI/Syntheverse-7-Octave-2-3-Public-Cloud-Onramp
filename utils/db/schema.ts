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
        novelty?: number;
        alignment?: number;
        qualified_founder?: boolean;
        qualified_epoch?: string | null; // Epoch that was open when submission qualified (founder, pioneer, community, ecosystem)
        [key: string]: any;
    }>(),
    // Vector embedding and 3D coordinates for holographic hydrogen fractal sandbox
    embedding: jsonb('embedding').$type<number[]>(), // Vector embedding as array of numbers
    vector_x: numeric('vector_x', { precision: 20, scale: 10 }), // X coordinate in 3D HHF space
    vector_y: numeric('vector_y', { precision: 20, scale: 10 }), // Y coordinate in 3D HHF space
    vector_z: numeric('vector_z', { precision: 20, scale: 10 }), // Z coordinate in 3D HHF space
    embedding_model: text('embedding_model'), // Model used for embedding (e.g., text-embedding-3-small)
    vector_generated_at: timestamp('vector_generated_at'), // When vector was generated
    // PoC Registration fields (for blockchain registration)
    registered: boolean('registered').default(false), // Is PoC registered on blockchain
    registration_date: timestamp('registration_date'), // When PoC was registered
    registration_tx_hash: text('registration_tx_hash'), // Blockchain transaction hash
    stripe_payment_id: text('stripe_payment_id'), // Stripe payment ID for registration
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

// PoC Submission and Evaluation Log Table (audit trail)
export const pocLogTable = pgTable('poc_log', {
    id: text('id').primaryKey(),
    submission_hash: text('submission_hash').notNull(),
    contributor: text('contributor').notNull(),
    event_type: text('event_type').notNull(), // submission, evaluation_start, evaluation_complete, evaluation_error, status_change, allocation
    event_status: text('event_status'), // success, error, pending
    title: text('title'),
    category: text('category'),
    request_data: jsonb('request_data').$type<any>(), // Full request payload
    response_data: jsonb('response_data').$type<any>(), // Full response payload
    evaluation_result: jsonb('evaluation_result').$type<{
        coherence?: number;
        density?: number;
        redundancy?: number;
        pod_score?: number;
        novelty?: number;
        alignment?: number;
        metals?: string[];
        qualified?: boolean;
        qualified_founder?: boolean;
        classification?: string[];
        redundancy_analysis?: string;
        metal_justification?: string;
        error?: string;
    }>(),
    grok_api_request: jsonb('grok_api_request').$type<any>(), // GROK API request details
    grok_api_response: jsonb('grok_api_response').$type<any>(), // GROK API response details
    error_message: text('error_message'),
    error_stack: text('error_stack'),
    processing_time_ms: integer('processing_time_ms'), // Time taken for evaluation
    metadata: jsonb('metadata').$type<{
        // Archive data (permanently stored for top 3 matching)
        archive_data?: {
            abstract?: string
            formulas?: string[]
            constants?: string[]
        }
        [key: string]: any
    }>(), // Additional metadata including archive data
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertPocLog = typeof pocLogTable.$inferInsert;
export type SelectPocLog = typeof pocLogTable.$inferSelect;
