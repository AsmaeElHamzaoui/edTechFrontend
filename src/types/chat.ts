export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  document: number | null;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface Source {
  source?: number;
  page?: number;
  chunk_index?: number;
  document_title?: string;
  distance?: number;
}

export interface FollowUpAction {
  action: string;
  label: string;
}
