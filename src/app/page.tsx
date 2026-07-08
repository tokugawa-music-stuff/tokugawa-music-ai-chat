'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  const savedMessages = localStorage.getItem('tokugawa-chat-history');

  if (savedMessages) {
    setMessages(JSON.parse(savedMessages));
  }
}, []);


// ↓ここに追加

// 新しい会話を開始
const startNewChat = () => {
  setMessages([]);
};

// 履歴を削除
const clearHistory = () => {
  const result = window.confirm(
    '保存されている会話履歴を削除しますか？'
  );

  if (result) {
    localStorage.removeItem('tokugawa-chat-history');
    setMessages([]);
  }
};

  // 一番下へスクロールするためのref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: 'smooth',
  });

  localStorage.setItem(
    'tokugawa-chat-history',
    JSON.stringify(messages)
  );
}, [messages, isLoading]);



  // URLをリンク化
 const renderMessageText = (text: string, isUser: boolean) => {
  // 改行をすべて1行に統一
  const cleanedText = text.replace(/\n+/g, '\n').trim();

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return cleanedText.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-medium hover:opacity-80 transition-opacity ${
            isUser ? 'text-indigo-200' : 'text-[#12A182]'
          }`}
        >
          {part}
        </a>
      );
    }

    return part;
  });
};

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      console.log(data);

     if (data.reply) {

  const replyText =
    typeof data.reply === 'string'
      ? data.reply
      : data.reply.text || data.reply.answer || JSON.stringify(data.reply);

  setMessages((prev) => [
    ...prev,
    {
      role: 'bot',
      text: replyText
    }
  ]);

}else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: '返答の取得に失敗しました。' },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'サーバーとの通信でエラーが発生しました。' },
      ])
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-[#FFFBBA] text-slate-800">

      {/* ヘッダー */}
      <header className="bg-[#12A182] text-white px-4 py-3 shadow-sm flex items-center justify-between">

  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
    徳川ミュージックアカデミー
  </h1>

  <div className="flex gap-3 text-sm">

    <button
      onClick={startNewChat}
      className="hover:opacity-80"
    >
      ✨新しい会話
    </button>

    <button
      onClick={clearHistory}
      className="hover:opacity-80"
    >
      🗑削除
    </button>

  </div>

</header>

      {/* チャット履歴 */}
      <div className="flex-1 overflow-y-auto scroll-smooth px-3 py-4 sm:px-6 md:px-8 space-y-4 max-w-5xl w-full mx-auto">

        {messages.length === 0 && (
  <div className="text-center pt-12 text-[#333333]">
    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#333333]">
      こんにちは♪<br />
      徳川ミュージックアカデミーです。
    </p>

    <p className="mt-4 text-base sm:text-lg text-[#333333] font-medium">
      レッスンや教室に関するご質問をお気軽にどうぞ😊
    </p>
  </div>
)}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.role === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {msg.role === 'bot' && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="徳川ミュージックアカデミー"
                  className="w-full h-full object-contain scale-110"
                />
              </div>
            )}

   <div
  className={`max-w-[90%] sm:max-w-[82%] md:max-w-[72%] rounded-2xl px-4 py-3 shadow-sm text-[15px] font-medium leading-8 whitespace-pre-wrap ${
    msg.role === 'user'
      ? 'bg-indigo-600 text-white rounded-tr-none'
      : 'bg-white border border-slate-200 rounded-tl-none'
  }`}
>
             <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="
          text-[#12A182]
          underline
          font-semibold
          hover:text-[#0e8269]
          transition-colors
        "
      >
        {children}
      </a>
    ),

    p: ({ children }) => {
      const text = String(children);

      const urlRegex = /(https?:\/\/[^\s]+)/g;

      const parts = text.split(urlRegex);

      return (
        <p>
          {parts.map((part, i) =>
            urlRegex.test(part) ? (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#12A182] underline font-semibold hover:text-[#0e8269]"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>
      );
    },
  }}
>
  {msg.text}
</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2">

            <div className="w-16 h-16 flex-shrink-0">
              <img
                src="/logo.png"
                alt="徳川ミュージックアカデミー"
                className="w-full h-full object-contain scale-110"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-slate-500 text-sm flex items-center gap-2">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.2s]">●</span>
              <span className="animate-bounce [animation-delay:0.4s]">●</span>
              <span className="ml-2 text-xs">
                少々お待ちください...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* 入力欄 */}
      <div className="bg-[#12A182] px-3 py-4 sm:px-5">

        <div className="max-w-5xl mx-auto">

  <div className="flex items-center bg-white border-2 border-black rounded-full shadow-lg px-3 py-2">

     <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder={
          isLoading
            ? '回答を待っています...'
            : '徳川ミュージックアカデミーについて質問する...'
        }
        disabled={isLoading}
        className="
          flex-1
          bg-transparent
          outline-none
          px-4
          py-2
          text-sm
          sm:text-base
          text-slate-800
          placeholder:text-slate-400
          disabled:opacity-50
        "
      />


      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="
          w-10 h-10
          sm:w-12 sm:h-12
          rounded-full
          bg-[#FF3E3E]
          hover:bg-[#e73333]
          disabled:bg-[#ffb3b3]
          disabled:cursor-not-allowed
          transition-all
          duration-200
          flex
          items-center
          justify-center
          shadow-md
          hover:scale-105
          flex-shrink-0
        "
      >
      <SendHorizontal
        size={20}
        strokeWidth={2.5}
        className="text-white -rotate-45"
      />
    </button>

  </div>

</div>

      </div>

    </div>
  );
}