import { serial, integer, text, decimal, timestamp, index, pgTable, pgSchema } from 'drizzle-orm/pg-core';
const appSchema = pgSchema('app');
export const tokenUsage = appSchema.table('token_usage', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // From auth
  model: text('model').notNull(), // e.g., 'gpt-4o-mini-2024-07-18', 'gemini-2.0-flash-001'
  provider: text('provider').notNull(), // 'openai', 'google'
  operation: text('operation').notNull(), // 'chat', 'summary', 'quick_start_questions'
  
  // Token counts
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  
  // Cost tracking (in USD, stored as decimal for precision)
  inputCost: decimal('input_cost', { precision: 10, scale: 6 }).notNull().default('0.000000'),
  outputCost: decimal('output_cost', { precision: 10, scale: 6 }).notNull().default('0.000000'),
  totalCost: decimal('total_cost', { precision: 10, scale: 6 }).notNull().default('0.000000'),
  
  // Context information
  videoId: text('video_id'), // YouTube video ID if applicable
  userVideoId: integer('user_video_id'), // Reference to user_videos table
  
  // Metadata
  requestDuration: integer('request_duration'), // in milliseconds
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('token_usage_user_id_idx').on(table.userId),
  createdAtIdx: index('token_usage_created_at_idx').on(table.createdAt),
  modelIdx: index('token_usage_model_idx').on(table.model),
  operationIdx: index('token_usage_operation_idx').on(table.operation),
}));

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;