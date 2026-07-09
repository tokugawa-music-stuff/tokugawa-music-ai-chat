'use client';

import { useEffect, useRef } from 'react';
import { SendHorizontal } from 'lucide-react';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
};

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSend,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="sticky bottom-0 bg-[#12A182] px-3 py-4 sm:px-5">
      <div className="max-w-5xl mx-auto">
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
              resize-none
              max-h-40
            "
          />

          <button
            onClick={onSend}
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
  );
}
