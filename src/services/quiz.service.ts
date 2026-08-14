import api from './api';
import { 
  Quiz, 
  GenerateQuizPayload, 
  StartAttemptResponse, 
  AnswerData,
  SubmitAttemptResponse
} from '../types/quiz';

export const quizService = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/quiz/');
    return response.data;
  },

  getQuiz: async (id: number): Promise<Quiz> => {
    const response = await api.get(`/quiz/${id}/`);
    return response.data;
  },

  generateQuiz: async (payload: GenerateQuizPayload): Promise<Quiz> => {
    const response = await api.post('/quiz/generate/', payload);
    return response.data;
  },

  startAttempt: async (quizId: number): Promise<StartAttemptResponse> => {
    const response = await api.post(`/quiz/${quizId}/start-attempt/`);
    return response.data;
  },

  saveAnswer: async (quizId: number, data: AnswerData): Promise<void> => {
    await api.post(`/quiz/${quizId}/save-answer/`, data);
  },

  submitAttempt: async (quizId: number, answers?: AnswerData[]): Promise<SubmitAttemptResponse> => {
    const payload = answers ? { answers } : {};
    const response = await api.post(`/quiz/${quizId}/submit/`, payload);
    return response.data;
  }
};
