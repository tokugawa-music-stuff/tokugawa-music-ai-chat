import type { RefObject } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { EmptyChatState } from '@/components/EmptyChatState';
import { LoadingMessage } from '@/components/LoadingMessage';
import type { Message } from '@/types/chat';

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onSelectQuestion: (question: string) => void;
};

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  onSelectQuestion,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto scroll-smooth px-3 py-4 sm:px-6 md:px-8 space-y-4 max-w-5xl w-full mx-auto">
      {messages.length === 0 && (
        <EmptyChatState onSelectQuestion={onSelectQuestion} />
      )}

      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}

      {isLoading && <LoadingMessage />}

      <div ref={messagesEndRef} />
    </div>
  );
}
