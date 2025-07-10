"use client";

import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { MultimodalInput } from "@/components/chat/multi-modal-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ToolInvocation } from "ai";
import { useChat } from "ai/react";
import { toast } from "sonner";

export function Chat() {
  const chatId = "001";

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
} = useChat({
    api: 'http://localhost:8000/chat/stream', // Update with your FastAPI server URL
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: {
      doc_id: "f9d0f262-3a39-4a16-bcef-c17385d12d21",
      force_web_search: false,
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error(
        error.message || "An error occurred while processing your message"
      );
    },
    onFinish: (message) => {
      // Handle successful message completion if needed
      console.log('Message completed:', message);
    },
    onResponse: (response) => {
      // Handle response if needed
      if (!response.ok) {
        console.error('API Response error:', response.statusText);
      }
    }
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-col min-w-0 h-[calc(100dvh-52px)] bg-background">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
      >
        {/* {messages.length === 0 && <Overview />}  */}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
          />
        ))}

        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}