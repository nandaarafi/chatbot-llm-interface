'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Globe, Pause, Send, X, Plus, ChevronDown, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadDialog } from "@/components/chat/upload-dialog";
import { useChat } from 'ai/react';
import { toast } from "sonner"
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getDocumentsByUserId } from '@/lib/db/query/document';
import { DocumentDropdown } from './document-dropdown';


interface HomeClientProps {
  suggestedQuestions?: string[];
  moreQuestions?: string[];
  initialSessionId?: string;
  initialMessages?: any[];
}

type Document = {
  id: string;
  name: string;
};

export function HomeClient({  
  suggestedQuestions = [], 
  moreQuestions = [],
  initialSessionId,
  initialMessages = []
 }: HomeClientProps) {
  const router = useRouter()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const session = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatId = "home-chat";
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const [documents, setDocuments] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDocumentDropdownOpen, setIsDocumentDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ x: 100, y: 100 });
  const commandRef = useRef<HTMLDivElement>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const { 
    messages, 
    input, 
    handleInputChange: originalHandleInputChange, 
    handleSubmit: chatHandleSubmit, 
    append, 
    isLoading: chatIsLoading, 
    setInput,
    setMessages,
    stop
  } = useChat({
    api: '/api/chat',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: {
      doc_id: "319e6e41-fc39-4a28-870d-c7f44a9570c4",
      force_web_search: false,
      session_id: currentSessionId,
    },
    initialMessages: initialMessages,
    onResponse: async (response) => {
      console.log('Chat API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      console.log("Get Current Session: ", currentSessionId)
      if (currentSessionId) {
        console.log('Saving user message to session:', { currentSessionId, message: input.trim() });
        try {
          await fetchWithAuth(`/api/chat-sessions/${currentSessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              role: 'user',
              content: input.trim(),
            }),
          });
          console.log('Successfully saved user message');
        } catch (error) {
          console.error('Failed to save user message:', error);
        }
      }
    },
    onFinish: async (message) => {
      console.log('Chat stream finished. Final message:', message);
      if (currentSessionId) {
        console.log('Saving assistant message to session:', { currentSessionId, message: message.content });
        try {
          await fetchWithAuth(`/api/chat-sessions/${currentSessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
              role: 'assistant',
              content: message.content,
            }),
          });
          console.log('Successfully saved assistant message');
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Chat error occurred:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      toast.error(
        error.message || "An error occurred while processing your message"
      );
    },
  });

  const handleNewMessage = (message: any) => {
    setMessages((prevMessages) => [...prevMessages, message]); // Add new message to the state
  };

  const handleDocumentSelect = (doc: Document) => {
    try {
      // Check if document is already selected
      if (selectedDocuments.some(d => d.id === doc.id)) {
        toast.info('Document already selected');
        return;
      }
      
      // Add to selected documents
      setSelectedDocuments(prev => [...prev, { id: doc.id, name: doc.name }]);
      toast.success(`Added: ${doc.name}`);
    } catch (error) {
      console.error('Error selecting document:', error);
      toast.error('Failed to select document');
    }
  };

  const removeDocument = (docId: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== docId));
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
      console.log('Creating new chat session...');
      const newSession = await fetchWithAuth('/api/chat-sessions', {
        method: 'POST',
      });
      
      if (!newSession || !newSession.id) {
        throw new Error('Invalid session data received from server');
      }
      
      console.log('New session created in createNewSession:', newSession.id);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to create chat session');
      throw error;
    }
  };

  


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Check if "@" was just typed
    const lastChar = value[value.length - 1];
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastChar === '@') {
      const textarea = textareaRef.current;
      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        const textareaStyle = window.getComputedStyle(textarea);
        const lineHeight = parseInt(textareaStyle.lineHeight);
        const paddingTop = parseInt(textareaStyle.paddingTop);
        const scrollTop = textarea.scrollTop;
        
        // Calculate position for dropdown
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'pre';
        tempElement.style.font = textareaStyle.font;
        tempElement.style.padding = textareaStyle.padding;
        tempElement.textContent = textBeforeCursor;
        document.body.appendChild(tempElement);
        
        const width = tempElement.offsetWidth;
        const lines = textBeforeCursor.split('\n');
        const lineNumber = lines.length;
        const top = rect.top + paddingTop + (lineNumber * lineHeight) - scrollTop;
        
        document.body.removeChild(tempElement);
        
        setMentionPosition({ x: rect.left + width, y: top });
        setShowMentionDropdown(true);
        setMentionQuery('');
      }
    } else if (showMentionDropdown && lastAtPos !== -1) {
      // If dropdown is open, update the search query
      const query = textBeforeCursor.substring(lastAtPos + 1);
      setMentionQuery(query);
    } else if (showMentionDropdown) {
      setShowMentionDropdown(false);
    }
    originalHandleInputChange(e);
  };

  const handleDocumentMention = (docName: string) => {
    if (!textareaRef.current) return;
    
    // Find the document in the documents array
    const selectedDoc = documents.find(doc => doc.name === docName);
    
    if (selectedDoc) {
      // Check if document is already selected
      if (!selectedDocuments.some(doc => doc.id === selectedDoc.id)) {
        setSelectedDocuments(prev => [...prev, selectedDoc]);
        toast.success(`Added: ${docName}`);
      } else {
        toast.info(`${docName} is already selected`);
      }
    }
    
    // Remove the @mention from input
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const value = textarea.value;
    const textBeforeCursor = value.substring(0, startPos);
    
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const newText = 
        value.substring(0, lastAtPos) + 
        value.substring(startPos);
      
      setInput(newText);
      
      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lastAtPos, lastAtPos);
      }, 0);
    }
    
    setShowMentionDropdown(false);
  };

  // Close dropdown when clicking outside
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // This effect runs once when the component is mounted to set the initial messages
    setMessages(initialMessages);
    console.log(messages)
  }, [initialMessages]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || chatIsLoading || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // If we're in a session page, we already have a sessionId from the URL
      let sessionId = currentSessionId;
      
      // Only create a new session if we're not in a session page
      if (!sessionId && !initialSessionId) {
        sessionId = await createNewSession();
        // If we created a new session, redirect to the session page
        if (sessionId) {
          router.push(`/chat/${sessionId}`);
        }
      } else {
        // Use the session ID from the URL
        sessionId = initialSessionId || sessionId;
      }
  
      if (!sessionId) {
        throw new Error('Failed to create or get session ID');
      }
  
      // Manually append the message with the correct session ID
      await append({
        content: input,
        role: 'user',
      }, {
        options: {
          body: {
            session_id: sessionId,
            doc_id: "319e6e41-fc39-4a28-870d-c7f44a9570c4",
            force_web_search: false,
          }
        }
      });
  
      setInput('');
    } catch (error) {
      console.error('Error in chat submission:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Set the input and trigger submission
    setInput(question);
  };

  const handleFileUpload = (files: File[]) => {
    const newDocuments = files.map(file => ({
      id: file.name,
      name: file.name
    }));
    setSelectedDocuments(prev => [...prev, ...newDocuments]);
    setIsUploadDialogOpen(false);
    toast.success(`Added ${files.length} file(s) successfully`);
  };

  return (
    
<div className="flex flex-col w-full sm:w-[500px] md:w-[700px] lg:w-[1000px] mx-auto h-[calc(100vh-4rem)] bg-background px-4 sm:px-8 md:px-16 lg:px-30 items-center">

{/* Chat Messages */}
<div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 pb-0 w-full">
  <div className="w-full space-y-6">
    {messages.length === 0 ? (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center p-4 text-muted-foreground w-full">
        <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
        <p className="mb-6">Ask me anything or select a suggested question below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mb-8">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 text-left justify-start whitespace-normal w-full"
              onClick={() => handleQuestionClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    ) : (
      <>
        {messages.map((message) => (
          <div key={message.id} className="w-full">
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={chatIsLoading && messages[messages.length - 1]?.id === message.id}
            />
          </div>
        ))}
        {chatIsLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="w-full">
            <ThinkingMessage />
          </div>
        )}
      </>
    )}
    <div ref={messagesEndRef} className="h-4" />
  </div>
</div>

{/* Input Area */}
<div className="border-t p-4 bg-background w-full flex-shrink-0">
  <div className="w-full space-y-3">
    <div className="flex items-start gap-2">
      <DocumentDropdown 
        selectedDocuments={selectedDocuments}
        onSelect={handleDocumentSelect}
        onRemove={removeDocument}
      />
      <div className="flex-1 flex flex-wrap gap-2">
        {selectedDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-sm">
            <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[160px]">
              {doc.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full hover:bg-background/50 hover:text-foreground/80"
              onClick={(e) => {
                e.stopPropagation();
                removeDocument(doc.id);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {file && (
          <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-sm">
            <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[160px]">
              {file.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full hover:bg-background/50 hover:text-foreground/80"
              onClick={() => setFile(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>

    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !chatIsLoading && !isSubmitting) {
              e.preventDefault();
              setShowMentionDropdown(false);
              handleSubmit(e as any);
            } else if (e.key === 'Escape' && showMentionDropdown) {
              e.preventDefault();
              setShowMentionDropdown(false);
            } else if (showMentionDropdown && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
              e.preventDefault();
            }
          }}
          placeholder="Ask assistant to mention specific PDFs... use the Plus Button to do that"
          className="min-h-[60px] pr-16 resize-none w-full"
          disabled={chatIsLoading || isSubmitting}
        />
      </div>
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
          disabled={!input.trim() || chatIsLoading || isSubmitting}
        >
          {chatIsLoading || isSubmitting ? (
            <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
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