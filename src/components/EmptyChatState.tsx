const faqQuestions = [
  '振替レッスンについて教えてください',
  'クラス変更について教えてください',
  '休会・退会について教えてください',
];

type EmptyChatStateProps = {
  onSelectQuestion: (question: string) => void;
};

export function EmptyChatState({ onSelectQuestion }: EmptyChatStateProps) {
  return (
    <div className="text-center pt-12 text-[#333333]">
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#333333]">
        こんにちは♪<br />
        徳川ミュージックアカデミーです。
      </p>

      <p className="mt-4 text-base sm:text-lg text-[#333333] font-medium">
        レッスンや教室に関するご質問をお気軽にどうぞ😊
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        {faqQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelectQuestion(question)}
            className="w-full max-w-sm rounded-full border border-[#12A182] bg-white px-5 py-3 text-sm sm:text-base font-semibold text-[#111111] shadow-sm transition hover:bg-[#e9fff8] hover:shadow-md"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
