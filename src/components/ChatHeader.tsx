type ChatHeaderProps = {
  onStartNewChat: () => void;
  onClearHistory: () => void;
};

export function ChatHeader({
  onStartNewChat,
  onClearHistory,
}: ChatHeaderProps) {
  return (
    <header className="bg-[#12A182] text-white px-4 py-3 shadow-sm flex items-end justify-between">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
        徳川ミュージックアカデミー
      </h1>

      <div className="flex gap-3 text-sm">
        <button onClick={onStartNewChat} className="hover:opacity-80">
          ✨新しい会話
        </button>

        <button onClick={onClearHistory} className="hover:opacity-80">
          🗑削除
        </button>
      </div>
    </header>
  );
}
