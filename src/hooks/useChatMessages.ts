'use client';

import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/types/chat';

const CHAT_HISTORY_KEY = 'tokugawa-chat-history';
const SEND_COOLDOWN_SECONDS = 5;

const loadSavedMessages = (): Message[] => {
  if (typeof window === 'undefined') return [];

  const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
  if (!savedMessages) return [];

  try {
    return JSON.parse(savedMessages);
  } catch {
    return [];
  }
};

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState('');
  const [canRetryMessage, setCanRetryMessage] = useState(false);
  const [lastErrorIndex, setLastErrorIndex] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistoryRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewChat = () => {
    setMessages([]);
    setLastSentMessage('');
    setCanRetryMessage(false);
  setLastErrorIndex(null);

  };

  const clearHistory = () => {
    const result = window.confirm('保存されている会話履歴を削除しますか？');

    if (result) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setMessages([]);
      setLastSentMessage('');
      setCanRetryMessage(false);
      setLastErrorIndex(null);
    }
  };

  const handleSend = async (
  presetMessage?: string,
  isRetry = false
) => {

  const messageToSend =
    typeof presetMessage === 'string'
      ? presetMessage
      : input;

   if (
    typeof messageToSend !== 'string' ||
    !messageToSend.trim() ||
    isLoading ||
    (!isRetry && cooldownSeconds > 0)
) {
  return;
}

    const userText = messageToSend;
     setInput('');
     setLastSentMessage(userText);
     setCanRetryMessage(false);
     setCooldownSeconds(SEND_COOLDOWN_SECONDS);

    if (!isRetry) {
  setMessages((prev) => [
    ...prev,
    { role: 'user', text: userText },
  ]);
}
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
  throw new Error(`API Error: ${response.status}`);
}

      const data = await response.json();
      console.log('API Response:', data);

     if (data.success === true && data.reply) {
        setCanRetryMessage(false);

        const replyText =
          typeof data.reply === 'string'
            ? data.reply
            : data.reply.text || data.reply.answer || JSON.stringify(data.reply);

       setMessages((prev) => [
  　　　　...prev,
     {
      role: 'bot',
      text: replyText,
      question: userText,
      feedbackEnabled: true,
     },
    ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: 
             data.reply ||
             '大変申し訳ありません。時間をおいて再度お試しいただくか、スクールチャットまたはお電話でお問い合わせください。',
            feedbackEnabled: false,
          },
        ]);
      }
    } catch (error) {
     if (error instanceof DOMException && error.name === 'AbortError') {
  setCanRetryMessage(false);

  setMessages((prev) => [
    ...prev,
    {
      role: 'bot',
      text: '送信をキャンセルしました。',
      feedbackEnabled: false,
    },
  ]);

  return;
}



      console.error(error);
       setCanRetryMessage(true);

   setMessages((prev) => {
  const newMessages = [
    ...prev,
    {
      role: 'bot' as const,
      text: '回答の取得に失敗しました。再送信をお試しください。',
      feedbackEnabled: false,
    },
  ];

  setLastErrorIndex(newMessages.length - 1);

  return newMessages;
});
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const cancelSend = () => {
    abortControllerRef.current?.abort();
  };

  const retryLastMessage = () => {
  if (!lastSentMessage || isLoading) return;

  if (lastErrorIndex !== null) {
    setMessages((prev) =>
      prev.filter((_, index) => index !== lastErrorIndex)
    );

    setLastErrorIndex(null);
  }

  void handleSend(lastSentMessage, true);
};
  useEffect(() => {
    queueMicrotask(() => {
      const savedMessages = loadSavedMessages();

      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }

      hasLoadedHistoryRef.current = true;
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });

    if (!hasLoadedHistoryRef.current) return;
　   const history = messages.slice(-100);

　　　localStorage.setItem(
     CHAT_HISTORY_KEY,
     JSON.stringify(history)
);

  }, [messages, isLoading]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timerId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [cooldownSeconds]);

  return {
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
    canRetry: canRetryMessage && !isLoading,
  };
};
