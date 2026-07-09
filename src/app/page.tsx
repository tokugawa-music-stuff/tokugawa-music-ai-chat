'use client';

import { ChatHeader } from '@/components/ChatHeader';
import { ChatInput } from '@/components/ChatInput';
import { MessageList } from '@/components/MessageList';
import { useChatMessages } from '@/hooks/useChatMessages';

export default function Home() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    startNewChat,
    clearHistory,
    handleSend,
  } = useChatMessages();

  return (
    <div className="flex flex-col min-h-dvh bg-[#FFFBBA] text-slate-800">
      <ChatHeader
        onStartNewChat={startNewChat}
        onClearHistory={clearHistory}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={handleSend}
      />
    </div>
  );
}
