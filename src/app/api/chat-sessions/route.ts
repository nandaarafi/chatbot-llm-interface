// src/app/api/chat-sessions/route.ts
import { db } from '@/lib/db';
import { chatSession } from '@/lib/db/schema/app';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function POST() {
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
      // Create a new chat session
      const [newSession] = await db.insert(chatSession)
        .values({
          userId: session.user.id,
          title: 'New Chat', // Default title, can be updated later
        })
        .returning();
  
      return NextResponse.json(newSession);
    } catch (error) {
      console.error('Error creating chat session:', error);
      return NextResponse.json(
        { error: 'Failed to create chat session' },
        { status: 500 }
      );
    }
  }

  export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      // use your helper to fetch all sessions for this user
      const sessions = await db.select().from(chatSession).where(eq(chatSession.userId, session.user.id));
      return NextResponse.json(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:',   error);
      return NextResponse.json({ error: 'Failed to load chat sessions' }, { status: 500 });
    }
  }