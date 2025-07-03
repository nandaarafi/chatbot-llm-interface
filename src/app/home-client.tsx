"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Globe, Pause, Send, X, Plus } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { UploadDialog } from "@/components/upload-dialog";
import { useState } from 'react';
import { toast } from "sonner"

interface HomeClientProps {
  suggestedQuestions: string[];
  moreQuestions: string[];
}

export function HomeClient({ suggestedQuestions, moreQuestions }: HomeClientProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Suggested Questions Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Questions about this PDF</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto min-h-[60px] text-left whitespace-normal"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>

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
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Footer */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
              <span>The Developer's Gui...</span>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Textarea
              placeholder="Ask assistant, use @ to mention specific PDFs..."
              className="min-h-[60px] pr-16 resize-none"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pause className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <UploadDialog 
        open={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen} 
      />
    </div>
  );
}
