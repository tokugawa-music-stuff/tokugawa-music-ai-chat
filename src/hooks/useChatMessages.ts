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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistoryRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewChat = () => {
    setMessages([]);
    setLastSentMessage('');
  };

  const clearHistory = () => {
    const result = window.confirm('保存されている会話履歴を削除しますか？');

    if (result) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setMessages([]);
      setLastSentMessage('');
    }
  };

  const handleSend = async (presetMessage?: string) => {
    const messageToSend = presetMessage ?? input;

    if (!messageToSend.trim() || isLoading || cooldownSeconds > 0) return;

    const userText = messageToSend;
    setInput('');
    setLastSentMessage(userText);
    setCooldownSeconds(SEND_COOLDOWN_SECONDS);

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
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
          {
            role: 'bot',
            text: '大変申し訳ありません。時間をおいて再度お試しいただくか、スクールチャットまたはお電話でお問い合わせください。',
          },
        ]);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: '送信をキャンセルしました。' },
        ]);
        return;
      }

      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '大変申し訳ありません。時間をおいて再度お試しいただくか、スクールチャットまたはお電話でお問い合わせください。',
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const cancelSend = () => {
    abortControllerRef.current?.abort();
  };

  const retryLastMessage = () => {
    if (!lastSentMessage || isLoading || cooldownSeconds > 0) return;

    void handleSend(lastSentMessage);
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

    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
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
    canRetry: Boolean(lastSentMessage) && !isLoading && cooldownSeconds === 0,
  };
};
