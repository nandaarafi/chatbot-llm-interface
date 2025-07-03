import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
const documentStatusEnum = pgEnum('document_status', ['uploaded', 'processing', 'processed', 'failed']);
const messageRoleEnum = pgEnum('message_role', ['system', 'user', 'assistant']);

// Users table (referenced in other tables)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Add other user fields as needed
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  storagePath: text('storage_path').notNull(),
  status: documentStatusEnum('status').default('uploaded').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  fileType: varchar('file_type', { length: 10 }).notNull(),
  pageCount: integer('page_count'),
  chunkCount: integer('chunk_count'),
  metadata: jsonb('metadata'),
});

// Document chunks table
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  vectorId: text('vector_id').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  tokenCount: integer('token_count').notNull(),
  metadata: jsonb('metadata'),
});

// Chat sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  settings: jsonb('settings'),
});

// Junction table for chat-document relationships
export const chatDocuments = pgTable('chat_documents', {
  chatId: uuid('chat_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => {
  return {
    pk: { primaryKey: { columns: [table.chatId, table.documentId] } },
  };
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata'),
  referenceDocumentId: uuid('reference_document_id').references(() => documents.id, { onDelete: 'set null' }),
  referenceChunkIndex: integer('reference_chunk_index'),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type ChatDocument = typeof chatDocuments.$inferSelect;
export type NewChatDocument = typeof chatDocuments.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;