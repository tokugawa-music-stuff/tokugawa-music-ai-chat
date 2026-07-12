export type Message = {
  role: 'user' | 'bot';
  text: string;
  question?: string;
  feedbackEnabled?: boolean;
};