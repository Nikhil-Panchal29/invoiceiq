import api from './axios';

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: string[];
}

export const chatWithAssistant = async (question: string): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>('/assistant/chat', {
    question,
  });
  return data;
};
