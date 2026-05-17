import client from './client';
import { ApiResponse, AuthTokens, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<ApiResponse<AuthData>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    client.post<ApiResponse<AuthData>>('/auth/register', payload),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  getMe: () => client.get<ApiResponse<User>>('/auth/me'),
};
