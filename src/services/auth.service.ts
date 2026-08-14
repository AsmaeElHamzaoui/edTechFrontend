import api from './api';
import { User, AuthResponse } from '../types/user';

export const authService = {
  async register(data: any): Promise<User> {
    const response = await api.post<User>('/auth/register/', data);
    return response.data;
  },

  async login(credentials: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    return response.data;
  },
};
