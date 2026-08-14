import api from './api';
import { Conversation } from '../types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get<Conversation[]>('/chat/conversations/');
    return res.data;
  },

  async getConversation(id: number): Promise<Conversation> {
    const res = await api.get<Conversation>(`/chat/conversations/${id}/`);
    return res.data;
  },

  async createConversation(data: { title: string, document?: number }): Promise<Conversation> {
    const res = await api.post<Conversation>('/chat/conversations/', data);
    return res.data;
  },
  
  streamMessage(
    conversationId: number, 
    question: string,
    complexity: string,
    onMessage: (token: string) => void,
    onSources: (sources: any[]) => void,
    onFollowUp: (actions: any[]) => void,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    const token = localStorage.getItem('access_token');
    const controller = new AbortController();

    fetchEventSource(`${baseURL}/chat/conversations/${conversationId}/stream/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, complexity }),
      signal: controller.signal,
      async onopen(response: Response) {
        if (response.ok) return;
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const err = await response.json();
          throw new Error(err.detail || 'Erreur client');
        }
        throw new Error('Erreur de connexion');
      },
      onmessage(msg: any) {
        if (msg.event === 'error') {
          try {
            const errData = JSON.parse(msg.data);
            throw new Error(errData.detail || 'Erreur SSE interne');
          } catch (e: any) {
            throw new Error(e.message || msg.data);
          }
        } else if (msg.event === 'sources') {
          try { onSources(JSON.parse(msg.data)); } catch (e) {}
        } else if (msg.event === 'follow_up') {
          try { onFollowUp(JSON.parse(msg.data)); } catch (e) {}
        } else if (msg.event === 'done') {
          onDone();
          controller.abort();
        } else {
          if (msg.data) {
            try {
              const data = JSON.parse(msg.data);
              if (data.token) onMessage(data.token);
            } catch (e) {}
          }
        }
      },
      onclose() {
        throw new Error('Connection closed by server');
      },
      onerror(err: any) {
        onError(err);
        controller.abort();
        throw err;
      }
    });

    return () => controller.abort();
  }
};
