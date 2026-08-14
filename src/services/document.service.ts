import api from './api';
import { Document } from '../types/document';

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>('/documents/');
    return response.data;
  },

  async uploadDocument(title: string, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    const response = await api.post<Document>('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  async renameDocument(id: number, newTitle: string): Promise<Document> {
    const response = await api.patch<Document>(`/documents/${id}/`, { title: newTitle });
    return response.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/documents/${id}/`);
  },

  async getSummary(id: number, type: 'summary' | 'study_sheet' = 'summary'): Promise<{ content: string }> {
    const response = await api.post(`/documents/${id}/summary/`, { type });
    return response.data;
  }
};
