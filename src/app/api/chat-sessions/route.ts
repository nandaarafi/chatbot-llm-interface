// src/app/api/chat-sessions/route.ts
import { db } from '@/lib/db';
import { chatSession } from '@/lib/db/schema/app';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

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