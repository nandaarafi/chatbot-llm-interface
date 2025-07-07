// src/lib/db/query/chat-session.ts
import { db } from '@/lib/db';
import { chatSession } from '@/lib/db/schema/app';
import { eq, and } from 'drizzle-orm';

export const createChatSession = async (userId: string, title: string = "New Chat") => {
  return db.insert(chatSession)
    .values({
      userId,
      title,
      // Other fields will use their default values
    })
    .returning();
};

export const getChatSessionsByUserId = async (userId: string) => {
  return db.select()
    .from(chatSession)
    .where(eq(chatSession.userId, userId))
    .orderBy(chatSession.updatedAt);
};

export const updateChatSession = async (id: string, updates: { title?: string }) => {
  return db.update(chatSession)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(chatSession.id, id))
    .returning();
};