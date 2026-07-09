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
    cooldownSeconds,
    messagesEndRef,
    startNewChat,
    clearHistory,
    handleSend,
    cancelSend,
    retryLastMessage,
    canRetry,
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
        onSelectQuestion={handleSend}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        cooldownSeconds={cooldownSeconds}
        canRetry={canRetry}
        onInputChange={setInput}
        onSend={handleSend}
        onCancel={cancelSend}
        onRetry={retryLastMessage}
      />
    </div>
  );
}
