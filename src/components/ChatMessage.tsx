import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/types/chat';

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
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
        className={`max-w-[90%] sm:max-w-[82%] md:max-w-[72%] rounded-2xl px-4 py-3 shadow-sm text-[15px] font-medium leading-6 whitespace-pre-wrap ${
          message.role === 'user'
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white border border-slate-200 rounded-tl-none'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-1">{children}</p>,
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
      </div>
    </div>
  );
}
