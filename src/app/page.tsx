'use client';

import { ChatHeader } from '@/components/ChatHeader';
import { ChatInput } from '@/components/ChatInput';
import { MessageList } from '@/components/MessageList';
import { useState } from 'react';
import { useChatMessages } from '@/hooks/useChatMessages';
import { Trash2 } from 'lucide-react';


export default function Home() {
  const {
    messages,
      sessions,
  currentSessionId,
  setCurrentSessionId,
  deleteSession,
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
 <div className="relative z-10 flex flex-col h-dvh">
      {/* 右チャットエリア */}
      <div className="flex flex-col flex-1 min-h-0">
        <ChatHeader
  onStartNewChat={startNewChat}
  onClearHistory={clearHistory}
  onToggleHistory={() =>
    setIsHistoryOpen(!isHistoryOpen)
  }
/>

       <div className="flex-1 min-h-0 overflow-y-auto pb-20 sm:pb-24">
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

    {isHistoryOpen && (
  <>
    {/* 背景 */}
    <div
      className="fixed inset-0 bg-black/30 z-40"
      onClick={() => setIsHistoryOpen(false)}
    />

    {/* 履歴パネル */}
    <div className="
      fixed
      top-0
      right-0
      h-full
      w-[85vw] max-w-80
      bg-white
      shadow-2xl
      z-50
      p-4
      overflow-y-auto
    ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          会話履歴
        </h2>

        <button
          onClick={() => setIsHistoryOpen(false)}
          className="text-xl"
        >
          ✕
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-slate-500 text-sm">
          会話履歴はありません
        </p>
      ) : (
        sessions.map((session) => (
          <div
  key={session.id}
  className={`
    flex
    items-center
    gap-2
    mb-2
    rounded-xl
    ${
      currentSessionId === session.id
        ? 'bg-[#12A182] text-white'
        : 'hover:bg-slate-100'
    }
  `}
>
  <button
    onClick={() => {
      setCurrentSessionId(session.id);
      setIsHistoryOpen(false);
    }}
    className="
      flex-1
      text-left
      p-3
      truncate
    "
  >
    {session.title}
  </button>

  <button
  onClick={(e) => {
    e.stopPropagation();

    if (
      window.confirm(
        'この会話を削除しますか？'
      )
    ) {
      deleteSession(session.id);
    }
  }}
  className="
    p-3
    text-red-500
    hover:text-red-700
    transition
  "
>
  <Trash2 size={18} />
</button>
</div>
        ))
      )}
    </div>
  </>
)}

  </div>
)}