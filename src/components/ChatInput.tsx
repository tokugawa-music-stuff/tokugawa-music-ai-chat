'use client';

import { useEffect, useRef } from 'react';
import { RotateCcw, SendHorizontal, X } from 'lucide-react';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  cooldownSeconds: number;
  canRetry: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  onRetry: () => void;
};

export function ChatInput({
  input,
  isLoading,
  cooldownSeconds,
  canRetry,
  onInputChange,
  onSend,
  onCancel,
  onRetry,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCoolingDown = cooldownSeconds > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="sticky bottom-0 bg-[#12A182] px-3 py-4 sm:px-5">
      <div className="max-w-5xl mx-auto">
        {canRetry && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] shadow-sm transition hover:bg-[#e9fff8]"
            >
              <RotateCcw size={14} />
              再送信
            </button>
          </div>
        )}

        <div className="flex items-end bg-white border-2 border-black rounded-3xl shadow-lg px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={
              isLoading
                ? '回答を待っています...'
                : isCoolingDown
                  ? `次の質問は${cooldownSeconds}秒後に送信できます`
                : '徳川ミュージックアカデミーについて質問する...'
            }
            disabled={isLoading || isCoolingDown}
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
              resize-none
              max-h-40
            "
          />

          {isLoading && (
            <button
              type="button"
              onClick={onCancel}
              className="
                mr-2
                w-10 h-10
                sm:w-12 sm:h-12
                rounded-full
                bg-slate-700
                hover:bg-slate-800
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
              <X size={20} strokeWidth={2.5} className="text-white" />
            </button>
          )}

          <button
            onClick={onSend}
            disabled={isLoading || isCoolingDown || !input.trim()}
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
            {isCoolingDown ? (
              <span className="text-sm font-bold text-white">
                {cooldownSeconds}
              </span>
            ) : (
              <SendHorizontal
                size={20}
                strokeWidth={2.5}
                className="text-white -rotate-45"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
