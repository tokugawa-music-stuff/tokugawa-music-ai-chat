import Image from 'next/image';

export function LoadingMessage() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-16 h-16 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="徳川ミュージックアカデミー"
          width={64}
          height={64}
          className="w-full h-full object-contain scale-110"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-slate-500 text-sm flex items-center gap-2">
        <span className="animate-bounce">●</span>
        <span className="animate-bounce [animation-delay:0.2s]">●</span>
        <span className="animate-bounce [animation-delay:0.4s]">●</span>
        <span className="ml-2 text-xs">少々お待ちください...</span>
      </div>
    </div>
  );
}
