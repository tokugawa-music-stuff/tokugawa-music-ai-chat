'use client';

import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/types/chat';

const CHAT_HISTORY_KEY = 'tokugawa-chat-history';

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
  const [messages, setMessages] = useState<Message[]>(loadSavedMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startNewChat = () => {
    setMessages([]);
  };

  const clearHistory = () => {
    const result = window.confirm('保存されている会話履歴を削除しますか？');

    if (result) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setMessages([]);
    }
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
      console.log('API Response:', data);

      if (data.reply) {
        const replyText =
          typeof data.reply === 'string'
            ? data.reply
            : data.reply.text || data.reply.answer || JSON.stringify(data.reply);

        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: replyText,
          },
        ]);
      } else {
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });

    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages, isLoading]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    startNewChat,
    clearHistory,
    handleSend,
  };
};
