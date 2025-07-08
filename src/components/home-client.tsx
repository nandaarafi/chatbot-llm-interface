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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

  const [selectedDocuments, setSelectedDocuments] = useState<Array<{id: string, name: string}>>([]);

  const handleDocumentSelect = (docId: string) => {
    try {
      // Find the selected document
      const selectedDoc = documents.find(doc => doc.id === docId);
      if (!selectedDoc) {
        console.error('Document not found');
        toast.error('Selected document not found');
        return;
      }
      
      // Check if document is already selected
      if (selectedDocuments.some(doc => doc.id === docId)) {
        toast.info('Document already selected');
        return;
      }
      
      // Add to selected documents
      setSelectedDocuments(prev => [...prev, selectedDoc]);
      
      toast.success(`Added: ${selectedDoc.name}`);
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
    handleInputChange: originalHandleInputChange, 
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

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ x: 100, y: 100 });
  const commandRef = useRef<HTMLDivElement>(null);

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
            <div className="flex flex-wrap gap-2">
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
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setShowMentionDropdown(false);
                    handleSubmit(e as any);
                  } else if (e.key === 'Escape' && showMentionDropdown) {
                    e.preventDefault();
                    setShowMentionDropdown(false);
                  } else if (showMentionDropdown && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                    e.preventDefault();
                    // Command component handles keyboard navigation
                  }
                }}
                placeholder="Ask assistant, use @ to mention specific PDFs..."
                className="min-h-[60px] pr-16 resize-none"
                disabled={isLoading}
              />
              
              {/* Mention Dropdown */}
              {showMentionDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-full max-w-md">
                  <Command className="w-full rounded-lg border bg-popover shadow-md">
                    <CommandInput 
                      placeholder="Search documents..."
                      value={mentionQuery}
                      onValueChange={setMentionQuery}
                      autoFocus
                    />
                    <CommandList className="max-h-60 overflow-auto">
                      <CommandEmpty>No documents found.</CommandEmpty>
                      <CommandGroup>
                        {documents
                          .filter(doc => 
                            doc.name.toLowerCase().includes(mentionQuery.toLowerCase()) &&
                            !selectedDocuments.some(selected => selected.id === doc.id)
                          )
                          .map((doc) => (
                            <CommandItem
                              key={doc.id}
                              onSelect={() => handleDocumentMention(doc.name)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{doc.name}</span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
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