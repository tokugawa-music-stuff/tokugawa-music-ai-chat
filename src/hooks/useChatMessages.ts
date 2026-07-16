'use client';

import { useEffect, useRef, useState } from 'react';
import type { Message, ChatSession } from '@/types/chat';

const CHAT_HISTORY_KEY = 'tokugawa-chat-history';
const CHAT_SESSIONS_KEY = 'tokugawa-chat-sessions';
const CURRENT_SESSION_KEY = 'tokugawa-current-session';
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


const loadSavedSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];

  const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);

  if (!savedSessions) return [];

  try {
    return JSON.parse(savedSessions);
  } catch {
    return [];
  }
};

const loadSavedCurrentSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  return localStorage.getItem(CURRENT_SESSION_KEY) || '';
};



export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const currentSession = sessions.find(
  (session) => session.id === currentSessionId
);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState('');
  const [canRetryMessage, setCanRetryMessage] = useState(false);
  const [lastErrorIndex, setLastErrorIndex] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
 const hasLoadedHistoryRef = useRef(false);
　const hasLoadedSessionsRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewChat = () => {
  const newSession: ChatSession = {
    id: crypto.randomUUID(),
    title: '新しい会話',
    createdAt: new Date().toISOString(),
    messages: [],
  };

  setSessions((prev) => [newSession, ...prev]);
  setCurrentSessionId(newSession.id);

  // 画面の表示も空にする
  setMessages([]);

  // 入力欄も空にする
  setInput('');

  // 状態リセット
  setLastSentMessage('');
  setCanRetryMessage(false);
  setLastErrorIndex(null);
};

  const clearHistory = () => {
    const result = window.confirm('保存されている会話履歴を削除しますか？');

    if (result) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(CHAT_SESSIONS_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);

      setMessages([]);
      setSessions([]);
      setCurrentSessionId('');
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

let sessionId = currentSessionId;

if (!sessionId) {
  const newSession: ChatSession = {
    id: crypto.randomUUID(),
    title: '新しい会話',
    createdAt: new Date().toISOString(),
    messages: [],
  };

  sessionId = newSession.id;

  setCurrentSessionId(sessionId);
}

    const userText = messageToSend;
     setInput('');
     setLastSentMessage(userText);
     setCanRetryMessage(false);
     setCooldownSeconds(SEND_COOLDOWN_SECONDS);

if (!isRetry) {
  const userMessage: Message = {
    role: 'user',
    text: userText,
  };

  setSessions((prev) => {
  const exists = prev.some(
    (session) => session.id === sessionId
  );

  if (!exists) {
    return [
      {
        id: sessionId,
        title: `${userText.slice(0, 25)}${
          userText.length > 25 ? '...' : ''
        }`,
        createdAt: new Date().toISOString(),
        messages: [userMessage],
      },
      ...prev,
    ];
  }

  return prev.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          title:
            session.title === '新しい会話'
              ? `${userText.slice(0, 25)}${
                  userText.length > 25 ? '...' : ''
                }`
              : session.title,
          messages: [
            ...session.messages,
            userMessage,
          ],
        }
      : session
  );
});
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

     const botMessage: Message = {
  role: 'bot',
  text: replyText,
  question: userText,
  feedbackEnabled: true,
};

setMessages((prev) => [...prev, botMessage]);

setSessions((prev) =>
  prev.map((session) =>
    session.id === sessionId
      ? {
          ...session,
          messages: [...session.messages, botMessage],
        }
      : session
  )
);

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
    const savedSessions = loadSavedSessions();

    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }

    if (savedSessions.length > 0) {
  setSessions(savedSessions);

  const savedCurrentSessionId = loadSavedCurrentSessionId();

  if (
    savedCurrentSessionId &&
    savedSessions.some(
      (session) => session.id === savedCurrentSessionId
    )
  ) {
    setCurrentSessionId(savedCurrentSessionId);
  } else {
    setCurrentSessionId(savedSessions[0].id);
  }
}

hasLoadedHistoryRef.current = true;
hasLoadedSessionsRef.current = true;

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
  if (!hasLoadedSessionsRef.current) return;

  localStorage.setItem(
    CHAT_SESSIONS_KEY,
    JSON.stringify(sessions)
  );
}, [sessions]);

useEffect(() => {
  if (!currentSessionId) return;

  localStorage.setItem(
    CURRENT_SESSION_KEY,
    currentSessionId
  );
}, [currentSessionId]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timerId = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [cooldownSeconds]);

  const displayMessages =
  currentSession?.messages ?? messages;

  const deleteSession = (
  sessionId: string
) => {
  const updatedSessions = sessions.filter(
    (session) => session.id !== sessionId
  );

  setSessions(updatedSessions);

  // 削除した会話を開いていた場合
  if (currentSessionId === sessionId) {
    if (updatedSessions.length > 0) {
      setCurrentSessionId(
        updatedSessions[0].id
      );
    } else {
      setCurrentSessionId('');
      setMessages([]);
    }
  }
};

 return {
  messages: displayMessages,
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
  canRetry: canRetryMessage && !isLoading,
}}
