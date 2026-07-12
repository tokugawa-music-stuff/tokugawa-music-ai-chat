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
  <div className="relative flex flex-col min-h-dvh bg-[#FFFBBA] text-slate-800 overflow-hidden">

   {/* 背景キャラクター */}
<div className="absolute inset-0 pointer-events-none select-none z-0">
  <img
    src="/mascot.png"
    alt=""
    className="
      absolute
      top-[70%]
      left-[48%]
      -translate-x-1/2
      -translate-y-1/2
      w-[70vw]
      max-w-[700px]
      opacity-[1]
    "
  />
</div>

    {/* チャット本体 */}
    <div className="relative z-10 flex flex-col h-dvh">
      <ChatHeader
        onStartNewChat={startNewChat}
        onClearHistory={clearHistory}
      />

    <div className="flex-1 overflow-y-auto pb-20 sm:pb-24">
  <MessageList
    messages={messages}
    isLoading={isLoading}
    messagesEndRef={messagesEndRef}
    onSelectQuestion={(question) => handleSend(question)}
  />
</div>

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
  </div>
)}