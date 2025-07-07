// src/lib/db/query/message.ts
import { db } from '@/lib/db';
import { messages, chatSession } from '@/lib/db/schema/app';
import { eq, and } from 'drizzle-orm';

export const createMessage = async (message: {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}) => {
  const [newMessage] = await db.insert(messages)
    .values(message)
    .returning();
  
  // Update the session's updatedAt timestamp
  await db.update(chatSession)
    .set({ updatedAt: new Date() })
    .where(eq(chatSession.id, message.sessionId));
  
  return newMessage;
};

export const getMessagesBySessionId = async (sessionId: string) => {
  return db.select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt);
};