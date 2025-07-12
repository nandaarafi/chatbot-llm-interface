'use client';

import { useEffect, useState } from 'react';
import { HomeClient } from '@/components/chat/home-client';
import { useChat } from 'ai/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { use } from 'react';


export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = use(params)
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Chat session not found');
            router.push('/chat');
            return;
          }
          throw new Error('Failed to fetch chat history');
        }

        const data = await response.json();
        console.log(data.messages)
        setInitialMessages(data || []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Failed to load chat history');
        router.push('/chat');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchChatHistory();
    }
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
              <div className="space-y-2 pl-10">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-4/6 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <div className="h-16 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <HomeClient 
        initialSessionId={sessionId}
        initialMessages={initialMessages}
      />
    </div>
  );
}