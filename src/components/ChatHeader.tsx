import { Plus, Trash2, History } from 'lucide-react';

type ChatHeaderProps = {
  onStartNewChat: () => void;
  onClearHistory: () => void;
  onToggleHistory: () => void;
};

export function ChatHeader({
  onStartNewChat,
  onClearHistory,
  onToggleHistory,
}: ChatHeaderProps) {
  return (
    <header className="bg-[#12A182] text-white px-5 py-5 shadow-sm flex items-center justify-between min-h-[100px]">
      <h1 className="m-0 text-lg sm:text-xl md:text-2xl font-bold tracking-wide leading-none">
        徳川ミュージックアカデミー
      </h1>

      <div className="flex gap-2">
  <button
    onClick={onStartNewChat}
    className="
      flex items-center gap-1
      bg-white/20
      hover:bg-white/30
      transition
      rounded-full
      px-3 py-2
      text-sm font-semibold
    "
  >
    <Plus size={18} strokeWidth={2.5} />
    <span className="hidden sm:inline">新しい会話</span>
  </button>

  <button
    onClick={onToggleHistory}
    className="
      flex items-center gap-1
      bg-white/20
      hover:bg-white/30
      transition
      rounded-full
      px-3 py-2
      text-sm font-semibold
    "
  >
    <History size={18} strokeWidth={2.5} />
    <span className="hidden sm:inline">履歴</span>
  </button>

  <button
    onClick={onClearHistory}
    className="
      flex items-center gap-1
      bg-white/20
      hover:bg-red-500/80
      transition
      rounded-full
      px-3 py-2
      text-sm font-semibold
    "
  >
    <Trash2 size={18} strokeWidth={2.5} />
    <span className="hidden sm:inline">削除</span>
  </button>
</div>
    </header>
  );
}