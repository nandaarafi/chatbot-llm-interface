'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Globe, Pause, Send, X, Plus, ChevronDown, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadDialog } from "@/components/upload-dialog";
import { useChat } from 'ai/react';
import { toast } from "sonner"
import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HomeClientProps {
  suggestedQuestions: string[];
  moreQuestions: string[];
}

export function HomeClient({ suggestedQuestions, moreQuestions }: HomeClientProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const session = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatId = "home-chat";
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  // Dummy list of documents
  const documents = [
    { id: 'doc-1', name: 'Project_Proposal.pdf' },
    { id: 'doc-2', name: 'Meeting_Notes_April.pdf' },
    { id: 'doc-3', name: 'Financial_Report_2023.pdf' },
    { id: 'doc-4', name: 'Product_Roadmap.pdf' },
    { id: 'doc-5', name: 'User_Research.pdf' },
  ];

  const handleDocumentSelect = (docId: string) => {
    // Handle document selection here
    console.log('Selected document ID:', docId);
    // You can add your logic here, for example, to load the selected document
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  };

  const createNewSession = async () => {
    try {
      const newSession = await fetchWithAuth('/api/chat-sessions', {
        method: 'POST',
      });
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to create chat session');
      throw error;
    }
  };

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit: chatHandleSubmit, 
    append, 
    isLoading, 
    setInput,
    setMessages,
    stop
  } = useChat({
    api: 'http://localhost:8000/chat/stream',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: {
      doc_id: "688ade13-d5b1-4480-9b45-4d7af0fdc3a2",
      force_web_search: false,
      session_id: currentSessionId,
    },
    onResponse: async (response) => {
      if (input.trim() && currentSessionId) {
        try {
          await fetchWithAuth(`/api/chat-sessions/${currentSessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              role: 'user',
              content: input.trim(),
            }),
          });
        } catch (error) {
          console.error('Failed to save user message:', error);
        }
      }
    },
    onFinish: async (message) => {
      if (currentSessionId) {
        try {
          await fetchWithAuth(`/api/chat-sessions/${currentSessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              role: 'assistant',
              content: message.content,
            }),
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error(
        error.message || "An error occurred while processing your message"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    try {
      // Create a new session if one doesn't exist
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession();
      }

      // Proceed with the chat submission
      chatHandleSubmit(e);
    } catch (error) {
      console.error('Error in chat submission:', error);
    }
  };

  const handleQuestionClick = async (question: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Set the input and trigger submission
    setInput(question);
    // Use a small timeout to ensure the input is updated before submission
    setTimeout(() => {
      const fakeEvent = {
        preventDefault: () => {},
        target: { elements: [{ value: question }] },
      } as unknown as React.FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }, 100);
  };

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploadDialogOpen(false);
  };

  return (
    
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Chat Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="mb-6">Ask me anything or select a suggested question below.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 text-left justify-start whitespace-normal"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="w-full">
              <PreviewMessage
                key={message.id}
                chatId={chatId}
                message={message}
                isLoading={isLoading && messages[messages.length - 1]?.id === message.id}
              />
            </div>
          ))}

          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
            <div className="w-full">
              <ThinkingMessage />
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {documents.map((doc) => (
                  <DropdownMenuItem 
                    key={doc.id} 
                    onClick={() => handleDocumentSelect(doc.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{doc.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {file && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
                  <span>{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask assistant, use @ to mention specific PDFs..."
              className="min-h-[60px] pr-16 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="font-semibold">Upload PDF</p>
                  <p className="text-xs">Less than 150 pages and 15 MB per file</p>
                </TooltipContent>
              </Tooltip>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-primary text-primary-foreground"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onFileUpload={handleFileUpload}
        sessionId={chatId}
      />
    </div>
  );
}