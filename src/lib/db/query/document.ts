import { and, eq, desc, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema/app';
import type { Document } from '@/lib/db/schema/app';

/**
 * Create a new document record in the database
 */
export const createDocument = async (documentData: Document) => {
  try {
    const [newDocument] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return newDocument;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document record');
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (id: string) => {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    return document || null;
  } catch (error) {
    console.error('Error getting document by ID:', error);
    throw new Error('Failed to retrieve document');
  }
};

/**
 * Get all documents for a specific user
 */
export const getDocumentByUserId = async (userId: string) => {
  try {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error('Error getting documents by user ID:', error);
    throw new Error('Failed to retrieve user documents');
  }
};

/**
 * Delete a document record
 */
export const deleteDocument = async (id: string) => {
  try {
    const [deletedDocument] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return deletedDocument;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
};

/**
 * Delete all documents for a specific user
 */
export const deleteDocumentByUserId = async (userId: string) => {
  try {
    await db
      .delete(documents)
      .where(eq(documents.userId, userId));
    return true;
  } catch (error) {
    console.error('Error deleting documents by user ID:', error);
    throw new Error('Failed to delete user documents');
  }
};

export type { Document } from '@/lib/db/schema/app';