'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Globe, Pause, Send, X, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadDialog } from "@/components/upload-dialog";
import { useChat } from 'ai/react';
import { toast } from "sonner"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HomeClientProps {
  suggestedQuestions: string[];
  moreQuestions: string[];
}

export function HomeClient({ suggestedQuestions, moreQuestions }: HomeClientProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({
    api: '/api/chat',
    body: {
      // This will be included in the request body
      file: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
        // We'll handle the file content in the API route
      } : undefined,
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploadDialogOpen(false);
  };

  const handleQuestionClick = (question: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    append({ role: 'user', content: question });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // If there's a file, append it to the form data
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('message', input);
  
    // Use the form data in the request
    fetch('/api/chat', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        return response.json();
      })
      .then(data => {
        // Handle the response
        append({ role: 'assistant', content: data.message });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                }`}
              >
                <div className="font-semibold">
                  {message.role === 'user' ? 'You' : 'AI'}:
                </div>
                <div>{message.content}</div>
              </div>
            ))
          ) : (
            <>
              {/* Suggested Questions Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Questions about this PDF</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto min-h-[60px] text-left whitespace-normal"
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* More Questions Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium">More questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {moreQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto min-h-[60px] text-left whitespace-normal justify-start"
                      onClick={() => handleQuestionClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input Footer */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2">

          <Button variant="outline" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
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
          
          <form onSubmit={onSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask assistant, use @ to mention specific PDFs..."
              className="min-h-[60px] pr-16 resize-none"
              rows={1}
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
      />
    </div>
  );
}