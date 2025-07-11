// src/app/api/chat-sessions/[sessionId]/messages/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { db } from '@/lib/db';
import { messages, chatSession } from '@/lib/db/schema/app';
import { eq, and } from 'drizzle-orm';
import { getMessagesBySessionId } from '@/lib/db/query/message';

// POST - Add a new message to a session
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { role, content } = await request.json();
    
    // Verify the session exists and belongs to the user
    const [sessionExists] = await db
      .select()
      .from(chatSession)
      .where(
        and(
          eq(chatSession.id, params.sessionId),
          eq(chatSession.userId, session.user.id)
        )
      );

    if (!sessionExists) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    // Create the message
    const [newMessage] = await db.insert(messages)
      .values({
        sessionId: params.sessionId,
        role,
        content,
      })
      .returning();

    // Update the session's updatedAt timestamp
    await db.update(chatSession)
      .set({ updatedAt: new Date() })
      .where(eq(chatSession.id, params.sessionId));

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await the params object before using sessionId
    const { sessionId } = await params
    console.log(sessionId)

    // Get the session with messages
    const messages = await getMessagesBySessionId(sessionId)
    console.log(messages)

    if (!messages) {
      return new NextResponse('Session not found', { status: 404 });
    }

    // Return the messages array directly
    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}