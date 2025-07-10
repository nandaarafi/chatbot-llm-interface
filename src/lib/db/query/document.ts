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
export const getDocumentById = async (documentId: string) => {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    return document;
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
 * Get all documents for a specific user
 * @param userId The ID of the user
 * @returns Array of document objects
 */
export const getDocumentsByUserId = async (userId: string) => {
  try {
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt)); // Most recent first
    
    return userDocuments;
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw new Error('Failed to retrieve user documents');
  }
};

/**
 * Get documents with pagination
 * @param userId The ID of the user
 * @param limit Number of documents per page
 * @param offset Number of documents to skip
 * @returns Paginated list of documents and total count
 */
export const getPaginatedUserDocuments = async (
  userId: string, 
  limit: number = 10, 
  offset: number = 0
) => {
  try {
    const [documentsList, total] = await Promise.all([
      // Get paginated documents
      db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt))
        .limit(limit)
        .offset(offset),
      
      // Get total count
      db
        .select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(eq(documents.userId, userId))
    ]);

    return {
      documents: documentsList,
      total: total[0]?.count || 0
    };
  } catch (error) {
    console.error('Error getting paginated documents:', error);
    throw new Error('Failed to retrieve paginated documents');
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