import api from './axios';
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload } from '@/types/auth';

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
};
