import { pgSchema, uuid, text, timestamp, boolean, 
    integer, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./auth";

const appSchema = pgSchema('app');

// Uploaded files (PDFs) - Renamed to "documents"
export const documents = appSchema.table('documents', {
    id: uuid('id').primaryKey(),  // Matches Python's document ID
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    s3Key: text('s3_key').notNull(),
    metadata: jsonb('metadata').notNull(),  // Store Python's metadata
    processed: boolean('processed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Folders (can be assigned to many chat sessions)
export const folders = appSchema.table('folders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat sessions
export const chatSession = appSchema.table('chat_session', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages in chat sessions
export const messages = appSchema.table('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id').notNull().references(() => chatSession.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table for many-to-many relationship between chat sessions and documents
export const chatSessionDocuments = appSchema.table('chat_session_documents', {
    chatSessionId: uuid('chat_session_id').notNull().references(() => chatSession.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export schema
export const app = {
    folders,
    chatSession,
    messages,
    documents,
    chatSessionDocuments
};

// Types
export type Folder = typeof folders.$inferSelect;
export type ChatSession = typeof chatSession.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ChatSessionDocument = typeof chatSessionDocuments.$inferSelect;
