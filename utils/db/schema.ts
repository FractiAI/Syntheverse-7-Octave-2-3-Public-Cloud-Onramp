import { integer, pgTable, text, timestamp, jsonb, boolean, numeric, bigserial, uuid, serial } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  plan: text('plan').notNull(),
  stripe_id: text('stripe_id').notNull(),
  role: text('role').notNull().default('user'), // 'creator', 'operator', 'user'
  profile_picture_url: text('profile_picture_url'), // URL to profile picture in Supabase Storage
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
  category: text('category'), // scientific, tech, alignment, snap experience
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
  // Seed and Edge Detection (content-based), plus Sweet Spot Edge Detection (overlap-based)
  is_seed: boolean('is_seed').default(false), // Content exhibits seed characteristics (S₀-S₈) - receives 15% multiplier (×1.15)
  is_edge: boolean('is_edge').default(false), // Content exhibits edge characteristics (E₀-E₆) - receives 15% multiplier (×1.15)
  has_sweet_spot_edges: boolean('has_sweet_spot_edges').default(false), // Overlap in sweet spot range (9.2%-19.2%, centered at 14.2%) - receives bonus multiplier
  overlap_percent: numeric('overlap_percent', { precision: 5, scale: 2 }).default('0'), // Percentage overlap with archive (0-100)
  // TSRC: Content-addressed archive snapshot for deterministic evaluation
  snapshot_id: text('snapshot_id'), // SHA-256 hash of archive state at evaluation time (enables exact reproducibility)
  // THALET Protocol: Atomic Score (Single Source of Truth for scoring)
  atomic_score: jsonb('atomic_score').$type<{
    final: number; // [0, 10000] - SOVEREIGN FIELD
    execution_context: {
      toggles: {
        overlap_on: boolean;
        seed_on: boolean;
        edge_on: boolean;
        metal_policy_on: boolean;
      };
      seed: string; // Explicit entropy seed (UUID)
      timestamp_utc: string; // ISO 8601 UTC timestamp
      pipeline_version: string; // e.g., "2.0.0-thalet"
      operator_id: string; // e.g., "syntheverse-primary"
    };
    trace: {
      composite: number;
      penalty_percent: number;
      bonus_multiplier: number;
      seed_multiplier: number;
      edge_multiplier: number;
      formula: string;
      intermediate_steps: {
        after_penalty: number;
        after_bonus: number;
        after_seed: number;
        raw_final: number;
        clamped_final: number;
      };
    };
    integrity_hash: string; // SHA-256 hash for tamper detection
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertContribution = typeof contributionsTable.$inferInsert;
export type SelectContribution = typeof contributionsTable.$inferSelect;

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
  // Seed and Edge Detection (content-based), plus Sweet Spot Edge Detection (overlap-based)
  is_seed: boolean('is_seed').default(false), // Content exhibits seed characteristics (S₀-S₈) - receives 15% multiplier (×1.15)
  is_edge: boolean('is_edge').default(false), // Content exhibits edge characteristics (E₀-E₆) - receives 15% multiplier (×1.15)
  has_sweet_spot_edges: boolean('has_sweet_spot_edges').default(false), // Overlap in sweet spot range (9.2%-19.2%, centered at 14.2%) - receives bonus multiplier
  overlap_percent: numeric('overlap_percent', { precision: 5, scale: 2 }).default('0'), // Percentage overlap with archive (0-100)
  // TSRC: Content-addressed archive snapshot for deterministic evaluation
  snapshot_id: text('snapshot_id'), // SHA-256 hash of archive state at evaluation time (enables exact reproducibility)
  // THALET Protocol: Atomic Score (Single Source of Truth for scoring)
  atomic_score: jsonb('atomic_score').$type<{
    final: number; // [0, 10000] - SOVEREIGN FIELD
    execution_context: {
      toggles: {
        overlap_on: boolean;
        seed_on: boolean;
        edge_on: boolean;
        metal_policy_on: boolean;
      };
      seed: string; // Explicit entropy seed (UUID)
      timestamp_utc: string; // ISO 8601 UTC timestamp
      pipeline_version: string; // e.g., "2.0.0-thalet"
      operator_id: string; // e.g., "syntheverse-primary"
    };
    trace: {
      composite: number;
      penalty_percent: number;
      bonus_multiplier: number;
      seed_multiplier: number;
      edge_multiplier: number;
      formula: string;
      intermediate_steps: {
        after_penalty: number;
        after_bonus: number;
        after_seed: number;
        raw_final: number;
        clamped_final: number;
      };
    };
    integrity_hash: string; // SHA-256 hash for tamper detection
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertEnterpriseContribution = typeof enterpriseContributionsTable.$inferInsert;
export type SelectEnterpriseContribution = typeof enterpriseContributionsTable.$inferSelect;

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

// Audit Log Table (for tracking destructive actions + mode transitions)
export const auditLogTable = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actor_email: text('actor_email').notNull(),
  actor_role: text('actor_role').notNull(),
  action_type: text('action_type').notNull(), // 'archive_reset', 'user_delete', 'user_soft_delete', 'role_grant', 'role_revoke', 'mode_transition', 'score_config_update'
  action_mode: text('action_mode'), // 'soft', 'hard' for resets/deletes; 'manual', 'automatic' for mode transitions
  target_type: text('target_type'), // 'archive', 'user', 'role', 'scoring_config'
  target_identifier: text('target_identifier'), // email, submission_hash, config_key, etc.
  affected_count: integer('affected_count'), // Number of records affected
  metadata: jsonb('metadata').$type<{
    confirmation_phrase?: string;
    ip_address?: string;
    user_agent?: string;
    // Mode transition tracking
    mode_state_before?: {
      seed_on?: boolean;
      edge_on?: boolean;
      overlap_on?: boolean;
      metal_policy_on?: boolean;
      score_config_version?: string;
      [key: string]: any;
    };
    mode_state_after?: {
      seed_on?: boolean;
      edge_on?: boolean;
      overlap_on?: boolean;
      metal_policy_on?: boolean;
      score_config_version?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertAuditLog = typeof auditLogTable.$inferInsert;
export type SelectAuditLog = typeof auditLogTable.$inferSelect;

// WorkChat: Collaborative Sandbox Chat System
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

// Blog Permissions Table
export const blogPermissionsTable = pgTable('blog_permissions', {
  id: text('id').primaryKey().default('main'),
  allow_contributors: boolean('allow_contributors').default(false).notNull(),
  allow_operators: boolean('allow_operators').default(true).notNull(),
  allow_creator: boolean('allow_creator').default(true).notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  updated_by: text('updated_by'), // Email of creator who last updated
});

export type InsertBlogPermissions = typeof blogPermissionsTable.$inferInsert;
export type SelectBlogPermissions = typeof blogPermissionsTable.$inferSelect;

// Social Media Tables (Sandbox-Based Community Feeds)
export const socialPostsTable = pgTable('social_posts', {
  id: text('id').primaryKey(),
  sandbox_id: text('sandbox_id'), // null = syntheverse (default), otherwise enterprise_sandboxes.id
  author_email: text('author_email').notNull(),
  author_role: text('author_role').notNull(), // 'contributor', 'operator', 'creator'
  content: text('content').notNull(),
  image_url: text('image_url'),
  image_path: text('image_path'),
  likes_count: integer('likes_count').default(0).notNull(),
  comments_count: integer('comments_count').default(0).notNull(),
  is_pinned: boolean('is_pinned').default(false),
  is_deleted: boolean('is_deleted').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const socialPostLikesTable = pgTable('social_post_likes', {
  id: text('id').primaryKey(),
  post_id: text('post_id').notNull(), // References social_posts.id
  user_email: text('user_email').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const socialPostCommentsTable = pgTable('social_post_comments', {
  id: text('id').primaryKey(),
  post_id: text('post_id').notNull(), // References social_posts.id
  author_email: text('author_email').notNull(),
  author_role: text('author_role').notNull(), // 'contributor', 'operator', 'creator'
  content: text('content').notNull(),
  is_deleted: boolean('is_deleted').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertSocialPost = typeof socialPostsTable.$inferInsert;
export type SelectSocialPost = typeof socialPostsTable.$inferSelect;
export type InsertSocialPostLike = typeof socialPostLikesTable.$inferInsert;
export type SelectSocialPostLike = typeof socialPostLikesTable.$inferSelect;
export type InsertSocialPostComment = typeof socialPostCommentsTable.$inferInsert;
export type SelectSocialPostComment = typeof socialPostCommentsTable.$inferSelect;

// Scoring Configuration Table (for testing/tuning multipliers)
export const scoringConfigTable = pgTable('scoring_config', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  config_key: text('config_key').notNull().unique(),
  config_value: jsonb('config_value').notNull().$type<{
    // Mode toggles
    seed_enabled?: boolean;
    edge_enabled?: boolean;
    overlap_enabled?: boolean;
    metal_policy_enabled?: boolean;
    
    // Sweet spot parameters (HHF bridge - tunable, not dogmatic)
    sweet_spot_center?: number;      // Default: 0.142 (14.2%)
    sweet_spot_tolerance?: number;   // Default: 0.05 (±5%)
    penalty_threshold?: number;      // Default: 0.30 (30%)
    
    // Overlap operator declaration
    overlap_operator?: "axis" | "kiss" | "embedding_cosine" | "embedding_euclidean" | string;
    
    [key: string]: any;
  }>(),
  version: text('version').notNull().default('v1.0.0'), // Explicit versioning per Marek/Simba
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  updated_by: text('updated_by'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type InsertScoringConfig = typeof scoringConfigTable.$inferInsert;
export type SelectScoringConfig = typeof scoringConfigTable.$inferSelect;

// ============================================================================
// TSRC BøwTæCøre Gate Model Tables
// ============================================================================

// Layer -1: Proposal Envelopes (untrusted, no side-effects)
export const proposalEnvelopesTable = pgTable('proposal_envelopes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Core fields
  proposal_id: uuid('proposal_id').unique().notNull().defaultRandom(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  intent: text('intent').notNull(),
  action_type: text('action_type').notNull(), // 'score_poc_proposal', 'create_payment_session', etc.
  params: jsonb('params').notNull().default('{}'),
  
  // Trace
  run_id: text('run_id').notNull(),
  inputs_hash: text('inputs_hash').notNull(), // SHA-256 hex
  
  // Determinism contract
  provider: text('provider').notNull(), // 'groq', 'openai', etc.
  model: text('model').notNull(),
  temperature: numeric('temperature', { precision: 5, scale: 3 }).notNull(),
  prompt_hash: text('prompt_hash').notNull(), // SHA-256 hex
  content_hash: text('content_hash'),
  seed: integer('seed'),
  score_config_id: text('score_config_id').notNull(),
  archive_snapshot_id: text('archive_snapshot_id').notNull(),
  mode_state: text('mode_state'), // 'growth', 'saturation', 'safe_mode', 'validation'
  
  // Score toggles
  seed_on: boolean('seed_on').default(false),
  edge_on: boolean('edge_on').default(false),
  overlap_on: boolean('overlap_on').default(false),
  
  // Metadata (matches production types)
  created_at: timestamp('created_at').notNull().defaultNow(),
  user_id: text('user_id'), // TEXT to match users_table.id
  submission_hash: text('submission_hash'), // TEXT to match contributions.submission_hash
  
  // Status tracking
  status: text('status').notNull().default('pending'), // 'pending', 'projected', 'authorized', 'executed', 'vetoed', 'rejected'
});

export type InsertProposalEnvelope = typeof proposalEnvelopesTable.$inferInsert;
export type SelectProposalEnvelope = typeof proposalEnvelopesTable.$inferSelect;

// Layer 0a: Projected Commands (deterministic projector/veto)
export const projectedCommandsTable = pgTable('projected_commands', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Core identifiers
  projection_id: uuid('projection_id').unique().notNull().defaultRandom(),
  proposal_id: uuid('proposal_id').notNull(), // FK to proposal_envelopes
  
  // Policy tracking
  kman_hash: text('kman_hash').notNull(), // Capability manifest hash
  bset_hash: text('bset_hash').notNull(), // Forbidden action set hash
  policy_seq: integer('policy_seq').notNull(), // Monotonically increasing
  
  // Mode and closure
  mode_id: text('mode_id').notNull(), // 'normal', 'safe_mode', 'validation'
  closure_op: text('closure_op').notNull(), // 'axis', 'kiss', 'custom'
  closure_d_def: text('closure_d_def').notNull(),
  closure_d: integer('closure_d').notNull(),
  
  // Action
  action_type: text('action_type').notNull(),
  params: jsonb('params').notNull().default('{}'),
  
  // Risk and artifact classification
  risk_tier: integer('risk_tier').notNull(), // 0, 1, 2, 3
  artifact_sink_ref: text('artifact_sink_ref'),
  artifact_class: text('artifact_class').notNull(), // 'data', 'control', 'na'
  
  // Checks and veto
  checks_passed: text('checks_passed').array().default([]),
  is_veto: boolean('is_veto').notNull().default(false),
  veto_reason: text('veto_reason'),
  
  // Metadata
  created_at: timestamp('created_at').notNull().defaultNow(),
  projected_at: timestamp('projected_at').notNull().defaultNow(),
  
  // Status
  status: text('status').notNull().default('pending'), // 'pending', 'authorized', 'executed', 'vetoed'
});

export type InsertProjectedCommand = typeof projectedCommandsTable.$inferInsert;
export type SelectProjectedCommand = typeof projectedCommandsTable.$inferSelect;

// Layer 0b: Authorizations (minimal authorizer with counters/leases/signatures)
export const authorizationsTable = pgTable('authorizations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // Core identifiers
  command_id: uuid('command_id').unique().notNull().defaultRandom(),
  projection_id: uuid('projection_id').notNull(), // FK to projected_commands
  
  // Timing
  issued_at: timestamp('issued_at').notNull().defaultNow(),
  lease_id: uuid('lease_id').notNull(),
  lease_valid_for_ms: integer('lease_valid_for_ms').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  
  // Anti-replay counter
  cmd_counter: bigserial('cmd_counter', { mode: 'number' }).notNull(),
  
  // Policy tracking
  kman_hash: text('kman_hash').notNull(),
  bset_hash: text('bset_hash').notNull(),
  policy_seq: integer('policy_seq').notNull(),
  
  // Mode and closure
  mode_id: text('mode_id').notNull(),
  closure_op: text('closure_op').notNull(),
  closure_d_def: text('closure_d_def').notNull(),
  closure_d: integer('closure_d').notNull(),
  
  // Action
  action_type: text('action_type').notNull(),
  params: jsonb('params').notNull().default('{}'),
  
  // Signature
  sig_alg: text('sig_alg').notNull(), // 'hmac-sha256', 'ed25519'
  sig_canonicalization: text('sig_canonicalization').notNull(), // 'jcs-rfc8785'
  sig_key_id: text('sig_key_id').notNull(),
  sig_payload_hash: text('sig_payload_hash').notNull(),
  sig_b64: text('sig_b64').notNull(),
  
  // Status tracking
  status: text('status').notNull().default('pending'), // 'pending', 'executed', 'expired', 'revoked'
  executed_at: timestamp('executed_at'),
  execution_result: jsonb('execution_result'),
});

export type InsertAuthorization = typeof authorizationsTable.$inferInsert;
export type SelectAuthorization = typeof authorizationsTable.$inferSelect;

// Command Counter Management (anti-replay)
export const commandCountersTable = pgTable('command_counters', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  counter_scope: text('counter_scope').notNull(), // 'global', 'per_action_type', 'per_user'
  scope_key: text('scope_key'), // NULL for global, action_type or user_id for scoped
  
  current_counter: bigserial('current_counter', { mode: 'number' }).notNull().default(0),
  last_incremented_at: timestamp('last_incremented_at').notNull().defaultNow(),
  
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export type InsertCommandCounter = typeof commandCountersTable.$inferInsert;
export type SelectCommandCounter = typeof commandCountersTable.$inferSelect;

// Lease Management
export const leasesTable = pgTable('leases', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  lease_id: uuid('lease_id').unique().notNull().defaultRandom(),
  issued_at: timestamp('issued_at').notNull().defaultNow(),
  valid_for_ms: integer('valid_for_ms').notNull(),
  expires_at: timestamp('expires_at').notNull(),
  
  authorization_id: bigserial('authorization_id', { mode: 'number' }), // FK to authorizations
  
  status: text('status').notNull().default('active'), // 'active', 'expired', 'revoked'
  revoked_at: timestamp('revoked_at'),
  revoke_reason: text('revoke_reason'),
  
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type InsertLease = typeof leasesTable.$inferInsert;
export type SelectLease = typeof leasesTable.$inferSelect;

// Policy Versions (monotonic)
export const policyVersionsTable = pgTable('policy_versions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  policy_seq: integer('policy_seq').unique().notNull(),
  kman_hash: text('kman_hash').notNull(),
  bset_hash: text('bset_hash').notNull(),
  
  kman_content: jsonb('kman_content').notNull(), // Capability manifest
  bset_content: jsonb('bset_content').notNull(), // Forbidden action set
  
  effective_at: timestamp('effective_at').notNull().defaultNow(),
  superseded_at: timestamp('superseded_at'),
  
  created_by: text('created_by'),
  justification: text('justification'),
  
  // Governance
  requires_governance: boolean('requires_governance').default(false),
  approved_by: text('approved_by').array().default([]),
  approval_threshold: integer('approval_threshold'),
  
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type InsertPolicyVersion = typeof policyVersionsTable.$inferInsert;
export type SelectPolicyVersion = typeof policyVersionsTable.$inferSelect;

// Layer +1: Execution Audit Log (fail-closed executor records)
export const executionAuditLogTable = pgTable('execution_audit_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  
  // References
  command_id: uuid('command_id').notNull(), // FK to authorizations
  authorization_id: bigserial('authorization_id', { mode: 'number' }).notNull(), // FK to authorizations
  projection_id: uuid('projection_id').notNull(),
  proposal_id: uuid('proposal_id').notNull(),
  
  // Execution details
  executed_at: timestamp('executed_at').notNull().defaultNow(),
  action_type: text('action_type').notNull(),
  params: jsonb('params').notNull().default('{}'),
  
  // Result
  success: boolean('success').notNull(),
  result: jsonb('result'),
  error_message: text('error_message'),
  error_code: text('error_code'),
  
  // Side effects (what actually happened)
  db_writes: jsonb('db_writes'), // Tables/rows affected
  payment_created: jsonb('payment_created'), // Payment session details
  blockchain_tx: jsonb('blockchain_tx'), // Transaction hash/details
  
  // Verification trace
  counter_verified: boolean('counter_verified').notNull(),
  lease_verified: boolean('lease_verified').notNull(),
  policy_verified: boolean('policy_verified').notNull(),
  signature_verified: boolean('signature_verified').notNull(),
  
  // Duration
  duration_ms: integer('duration_ms'),
  
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type InsertExecutionAuditLog = typeof executionAuditLogTable.$inferInsert;
export type SelectExecutionAuditLog = typeof executionAuditLogTable.$inferSelect;
