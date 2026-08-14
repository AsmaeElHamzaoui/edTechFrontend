export interface Choice {
  id: number;
  choice_text: string;
}

export interface Question {
  id: number;
  question_type: 'MCQ' | 'BOOLEAN' | 'OPEN';
  question_text: string;
  chunk_index?: number;
  choices: Choice[];
}

export interface Quiz {
  id: number;
  document: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questions: Question[];
  created_at: string;
}

export interface AnswerData {
  question_id: number;
  selected_choice_id?: number | null;
  open_answer_text?: string;
}

export interface QuizAttempt {
  id: number;
  quiz: number;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  score: number;
  created_at: string;
  submitted_at: string | null;
}

export interface StartAttemptResponse {
  attempt: QuizAttempt;
  saved_answers: AnswerData[];
}

export interface CorrectionResult {
  question_id: number;
  is_correct: boolean;
  explanation: string;
  ai_correction: string;
  expected_answer: string;
}

export interface SubmitAttemptResponse {
  attempt_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  results: CorrectionResult[];
}

export interface GenerateQuizPayload {
  document_id: number;
  title: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  num_questions?: number;
  question_types?: string[];
}
