export type AnswerLetter = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  module: string;
  question: string;
  options: [string, string, string, string];
  correct_answer: AnswerLetter;
  description: string;
}
