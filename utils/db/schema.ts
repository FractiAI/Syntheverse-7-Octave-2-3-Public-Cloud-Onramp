import { integer, pgTable, text, timestamp, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  plan: text('plan').notNull(),
  stripe_id: text('stripe_id').notNull(),
  role: text('role').notNull().default('user'), // 'creator', 'operator', 'user'
  deleted_at: timestamp('deleted_at'), // Soft delete timestamp
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
  status: text('status').notNull().default('evaluating'), // evaluating, qualified, unqualified, archived, superseded (no drafts - submissions are immediately evaluated)
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
  archived_at: timestamp('archived_at'), // Timestamp when archived (for reset tracking)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// PoC Tokenomics State Table
export const tokenomicsTable = pgTable('tokenomics', {
  id: text('id').primaryKey().default('main'),
  total_supply: numeric('total_supply', { precision: 20, scale: 0 })
    .notNull()
    .default('90000000000000'), // 90T
  total_distributed: numeric('total_distributed', { precision: 20, scale: 0 })
    .notNull()
    .default('0'),
  // New: per-metal supplies (Initial supply: 45T Gold, 22.5T Silver, 22.5T Copper)
  total_supply_gold: numeric('total_supply_gold', { precision: 20, scale: 0 })
    .notNull()
    .default('45000000000000'),
  total_supply_silver: numeric('total_supply_silver', { precision: 20, scale: 0 })
    .notNull()
    .default('22500000000000'),
  total_supply_copper: numeric('total_supply_copper', { precision: 20, scale: 0 })
    .notNull()
    .default('22500000000000'),
  total_distributed_gold: numeric('total_distributed_gold', { precision: 20, scale: 0 })
    .notNull()
    .default('0'),
  total_distributed_silver: numeric('total_distributed_silver', { precision: 20, scale: 0 })
    .notNull()
    .default('0'),
  total_distributed_copper: numeric('total_distributed_copper', { precision: 20, scale: 0 })
    .notNull()
    .default('0'),
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

// New: Epoch Balances per Metal Token (Gold/Silver/Copper)
export const epochMetalBalancesTable = pgTable('epoch_metal_balances', {
  id: text('id').primaryKey(),
  epoch: text('epoch').notNull(), // founder, pioneer, community, ecosystem
  metal: text('metal').notNull(), // gold, silver, copper
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
      abstract?: string;
      formulas?: string[];
      constants?: string[];
    };
    [key: string]: any;
  }>(), // Additional metadata including archive data
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertPocLog = typeof pocLogTable.$inferInsert;

// Enterprise Sandbox Table
export const enterpriseSandboxesTable = pgTable('enterprise_sandboxes', {
  id: text('id').primaryKey(), // Unique sandbox identifier
  operator: text('operator').notNull(), // Email of the operator who created it
  name: text('name').notNull(), // Sandbox name
  description: text('description'), // Optional description
  vault_status: text('vault_status').notNull().default('paused'), // active, paused
  tokenized: boolean('tokenized').default(false), // Whether sandbox has its own ERC-20 token
  token_address: text('token_address'), // On-chain token contract address (if tokenized)
  token_name: text('token_name'), // Token name
  token_symbol: text('token_symbol'), // Token symbol
  token_supply: numeric('token_supply', { precision: 20, scale: 0 }), // Total token supply
  current_epoch: text('current_epoch').notNull().default('founder'), // Same epoch structure as main
  // Scoring lens configuration (can override main Syntheverse settings)
  scoring_config: jsonb('scoring_config').$type<{
    novelty_weight?: number;
    density_weight?: number;
    coherence_weight?: number;
    alignment_weight?: number;
    qualification_threshold?: number; // Minimum score to qualify
    [key: string]: any;
  }>(),
  // Subscription and pricing information (legacy Stripe)
  subscription_tier: text('subscription_tier'), // Pioneer, Trading Post, Settlement, Metropolis
  node_count: integer('node_count').default(0), // Number of nodes purchased
  stripe_subscription_id: text('stripe_subscription_id'), // Stripe subscription ID
  stripe_customer_id: text('stripe_customer_id'), // Stripe customer ID
  // SYNTH token-based pricing (new model)
  synth_balance: numeric('synth_balance', { precision: 20, scale: 0 }).default('0'), // SYNTH token balance (18 decimals)
  synth_activated: boolean('synth_activated').default(false), // Whether sandbox is activated
  synth_activated_at: timestamp('synth_activated_at'), // Activation timestamp
  synth_activation_fee: numeric('synth_activation_fee', { precision: 20, scale: 0 }).default('10000'), // Activation fee in SYNTH
  current_reach_tier: text('current_reach_tier'), // Seed, Growth, Community, Ecosystem, Metropolis
  last_billing_cycle: timestamp('last_billing_cycle'), // Last rent charge date
  testing_mode: boolean('testing_mode').default(true), // Free testing mode (default)
  metadata: jsonb('metadata').$type<{
    [key: string]: any;
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Enterprise Sandbox Contributions Table
export const enterpriseContributionsTable = pgTable('enterprise_contributions', {
  submission_hash: text('submission_hash').primaryKey(),
  sandbox_id: text('sandbox_id').notNull(), // References enterprise_sandboxes.id
  title: text('title').notNull(),
  contributor: text('contributor').notNull(),
  content_hash: text('content_hash').notNull(),
  text_content: text('text_content'),
  pdf_path: text('pdf_path'),
  status: text('status').notNull().default('evaluating'), // evaluating, qualified, unqualified
  category: text('category'),
  metals: jsonb('metals').$type<string[]>(),
  metadata: jsonb('metadata').$type<{
    coherence?: number;
    density?: number;
    redundancy?: number;
    pod_score?: number;
    novelty?: number;
    alignment?: number;
    qualified_founder?: boolean;
    qualified_epoch?: string | null;
    [key: string]: any;
  }>(),
  embedding: jsonb('embedding').$type<number[]>(),
  vector_x: numeric('vector_x', { precision: 20, scale: 10 }),
  vector_y: numeric('vector_y', { precision: 20, scale: 10 }),
  vector_z: numeric('vector_z', { precision: 20, scale: 10 }),
  embedding_model: text('embedding_model'),
  vector_generated_at: timestamp('vector_generated_at'),
  registered: boolean('registered').default(false),
  registration_date: timestamp('registration_date'),
  registration_tx_hash: text('registration_tx_hash'),
  stripe_payment_id: text('stripe_payment_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// System Broadcasts Table
export const systemBroadcastsTable = pgTable('system_broadcasts', {
  id: text('id').primaryKey(),
  message: text('message').notNull(),
  nature: text('nature').notNull().default('info'), // announcement, warning, info, success, milestone, alert, update
  is_active: boolean('is_active').default(true).notNull(),
  created_by: text('created_by').notNull(), // email of creator/operator
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'), // Optional expiration date
});

// Enterprise Sandbox Allocations Table
export const enterpriseAllocationsTable = pgTable('enterprise_allocations', {
  id: text('id').primaryKey(),
  sandbox_id: text('sandbox_id').notNull(), // References enterprise_sandboxes.id
  submission_hash: text('submission_hash').notNull(),
  contributor: text('contributor').notNull(),
  metal: text('metal').notNull(),
  epoch: text('epoch').notNull(),
  tier: text('tier'),
  reward: numeric('reward', { precision: 20, scale: 0 }).notNull(),
  tier_multiplier: numeric('tier_multiplier', { precision: 10, scale: 4 }).notNull().default('1.0'),
  epoch_balance_before: numeric('epoch_balance_before', { precision: 20, scale: 0 }).notNull(),
  epoch_balance_after: numeric('epoch_balance_after', { precision: 20, scale: 0 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// SYNTH Token Transactions Table
export const sandboxSynthTransactionsTable = pgTable('sandbox_synth_transactions', {
  id: text('id').primaryKey(),
  sandbox_id: text('sandbox_id').notNull().references(() => enterpriseSandboxesTable.id, { onDelete: 'cascade' }),
  transaction_type: text('transaction_type').notNull(), // activation, deposit, rent, energy, refund, withdrawal
  amount: numeric('amount', { precision: 20, scale: 0 }).notNull(),
  balance_before: numeric('balance_before', { precision: 20, scale: 0 }).notNull(),
  balance_after: numeric('balance_after', { precision: 20, scale: 0 }).notNull(),
  metadata: jsonb('metadata').$type<{
    [key: string]: any;
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Sandbox Metrics Table
export const sandboxMetricsTable = pgTable('sandbox_metrics', {
  sandbox_id: text('sandbox_id').primaryKey().references(() => enterpriseSandboxesTable.id, { onDelete: 'cascade' }),
  unique_contributors: integer('unique_contributors').default(0).notNull(),
  total_submissions: integer('total_submissions').default(0).notNull(),
  total_evaluations: integer('total_evaluations').default(0).notNull(),
  total_registrations: integer('total_registrations').default(0).notNull(),
  total_allocations: integer('total_allocations').default(0).notNull(),
  total_analytics_queries: integer('total_analytics_queries').default(0).notNull(),
  last_calculated_at: timestamp('last_calculated_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertSandboxSynthTransaction = typeof sandboxSynthTransactionsTable.$inferInsert;
export type SelectSandboxSynthTransaction = typeof sandboxSynthTransactionsTable.$inferSelect;
export type InsertSandboxMetrics = typeof sandboxMetricsTable.$inferInsert;
export type SelectSandboxMetrics = typeof sandboxMetricsTable.$inferSelect;

// Audit Log Table (for tracking destructive actions)
export const auditLogTable = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actor_email: text('actor_email').notNull(),
  actor_role: text('actor_role').notNull(),
  action_type: text('action_type').notNull(), // 'archive_reset', 'user_delete', 'user_soft_delete', 'role_grant', 'role_revoke'
  action_mode: text('action_mode'), // 'soft', 'hard' for resets/deletes
  target_type: text('target_type'), // 'archive', 'user', 'role'
  target_identifier: text('target_identifier'), // email, submission_hash, etc.
  affected_count: integer('affected_count'), // Number of records affected
  metadata: jsonb('metadata').$type<{
    confirmation_phrase?: string;
    ip_address?: string;
    user_agent?: string;
    [key: string]: any;
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertAuditLog = typeof auditLogTable.$inferInsert;
export type SelectAuditLog = typeof auditLogTable.$inferSelect;

// SynthChat: Collaborative Sandbox Chat System
// Chat Rooms Table (one per sandbox)
export const chatRoomsTable = pgTable('chat_rooms', {
  id: text('id').primaryKey(),
  sandbox_id: text('sandbox_id'), // null = syntheverse (default), otherwise enterprise_sandboxes.id
  name: text('name').notNull(), // Room name (e.g., "Syntheverse", "Enterprise Sandbox Name")
  description: text('description'), // Optional description
  created_by: text('created_by').notNull(), // Email of creator
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Chat Messages Table (sandbox-based collaborative chat)
export const chatMessagesTable = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  room_id: text('room_id').notNull(), // References chat_rooms.id
  sender_email: text('sender_email').notNull(), // Email of the sender
  sender_role: text('sender_role').notNull(), // 'contributor', 'operator', 'creator'
  message: text('message').notNull(),
  read: boolean('read').default(false), // Whether the message has been read (for notifications)
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Chat Participants Table (tracks who's in which room)
export const chatParticipantsTable = pgTable('chat_participants', {
  id: text('id').primaryKey(),
  room_id: text('room_id').notNull(), // References chat_rooms.id
  user_email: text('user_email').notNull(), // Email of participant
  role: text('role').notNull(), // 'contributor', 'operator', 'creator'
  joined_at: timestamp('joined_at').defaultNow().notNull(),
  last_read_at: timestamp('last_read_at'), // Last time user read messages in this room
});

export type InsertChatRoom = typeof chatRoomsTable.$inferInsert;
export type SelectChatRoom = typeof chatRoomsTable.$inferSelect;
export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
export type SelectChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatParticipant = typeof chatParticipantsTable.$inferInsert;
export type SelectChatParticipant = typeof chatParticipantsTable.$inferSelect;

// Blog Posts Table
export const blogPostsTable = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  author: text('author').notNull(), // Email of the author
  author_name: text('author_name'), // Display name of the author
  sandbox_id: text('sandbox_id').references(() => enterpriseSandboxesTable.id, { onDelete: 'cascade' }), // NULL for main blog, sandbox ID for sandbox-specific blogs
  status: text('status').notNull().default('draft'), // draft, published, archived
  published_at: timestamp('published_at'),
  featured: boolean('featured').default(false),
  tags: jsonb('tags').$type<string[]>(),
  metadata: jsonb('metadata').$type<{
    [key: string]: any;
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertBlogPost = typeof blogPostsTable.$inferInsert;
export type SelectBlogPost = typeof blogPostsTable.$inferSelect;
