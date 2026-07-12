import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/types/chat';

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

    const sendFeedback = async (type: 'good' | 'bad') => {
  try {
    setFeedbackError(false);

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: message.question ?? '',
        answer: message.text,
        feedback: type,
      }),
    });

    if (!res.ok) {
      throw new Error(`送信失敗: ${res.status}`);
    }

    // 送信成功した時だけ固定
    setFeedback(type);
    setFeedbackSent(true);

    console.log('Feedback送信成功');

  } catch (error) {
    console.error('Feedback送信エラー:', error);
    setFeedbackError(true);
  }
};
  
  return (
    <div
      className={`flex items-end gap-2 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'bot' && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="徳川ミュージックアカデミー"
            width={64}
            height={64}
            className="w-full h-full object-contain scale-110"
          />
        </div>
      )}

      <div
        className={`max-w-[90%] sm:max-w-[82%] md:max-w-[72%] rounded-2xl px-4 py-2 shadow-sm text-[14px] sm:text-[15px] font-medium leading-[1.4] sm:leading-5 whitespace-pre-wrap ${
          message.role === 'user'
            ? 'bg-white text-black border border-slate-200 rounded-tr-none'
            : 'bg-white border border-slate-200 rounded-tl-none'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-0">{children}</p>,
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
          }}
        >
          {message.text}
        </ReactMarkdown>
        {/* AI回答のみ評価ボタン表示 */}
{message.role === 'bot' && message.feedbackEnabled && (
  <div className="mt-3">
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => {
  if (!feedbackSent) {
    sendFeedback('good');
  }
}}
        disabled={feedbackSent}
        className={`
          px-3 py-1.5
          rounded-full
          text-xs sm:text-sm
          transition
          ${
            feedback === 'good'
              ? 'bg-[#12A182] text-white border border-[#12A182]'
              : 'bg-white border border-slate-300 hover:bg-slate-100'
          }
          ${feedback !== null ? 'cursor-default opacity-80' : ''}
        `}
      >
        👍 役に立った
      </button>

      <button
        onClick={() => {
  if (!feedbackSent) {
    sendFeedback('bad');
  }
}}
        disabled={feedbackSent}
        className={`
          px-3 py-1.5
          rounded-full
          text-xs sm:text-sm
          transition
          ${
            feedback === 'bad'
              ? 'bg-red-500 text-white border border-red-500'
              : 'bg-white border border-slate-300 hover:bg-slate-100'
          }
          ${feedback !== null ? 'cursor-default opacity-80' : ''}
        `}
      >
        👎 解決しなかった
      </button>
    </div>

    {feedback && (
      <p className="mt-2 text-xs text-slate-500">
        ✓ ご回答ありがとうございました！
      </p>
    )}
    {feedbackError && (
  <p className="mt-2 text-xs text-red-500">
    ⚠ 送信できませんでした。もう一度お試しください。
  </p>
)}
  </div>
)}
      </div>
    </div>
  );
}