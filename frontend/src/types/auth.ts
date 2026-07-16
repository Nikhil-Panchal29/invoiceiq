export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}

export interface MeResponse {
  success: boolean;
  data: User;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}
