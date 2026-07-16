export type Message = {
  role: 'user' | 'bot';
  text: string;
  question?: string;
  feedbackEnabled?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
};