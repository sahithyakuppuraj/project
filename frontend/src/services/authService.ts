import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', data);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', data);
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    return api.get<{ success: boolean; data: User }>('/auth/me');
  },

  async updateProfile(data: { name?: string; currency?: string }): Promise<{ success: boolean; data: User }> {
    return api.put<{ success: boolean; data: User }>('/auth/profile', data);
  },

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>('/auth/password', data);
  },
};

